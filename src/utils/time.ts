/**
 * Time calculation and formatting utilities for the countdown
 */

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isExpired: boolean;
  formattedDays: string;
  formattedHours: string;
  formattedMinutes: string;
  formattedSeconds: string;
  formattedMs: string;
}

/** Snapshot of the digits currently painted by the canvas. */
export interface DisplayTime {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  /** Whole seconds left on the execution clock */
  totalSeconds: number;
  isZero: boolean;
  isCinematic: boolean;
}

export function padZero(num: number, targetLength = 2): string {
  const s = Math.max(0, Math.floor(num)).toString();
  return s.padStart(targetLength, '0');
}

export function calculateTimeRemaining(targetTimestamp: number, currentTimestamp: number = Date.now()): TimeRemaining {
  const diff = targetTimestamp - currentTimestamp;
  const isExpired = diff <= 0;
  const safeDiff = Math.max(0, diff);

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const days = Math.floor(safeDiff / MS_PER_DAY);
  const hours = Math.floor((safeDiff % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((safeDiff % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((safeDiff % MS_PER_MINUTE) / MS_PER_SECOND);
  const milliseconds = safeDiff % MS_PER_SECOND;

  return {
    totalMs: safeDiff,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    isExpired,
    formattedDays: padZero(days, 2),
    formattedHours: padZero(hours, 2),
    formattedMinutes: padZero(minutes, 2),
    formattedSeconds: padZero(seconds, 2),
    formattedMs: padZero(Math.floor(milliseconds / 10), 2),
  };
}

export function formatDurationToParts(totalSeconds: number): { days: number; hours: number; minutes: number; seconds: number } {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSec / 86400);
  const hours = Math.floor((safeSec % 86400) / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;
  return { days, hours, minutes, seconds };
}

export function displayTimeFromSeconds(
  totalSeconds: number,
  isCinematic = false,
): DisplayTime {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return {
    days: padZero(days),
    hours: padZero(hours),
    minutes: padZero(minutes),
    seconds: padZero(seconds),
    totalSeconds: safe,
    isZero: safe <= 0,
    isCinematic,
  };
}

// Exactly matches user's uploaded videoframe_183295_b04f7a20.png: 02:00:35:48
export const USER_IMAGE_START_SECONDS =
  2 * 86400 + 0 * 3600 + 35 * 60 + 48;

// Trailer video opening: 41:00:35:50
export const TRAILER_VIDEO_SECONDS =
  41 * 86400 + 0 * 3600 + 35 * 60 + 50;

// Thumbnail teaser: 41:23:59:59
export const SCREENSHOT_TOTAL_SECONDS =
  41 * 86400 + 23 * 3600 + 59 * 60 + 59;

// Warp jump phase: 30:00:00:00
export const WARP_JUMP_SECONDS = 30 * 86400;

// Phase 3: 29:23:59:59
export const PHASE3_SECONDS =
  29 * 86400 + 23 * 3600 + 59 * 60 + 59;

// Climax spectral surge phase from videoframe_193516.png: 01:00:00:01
export const CLIMAX_SURGE_SECONDS =
  1 * 86400 + 0 * 3600 + 0 * 60 + 1;

/**
 * Genshin Impact 7.2 reset: 16 December 2026, 10:00 WIB (UTC+7), the end of the
 * Asia maintenance window (11:00 UTC+8) and 42 days after 7.1.
 *
 * Stored as an absolute instant, so every visitor counts down to the same
 * moment no matter which timezone their clock is set to.
 */
export const DEFAULT_TARGET_TIMESTAMP = new Date('2026-12-16T10:00:00+07:00').getTime();
