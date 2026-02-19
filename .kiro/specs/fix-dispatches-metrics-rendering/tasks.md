# Implementation Plan: Fix Dispatches Metrics Rendering

## Overview

This implementation plan addresses the issue where "Unidades Despachadas" (Units Dispatched) metrics are not rendering correctly in the HomeView dashboard. The solution involves creating robust utility functions for data resolution and refactoring both `MetricsDisplay.tsx` and `ChartsVisualization.tsx` to handle edge cases gracefully.

The implementation follows a bottom-up approach: first creating utility functions, then refactoring the components to use them, then adding comprehensive tests.

## Tasks

- [ ] 1. Create utility functions for robust data handling
  - [ ] 1.1 Create `utils/metricsHelpers.ts` with utility functions
    - Implement `ensureArray<T>(value)` to safely convert undefined to empty arrays
    - Implement `calculateUnitsFromItems(items)` to safely sum item quantities
    - Implement `resolveDispatchSeller(dispatch, clients, sellers)` to safely resolve dispatch to seller
    - Add JSDoc comments explaining each function's purpose and edge cases
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 1.2 Write property tests for utility functions
    - **Property 1: Dispatch Seller Resolution Chain**
    - **Property 2: Dispatch Resolution Robustness with Missing Client**
    - **Property 3: Dispatch Resolution Robustness with Missing Seller ID**
    - **Property 8: Null State Handling**
    - **Property 9: Seller Name Fallback**
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 2. Refactor MetricsDisplay component
  - [ ] 2.1 Update metrics calculation in MetricsDisplay.tsx
    - Replace direct array access with `ensureArray()` calls
    - Use `calculateUnitsFromItems()` for all unit calculations
    - Add explicit null checks before accessing array methods
    - Ensure all calculations return 0 instead of NaN/undefined
    - Add comments explaining each calculation step
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 4.6, 5.1, 5.2, 6.1, 6.2, 6.4_

  - [ ]* 2.2 Write property tests for MetricsDisplay
    - **Property 4: Units Dispatched Non-Negativity**
    - **Property 8: Null State Handling**
    - **Property 10: Correria Filtering Consistency**
    - **Property 11: Zero Metrics Display**
    - **Property 12: Metrics Display Completeness**
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 4.6, 5.1, 5.2, 6.1, 6.2, 6.4_

  - [ ]* 2.3 Write unit tests for MetricsDisplay edge cases
    - Test with null items and null quantities
    - Test with zero orders and zero dispatches
    - Test correria filtering
    - Test empty state handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [ ] 3. Refactor ChartsVisualization component
  - [ ] 3.1 Update seller fulfillment calculation in ChartsVisualization.tsx
    - Use `resolveDispatchSeller()` for each dispatch to safely get the seller
    - Skip dispatches where seller resolution fails
    - Ensure sellers with only orders show 0% fulfillment
    - Ensure sellers with only dispatches show 0% fulfillment
    - Use `calculateUnitsFromItems()` for all unit calculations
    - Add explicit null checks and use `ensureArray()` for all arrays
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 6.3, 6.5_

  - [ ]* 3.2 Write property tests for ChartsVisualization
    - **Property 1: Dispatch Seller Resolution Chain**
    - **Property 2: Dispatch Resolution Robustness with Missing Client**
    - **Property 3: Dispatch Resolution Robustness with Missing Seller ID**
    - **Property 5: Seller Aggregation Completeness**
    - **Property 6: Fulfillment Percentage Calculation**
    - **Property 7: Fulfillment Percentage Bounds**
    - **Property 8: Null State Handling**
    - **Property 9: Seller Name Fallback**
    - **Property 10: Correria Filtering Consistency**
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2_

  - [ ]* 3.3 Write unit tests for ChartsVisualization edge cases
    - Test dispatch resolution with missing client
    - Test dispatch resolution with missing sellerId
    - Test seller aggregation with only orders
    - Test seller aggregation with only dispatches
    - Test fulfillment percentage calculation and rounding
    - Test seller name fallback
    - _Requirements: 1.2, 1.3, 3.2, 3.3, 3.4, 3.5, 4.5_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass (minimum 100 iterations each)
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [ ] 5. Integration testing
  - [ ] 5.1 Test MetricsDisplay and ChartsVisualization together
    - Render both components with the same state
    - Verify metrics are consistent between components
    - Verify both components handle the same edge cases
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 5.2 Write integration tests
    - Test with various correria states
    - Test with missing/invalid data
    - Test correria switching
    - _Requirements: 5.3, 5.4, 6.1, 6.2, 6.3_

- [ ] 6. Final checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Ensure all integration tests pass
  - Verify the dashboard displays metrics correctly
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The utility functions are designed to be reusable across the application
- All calculations default to 0 for missing data to prevent NaN/undefined values
- Seller resolution uses a defensive approach: skip invalid dispatches rather than throwing errors

