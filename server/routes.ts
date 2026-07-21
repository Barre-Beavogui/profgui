import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import { randomBytes } from "crypto";
import { sendApprovalEmail, sendPasswordResetEmail } from "./email";
import { createAuthToken, verifyAuthToken } from "./auth-token";
import { isPasswordHash, verifyPassword } from "./password";
import { adminStorage } from "./firebase-admin";
import {
  studentRegistrationSchema,
  parentRegistrationSchema,
  teacherRegistrationSchema,
  loginSchema,
  insertReviewSchema,
  type CourseRequest,
  type User,
} from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    if (user.role !== "admin" && user.status === "suspended") {
      return res.status(403).json({ message: "Votre compte est suspendu. Contactez l'administrateur pour réactiver votre accès." });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

const avatarContentTypes = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const chatAttachmentContentTypes = {
  "image/jpeg": { extension: "jpg", type: "image", maxBytes: 3 * 1024 * 1024 },
  "image/jpg": { extension: "jpg", type: "image", maxBytes: 3 * 1024 * 1024 },
  "image/png": { extension: "png", type: "image", maxBytes: 3 * 1024 * 1024 },
  "image/webp": { extension: "webp", type: "image", maxBytes: 3 * 1024 * 1024 },
  "audio/mpeg": { extension: "mp3", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/mp3": { extension: "mp3", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/wav": { extension: "wav", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/webm": { extension: "webm", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/ogg": { extension: "ogg", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/mp4": { extension: "m4a", type: "audio", maxBytes: 5 * 1024 * 1024 },
  "audio/x-m4a": { extension: "m4a", type: "audio", maxBytes: 5 * 1024 * 1024 },
} as const;

function parseAvatarImageData(imageData: string): { buffer: Buffer; contentType: keyof typeof avatarContentTypes } {
  const match = imageData.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error("INVALID_IMAGE");
  }

  const contentType = match[1] as keyof typeof avatarContentTypes;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > 1024 * 1024) {
    throw new Error("INVALID_IMAGE_SIZE");
  }

  return { buffer, contentType };
}

function parseChatAttachmentData(
  fileData: string,
  expectedType?: "image" | "audio"
): {
  buffer: Buffer;
  contentType: keyof typeof chatAttachmentContentTypes;
  type: "image" | "audio";
  extension: string;
} {
  const match = fileData.match(/^data:([^;,]+)(?:;[^,]+)*;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error("INVALID_ATTACHMENT");
  }

  const rawContentType = match[1].toLowerCase();
  if (rawContentType.startsWith("video/")) {
    throw new Error("VIDEO_NOT_ALLOWED");
  }

  const contentType = rawContentType as keyof typeof chatAttachmentContentTypes;
  const config = chatAttachmentContentTypes[contentType];
  if (!config) {
    throw new Error("INVALID_ATTACHMENT_TYPE");
  }
  if (expectedType && config.type !== expectedType) {
    throw new Error("INVALID_ATTACHMENT_TYPE");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > config.maxBytes) {
    throw new Error("INVALID_ATTACHMENT_SIZE");
  }

  return {
    buffer,
    contentType,
    type: config.type,
    extension: config.extension,
  };
}

async function uploadAvatarToFirebaseStorage(
  userId: string,
  buffer: Buffer,
  contentType: keyof typeof avatarContentTypes
): Promise<string> {
  const bucket = adminStorage.bucket();
  const token = randomBytes(24).toString("hex");
  const objectPath = `avatars/${userId}/${Date.now()}-${randomBytes(8).toString("hex")}.${avatarContentTypes[contentType]}`;
  const file = bucket.file(objectPath);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

async function uploadChatAttachmentToFirebaseStorage(
  userId: string,
  buffer: Buffer,
  contentType: keyof typeof chatAttachmentContentTypes,
  type: "image" | "audio",
  extension: string
): Promise<string> {
  const bucket = adminStorage.bucket();
  const token = randomBytes(24).toString("hex");
  const objectPath = `chat/${userId}/${type}/${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
  const file = bucket.file(objectPath);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "private, max-age=86400",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "https://profgui-gn.web.app";
}

function getLoginUrl(): string {
  return `${getFrontendBaseUrl()}/connexion`;
}

const defaultApprovalEmailSubject = "Votre compte ProfGui est approuvé";
const defaultApprovalEmailMessage = `Bonjour {{prenom}} {{nom}},

Votre compte ProfGui a été approuvé par l'administrateur.

Voici vos identifiants de connexion :
Identifiant : {{identifiant}}
Mot de passe temporaire : {{motDePasse}}

Pour votre sécurité, pensez à modifier ce mot de passe dès votre première connexion. L'application vous demandera automatiquement de définir un nouveau mot de passe.

Connectez-vous ici : {{lienConnexion}}

Bienvenue sur ProfGui.
L'équipe ProfGui`;

function getRoleLabel(role: string): string {
  switch (role) {
    case "student":
      return "Élève";
    case "parent":
      return "Parent";
    case "teacher":
      return "Professeur";
    case "admin":
      return "Administrateur";
    default:
      return role;
  }
}

function getCourseRequestStatusLabel(status: string): string {
  switch (status) {
    case "accepted":
      return "acceptée";
    case "rejected":
      return "refusée";
    case "completed":
      return "terminée";
    case "cancelled":
      return "annulée";
    default:
      return "en attente";
  }
}

function getCourseRequestDashboardLink(role: User["role"]): string {
  switch (role) {
    case "teacher":
      return "/dashboard/professeur";
    case "parent":
      return "/dashboard/parent";
    case "student":
      return "/dashboard/eleve";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_match, key: string) => {
    return variables[key] ?? "";
  });
}

function getBearerToken(req: Request): string | undefined {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }
  return authorization.slice("Bearer ".length).trim();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedAdmin();

  const isProd = process.env.NODE_ENV === "production";
  const sessionSecret =
    process.env.SESSION_SECRET || "profgui-secret-key-dev";

  if (isProd && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: isProd
        ? new PgSession({
            pool,
          })
        : undefined,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProd,
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use((req, _res, next) => {
    if (!req.session.userId) {
      const tokenUserId = verifyAuthToken(getBearerToken(req), sessionSecret);
      if (tokenUserId) {
        req.session.userId = tokenUserId;
      }
    }
    next();
  });

  async function sendPasswordSetupEmail(userId: string, email: string | null) {
    if (!email) return;
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await storage.createPasswordResetToken({
      userId,
      token,
      expiresAt,
      usedAt: null,
    });
    const resetLink = `${getFrontendBaseUrl()}/reinitialiser-mot-de-passe?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);
  }

  async function notifyUser(
    userId: string | null | undefined,
    notification: { type: string; title: string; message: string; link?: string | null }
  ) {
    if (!userId) return;
    await storage.createNotification({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      readAt: null,
    });
  }

  async function notifyAdmins(notification: { type: string; title: string; message: string; link?: string | null }) {
    const admins = (await storage.getApprovedUsers()).filter((user) => user.role === "admin");
    await Promise.all(admins.map((admin) => notifyUser(admin.id, notification)));
  }

  app.patch("/api/user/avatar", requireAuth, async (req, res) => {
    try {
      const { avatarUrl } = z.object({ avatarUrl: z.string().url() }).parse(req.body);
      const user = await storage.updateUserAvatar(req.session.userId!, avatarUrl);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "URL d'avatar invalide" });
    }
  });

  app.post("/api/user/avatar/upload", requireAuth, async (req, res) => {
    try {
      const { imageData } = z
        .object({
          imageData: z.string().max(2_000_000),
        })
        .parse(req.body);
      const { buffer, contentType } = parseAvatarImageData(imageData);
      let avatarUrl = imageData;
      try {
        avatarUrl = await uploadAvatarToFirebaseStorage(req.session.userId!, buffer, contentType);
      } catch (uploadError) {
        console.error("Firebase Storage avatar upload failed; storing inline avatar", uploadError);
      }
      const user = await storage.updateUserAvatar(req.session.userId!, avatarUrl);
      res.json({ avatarUrl: user?.avatarUrl ?? avatarUrl });
    } catch (error) {
      console.error("Avatar upload failed", error);
      if (error instanceof z.ZodError || (error instanceof Error && error.message.startsWith("INVALID_IMAGE"))) {
        return res.status(400).json({ message: "Image invalide. Utilisez une image JPG, PNG ou WebP de moins de 1 Mo." });
      }
      res.status(500).json({ message: "Impossible d'importer la photo." });
    }
  });

  app.post("/api/chat/attachments/upload", requireAuth, async (req, res) => {
    try {
      const data = z
        .object({
          fileData: z.string().max(8_000_000),
          fileName: z.string().trim().max(160).optional(),
          type: z.enum(["image", "audio"]).optional(),
        })
        .parse(req.body);
      const attachment = parseChatAttachmentData(data.fileData, data.type);
      const url = await uploadChatAttachmentToFirebaseStorage(
        req.session.userId!,
        attachment.buffer,
        attachment.contentType,
        attachment.type,
        attachment.extension
      );

      res.status(201).json({
        type: attachment.type,
        url,
        contentType: attachment.contentType,
        fileName: data.fileName || `${attachment.type}.${attachment.extension}`,
        size: attachment.buffer.length,
      });
    } catch (error) {
      console.error("Chat attachment upload failed", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Fichier invalide ou trop volumineux." });
      }
      if (error instanceof Error && error.message === "VIDEO_NOT_ALLOWED") {
        return res.status(400).json({ message: "Les vidéos ne sont pas autorisées dans la messagerie." });
      }
      if (error instanceof Error && error.message === "INVALID_ATTACHMENT_SIZE") {
        return res.status(400).json({ message: "Fichier trop volumineux. Limite : 3 Mo pour une photo, 5 Mo pour un vocal." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_ATTACHMENT")) {
        return res.status(400).json({ message: "Type de fichier non autorisé. Utilisez une photo ou un audio." });
      }
      res.status(500).json({ message: "Impossible d'envoyer ce fichier." });
    }
  });

  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const data = z
        .object({
          profileHeadline: z.string().trim().max(120).optional(),
          profileBio: z.string().trim().max(1200).optional(),
        })
        .parse(req.body);
      const user = await storage.updateUserProfile(req.session.userId!, {
        profileHeadline: data.profileHeadline || null,
        profileBio: data.profileBio || null,
      });
      res.json({
        profileHeadline: user?.profileHeadline ?? null,
        profileBio: user?.profileBio ?? null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });

  const createCourseRequestSchema = z.object({
    teacherId: z.string().min(1),
    childId: z.string().optional().nullable(),
    subject: z.string().trim().min(1).max(120),
    level: z.string().trim().min(1).max(120),
    courseType: z.enum(["domicile", "en_ligne", "les_deux"]),
    requestedDate: z.string().trim().min(8).max(20),
    requestedTime: z.string().trim().min(3).max(20),
    message: z.string().trim().max(1200).optional(),
  });

  app.get("/api/course-requests", requireAuth, async (req, res) => {
    const requests = await storage.getCourseRequestsForUser(req.session.userId!);
    res.json(requests);
  });

  app.post("/api/course-requests", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !["student", "parent"].includes(user.role)) {
        return res.status(403).json({ message: "Seuls les élèves et parents peuvent réserver un cours." });
      }

      const data = createCourseRequestSchema.parse(req.body);
      const teacher = await storage.getTeacher(data.teacherId);
      const teacherUser = teacher ? await storage.getUser(teacher.userId) : undefined;
      if (!teacher || !teacherUser || teacherUser.status !== "approved") {
        return res.status(404).json({ message: "Professeur indisponible." });
      }

      let studentId: string | null = null;
      let parentId: string | null = null;
      let childId: string | null = null;
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (!student) {
          return res.status(400).json({ message: "Profil élève introuvable." });
        }
        studentId = student.id;
      } else {
        const parent = await storage.getParentByUserId(user.id);
        if (!parent) {
          return res.status(400).json({ message: "Profil parent introuvable." });
        }
        parentId = parent.id;
        const children = await storage.getChildrenByParentId(parent.id);
        const selectedChild = data.childId
          ? children.find((child) => child.id === data.childId)
          : children[0];
        childId = selectedChild?.id || null;
      }

      const request = await storage.createCourseRequest({
        requesterUserId: user.id,
        studentId,
        parentId,
        childId,
        teacherId: teacher.id,
        subject: data.subject,
        level: data.level,
        courseType: data.courseType,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        message: data.message || null,
        status: "pending",
      });

      const requesterLabel = user.email || user.phone;
      await notifyAdmins({
        type: "course_request",
        title: "Nouvelle demande à traiter",
        message: `${requesterLabel} souhaite un cours en ${data.subject} avec ${teacher.firstName} ${teacher.lastName} le ${data.requestedDate} à ${data.requestedTime}.`,
        link: "/admin",
      });

      res.status(201).json(await storage.getCourseRequestDetails(request.id));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  const updateCourseRequestStatusSchema = z.object({
    status: z.enum(["accepted", "rejected", "completed", "cancelled"]),
  });

  app.patch("/api/course-requests/:id/status", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const request = await storage.getCourseRequestDetails(req.params.id);
      if (!user || !request) {
        return res.status(404).json({ message: "Demande introuvable." });
      }

      const { status } = updateCourseRequestStatusSchema.parse(req.body);
      const isTeacherOwner = user.role === "teacher" && request.teacher?.user.id === user.id;
      const isRequester = request.requesterUserId === user.id;
      const isAdmin = user.role === "admin";
      const allowed =
        isAdmin ||
        (isTeacherOwner && request.status === "accepted" && status === "completed") ||
        (isRequester && ["pending", "accepted"].includes(request.status) && status === "cancelled");

      if (!allowed) {
        return res.status(403).json({ message: "Action non autorisée." });
      }

      const updated = await storage.updateCourseRequestStatus(req.params.id, status);
      const details = updated ? await storage.getCourseRequestDetails(updated.id) : undefined;

      if (details?.requesterUserId && status !== "cancelled") {
        await notifyUser(details.requesterUserId, {
          type: "course_request_status",
          title: `Demande de cours ${getCourseRequestStatusLabel(status)}`,
          message: `Votre demande de cours en ${details.subject} a été ${getCourseRequestStatusLabel(status)}.`,
          link: getCourseRequestDashboardLink(details.requester?.role || "student"),
        });
      }
      if (details?.teacher?.user.id && status === "accepted") {
        await notifyUser(details.teacher.user.id, {
          type: "course_request_status",
          title: "Demande validée par l'administration",
          message: `L'administration a validé une demande en ${details.subject}. Consultez votre espace professeur.`,
          link: "/dashboard/professeur",
        });
      }
      if (details?.teacher?.user.id && status === "cancelled" && request.status === "accepted") {
        await notifyUser(details.teacher.user.id, {
          type: "course_request_status",
          title: "Demande de cours annulée",
          message: `Une demande de cours en ${details.subject} a été annulée.`,
          link: "/dashboard/professeur",
        });
      }
      if (status === "cancelled") {
        await notifyAdmins({
          type: "course_request_status",
          title: "Demande annulée",
          message: `Une demande de cours en ${details?.subject || "cours"} a été annulée par la famille.`,
          link: "/admin",
        });
      }

      res.json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    res.json(await storage.getUserNotifications(req.session.userId!));
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    res.json({ count: await storage.getUnreadNotificationCount(req.session.userId!) });
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(req.params.id, req.session.userId!);
    res.json({ message: "Notification lue" });
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    await storage.markAllNotificationsRead(req.session.userId!);
    res.json({ message: "Notifications lues" });
  });

  app.patch("/api/notifications/type/:type/read", requireAuth, async (req, res) => {
    await storage.markNotificationsReadByType(req.session.userId!, req.params.type);
    res.json({ message: "Notifications lues" });
  });

  app.post("/api/notifications/message", requireAuth, async (req, res, next) => {
    try {
      const data = z
        .object({
          recipientUserId: z.string().min(1),
          message: z.string().trim().max(300).optional(),
        })
        .parse(req.body);
      if (data.recipientUserId === req.session.userId) {
        return res.json({ message: "Notification ignorée" });
      }
      const sender = await storage.getUser(req.session.userId!);
      const recipient = await storage.getUser(data.recipientUserId);
      if (!sender || !recipient || recipient.status !== "approved") {
        return res.status(404).json({ message: "Destinataire introuvable." });
      }
      await notifyUser(data.recipientUserId, {
        type: "message",
        title: "Nouveau message",
        message: data.message ? `Message reçu : ${data.message}` : "Vous avez reçu un nouveau message.",
        link: "/messages",
      });
      res.status(201).json({ message: "Notification créée" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Reviews API
  app.get("/api/teachers/:id/reviews", async (req, res) => {
    const reviews = await storage.getTeacherReviews(req.params.id);
    res.json(reviews);
  });

  app.post("/api/teachers/:id/reviews", requireAuth, async (req, res) => {
    try {
      const data = insertReviewSchema.parse({
        ...req.body,
        teacherId: req.params.id,
        reviewerId: req.session.userId,
      });
      const review = await storage.createReview(data);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Données d'avis invalides" });
    }
  });

  // Favorites API
  app.get("/api/favorites", requireAuth, async (req, res) => {
    const favorites = await storage.getUserFavoriteDetails(req.session.userId!);
    res.json(favorites);
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const { teacherId } = z.object({ teacherId: z.string() }).parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      if (!user || !["student", "parent"].includes(user.role)) {
        return res.status(403).json({ message: "Seuls les élèves et parents peuvent ajouter des favoris." });
      }
      const teacher = await storage.getTeacher(teacherId);
      const teacherUser = teacher ? await storage.getUser(teacher.userId) : undefined;
      if (!teacher || !teacherUser || teacherUser.status !== "approved") {
        return res.status(404).json({ message: "Professeur indisponible." });
      }
      const favorite = await storage.addFavorite(req.session.userId!, teacherId);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Identifiant enseignant invalide" });
    }
  });

  app.delete("/api/favorites/:teacherId", requireAuth, async (req, res) => {
    await storage.removeFavorite(req.session.userId!, req.params.teacherId);
    res.sendStatus(200);
  });

  app.post("/api/register/student", async (req, res) => {
    try {
      const data = studentRegistrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByPhone(data.phone);
      if (existingUser) {
        return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
      }
      if (data.email) {
        const existingEmail = await storage.getUserByEmail(data.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
      }

      const user = await storage.createUser({
        email: data.email || null,
        phone: data.phone,
        password: data.password,
        role: "student",
      });

      await storage.createStudent({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        level: data.level,
        subjects: data.subjects.join(","),
        courseType: data.courseType,
      });

      try {
        await sendPasswordSetupEmail(user.id, user.email);
      } catch (emailError) {
        console.error("Email de configuration de mot de passe échoué:", emailError);
      }

      res.status(201).json({
        message:
          "Inscription réussie. Un email vous a été envoyé pour définir votre mot de passe. Votre compte est en attente de validation par l'administrateur.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/register/parent", async (req, res) => {
    try {
      const data = parentRegistrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByPhone(data.phone);
      if (existingUser) {
        return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
      }
      if (data.email) {
        const existingEmail = await storage.getUserByEmail(data.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
      }

      const user = await storage.createUser({
        email: data.email || null,
        phone: data.phone,
        password: data.password,
        role: "parent",
      });

      const parent = await storage.createParent({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
      });

      for (const child of data.children) {
        await storage.createChild({
          parentId: parent.id,
          firstName: child.firstName,
          lastName: child.lastName,
          level: child.level,
          subjects: child.subjects.join(","),
        });
      }

      try {
        await sendPasswordSetupEmail(user.id, user.email);
      } catch (emailError) {
        console.error("Email de configuration de mot de passe échoué:", emailError);
      }

      res.status(201).json({
        message:
          "Inscription réussie. Un email vous a été envoyé pour définir votre mot de passe. Votre compte est en attente de validation par l'administrateur.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/register/teacher", async (req, res) => {
    try {
      const data = teacherRegistrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByPhone(data.phone);
      if (existingUser) {
        return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
      }
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const user = await storage.createUser({
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "teacher",
      });

      await storage.createTeacher({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        subjects: data.subjects.join(","),
        levels: data.levels.join(","),
        diploma: data.diploma,
        experience: data.experience || null,
        availability: data.availability,
        courseType: data.courseType,
        bio: data.bio || null,
      });

      try {
        await sendPasswordSetupEmail(user.id, user.email);
      } catch (emailError) {
        console.error("Email de configuration de mot de passe échoué:", emailError);
      }

      res.status(201).json({
        message:
          "Inscription réussie. Un email vous a été envoyé pour définir votre mot de passe. Votre profil est en attente de validation par l'administrateur.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const rawIdentifier = (data.identifier || data.phone || "").trim();
      if (!rawIdentifier) {
        return res.status(400).json({ message: "Email ou téléphone requis" });
      }

      const user = rawIdentifier.includes("@")
        ? await storage.getUserByEmail(rawIdentifier)
        : await storage.getUserByPhone(rawIdentifier);
      if (!user || !(await verifyPassword(data.password, user.password))) {
        return res.status(401).json({ message: "Email/téléphone ou mot de passe incorrect" });
      }

      if (!isPasswordHash(user.password)) {
        await storage.updateUserPassword(user.id, data.password, user.mustChangePassword ?? false);
      }

      if (user.status === "pending" && user.role !== "admin") {
        return res.status(403).json({ message: "Votre compte est en attente de validation par l'administrateur." });
      }

      if (user.status === "rejected") {
        return res.status(403).json({ message: "Votre compte a été rejeté. Contactez l'administrateur pour plus d'informations." });
      }

      if (user.status === "suspended" && user.role !== "admin") {
        return res.status(403).json({ message: "Votre compte est suspendu. Contactez l'administrateur pour réactiver votre accès." });
      }

      req.session.userId = user.id;
      
      res.json({
        message: "Connexion réussie",
        token: createAuthToken(user.id, sessionSecret),
        user: { 
          id: user.id, 
          role: user.role, 
          mustChangePassword: user.mustChangePassword 
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { identifier } = req.body as { identifier?: string };
      const rawIdentifier = (identifier || "").trim();
      if (!rawIdentifier) {
        return res.status(400).json({ message: "Email ou téléphone requis" });
      }

      const user = rawIdentifier.includes("@")
        ? await storage.getUserByEmail(rawIdentifier)
        : await storage.getUserByPhone(rawIdentifier);

      if (user?.email) {
        try {
          await sendPasswordSetupEmail(user.id, user.email);
        } catch (emailError) {
          console.error("Email de réinitialisation échoué:", emailError);
        }
      }

      res.json({ message: "Si le compte existe, un email a été envoyé." });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la demande" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body as {
        token?: string;
        newPassword?: string;
      };

      if (!token || !newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Token ou mot de passe invalide" });
      }

      const resetToken = await storage.getValidPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Lien invalide ou expiré" });
      }

      await storage.updateUserPassword(resetToken.userId, newPassword, false);
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
    }
  });

  app.post("/api/change-password", requireAuth, async (req, res) => {
    try {
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      await storage.updateUserPassword(req.session.userId!, newPassword, false);
      
      res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ message: "Déconnexion réussie" });
    });
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let profile = null;
    let children = null;

    if (user.role === "student") {
      profile = await storage.getStudentByUserId(user.id);
    } else if (user.role === "parent") {
      profile = await storage.getParentByUserId(user.id);
      if (profile) {
        children = await storage.getChildrenByParentId(profile.id);
      }
    } else if (user.role === "teacher") {
      profile = await storage.getTeacherByUserId(user.id);

      // Calculate profile completion for teachers
      if (profile) {
        let completion = 0;
        if (user.avatarUrl) completion += 20;
        if (profile.bio) completion += 20;
        if (profile.diploma) completion += 20;
        if (profile.availability) completion += 20;
        if (profile.subjects && profile.subjects.length > 0) completion += 20;

        if (user.profileCompletion !== completion) {
          await storage.updateUserCompletion(user.id, completion);
          user.profileCompletion = completion;
        }
      }
    }

    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone, 
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        profileHeadline: user.profileHeadline,
        profileBio: user.profileBio,
        profileCompletion: user.profileCompletion,
        isVerified: user.isVerified,
        mustChangePassword: user.mustChangePassword
      },
      profile,
      children
    });

  });

  app.get("/api/teacher/engagement-stats", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Accès réservé aux professeurs." });
    }
    const teacher = await storage.getTeacherByUserId(user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Profil professeur introuvable." });
    }
    res.json(await storage.getTeacherEngagementStats(teacher.id));
  });

  app.get("/api/teachers", async (req, res) => {
    const { city, subject, level } = req.query;
    let teachers = await storage.getApprovedTeachers();

    if (city && city !== "all") {
      teachers = teachers.filter((t) => t.city === city);
    }

    if (subject && subject !== "all") {
      teachers = teachers.filter((t) =>
        t.subjects.toLowerCase().includes((subject as string).toLowerCase())
      );
    }

    if (level && level !== "all") {
      teachers = teachers.filter((t) =>
        t.levels.toLowerCase().includes((level as string).toLowerCase())
      );
    }

    const result = teachers.map(t => ({
      ...t,
      user: {
        id: t.user.id,
        avatarUrl: t.user.avatarUrl,
        profileHeadline: t.user.profileHeadline,
        profileBio: t.user.profileBio,
        isVerified: t.user.isVerified,
        role: t.user.role,
        status: t.user.status,
      }
    }));

    res.json(result);
  });

  app.get("/api/teachers/:id", async (req, res) => {
    const teacher = (await storage.getApprovedTeachers()).find((item) => item.id === req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Professeur introuvable" });
    }

    res.json({
      ...teacher,
      user: {
        id: teacher.user.id,
        avatarUrl: teacher.user.avatarUrl,
        profileHeadline: teacher.user.profileHeadline,
        profileBio: teacher.user.profileBio,
        isVerified: teacher.user.isVerified,
        role: teacher.user.role,
        status: teacher.user.status,
      },
    });
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/course-requests", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllCourseRequestDetails());
  });

  app.get("/api/admin/pending-users", requireAdmin, async (req, res) => {
    const pendingUsers = await storage.getPendingUsers();
    const result: unknown[] = [];
    
    for (const user of pendingUsers) {
      let profile = null;
      let children = null;
      
      if (user.role === "student") {
        profile = await storage.getStudentByUserId(user.id);
      } else if (user.role === "parent") {
        profile = await storage.getParentByUserId(user.id);
        if (profile) {
          children = await storage.getChildrenByParentId(profile.id);
        }
      } else if (user.role === "teacher") {
        profile = await storage.getTeacherByUserId(user.id);

        // Calculate profile completion for teachers
        if (profile) {
          let completion = 0;
          if (user.avatarUrl) completion += 20;
          if (profile.bio) completion += 20;
          if (profile.diploma) completion += 20;
          if (profile.availability) completion += 20;
          if (profile.subjects && profile.subjects.length > 0) completion += 20;

          if (user.profileCompletion !== completion) {
            await storage.updateUserCompletion(user.id, completion);
            user.profileCompletion = completion;
          }
        }
      }

      result.push({
        user: { 
          id: user.id, 
          email: user.email, 
          phone: user.phone, 
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
          profileCompletion: user.profileCompletion,
          isVerified: user.isVerified,
          mustChangePassword: user.mustChangePassword
        },
        profile,
        children
      });

    }
    
    res.json(result);
  });

  async function getUserProfileSummary(user: Awaited<ReturnType<typeof storage.getUser>>) {
    if (!user) {
      return { firstName: "", lastName: "", fullName: "" };
    }

    let profile:
      | Awaited<ReturnType<typeof storage.getStudentByUserId>>
      | Awaited<ReturnType<typeof storage.getParentByUserId>>
      | Awaited<ReturnType<typeof storage.getTeacherByUserId>>
      | undefined;

    if (user.role === "student") {
      profile = await storage.getStudentByUserId(user.id);
    } else if (user.role === "parent") {
      profile = await storage.getParentByUserId(user.id);
    } else if (user.role === "teacher") {
      profile = await storage.getTeacherByUserId(user.id);
    }

    const firstName = profile && "firstName" in profile ? profile.firstName : "";
    const lastName = profile && "lastName" in profile ? profile.lastName : "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || user.phone;

    return { firstName: firstName || fullName, lastName, fullName };
  }

  async function getMessagingUserSummary(user: User) {
    const profile = await getUserProfileSummary(user);
    return {
      id: user.id,
      name: profile.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profileHeadline: user.profileHeadline,
      isVerified: user.isVerified,
    };
  }

  app.get("/api/users/search", requireAuth, async (req, res) => {
    const query = String(req.query.q || "").trim().toLowerCase();
    const currentUserId = req.session.userId!;
    const users = (await storage.getApprovedUsers()).filter((user) => user.id !== currentUserId);
    const summaries = await Promise.all(users.map((user) => getMessagingUserSummary(user)));
    const filtered = summaries
      .filter((user) => {
        if (!query) return true;
        return (
          user.name.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.profileHeadline || "").toLowerCase().includes(query)
        );
      })
      .slice(0, 25);
    res.json(filtered);
  });

  app.get("/api/users/:id/public", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user || user.status !== "approved") {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    if (user.id === req.session.userId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer un message." });
    }
    res.json(await getMessagingUserSummary(user));
  });

  const updateUserStatusSchema = z.object({
    status: z.enum(["approved", "rejected", "suspended"]),
    emailSubject: z.string().trim().max(180).optional(),
    emailMessage: z.string().trim().max(5000).optional(),
    sendApprovalEmail: z.boolean().optional(),
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = updateUserStatusSchema.parse(req.body);

      if (id === req.session.userId && data.status !== "approved") {
        return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre accès." });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (data.status === "approved" && user.status === "pending") {
        const tempPassword = generateTemporaryPassword();
        await storage.updateUserPassword(id, tempPassword, true);
        await storage.updateUserStatus(id, data.status);

        const profile = await getUserProfileSummary(user);
        const identifier = user.email || user.phone;
        const templateVariables = {
          prenom: profile.firstName,
          firstName: profile.firstName,
          nom: profile.lastName,
          lastName: profile.lastName,
          nomComplet: profile.fullName,
          fullName: profile.fullName,
          email: user.email || "",
          telephone: user.phone,
          phone: user.phone,
          identifiant: identifier,
          motDePasse: tempPassword,
          password: tempPassword,
          lienConnexion: getLoginUrl(),
          loginUrl: getLoginUrl(),
          role: getRoleLabel(user.role),
        };
        const subject = replaceTemplateVariables(
          data.emailSubject || defaultApprovalEmailSubject,
          templateVariables
        );
        const message = replaceTemplateVariables(
          data.emailMessage || defaultApprovalEmailMessage,
          templateVariables
        );
        let emailSent = false;
        let emailError: string | undefined;

        if (data.sendApprovalEmail !== false && user.email) {
          try {
            await sendApprovalEmail({
              to: user.email,
              subject,
              message,
            });
            emailSent = true;
          } catch (error) {
            console.error("Email d'approbation échoué:", error);
            emailError = "Le compte est approuvé, mais l'email n'a pas pu être envoyé.";
          }
        } else if (!user.email) {
          emailError = "Le compte est approuvé, mais aucun email n'est associé à ce compte.";
        }

        await notifyUser(id, {
          type: "account_approved",
          title: "Compte approuvé",
          message: "Votre compte ProfGui est approuvé. Vous pouvez maintenant utiliser votre espace.",
          link: getCourseRequestDashboardLink(user.role),
        });

        res.json({
          message: "Utilisateur approuvé",
          tempPassword,
          userEmail: user.email,
          userPhone: user.phone,
          emailSent,
          emailError,
        });
        return;
      }

      await storage.updateUserStatus(id, data.status);
      await notifyUser(id, {
        type: data.status === "suspended" ? "account_suspended" : data.status === "approved" ? "account_reactivated" : "account_rejected",
        title:
          data.status === "suspended"
            ? "Accès suspendu"
            : data.status === "approved"
              ? "Accès réactivé"
              : "Compte rejeté",
        message:
          data.status === "suspended"
            ? "Votre accès ProfGui a été suspendu. Contactez l'administration si besoin."
            : data.status === "approved"
              ? "Votre accès ProfGui a été réactivé."
              : "Votre inscription ProfGui a été rejetée.",
        link: getCourseRequestDashboardLink(user.role),
      });
      const messages = {
        approved: "Accès réactivé",
        rejected: "Utilisateur rejeté",
        suspended: "Accès suspendu",
      };
      res.json({ message: messages[data.status], status: data.status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.get("/api/admin/students", requireAdmin, async (req, res) => {
    const students = await storage.getAllStudents();
    const result: unknown[] = [];
    
    for (const student of students) {
      const user = await storage.getUser(student.userId);
      result.push({ ...student, user });
    }
    
    res.json(result);
  });

  app.get("/api/admin/parents", requireAdmin, async (req, res) => {
    const parents = await storage.getAllParents();
    const result: unknown[] = [];
    
    for (const parent of parents) {
      const user = await storage.getUser(parent.userId);
      const children = await storage.getChildrenByParentId(parent.id);
      result.push({ ...parent, user, children });
    }
    
    res.json(result);
  });

  app.get("/api/admin/teachers", requireAdmin, async (req, res) => {
    const teachers = await storage.getAllTeachers();
    const result: unknown[] = [];
    
    for (const teacher of teachers) {
      const user = await storage.getUser(teacher.userId);
      const engagement = await storage.getTeacherEngagementStats(teacher.id);
      result.push({ ...teacher, user, engagement });
    }
    
    res.json(result);
  });

  app.delete("/api/admin/students/:id", requireAdmin, async (req, res) => {
    await storage.deleteUserByProfileId("students", req.params.id);
    res.json({ message: "Compte supprimé" });
  });

  app.delete("/api/admin/parents/:id", requireAdmin, async (req, res) => {
    await storage.deleteUserByProfileId("parents", req.params.id);
    res.json({ message: "Compte supprimé" });
  });

  app.delete("/api/admin/teachers/:id", requireAdmin, async (req, res) => {
    await storage.deleteUserByProfileId("teachers", req.params.id);
    res.json({ message: "Compte supprimé" });
  });

  return httpServer;
}
