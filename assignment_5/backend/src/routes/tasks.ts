import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest, authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: { subtasks: true },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { title, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        dueDate: dueDate || null,
        userId: req.userId!,
      },
      include: { subtasks: true },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, dueDate, completed } = req.body;

    if (completed !== undefined) {
      await prisma.subtask.updateMany({
        where: { taskId: id },
        data: { completed: completed },
      });
    }

    const task = await prisma.task.update({
      where: { id, userId: req.userId },
      data: { title, dueDate, completed },
      include: { subtasks: true },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id, userId: req.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/subtasks", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId: id,
      },
    });
    res.status(201).json(subtask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/:taskId/subtasks/:subtaskId",
  async (req: AuthRequest, res: Response) => {
    try {
      const { subtaskId, taskId } = req.params;
      const { completed } = req.body;

      const updatedSubtask = await prisma.subtask.update({
        where: { id: subtaskId },
        data: { completed },
      });

      const allSubtasks = await prisma.subtask.findMany({ where: { taskId } });
      const allDone = allSubtasks.every((sub) => sub.completed);

      await prisma.task.update({
        where: { id: taskId },
        data: { completed: allDone },
      });

      res.json(updatedSubtask);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:taskId/subtasks/:subtaskId",
  async (req: AuthRequest, res: Response) => {
    try {
      const { subtaskId } = req.params;
      await prisma.subtask.delete({
        where: { id: subtaskId },
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
