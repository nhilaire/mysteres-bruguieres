// Position maths of the radar. Pure functions, angles in degrees clockwise from north.

const EARTH_RADIUS_M = 6371000;
const NBSP = ' ';
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const normalize = (deg: number) => ((deg % 360) + 360) % 360;

export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return normalize(toDeg(Math.atan2(y, x)));
}

export type Cardinal = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
const CARDINALS: Cardinal[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export function bearingToCardinal(bearing: number): Cardinal {
  return CARDINALS[Math.round(normalize(bearing) / 45) % 8];
}

// "850 m" below 1 km, "1.25 km" above; French uses a decimal comma and a no-break space before the unit.
export function formatDistance(meters: number, language: string): string {
  if (!Number.isFinite(meters)) return '—';
  const french = language === 'fr';
  const space = french ? NBSP : ' ';
  if (meters < 999.5) return `${Math.round(meters)}${space}m`;
  const km = (meters / 1000).toFixed(2);
  return `${french ? km.replace('.', ',') : km}${space}km`;
}

export type Vector3 = { x: number; y: number; z: number };

// Heading from raw magnetometer + accelerometer, compensating the phone's tilt (fallback when the native heading
// is not available).
export function compensatedHeading(mag: Vector3, accel: Vector3): number {
  const pitch = Math.atan2(-accel.x, Math.sqrt(accel.y ** 2 + accel.z ** 2));
  const roll = Math.atan2(accel.y, accel.z);
  const magX = mag.x * Math.cos(pitch) + mag.z * Math.sin(pitch);
  const magY = mag.x * Math.sin(roll) * Math.sin(pitch) + mag.y * Math.cos(roll) - mag.z * Math.sin(roll) * Math.cos(pitch);
  return normalize(toDeg(Math.atan2(-magY, magX)));
}

// Signed difference from `from` to `to` in (-180, 180].
export function shortestDelta(from: number, to: number): number {
  const d = normalize(to - from);
  return d > 180 ? d - 360 : d;
}

// One smoothing step of the arrow: moves `current` a fraction of the shortest way towards `target`. The result is
// not wrapped to [0, 360) so that a rotation animation never spins the long way round.
export function approachAngle(current: number, target: number, factor: number): number {
  return current + shortestDelta(current, target) * factor;
}
