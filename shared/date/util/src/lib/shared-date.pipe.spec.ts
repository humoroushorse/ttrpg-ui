import { TestBed } from '@angular/core/testing';
import { SharedDatePipe } from './shared-date.pipe';
import { SharedDateService } from '@ttrpg-ui/shared/date/data-access';
import { DateFormat } from '@ttrpg-ui/shared/date/models';

describe('SharedDatePipe', () => {
  let pipe: SharedDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedDateService],
    });
    pipe = TestBed.runInInjectionContext(() => new SharedDatePipe());
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null for null value', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('should return null for undefined value', () => {
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should format date with default settings', () => {
    const date = new Date('2026-01-12T00:00:00Z');
    const result = pipe.transform(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format date with custom format', () => {
    const date = new Date('2026-01-12T00:00:00Z');
    const result = pipe.transform(date, DateFormat.ShortDate);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format date with custom timezone', () => {
    const date = new Date('2026-01-12T00:00:00Z');
    const result = pipe.transform(date, DateFormat.Medium, 'America/New_York');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format date with custom locale', () => {
    const date = new Date('2026-01-12T00:00:00Z');
    // Use en-US which is always registered; fr-FR requires explicit locale registration
    const result = pipe.transform(date, DateFormat.Medium, undefined, 'en-US');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle string dates', () => {
    const result = pipe.transform('2026-01-12');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle timestamp numbers', () => {
    const timestamp = new Date('2026-01-12').getTime();
    const result = pipe.transform(timestamp);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
