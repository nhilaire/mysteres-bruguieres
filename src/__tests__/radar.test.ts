import {
  ARRIVAL_RADIUS_M,
  arrivalMethod,
  initialArrival,
  mapsDirectionsUrl,
  nextArrival,
  proximityFeedback,
  proximityZone,
  pulseIntervalSeconds,
} from '../game/radar';

function feed(distances: number[]) {
  let state = initialArrival;
  const arrivals: boolean[] = [];
  for (const d of distances) {
    const result = nextArrival(state, d);
    state = result.state;
    arrivals.push(result.arrived);
  }
  return arrivals;
}

describe('arrival detection', () => {
  it('uses a 15 m radius', () => {
    expect(ARRIVAL_RADIUS_M).toBe(15);
  });

  it('does not arrive on 20 m then 14 m', () => {
    expect(feed([20, 14])).toEqual([false, false]);
  });

  it('arrives once on 14 m then 12 m, never again after', () => {
    expect(feed([14, 12, 10, 9])).toEqual([false, true, false, false]);
  });

  it('needs two consecutive readings: a jump out resets the count', () => {
    expect(feed([14, 30, 14, 15])).toEqual([false, false, false, true]);
  });

  it('ignores unknown distances', () => {
    expect(feed([14, Number.NaN, 13])).toEqual([false, false, true]);
  });
});

describe('proximity rhythm', () => {
  it.each([
    [300, 2.0],
    [200, 2.0],
    [107.5, 1.2],
    [15, 0.4],
    [5, 0.4],
  ])('pulses every %d m -> %d s', (distance, seconds) => {
    expect(pulseIntervalSeconds(distance)).toBeCloseTo(seconds, 6);
  });

  it('uses the slowest pulse when the distance is unknown', () => {
    expect(pulseIntervalSeconds(Number.NaN)).toBe(2.0);
  });

  it.each([
    [51, false],
    [50, true],
    [10, true],
  ])('ping and haptic ticks at %d m: %s', (distance, enabled) => {
    expect(proximityFeedback(distance)).toBe(enabled);
  });

  it.each([
    [400, 'cold'],
    [150.1, 'cold'],
    [150, 'warm'],
    [50, 'warm'],
    [49.9, 'hot'],
    [3, 'hot'],
  ] as const)('colours the blip at %d m as %s', (distance, zone) => {
    expect(proximityZone(distance)).toBe(zone);
  });

  it('shows the cold colour when the distance is unknown', () => {
    expect(proximityZone(Number.NaN)).toBe('cold');
  });
});

describe('help buttons', () => {
  it('opens walking directions to the target', () => {
    expect(mapsDirectionsUrl(43.727059, 1.411985)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=43.727059,1.411985&travelmode=walking',
    );
  });

  it.each([
    ['auto', true, 'auto'],
    ['auto', false, 'auto'],
    ['manual', true, 'manual'],
    ['manual', false, 'manual_no_gps'],
  ] as const)('reports a %s arrival with fix=%s as %s', (kind, hasFix, method) => {
    expect(arrivalMethod(kind, hasFix)).toBe(method);
  });
});
