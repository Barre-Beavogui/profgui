import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import {
  studentRegistrationSchema,
  parentRegistrationSchema,
  teacherRegistrationSchema,
  loginSchema,
} from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedAdmin();
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "profgui-secret-key-dev",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/register/student", async (req, res) => {
    try {
      const data = studentRegistrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByPhone(data.phone);
      if (existingUser) {
        return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
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

      res.status(201).json({ message: "Inscription réussie. Votre compte est en attente de validation par l'administrateur." });
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

      res.status(201).json({ message: "Inscription réussie. Votre compte est en attente de validation par l'administrateur." });
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

      res.status(201).json({ message: "Inscription réussie. Votre profil est en attente de validation par l'administrateur." });
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
      
      const user = await storage.getUserByPhone(data.phone);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Téléphone ou mot de passe incorrect" });
      }

      if (user.status === "pending" && user.role !== "admin") {
        return res.status(403).json({ message: "Votre compte est en attente de validation par l'administrateur." });
      }

      if (user.status === "rejected") {
        return res.status(403).json({ message: "Votre compte a été rejeté. Contactez l'administrateur pour plus d'informations." });
      }

      req.session.userId = user.id;
      
      res.json({
        message: "Connexion réussie",
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
    }

    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone, 
        role: user.role,
        status: user.status,
        mustChangePassword: user.mustChangePassword
      },
      profile,
      children,
    });
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

    res.json(teachers);
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/pending-users", requireAdmin, async (req, res) => {
    const pendingUsers = await storage.getPendingUsers();
    const result = [];
    
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
      }
      
      result.push({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        profile,
        children,
      });
    }
    
    res.json(result);
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (status === "approved") {
      const tempPassword = generateTemporaryPassword();
      await storage.updateUserPassword(id, tempPassword, true);
      await storage.updateUserStatus(id, status);
      
      res.json({ 
        message: "Utilisateur approuvé", 
        tempPassword,
        userEmail: user.email,
        userPhone: user.phone
      });
    } else {
      await storage.updateUserStatus(id, status);
      res.json({ message: "Utilisateur rejeté" });
    }
  });

  app.get("/api/admin/students", requireAdmin, async (req, res) => {
    const students = await storage.getAllStudents();
    const result = [];
    
    for (const student of students) {
      const user = await storage.getUser(student.userId);
      result.push({ ...student, user });
    }
    
    res.json(result);
  });

  app.get("/api/admin/parents", requireAdmin, async (req, res) => {
    const parents = await storage.getAllParents();
    const result = [];
    
    for (const parent of parents) {
      const user = await storage.getUser(parent.userId);
      const children = await storage.getChildrenByParentId(parent.id);
      result.push({ ...parent, user, children });
    }
    
    res.json(result);
  });

  app.get("/api/admin/teachers", requireAdmin, async (req, res) => {
    const teachers = await storage.getAllTeachers();
    const result = [];
    
    for (const teacher of teachers) {
      const user = await storage.getUser(teacher.userId);
      result.push({ ...teacher, user });
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
