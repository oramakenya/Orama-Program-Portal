import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessonPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      instructorId,
      discipline,
      weekNumber,
      title,
      objectives,
      materialsNeeded,
      practiceAssignment,
      dateSchedule,
      status,
    } = body;

    if (!instructorId || !discipline || !title || !objectives) {
      return NextResponse.json(
        { success: false, message: "Instructor ID, discipline, title, and objectives are required." },
        { status: 400 }
      );
    }

    const [plan] = await db
      .insert(lessonPlans)
      .values({
        instructorId,
        discipline,
        weekNumber: Number(weekNumber) || 1,
        title,
        objectives,
        materialsNeeded: materialsNeeded || "",
        practiceAssignment: practiceAssignment || "",
        dateSchedule: dateSchedule || "Upcoming Week",
        status: status || "Published",
      })
      .returning();

    const updatedPlans = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.instructorId, instructorId))
      .orderBy(desc(lessonPlans.weekNumber));

    return NextResponse.json({
      success: true,
      message: "Lesson plan created successfully.",
      lessonPlan: plan,
      lessonPlans: updatedPlans,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
