import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const router = Router();
const prisma = new PrismaClient();

// GET /api/invoices - List monthly invoices with metrics summary
router.get('/', async (req, res) => {
  try {
    const { monthPeriod = '2026-02', status, companyId } = req.query;

    const where: any = {};
    if (monthPeriod && monthPeriod !== 'all') {
      where.monthPeriod = monthPeriod as string;
    }
    if (status && status !== 'all') {
      where.status = status as string;
    }
    if (companyId && companyId !== 'all') {
      where.companyId = companyId as string;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        company: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Metrics summary
    const allInvoices = await prisma.invoice.findMany({
      where: monthPeriod && monthPeriod !== 'all' ? { monthPeriod: monthPeriod as string } : {},
    });

    let totalMonthlyDraft = 0;
    let paidAmount = 0;
    let pendingReceivables = 0;

    allInvoices.forEach((inv) => {
      totalMonthlyDraft += inv.totalAmount;
      if (inv.status === 'PAID') {
        paidAmount += inv.totalAmount;
      } else if (inv.status === 'UNPAID') {
        pendingReceivables += inv.totalAmount;
      }
    });

    res.json({
      summary: {
        totalMonthlyDraft,
        paidAmount,
        pendingReceivables,
      },
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// GET /api/invoices/:id - Detailed invoice view
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        company: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice details' });
  }
});

// POST /api/invoices/generate-all - Batch generate monthly corporate invoices
router.post('/generate-all', async (req, res) => {
  try {
    const { monthPeriod = '2026-02', startDate = '2026-02-01', endDate = '2026-02-28' } = req.body;

    const companies = await prisma.company.findMany({ where: { status: 'ACTIVE' } });
    const generated = [];

    let count = await prisma.invoice.count({
      where: { monthPeriod },
    });

    for (const comp of companies) {
      // Find all supply logs for this company in date range
      const logs = await prisma.supplyLog.findMany({
        where: {
          companyId: comp.id,
          deliveryDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          items: { include: { mealType: true } },
        },
      });

      if (logs.length === 0) continue;

      // Group totals by meal type
      const mealTypeMap: Record<string, { name: string; mealTypeId: string; totalQty: number; rate: number }> = {};

      logs.forEach((log) => {
        log.items.forEach((it) => {
          const key = it.mealTypeId;
          if (!mealTypeMap[key]) {
            mealTypeMap[key] = {
              name: it.mealType.name,
              mealTypeId: it.mealTypeId,
              totalQty: 0,
              rate: it.unitPrice,
            };
          }
          mealTypeMap[key].totalQty += it.quantity;
        });
      });

      let subtotal = 0;
      const invoiceItemsData = Object.values(mealTypeMap).map((m) => {
        const itemTotal = m.totalQty * m.rate;
        subtotal += itemTotal;
        return {
          mealTypeId: m.mealTypeId,
          mealTypeName: m.name,
          totalQuantity: m.totalQty,
          rate: m.rate,
          totalAmount: itemTotal,
        };
      });

      const cgstAmount = subtotal * 0.025;
      const sgstAmount = subtotal * 0.025;
      const totalAmount = subtotal + cgstAmount + sgstAmount;

      count += 1;
      const invoiceNumber = `MESS-${monthPeriod}-${count < 10 ? '0' + count : count}`;

      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber,
          companyId: comp.id,
          monthPeriod,
          startDate,
          endDate,
          subtotal,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount,
          sgstAmount,
          totalAmount,
          status: 'UNPAID',
          issuedDate: new Date().toISOString().split('T')[0],
          items: {
            create: invoiceItemsData,
          },
        },
        include: { company: true, items: true },
      });

      generated.push(inv);
    }

    res.json({
      message: `Generated ${generated.length} corporate invoices for ${monthPeriod}`,
      invoices: generated,
    });
  } catch (error) {
    console.error('Error generating invoices:', error);
    res.status(500).json({ message: 'Error generating invoices' });
  }
});

// POST /api/invoices/:id/payment - Record payment for invoice
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod = 'Bank Transfer', referenceNo, notes } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payAmt = Number(amount || invoice.totalAmount);
    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: payAmt,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        referenceNo,
        notes,
      },
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'PAID' },
      include: { company: true, items: true, payments: true },
    });

    res.json({ message: 'Payment recorded successfully', payment, invoice: updatedInvoice });
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment' });
  }
});

// GET /api/invoices/:id/pdf - PDF Invoice Download Stream
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { company: true, items: true },
    });

    if (!invoice) return res.status(404).send('Invoice not found');

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header Branding
    doc.fillColor('#C62828').fontSize(20).text('Sri Karthikeya Deluxe Mess', { align: 'center' });
    doc.fillColor('#485563').fontSize(10).text('Corporate Catering & Bulk Meal Supply', { align: 'center' });
    doc.text('GSTIN: 33AAAFS2491M1ZS', { align: 'center' });
    doc.moveDown(1.5);

    // Title & Invoice Info
    doc.fillColor('#1F2937').fontSize(16).text('TAX INVOICE', { underline: true });
    doc.fontSize(10).text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.issuedDate}`);
    doc.text(`Period: ${invoice.startDate} to ${invoice.endDate}`);
    doc.moveDown();

    // Bill To & Supplier Details
    doc.fillColor('#C62828').fontSize(12).text('BILL TO:');
    doc.fillColor('#1F2937').fontSize(10).text(invoice.company.name);
    doc.text(`Address: ${invoice.company.address || 'N/A'}`);
    doc.text(`GSTIN: ${invoice.company.gstin}`);
    doc.moveDown(1.5);

    // Items Table Header
    doc.fillColor('#C62828').fontSize(11).text('Meal Category              Qty          Rate (Rs)       Total (Rs)');
    doc.text('-------------------------------------------------------------------');
    doc.fillColor('#1F2937').fontSize(10);

    invoice.items.forEach((item) => {
      const line = `${item.mealTypeName.padEnd(26)} ${String(item.totalQuantity).padEnd(12)} ${String(item.rate).padEnd(15)} Rs.${item.totalAmount.toLocaleString('en-IN')}`;
      doc.text(line);
    });

    doc.moveDown();
    doc.text('-------------------------------------------------------------------');
    doc.text(`Subtotal: Rs. ${invoice.subtotal.toLocaleString('en-IN')}`, { align: 'right' });
    doc.text(`CGST (2.5%): Rs. ${invoice.cgstAmount.toLocaleString('en-IN')}`, { align: 'right' });
    doc.text(`SGST (2.5%): Rs. ${invoice.sgstAmount.toLocaleString('en-IN')}`, { align: 'right' });
    doc.fillColor('#C62828').fontSize(12).text(`Grand Total: Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, { align: 'right' });

    doc.moveDown(2);
    doc.fillColor('#485563').fontSize(9).text('Thank you for your business! Sri Karthikeya Deluxe Mess.', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).send('Error generating PDF');
  }
});

export default router;
