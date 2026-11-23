"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface DetektifPlayerProps {
  videoWebm?: string;
  videoMp4?: string;
  poster: string;
  gameSrc: string;
  downloadUrl: string;
}

export function DetektifPlayer({
  videoWebm = "/work/detektif-ekosistem/menu-loop.webm",
  videoMp4 = "/work/detektif-ekosistem/menu-loop.mp4",
  poster = "/work/detektif-ekosistem/stage-poster.webp",
  gameSrc = "/games/detektif/index.html",
  downloadUrl = "https://drive.google.com/file/d/1vG9aKz4sgGhr4X1aoxixbJWitFqMHBbx/view",
}: DetektifPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play video loop in preview mode
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;
    video.play().catch(() => {});
  }, [isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const onFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // Listen to audio status messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "godot_audio_status") {
        if (typeof event.data.muted === "boolean") {
          setIsMuted(event.data.muted);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleStartPlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsLoading(true);
    }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    setRunKey((k) => k + 1);
    setIsLoading(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    try {
      const frame = frameRef.current;
      if (frame && frame.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.postMessage("toggle_audio", "*");
      }
      setIsMuted((prev) => !prev);
    } catch {}
  }, []);

  const onFrameLoad = () => {
    setIsLoading(false);
    try {
      const frame = frameRef.current;
      if (frame && frame.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.postMessage("resume_audio", "*");
      }
    } catch {}
  };

  return (
    <div className="detektif-player-wrap">
      {/* Media / Game Canvas Container */}
      <div
        ref={containerRef}
        className={`detektif-player-box ${isFullscreen ? "is-fullscreen" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isPlaying ? (
          /* Video Loop with Hover Play Button */
          <div
            className="detektif-video-wrap"
            onClick={handleStartPlay}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleStartPlay();
            }}
            aria-label="Klik untuk memainkan Detektif Ekosistem di browser"
          >
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

            {/* Hover Play Button Overlay */}
            <div className={`detektif-hover-overlay ${isHovered ? "is-visible" : ""}`}>
              <div className="detektif-play-badge">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="detektif-hover-text">KLIK UNTUK MAIN</span>
            </div>
          </div>
        ) : (
          /* Live Running Game IFrame */
          <div className="detektif-frame-wrap">
            <iframe
              key={runKey}
              ref={frameRef}
              className="detektif-iframe"
              src={gameSrc}
              title="Detektif Ekosistem Game Web"
              allow="autoplay; fullscreen; gamepad"
              onLoad={onFrameLoad}
            />

            {isLoading && (
              <div className="detektif-loader-badge">
                <span>Memuat Engine Godot (~48 MB)...</span>
              </div>
            )}

            {/* Single Unified In-Game Floating Controls */}
            <div className="detektif-float-controls">
              {/* 1. Audio Toggle (Mute / Unmute) */}
              <button
                type="button"
                className="detektif-pill-btn"
                onClick={toggleMute}
                title={isMuted ? "Klik untuk mengaktifkan suara" : "Klik untuk mute suara"}
                aria-label={isMuted ? "Unmute suara" : "Mute suara"}
              >
                {isMuted ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                    <span>Mute</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                    </svg>
                    <span>Suara On</span>
                  </>
                )}
              </button>

              {/* 2. Fullscreen Toggle */}
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

              {/* 3. Restart Game */}
              <button
                type="button"
                className="detektif-pill-btn"
                onClick={handleRestart}
                title="Mulai Ulang Game"
                aria-label="Restart game"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 8a7 7 0 1 0 2-4.9L1 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 1v4h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Restart</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Under the Media Box (Clean, No Duplicate Buttons) */}
      <div className="detektif-actions-group">
        {!isPlaying ? (
          <button
            type="button"
            className="button detektif-primary-btn"
            onClick={handleStartPlay}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play it here</span>
          </button>
        ) : null}

        <a
          className="button detektif-download-btn"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Download Game (.exe)</span>
        </a>
      </div>
    </div>
  );
}
