import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/admin/ReviewForm";

export const metadata: Metadata = { title: "Add Review — Admin" };

export default async function NewReviewPage() {
  const properties = await prisma.property.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/reviews"
        className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-6 group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
        All reviews
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Add Review</h1>
        <p className="text-stone text-sm mt-0.5">Create a new guest review for a property.</p>
      </div>

      <ReviewForm properties={properties} />
    </div>
  );
}
