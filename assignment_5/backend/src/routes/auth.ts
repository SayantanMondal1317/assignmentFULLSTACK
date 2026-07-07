import { Router, Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// P5a: Input Validation Schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
});

// Helper function to handle Zod validation errors cleanly inline
const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// P2a: Register Endpoint
router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: "User with this email already exists",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { id: user.id, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  },
);

// P2b: Login Endpoint
router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res
          .status(401)
          .json({ success: false, error: "Invalid email or password" });
        return;
      }

      const secret = process.env.JWT_SECRET || "fallback_secret";
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "24h" });

      res
        .status(200)
        .json({ success: true, message: "Login successful", token });
    } catch (error) {
      next(error);
    }
  },
);

// P2e: Protected Route (Get Current User)
router.get(
  "/me",
  authenticateToken as any,
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { id: true, email: true, createdAt: true },
      });

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
