import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, instructorId, discipline, date, sessionTitle, status, notes } = body;

    if (!studentId || !instructorId || !discipline || !date || !sessionTitle || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required attendance fields." },
        { status: 400 }
      );
    }

    const [record] = await db
      .insert(attendance)
      .values({
        studentId,
        instructorId,
        discipline,
        date,
        sessionTitle,
        status,
        notes: notes || null,
      })
      .returning();

    const updatedAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.instructorId, instructorId))
      .orderBy(desc(attendance.createdAt));

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully.",
      attendanceRecord: record,
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
