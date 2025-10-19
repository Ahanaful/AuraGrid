"use client";

import { useEffect } from "react";

const KEYLESS_COPY = "Clerk is in keyless mode";

export function KeylessToastElevator() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") {
      return;
    }

    const elevate = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>("[data-cl-component]")
      );

      const keylessCard = candidates.find(
        (el) => !!el.textContent && el.textContent.includes(KEYLESS_COPY)
      );

      if (!keylessCard) {
        return;
      }

      const container = keylessCard.closest<HTMLElement>("[data-cl-component]") ?? keylessCard;

      container.style.setProperty("position", "fixed", "important");
      container.style.setProperty("right", "1.5rem", "important");
      container.style.setProperty("bottom", "1.5rem", "important");
      container.style.setProperty("left", "auto", "important");
      container.style.setProperty("top", "auto", "important");
      container.style.setProperty("z-index", "2147483647", "important");
      container.style.setProperty("pointer-events", "auto", "important");
      container.style.setProperty("margin", "0", "important");
      container.style.setProperty("transform", "none", "important");
    };

    const observer = new MutationObserver(() => elevate());
    observer.observe(document.body, { childList: true, subtree: true });

    elevate();

    return () => observer.disconnect();
  }, []);

  return null;
}
