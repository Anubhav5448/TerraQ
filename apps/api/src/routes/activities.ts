import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

const activityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const tileSchema = z.object({
  tileX: z.number().int(),
  tileY: z.number().int(),
});

const createActivitySchema = z.object({
  type: z.enum(["running", "cycling", "walking"]),
  distanceM: z.number().nonnegative(),
  durationS: z.number().int().nonnegative(),
  tiles: z.array(tileSchema).optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
});

router.post("/", requireAuth, activityLimiter, async (req: AuthRequest, res) => {
  const parsed = createActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { type, distanceM, durationS, tiles, startedAt, endedAt } = parsed.data;
  const userId = req.userId!;

  // XP: 1 XP per 10 meters (placeholder formula)
  const xpEarned = Math.round(distanceM / 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.activitySession.create({
        data: {
          userId,
          type,
          distanceM,
          durationS,
          xpEarned,
          startedAt: new Date(startedAt),
          endedAt: endedAt ? new Date(endedAt) : undefined,
        },
      });

      // Tile claiming removed — territory system handles claiming via Territory model

      // Award XP and recompute level (simple: every 1000 XP = 1 level)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
        },
        select: { xp: true, level: true },
      });

      const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
      if (newLevel !== updatedUser.level) {
        await tx.user.update({
          where: { id: userId },
          data: { level: newLevel },
        });
      }

      return { session, xpEarned, newLevel };
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record activity" });
  }
});

export default router;