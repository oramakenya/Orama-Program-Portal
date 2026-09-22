import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentPlans, payments, planChanges } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentId, studentId, newPlanName, newAmountUgx, newBillingCycle, paymentMethod } = body;

    if (!parentId || !studentId || !newPlanName || !newAmountUgx || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing required plan change details." },
        { status: 400 }
      );
    }

    const SWITCH_FEE_UGX = 50000;

    // 1. Get existing payment plan
    const existingPlans = await db
      .select()
      .from(paymentPlans)
      .where(and(eq(paymentPlans.parentId, parentId), eq(paymentPlans.studentId, studentId)));

    const currentPlan = existingPlans[0];
    const oldPlanName = currentPlan ? currentPlan.planName : "Standard Term Plan";

    const todayStr = new Date().toISOString().split("T")[0];

    // 2. Insert into planChanges log
    const [changeRecord] = await db
      .insert(planChanges)
      .values({
        parentId,
        studentId,
        oldPlan: oldPlanName,
        newPlan: newPlanName,
        switchFeeUgx: SWITCH_FEE_UGX,
        paymentMethod,
        status: "Processed",
        changeDate: todayStr,
      })
      .returning();

    // 3. Update or Insert current payment plan
    if (currentPlan) {
      await db
        .update(paymentPlans)
        .set({
          planName: newPlanName,
          amountUgx: newAmountUgx,
          billingCycle: newBillingCycle || "Termly",
          updatedAt: new Date(),
        })
        .where(eq(paymentPlans.id, currentPlan.id));
    } else {
      await db.insert(paymentPlans).values({
        parentId,
        studentId,
        planName: newPlanName,
        amountUgx: newAmountUgx,
        billingCycle: newBillingCycle || "Termly",
        status: "Active",
        nextDueDate: "2026-05-01",
      });
    }

    // 4. Record new payment receipt with the UGX 50,000 switch fee
    const receiptCode = `ORM-SWT-${Math.floor(1000 + Math.random() * 9000)}`;
    const [newPayment] = await db
      .insert(payments)
      .values({
        parentId,
        studentId,
        receiptNo: receiptCode,
        amountUgx: Number(newAmountUgx),
        feeUgx: SWITCH_FEE_UGX,
        description: `Plan Switch to ${newPlanName} (Fee: UGX 50,000 Included)`,
        paymentMethod,
        status: "Completed",
        date: todayStr,
      })
      .returning();

    // 5. Fetch updated list of plans & payments to return to UI
    const updatedPlans = await db
      .select()
      .from(paymentPlans)
      .where(eq(paymentPlans.parentId, parentId));

    const updatedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.parentId, parentId));

    const updatedPlanChanges = await db
      .select()
      .from(planChanges)
      .where(eq(planChanges.parentId, parentId));

    return NextResponse.json({
      success: true,
      message: `Successfully switched plan to ${newPlanName}. A fee of UGX 50,000 was applied.`,
      planChange: changeRecord,
      payment: newPayment,
      paymentPlans: updatedPlans,
      payments: updatedPayments,
      planChanges: updatedPlanChanges,
    });
  } catch (error: any) {
    console.error("Plan change error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
