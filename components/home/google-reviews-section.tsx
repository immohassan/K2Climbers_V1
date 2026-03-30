import { Star, ExternalLink } from "lucide-react"

const REVIEWS = [
  {
    name: "Farah Zafar",
    avatar: "FZ",
    rating: 5,
    date: "a months ago",
    text: "Highly recommended. As a solo female traveler, one can trust this company truly. They are the safest option available for any traveler especially females. I have done Kashmir & Astore Valley in September 2025 and MKM summit in Feb 2026 with them. Highly professionals. They listen, they care. Would love to join them again.",
  },
  {
    name: "Muhammad Saud",
    avatar: "MS",
    rating: 5,
    date: "2 months ago",
    text: "Just came back from an amazing hike with K2 Climbers to Rakaposhi Basecamp in December 2025. We stayed in Chilas, Minapin, and then camped at Hapakun. The hotels were decent, especially the one in Minapin, and the food was absolutely outclass. The weather was tough with heavy snowfall, but the team and the people I went with were super cooperative and motivating. Despite the hard conditions, they encouraged me to push through and reach the viewpoint, which made the experience even more special. Overall, everything was well managed, fun, and full of good vibes. 💯 Highly recommended K2 Climbers.",
  },
  {
    name: "Ather Mulla",
    avatar: "AM",
    rating: 5,
    date: "3 months ago",
    text: "Did Churko peak with K2Climbers and it was absolutely amazing. Farhan bhai and Bilal Bhai are absolute sweethearts. I didnt bring the right pair of shoes and they helped me get one right before we head into the wilderness. Getting good food in the middle of nowhere was the highlight. 1000/10 recommended if you are up for adventure.",
  },
]

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? "fill-orange-400 text-orange-400" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  )
}

export function GoogleReviewsSection() {
  return (
    <section className="py-14 md:py-20 bg-background border-b border-border overflow-hidden">
      <div className="container mx-auto px-4">

        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-orange-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mt-2">
              What Climbers<br className="hidden sm:block" /> Say
            </h2>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Google">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-2xl font-black">4.9</span>
              <StarRow count={5} />
            </div>
            <span className="text-xs text-muted-foreground">Based on Google Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="bg-background p-6 sm:p-7 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <StarRow count={review.rating} />
                <span className="text-[10px] text-muted-foreground font-mono">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-black shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{review.name}</p>
                  <p className="text-[10px] text-muted-foreground">Google Review</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href="https://www.google.com/maps/search/K2Climbers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold border border-border px-5 py-3 hover:bg-muted/50 transition-colors group"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            See all reviews on Google Maps
            <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  )
}
