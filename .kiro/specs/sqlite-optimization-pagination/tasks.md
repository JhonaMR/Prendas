# Implementation Plan: SQLite Optimization and Pagination

## Overview

This implementation plan breaks down the SQLite optimization and pagination feature into discrete, incremental coding tasks. The approach follows a layered strategy: first establishing database optimization foundations, then implementing backend pagination endpoints, followed by frontend pagination components, and finally integrating everything together with caching and lazy loading.

## Tasks

- [x] 1. Set up database connection persistence and indexing infrastructure
  - [x] 1.1 Create DatabaseConnectionManager class
    - Implement persistent connection initialization at application startup
    - Implement connection reuse for all queries
    - Implement graceful connection closure at application shutdown
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 1.2 Create database migration script for strategic indexes
    - Create indexes on delivery_dates(confeccionista_id, reference_id, send_date)
    - Create indexes on dispatch_items(reference_id)
    - Create indexes on reception_items(reference_id)
    - Create indexes on orders(correria_id, client_id)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 1.3 Write property tests for database connection persistence
    - **Property 7: Connection Persistence**
    - **Validates: Requirements 1.2, 1.4**
  
  - [ ]* 1.4 Write unit tests for index creation
    - Test that all indexes are created successfully
    - Test that indexes are used in query execution plans
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Implement pagination service layer
  - [x] 2.1 Create PaginationService class with core pagination logic
    - Implement calculateOffset(page, limit) method
    - Implement calculateTotalPages(total, limit) method
    - Implement buildPaginatedResponse() method
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 2.2 Write property tests for pagination calculations
    - **Property 1: Pagination Offset Calculation**
    - **Validates: Requirements 3.2, 4.2, 5.2, 6.2, 7.2, 8.2**
  
  - [ ]* 2.3 Write property tests for total pages calculation
    - **Property 2: Total Pages Calculation**
    - **Validates: Requirements 3.3, 4.3, 5.3, 6.3, 7.3, 8.3**
  
  - [ ]* 2.4 Write property tests for page boundary validation
    - **Property 3: Page Boundary Validation**
    - **Validates: Requirements 3.5, 4.5, 5.5, 6.5, 7.5, 8.5**

- [x] 3. Implement backend pagination endpoints for DeliveryDates
  - [x] 3.1 Modify DeliveryDatesService.getAllWithPagination()
    - Accept page, limit, and filter parameters
    - Apply filters (date range, confeccionista_id, reference_id)
    - Return PaginatedResponse with metadata
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 3.2 Create/update API endpoint GET /api/delivery-dates
    - Accept query parameters: page, limit, filters
    - Call DeliveryDatesService.getAllWithPagination()
    - Return paginated response with 200 status
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 3.3 Write property tests for filter application
    - **Property 4: Filter Application Consistency**
    - **Validates: Requirements 3.4, 10.2_
  
  - [ ]* 3.4 Write property tests for data integrity
    - **Property 5: Data Integrity After Pagination**
    - **Validates: Requirements 3.1, 10.1_

- [x] 4. Implement backend pagination endpoints for Dispatch
  - [x] 4.1 Modify DispatchService.getAllWithPagination()
    - Accept page, limit, and filter parameters
    - Apply filters (date range, reference_id, status)
    - Return PaginatedResponse with metadata
    - _Requirements: 10.4_
  
  - [x] 4.2 Create/update API endpoint GET /api/dispatches
    - Accept query parameters: page, limit, filters
    - Call DispatchService.getAllWithPagination()
    - Return paginated response with 200 status
    - _Requirements: 10.4_

- [x] 5. Implement backend pagination endpoints for Reception
  - [x] 5.1 Modify ReceptionService.getAllWithPagination()
    - Accept page, limit, and filter parameters
    - Apply filters (date range, reference_id, status)
    - Return PaginatedResponse with metadata
    - _Requirements: 10.5_
  
  - [x] 5.2 Create/update API endpoint GET /api/receptions
    - Accept query parameters: page, limit, filters
    - Call ReceptionService.getAllWithPagination()
    - Return paginated response with 200 status
    - _Requirements: 10.5_

