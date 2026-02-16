# Implementation Plan: Add Order Number Field

## Overview

This implementation adds an optional "Order Number" field to the order settlement workflow. The work is organized in layers: database schema update, backend API changes, frontend type definitions, and UI component updates. Each step builds on the previous one, ensuring incremental validation and integration.

## Tasks

- [x] 1. Update database schema to add order_number column
  - Modify the orders table in database.js to include the order_number column
  - Column type: INTEGER, nullable
  - No unique constraint
  - _Requirements: 2.3_

- [ ]* 1.1 Write unit test for database schema
  - Verify the order_number column exists and has correct type
  - _Requirements: 2.3_

- [x] 2. Update Order type in types.ts
  - Add optional `orderNumber?: number` property to Order interface
  - Maintain backward compatibility with existing orders
  - _Requirements: 3.1_

- [ ]* 2.1 Write unit test for Order type
  - Verify Order interface includes orderNumber property
  - Test that orderNumber is optional
  - _Requirements: 3.1_

- [x] 3. Update backend createOrder function
  - Extract `orderNumber` from request body (optional parameter)
  - Modify INSERT statement to include order_number column
  - Include orderNumber in response payload
  - _Requirements: 2.1, 2.2, 4.3_

- [ ]* 3.1 Write property test for order number persistence
  - **Property 2: Order Number Input Validation**
  - **Validates: Requirements 2.1**
  - Generate random orders with order numbers and verify persistence

- [ ]* 3.2 Write property test for null order number handling
  - **Property 3: Null Order Number Handling**
  - **Validates: Requirements 2.2**
  - Generate random orders without order numbers and verify null storage

- [x] 4. Add order number input field to OrderSettleView
  - Add state variable for orderNumber input
  - Add input field in "1. Datos del Pedido" section with label "Número de pedido"
  - Input type: number
  - Make field optional (no required attribute)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 4.1 Write unit test for order number input field
  - Verify input field is rendered with correct label
  - Test that numeric input is accepted
  - Test that empty field allows form submission
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 4.2 Write property test for input validation
  - **Property 1: Order Number Input Validation**
  - **Validates: Requirements 1.4**
  - Generate random non-numeric strings and verify rejection

- [x] 5. Update handleSaveOrder to include orderNumber
  - Extract orderNumber from state
  - Include orderNumber in newOrder object
  - Include orderNumber in API request payload
  - _Requirements: 4.1, 4.2_

- [ ]* 5.1 Write property test for API payload
  - **Property 4: Order Number Round Trip**
  - **Validates: Requirements 4.1, 4.2**
  - Verify orderNumber is included in API request payload

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all unit and property tests pass
  - Verify no TypeScript compilation errors
  - Ask the user if questions arise

- [ ] 7. Add order number display for existing orders (if needed)
  - If OrderSettleView supports editing existing orders, populate orderNumber field
  - Display current order_number value when loading order
  - _Requirements: 5.1_

- [ ]* 7.1 Write property test for order number display
  - **Property 6: Order Number Display on Load**
  - **Validates: Requirements 5.1**
  - Load orders with order numbers and verify display

- [ ] 8. Add update endpoint for order number (if needed)
  - If orders can be edited after settlement, create update endpoint
  - Allow modification of order_number field
  - _Requirements: 5.2, 5.3_

- [ ]* 8.1 Write property test for order number update
  - **Property 5: Order Number Editability**
  - **Validates: Requirements 5.2, 5.3**
  - Update order numbers and verify persistence

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all unit and property tests pass
  - Verify no TypeScript compilation errors
  - Verify no backend errors
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The orderNumber field is optional and nullable for backward compatibility
