// Radar rules: when the player has arrived, how fast the radar pulses, which colour the target takes.

export const ARRIVAL_RADIUS_M = 15;
const READINGS_TO_ARRIVE = 2;

export type ArrivalState = { inside: number; arrived: boolean };
export const initialArrival: ArrivalState = { inside: 0, arrived: false };

// Arrival needs READINGS_TO_ARRIVE consecutive readings within the radius (one reading can be a GPS jump).
// `arrived` is true only on the reading that triggers the arrival.
export function nextArrival(state: ArrivalState, distance: number): { state: ArrivalState; arrived: boolean } {
  if (state.arrived || !Number.isFinite(distance)) return { state, arrived: false };
  const inside = distance <= ARRIVAL_RADIUS_M ? state.inside + 1 : 0;
  const arrived = inside >= READINGS_TO_ARRIVE;
  return { state: { inside, arrived }, arrived };
}

const SLOW_S = 2.0;
const FAST_S = 0.4;
const FAR_M = 200;

// Pulse period: 2.0 s at 200 m and beyond, 0.4 s at the arrival radius and closer, linear in between.
export function pulseIntervalSeconds(distance: number): number {
  if (!Number.isFinite(distance)) return SLOW_S;
  const t = FAST_S + ((distance - ARRIVAL_RADIUS_M) * (SLOW_S - FAST_S)) / (FAR_M - ARRIVAL_RADIUS_M);
  return Math.min(SLOW_S, Math.max(FAST_S, t));
}

const FEEDBACK_M = 50;
const WARM_M = 150;

// Ping sound and haptic tick only near the place (a 2-hour walk of beeping would be unbearable).
export function proximityFeedback(distance: number): boolean {
  return Number.isFinite(distance) && distance <= FEEDBACK_M;
}

export type ProximityZone = 'cold' | 'warm' | 'hot';

export function proximityZone(distance: number): ProximityZone {
  if (!Number.isFinite(distance) || distance > WARM_M) return 'cold';
  return distance >= FEEDBACK_M ? 'warm' : 'hot';
}

export function mapsDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
}

export type ArrivalMethod = 'auto' | 'manual' | 'manual_no_gps';

// Manual arrivals without a position fix are reported apart: they say nothing about the place's coordinates.
export function arrivalMethod(kind: 'auto' | 'manual', hasFix: boolean): ArrivalMethod {
  if (kind === 'auto') return 'auto';
  return hasFix ? 'manual' : 'manual_no_gps';
}

const DIAL_RANGE_M = 250;

// Position of the target on the dial, 0 (centre) .. 1 (rim): square root so that the last metres are visible.
export function dialRadius(distance: number): number {
  if (!Number.isFinite(distance)) return 1;
  return Math.min(1, Math.sqrt(Math.max(0, distance) / DIAL_RANGE_M));
}
