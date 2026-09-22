import { NextResponse } from "next/server";
import { db } from "@/db";
import { enrolments, instructors, students } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function POST(req: Request) {
  try {
    await seedDatabase();
    const body = await req.json();
    const { studentId, discipline, instructorCode, lessonType, schedule, term } = body;

    if (!studentId || !discipline) {
      return NextResponse.json(
        { success: false, message: "Student ID and discipline are required." },
        { status: 400 }
      );
    }

    // Verify the student exists
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));
    if (studentRecords.length === 0) {
      return NextResponse.json(
        { success: false, message: "Student record not found." },
        { status: 404 }
      );
    }

    // Prevent duplicate enrolment in the same discipline
    const existing = await db
      .select()
      .from(enrolments)
      .where(
        and(
          eq(enrolments.studentId, studentId),
          ilike(enrolments.discipline, discipline)
        )
      );
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `${discipline} is already part of this student's classes.` },
        { status: 400 }
      );
    }

    // Resolve instructor: explicit code → discipline match → fallback first instructor
    let instructorId: string | null = null;

    if (instructorCode) {
      const byCode = await db
        .select()
        .from(instructors)
        .where(ilike(instructors.instructorCode, instructorCode.trim().toUpperCase()));
      if (byCode.length > 0) instructorId = byCode[0].id;
    }

    if (!instructorId) {
      const byDiscipline = await db
        .select()
        .from(instructors)
        .where(ilike(instructors.discipline, discipline));
      if (byDiscipline.length > 0) instructorId = byDiscipline[0].id;
    }

    if (!instructorId) {
      const anyInstructor = await db.select().from(instructors).limit(1);
      if (anyInstructor.length > 0) instructorId = anyInstructor[0].id;
    }

    if (!instructorId) {
      return NextResponse.json(
        { success: false, message: "No instructor available for this class yet. Please contact the ORAMA office." },
        { status: 500 }
      );
    }

    const [enrolment] = await db
      .insert(enrolments)
      .values({
        studentId,
        instructorId,
        discipline,
        schedule: schedule || "Private Lesson - By Appointment",
        term: term || "Term 1 - 2026",
        lessonType: lessonType || "Private Lesson",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Enrolled in ${discipline} as a private lesson.`,
      enrolment,
    });
  } catch (error: any) {
    console.error("Add class error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