- [x] 6. Implement backend pagination endpoints for Returns
  - [x] 6.1 Modify ReturnService.getAllWithPagination()
    - Accept page, limit, and filter parameters
    - Apply filters (date range, reference_id, status)
    - Return PaginatedResponse with metadata
    - _Requirements: 10.6_
  
  - [x] 6.2 Create/update API endpoint GET /api/returns
    - Accept query parameters: page, limit, filters
    - Call ReturnService.getAllWithPagination()
    - Return paginated response with 200 status
    - _Requirements: 10.6_

- [x] 7. Checkpoint - Verify all backend endpoints
  - Ensure all pagination endpoints return correct data structure
  - Verify pagination calculations are correct
  - Verify filters are applied correctly
  - Test with various page and limit combinations

- [x] 8. Create reusable PaginationComponent
  - [x] 8.1 Create PaginationComponent.tsx
    - Accept props: currentPage, totalPages, onPageChange, isLoading
    - Render previous/next buttons with proper disabled states
    - Render page number display
    - Render page input field for direct navigation
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 8.2 Write unit tests for PaginationComponent
    - Test button disabled states
    - Test onPageChange callback
    - Test page number display
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9. Implement pagination in DeliveryDatesView
  - [x] 9.1 Modify DeliveryDatesView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data using getAllDeliveryDates with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 9.2 Add filter controls to DeliveryDatesView
    - Add date range filter inputs
    - Add confeccionista filter dropdown
    - Add reference filter input
    - Apply filters and reset to page 1
    - _Requirements: 3.4_
  
  - [ ]* 9.3 Write unit tests for DeliveryDatesView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Implement pagination in DispatchView
  - [x] 10.1 Modify DispatchView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data using getAllDispatches with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 10.2 Add filter controls to DispatchView
    - Add date range filter inputs
    - Add reference filter input
    - Add status filter dropdown
    - Apply filters and reset to page 1
    - _Requirements: 4.4_
  
  - [ ]* 10.3 Write unit tests for DispatchView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Implement pagination in ReceptionView
  - [x] 11.1 Modify ReceptionView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data using getAllReceptions with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 11.2 Add filter controls to ReceptionView
    - Add date range filter inputs
    - Add reference filter input
    - Add status filter dropdown
    - Apply filters and reset to page 1
    - _Requirements: 5.4_
  
  - [ ]* 11.3 Write unit tests for ReceptionView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Implement pagination in ReturnReceptionView
  - [x] 12.1 Modify ReturnReceptionView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data using getAllReturns with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 12.2 Add filter controls to ReturnReceptionView
    - Add date range filter inputs
    - Add reference filter input
    - Add status filter dropdown
    - Apply filters and reset to page 1
    - _Requirements: 6.4_
  
  - [ ]* 12.3 Write unit tests for ReturnReceptionView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Implement pagination in DispatchControlView
  - [x] 13.1 Modify DispatchControlView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 13.2 Add filter controls to DispatchControlView
    - Add date range filter inputs
    - Add reference filter input
    - Add status filter dropdown
    - Apply filters and reset to page 1
    - _Requirements: 7.4_
  
  - [ ]* 13.3 Write unit tests for DispatchControlView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 14. Implement pagination in OrderHistoryView
  - [x] 14.1 Modify OrderHistoryView to use pagination
    - Add state for currentPage, pageSize, totalPages
    - Fetch data with pagination params
    - Integrate PaginationComponent
    - Reset to page 1 when filters change
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 14.2 Add filter controls to OrderHistoryView
    - Add date range filter inputs
    - Add client filter dropdown
    - Add status filter dropdown
    - Apply filters and reset to page 1
    - _Requirements: 8.4_
  
  - [ ]* 14.3 Write unit tests for OrderHistoryView pagination
    - Test page navigation
    - Test filter application
    - Test loading states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 15. Verify OrdersView remains unchanged
  - [x] 15.1 Confirm OrdersView displays all orders without pagination
    - Verify no pagination controls appear
    - Verify all orders are fetched and displayed
    - Verify no changes to existing functionality
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 15.2 Write unit tests for OrdersView
    - Test that all orders are displayed
    - Test that pagination controls do not appear
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 16. Implement master data caching
  - [x] 16.1 Create CacheManager class
    - Implement get<T>(key: string) method
    - Implement set<T>(key: string, value: T, ttl?: number) method
    - Implement invalidate(key: string) method
    - Implement clear() method
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 16.2 Load master data into cache at application startup
    - Load references into cache
    - Load clients into cache
    - Load confeccionistas into cache
    - _Requirements: 13.1_
  
  - [x] 16.3 Update services to use cache for master data lookups
    - Modify DeliveryDatesService to use cache
    - Modify DispatchService to use cache
    - Modify ReceptionService to use cache
    - _Requirements: 13.2_
  
  - [ ]* 16.4 Write property tests for cache consistency
    - **Property 8: Cache Consistency**
    - **Validates: Requirements 13.2, 13.4_

