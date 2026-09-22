import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Mess Owner',
      email: 'owner@srikarthikeyamess.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created/verified:', admin.username);

  // 2. Create Master Meal Types
  const mealTypesData = [
    { code: 'VEG', name: 'Veg Meal', ledgerCode: 'VEG', defaultPrice: 80.0, displayOrder: 1 },
    { code: 'CHK', name: 'Chicken Meal', ledgerCode: 'CHK', defaultPrice: 120.0, displayOrder: 2 },
    { code: 'MUT', name: 'Mutton Meal', ledgerCode: 'MUT', defaultPrice: 180.0, displayOrder: 3 },
    { code: 'FSH', name: 'Fish Meal', ledgerCode: 'FSH', defaultPrice: 110.0, displayOrder: 4 },
    { code: 'PRW', name: 'Prawns Special', ledgerCode: 'PRW', defaultPrice: 140.0, displayOrder: 5 },
    { code: 'SPC', name: 'Special Meal (Sweets)', ledgerCode: 'SPC', defaultPrice: 150.0, displayOrder: 6 },
  ];

  const mealTypes: Record<string, any> = {};
  for (const item of mealTypesData) {
    const mt = await prisma.mealType.upsert({
      where: { code: item.code },
      update: { defaultPrice: item.defaultPrice, ledgerCode: item.ledgerCode },
      create: item,
    });
    mealTypes[item.code] = mt;
  }
  console.log('✅ Master Meal Types created/verified:', Object.keys(mealTypes).length);

  // 3. Create Corporate Partners (Companies)
  const companiesData = [
    {
      name: 'TCS Siruseri Campus',
      gstin: '33AAAFW1029C1Z0',
      address: 'Siruseri IT Park, OMR, Chennai - 603103',
      billingCycle: 'Monthly (Consolidated)',
      status: 'ACTIVE',
    },
    {
      name: 'Infosys Mahindra City',
      gstin: '33AAAP284901Z4',
      address: 'Mahindra World City, Chengalpattu - 603002',
      billingCycle: 'Weekly',
      status: 'ACTIVE',
    },
    {
      name: 'Wipro Sholinganallur',
      gstin: '33AAAFW1283H1Z2',
      address: 'Sholinganallur Main Road, Chennai - 600119',
      billingCycle: 'Monthly (Consolidated)',
      status: 'ACTIVE',
    },
    {
      name: 'Cognizant OMR',
      gstin: '33AAACC3849J1Z1',
      address: 'Okkiyam Thoraipakkam, OMR, Chennai - 600097',
      billingCycle: 'Monthly (Consolidated)',
      status: 'ACTIVE',
    },
  ];

  const companies: Record<string, any> = {};
  for (const cData of companiesData) {
    const c = await prisma.company.upsert({
      where: { name: cData.name },
      update: cData,
      create: cData,
    });
    companies[cData.name] = c;
  }
  console.log('✅ Corporate Partners created/verified:', Object.keys(companies).length);

  // 4. Custom Pricing Overrides (e.g. Infosys Mahindra City Veg ₹ 85 / Non-Veg ₹ 130)
  if (companies['Infosys Mahindra City'] && mealTypes['VEG']) {
    await prisma.companyMealRate.upsert({
      where: {
        companyId_mealTypeId: {
          companyId: companies['Infosys Mahindra City'].id,
          mealTypeId: mealTypes['VEG'].id,
        },
      },
      update: { customPrice: 85 },
      create: {
        companyId: companies['Infosys Mahindra City'].id,
        mealTypeId: mealTypes['VEG'].id,
        customPrice: 85,
      },
    });
  }

  // 5. Seed Historical Supply Logs (26 Feb 2026 Today & Previous Days)
  const logsToCreate = [
    {
      companyName: 'TCS Siruseri Campus',
      date: '2026-02-26',
      items: [
        { code: 'VEG', qty: 220, price: 80 },
        { code: 'CHK', qty: 150, price: 120 },
        { code: 'SPC', qty: 35, price: 150 },
      ],
    },
    {
      companyName: 'Infosys Mahindra City',
      date: '2026-02-26',
      items: [
        { code: 'VEG', qty: 310, price: 85 },
        { code: 'CHK', qty: 200, price: 130 },
        { code: 'SPC', qty: 50, price: 150 },
      ],
    },
    {
      companyName: 'Wipro Sholinganallur',
      date: '2026-02-26',
      items: [
        { code: 'VEG', qty: 180, price: 80 },
        { code: 'CHK', qty: 110, price: 120 },
        { code: 'SPC', qty: 20, price: 150 },
      ],
    },
    {
      companyName: 'Cognizant OMR',
      date: '2026-02-26',
      items: [
        { code: 'VEG', qty: 300, price: 80 },
        { code: 'CHK', qty: 200, price: 120 },
        { code: 'PRW', qty: 50, price: 140 },
      ],
    },
    // Historical dates
    {
      companyName: 'TCS Siruseri Campus',
      date: '2026-02-22',
      items: [
        { code: 'VEG', qty: 110, price: 80 },
        { code: 'CHK', qty: 90, price: 120 },
        { code: 'SPC', qty: 20, price: 150 },
      ],
    },
    {
      companyName: 'Infosys Mahindra City',
      date: '2026-02-21',
      items: [
        { code: 'VEG', qty: 240, price: 85 },
        { code: 'CHK', qty: 160, price: 130 },
        { code: 'SPC', qty: 30, price: 150 },
      ],
    },
    {
      companyName: 'Wipro Sholinganallur',
      date: '2026-02-20',
      items: [
        { code: 'VEG', qty: 190, price: 80 },
        { code: 'CHK', qty: 120, price: 120 },
        { code: 'SPC', qty: 10, price: 150 },
      ],
    },
    {
      companyName: 'Cognizant OMR',
      date: '2026-02-19',
      items: [
        { code: 'VEG', qty: 280, price: 80 },
        { code: 'CHK', qty: 190, price: 120 },
        { code: 'SPC', qty: 45, price: 150 },
      ],
    },
    {
      companyName: 'TCS Siruseri Campus',
      date: '2026-02-18',
      items: [
        { code: 'VEG', qty: 115, price: 80 },
        { code: 'CHK', qty: 85, price: 120 },
        { code: 'SPC', qty: 15, price: 150 },
      ],
    },
  ];

  for (const logDef of logsToCreate) {
    const comp = companies[logDef.companyName];
    if (!comp) continue;

    let totalQty = 0;
    let totalAmt = 0;
    const itemRecords = logDef.items.map((it) => {
      const mt = mealTypes[it.code];
      const itemTot = it.qty * it.price;
      totalQty += it.qty;
      totalAmt += itemTot;
      return {
        mealTypeId: mt.id,
        quantity: it.qty,
        unitPrice: it.price,
        totalAmount: itemTot,
      };
    });

    await prisma.supplyLog.upsert({
      where: {
        companyId_deliveryDate: {
          companyId: comp.id,
          deliveryDate: logDef.date,
        },
      },
      update: {
        totalQuantity: totalQty,
        totalAmount: totalAmt,
        status: 'SUBMITTED',
      },
      create: {
        companyId: comp.id,
        deliveryDate: logDef.date,
        status: 'SUBMITTED',
        totalQuantity: totalQty,
        totalAmount: totalAmt,
        items: {
          create: itemRecords,
        },
      },
    });
  }
  console.log('✅ Daily Supply Logs seeded.');

  // 6. Seed Monthly Corporate Invoices (Matching Figma Screenshots)
  const invoicesData = [
    {
      num: 'MESS-2026-02-01',
      compName: 'TCS Siruseri Campus',
      subtotal: 112400.0,
      status: 'UNPAID',
      issuedDate: '2026-02-25',
    },
    {
      num: 'MESS-2026-02-02',
      compName: 'Infosys Mahindra City',
      subtotal: 245600.0,
      status: 'PAID',
      issuedDate: '2026-02-24',
    },
    {
      num: 'MESS-2026-02-03',
      compName: 'Wipro Sholinganallur',
      subtotal: 138000.0,
      status: 'PAID',
      issuedDate: '2026-02-24',
    },
    {
      num: 'MESS-2026-02-04',
      compName: 'Cognizant OMR',
      subtotal: 312000.0,
      status: 'UNPAID',
      issuedDate: '2026-02-23',
    },
  ];

  for (const invDef of invoicesData) {
    const comp = companies[invDef.compName];
    if (!comp) continue;

    const cgst = invDef.subtotal * 0.025;
    const sgst = invDef.subtotal * 0.025;
    const total = invDef.subtotal + cgst + sgst;

    const inv = await prisma.invoice.upsert({
      where: { invoiceNumber: invDef.num },
      update: {
        status: invDef.status,
        subtotal: invDef.subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: total,
      },
      create: {
        invoiceNumber: invDef.num,
        companyId: comp.id,
        monthPeriod: '2026-02',
        startDate: '2026-02-01',
        endDate: '2026-02-25',
        subtotal: invDef.subtotal,
        cgstRate: 2.5,
        sgstRate: 2.5,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: total,
        status: invDef.status,
        issuedDate: invDef.issuedDate,
        items: {
          create: [
            {
              mealTypeId: mealTypes['VEG']?.id,
              mealTypeName: 'Veg Meal',
              totalQuantity: 850,
              rate: 80.0,
              totalAmount: 68000.0,
            },
            {
              mealTypeId: mealTypes['CHK']?.id,
              mealTypeName: 'Chicken Meal',
              totalQuantity: 320,
              rate: 120.0,
              totalAmount: 38400.0,
            },
            {
              mealTypeId: mealTypes['SPC']?.id,
              mealTypeName: 'Special Meals (Sweet/Snack)',
              totalQuantity: 40,
              rate: 150.0,
              totalAmount: 6000.0,
            },
          ],
        },
      },
    });

    if (invDef.status === 'PAID') {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: total,
          paymentDate: invDef.issuedDate,
          paymentMethod: 'Bank Transfer',
          referenceNo: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: 'Full payment received.',
        },
      });
    }
  }

  console.log('✅ Invoices and Payments seeded successfully.');
  console.log('🎉 Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
