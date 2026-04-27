/**
 * Service Test Utilities
 *
 * Provides utilities for testing Angular services, especially API services.
 */

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
  PaginatedResponse,
} from '@ttrpg-ui/features/sprint-management/models';

/**
 * Configuration for service testing
 */
export interface ServiceTestConfig {
  apiBasePath?: string;
  apiUrl?: string;
}

/**
 * Setup TestBed with common providers for service testing
 */
export function setupServiceTestBed(config: ServiceTestConfig = {}): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
        useValue: {
          appConfig: signal({
            APP_SPRINT_MANAGEMENT__API_BASE_PATH: config.apiBasePath || '/api/v1',
            APP_SPRINT_MANAGEMENT__API_URL: config.apiUrl || 'http://localhost:8003',
          }),
          initialized: signal(true),
        },
      },
    ],
  });
}

/**
 * Get HttpTestingController from TestBed
 */
export function getHttpTestingController(): HttpTestingController {
  return TestBed.inject(HttpTestingController);
}

/**
 * Verify no outstanding HTTP requests
 */
export function verifyNoOutstandingRequests(httpMock: HttpTestingController): void {
  httpMock.verify();
}

/**
 * Expect a single HTTP request and flush with response
 */
export function expectHttpRequest<T>(
  httpMock: HttpTestingController,
  method: string,
  url: string,
  responseData: T,
): void {
  const req = httpMock.expectOne(url);
  expect(req.request.method).toBe(method);
  req.flush(responseData);
}

/**
 * Expect a single HTTP request and flush with error
 */
export function expectHttpRequestError(
  httpMock: HttpTestingController,
  method: string,
  url: string,
  errorMessage: string,
  status = 500,
): void {
  const req = httpMock.expectOne(url);
  expect(req.request.method).toBe(method);
  req.flush({ error: { detail: errorMessage } }, { status, statusText: errorMessage });
}

/**
 * Create a mock paginated response
 */
export function createMockPaginatedResponse<T>(items: T[], page = 1, pageSize = 25): PaginatedResponse<T> {
  return {
    items,
    total: items.length,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(items.length / pageSize),
  };
}

/**
 * Create a mock API service with predefined responses
 */
export function createMockApiService<T extends Record<string, any>>(methods: Partial<T>): T {
  const mockService: any = {};

  for (const [key, value] of Object.entries(methods)) {
    if (typeof value === 'function') {
      mockService[key] = value;
    } else {
      mockService[key] = () => of(value);
    }
  }

  return mockService as T;
}

/**
 * Create a mock API service that returns errors
 */
export function createMockApiServiceWithErrors<T extends Record<string, any>>(errorMessage = 'API Error'): T {
  return new Proxy({} as T, {
    get: () => () => throwError(() => new Error(errorMessage)),
  });
}

/**
 * Mock successful HTTP response
 */
export function mockHttpSuccess<T>(data: T): Observable<T> {
  return of(data);
}

/**
 * Mock HTTP error response
 */
export function mockHttpError(message: string, status = 500): Observable<never> {
  return throwError(() => ({
    status,
    message,
    error: { detail: message },
  }));
}

/**
 * Assert HTTP request was made with correct parameters
 */
export function assertHttpRequest(httpMock: HttpTestingController, method: string, url: string, body?: any): void {
  const req = httpMock.expectOne(url);
  expect(req.request.method).toBe(method);

  if (body !== undefined) {
    expect(req.request.body).toEqual(body);
  }

  req.flush({});
}

/**
 * Assert HTTP request has query parameters
 */
export function assertHttpRequestParams(
  httpMock: HttpTestingController,
  url: string,
  params: Record<string, string>,
): void {
  const req = httpMock.expectOne((request) => request.url === url);

  for (const [key, value] of Object.entries(params)) {
    expect(req.request.params.get(key)).toBe(value);
  }

  req.flush({});
}

/**
 * Assert HTTP request has headers
 */
export function assertHttpRequestHeaders(
  httpMock: HttpTestingController,
  url: string,
  headers: Record<string, string>,
): void {
  const req = httpMock.expectOne(url);

  for (const [key, value] of Object.entries(headers)) {
    expect(req.request.headers.get(key)).toBe(value);
  }

  req.flush({});
}

/**
 * Flush all pending HTTP requests
 */
export function flushAllHttpRequests(httpMock: HttpTestingController, responseData: any = {}): void {
  const requests = httpMock.match(() => true);
  requests.forEach((req) => req.flush(responseData));
}

/**
 * Create a spy for service method
 */
export function spyOnServiceMethod<T>(service: any, methodName: string, returnValue?: T): any {
  const spy = vi.fn();

  if (returnValue !== undefined) {
    spy.mockReturnValue(of(returnValue));
  }

  service[methodName] = spy;

  return spy;
}

/**
 * Wait for observable to complete
 */
export async function waitForObservable<T>(observable: Observable<T>, timeout = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Observable timeout'));
    }, timeout);

    observable.subscribe({
      next: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      error: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
  });
}

/**
 * Assert observable emits value
 */
export async function assertObservableEmits<T>(observable: Observable<T>, expectedValue: T): Promise<void> {
  const value = await waitForObservable(observable);
  expect(value).toEqual(expectedValue);
}

/**
 * Assert observable throws error
 */
export async function assertObservableThrows(observable: Observable<any>, expectedError?: string): Promise<void> {
  try {
    await waitForObservable(observable);
    throw new Error('Expected observable to throw error');
  } catch (error: any) {
    if (expectedError) {
      expect(error.message).toContain(expectedError);
    }
  }
}

/**
 * Create a mock HTTP response with delay
 */
export function mockHttpSuccessWithDelay<T>(data: T, delayMs: number): Observable<T> {
  return new Observable((subscriber) => {
    setTimeout(() => {
      subscriber.next(data);
      subscriber.complete();
    }, delayMs);
  });
}

/**
 * Mock WebSocket message
 */
export function createMockWebSocketMessage(type: string, data: any, userId = 'user-1'): any {
  return {
    type,
    data,
    user_id: userId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Assert service method was called with arguments
 */
export function assertServiceMethodCalled(spy: any, expectedArgs: any[]): void {
  expect(spy).toHaveBeenCalledWith(...expectedArgs);
}

/**
 * Assert service method was called n times
 */
export function assertServiceMethodCallCount(spy: any, expectedCount: number): void {
  expect(spy).toHaveBeenCalledTimes(expectedCount);
}

/**
 * Reset all service method spies
 */
export function resetServiceSpies(...spies: any[]): void {
  spies.forEach((spy) => spy.mockClear());
}
