import React from "react";

export const byPrefixAndName = {
  fab: {
    "google-play": "fa-brands fa-google-play",
    "app-store-ios": "fa-brands fa-app-store-ios",
  },
} as const;

export function FontAwesomeIcon({
  icon,
  className,
  title,
}: {
  icon: string;
  className?: string;
  title?: string;
}) {
  return (
    <i
      className={`${icon} ${className ?? ""}`}
      aria-hidden="true"
      title={title}
    />
  );
}
