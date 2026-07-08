import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest, authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.moodItem.findMany({
      where: { userId: req.userId },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { type, value } = req.body;
    const item = await prisma.moodItem.create({
      data: {
        type,
        value,
        userId: req.userId!,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.moodItem.delete({
      where: { id, userId: req.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
