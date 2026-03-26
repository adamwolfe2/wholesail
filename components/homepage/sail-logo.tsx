/* ── Wholesail Sail Logo ─────────────────────────────────────────────── */
export function SailLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main sail -- tall, angular triangle */}
      <path
        d="M16 2L16 28L6 28C6 28 14 16 16 2Z"
        fill="var(--blue)"
        opacity="0.9"
      />
      {/* Secondary sail -- shorter, overlapping */}
      <path
        d="M18 8L18 28L26 28C26 28 20 18 18 8Z"
        fill="var(--blue)"
        opacity="0.55"
      />
      {/* Waterline */}
      <path
        d="M4 29L28 29"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
