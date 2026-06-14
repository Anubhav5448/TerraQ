import { Router } from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { uploadAvatar } from "../middleware/upload";

const router = Router();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

router.get("/me", requireAuth, generalLimiter, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      username: true,
      email: true,
      xp: true,
      level: true,
      activityType: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { territories: true } },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  activityType: z.enum(["running", "cycling", "walking"]).optional(),
});

router.patch("/me", requireAuth, generalLimiter, async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    if (parsed.data.username || parsed.data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: req.userId } },
            {
              OR: [
                parsed.data.username ? { username: parsed.data.username } : {},
                parsed.data.email ? { email: parsed.data.email } : {},
              ],
            },
          ],
        },
      });
      if (existing) {
        return res.status(409).json({ error: "Username or email already taken" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: parsed.data,
      select: { id: true, username: true, email: true, activityType: true },
    });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

router.patch("/me/password", requireAuth, sensitiveLimiter, async (req: AuthRequest, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: req.userId },
    data: { passwordHash },
  });

  res.json({ success: true });
});

router.delete("/me", requireAuth, sensitiveLimiter, async (req: AuthRequest, res) => {
  await prisma.user.delete({ where: { id: req.userId } });
  res.json({ success: true });
});




router.post("/me/avatar", requireAuth, sensitiveLimiter, (req: AuthRequest, res) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate actual file content matches an allowed image type
    const { fileTypeFromFile } = await import("file-type");
    const type = await fileTypeFromFile(req.file.path);
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];

    if (!type || !allowedMimes.includes(type.mime)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Invalid image file" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });

      // Delete old avatar file if it exists and is locally stored
      if (user?.avatarUrl?.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), user.avatarUrl);
        fs.unlink(oldPath, () => {});
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const updated = await prisma.user.update({
        where: { id: req.userId },
        data: { avatarUrl },
        select: { id: true, username: true, email: true, avatarUrl: true },
      });

      res.json({ user: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save avatar" });
    }
  });
});

router.delete("/me/avatar", requireAuth, sensitiveLimiter, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (user?.avatarUrl?.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), user.avatarUrl);
      fs.unlink(oldPath, () => {});
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: null },
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    res.json({ user: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to remove avatar" });
  }
});



// Dashboard API

router.get("/me/dashboard", requireAuth, generalLimiter, async (req: AuthRequest, res) => {
const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      username: true,
      xp: true,
      level: true,
      territories: {
        select: { id: true, points: true, areaM2: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      routes: {
        select: { id: true, points: true, isClosed: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyDistance = await prisma.activitySession.aggregate({
    where: { userId: req.userId!, startedAt: { gte: oneWeekAgo } },
    _sum: { distanceM: true },
  });

  const totalAreaM2 = user.territories.reduce((sum, t) => sum + t.areaM2, 0);

  res.json({
    username: user.username,
    xp: user.xp,
    level: user.level,
    territoriesOwned: user.territories.length,
    totalAreaKm2: totalAreaM2 / 1_000_000,
    distanceWeekKm: (weeklyDistance._sum.distanceM ?? 0) / 1000,
    territories: user.territories,
    routes: user.routes,
  });
});




router.get("/me/activities", requireAuth, generalLimiter, async (req: AuthRequest, res) => {
  const page = parseInt((req.query.page as string) || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.activitySession.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        distanceM: true,
        durationS: true,
        xpEarned: true,
        startedAt: true,
        endedAt: true,
        territoryId: true,
      },
    }),
    prisma.activitySession.count({ where: { userId: req.userId! } }),
  ]);

  res.json({
    sessions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
export default router;