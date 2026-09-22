import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/companies - List all corporate partners with custom rates
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        customRates: {
          include: { mealType: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// POST /api/companies - Create new corporate partner
router.post('/', async (req, res) => {
  try {
    const { name, gstin, address, billingCycle, rates } = req.body;

    if (!name || !gstin) {
      return res.status(400).json({ message: 'Company name and GSTIN are required' });
    }

    const company = await prisma.company.create({
      data: {
        name,
        gstin,
        address: address || '',
        billingCycle: billingCycle || 'Monthly (Consolidated)',
        status: 'ACTIVE',
      },
    });

    // If custom rates provided
    if (rates && Array.isArray(rates)) {
      for (const rateObj of rates) {
        if (rateObj.mealTypeId && rateObj.customPrice !== undefined) {
          await prisma.companyMealRate.create({
            data: {
              companyId: company.id,
              mealTypeId: rateObj.mealTypeId,
              customPrice: Number(rateObj.customPrice),
            },
          });
        }
      }
    }

    const updatedCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: { customRates: { include: { mealType: true } } },
    });

    res.status(201).json(updatedCompany);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A company with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating company' });
  }
});

// PUT /api/companies/:id - Update company & rates
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gstin, address, billingCycle, status, rates } = req.body;

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(gstin && { gstin }),
        ...(address !== undefined && { address }),
        ...(billingCycle && { billingCycle }),
        ...(status && { status }),
      },
    });

    if (rates && Array.isArray(rates)) {
      for (const r of rates) {
        if (r.mealTypeId && r.customPrice !== undefined) {
          await prisma.companyMealRate.upsert({
            where: {
              companyId_mealTypeId: {
                companyId: id,
                mealTypeId: r.mealTypeId,
              },
            },
            update: { customPrice: Number(r.customPrice) },
            create: {
              companyId: id,
              mealTypeId: r.mealTypeId,
              customPrice: Number(r.customPrice),
            },
          });
        }
      }
    }

    const result = await prisma.company.findUnique({
      where: { id },
      include: { customRates: { include: { mealType: true } } },
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company' });
  }
});

// DELETE /api/companies/:id - Remove corporate partner
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({
      where: { id },
    });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Error deleting company' });
  }
});

export default router;
