import { Star, MapPin } from "lucide-react";
import { ApproveReviewButton, RejectReviewButton, HostResponseButton } from "./ReviewActions";

interface PendingReview {
  id: string;
  propertyName: string;
  guestName: string;
  guestLocation: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
  hostResponse: string | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-stone-light/30"}
        />
      ))}
    </span>
  );
}

export default function PendingReviewsList({ reviews }: { reviews: PendingReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-warm-border rounded-card p-10 text-center">
        <Star size={24} className="text-stone-light mx-auto mb-3" />
        <p className="text-sm font-medium text-charcoal mb-1">No pending reviews</p>
        <p className="text-xs text-stone-light">All reviews have been approved or there are none yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-warm-border rounded-card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-semibold text-charcoal text-sm">{review.guestName}</p>
                {review.guestLocation && (
                  <span className="flex items-center gap-1 text-xs text-stone-light">
                    <MapPin size={10} />
                    {review.guestLocation}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-stone-light">
                  {new Date(review.reviewDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <span className="text-xs text-stone bg-cream border border-warm-border rounded-full px-2.5 py-1 shrink-0">
              {review.propertyName}
            </span>
          </div>

          <p className="text-sm text-stone leading-relaxed mb-4">{review.comment}</p>

          {review.hostResponse && (
            <div className="bg-[#F0F7F4] border border-warm-border rounded-xl px-3 py-2.5 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1B4332] mb-1">
                Host Response
              </p>
              <p className="text-xs text-stone leading-relaxed">{review.hostResponse}</p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <ApproveReviewButton reviewId={review.id} />
            <RejectReviewButton reviewId={review.id} guestName={review.guestName} />
            <HostResponseButton reviewId={review.id} existingResponse={review.hostResponse} />
          </div>
        </div>
      ))}
    </div>
  );
}
