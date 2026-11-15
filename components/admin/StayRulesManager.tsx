"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { addDays, formatStayDate, todayAtProperty } from "@/lib/stay-dates";
import {
  resolveMinimumStay,
  type SeasonalStayRule,
  type StayPolicy,
} from "@/lib/stay-rules";

interface Home {
  id: string;
  name: string;
  minimumStayNights: number | null;
}
interface Data {
  settings: { minimumNights: number; version: number };
  properties: Home[];
  rules: SeasonalStayRule[];
  paymentReviews: {
    id: string;
    paymentIntentId: string;
    amount: string;
    currency: string;
    reason: string;
  }[];
}
type RuleDraft = Omit<SeasonalStayRule, "id"> & { id?: string };
const input =
  "w-full min-h-11 rounded-lg border border-stone-light bg-surface px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sand-dark disabled:opacity-60";
const button =
  "min-h-11 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-50 disabled:cursor-default";
const secondary =
  "min-h-11 rounded-lg border border-stone-light px-4 py-2 text-sm font-medium text-charcoal hover:bg-cream-dark focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

function NightOptions() {
  return Array.from({ length: 30 }, (_, i) => (
    <option key={i + 1} value={i + 1}>
      {i + 1} {i === 0 ? "night" : "nights"}
    </option>
  ));
}
function RestrictionWarning({ nights }: { nights: number }) {
  return nights >= 14 ? (
    <p className="text-sm text-amber-900">
      {nights === 30
        ? "Only stays of exactly 30 nights will qualify."
        : "Shorter gaps between bookings may become impossible to book."}{" "}
      Check the availability calendar before saving.
    </p>
  ) : null;
}

