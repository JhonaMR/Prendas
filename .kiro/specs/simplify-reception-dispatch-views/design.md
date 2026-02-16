# Design Document: Simplify Reception and Dispatch Views

## Overview

This design simplifies the Reception and Dispatch views by removing the size selection system. The new architecture uses a flat ItemEntry model with only reference and quantity fields. The Scanner Simulator is updated to accept only reference and quantity inputs. Both views are refactored to display aggregated quantities per reference without size breakdown.

The backend compatibility is maintained by either sending a default size value or by aggregating quantities across sizes when receiving data from the backend.

## Architecture

### Current State
- ItemEntry: `{ reference: string, size: string, quantity: number }`
- Scanner Simulator: Requires reference, size, and quantity
- Views: Display items grouped by reference and size
- Backend: Stores items with size information

### New State
- ItemEntry: `{ reference: string, quantity: number }`
- Scanner Simulator: Requires reference and quantity only
- Views: Display items grouped by reference only (aggregated quantity)
- Backend: Receives items with default/null size or aggregated data

## Components and Interfaces

### 1. Updated ItemEntry Interface

```typescript
interface ItemEntry {
  reference: string;
  quantity: number;
}
```

**Changes from current**:
- Removed `size: string` field
- Simplified to two required fields only

### 2. Updated ScannerSimulator Component

**Props**:
```typescript
interface ScannerSimulatorProps {
  onScan: (reference: string, quantity: number) => void;
  label?: string;
}
```

**Changes**:
- `onScan` callback now receives only `(reference, quantity)` instead of `(reference, size, quantity)`
- Remove size selector dropdown from UI
- Keep reference input, quantity controls, and action buttons
- Maintain camera toggle button for consistency

**UI Layout**:
- Reference input (left side)
- Quantity controls with +/- buttons (center)
- Camera toggle and Add button (right side)
- Remove the size selector column entirely

### 3. ReceptionView Component

**State Changes**:
- `items: ItemEntry[]` - now contains only reference and quantity
- Remove any size-related state or filtering

**Display Logic**:
- Show items as a list with reference and quantity columns
- If an item with the same reference is added again, increment the quantity
- Remove size-based grouping or display

**Interaction**:
- Accept ItemEntry from ScannerSimulator with only reference and quantity
- Update or add items based on reference matching
- Remove size from any edit/modify operations

### 4. DispatchView Component

**State Changes**:
- `items: ItemEntry[]` - now contains only reference and quantity
- Remove any size-related state or filtering

**Display Logic**:
- Show items as a list with reference and quantity columns
- If an item with the same reference is added again, increment the quantity
- Remove size-based grouping or display

**Interaction**:
- Accept ItemEntry from ScannerSimulator with only reference and quantity
- Update or add items based on reference matching
- Remove size from any edit/modify operations

## Data Models

### ItemEntry (Simplified)

```typescript
interface ItemEntry {
  reference: string;      // Product identifier
  quantity: number;       // Total quantity (no size breakdown)
}
```

### Backend Integration

When sending data to the backend:
- If the backend API requires a size field, use a default value (e.g., "DEFAULT" or null)
- If the backend returns items with sizes, aggregate quantities by reference before displaying

Example transformation:
```typescript
// Backend response with sizes
[
  { reference: "REF001", size: "S", quantity: 5 },
  { reference: "REF001", size: "M", quantity: 3 },
  { reference: "REF001", size: "L", quantity: 2 }
]

// Transformed for display
[
  { reference: "REF001", quantity: 10 }
]
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Scanner Simulator Accepts Reference and Quantity Only

*For any* valid reference string and positive quantity, when the Scanner Simulator's Add button is clicked, the onScan callback should be invoked with exactly the reference and quantity (no size parameter).

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Reception View Aggregates Items by Reference

*For any* sequence of ItemEntry additions where multiple entries have the same reference, the Reception view should display a single entry per reference with the quantity being the sum of all additions for that reference.

**Validates: Requirements 2.1, 2.2**

### Property 3: Dispatch View Aggregates Items by Reference

*For any* sequence of ItemEntry additions where multiple entries have the same reference, the Dispatch view should display a single entry per reference with the quantity being the sum of all additions for that reference.

**Validates: Requirements 3.1, 3.2**

### Property 4: Item Removal Deletes Entire Reference Entry

*For any* ItemEntry in the Reception or Dispatch view, when the remove action is triggered, the entire reference entry should be removed from the list regardless of the quantity value.

**Validates: Requirements 2.4, 3.4**

### Property 5: Quantity Modification Updates Correctly

*For any* existing ItemEntry in the Reception or Dispatch view, when the quantity is modified, the updated quantity should be reflected in the view without requiring size selection or affecting other references.

**Validates: Requirements 2.3, 3.3**

### Property 6: Backend Data Aggregation Round Trip

*For any* backend response containing multiple items with the same reference but different sizes, aggregating quantities by reference and then sending back to the backend should preserve the total quantity for that reference.

**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### Invalid Input Handling

- **Empty Reference**: Disable the Add button if reference is empty
- **Zero or Negative Quantity**: Prevent quantity from going below 1 using the +/- controls
- **Duplicate Reference**: When adding an item with an existing reference, increment the quantity instead of creating a duplicate entry

### Backend Compatibility

- **Missing Size Field**: If the backend requires a size field, use a default value (e.g., "DEFAULT")
- **Size Data in Response**: Aggregate quantities across sizes before displaying in the UI
- **API Errors**: Display appropriate error messages if the backend rejects the request

## Testing Strategy

### Unit Tests

Unit tests should verify specific examples and edge cases:

1. **ScannerSimulator**:
   - Verify that the onScan callback is called with reference and quantity only (no size)
   - Verify that the Add button is disabled when reference is empty
   - Verify that quantity cannot go below 1
   - Verify that pressing Enter triggers the scan

2. **ReceptionView**:
   - Verify that adding an item creates an entry with reference and quantity
   - Verify that adding a duplicate reference increments the quantity
   - Verify that removing an item deletes the entire reference entry
   - Verify that modifying quantity updates the display correctly

3. **DispatchView**:
   - Same tests as ReceptionView for consistency

4. **Backend Integration**:
   - Verify that data sent to the backend includes a default size if required
   - Verify that backend responses with multiple sizes are aggregated correctly

### Property-Based Tests

Property-based tests should verify universal properties across all inputs:

1. **Property 1: Scanner Simulator Callback Signature**
   - Generate random reference strings and quantities
   - Verify that onScan is called with exactly 2 parameters (reference, quantity)
   - Verify that no size parameter is passed

2. **Property 2: Reception View Aggregation**
   - Generate random sequences of ItemEntry additions with varying references
   - Verify that items with the same reference are aggregated
   - Verify that the total quantity equals the sum of all additions for that reference

3. **Property 3: Dispatch View Aggregation**
   - Same as Property 2 for Dispatch view

4. **Property 4: Item Removal**
   - Generate random ItemEntry lists and removal operations
   - Verify that removing an item removes the entire reference entry
   - Verify that other references are unaffected

5. **Property 5: Quantity Modification**
   - Generate random ItemEntry lists and quantity modifications
   - Verify that modifying quantity updates the display correctly
   - Verify that other references are unaffected

6. **Property 6: Backend Aggregation Round Trip**
   - Generate random backend responses with multiple sizes per reference
   - Aggregate quantities by reference
   - Verify that the total quantity is preserved

### Test Configuration

- Minimum 100 iterations per property test
- Each property test should be tagged with the corresponding design property
- Tag format: `Feature: simplify-reception-dispatch-views, Property {number}: {property_text}`

