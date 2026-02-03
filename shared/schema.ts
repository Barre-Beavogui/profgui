import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const EDUCATION_LEVELS = [
  "1ère année",
  "2ème année", 
  "3ème année",
  "4ème année",
  "5ème année",
  "6ème année",
  "7ème année",
  "8ème année",
  "9ème année",
  "10ème année",
  "11ème année",
  "12ème année / Terminale",
  "Licence 1 (L1)",
  "Licence 2 (L2)",
  "Licence 3 (L3)",
  "Master 1 (M1)",
  "Master 2 (M2)",
] as const;

export const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Anglais",
  "Physique-Chimie",
  "Sciences de la Vie et de la Terre",
  "Histoire-Géographie",
  "Philosophie",
  "Économie",
  "Informatique",
  "Arabe",
  "Éducation Civique",
  "Comptabilité",
  "Droit",
  "Gestion",
] as const;

export const CITIES = [
  "Conakry",
  "Kindia",
  "Boké",
  "Kankan",
  "Labé",
  "Mamou",
  "Faranah",
  "N'Zérékoré",
  "Siguiri",
  "Kissidougou",
] as const;

export const USER_ROLES = ["student", "parent", "teacher", "admin"] as const;
export const USER_STATUS = ["pending", "approved", "rejected"] as const;
export const COURSE_TYPE = ["domicile", "en_ligne", "les_deux"] as const;

export const ADMIN_WHATSAPP = "+224629516388";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email"),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<typeof USER_ROLES[number]>(),
  status: text("status").notNull().$type<typeof USER_STATUS[number]>().default("pending"),
  mustChangePassword: boolean("must_change_password").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  level: text("level").notNull(),
  subjects: text("subjects").notNull(),
  courseType: text("course_type").notNull().$type<typeof COURSE_TYPE[number]>(),
});

export const parents = pgTable("parents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address").notNull(),
});

export const children = pgTable("children", {
  id: varchar("id", { length: 36 }).primaryKey(),
  parentId: varchar("parent_id", { length: 36 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  level: text("level").notNull(),
  subjects: text("subjects").notNull(),
});

export const teachers = pgTable("teachers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  subjects: text("subjects").notNull(),
  levels: text("levels").notNull(),
  diploma: text("diploma").notNull(),
  experience: text("experience"),
  availability: text("availability").notNull(),
  courseType: text("course_type").notNull().$type<typeof COURSE_TYPE[number]>(),
  bio: text("bio"),
});

export const courseRequests = pgTable("course_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  studentId: varchar("student_id", { length: 36 }),
  childId: varchar("child_id", { length: 36 }),
  parentId: varchar("parent_id", { length: 36 }),
  teacherId: varchar("teacher_id", { length: 36 }),
  subject: text("subject").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertParentSchema = createInsertSchema(parents).omit({ id: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertCourseRequestSchema = createInsertSchema(courseRequests).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parents.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertCourseRequest = z.infer<typeof insertCourseRequestSchema>;
export type CourseRequest = typeof courseRequests.$inferSelect;

export const studentRegistrationSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  city: z.string().min(1, "Veuillez sélectionner une ville"),
  level: z.string().min(1, "Veuillez sélectionner un niveau"),
  subjects: z.array(z.string()).min(1, "Veuillez sélectionner au moins une matière"),
  courseType: z.enum(["domicile", "en_ligne", "les_deux"]),
});

export const parentRegistrationSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  address: z.string().min(5, "Adresse invalide"),
  children: z.array(z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    level: z.string().min(1, "Veuillez sélectionner un niveau"),
    subjects: z.array(z.string()).min(1, "Veuillez sélectionner au moins une matière"),
  })).min(1, "Veuillez ajouter au moins un enfant"),
});

export const teacherRegistrationSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  city: z.string().min(1, "Veuillez sélectionner une ville"),
  subjects: z.array(z.string()).min(1, "Veuillez sélectionner au moins une matière"),
  levels: z.array(z.string()).min(1, "Veuillez sélectionner au moins un niveau"),
  diploma: z.string().min(2, "Veuillez indiquer votre diplôme"),
  experience: z.string().optional(),
  availability: z.string().min(5, "Veuillez indiquer vos disponibilités"),
  courseType: z.enum(["domicile", "en_ligne", "les_deux"]),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;
export type ParentRegistration = z.infer<typeof parentRegistrationSchema>;
export type TeacherRegistration = z.infer<typeof teacherRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