export default function StayRulesManager({
  initialPropertyId,
}: {
  initialPropertyId?: string;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [usual, setUsual] = useState(2);
  const [homeId, setHomeId] = useState(initialPropertyId ?? "");
  const [override, setOverride] = useState("");
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewHome, setPreviewHome] = useState(initialPropertyId ?? "");
  const [previewDate, setPreviewDate] = useState(todayAtProperty());
  const [draftPreviewDate, setDraftPreviewDate] = useState("");

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/stay-rules", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Could not load stay rules.");
    const next = json as Data;
    setData(next);
    setUsual(next.settings.minimumNights);
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    // Only this initial load runs automatically; mutations explicitly reload saved values.
    Promise.resolve()
      .then(load)
      .then((next) => {
        if (active && initialPropertyId) {
          const home = next.properties.find((p) => p.id === initialPropertyId);
          setOverride(
            home?.minimumStayNights == null
              ? ""
              : String(home.minimumStayNights),
          );
        }
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, initialPropertyId]);

  async function save(edit: Record<string, unknown>, message: string) {
    if (!data || busy) return false;
    setBusy(true);
    setError("");
    setSaved("");
    let committed = false;
    try {
      const res = await fetch("/api/admin/stay-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...edit, version: data.settings.version }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error ?? "Your change could not be saved.");
      committed = true;
      await load();
      setSaved(message);
      return true;
    } catch (e) {
      setError(
        committed
          ? "Your change was saved, but the updated rules could not be loaded. Reload saved rules to check the result."
          : e instanceof Error
            ? e.message
            : "Please retry.",
      );
      // A successful POST must close a new-period draft even if reloading fails,
      // otherwise retrying the draft would create a duplicate period.
      return committed;
    } finally {
      setBusy(false);
    }
  }

  function chooseHome(id: string) {
    setHomeId(id);
    const value = data?.properties.find((p) => p.id === id)?.minimumStayNights;
    setOverride(value == null ? "" : String(value));
  }
  const initialHome = data?.properties.find((p) => p.id === homeId);
  // Initial property shortcuts open the section; selecting a home loads its saved exception.
  const effectiveOverride =
    override === "" ? (data?.settings.minimumNights ?? 2) : Number(override);
  const previewProperty =
    data?.properties.find((p) => p.id === previewHome) ?? data?.properties[0];
  function policyFor(home: Home, rules = data?.rules ?? []): StayPolicy {
    return {
      defaultMinimum: data!.settings.minimumNights,
      propertyMinimum: home.minimumStayNights,
      rules: rules.filter(
        (r) => r.propertyId === null || r.propertyId === home.id,
      ),
    };
  }
  let preview: ReturnType<typeof resolveMinimumStay> | null = null;
  try {
    if (previewProperty && previewDate)
      preview = resolveMinimumStay(policyFor(previewProperty), previewDate);
  } catch {
    /* Incomplete native date input. */
  }
  const overlaps =
    draft && data
      ? data.rules.filter(
          (r) =>
            r.id !== draft.id &&
            r.startDate <= draft.endDate &&
            r.endDate >= draft.startDate &&
            (r.propertyId === null ||
              draft.propertyId === null ||
              r.propertyId === draft.propertyId),
        )
      : [];
  let draftPreview: { home: string; minimum: number; source: string }[] = [];
  try {
    if (draft && data) {
      const proposed = [
        ...data.rules.filter((r) => r.id !== draft.id),
        { ...draft, id: draft.id ?? "proposed" },
      ];
      draftPreview = data.properties
        .filter((p) => draft.propertyId === null || draft.propertyId === p.id)
        .map((p) => {
          const result = resolveMinimumStay(
            policyFor(p, proposed),
            draftPreviewDate || draft.startDate,
          );
          return {
            home: p.name,
            minimum: result.minimumNights,
            source: result.source,
          };
        });
    }
  } catch {
    /* Native date inputs can temporarily be incomplete. */
  }
  const exceptionCount =
    data?.properties.filter((p) => p.minimumStayNights !== null).length ?? 0;

  if (loading)
    return (
      <div className="max-w-4xl text-sm text-stone" role="status">
        Loading stay rules…
      </div>
    );
  if (!data)
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-4">Stay rules</h1>
        <p role="alert" className="text-red-800 mb-4">
          {error}
        </p>
        <button
          className={secondary}
          onClick={() => {
            setLoading(true);
            load()
              .catch((e: Error) => setError(e.message))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-8 text-charcoal">
      <header>
        <h1 className="text-2xl font-semibold">Stay rules</h1>
        <p className="mt-2 max-w-3xl text-sm text-stone">
          Choose the shortest stay guests can book. Changes apply to new
          requests; existing requests and bookings keep their original
          agreement.
        </p>
      </header>

      {saved && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-[1440px] items-center justify-between gap-4 border border-emerald-200 border-l-4 border-l-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm lg:left-64 lg:right-8"
        >
          <span>{saved}</span>
          <button
            type="button"
            onClick={() => setSaved("")}
            aria-label="Dismiss success message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-900"
        >
          <p>{error}</p>
          <button
            className="underline mt-2 min-h-11"
            disabled={busy}
            onClick={() =>
              load()
                .then(() => {
                  setError("");
                  setSaved(
                    "Saved rules reloaded. Review your entries and save again.",
                  );
                })
                .catch((e: Error) => setError(e.message))
            }
          >
            Reload saved rules
          </button>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <section
            className="border border-warm-border rounded-lg bg-surface p-5 sm:p-6"
            aria-labelledby="usual-heading"
          >
            <h2 id="usual-heading" className="text-lg font-semibold">
              Usual minimum stay
            </h2>
            <p className="mt-1 text-sm text-stone">
              Used by all homes unless you add a busy period or a home’s own
              minimum below.
            </p>
            <form
              className="mt-5 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await save(
                  { action: "default", minimumNights: usual },
                  `Usual minimum saved: ${usual} ${usual === 1 ? "night" : "nights"}.`,
                );
              }}
            >
              <label
                className="block text-sm font-medium"
                htmlFor="usual-minimum"
              >
                Guests must stay at least
              </label>
              <div className="flex flex-wrap gap-3">
                <select
                  id="usual-minimum"
                  className={`${input} max-w-40`}
                  value={usual}
                  disabled={busy}
                  onChange={(e) => setUsual(Number(e.target.value))}
                >
                  <NightOptions />
                </select>
                <button
                  className={button}
                  disabled={busy || usual === data.settings.minimumNights}
                  aria-busy={busy}
                  title={
                    usual === data.settings.minimumNights
                      ? "This minimum is already saved. Choose a different value to make a change."
                      : undefined
                  }
                >
                  {busy
                    ? "Saving…"
                    : usual === data.settings.minimumNights
                      ? "Saved"
                      : "Save usual minimum"}
                </button>
              </div>
              <p className="text-sm text-stone">
                {data.properties.length - exceptionCount} homes will use {usual}{" "}
                nights outside busy periods.
                {exceptionCount > 0 &&
                  ` ${exceptionCount} ${exceptionCount === 1 ? "home has its" : "homes have their"} own minimum and will keep it.`}
              </p>
              <RestrictionWarning nights={usual} />
            </form>
          </section>

          <section aria-labelledby="periods-heading">
            <div className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <h2 id="periods-heading" className="text-lg font-semibold">
                  Busy periods
                </h2>
                <p className="mt-1 text-sm text-stone">
                  For example, require 7 nights for Christmas arrivals.
                </p>
              </div>
              <button
                className={secondary}
                disabled={busy || !!draft}
                onClick={() => {
                  setDraft({
                    name: "",
                    propertyId: null,
                    startDate: todayAtProperty(),
                    endDate: addDays(todayAtProperty(), 7),
                    minimumNights: 7,
                  });
                  setSaved("");
                }}
              >
                Add a busy period
              </button>
            </div>
            {!data.rules.length && !draft && (
              <p className="mt-5 border border-dashed border-stone-light rounded-lg p-5 text-sm text-stone">
                No busy periods yet. Guests use each home’s usual minimum all
                year.
              </p>
            )}
            <div className="mt-4 divide-y divide-warm-border">
              {data.rules.map((rule) => (
                <article
                  key={rule.id}
                  className="py-4 flex flex-wrap justify-between gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-sm">{rule.name}</h3>
                    <p className="text-sm mt-1">
                      {rule.minimumNights} nights ·{" "}
                      {rule.propertyId
                        ? data.properties.find((p) => p.id === rule.propertyId)
                            ?.name
                        : "All homes"}
                    </p>
                    <p className="text-sm text-stone mt-1">
                      Arrivals {formatStayDate(rule.startDate)} –{" "}
                      {formatStayDate(rule.endDate)}
                      {rule.endDate < todayAtProperty() ? " · Ended" : ""}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      className={secondary}
                      disabled={busy || !!draft}
                      aria-label={`Edit ${rule.name}`}
                      onClick={() => setDraft({ ...rule })}
                    >
                      Edit
                    </button>
                    <button
                      className={secondary}
                      disabled={busy}
                      aria-label={`Remove ${rule.name}`}
                      onClick={() => setDeleteId(rule.id)}
                    >
                      Remove
                    </button>
                  </div>
                  {deleteId === rule.id && (
                    <div className="w-full bg-cream p-4 rounded-lg text-sm">
                      <p>
                        Remove “{rule.name}”? Arrivals in this period will use
                        any other matching rule, or the home’s usual minimum.
                      </p>
                      <div className="flex gap-3 mt-3">
                        <button
                          className={button}
                          disabled={busy}
                          onClick={async () => {
                            if (
                              await save(
                                { action: "deleteRule", id: rule.id },
                                `“${rule.name}” removed.`,
                              )
                            )
                              setDeleteId(null);
                          }}
                        >
                          Yes, remove period
                        </button>
                        <button
                          className={secondary}
                          disabled={busy}
                          onClick={() => setDeleteId(null)}
                        >
                          Keep period
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
            {draft && (
              <form
                className="mt-4 border border-stone-light rounded-lg bg-surface p-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    await save(
                      { ...draft, action: "saveRule" },
                      `“${draft.name}” saved. The usual minimum resumes automatically after the last arrival date.`,
                    )
                  )
                    setDraft(null);
                }}
              >
                <h3 className="font-semibold">
                  {draft.id ? "Edit busy period" : "New busy period"}
                </h3>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="period-name"
                  >
                    Period name
                  </label>
                  <input
                    autoFocus
                    id="period-name"
                    className={input}
                    placeholder="e.g. Christmas 2027"
                    required
                    maxLength={80}
                    value={draft.name}
                    disabled={busy}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="period-home"
                  >
                    Applies to
                  </label>
                  <select
                    id="period-home"
                    className={input}
                    value={draft.propertyId ?? ""}
                    disabled={busy}
                    onChange={(e) =>
                      setDraft({ ...draft, propertyId: e.target.value || null })
                    }
                  >
                    <option value="">All homes</option>
                    {data.properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="period-start"
                    >
                      First arrival date
                    </label>
                    <input
                      id="period-start"
                      type="date"
                      className={input}
                      required
                      min="2000-01-01"
                      max="2100-12-31"
                      disabled={busy}
                      value={draft.startDate}
                      onChange={(e) =>
                        setDraft({ ...draft, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="period-end"
                    >
                      Last arrival date (included)
                    </label>
                    <input
                      id="period-end"
                      type="date"
                      className={input}
                      required
                      min={draft.startDate}
                      max="2100-12-31"
                      disabled={busy}
                      value={draft.endDate}
                      onChange={(e) =>
                        setDraft({ ...draft, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="period-minimum"
                  >
                    Minimum stay
                  </label>
                  <select
                    id="period-minimum"
                    className={`${input} max-w-40`}
                    value={draft.minimumNights}
                    disabled={busy}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        minimumNights: Number(e.target.value),
                      })
                    }
                  >
                    <NightOptions />
                  </select>
                </div>
                <p className="text-sm bg-cream p-3 rounded-lg">
                  Proposed rule: {draft.minimumNights} nights
                  {draft.propertyId ? " at this home" : " at all homes"} for
                  arrivals {draft.startDate || "on your first date"} through{" "}
                  {draft.endDate || "your last date"}. Earlier arrivals keep
                  their arrival-day rule.
                </p>
                {overlaps.length > 0 && (
                  <div className="text-sm bg-amber-50 text-amber-950 p-3 rounded-lg">
                    <p className="font-semibold">
                      This overlaps: {overlaps.map((r) => r.name).join(", ")}.
                    </p>
                    <p className="mt-1">
                      A home’s own busy-period rule wins over an all-home rule,
                      even if it is shorter. Between rules for the same homes,
                      the longer minimum wins. Use “Preview a guest’s stay” to
                      see the result after saving.
                    </p>
                  </div>
                )}
                <details className="text-sm border-t border-warm-border pt-3">
                  <summary className="cursor-pointer min-h-11 font-medium">
                    Preview this change before saving
                  </summary>
                  <label htmlFor="draft-arrival" className="block mb-1">
                    Try an arrival date
                  </label>
                  <input
                    id="draft-arrival"
                    type="date"
                    className={`${input} max-w-56`}
                    min="2000-01-01"
                    max="2100-12-01"
                    value={draftPreviewDate || draft.startDate}
                    onChange={(e) => setDraftPreviewDate(e.target.value)}
                  />
                  <ul className="mt-3 divide-y divide-warm-border">
                    {draftPreview.map((p) => (
                      <li key={p.home} className="py-2">
                        <strong>
                          {p.home}: {p.minimum} nights
                        </strong>
                        <span className="block text-stone">
                          From {p.source || "this new period"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
                <RestrictionWarning nights={draft.minimumNights} />
                <div className="flex flex-wrap gap-3">
                  <button className={button} disabled={busy}>
                    {busy ? "Saving…" : "Save busy period"}
                  </button>
                  <button
                    type="button"
                    className={secondary}
                    disabled={busy}
                    onClick={() => setDraft(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <p className="mt-3 text-sm text-stone">
              The arrival date decides the minimum, even if the stay continues
              into another period. Dates follow the homes’ Texas calendar.
            </p>
          </section>

          <details
            className="border-t border-warm-border pt-6"
            open={initialPropertyId ? true : undefined}
          >
            <summary className="cursor-pointer font-semibold min-h-11">
              Individual homes{" "}
              <span className="font-normal text-sm text-stone">
                —{" "}
                {exceptionCount
                  ? `${exceptionCount} with their own minimum`
                  : "all use the usual minimum"}
              </span>
            </summary>
            <p className="text-sm text-stone mt-2">
              Only change this if a home needs a different minimum outside busy
              periods.
            </p>
            <ul className="mt-4 divide-y divide-warm-border">
              {data.properties.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between gap-4 py-2 text-sm"
                >
                  <span>{p.name}</span>
                  <span className="text-right shrink-0">
                    {p.minimumStayNights ?? data.settings.minimumNights} nights
                    {p.minimumStayNights === null
                      ? " · usual"
                      : " · own minimum"}
                  </span>
                </li>
              ))}
            </ul>
            <form
              className="mt-5 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await save(
                  {
                    action: "property",
                    propertyId: homeId,
                    minimumNights: override === "" ? null : Number(override),
                  },
                  `${initialHome?.name ?? "Home"} saved: ${override === "" ? "follows the usual minimum" : `${override} nights outside busy periods`}.`,
                );
              }}
            >
              <label
                className="block text-sm font-medium"
                htmlFor="override-home"
              >
                Choose a home to change
              </label>
              <select
                id="override-home"
                className={input}
                required
                value={homeId}
                disabled={busy}
                onChange={(e) => chooseHome(e.target.value)}
              >
                <option value="">Choose a home</option>
                {data.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <label
                className="block text-sm font-medium"
                htmlFor="override-minimum"
              >
                This home’s usual minimum
              </label>
              <select
                id="override-minimum"
                className={input}
                value={override}
                disabled={busy || !homeId}
                onChange={(e) => setOverride(e.target.value)}
              >
                <option value="">
                  Follow usual minimum ({data.settings.minimumNights} nights)
                </option>
                <NightOptions />
              </select>
              {homeId && (
                <p className="text-sm text-stone">
                  Will use {effectiveOverride} nights outside busy periods.{" "}
                  {override !== ""
                    ? "Future changes to the all-home minimum will not change this exception."
                    : "Will follow future changes to the all-home minimum."}
                </p>
              )}
              <RestrictionWarning nights={effectiveOverride} />
              <button className={button} disabled={busy || !homeId}>
                Save home’s minimum
              </button>
            </form>
          </details>
        </div>

        <aside
          className="min-w-0 rounded-lg border border-warm-border bg-surface p-5 sm:p-6"
          aria-labelledby="preview-heading"
        >
          <h2 id="preview-heading" className="text-lg font-semibold">
            Preview a guest’s stay
          </h2>
          <p className="text-sm text-stone mt-1">
            Choose a home and check-in date to see how many nights a guest must
            stay.
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-4 mt-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="preview-home"
              >
                Home
              </label>
              <select
                id="preview-home"
                className={input}
                value={previewProperty?.id ?? ""}
                onChange={(e) => setPreviewHome(e.target.value)}
              >
                {data.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="preview-date"
              >
                Guest check-in date
              </label>
              <input
                id="preview-date"
                type="date"
                className={input}
                min="2000-01-01"
                max="2100-12-01"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
              />
            </div>
          </div>
          {preview && (
            <p
              className="mt-4 bg-cream-dark p-4 rounded-lg text-sm"
              role="status"
            >
              <strong>
                Minimum stay: {preview.minimumNights}{" "}
                {preview.minimumNights === 1 ? "night" : "nights"}.
              </strong>
              <span className="block mt-2">
                Earliest checkout:{" "}
                {formatStayDate(addDays(previewDate, preview.minimumNights))}.
              </span>
              <span className="block mt-2 text-stone">
                Rule used: {preview.source}.
              </span>
            </p>
          )}
          <p className="mt-4 text-sm text-stone">
            This is a preview only. It does not create a booking or check
            whether the dates are available.
          </p>
        </aside>
      </div>

      {data.paymentReviews.length > 0 && (
        <section
          className="border-l-4 border-amber-700 bg-amber-50 p-5"
          aria-labelledby="payment-heading"
        >
          <h2 id="payment-heading" className="font-semibold">
            Payments needing your attention
          </h2>
          <p className="text-sm mt-1">
            These payments could not create a booking. Check each payment in
            Stripe and arrange a refund or contact the guest. No dates have been
            reserved.
          </p>
          {data.paymentReviews.map((p) => (
            <div
              key={p.id}
              className="mt-4 border-t border-amber-200 pt-4 text-sm"
            >
              <p className="break-all font-medium">
                {p.paymentIntentId} · {p.amount} {p.currency.toUpperCase()}
              </p>
              <p className="mt-1">{p.reason}</p>
              <button
                className={`${secondary} mt-3`}
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Have you checked this payment in Stripe and resolved it with the guest? This only dismisses the warning; it does not refund or book anything.",
                    )
                  )
                    void save(
                      { action: "resolvePayment", id: p.id },
                      "Payment warning dismissed. No payment or booking was changed.",
                    );
                }}
              >
                I’ve resolved this in Stripe
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