- [x] 17. Implement lazy loading in paginated views
  - [x] 17.1 Add loading indicators to all paginated views
    - Show loading spinner while fetching data
    - Disable pagination controls during loading
    - _Requirements: 14.3_
  
  - [x] 17.2 Implement lazy loading in DeliveryDatesView
    - Fetch only requested page on demand
    - Do not fetch entire dataset
    - _Requirements: 14.1, 14.2_
  
  - [x] 17.3 Implement lazy loading in other paginated views
    - Apply same lazy loading pattern to DispatchView
    - Apply same lazy loading pattern to ReceptionView
    - Apply same lazy loading pattern to ReturnReceptionView
    - Apply same lazy loading pattern to DispatchControlView
    - Apply same lazy loading pattern to OrderHistoryView
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 17.4 Write property tests for lazy loading
    - **Property 9: Lazy Loading Behavior**
    - **Validates: Requirements 14.1, 14.2_

- [x] 18. Optimize queries for index usage
  - [x] 18.1 Review and optimize all queries in services
    - Ensure queries use indexed columns in WHERE clauses
    - Ensure queries use indexed columns in JOIN conditions
    - Ensure queries use LIMIT and OFFSET efficiently
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 18.2 Write property tests for index usage
    - **Property 6: Index Usage in Queries**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 12.2_

- [x] 19. Checkpoint - Verify all pagination and optimization features
  - Ensure all views display paginated data correctly
  - Verify filters work with pagination
  - Verify cache is being used for master data
  - Verify lazy loading is working
  - Verify indexes are being used in queries
  - Verify OrdersView remains unchanged
  - Run all property-based tests (minimum 100 iterations each)
  - Run all unit tests

- [x] 20. Integration testing and final verification
  - [x] 20.1 Test pagination across all views
    - Navigate through pages in each view
    - Verify data consistency across pages
    - Verify no data loss or duplication
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_
  
  - [x] 20.2 Test filter combinations with pagination
    - Apply multiple filters simultaneously
    - Verify filters work correctly with pagination
    - Verify page resets to 1 when filters change
    - _Requirements: 3.4, 4.4, 5.4, 6.4, 7.4, 8.4_
  
  - [x] 20.3 Test cache invalidation with data updates
    - Update master data
    - Verify cache is invalidated
    - Verify new data is fetched from database
    - _Requirements: 13.3, 13.4_
  
  - [x] 20.4 Test connection persistence across application lifecycle
    - Start application
    - Execute multiple queries
    - Verify connection remains open
    - Shutdown application
    - Verify connection is properly closed
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 20.5 Write integration tests
    - Test end-to-end pagination flows
    - Test filter combinations
    - Test cache behavior
    - Test connection persistence
    - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 21. Final checkpoint - All tests pass
  - Ensure all unit tests pass
  - Ensure all property-based tests pass (minimum 100 iterations each)
  - Ensure all integration tests pass
  - Verify no regressions in existing functionality
  - Verify OrdersView remains unchanged

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests should run minimum 100 iterations each
- All pagination endpoints should support filtering
- Cache should be invalidated when master data is updated
- Connection should be reused across all queries
- OrdersView must remain unchanged throughout implementation

