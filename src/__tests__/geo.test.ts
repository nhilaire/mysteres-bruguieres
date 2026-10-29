import {
  approachAngle,
  bearingDegrees,
  bearingToCardinal,
  compensatedHeading,
  distanceMeters,
  formatDistance,
  shortestDelta,
} from '../game/geo';

const NBSP = '\u00a0';
// One degree along a meridian (or the equator) on a sphere of radius 6 371 km.
const ONE_DEGREE_M = (6371000 * Math.PI) / 180;

describe('distanceMeters (Haversine)', () => {
  it('is 0 for the same point', () => {
    expect(distanceMeters(43.72706, 1.41198, 43.72706, 1.41198)).toBe(0);
  });

  it('matches one degree of latitude within 0.5 m', () => {
    expect(Math.abs(distanceMeters(43, 1.4, 44, 1.4) - ONE_DEGREE_M)).toBeLessThan(0.5);
  });

  it('matches one degree of longitude on the equator within 0.5 m', () => {
    expect(Math.abs(distanceMeters(0, 1, 0, 2) - ONE_DEGREE_M)).toBeLessThan(0.5);
  });

  it('gives a plausible town-centre distance (town hall to chess table, about 690 m)', () => {
    const d = distanceMeters(43.727059034536445, 1.4119849607099955, 43.731519116926385, 1.4057092818924328);
    expect(d).toBeGreaterThan(650);
    expect(d).toBeLessThan(730);
  });
});

describe('bearing and cardinal direction', () => {
  it.each([
    ['n', 44, 1.4],
    ['e', 43, 1.5],
    ['s', 42, 1.4],
    ['w', 43, 1.3],
  ])('points %s', (cardinal, lat, lon) => {
    expect(bearingToCardinal(bearingDegrees(43, 1.4, lat, lon))).toBe(cardinal);
  });

  it.each([
    [0, 'n'],
    [45, 'ne'],
    [90, 'e'],
    [135, 'se'],
    [180, 's'],
    [225, 'sw'],
    [270, 'w'],
    [315, 'nw'],
    [359, 'n'],
    [-45, 'nw'],
    [22, 'n'],
    [23, 'ne'],
  ] as const)('maps %d° to %s', (bearing, cardinal) => {
    expect(bearingToCardinal(bearing)).toBe(cardinal);
  });
});

describe('formatDistance', () => {
  it('shows metres below 1 km, rounded to the metre', () => {
    expect(formatDistance(850.4, 'en')).toBe('850 m');
    expect(formatDistance(850.4, 'fr')).toBe(`850${NBSP}m`);
    expect(formatDistance(999.4, 'en')).toBe('999 m');
    expect(formatDistance(999.6, 'en')).toBe('1.00 km');
  });

  it('shows km with 2 decimals from 1 km, decimal comma in French', () => {
    expect(formatDistance(1249, 'en')).toBe('1.25 km');
    expect(formatDistance(1249, 'fr')).toBe(`1,25${NBSP}km`);
    expect(formatDistance(1000, 'en')).toBe('1.00 km');
  });

  it('shows a dash when unknown', () => {
    expect(formatDistance(Number.NaN, 'en')).toBe('—');
  });
});

describe('compass helpers', () => {
  it('reads north when the phone lies flat with the magnetic field along +x', () => {
    expect(compensatedHeading({ x: 30, y: 0, z: -40 }, { x: 0, y: 0, z: 1 })).toBeCloseTo(0, 5);
  });

  it('reads east when the field is along -y', () => {
    expect(compensatedHeading({ x: 0, y: -30, z: -40 }, { x: 0, y: 0, z: 1 })).toBeCloseTo(90, 5);
  });

  it('takes the shortest way round', () => {
    expect(shortestDelta(350, 10)).toBe(20);
    expect(shortestDelta(10, 350)).toBe(-20);
    expect(shortestDelta(0, 180)).toBe(180);
    expect(shortestDelta(720, 30)).toBe(30);
  });

  it('smooths an arrow from 350° to 10° through 0°, never through 180°', () => {
    let angle = 350;
    const seen: number[] = [];
    for (let i = 0; i < 40; i++) {
      angle = approachAngle(angle, 10, 0.25);
      seen.push(((angle % 360) + 360) % 360);
    }
    seen.forEach((a) => expect(a < 15 || a > 345).toBe(true));
    expect(Math.abs(shortestDelta(angle, 10))).toBeLessThan(0.01);
  });
});
