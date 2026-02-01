/**
 * Expedition categories that count toward a user's summit count.
 * Only SMALL_PEAKS and MOUNTAINEERING are included (not TREKKING_PEAKS, ROAD_TRIPS, CUSTOM).
 */
export const SUMMIT_COUNT_CATEGORIES = ["SMALL_PEAKS", "MOUNTAINEERING"] as const

export type SummitCountCategory = (typeof SUMMIT_COUNT_CATEGORIES)[number]

export function recordCountsAsSummit(category: string): boolean {
  return SUMMIT_COUNT_CATEGORIES.includes(category as SummitCountCategory)
}
