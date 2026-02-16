# Requirements Document: Simplify Reception and Dispatch Views

## Introduction

This feature simplifies the Reception and Dispatch views by removing the size/talla selection system. Currently, users must scan or enter Reference + Size + Quantity for each item. The new system streamlines this to Reference + Quantity only, making the workflow faster and more direct. The backend will continue to store size information, but the UI will no longer expose or require size selection.

## Glossary

- **Reference**: Product identifier code (e.g., "REF001")
- **Quantity**: Number of units being received or dispatched (global count, not per-size)
- **ItemEntry**: Data structure representing a scanned/entered item with reference and quantity
- **Reception View**: UI for receiving incoming inventory
- **Dispatch View**: UI for dispatching outgoing inventory
- **Scanner Simulator**: Component that simulates barcode scanning for testing and development

## Requirements

### Requirement 1: Remove Size Selection from Scanner Simulator

**User Story:** As a warehouse operator, I want to scan items without selecting a size, so that I can process items faster without extra steps.

#### Acceptance Criteria

1. WHEN the Scanner Simulator is displayed THEN the system SHALL NOT show a size selector dropdown
2. WHEN a user enters a reference and quantity THEN the system SHALL accept only reference and quantity inputs
3. WHEN a user presses Enter or clicks the Add button THEN the system SHALL trigger the scan with reference and quantity only
4. WHEN the Scanner Simulator is reset THEN the system SHALL clear the reference input and reset quantity to 1

### Requirement 2: Simplify Reception View Item Entry

**User Story:** As a warehouse manager, I want the Reception view to work with reference and quantity only, so that receiving items is faster and less error-prone.

#### Acceptance Criteria

1. WHEN items are added to the reception list THEN the system SHALL store only reference and quantity (no size breakdown)
2. WHEN displaying the reception list THEN the system SHALL show reference and total quantity per reference
3. WHEN a user modifies an existing item THEN the system SHALL update the quantity without requiring size selection
4. WHEN a user removes an item THEN the system SHALL remove the entire reference entry regardless of previous size data

### Requirement 3: Simplify Dispatch View Item Entry

**User Story:** As a warehouse operator, I want the Dispatch view to work with reference and quantity only, so that dispatching items is straightforward and efficient.

#### Acceptance Criteria

1. WHEN items are added to the dispatch list THEN the system SHALL store only reference and quantity (no size breakdown)
2. WHEN displaying the dispatch list THEN the system SHALL show reference and total quantity per reference
3. WHEN a user modifies an existing item THEN the system SHALL update the quantity without requiring size selection
4. WHEN a user removes an item THEN the system SHALL remove the entire reference entry regardless of previous size data

### Requirement 4: Update Data Models for Item Entry

**User Story:** As a developer, I want the ItemEntry data structure to reflect the simplified model, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. WHEN ItemEntry is defined THEN the system SHALL include reference and quantity fields only
2. WHEN ItemEntry is used in Reception or Dispatch THEN the system SHALL NOT include a size field
3. WHEN existing code references ItemEntry THEN the system SHALL maintain backward compatibility where the backend still accepts size data

### Requirement 5: Maintain Backend Compatibility

**User Story:** As a system architect, I want the frontend changes to work with the existing backend structure, so that no backend modifications are required.

#### Acceptance Criteria

1. WHEN data is sent to the backend THEN the system SHALL include a default or null size value if required by the backend API
2. WHEN the backend returns item data with sizes THEN the system SHALL aggregate quantities across all sizes for display
3. WHEN persisting reception or dispatch data THEN the system SHALL ensure the backend receives properly formatted data

