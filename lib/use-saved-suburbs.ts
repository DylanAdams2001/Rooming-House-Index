"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rhi:saved-suburbs";

export function useSavedSuburbs() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setSavedIds(raw ? JSON.parse(raw) : []);
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback((ids: string[]) => {
    setSavedIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSaved = useCallback(
    (id: string) => {
      persist(
        savedIds.includes(id) ? savedIds.filter((s) => s !== id) : [...savedIds, id]
      );
    },
    [savedIds, persist]
  );

  const removeSaved = useCallback(
    (id: string) => {
      persist(savedIds.filter((s) => s !== id));
    },
    [savedIds, persist]
  );

  return { savedIds, loaded, isSaved, toggleSaved, removeSaved };
}
