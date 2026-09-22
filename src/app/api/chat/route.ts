import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const instructorId = searchParams.get("instructorId");
    const studentId = searchParams.get("studentId");

    if (!parentId || !instructorId) {
      return NextResponse.json(
        { success: false, message: "parentId and instructorId are required" },
        { status: 400 }
      );
    }

    let query = and(
      eq(chatMessages.parentId, parentId),
      eq(chatMessages.instructorId, instructorId)
    );

    if (studentId) {
      query = and(query, eq(chatMessages.studentId, studentId));
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(query)
      .orderBy(chatMessages.createdAt);

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      parentId,
      instructorId,
      studentId,
      senderRole,
      senderName,
      message,
      attachmentUrl,
    } = body;

    if (!parentId || !instructorId || !studentId || !senderRole || !senderName || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required chat fields." },
        { status: 400 }
      );
    }

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        parentId,
        instructorId,
        studentId,
        senderRole,
        senderName,
        message,
        attachmentUrl: attachmentUrl || null,
        isRead: false,
      })
      .returning();

    // Fetch refreshed thread
    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.parentId, parentId),
          eq(chatMessages.instructorId, instructorId),
          eq(chatMessages.studentId, studentId)
        )
      )
      .orderBy(chatMessages.createdAt);

    return NextResponse.json({
      success: true,
      newMessage,
      messages,
    });
  } catch (error: any) {
    console.error("Chat message error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
