import { pgTable, text, timestamp, boolean, integer, uuid, varchar } from "drizzle-orm/pg-core";

// Users table (both Parents and Instructors)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'parent' or 'instructor'
  email: text("email"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Instructors table
export const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  instructorCode: varchar("instructor_code", { length: 50 }).notNull().unique(),
  discipline: text("discipline").notNull(), // e.g. "Visual Arts & Painting", "Piano & Music Theory", "Drama & Performing Arts"
  bio: text("bio"),
  phone: text("phone"),
  officeHours: text("office_hours"),
});

// Parents table
export const parents = pgTable("parents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  parentCode: varchar("parent_code", { length: 50 }).notNull(),
  phone: text("phone"),
  address: text("address"),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => parents.id, { onDelete: "cascade" }).notNull(),
  studentCode: varchar("student_code", { length: 50 }).notNull().unique(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  avatar: text("avatar"),
  gradeLevel: text("grade_level").notNull(), // e.g., "Intermediate Art", "Advanced Piano"
  status: varchar("status", { length: 20 }).default("Active").notNull(),
  enrolledDate: timestamp("enrolled_date").defaultNow().notNull(),
});

// Enrolments (connects student to instructor & discipline)
export const enrolments = pgTable("enrolments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id, { onDelete: "cascade" }).notNull(),
  discipline: text("discipline").notNull(),
  schedule: text("schedule").notNull(), // e.g., "Tue & Thu 4:00 PM - 5:30 PM"
  term: text("term").notNull(), // e.g., "Term 1 - 2026"
  lessonType: text("lesson_type").default("Group Class").notNull(), // 'Group Class' or 'Private Lesson'
});

// Attendance records
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id, { onDelete: "cascade" }).notNull(),
  discipline: text("discipline").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format or readable date
  sessionTitle: text("session_title").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'Present', 'Absent', 'Late', 'Excused'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Grades / Evaluations
export const grades = pgTable("grades", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id, { onDelete: "cascade" }).notNull(),
  discipline: text("discipline").notNull(),
  category: text("category").notNull(), // e.g. "Recital", "Canvas Project", "Technique Assessment"
  title: text("title").notNull(),
  score: integer("score").notNull(), // e.g. 92
  maxScore: integer("max_score").default(100).notNull(),
  gradeLetter: varchar("grade_letter", { length: 10 }).notNull(), // e.g. "A+", "A", "B+"
  remarks: text("remarks"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lesson plans (created by Instructors)
export const lessonPlans = pgTable("lesson_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  instructorId: uuid("instructor_id").references(() => instructors.id, { onDelete: "cascade" }).notNull(),
  discipline: text("discipline").notNull(),
  weekNumber: integer("week_number").notNull(),
  title: text("title").notNull(),
  objectives: text("objectives").notNull(),
  materialsNeeded: text("materials_needed"),
  practiceAssignment: text("practice_assignment"),
  status: varchar("status", { length: 20 }).default("Published").notNull(), // 'Draft', 'Published'
  dateSchedule: text("date_schedule"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment plans
export const paymentPlans = pgTable("payment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => parents.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  planName: text("plan_name").notNull(), // e.g., "Termly Installment Plan", "Full Annual Plan", "Monthly Subscription"
  amountUgx: integer("amount_ugx").notNull(), // e.g. 650000
  billingCycle: text("billing_cycle").notNull(), // "Termly", "Annual", "Monthly"
  status: varchar("status", { length: 20 }).default("Active").notNull(),
  nextDueDate: text("next_due_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments history
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => parents.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull(),
  amountUgx: integer("amount_ugx").notNull(),
  feeUgx: integer("fee_ugx").default(0).notNull(), // Plan switch fee or transaction fee if applicable
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(), // "MTN Mobile Money", "Airtel Money", "Visa / Mastercard"
  status: varchar("status", { length: 20 }).default("Completed").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Plan Change requests / history
export const planChanges = pgTable("plan_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => parents.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  oldPlan: text("old_plan").notNull(),
  newPlan: text("new_plan").notNull(),
  switchFeeUgx: integer("switch_fee_ugx").default(50000).notNull(), // UGX 50,000 fee as requested
  paymentMethod: text("payment_method").notNull(),
  status: varchar("status", { length: 20 }).default("Processed").notNull(),
  changeDate: text("change_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages between parent and instructor
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => parents.id, { onDelete: "cascade" }).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  senderRole: varchar("sender_role", { length: 20 }).notNull(), // 'parent' or 'instructor'
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
