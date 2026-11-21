"use client";

import { useEffect } from "react";
import { markAlertsSeen } from "@/features/notifications/actions";

export default function MarkAlertsSeen() {
  useEffect(() => {
    markAlertsSeen();
  }, []);
  return null;
}
