import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lockStaySettings } from "@/lib/stay-policy";
import { stayEditSchema } from "@/lib/stay-admin";
import { dateKey, parseStayDate } from "@/lib/stay-dates";
import { revalidatePath } from "next/cache";

export async function GET() {
  if (!(await getServerSession(authOptions)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [settings, properties, rules, paymentReviews] = await Promise.all([
      prisma.staySettings.findUniqueOrThrow({ where: { id: "default" } }),
      prisma.property.findMany({
        select: { id: true, name: true, minimumStayNights: true },
        orderBy: { name: "asc" },
      }),
      prisma.stayRule.findMany({
        orderBy: [{ startDate: "asc" }, { name: "asc" }],
      }),
      prisma.paymentReview.findMany({
        where: { resolvedAt: null },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return NextResponse.json(
      {
        settings,
        properties,
        rules: rules.map((r) => ({
          ...r,
          startDate: dateKey(r.startDate),
          endDate: dateKey(r.endDate),
        })),
        paymentReviews,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Stay rules load failed", error);
    return NextResponse.json(
      { error: "Stay rules could not be loaded. Please retry." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await getServerSession(authOptions)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = stayEditSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  const edit = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      await lockStaySettings(tx);
      const settings = await tx.staySettings.findUniqueOrThrow({
        where: { id: "default" },
      });
      if (settings.version !== edit.version) throw new Error("STALE");
      if (edit.action === "default")
        await tx.staySettings.update({
          where: { id: "default" },
          data: { minimumNights: edit.minimumNights },
        });
      if (edit.action === "property")
        await tx.property.update({
          where: { id: edit.propertyId },
          data: { minimumStayNights: edit.minimumNights },
        });
      if (edit.action === "saveRule") {
        const data = {
          name: edit.name,
          propertyId: edit.propertyId,
          startDate: parseStayDate(edit.startDate),
          endDate: parseStayDate(edit.endDate),
          minimumNights: edit.minimumNights,
        };
        if (edit.id) await tx.stayRule.update({ where: { id: edit.id }, data });
        else await tx.stayRule.create({ data });
      }
      if (edit.action === "deleteRule")
        await tx.stayRule.delete({ where: { id: edit.id } });
      if (edit.action === "resolvePayment")
        await tx.paymentReview.update({
          where: { id: edit.id },
          data: { resolvedAt: new Date() },
        });
      await tx.staySettings.update({
        where: { id: "default" },
        data: { version: { increment: 1 } },
      });
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "STALE")
      return NextResponse.json(
        {
          error:
            "Someone saved a change since you opened this page. Reload the saved rules before trying again.",
          code: "STALE",
        },
        { status: 409 },
      );
    console.error("Stay rule save failed", error);
    return NextResponse.json(
      {
        error:
          "Your change could not be saved. Check the selected home or period still exists and retry.",
      },
      { status: 400 },
    );
  }
}
