import {
  users,
  students,
  parents,
  children,
  teachers,
  courseRequests,
  type User,
  type InsertUser,
  type Student,
  type InsertStudent,
  type Parent,
  type InsertParent,
  type Child,
  type InsertChild,
  type Teacher,
  type InsertTeacher,
  type CourseRequest,
  type InsertCourseRequest,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: "approved" | "rejected"): Promise<User | undefined>;
  updateUserPassword(id: string, password: string, mustChangePassword?: boolean): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  getApprovedUsers(): Promise<User[]>;
  
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  getParent(id: string): Promise<Parent | undefined>;
  getParentByUserId(userId: string): Promise<Parent | undefined>;
  getAllParents(): Promise<Parent[]>;
  createParent(parent: InsertParent): Promise<Parent>;
  deleteParent(id: string): Promise<void>;
  
  getChildrenByParentId(parentId: string): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  deleteChildrenByParentId(parentId: string): Promise<void>;
  
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  getApprovedTeachers(): Promise<(Teacher & { user: User })[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;
  
  createCourseRequest(request: InsertCourseRequest): Promise<CourseRequest>;
  getCourseRequests(): Promise<CourseRequest[]>;
  
  getStats(): Promise<{
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    pendingUsers: number;
  }>;
  
  deleteUserByProfileId(type: "students" | "parents" | "teachers", id: string): Promise<void>;
  
  seedAdmin(): Promise<void>;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const normalized = normalizePhone(phone);
    const result = await db.select().from(users).where(
      sql`RIGHT(REGEXP_REPLACE(${users.phone}, '[^0-9]', '', 'g'), 9) = ${normalized}`
    );
    return result[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ 
        id,
        email: insertUser.email,
        phone: insertUser.phone,
        password: insertUser.password,
        role: insertUser.role as "student" | "parent" | "teacher" | "admin",
        status: "pending" as const,
        mustChangePassword: false,
      })
      .returning();
    return user;
  }

  async updateUserStatus(id: string, status: "approved" | "rejected"): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserPassword(id: string, password: string, mustChangePassword: boolean = false): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password, mustChangePassword })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "pending"));
  }

  async getApprovedUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "approved"));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const [student] = await db
      .insert(students)
      .values({
        id,
        userId: insertStudent.userId,
        firstName: insertStudent.firstName,
        lastName: insertStudent.lastName,
        city: insertStudent.city,
        level: insertStudent.level,
        subjects: insertStudent.subjects,
        courseType: insertStudent.courseType as "domicile" | "en_ligne" | "les_deux",
      })
      .returning();
    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    const student = await this.getStudent(id);
    if (student) {
      await db.delete(students).where(eq(students.id, id));
      await db.delete(users).where(eq(users.id, student.userId));
    }
  }

  async getParent(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent || undefined;
  }

  async getParentByUserId(userId: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.userId, userId));
    return parent || undefined;
  }

  async getAllParents(): Promise<Parent[]> {
    return await db.select().from(parents);
  }

  async createParent(insertParent: InsertParent): Promise<Parent> {
    const id = randomUUID();
    const [parent] = await db
      .insert(parents)
      .values({ ...insertParent, id })
      .returning();
    return parent;
  }

  async deleteParent(id: string): Promise<void> {
    const parent = await this.getParent(id);
    if (parent) {
      await this.deleteChildrenByParentId(id);
      await db.delete(parents).where(eq(parents.id, id));
      await db.delete(users).where(eq(users.id, parent.userId));
    }
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const id = randomUUID();
    const [child] = await db
      .insert(children)
      .values({ ...insertChild, id })
      .returning();
    return child;
  }

  async deleteChildrenByParentId(parentId: string): Promise<void> {
    await db.delete(children).where(eq(children.parentId, parentId));
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher || undefined;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async getApprovedTeachers(): Promise<(Teacher & { user: User })[]> {
    const allTeachers = await db.select().from(teachers);
    const result: (Teacher & { user: User })[] = [];
    
    for (const teacher of allTeachers) {
      const user = await this.getUser(teacher.userId);
      if (user && user.status === "approved") {
        result.push({ ...teacher, user });
      }
    }
    
    return result;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const [created] = await db
      .insert(teachers)
      .values({
        id,
        userId: teacher.userId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        city: teacher.city,
        subjects: teacher.subjects,
        levels: teacher.levels,
        diploma: teacher.diploma,
        experience: teacher.experience,
        availability: teacher.availability,
        courseType: teacher.courseType as "domicile" | "en_ligne" | "les_deux",
        bio: teacher.bio,
      })
      .returning();
    return created;
  }

  async deleteTeacher(id: string): Promise<void> {
    const teacher = await this.getTeacher(id);
    if (teacher) {
      await db.delete(teachers).where(eq(teachers.id, id));
      await db.delete(users).where(eq(users.id, teacher.userId));
    }
  }

  async createCourseRequest(insertRequest: InsertCourseRequest): Promise<CourseRequest> {
    const id = randomUUID();
    const [request] = await db
      .insert(courseRequests)
      .values({ ...insertRequest, id })
      .returning();
    return request;
  }

  async getCourseRequests(): Promise<CourseRequest[]> {
    return await db.select().from(courseRequests);
  }

  async getStats(): Promise<{
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    pendingUsers: number;
  }> {
    const [studentCount] = await db.select({ count: count() }).from(students);
    const [parentCount] = await db.select({ count: count() }).from(parents);
    const [teacherCount] = await db.select({ count: count() }).from(teachers);
    const [pendingCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "pending"));

    return {
      totalStudents: studentCount?.count || 0,
      totalParents: parentCount?.count || 0,
      totalTeachers: teacherCount?.count || 0,
      pendingUsers: pendingCount?.count || 0,
    };
  }

  async deleteUserByProfileId(type: "students" | "parents" | "teachers", id: string): Promise<void> {
    if (type === "students") {
      await this.deleteStudent(id);
    } else if (type === "parents") {
      await this.deleteParent(id);
    } else if (type === "teachers") {
      await this.deleteTeacher(id);
    }
  }

  async seedAdmin(): Promise<void> {
    const normalized = normalizePhone("620000000");
    const result = await db.select().from(users).where(
      sql`RIGHT(REGEXP_REPLACE(${users.phone}, '[^0-9]', '', 'g'), 9) = ${normalized}`
    );
    if (!result[0]) {
      const id = randomUUID();
      await db.insert(users).values({
        id,
        email: "admin@profgui.com",
        phone: "620000000",
        password: "admin123",
        role: "admin",
        status: "approved",
      });
    }
  }
}

export const storage = new DatabaseStorage();
