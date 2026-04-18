import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyEditForm from "@/components/admin/PropertyEditForm";

export const metadata: Metadata = { title: "Edit Property — Admin" };

interface MockProperty {
  id: string;
  name: string;
  location: string;
  description: string;
  nightlyRate: number;
  amenities: string[];
  images: string[];
}

const MOCK_PROPERTIES: Record<string, MockProperty> = {
  "prop-1":  { id: "prop-1",  name: "Oceanfront Villa",   location: "Miami Beach, FL",  nightlyRate: 420, description: "Wake up to the sound of waves in this stunning oceanfront villa. Floor-to-ceiling windows frame an endless Atlantic horizon, while the private infinity pool blends seamlessly into the sea beyond.", amenities: ["Ocean View","Private Pool","WiFi","Air Conditioning","Full Kitchen","Beach Access","Home Theatre","Parking","BBQ","Outdoor Shower"], images: [] },
  "prop-2":  { id: "prop-2",  name: "Mountain Chalet",    location: "Aspen, CO",         nightlyRate: 380, description: "Perched above the treeline with panoramic views of the Elk Mountains, this timber-frame chalet is the definitive alpine escape.", amenities: ["Mountain View","Hot Tub","Fireplace","Ski Access","WiFi","Full Kitchen","Parking","Game Room","Sauna","Fire Pit"], images: [] },
  "prop-3":  { id: "prop-3",  name: "Tropical Bungalow",  location: "Key West, FL",      nightlyRate: 295, description: "Hidden behind a canopy of bougainvillea, this charming Key West bungalow is your private slice of paradise.", amenities: ["Garden","Beach Access","Hammock","WiFi","Air Conditioning","Bicycle Hire","Porch","Full Kitchen","Outdoor Shower","Parking"], images: [] },
  "prop-4":  { id: "prop-4",  name: "Desert Retreat",     location: "Sedona, AZ",        nightlyRate: 260, description: "Surrounded by ancient red rock formations, this desert sanctuary offers complete seclusion and dramatic Southwest scenery.", amenities: ["Mountain View","Fire Pit","WiFi","Air Conditioning","Parking","Full Kitchen","BBQ","Deck"], images: [] },
  "prop-5":  { id: "prop-5",  name: "Lakeside Cottage",   location: "Lake Tahoe, CA",    nightlyRate: 340, description: "A peaceful retreat steps from the crystal-clear waters of Lake Tahoe. Kayaks included, sunsets guaranteed.", amenities: ["Lake Access","Kayaks","Deck","Full Kitchen","WiFi","Parking","BBQ","Fire Pit"], images: [] },
  "prop-6":  { id: "prop-6",  name: "City Penthouse",     location: "New York, NY",      nightlyRate: 550, description: "Sweeping skyline views from a full-floor penthouse in the heart of Manhattan. The city is your backyard.", amenities: ["Rooftop","WiFi","Air Conditioning","Gym","Full Kitchen","Parking"], images: [] },
  "prop-7":  { id: "prop-7",  name: "Coastal Cottage",    location: "Malibu, CA",        nightlyRate: 490, description: "Perched above the Pacific Coast Highway, this intimate cottage delivers raw ocean views and the sound of crashing waves.", amenities: ["Ocean View","Beach Access","Deck","BBQ","Parking","WiFi","Full Kitchen"], images: [] },
  "prop-8":  { id: "prop-8",  name: "Vineyard Estate",    location: "Napa Valley, CA",   nightlyRate: 620, description: "Set among rolling vines in the heart of Wine Country, this estate is the ultimate indulgence for oenophiles and nature lovers alike.", amenities: ["Garden","Full Kitchen","BBQ","Fire Pit","Parking","WiFi","Deck"], images: [] },
  "prop-9":  { id: "prop-9",  name: "Forest Cabin",       location: "Portland, OR",      nightlyRate: 210, description: "Tucked into the old-growth forest outside Portland, this cosy cabin offers total quiet, fresh air, and starlit nights.", amenities: ["Fireplace","Deck","WiFi","Full Kitchen","Parking","BBQ"], images: [] },
  "prop-10": { id: "prop-10", name: "Island Hideaway",    location: "Maui, HI",          nightlyRate: 680, description: "A secluded retreat on Maui's lush North Shore. Wake up to humpback whale sightings, snorkel directly from the private beach, and watch the sun melt into the Pacific.", amenities: ["Ocean View","Private Pool","Beach Access","Snorkeling","WiFi","Full Kitchen","Parking","Outdoor Shower"], images: [] },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyEditPage({ params }: PageProps) {
  const { id } = await params;
  const property = MOCK_PROPERTIES[id];
  if (!property) notFound();

  return (
    <div className="max-w-2xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-4 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          All properties
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Edit property</h1>
        <p className="text-stone text-sm mt-0.5">{property.name}</p>
      </div>

      <PropertyEditForm property={property} />
    </div>
  );
}
