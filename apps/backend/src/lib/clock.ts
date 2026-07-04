/*
 * Central clock for the backend. Everything that needs "the current time" (the alert
 * engine and the device simulator) reads it through getNow() instead of calling
 * new Date() directly. In normal operation getNow() returns the real wall-clock time.
 *
 * For live demos we can pin a "demo time" (e.g. 22:00) so the after-hours alert rule
 * fires in daylight. The demo clock is not frozen: it keeps ticking forward in real
 * time from the moment it was set, so time-based logic (durations, resolution) still
 * behaves naturally on screen.
 */

type DemoAnchor = {
  baseRealMs: number;
  baseDemoMs: number;
};

let demoAnchor: DemoAnchor | null = null;

export function setDemoTime(date: Date | null): void {
  if (!date) {
    demoAnchor = null;
    return;
  }

  demoAnchor = {
    baseRealMs: Date.now(),
    baseDemoMs: date.getTime(),
  };
}

export function getNow(): Date {
  if (!demoAnchor) {
    return new Date();
  }

  const elapsed = Date.now() - demoAnchor.baseRealMs;
  return new Date(demoAnchor.baseDemoMs + elapsed);
}

export function getDemoTime(): Date | null {
  if (!demoAnchor) {
    return null;
  }

  return getNow();
}
