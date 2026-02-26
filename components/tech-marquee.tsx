"use client";

const TECH_LOGOS = [
  { name: "Next.js", domain: "nextjs.org" },
  { name: "React", domain: "react.dev" },
  { name: "TypeScript", domain: "typescriptlang.org" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Clerk", domain: "clerk.com" },
  { name: "Neon", domain: "neon.tech" },
  { name: "Prisma", domain: "prisma.io" },
  { name: "Resend", domain: "resend.com" },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Tailwind", domain: "tailwindcss.com" },
  { name: "Upstash", domain: "upstash.com" },
  { name: "shadcn/ui", domain: "ui.shadcn.com" },
];

export function TechMarquee() {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-cream to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-cream to-transparent z-10" />
      <div className="flex animate-marquee">
        {[...TECH_LOGOS, ...TECH_LOGOS].map((tech, i) => (
          <div
            key={`${tech.name}-${i}`}
            className="flex items-center gap-2 px-6 py-3 flex-shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${tech.domain}&sz=32`}
              alt={tech.name}
              width={16}
              height={16}
              className="w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-mono text-xs text-neutral-500 whitespace-nowrap">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
