import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/meal-types - List all master meal categories
router.get('/', async (req, res) => {
  try {
    const mealTypes = await prisma.mealType.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json(mealTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal types' });
  }
});

// POST /api/meal-types - Create new custom meal category
router.post('/', async (req, res) => {
  try {
    const { name, code, ledgerCode, defaultPrice } = req.body;

    if (!name || !defaultPrice) {
      return res.status(400).json({ message: 'Name and default contract price are required' });
    }

    const generatedCode = code
      ? code.toUpperCase()
      : name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() + Math.floor(Math.random() * 90 + 10);

    const generatedLedger = ledgerCode
      ? ledgerCode.toUpperCase()
      : generatedCode.substring(0, 3);

    const count = await prisma.mealType.count();

    const mealType = await prisma.mealType.create({
      data: {
        code: generatedCode,
        name,
        ledgerCode: generatedLedger,
        defaultPrice: Number(defaultPrice),
        displayOrder: count + 1,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(mealType);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A meal type with this code already exists' });
    }
    res.status(500).json({ message: 'Error creating meal type' });
  }
});

// PUT /api/meal-types/:id - Update meal category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ledgerCode, defaultPrice, status, displayOrder } = req.body;

    const updated = await prisma.mealType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(ledgerCode && { ledgerCode: ledgerCode.toUpperCase() }),
        ...(defaultPrice !== undefined && { defaultPrice: Number(defaultPrice) }),
        ...(status && { status }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meal type' });
  }
});

export default router;
