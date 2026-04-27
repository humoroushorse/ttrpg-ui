import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as fc from 'fast-check';
import { SprintManagementApiService } from './sprint-management-api.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { WorkItemType, WorkItemStatus } = SprintModels.WorkItem;
const { FilterType, FilterCondition } = SprintModels.Filter;
const { SortDirection } = SprintModels.Sort;
type FilterModel = SprintModels.Filter.FilterModel;
type SortModel = SprintModels.Sort.SortModel;
type PaginatedRequest = SprintModels.Api.PaginatedRequest;
import { signal } from '@angular/core';

describe('SprintManagementApiService - Property Tests', () => {
  let service: SprintManagementApiService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SprintManagementApiService,
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: baseUrl,
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
      ],
    });

    service = TestBed.inject(SprintManagementApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Property 19: Export Respects Filters and Sorting', () => {
    // Arbitraries for generating test data
    const filterTypeArb = fc.constantFrom(FilterType.Text, FilterType.Number, FilterType.Date, FilterType.Set);

    const filterConditionArb = fc.constantFrom(
      FilterCondition.Equals,
      FilterCondition.NotEquals,
      FilterCondition.Contains,
      FilterCondition.StartsWith,
      FilterCondition.EndsWith,
      FilterCondition.LessThan,
      FilterCondition.GreaterThan,
    );

    const filterModelArb = fc.record({
      field: fc.constantFrom('title', 'type', 'status', 'priority', 'assignee_id'),
      type: filterTypeArb,
      condition: filterConditionArb,
      value: fc.oneof(
        fc.string(),
        fc.integer(),
        fc.constantFrom(WorkItemType.Story, WorkItemType.Defect, WorkItemType.Epic),
        fc.constantFrom(WorkItemStatus.Backlog, WorkItemStatus.Todo, WorkItemStatus.InProgress),
      ),
    }) as fc.Arbitrary<FilterModel>;

    const sortModelArb = fc.record({
      field: fc.constantFrom('title', 'created_at', 'updated_at', 'priority', 'status'),
      direction: fc.constantFrom(SortDirection.Asc, SortDirection.Desc),
      priority: fc.integer({ min: 0, max: 5 }),
    }) as fc.Arbitrary<SortModel>;

    const paginatedRequestArb = fc.record({
      page: fc.integer({ min: 1, max: 10 }),
      page_size: fc.integer({ min: 10, max: 100 }),
      filters: fc.array(filterModelArb, { minLength: 0, maxLength: 3 }),
      sort: fc.array(sortModelArb, { minLength: 0, maxLength: 2 }),
    }) as fc.Arbitrary<PaginatedRequest>;

    it('should include filter parameters in CSV export request', () => {
      fc.assert(
        fc.property(paginatedRequestArb, (request) => {
          // Call export with filters
          service.exportWorkItems('csv', request).subscribe();

          // Verify the request
          const req = httpMock.expectOne((req) => {
            return req.url.includes('/workitems/export/csv');
          });

          expect(req.request.method).toBe('GET');

          // Verify filters are included in query params
          if (request.filters && request.filters.length > 0) {
            const filtersParam = req.request.params.get('filters');
            expect(filtersParam).toBeTruthy();
          }

          // Verify sorts are included in query params
          if (request.sort && request.sort.length > 0) {
            const sortParam = req.request.params.get('sort');
            expect(sortParam).toBeTruthy();
          }

          // Respond with mock blob
          req.flush(new Blob(['csv data'], { type: 'text/csv' }));

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should include filter parameters in JSON export request', () => {
      fc.assert(
        fc.property(paginatedRequestArb, (request) => {
          // Call export with filters
          service.exportWorkItems('json', request).subscribe();

          // Verify the request
          const req = httpMock.expectOne((req) => {
            return req.url.includes('/workitems/export/json');
          });

          expect(req.request.method).toBe('GET');

          // Verify filters are included in query params
          if (request.filters && request.filters.length > 0) {
            const filtersParam = req.request.params.get('filters');
            expect(filtersParam).toBeTruthy();
          }

          // Verify sorts are included in query params
          if (request.sort && request.sort.length > 0) {
            const sortParam = req.request.params.get('sort');
            expect(sortParam).toBeTruthy();
          }

          // Respond with mock blob
          req.flush(new Blob(['json data'], { type: 'application/json' }));

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve filter and sort state across export formats', () => {
      fc.assert(
        fc.property(paginatedRequestArb, (request) => {
          // Export to CSV
          service.exportWorkItems('csv', request).subscribe();
          const csvReq = httpMock.expectOne((req) => req.url.includes('/workitems/export/csv'));
          const csvParams = csvReq.request.params;
          csvReq.flush(new Blob(['csv data'], { type: 'text/csv' }));

          // Export to JSON with same request
          service.exportWorkItems('json', request).subscribe();
          const jsonReq = httpMock.expectOne((req) => req.url.includes('/workitems/export/json'));
          const jsonParams = jsonReq.request.params;
          jsonReq.flush(new Blob(['json data'], { type: 'application/json' }));

          // Verify both requests have the same filters and sorts
          expect(csvParams.get('filters')).toBe(jsonParams.get('filters'));
          expect(csvParams.get('sort')).toBe(jsonParams.get('sort'));
          expect(csvParams.get('page')).toBe(jsonParams.get('page'));
          expect(csvParams.get('page_size')).toBe(jsonParams.get('page_size'));

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should handle empty filters and sorts in export', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.integer({ min: 1, max: 10 }),
            page_size: fc.integer({ min: 10, max: 100 }),
          }),
          (request) => {
            // Export without filters or sorts
            service.exportWorkItems('csv', request).subscribe();

            const req = httpMock.expectOne((req) => req.url.includes('/workitems/export/csv'));

            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('page')).toBe(request.page.toString());
            expect(req.request.params.get('page_size')).toBe(request.page_size.toString());

            // Filters and sorts should not be present or be empty
            const filtersParam = req.request.params.get('filters');
            const sortParam = req.request.params.get('sort');

            if (filtersParam) {
              expect(filtersParam).toBe('[]');
            }
            if (sortParam) {
              expect(sortParam).toBe('[]');
            }

            req.flush(new Blob(['csv data'], { type: 'text/csv' }));

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
