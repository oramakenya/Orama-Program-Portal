import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parents, students, instructors } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function POST(req: Request) {
  try {
    await seedDatabase(); // Ensure seed data exists
    const body = await req.json();
    const { role, username, code } = body;

    if (!role || !username || !code) {
      return NextResponse.json(
        { success: false, message: "Role, username, and code are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase();

    if (role === "parent") {
      // Find parent user by username
      const foundUsers = await db
        .select()
        .from(users)
        .where(ilike(users.username, cleanUsername));

      const parentUser = foundUsers.find((u) => u.role === "parent");
      if (!parentUser) {
        return NextResponse.json(
          { success: false, message: "Parent account not found with this username." },
          { status: 401 }
        );
      }

      // Find parent details
      const parentList = await db
        .select()
        .from(parents)
        .where(eq(parents.userId, parentUser.id));

      if (parentList.length === 0) {
        return NextResponse.json(
          { success: false, message: "Parent profile not found." },
          { status: 401 }
        );
      }

      const parentObj = parentList[0];

      // Get all students for this parent
      const parentStudents = await db
        .select()
        .from(students)
        .where(eq(students.parentId, parentObj.id));

      // Verify if code matches either the parent code or any of their students' codes
      const matchesParentCode = parentObj.parentCode.toUpperCase() === cleanCode;
      const matchedStudent = parentStudents.find(
        (s) => s.studentCode.toUpperCase() === cleanCode
      );

      if (!matchesParentCode && !matchedStudent) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Student Code or Parent Code. Please double-check your code (e.g., ORM-2024-KIPRAH).",
          },
          { status: 401 }
        );
      }

      const activeStudent = matchedStudent || parentStudents[0];

      return NextResponse.json({
        success: true,
        user: {
          id: parentUser.id,
          username: parentUser.username,
          name: parentUser.name,
          role: "parent",
          email: parentUser.email,
          avatar: parentUser.avatar,
        },
        parent: parentObj,
        students: parentStudents,
        activeStudentId: activeStudent ? activeStudent.id : null,
      });
    } else if (role === "instructor") {
      // Find instructor user by username
      const foundUsers = await db
        .select()
        .from(users)
        .where(ilike(users.username, cleanUsername));

      const instUser = foundUsers.find((u) => u.role === "instructor");
      if (!instUser) {
        return NextResponse.json(
          { success: false, message: "Instructor account not found with this username." },
          { status: 401 }
        );
      }

      const instList = await db
        .select()
        .from(instructors)
        .where(eq(instructors.userId, instUser.id));

      if (instList.length === 0) {
        return NextResponse.json(
          { success: false, message: "Instructor record not found." },
          { status: 401 }
        );
      }

      const instObj = instList[0];

      if (instObj.instructorCode.toUpperCase() !== cleanCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Instructor Code. (e.g., INST-ART-01).",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: instUser.id,
          username: instUser.username,
          name: instUser.name,
          role: "instructor",
          email: instUser.email,
          avatar: instUser.avatar,
        },
        instructor: instObj,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid role specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
