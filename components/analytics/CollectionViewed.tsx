"use client";

import { useEffect } from "react";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

export default function CollectionViewed({ collection, productCount }: { collection: string; productCount: number }) {
  useEffect(() => {
    capture(analyticsEvents.collectionViewed, { collection, product_count: productCount });
  }, [collection, productCount]);
  return null;
}
