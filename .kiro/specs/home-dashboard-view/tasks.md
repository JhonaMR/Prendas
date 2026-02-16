# Implementation Plan: Home Dashboard View

## Overview

This implementation plan breaks down the Home Dashboard View feature into discrete, incremental coding tasks. The approach follows a layered strategy: first establishing the component structure and role-based routing, then implementing the general user layout, followed by the admin layout with analytics, and finally integrating data fetching and error handling. Each task builds on previous work with no orphaned code.

## Tasks

- [x] 1. Set up HomeView component structure and role-based routing
  - Create `src/views/HomeView.tsx` with component skeleton
  - Import and set up useAppContext hook for role detection
  - Implement role-based conditional rendering (general vs admin)
  - Export HomeView and add to App.tsx routing
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Implement GeneralUserLayout component with navigation grid
  - Create `src/components/HomeView/GeneralUserLayout.tsx`
  - Build responsive grid layout using Tailwind CSS (2-3 columns)
  - Create navigation button components for all 10 menu items
  - Implement button click handlers that call onNavigate callback
  - Apply consistent styling matching existing selector components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.1 Write property test for GeneralUserLayout rendering
    - **Property 1: Role-Based Layout Rendering**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.2 Write property test for navigation button functionality
    - **Property 2: Navigation Button Functionality**
    - **Validates: Requirements 1.5**

  - [ ]* 2.3 Write property test for visual consistency
    - **Property 13: Visual Consistency**
    - **Validates: Requirements 1.6**

- [x] 3. Implement AdminLayout component with two-column structure
  - Create `src/components/HomeView/AdminLayout.tsx`
  - Build left column with vertical navigation button list
  - Build right column container for analytics panel
  - Implement navigation button click handlers
  - Apply consistent styling matching existing components
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.1 Write property test for admin layout rendering
    - **Property 1: Role-Based Layout Rendering**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 3.2 Write property test for admin navigation functionality
    - **Property 2: Navigation Button Functionality**
    - **Validates: Requirements 2.4**

- [x] 4. Implement CorreriaSelectorDropdown component
  - Create `src/components/HomeView/CorreriaSelectorDropdown.tsx`
  - Build dropdown UI with autocomplete search functionality
  - Implement correria filtering based on search input
  - Handle correria selection and call onSelect callback
  - Display all available correrias from props
  - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.1 Write property test for correria selection
    - **Property 3: Correria Selection Persistence**
    - **Validates: Requirements 3.3, 3.5**

  - [ ]* 4.2 Write property test for autocomplete functionality
    - **Property 3: Correria Selection Persistence**
    - **Validates: Requirements 3.2**

- [x] 5. Implement MetricsDisplay component with calculations
  - Create `src/components/HomeView/MetricsDisplay.tsx`
  - Implement metric calculation functions:
    - Units sold (sum of order quantities for correria)
    - Units dispatched (sum of dispatch quantities for correria)
    - Fulfillment percentage (units dispatched / units sold × 100)
    - Orders taken (count of orders for correria)
    - Value sold (sum of order totalValue for correria)
    - Value dispatched (sum of dispatch values for correria)
    - Fulfillment by seller (percentage per seller)
    - Batches in process (count of delivery_dates with process status)
    - Delivery efficiency (on-time deliveries / total deliveries × 100)
  - Display metrics in organized grid layout
  - Handle loading and error states
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3_

  - [ ]* 5.1 Write property test for fulfillment percentage calculation
    - **Property 5: Fulfillment Percentage Calculation**
    - **Validates: Requirements 4.3**

  - [ ]* 5.2 Write property test for delivery efficiency calculation
    - **Property 6: Delivery Efficiency Calculation**
    - **Validates: Requirements 5.3**

  - [ ]* 5.3 Write property test for metrics update on correria change
    - **Property 4: Metrics Update on Correria Change**
    - **Validates: Requirements 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3**

