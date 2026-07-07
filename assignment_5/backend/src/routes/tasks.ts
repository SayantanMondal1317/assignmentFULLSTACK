import { Router, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import prisma from "../prisma"; // Adjust path if you left it as '../prisma' or changed to '../db'
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken as any);

// Task Validation Schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  parentId: z.string().uuid("Invalid parent task ID").nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

// Helper validation runner
const validateBody = (schema: z.ZodSchema) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation Error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// 1. CREATE Task / Subtask
router.post(
  "/",
  validateBody(createTaskSchema),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { title, dueDate, parentId } = req.body;
      const userId = req.user!.id;

      // If parentId is provided, verify that the parent task actually belongs to this user
      if (parentId) {
        const parentTask = await prisma.task.findFirst({
          where: { id: parentId, userId },
        });
        if (!parentTask) {
          res
            .status(404)
            .json({ success: false, error: "Parent task not found" });
          return;
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          dueDate: dueDate ? new Date(dueDate) : null,
          parentId: parentId || null,
          userId,
        },
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },
);

// 2. READ All Tasks (Returns a flat relational array matching your frontend's state structure)
router.get(
  "/",
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  },
);

// 3. UPDATE Task / Subtask
router.patch(
  "/:id",
  validateBody(updateTaskSchema),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { title, isCompleted, dueDate } = req.body;

      // Verify task ownership before updating
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        res
          .status(404)
          .json({ success: false, error: "Task not found or unauthorized" });
        return;
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(isCompleted !== undefined && { isCompleted }),
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
        },
      });

      res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  },
);

// 4. DELETE Task (Triggers a database-level cascade deletion for child subtasks)
router.delete(
  "/:id",
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        res
          .status(404)
          .json({ success: false, error: "Task not found or unauthorized" });
        return;
      }

      await prisma.task.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: "Task and its subtasks deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
