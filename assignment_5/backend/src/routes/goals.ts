import { Router, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import prisma from "../prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all goal routes
router.use(authenticateToken as any);

// Goal Validation Schemas
const createGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  targetDate: z.string().datetime({ offset: true }).nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  targetDate: z.string().datetime({ offset: true }).nullable().optional(),
  progress: z.number().optional(), // Clamping will be applied manually in the controller logic
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

// 1. CREATE Goal
router.post(
  "/",
  validateBody(createGoalSchema),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { title, targetDate, progress } = req.body;
      const userId = req.user!.id;

      // Clamp progress value between 0 and 100 if provided
      const clampedProgress =
        progress !== undefined ? Math.max(0, Math.min(100, progress)) : 0;

      const goal = await prisma.goal.create({
        data: {
          title,
          targetDate: targetDate ? new Date(targetDate) : null,
          progress: clampedProgress,
          userId,
        },
      });

      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  },
);

// 2. READ All Goals
router.get(
  "/",
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  },
);

// 3. UPDATE Goal
router.patch(
  "/:id",
  validateBody(updateGoalSchema),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { title, targetDate, progress } = req.body;

      // Verify ownership before updating
      const existingGoal = await prisma.goal.findFirst({
        where: { id, userId },
      });

      if (!existingGoal) {
        res
          .status(404)
          .json({ success: false, error: "Goal not found or unauthorized" });
        return;
      }

      // Build update payload
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (targetDate !== undefined)
        updateData.targetDate = targetDate ? new Date(targetDate) : null;

      // Explicitly clamp incoming progress changes between 0 and 100
      if (progress !== undefined) {
        updateData.progress = Math.max(0, Math.min(100, progress));
      }

      const updatedGoal = await prisma.goal.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({ success: true, data: updatedGoal });
    } catch (error) {
      next(error);
    }
  },
);

// 4. DELETE Goal
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

      const existingGoal = await prisma.goal.findFirst({
        where: { id, userId },
      });

      if (!existingGoal) {
        res
          .status(404)
          .json({ success: false, error: "Goal not found or unauthorized" });
        return;
      }

      await prisma.goal.delete({
        where: { id },
      });

      res
        .status(200)
        .json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
