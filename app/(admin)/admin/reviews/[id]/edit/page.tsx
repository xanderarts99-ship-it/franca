import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/admin/ReviewForm";

export const metadata: Metadata = { title: "Edit Review — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
  const { id } = await params;

  const [review, properties] = await Promise.all([
    prisma.review.findUnique({ where: { id } }),
    prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!review) notFound();

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
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Edit Review</h1>
        <p className="text-stone text-sm mt-0.5">Update the review by {review.guestName}.</p>
      </div>

      <ReviewForm
        properties={properties}
        defaultValues={{
          propertyId: review.propertyId,
          guestName: review.guestName,
          guestLocation: review.guestLocation ?? "",
          rating: review.rating,
          comment: review.comment,
          reviewDate: review.reviewDate.toISOString().split("T")[0],
          featured: review.featured,
        }}
        reviewId={id}
      />
    </div>
  );
}
