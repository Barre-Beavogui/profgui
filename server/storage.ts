import {
  users,
  students,
  parents,
  children,
  teachers,
  reviews,
  favorites,
  courseRequests,
  notifications,
  chatMessages,
  passwordResetTokens,
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
  type Review,
  type InsertReview,
  type Favorite,
  type CourseRequest,
  type InsertCourseRequest,
  type Notification,
  type InsertNotification,
  type ChatMessage,
  type PasswordResetToken,
  type InsertPasswordResetToken,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, sql, count, and, gt, isNull, desc, asc, inArray, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hashPassword, verifyPassword } from "./password";

export interface PublicUserSummary {
  id: string;
  email: string | null;
  phone: string;
  role: User["role"];
  status: User["status"];
  avatarUrl: string | null;
  profileHeadline: string | null;
  profileBio: string | null;
  isVerified: boolean | null;
  name: string;
}

export interface TeacherWithPublicUser extends Teacher {
  user: PublicUserSummary;
}

export interface FavoriteDetails extends Favorite {
  teacher: TeacherWithPublicUser | null;
}

export interface CourseRequestDetails extends CourseRequest {
  teacher: TeacherWithPublicUser | null;
  requester: PublicUserSummary | null;
  student: Student | null;
  parent: Parent | null;
  child: Child | null;
}

export interface TeacherEngagementStats {
  teacherId: string;
  studentsCount: number;
  parentsCount: number;
  activeCourses: number;
  completedCourses: number;
  pendingRequests: number;
  totalRequests: number;
}

export interface ChatMessageDetails extends ChatMessage {
  sender: PublicUserSummary | null;
  recipient: PublicUserSummary | null;
}

export interface ChatAttachment {
  type: "image" | "audio";
  url: string;
  contentType: string;
  fileName: string;
  size: number;
}

export interface CreateChatMessageInput {
  senderId: string;
  recipientId: string;
  text?: string | null;
  attachment?: ChatAttachment | null;
  readAt?: Date | null;
}

export interface ChatConversationSummary {
  id: string;
  otherUser: PublicUserSummary;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdWithEmail(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: User["status"]): Promise<User | undefined>;
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
  getCourseRequestDetails(id: string): Promise<CourseRequestDetails | undefined>;
  getCourseRequestsForUser(userId: string): Promise<CourseRequestDetails[]>;
  getAllCourseRequestDetails(): Promise<CourseRequestDetails[]>;
  updateCourseRequestStatus(id: string, status: CourseRequest["status"]): Promise<CourseRequest | undefined>;
  getTeacherEngagementStats(teacherId: string): Promise<TeacherEngagementStats>;
  getAllTeacherEngagementStats(): Promise<TeacherEngagementStats[]>;
  
  getStats(): Promise<{
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    pendingUsers: number;
    suspendedUsers: number;
  }>;
  
  deleteUserByProfileId(type: "students" | "parents" | "teachers", id: string): Promise<void>;
  
  updateUserAvatar(id: string, avatarUrl: string): Promise<User | undefined>;
  updateUserProfile(id: string, profile: { profileHeadline?: string | null; profileBio?: string | null }): Promise<User | undefined>;
  updateUserCompletion(id: string, completion: number): Promise<void>;
  
  createReview(review: InsertReview): Promise<Review>;
  getTeacherReviews(teacherId: string): Promise<Review[]>;
  updateTeacherRating(teacherId: string): Promise<void>;
  
