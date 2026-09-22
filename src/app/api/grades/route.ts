import { NextResponse } from "next/server";
import { db } from "@/db";
import { grades } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, instructorId, discipline, category, title, score, maxScore, remarks, date } = body;

    if (!studentId || !instructorId || !discipline || !category || !title || score === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required grade fields." },
        { status: 400 }
      );
    }

    const numScore = Number(score);
    const numMax = Number(maxScore) || 100;
    const percentage = (numScore / numMax) * 100;

    let gradeLetter = "B";
    if (percentage >= 95) gradeLetter = "A+";
    else if (percentage >= 90) gradeLetter = "A";
    else if (percentage >= 85) gradeLetter = "A-";
    else if (percentage >= 80) gradeLetter = "B+";
    else if (percentage >= 75) gradeLetter = "B";
    else if (percentage >= 70) gradeLetter = "C+";
    else gradeLetter = "C";

    const todayStr = date || new Date().toISOString().split("T")[0];

    const [newGrade] = await db
      .insert(grades)
      .values({
        studentId,
        instructorId,
        discipline,
        category,
        title,
        score: numScore,
        maxScore: numMax,
        gradeLetter,
        remarks: remarks || "",
        date: todayStr,
      })
      .returning();

    const updatedGrades = await db
      .select()
      .from(grades)
      .where(eq(grades.instructorId, instructorId))
      .orderBy(desc(grades.createdAt));

    return NextResponse.json({
      success: true,
      message: "Grade evaluation posted successfully.",
      grade: newGrade,
      grades: updatedGrades,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
