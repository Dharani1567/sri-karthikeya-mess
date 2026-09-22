import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/supply-logs - Filtered historical delivery logs
router.get('/', async (req, res) => {
  try {
    const { companyId, dateRange, search, mealTypeId, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (companyId && companyId !== 'all') {
      where.companyId = companyId as string;
    }

    if (search) {
      where.company = {
        name: { contains: search as string },
      };
    }

    if (dateRange) {
      const now = new Date();
      if (dateRange === 'Today') {
        const todayStr = now.toISOString().split('T')[0];
        where.deliveryDate = todayStr;
      } else if (dateRange === 'This Week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startStr = startOfWeek.toISOString().split('T')[0];
        where.deliveryDate = { gte: startStr };
      } else if (dateRange === 'This Month') {
        const monthPrefix = now.toISOString().substring(0, 7);
        where.deliveryDate = { startsWith: monthPrefix };
      }
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    const totalCount = await prisma.supplyLog.count({ where });
    const logs = await prisma.supplyLog.findMany({
      where,
      include: {
        company: true,
        items: {
          include: { mealType: true },
        },
      },
      orderBy: { deliveryDate: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    res.json({
      data: logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching supply logs:', error);
    res.status(500).json({ message: 'Error fetching supply logs' });
  }
});

// GET /api/supply-logs/today - Today's supply standings across all clients
router.get('/today-standings', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD or default mock date '2026-02-26'
    const targetDate = (req.query.date as string) || '2026-02-26';

    const companies = await prisma.company.findMany({
      where: { status: 'ACTIVE' },
    });

    const standings = [];

    for (const comp of companies) {
      const log = await prisma.supplyLog.findUnique({
        where: {
          companyId_deliveryDate: {
            companyId: comp.id,
            deliveryDate: targetDate,
          },
        },
        include: {
          items: {
            include: { mealType: true },
          },
        },
      });

      const itemMap: Record<string, number> = {};
      if (log && log.items) {
        log.items.forEach((it) => {
          itemMap[it.mealType.code] = it.quantity;
        });
      }

      standings.push({
        companyId: comp.id,
        companyName: comp.name,
        veg: itemMap['VEG'] || 0,
        chicken: itemMap['CHK'] || 0,
        special: itemMap['SPC'] || 0,
        mutton: itemMap['MUT'] || 0,
        fish: itemMap['FSH'] || 0,
        prawns: itemMap['PRW'] || 0,
        totalMeals: log ? log.totalQuantity : 0,
        totalBilling: log ? log.totalAmount : 0,
        status: log ? 'Delivered' : 'Pending',
      });
    }

    res.json({
      date: targetDate,
      allDispatched: standings.every((s) => s.status === 'Delivered'),
      standings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today standings' });
  }
});

// GET /api/supply-logs/single - Fetch log for specific company & date
router.get('/single', async (req, res) => {
  try {
    const { companyId, date } = req.query;
    if (!companyId || !date) {
      return res.status(400).json({ message: 'companyId and date are required' });
    }

    const log = await prisma.supplyLog.findUnique({
      where: {
        companyId_deliveryDate: {
          companyId: companyId as string,
          deliveryDate: date as string,
        },
      },
      include: {
        items: {
          include: { mealType: true },
        },
      },
    });

    res.json(log || null);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching single supply log' });
  }
});

// POST /api/supply-logs/single - Save/Submit single daily meal entry
router.post('/single', async (req, res) => {
  try {
    const { companyId, date, quantities, notes, status = 'SUBMITTED' } = req.body;

    if (!companyId || !date || !quantities) {
      return res.status(400).json({ message: 'companyId, date and quantities are required' });
    }

    // Fetch custom rates for this company
    const customRates = await prisma.companyMealRate.findMany({
      where: { companyId },
    });
    const customRateMap: Record<string, number> = {};
    customRates.forEach((cr) => {
      customRateMap[cr.mealTypeId] = cr.customPrice;
    });

    // Fetch active meal types
    const mealTypes = await prisma.mealType.findMany({
      where: { status: 'ACTIVE' },
    });

    let totalQty = 0;
    let totalAmt = 0;
    const itemsToCreate = [];

    for (const mt of mealTypes) {
      const qty = Number(quantities[mt.id] || quantities[mt.code] || 0);
      if (qty > 0) {
        const unitPrice = customRateMap[mt.id] ?? mt.defaultPrice;
        const lineTotal = qty * unitPrice;
        totalQty += qty;
        totalAmt += lineTotal;
        itemsToCreate.push({
          mealTypeId: mt.id,
          quantity: qty,
          unitPrice,
          totalAmount: lineTotal,
        });
      }
    }

    // Upsert SupplyLog
    const existing = await prisma.supplyLog.findUnique({
      where: {
        companyId_deliveryDate: {
          companyId,
          deliveryDate: date,
        },
      },
    });

    if (existing) {
      // Delete old items and recreate
      await prisma.supplyItem.deleteMany({ where: { supplyLogId: existing.id } });
      const updated = await prisma.supplyLog.update({
        where: { id: existing.id },
        data: {
          status,
          totalQuantity: totalQty,
          totalAmount: totalAmt,
          notes,
          items: { create: itemsToCreate },
        },
        include: { items: { include: { mealType: true } } },
      });
      return res.json(updated);
    } else {
      const created = await prisma.supplyLog.create({
        data: {
          companyId,
          deliveryDate: date,
          status,
          totalQuantity: totalQty,
          totalAmount: totalAmt,
          notes,
          items: { create: itemsToCreate },
        },
        include: { items: { include: { mealType: true } } },
      });
      return res.status(201).json(created);
    }
  } catch (error) {
    console.error('Error saving supply log:', error);
    res.status(500).json({ message: 'Error saving daily supply log' });
  }
});

// POST /api/supply-logs/bulk - Spreadsheet-style bulk back-date entry
router.post('/bulk', async (req, res) => {
  try {
    const { companyId, entries } = req.body;
    // entries is an array of { date: 'YYYY-MM-DD', quantities: { [mealTypeId/code]: number } }

    if (!companyId || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'companyId and entries array are required' });
    }

    const customRates = await prisma.companyMealRate.findMany({ where: { companyId } });
    const customRateMap: Record<string, number> = {};
    customRates.forEach((cr) => {
      customRateMap[cr.mealTypeId] = cr.customPrice;
    });

    const mealTypes = await prisma.mealType.findMany({ where: { status: 'ACTIVE' } });

    const results = [];

    for (const entry of entries) {
      const { date, quantities } = entry;
      if (!date || !quantities) continue;

      let totalQty = 0;
      let totalAmt = 0;
      const itemsToCreate = [];

      for (const mt of mealTypes) {
        const qty = Number(quantities[mt.id] || quantities[mt.code] || 0);
        if (qty >= 0) {
          const unitPrice = customRateMap[mt.id] ?? mt.defaultPrice;
          const lineTotal = qty * unitPrice;
          totalQty += qty;
          totalAmt += lineTotal;
          if (qty > 0) {
            itemsToCreate.push({
              mealTypeId: mt.id,
              quantity: qty,
              unitPrice,
              totalAmount: lineTotal,
            });
          }
        }
      }

      const existing = await prisma.supplyLog.findUnique({
        where: { companyId_deliveryDate: { companyId, deliveryDate: date } },
      });

      if (existing) {
        await prisma.supplyItem.deleteMany({ where: { supplyLogId: existing.id } });
        const updated = await prisma.supplyLog.update({
          where: { id: existing.id },
          data: {
            status: 'SUBMITTED',
            totalQuantity: totalQty,
            totalAmount: totalAmt,
            items: { create: itemsToCreate },
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.supplyLog.create({
          data: {
            companyId,
            deliveryDate: date,
            status: 'SUBMITTED',
            totalQuantity: totalQty,
            totalAmount: totalAmt,
            items: { create: itemsToCreate },
          },
        });
        results.push(created);
      }
    }

    res.json({ message: `Successfully published ${results.length} dates logs`, logs: results });
  } catch (error) {
    console.error('Error in bulk entry:', error);
    res.status(500).json({ message: 'Error processing bulk entry' });
  }
});

// GET /api/supply-logs/unsubmitted - Find missing unsubmitted dates in range
router.get('/unsubmitted-dates', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ message: 'companyId, startDate, and endDate required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const dateList: string[] = [];

    const cur = new Date(start);
    while (cur <= end) {
      dateList.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    const existingLogs = await prisma.supplyLog.findMany({
      where: {
        companyId: companyId as string,
        deliveryDate: { in: dateList },
      },
      select: { deliveryDate: true },
    });

    const existingSet = new Set(existingLogs.map((l) => l.deliveryDate));
    const missingDates = dateList.filter((d) => !existingSet.has(d));

    res.json({
      totalDaysInRange: dateList.length,
      submittedDays: existingLogs.length,
      missingDays: missingDates.length,
      missingDates,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking unsubmitted dates' });
  }
});

export default router;
