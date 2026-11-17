import type { Locale } from "../config";
import { marketingEn, type MarketingDict } from "./marketing.en";
import { marketingHe } from "./marketing.he";

export function getMarketingDict(locale: Locale): MarketingDict {
  return locale === "he" ? marketingHe : marketingEn;
}
export type { MarketingDict };
