import { pgTable, text, varchar, boolean, timestamp, integer, uniqueIndex, index, json } from "drizzle-orm/pg-core";
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
export const USER_STATUS = ["pending", "approved", "rejected", "suspended"] as const;
export const COURSE_TYPE = ["domicile", "en_ligne", "les_deux"] as const;

export const ADMIN_WHATSAPP = "+224629516388";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email"),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<typeof USER_ROLES[number]>(),
  status: text("status").notNull().$type<typeof USER_STATUS[number]>().default("pending"),
  avatarUrl: text("avatar_url"),
  profileHeadline: text("profile_headline"),
  profileBio: text("profile_bio"),
  profileCompletion: integer("profile_completion").default(0),
  isVerified: boolean("is_verified").default(false),
  mustChangePassword: boolean("must_change_password").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_unique").on(table.email),
  phoneIdx: uniqueIndex("users_phone_unique").on(table.phone),
}));

export const students = pgTable("students", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  level: text("level").notNull(),
  subjects: text("subjects").notNull(),
  courseType: text("course_type").notNull().$type<typeof COURSE_TYPE[number]>(),
  learningObjectives: text("learning_objectives"),
});

export const parents = pgTable("parents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address").notNull(),
});

export const children = pgTable("children", {
  id: varchar("id", { length: 36 }).primaryKey(),
  parentId: varchar("parent_id", { length: 36 }).notNull().references(() => parents.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  level: text("level").notNull(),
  subjects: text("subjects").notNull(),
});

export const teachers = pgTable("teachers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
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
  teachingMethods: text("teaching_methods"),
  yearsOfExperience: integer("years_of_experience").default(0),
  views: integer("views").default(0),
  responseRate: integer("response_rate").default(100),
  averageRating: text("average_rating").default("0"),
  totalReviews: integer("total_reviews").default(0),
  hourlyRate: integer("hourly_rate"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  teacherId: varchar("teacher_id", { length: 36 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  criteria: text("criteria"), // JSON stringified: {pedagogy, punctuality, communication, subjectMastery}
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id", { length: 36 }).notNull().references(() => teachers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userTeacherIdx: uniqueIndex("favorites_user_teacher_unique").on(table.userId, table.teacherId),
}));

export const courseRequests = pgTable("course_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  studentId: varchar("student_id", { length: 36 }).references(() => students.id, { onDelete: "cascade" }),
  childId: varchar("child_id", { length: 36 }).references(() => children.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id", { length: 36 }).references(() => parents.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id", { length: 36 }).references(() => teachers.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
}, (table) => ({
  expireIdx: index("IDX_session_expire").on(table.expire),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertParentSchema = createInsertSchema(parents).omit({ id: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertCourseRequestSchema = createInsertSchema(courseRequests).omit({ id: true, createdAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });

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
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertCourseRequest = z.infer<typeof insertCourseRequestSchema>;
export type CourseRequest = typeof courseRequests.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

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

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Mot de passe requis"),
  })
  .refine(
    (data) => !!(data.identifier?.trim() || data.phone?.trim()),
    {
      message: "Veuillez saisir un email ou un téléphone",
      path: ["identifier"],
    }
  );

export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;
export type ParentRegistration = z.infer<typeof parentRegistrationSchema>;
export type TeacherRegistration = z.infer<typeof teacherRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
