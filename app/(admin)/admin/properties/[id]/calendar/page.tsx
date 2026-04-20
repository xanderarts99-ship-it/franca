import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyCalendar from "@/components/admin/PropertyCalendar";
import ICalFeedManager from "@/components/admin/ICalFeedManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Calendar — Admin" };

interface BlockedDate {
  date: string;
  reason: "BOOKING" | "MANUAL" | "EXTERNAL" | "PENDING";
  label?: string;
  bookingRef?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyCalendarPage({ params }: PageProps) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      location: true,
      blockedDates: {
        include: {
          booking: { select: { guestName: true, bookingReference: true, status: true } },
          iCalFeed: { select: { name: true } },
        },
        orderBy: { date: "asc" },
      },
      icalFeeds: {
        select: {
          id: true,
          name: true,
          url: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  if (!property) notFound();

  const blockedDates: BlockedDate[] = property.blockedDates.map((bd) => {
    const date = bd.date.toISOString().slice(0, 10);

    if (bd.reason === "BOOKING" && bd.booking) {
      const isPending = bd.booking.status === "PENDING";
      return {
        date,
        reason: isPending ? "PENDING" : "BOOKING",
        label: bd.booking.guestName,
        bookingRef: bd.booking.bookingReference,
      };
    }

    if (bd.reason === "EXTERNAL" && bd.iCalFeed) {
      return { date, reason: "EXTERNAL", label: bd.iCalFeed.name };
    }

    return { date, reason: "MANUAL" };
  });

  const icalFeeds = property.icalFeeds.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    lastSyncedAt: f.lastSyncedAt ? f.lastSyncedAt.toISOString() : null,
  }));

  return (
    <div className="max-w-3xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-4 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          All properties
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Calendar</h1>
        <p className="text-stone text-sm mt-0.5">{property.name} · {property.location}</p>
      </div>

      <PropertyCalendar
        propertyId={property.id}
        blockedDates={blockedDates}
      />

      <div className="mt-6">
        <ICalFeedManager
          propertyId={property.id}
          initialFeeds={icalFeeds}
        />
      </div>
    </div>
  );
}
