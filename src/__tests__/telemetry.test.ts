import { logEvent, setConsent } from '@react-native-firebase/analytics';

import { sanitizeParams } from '../telemetry/events';
import { applyConsent, track } from '../telemetry/telemetry';

describe('sanitizeParams', () => {
  it('keeps numbers and short enums', () => {
    expect(sanitizeParams({ level: 2, score: 1500, mode: 'hard' })).toEqual({ level: 2, score: 1500, mode: 'hard' });
  });

  it('drops anything that could carry personal data', () => {
    expect(
      sanitizeParams({ email: 'x', user_name: 'x', device_id: 'x', city: 'Paris (free text)', note: 'Hello World', ok: true }),
    ).toEqual({ ok: 1 });
  });
});

describe('telemetry consent', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends nothing without consent', async () => {
    await applyConsent(false);
    track('adventure_start', { resumed: false, step: 0 });
    expect(logEvent).not.toHaveBeenCalled();
    expect(setConsent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ analytics_storage: false, ad_storage: false }));
  });

  it('sends typed events after consent, never ad storage', async () => {
    await applyConsent(true);
    track('riddle_solved', { step: 3, first_try: true, wrong: 0 });
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'riddle_solved', { step: 3, first_try: 1, wrong: 0 });
    expect(setConsent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ analytics_storage: true, ad_storage: false }));
  });
});