  addFavorite(userId: string, teacherId: string): Promise<Favorite>;
  removeFavorite(userId: string, teacherId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<Favorite[]>;
  getUserFavoriteDetails(userId: string): Promise<FavoriteDetails[]>;

  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  markNotificationsReadByType(userId: string, type: string): Promise<void>;

  createChatMessage(message: CreateChatMessageInput): Promise<ChatMessageDetails>;
  getChatMessagesForConversation(userId: string, otherUserId: string): Promise<ChatMessageDetails[]>;
  getChatConversations(userId: string): Promise<ChatConversationSummary[]>;
  markConversationMessagesRead(userId: string, otherUserId: string): Promise<void>;
  
  seedAdmin(): Promise<void>;

  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class DatabaseStorage implements IStorage {
  private async getUserDisplayName(user: User): Promise<string> {
    let profile:
      | Student
      | Parent
      | Teacher
      | undefined;

    if (user.role === "student") {
      profile = await this.getStudentByUserId(user.id);
    } else if (user.role === "parent") {
      profile = await this.getParentByUserId(user.id);
    } else if (user.role === "teacher") {
      profile = await this.getTeacherByUserId(user.id);
    }

    if (profile && "firstName" in profile) {
      return `${profile.firstName} ${profile.lastName}`;
    }

    return user.email || user.phone;
  }

  private async toPublicUserSummary(user: User | undefined): Promise<PublicUserSummary | null> {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      profileHeadline: user.profileHeadline,
      profileBio: user.profileBio,
      isVerified: user.isVerified,
      name: await this.getUserDisplayName(user),
    };
  }

  private async getTeacherWithPublicUser(teacherId: string | null): Promise<TeacherWithPublicUser | null> {
    if (!teacherId) return null;
    const teacher = await this.getTeacher(teacherId);
    if (!teacher) return null;
    const user = await this.toPublicUserSummary(await this.getUser(teacher.userId));
    if (!user) return null;
    return { ...teacher, user };
  }

  private async toCourseRequestDetails(request: CourseRequest): Promise<CourseRequestDetails> {
    const requester = await this.toPublicUserSummary(
      request.requesterUserId ? await this.getUser(request.requesterUserId) : undefined
    );
    return {
      ...request,
      teacher: await this.getTeacherWithPublicUser(request.teacherId),
      requester,
      student: request.studentId ? await this.getStudent(request.studentId) || null : null,
      parent: request.parentId ? await this.getParent(request.parentId) || null : null,
      child: request.childId ? (await db.select().from(children).where(eq(children.id, request.childId)))[0] || null : null,
    };
  }

  private async toChatMessageDetails(message: ChatMessage): Promise<ChatMessageDetails> {
    return {
      ...message,
      sender: await this.toPublicUserSummary(await this.getUser(message.senderId)),
      recipient: await this.toPublicUserSummary(await this.getUser(message.recipientId)),
    };
  }

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = normalizeEmail(email);
    const result = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${normalized}`);
    return result[0] || undefined;
  }

  async getUserByIdWithEmail(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ 
        id,
        email: insertUser.email ? normalizeEmail(insertUser.email) : null,
        phone: insertUser.phone,
        password: await hashPassword(insertUser.password),
        role: insertUser.role as "student" | "parent" | "teacher" | "admin",
        status: "pending" as const,
        mustChangePassword: false,
      })
      .returning();
    return user;
  }

  async updateUserStatus(id: string, status: User["status"]): Promise<User | undefined> {
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
      .set({ password: await hashPassword(password), mustChangePassword })
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
      .values({
        id,
        requesterUserId: insertRequest.requesterUserId ?? null,
        studentId: insertRequest.studentId ?? null,
        childId: insertRequest.childId ?? null,
        parentId: insertRequest.parentId ?? null,
        teacherId: insertRequest.teacherId ?? null,
        subject: insertRequest.subject,
        level: insertRequest.level ?? null,
        courseType: insertRequest.courseType as CourseRequest["courseType"],
        requestedDate: insertRequest.requestedDate ?? null,
        requestedTime: insertRequest.requestedTime ?? null,
        message: insertRequest.message ?? null,
        status: (insertRequest.status ?? "pending") as CourseRequest["status"],
        updatedAt: new Date(),
      })
      .returning();
    return request;
  }

  async getCourseRequests(): Promise<CourseRequest[]> {
    return await db.select().from(courseRequests).orderBy(desc(courseRequests.createdAt));
  }

  async getCourseRequestDetails(id: string): Promise<CourseRequestDetails | undefined> {
    const [request] = await db.select().from(courseRequests).where(eq(courseRequests.id, id));
    return request ? await this.toCourseRequestDetails(request) : undefined;
  }

  async getCourseRequestsForUser(userId: string): Promise<CourseRequestDetails[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    let requests: CourseRequest[] = [];
    if (user.role === "teacher") {
      const teacher = await this.getTeacherByUserId(userId);
      if (teacher) {
        requests = await db
          .select()
          .from(courseRequests)
          .where(and(
            eq(courseRequests.teacherId, teacher.id),
            inArray(courseRequests.status, ["accepted", "completed"])
          ))
          .orderBy(desc(courseRequests.createdAt));
      }
    } else {
      requests = await db
        .select()
        .from(courseRequests)
        .where(eq(courseRequests.requesterUserId, userId))
        .orderBy(desc(courseRequests.createdAt));
    }

    return await Promise.all(requests.map((request) => this.toCourseRequestDetails(request)));
  }

  async getAllCourseRequestDetails(): Promise<CourseRequestDetails[]> {
    const requests = await this.getCourseRequests();
    return await Promise.all(requests.map((request) => this.toCourseRequestDetails(request)));
  }

  async updateCourseRequestStatus(id: string, status: CourseRequest["status"]): Promise<CourseRequest | undefined> {
    const [request] = await db
      .update(courseRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(courseRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getTeacherEngagementStats(teacherId: string): Promise<TeacherEngagementStats> {
    const requests = await db
      .select()
      .from(courseRequests)
      .where(eq(courseRequests.teacherId, teacherId));
    const assignedRequests = requests.filter((request) => ["accepted", "completed"].includes(request.status));
    const studentsSet = new Set<string>();
    const parentsSet = new Set<string>();

    for (const request of assignedRequests) {
      if (request.studentId) {
        studentsSet.add(`student:${request.studentId}`);
      }
      if (request.childId) {
        studentsSet.add(`child:${request.childId}`);
      }
      if (request.parentId) {
        parentsSet.add(request.parentId);
      }
    }

    return {
      teacherId,
      studentsCount: studentsSet.size,
      parentsCount: parentsSet.size,
      activeCourses: assignedRequests.filter((request) => request.status === "accepted").length,
      completedCourses: assignedRequests.filter((request) => request.status === "completed").length,
      pendingRequests: requests.filter((request) => request.status === "pending").length,
      totalRequests: requests.length,
    };
  }

  async getAllTeacherEngagementStats(): Promise<TeacherEngagementStats[]> {
    const allTeachers = await this.getAllTeachers();
    return await Promise.all(allTeachers.map((teacher) => this.getTeacherEngagementStats(teacher.id)));
  }

  async getStats(): Promise<{
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    pendingUsers: number;
    suspendedUsers: number;
  }> {
    const [studentCount] = await db.select({ count: count() }).from(students);
    const [parentCount] = await db.select({ count: count() }).from(parents);
    const [teacherCount] = await db.select({ count: count() }).from(teachers);
    const [pendingCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "pending"));
    const [suspendedCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "suspended"));

    return {
      totalStudents: studentCount?.count || 0,
      totalParents: parentCount?.count || 0,
      totalTeachers: teacherCount?.count || 0,
      pendingUsers: pendingCount?.count || 0,
      suspendedUsers: suspendedCount?.count || 0,
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

  async updateUserAvatar(id: string, avatarUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserProfile(
    id: string,
    profile: { profileHeadline?: string | null; profileBio?: string | null }
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        profileHeadline: profile.profileHeadline,
        profileBio: profile.profileBio,
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserCompletion(id: string, completion: number): Promise<void> {
    await db
      .update(users)
      .set({ profileCompletion: completion })
      .where(eq(users.id, id));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const [review] = await db
      .insert(reviews)
      .values({ ...insertReview, id })
      .returning();
    
    await this.updateTeacherRating(insertReview.teacherId);
    return review;
  }

  async getTeacherReviews(teacherId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.teacherId, teacherId));
  }

  async updateTeacherRating(teacherId: string): Promise<void> {
    const allReviews = await this.getTeacherReviews(teacherId);
    if (allReviews.length === 0) return;

    const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    
    await db
      .update(teachers)
      .set({ 
        averageRating: avg.toFixed(1),
        totalReviews: allReviews.length 
      })
      .where(eq(teachers.id, teacherId));
  }

  async addFavorite(userId: string, teacherId: string): Promise<Favorite> {
    const [existing] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.teacherId, teacherId)));
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const [favorite] = await db
      .insert(favorites)
      .values({ id, userId, teacherId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, teacherId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.teacherId, teacherId)));
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getUserFavoriteDetails(userId: string): Promise<FavoriteDetails[]> {
    const favoritesList = await this.getUserFavorites(userId);
    return await Promise.all(
      favoritesList.map(async (favorite) => ({
        ...favorite,
        teacher: await this.getTeacherWithPublicUser(favorite.teacherId),
      }))
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const [notification] = await db
      .insert(notifications)
      .values({ ...insertNotification, id })
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return result?.count || 0;
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  async markNotificationsReadByType(userId: string, type: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.type, type), isNull(notifications.readAt)));
  }

  async createChatMessage(insertMessage: CreateChatMessageInput): Promise<ChatMessageDetails> {
    const id = randomUUID();
    const attachment = insertMessage.attachment ?? null;
    const [message] = await db
      .insert(chatMessages)
      .values({
        id,
        senderId: insertMessage.senderId,
        recipientId: insertMessage.recipientId,
        text: insertMessage.text?.trim() || null,
        attachment,
        attachmentType: attachment?.type || "text",
        readAt: insertMessage.readAt ?? null,
      })
      .returning();
    return await this.toChatMessageDetails(message);
  }

  async getChatMessagesForConversation(userId: string, otherUserId: string): Promise<ChatMessageDetails[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        or(
          and(eq(chatMessages.senderId, userId), eq(chatMessages.recipientId, otherUserId)),
          and(eq(chatMessages.senderId, otherUserId), eq(chatMessages.recipientId, userId))
        )
      )
      .orderBy(asc(chatMessages.createdAt));

    return await Promise.all(messages.map((message) => this.toChatMessageDetails(message)));
  }

  async getChatConversations(userId: string): Promise<ChatConversationSummary[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(or(eq(chatMessages.senderId, userId), eq(chatMessages.recipientId, userId)))
      .orderBy(desc(chatMessages.createdAt));

    const unreadBySender = new Map<string, number>();
    for (const message of messages) {
      if (message.recipientId === userId && !message.readAt) {
        unreadBySender.set(message.senderId, (unreadBySender.get(message.senderId) || 0) + 1);
      }
    }

    const seen = new Set<string>();
    const conversations: ChatConversationSummary[] = [];
    for (const message of messages) {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      if (seen.has(otherUserId)) continue;
      seen.add(otherUserId);

      const otherUser = await this.toPublicUserSummary(await this.getUser(otherUserId));
      if (!otherUser) continue;

      conversations.push({
        id: [userId, otherUserId].sort().join("_"),
        otherUser,
        lastMessage: message,
        unreadCount: unreadBySender.get(otherUserId) || 0,
      });
    }

    return conversations;
  }

  async markConversationMessagesRead(userId: string, otherUserId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(chatMessages.senderId, otherUserId),
          eq(chatMessages.recipientId, userId),
          isNull(chatMessages.readAt)
        )
      );
  }

  async seedAdmin(): Promise<void> {
    const isProd = process.env.NODE_ENV === "production";
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (isProd && (!adminEmail || !adminPhone || !adminPassword)) {
      throw new Error("ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD must be set in production.");
    }

    const resolvedAdminEmail = adminEmail || "admin@profgui.local";
    const resolvedAdminPhone = adminPhone || "629516388";
    const resolvedAdminPassword = adminPassword || "change-me-dev-only";

    const normalizedPhone = normalizePhone(resolvedAdminPhone);
    const normalizedEmail = normalizeEmail(resolvedAdminEmail);
    const [emailMatch] = await db
      .select()
      .from(users)
      .where(sql`LOWER(COALESCE(${users.email}, '')) = ${normalizedEmail}`);
    const phoneMatches = await db.select().from(users).where(
      sql`RIGHT(REGEXP_REPLACE(${users.phone}, '[^0-9]', '', 'g'), 9) = ${normalizedPhone}`
    );
    const existingAdmin = emailMatch || phoneMatches[0];

    if (existingAdmin) {
      const updates: Partial<Pick<User, "email" | "phone" | "password" | "role" | "status" | "mustChangePassword">> = {};
      const emailConflict = emailMatch && emailMatch.id !== existingAdmin.id;
      const phoneConflict = phoneMatches.some((user) => user.id !== existingAdmin.id);

      if (existingAdmin.email !== normalizedEmail && !emailConflict) {
        updates.email = normalizedEmail;
      }
      if (normalizePhone(existingAdmin.phone) !== normalizedPhone && !phoneConflict) {
        updates.phone = resolvedAdminPhone;
      }
      if (existingAdmin.role !== "admin") {
        updates.role = "admin";
      }
      if (existingAdmin.status !== "approved") {
        updates.status = "approved";
      }
      if (!(await verifyPassword(resolvedAdminPassword, existingAdmin.password))) {
        updates.password = await hashPassword(resolvedAdminPassword);
        updates.mustChangePassword = false;
      }

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, existingAdmin.id));
      }
      return;
    }

    {
      const id = randomUUID();
      await db.insert(users).values({
        id,
        email: normalizedEmail,
        phone: resolvedAdminPhone,
        password: await hashPassword(resolvedAdminPassword),
        role: "admin",
        status: "approved",
      });
    }
  }

  async createPasswordResetToken(
    token: InsertPasswordResetToken
  ): Promise<PasswordResetToken> {
    const id = randomUUID();
    const [result] = await db
      .insert(passwordResetTokens)
      .values({
        id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt ?? null,
      })
      .returning();
    return result;
  }

  async getValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, now),
          isNull(passwordResetTokens.usedAt)
        )
      );
    return result[0] || undefined;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}

export const storage = new DatabaseStorage();
