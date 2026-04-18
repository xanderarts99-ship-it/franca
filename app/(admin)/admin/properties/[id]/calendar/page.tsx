import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyCalendar from "@/components/admin/PropertyCalendar";
import ICalFeedManager from "@/components/admin/ICalFeedManager";

export const metadata: Metadata = { title: "Calendar — Admin" };

interface BlockedDate {
  date: string;        // YYYY-MM-DD
  reason: "BOOKING" | "MANUAL" | "EXTERNAL" | "PENDING";
  label?: string;      // guest name or feed name
  bookingRef?: string;
}

interface ICalFeed {
  id: string;
  name: string;
  url: string;
  lastSyncedAt: string | null;
}

interface MockProperty {
  id: string;
  name: string;
  location: string;
  blockedDates: BlockedDate[];
  icalFeeds: ICalFeed[];
}

/* Build a range of date strings inclusive */
function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const MOCK_PROPERTIES: Record<string, MockProperty> = {
  "prop-1": {
    id: "prop-1",
    name: "Oceanfront Villa",
    location: "Miami Beach, FL",
    blockedDates: [
      ...dateRange("2026-08-01", "2026-08-05").map((d) => ({
        date: d, reason: "BOOKING" as const, label: "Jane Smith", bookingRef: "VR-2026-000001",
      })),
      ...dateRange("2026-08-20", "2026-08-22").map((d) => ({
        date: d, reason: "MANUAL" as const, label: "Owner stay",
      })),
      ...dateRange("2026-09-10", "2026-09-13").map((d) => ({
        date: d, reason: "EXTERNAL" as const, label: "Airbnb",
      })),
      { date: "2026-08-15", reason: "PENDING" as const, label: "Priya Nair" },
    ],
    icalFeeds: [
      { id: "feed-1", name: "Airbnb", url: "https://www.airbnb.com/calendar/ical/mock.ics", lastSyncedAt: "2026-04-17T14:30:00Z" },
      { id: "feed-2", name: "Booking.com", url: "https://ical.booking.com/mock.ics", lastSyncedAt: "2026-04-16T09:00:00Z" },
    ],
  },
  "prop-2": {
    id: "prop-2",
    name: "Mountain Chalet",
    location: "Aspen, CO",
    blockedDates: [
      ...dateRange("2026-07-14", "2026-07-21").map((d) => ({
        date: d, reason: "BOOKING" as const, label: "Marcus Webb", bookingRef: "VR-2026-000002",
      })),
    ],
    icalFeeds: [],
  },
  "prop-3": {
    id: "prop-3", name: "Tropical Bungalow", location: "Key West, FL",
    blockedDates: [], icalFeeds: [],
  },
  "prop-4": {
    id: "prop-4", name: "Desert Retreat", location: "Sedona, AZ",
    blockedDates: [], icalFeeds: [],
  },
  "prop-5": {
    id: "prop-5", name: "Lakeside Cottage", location: "Lake Tahoe, CA",
    blockedDates: [], icalFeeds: [],
  },
  "prop-6": {
    id: "prop-6",
    name: "City Penthouse",
    location: "New York, NY",
    blockedDates: [
      ...dateRange("2026-06-20", "2026-06-23").map((d) => ({
        date: d, reason: "PENDING" as const, label: "Priya Nair",
      })),
      ...dateRange("2026-10-01", "2026-10-08").map((d) => ({
        date: d, reason: "BOOKING" as const, label: "David Kim", bookingRef: "VR-2026-000006",
      })),
    ],
    icalFeeds: [
      { id: "feed-3", name: "VRBO", url: "https://www.vrbo.com/icalendar/mock.ics", lastSyncedAt: null },
    ],
  },
  "prop-7": {
    id: "prop-7", name: "Coastal Cottage", location: "Malibu, CA",
    blockedDates: [], icalFeeds: [],
  },
  "prop-8": {
    id: "prop-8",
    name: "Vineyard Estate",
    location: "Napa Valley, CA",
    blockedDates: [
      ...dateRange("2026-09-05", "2026-09-10").map((d) => ({
        date: d, reason: "BOOKING" as const, label: "Tom Hargreaves", bookingRef: "VR-2026-000004",
      })),
      ...dateRange("2026-09-25", "2026-09-27").map((d) => ({
        date: d, reason: "MANUAL" as const, label: "Maintenance",
      })),
    ],
    icalFeeds: [],
  },
  "prop-9": {
    id: "prop-9", name: "Forest Cabin", location: "Portland, OR",
    blockedDates: [], icalFeeds: [],
  },
  "prop-10": {
    id: "prop-10", name: "Island Hideaway", location: "Maui, HI",
    blockedDates: [], icalFeeds: [],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyCalendarPage({ params }: PageProps) {
  const { id } = await params;
  const property = MOCK_PROPERTIES[id];
  if (!property) notFound();

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
        blockedDates={property.blockedDates}
      />

      <div className="mt-6">
        <ICalFeedManager
          propertyId={property.id}
          initialFeeds={property.icalFeeds}
        />
      </div>
    </div>
  );
}
