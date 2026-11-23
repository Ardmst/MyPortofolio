"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface DetektifPlayerProps {
  videoWebm?: string;
  videoMp4?: string;
  poster?: string;
  themeAudio?: string;
  downloadUrl?: string;
  mirrorUrl?: string;
}

export function DetektifPlayer({
  videoWebm = "/work/detektif-ekosistem/menu-loop.webm",
  videoMp4 = "/work/detektif-ekosistem/menu-loop.mp4",
  poster = "/work/detektif-ekosistem/stage-poster.webp",
  themeAudio = "/work/detektif-ekosistem/theme.mp3",
  downloadUrl = "/detektif-ekosistem/download",
  mirrorUrl = "https://drive.google.com/file/d/1vG9aKz4sgGhr4X1aoxixbJWitFqMHBbx/view",
}: DetektifPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  }, [isPlayingAudio]);

  return (
    <div className="detektif-player-wrap">
      {/* Hidden Native Audio Element for BGM Playback */}
      <audio ref={audioRef} src={themeAudio} loop preload="none" />

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

        {/* Floating Controls Overlay on Video Preview */}
        <div className="detektif-float-controls">
          {/* Audio BGM Toggle */}
          <button
            type="button"
            className="detektif-pill-btn"
            onClick={toggleAudio}
            title={isPlayingAudio ? "Matikan Musik Latar" : "Putar Musik Latar (BGM)"}
            aria-label={isPlayingAudio ? "Matikan BGM" : "Putar BGM"}
          >
            {isPlayingAudio ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                </svg>
                <span>BGM Nyala</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>BGM Mati</span>
              </>
            )}
          </button>

          {/* Fullscreen Preview Toggle */}
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

      {/* Direct Auto-Download Gateway Action Buttons */}
      <div className="detektif-actions-group">
        <a
          className="button detektif-primary-btn detektif-download-main-btn"
          href={downloadUrl}
          download="DetektifEkosistem.exe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Download Game (.exe)</span>
          <span className="detektif-btn-badge">270 MB</span>
        </a>

        <a
          className="button detektif-download-btn"
          href={mirrorUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Buka cadangan link Google Drive"
        >
          <span>Mirror Google Drive</span>
        </a>
      </div>

      <p className="small muted detektif-player-note">
        * File otomatis terunduh langsung ke komputer Anda (Portable Standalone untuk Windows 10/11 64-bit, langsung main tanpa instalasi).
      </p>
    </div>
  );
}
