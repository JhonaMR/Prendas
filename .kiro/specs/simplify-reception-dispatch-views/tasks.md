# Implementation Plan: Simplify Reception and Dispatch Views

## Overview

This implementation plan breaks down the simplification of Reception and Dispatch views into discrete coding steps. The approach is to first update the core data model and Scanner Simulator component, then refactor the Reception and Dispatch views to use the new simplified model, and finally add comprehensive tests to verify the new behavior.

## Tasks

- [x] 1. Update ItemEntry interface and types
  - Remove the `size` field from ItemEntry interface
  - Update all type definitions to reflect the new simplified model
  - Create a type alias or utility for backward compatibility if needed
  - _Requirements: 4.1, 4.2_

- [x] 2. Refactor ScannerSimulator component
  - [x] 2.1 Update ScannerSimulator props and callback signature
    - Change `onScan` callback from `(reference, size, quantity)` to `(reference, quantity)`
    - Update component props interface to remove size-related properties
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Remove size selector from ScannerSimulator UI
    - Delete the size dropdown selector element
    - Adjust grid layout to remove the size column
    - Ensure reference input and quantity controls remain functional
    - _Requirements: 1.1_
  
  - [ ]* 2.3 Write property test for ScannerSimulator callback signature
    - **Property 1: Scanner Simulator Accepts Reference and Quantity Only**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [x] 2.4 Update ScannerSimulator reset logic
    - Ensure reference input clears and quantity resets to 1 after scan
    - Verify Enter key still triggers the scan
    - _Requirements: 1.4_

- [x] 3. Refactor ReceptionView component
  - [x] 3.1 Update ReceptionView state to use simplified ItemEntry
    - Change items state from `ItemEntry[]` with size to simplified model
    - Remove any size-related state variables
    - _Requirements: 2.1_
  
  - [x] 3.2 Implement item aggregation logic for ReceptionView
    - When adding an item, check if reference already exists
    - If exists, increment quantity; if not, create new entry
    - Remove size-based grouping logic
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 3.3 Write property test for ReceptionView aggregation
    - **Property 2: Reception View Aggregates Items by Reference**
    - **Validates: Requirements 2.1, 2.2**
  
  - [x] 3.4 Update ReceptionView display to show reference and quantity only
    - Modify the items list rendering to show only reference and quantity columns
    - Remove any size-related display elements
    - _Requirements: 2.2_
  
  - [x] 3.5 Update ReceptionView item modification logic
    - Allow quantity modification without size selection
    - Remove size from any edit/modify operations
    - _Requirements: 2.3_
  
  - [ ]* 3.6 Write property test for ReceptionView quantity modification
    - **Property 5: Quantity Modification Updates Correctly**
    - **Validates: Requirements 2.3**
  
  - [x] 3.7 Update ReceptionView item removal logic
    - Ensure removing an item deletes the entire reference entry
    - _Requirements: 2.4_
  
  - [ ]* 3.8 Write property test for ReceptionView item removal
    - **Property 4: Item Removal Deletes Entire Reference Entry**
    - **Validates: Requirements 2.4**

- [x] 4. Refactor DispatchView component
  - [x] 4.1 Update DispatchView state to use simplified ItemEntry
    - Change items state from `ItemEntry[]` with size to simplified model
    - Remove any size-related state variables
    - _Requirements: 3.1_
  
  - [x] 4.2 Implement item aggregation logic for DispatchView
    - When adding an item, check if reference already exists
    - If exists, increment quantity; if not, create new entry
    - Remove size-based grouping logic
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 4.3 Write property test for DispatchView aggregation
    - **Property 3: Dispatch View Aggregates Items by Reference**
    - **Validates: Requirements 3.1, 3.2**
  
  - [x] 4.4 Update DispatchView display to show reference and quantity only
    - Modify the items list rendering to show only reference and quantity columns
    - Remove any size-related display elements
    - _Requirements: 3.2_
  
  - [x] 4.5 Update DispatchView item modification logic
    - Allow quantity modification without size selection
    - Remove size from any edit/modify operations
    - _Requirements: 3.3_
  
  - [ ]* 4.6 Write property test for DispatchView quantity modification
    - **Property 5: Quantity Modification Updates Correctly**
    - **Validates: Requirements 3.3**
  
  - [x] 4.7 Update DispatchView item removal logic
    - Ensure removing an item deletes the entire reference entry
    - _Requirements: 3.4_
  
  - [ ]* 4.8 Write property test for DispatchView item removal
    - **Property 4: Item Removal Deletes Entire Reference Entry**
    - **Validates: Requirements 3.4**

- [x] 5. Implement backend compatibility layer
  - [x] 5.1 Create utility function to transform ItemEntry for backend
    - Add default size value if backend API requires it
    - Handle aggregation of backend responses with multiple sizes
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 5.2 Write property test for backend aggregation round trip
    - **Property 6: Backend Data Aggregation Round Trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [x] 5.3 Update ReceptionView and DispatchView to use backend compatibility layer
    - Integrate the transformation utility when sending/receiving data
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass with minimum 100 iterations
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [x] 7. Update any related components or utilities
  - [x] 7.1 Search for and update any other components that reference ItemEntry with size
    - Use grep/search to find all references to the old ItemEntry structure
    - Update any helper functions or utilities
    - _Requirements: 4.2_
  
  - [ ]* 7.2 Write integration tests for updated components
    - Test end-to-end flows with the new simplified model
    - Verify that Reception and Dispatch views work correctly together
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Verify no regressions in other views or components
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should use a property-based testing library (e.g., fast-check for TypeScript)
- Backend compatibility is maintained by using a transformation utility
- All size-related UI elements are removed, but backend can still store size data if needed

