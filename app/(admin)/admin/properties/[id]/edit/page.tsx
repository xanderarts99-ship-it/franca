import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyEditForm from "@/components/admin/PropertyEditForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit Property — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyEditPage({ params }: PageProps) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      nightlyRate: true,
      guests: true,
      bedrooms: true,
      beds: true,
      bathrooms: true,
      amenities: true,
      images: true,
    },
  });

  if (!property) notFound();

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-5 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          All properties
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-sand font-semibold mb-1.5">
          Edit Property
        </p>
        <h1 className="font-serif text-3xl font-semibold text-charcoal leading-tight">
          {property.name}
        </h1>
        <p className="text-stone text-sm mt-1">{property.location}</p>
      </div>

      <PropertyEditForm property={{ ...property, nightlyRate: Number(property.nightlyRate) }} />
    </div>
  );
}
