import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  parents,
  students,
  instructors,
  enrolments,
  attendance,
  grades,
  lessonPlans,
  paymentPlans,
  payments,
  planChanges,
  chatMessages,
} from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET(req: Request) {
  try {
    await seedDatabase();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const parentId = searchParams.get("parentId");
    const instructorId = searchParams.get("instructorId");
    const activeStudentId = searchParams.get("studentId");

    if (role === "parent" && parentId) {
      // 1. Fetch parent details
      const parentData = await db.select().from(parents).where(eq(parents.id, parentId));
      if (!parentData.length) {
        return NextResponse.json({ success: false, message: "Parent not found" }, { status: 404 });
      }

      // 2. Fetch all students for parent
      const parentStudents = await db.select().from(students).where(eq(students.parentId, parentId));
      if (!parentStudents.length) {
        return NextResponse.json({ success: true, parent: parentData[0], students: [] });
      }

      // Determine target student ID
      const studentIdToUse =
        activeStudentId && parentStudents.some((s) => s.id === activeStudentId)
          ? activeStudentId
          : parentStudents[0].id;

      const currentStudent = parentStudents.find((s) => s.id === studentIdToUse) || parentStudents[0];

      // 3. Fetch Enrolments for this student
      const studentEnrolments = await db
        .select()
        .from(enrolments)
        .where(eq(enrolments.studentId, currentStudent.id));

      // 4. Fetch instructor info for enrolled instructors
      const instructorIds = Array.from(new Set(studentEnrolments.map((e) => e.instructorId)));
      let instructorDetails: any[] = [];
      if (instructorIds.length > 0) {
        const rawInstructors = await db
          .select()
          .from(instructors)
          .where(inArray(instructors.id, instructorIds));

        // Get user details for avatars & names
        const instUserIds = rawInstructors.map((i) => i.userId);
        const instUsers = instUserIds.length > 0
          ? await db.select().from(users).where(inArray(users.id, instUserIds))
          : [];

        instructorDetails = rawInstructors.map((inst) => {
          const u = instUsers.find((usr) => usr.id === inst.userId);
          return {
            ...inst,
            instructorName: u ? u.name : "Instructor",
            instructorAvatar: u?.avatar || null,
            email: u?.email || "",
          };
        });
      }

      // 5. Fetch Attendance for current student
      const studentAttendance = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, currentStudent.id))
        .orderBy(desc(attendance.createdAt));

      // 6. Fetch Grades for current student
      const studentGrades = await db
        .select()
        .from(grades)
        .where(eq(grades.studentId, currentStudent.id))
        .orderBy(desc(grades.createdAt));

      // 7. Fetch Lesson plans for student's enrolled disciplines
      const studentDisciplines = studentEnrolments.map((e) => e.discipline);
      let publishedLessonPlans: any[] = [];
      if (studentDisciplines.length > 0) {
        publishedLessonPlans = await db
          .select()
          .from(lessonPlans)
          .where(inArray(lessonPlans.discipline, studentDisciplines))
          .orderBy(desc(lessonPlans.weekNumber));
      }

      // 8. Fetch Payment Plans & Payment History & Plan Changes
      const parentPaymentPlans = await db
        .select()
        .from(paymentPlans)
        .where(eq(paymentPlans.parentId, parentId));

      const parentPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.parentId, parentId))
        .orderBy(desc(payments.createdAt));

      const parentPlanChanges = await db
        .select()
        .from(planChanges)
        .where(eq(planChanges.parentId, parentId))
        .orderBy(desc(planChanges.createdAt));

      // 9. Fetch Chat Messages for parent & current student
      const chats = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.parentId, parentId))
        .orderBy(chatMessages.createdAt);

      return NextResponse.json({
        success: true,
        parent: parentData[0],
        students: parentStudents,
        activeStudent: currentStudent,
        enrolments: studentEnrolments,
        instructors: instructorDetails,
        attendance: studentAttendance,
        grades: studentGrades,
        lessonPlans: publishedLessonPlans,
        paymentPlans: parentPaymentPlans,
        payments: parentPayments,
        planChanges: parentPlanChanges,
        chats,
      });
    } else if (role === "instructor" && instructorId) {
      // 1. Fetch instructor details
      const instData = await db.select().from(instructors).where(eq(instructors.id, instructorId));
      if (!instData.length) {
        return NextResponse.json({ success: false, message: "Instructor not found" }, { status: 404 });
      }

      const instObj = instData[0];
      const instUser = await db.select().from(users).where(eq(users.id, instObj.userId));

      // 2. Fetch enrolled students for this instructor
      const instEnrolments = await db
        .select()
        .from(enrolments)
        .where(eq(enrolments.instructorId, instructorId));

      const enrolledStudentIds = Array.from(new Set(instEnrolments.map((e) => e.studentId)));

      let roster: any[] = [];
      if (enrolledStudentIds.length > 0) {
        const studentList = await db
          .select()
          .from(students)
          .where(inArray(students.id, enrolledStudentIds));

        const parentIds = Array.from(new Set(studentList.map((s) => s.parentId)));
        const parentRecords = parentIds.length > 0
          ? await db.select().from(parents).where(inArray(parents.id, parentIds))
          : [];

        const parentUserIds = parentRecords.map((p) => p.userId);
        const parentUsers = parentUserIds.length > 0
          ? await db.select().from(users).where(inArray(users.id, parentUserIds))
          : [];

        roster = studentList.map((std) => {
          const prnt = parentRecords.find((p) => p.id === std.parentId);
          const prntUsr = prnt ? parentUsers.find((u) => u.id === prnt.userId) : null;
          const enr = instEnrolments.find((e) => e.studentId === std.id);
          return {
            ...std,
            discipline: enr?.discipline || instObj.discipline,
            schedule: enr?.schedule || "Scheduled Session",
            parentName: prntUsr ? prntUsr.name : "Guardian",
            parentEmail: prntUsr ? prntUsr.email : "",
            parentPhone: prnt?.phone || "",
            parentId: prnt?.id || null,
          };
        });
      }

      // 3. Fetch Attendance records for this instructor
      const instAttendance = await db
        .select()
        .from(attendance)
        .where(eq(attendance.instructorId, instructorId))
        .orderBy(desc(attendance.createdAt));

      // 4. Fetch Grades for this instructor
      const instGrades = await db
        .select()
        .from(grades)
        .where(eq(grades.instructorId, instructorId))
        .orderBy(desc(grades.createdAt));

      // 5. Fetch Lesson Plans for this instructor
      const instLessonPlans = await db
        .select()
        .from(lessonPlans)
        .where(eq(lessonPlans.instructorId, instructorId))
        .orderBy(desc(lessonPlans.weekNumber));

      // 6. Fetch Chat messages for this instructor
      const chats = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.instructorId, instructorId))
        .orderBy(chatMessages.createdAt);

      return NextResponse.json({
        success: true,
        instructor: {
          ...instObj,
          name: instUser[0]?.name || "Instructor",
          email: instUser[0]?.email || "",
          avatar: instUser[0]?.avatar || null,
        },
        roster,
        attendance: instAttendance,
        grades: instGrades,
        lessonPlans: instLessonPlans,
        chats,
      });
    }

    return NextResponse.json({ success: false, message: "Missing required role/id parameters." }, { status: 400 });
  } catch (error: any) {
    console.error("Portal Data Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
