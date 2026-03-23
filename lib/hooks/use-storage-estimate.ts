"use client";

import { useEffect, useState } from "react";

interface StorageEstimateState {
  usage: number | null;
  quota: number | null;
  supported: boolean;
}

export function useStorageEstimate() {
  const [estimate, setEstimate] = useState<StorageEstimateState>({
    usage: null,
    quota: null,
    supported: false,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      return;
    }

    void navigator.storage.estimate().then((result) => {
      setEstimate({
        usage: result.usage ?? null,
        quota: result.quota ?? null,
        supported: true,
      });
    });
  }, []);

  return estimate;
}
