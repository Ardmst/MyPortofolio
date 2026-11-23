"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface DetektifPlayerProps {
  videoWebm?: string;
  videoMp4?: string;
  poster?: string;
  downloadUrl?: string;
}

export function DetektifPlayer({
  videoWebm = "/work/detektif-ekosistem/menu-loop.webm",
  videoMp4 = "/work/detektif-ekosistem/menu-loop.mp4",
  poster = "/work/detektif-ekosistem/stage-poster.webp",
  downloadUrl = "/detektif-ekosistem/download",
}: DetektifPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play muted video preview on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const onFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div className="detektif-player-wrap">
      {/* Looping Homescreen Video Showcase Box */}
      <div
        ref={containerRef}
        className={`detektif-player-box ${isFullscreen ? "is-fullscreen" : ""}`}
      >
        <div className="detektif-video-wrap">
          <video
            ref={videoRef}
            className="detektif-video-element"
            poster={poster}
            muted
            loop
            playsInline
            autoPlay
          >
            <source src={videoWebm} type="video/webm" />
            <source src={videoMp4} type="video/mp4" />
          </video>
        </div>

        {/* Floating Controls Overlay (Fullscreen Toggle) */}
        <div className="detektif-float-controls">
          <button
            type="button"
            className="detektif-pill-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 1v4H1M11 1v4h4M5 15v-4H1M11 15v-4h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 5V1h4M15 5V1h-4M1 11v4h4M15 11v4h-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Direct Auto-Download Gateway Action Button */}
      <div className="detektif-actions-group">
        <a
          className="button detektif-primary-btn"
          href={downloadUrl}
          download="DetektifEkosistem.exe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Download Game (.exe)</span>
          <span className="detektif-btn-badge">270 MB · Windows</span>
        </a>
      </div>

      <p className="small muted detektif-player-note">
        * Unduh versi desktop (.exe) untuk memainkan game dengan audio jernih dan performa penuh di PC (Portable Standalone, langsung jalan tanpa instalasi).
      </p>
    </div>
  );
}
