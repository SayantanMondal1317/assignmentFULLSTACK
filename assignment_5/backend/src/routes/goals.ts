import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest, authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { id: "asc" },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const goal = await prisma.goal.create({
      data: {
        title,
        userId: req.userId!,
      },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, progress } = req.body;
    const goal = await prisma.goal.update({
      where: { id, userId: req.userId },
      data: { title, progress },
    });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({
      where: { id, userId: req.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
