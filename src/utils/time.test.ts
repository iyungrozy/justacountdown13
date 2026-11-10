import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeRemaining,
  padZero,
  USER_IMAGE_START_SECONDS,
  TRAILER_VIDEO_SECONDS,
  SCREENSHOT_TOTAL_SECONDS,
  WARP_JUMP_SECONDS,
} from './time';

test('padZero formats single and multiple digits correctly', () => {
  assert.equal(padZero(5), '05');
  assert.equal(padZero(0), '00');
  assert.equal(padZero(41), '41');
  assert.equal(padZero(2), '02');
});

test('calculateTimeRemaining returns exact values for user image frame (02:00:35:48)', () => {
  const now = 1700000000000;
  const target = now + USER_IMAGE_START_SECONDS * 1000;
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.days, 2);
  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 35);
  assert.equal(res.seconds, 48);
  assert.equal(res.formattedDays, '02');
  assert.equal(res.formattedHours, '00');
  assert.equal(res.formattedMinutes, '35');
  assert.equal(res.formattedSeconds, '48');
});

test('calculateTimeRemaining returns exact values for video start (41:00:35:50)', () => {
  const now = 1700000000000;
  const target = now + TRAILER_VIDEO_SECONDS * 1000;
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.days, 41);
  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 35);
  assert.equal(res.seconds, 50);
});

test('calculateTimeRemaining handles warp jump target (30:00:00:00)', () => {
  const now = 1700000000000;
  const target = now + WARP_JUMP_SECONDS * 1000;
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.days, 30);
  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 0);
  assert.equal(res.seconds, 0);
});
