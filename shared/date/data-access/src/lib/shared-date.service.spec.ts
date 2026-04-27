import { TestBed } from '@angular/core/testing';
import { SharedDateService } from './shared-date.service';
import { DateFormat } from '@ttrpg-ui/shared/date/models';

describe('SharedDateService', () => {
  let service: SharedDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect timezone', () => {
    const timezone = service.timezone();
    expect(timezone).toBeTruthy();
    expect(typeof timezone).toBe('string');
  });

  it('should detect locale', () => {
    const locale = service.locale();
    expect(locale).toBeTruthy();
    expect(typeof locale).toBe('string');
  });

  it('should have default date format', () => {
    expect(service.dateFormat()).toBe(DateFormat.Medium);
  });

  it('should set timezone', () => {
    service.setTimezone('America/New_York');
    expect(service.timezone()).toBe('America/New_York');
  });

  it('should set locale', () => {
    service.setLocale('en-GB');
    expect(service.locale()).toBe('en-GB');
  });

  it('should set date format', () => {
    service.setDateFormat(DateFormat.Long);
    expect(service.dateFormat()).toBe(DateFormat.Long);
  });

  it('should return common timezones', () => {
    const timezones = service.getCommonTimezones();
    expect(timezones.length).toBeGreaterThan(0);
    expect(timezones[0]).toHaveProperty('value');
    expect(timezones[0]).toHaveProperty('label');
    expect(timezones[0]).toHaveProperty('offset');
  });

  it('should return common locale options', () => {
    const locales = service.getCommonLocales();
    expect(locales.length).toBeGreaterThan(0);
    expect(locales[0]).toHaveProperty('code');
    expect(locales[0]).toHaveProperty('name');
  });

  it('should return all locale options', () => {
    const locales = service.getAllLocales();
    expect(locales.length).toBeGreaterThan(0);
    expect(locales[0]).toHaveProperty('code');
    expect(locales[0]).toHaveProperty('name');
  });

  it('should return date format options', () => {
    expect(service.dateFormatOptions.length).toBe(12);
    expect(service.dateFormatOptions[0]).toHaveProperty('value');
    expect(service.dateFormatOptions[0]).toHaveProperty('label');
    expect(service.dateFormatOptions[0]).toHaveProperty('example');
  });

  it('should get timezone offset', () => {
    const offset = service.getTimezoneOffset('America/Denver');
    expect(offset).toBeTruthy();
    expect(typeof offset).toBe('string');
  });
});
