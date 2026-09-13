"use client";

import { useEffect } from "react";
import { startSyncLoop, SYNC_EVENT } from "@/lib/sync/engine";

/**
 * Start the background sync loop and invoke `onRefresh` whenever fresh
 * remote data lands in the local cache (SYNC_EVENT) or another tab
 * writes localStorage.
 */
export function useSyncRefresh(onRefresh: () => void) {
  useEffect(() => {
    const stopSync = startSyncLoop();
    window.addEventListener(SYNC_EVENT, onRefresh);
    window.addEventListener("storage", onRefresh);
    return () => {
      stopSync();
      window.removeEventListener(SYNC_EVENT, onRefresh);
      window.removeEventListener("storage", onRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
