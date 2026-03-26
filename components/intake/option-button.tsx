"use client";

import React from "react";

export function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="text-left px-4 py-3 border font-mono text-xs uppercase tracking-wide transition-all"
      style={{
        backgroundColor: selected ? "var(--blue)" : "var(--bg-white)",
        color: selected ? "white" : "var(--text-body)",
        borderColor: selected ? "var(--blue)" : "var(--border)",
        borderRadius: "4px",
      }}
    >
      {children}
    </button>
  );
}