- [x] 6. Implement ChartsVisualization component
  - Create `src/components/HomeView/ChartsVisualization.tsx`
  - Install Recharts library (npm install recharts)
  - Implement pie charts for fulfillment percentages and delivery efficiency
  - Implement bar charts for units/values by seller and batches in process
  - Make charts responsive to panel size changes
  - Handle empty data states gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 6.1 Write property test for chart updates on correria change
    - **Property 4: Metrics Update on Correria Change**
    - **Validates: Requirements 6.3**

  - [ ]* 6.2 Write property test for responsive chart behavior
    - **Property 11: Responsive Layout Adaptation**
    - **Validates: Requirements 6.4**

- [x] 7. Integrate data fetching into HomeView
  - Update HomeView to use useCorrerias hook to fetch all correrias
  - Update HomeView to use useSellers hook to fetch seller data
  - Update HomeView to use useAppState hook to access orders, dispatches, deliveryDates
  - Implement state management for selected correria (default to first correria)
  - Implement loading state management
  - Pass data to child components (CorreriaSelectorDropdown, MetricsDisplay, ChartsVisualization)
  - _Requirements: 3.4, 8.1, 8.2, 8.3_

  - [ ]* 7.1 Write property test for default correria selection
    - **Property 7: Default Correria Selection**
    - **Validates: Requirements 3.4**

  - [ ]* 7.2 Write property test for correria selection persistence
    - **Property 3: Correria Selection Persistence**
    - **Validates: Requirements 3.5**

- [x] 8. Implement error handling and loading states
  - Add error state management to HomeView
  - Implement error message display for data fetching failures
  - Implement error message display for missing user role
  - Implement error message display for empty correria list
  - Implement loading indicator display during data fetching
  - Add retry functionality for failed data fetches
  - _Requirements: 7.5, 8.4, 8.5, 8.6_

  - [ ]* 8.1 Write property test for error handling
    - **Property 8: Error Handling and Display**
    - **Validates: Requirements 8.4**

  - [ ]* 8.2 Write property test for loading state indication
    - **Property 9: Loading State Indication**
    - **Validates: Requirements 8.5**

  - [ ]* 8.3 Write property test for empty correria handling
    - **Property 10: Empty Correria Handling**
    - **Validates: Requirements 8.6**

- [x] 9. Implement responsive design and mobile optimization
  - Update GeneralUserLayout for responsive grid (2 columns on tablet, 1 on mobile)
  - Update AdminLayout for responsive two-column layout (stack on mobile)
  - Implement mobile-optimized layout for admin dashboard
  - Test layout reflow on screen resize
  - Ensure no horizontal scrolling on any screen size
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 9.1 Write property test for responsive layout adaptation
    - **Property 11: Responsive Layout Adaptation**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

  - [ ]* 9.2 Write property test for grid button fill
    - **Property 12: Grid Button Fill**
    - **Validates: Requirements 1.3, 1.4**

- [x] 10. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests with minimum 100 iterations each
  - Verify no console errors or warnings
  - Test manual navigation between views
  - Ask the user if questions arise

- [x] 11. Integration testing and final verification
  - Test complete user flow: login → HomeView → navigate to feature
  - Test admin flow: login → HomeView → select correria → metrics update
  - Test error scenarios: missing data, failed API calls, invalid role
  - Test responsive behavior on multiple screen sizes
  - Verify all metrics calculations are accurate
  - _Requirements: 1.1, 1.5, 2.1, 2.4, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 6.1, 6.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 11.1 Write integration tests for complete user flows
    - Test login → HomeView → navigation
    - Test admin correria selection → metrics update
    - Test error handling and recovery

- [x] 12. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise
  - Verify HomeView is properly integrated into App.tsx routing
  - Confirm feature meets all requirements from requirements.md
  - Verify design document properties are validated by tests

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- All components use TypeScript for type safety
- Styling uses Tailwind CSS to match existing platform design
- Data fetching uses existing hooks (useCorrerias, useSellers, useAppState)
- Metrics calculations are performed client-side from state data
- Charts use Recharts library for React integration
- Mobile optimization uses Tailwind responsive classes (sm:, md:, lg:)
- Error messages are user-friendly and actionable
- Loading indicators provide visual feedback during data fetching

