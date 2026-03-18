'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, ArrowUpRight } from 'lucide-react'

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Wholesail'
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/wholesailhub/'
const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '@wholesailhub'

const FAN_IMAGES = [
  { src: '/food-1.jpg', alt: `Partner creation — ${BRAND_NAME}` },
  { src: '/food-2.jpg', alt: `Product showcase — ${BRAND_NAME}` },
  { src: '/food-3.jpg', alt: `Featured product — ${BRAND_NAME}` },
  { src: '/food-4.jpg', alt: `Partner spotlight — ${BRAND_NAME}` },
  { src: '/food-5.jpg', alt: `Product highlight — ${BRAND_NAME}` },
]

function StaticGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {FAN_IMAGES.map((img, i) => (
          <a
            key={i}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden bg-[#F5F3F0] group"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain group-hover:scale-[1.03] transition-transform duration-700"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </a>
        ))}
      </div>
      <a
        href="https://www.instagram.com/wholesailhub/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full border border-[#0A0A0A] text-[#0A0A0A] py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
      >
        <Instagram className="h-4 w-4" />
        Follow {INSTAGRAM_HANDLE} on Instagram
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

export function InstagramFeed() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Wire up Mirror App auto-resize once both script and iframe are ready
  useEffect(() => {
    if (scriptReady && iframeLoaded && iframeRef.current) {
      const setup = window.iFrameSetup
      if (typeof setup === 'function') setup(iframeRef.current)
    }
  }, [scriptReady, iframeLoaded])

  // If the iframe hasn't loaded within 8 s, fall back to static grid
  useEffect(() => {
    if (iframeLoaded) return
    const t = setTimeout(() => setShowFallback(true), 8000)
    return () => clearTimeout(t)
  }, [iframeLoaded])

  // Render static grid on mobile always, or on desktop when iframe timed out
  if (showFallback) {
    return <StaticGrid />
  }

  return (
    <>
      {/* Desktop: Mirror App iframe with race-condition-safe setup */}
      <div className="hidden md:block">
        <Script
          src="https://cdn.jsdelivr.net/npm/@mirrorapp/iframe-bridge@latest/dist/index.umd.js"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
        <iframe
          ref={iframeRef}
          onLoad={() => setIframeLoaded(true)}
          src="https://app.mirror-app.com/feed-instagram/c3d7362d-b7a9-46dc-80fd-caedde01c5e6/preview"
          style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
          title={`${BRAND_NAME} Instagram Feed`}
        />
      </div>

      {/* Mobile: static image grid + Instagram CTA */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-1 mb-6">
          {FAN_IMAGES.map((img, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative aspect-square overflow-hidden bg-[#F5F3F0]${i === 0 ? ' col-span-2' : ''}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-contain"
                sizes={i === 0 ? '100vw' : '50vw'}
              />
            </a>
          ))}
        </div>
        <a
          href="https://www.instagram.com/wholesailhub/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full border border-[#0A0A0A] text-[#0A0A0A] py-3.5 text-sm font-medium hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors"
        >
          <Instagram className="h-4 w-4" />
          Follow {INSTAGRAM_HANDLE} on Instagram
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </>
  )
}
