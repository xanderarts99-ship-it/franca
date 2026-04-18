"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Plus, Link2, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ICalFeed {
  id: string;
  name: string;
  url: string;
  lastSyncedAt: string | null;
}

interface Props {
  propertyId: string;
  initialFeeds: ICalFeed[];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ICalFeedManager({ propertyId, initialFeeds }: Props) {
  const [feeds, setFeeds]         = useState<ICalFeed[]>(initialFeeds);
  const [name, setName]           = useState("");
  const [url, setUrl]             = useState("");
  const [adding, setAdding]       = useState(false);
  const [syncing, setSyncing]     = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [error, setError]         = useState("");
  const [syncOk, setSyncOk]       = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setAdding(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/ical-feeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: url.trim() }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to add feed.");
        return;
      }

      const json = await res.json();
      setFeeds((prev) => [...prev, json.feed]);
      setName("");
      setUrl("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleSync(feedId: string) {
    setSyncing(feedId);
    setSyncOk(null);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/properties/${propertyId}/ical-feeds/${feedId}/sync`,
        { method: "POST" }
      );

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Sync failed.");
        return;
      }

      const now = new Date().toISOString();
      setFeeds((prev) =>
        prev.map((f) => (f.id === feedId ? { ...f, lastSyncedAt: now } : f))
      );
      setSyncOk(feedId);
      setTimeout(() => setSyncOk(null), 3000);
    } catch {
      setError("Network error during sync.");
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(feedId: string) {
    setDeleting(feedId);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/properties/${propertyId}/ical-feeds/${feedId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to delete feed.");
        return;
      }

      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-serif text-base font-semibold text-charcoal">iCal feeds</h2>
        <Link2 size={14} className="text-stone-light" />
      </div>
      <p className="text-xs text-stone mb-5 leading-relaxed">
        Import blocked dates from Airbnb, Booking.com, VRBO, or any iCal URL.
        Use <span className="font-mono text-charcoal text-[11px]">GET /api/properties/{propertyId}/calendar.ics</span> to export.
      </p>

      {/* Feed list */}
      {feeds.length > 0 && (
        <div className="space-y-2 mb-5">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAF7] border border-warm-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal">{feed.name}</p>
                <p className="text-[10px] text-stone-light truncate font-mono mt-0.5">
                  {feed.url}
                </p>
                <p className="text-[10px] text-stone mt-0.5">
                  {feed.lastSyncedAt
                    ? <>Last synced {timeAgo(feed.lastSyncedAt)}</>
                    : <span className="text-amber-600">Never synced</span>}
                </p>
              </div>

              {/* Sync */}
              <button
                onClick={() => handleSync(feed.id)}
                disabled={syncing === feed.id || deleting === feed.id}
                className={cn(
                  "p-2 rounded-full transition-all",
                  syncOk === feed.id
                    ? "text-emerald-500 bg-emerald-50"
                    : "text-stone-light hover:text-sand hover:bg-sand/10"
                )}
                aria-label="Sync feed"
              >
                {syncing === feed.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : syncOk === feed.id ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <RefreshCw size={14} />
                )}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(feed.id)}
                disabled={syncing === feed.id || deleting === feed.id}
                className="p-2 rounded-full text-stone-light hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                aria-label="Remove feed"
              >
                {deleting === feed.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add feed form */}
      <form onSubmit={handleAdd} className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light">
          Add new feed
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Airbnb"
            className="px-3.5 py-2.5 text-sm rounded-xl border border-warm-border bg-[#FAFAF7] text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/…"
            type="url"
            className="px-3.5 py-2.5 text-sm rounded-xl border border-warm-border bg-[#FAFAF7] text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle size={11} />{error}
          </p>
        )}

        <button
          type="submit"
          disabled={adding || !name.trim() || !url.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sand hover:bg-sand-dark text-white text-xs font-semibold transition-all hover:shadow-md hover:shadow-sand/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <><Loader2 size={12} className="animate-spin" /> Adding…</>
          ) : (
            <><Plus size={12} /> Add feed</>
          )}
        </button>
      </form>
    </div>
  );
}
