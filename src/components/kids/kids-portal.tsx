"use client";

import { useState, useEffect } from "react";
import { getActiveDeviceId } from "@/lib/device-store";
import { DevicePinEntry } from "@/components/kids/device-pin-entry";
import { LearnerPicker } from "@/components/kids/learner-picker";

export function KidsPortal() {
  const [showPin, setShowPin] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const activeDevice = getActiveDeviceId();
    // If no device is active, show PIN entry
    // If device is active, show learner picker
    setShowPin(!activeDevice);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  if (showPin) {
    return <DevicePinEntry />;
  }

  return <LearnerPicker />;
}
