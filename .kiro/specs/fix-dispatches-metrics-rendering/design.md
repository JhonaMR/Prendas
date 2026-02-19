# Design Document: Fix Dispatches Metrics Rendering

## Overview

This design addresses the issue where "Unidades Despachadas" (Units Dispatched) metrics are not rendering correctly in the HomeView dashboard. The root cause is the fragile relationship chain between Dispatch → Client → Seller, which fails when any intermediate data is missing or invalid.

The solution implements robust data resolution with proper null-checking, fallback mechanisms, and defensive programming practices. We'll refactor both `MetricsDisplay.tsx` and `ChartsVisualization.tsx` to handle edge cases gracefully.

### Key Design Principles

1. **Defensive Programming**: Assume any data can be missing or invalid
2. **Fail Gracefully**: Skip problematic records rather than breaking the entire calculation
3. **Explicit Null Handling**: Check for null/undefined at each step of the relationship chain
4. **Consistent Fallbacks**: Use predictable defaults (0, empty arrays, sellerId as name)
5. **Separation of Concerns**: Create utility functions for data resolution and aggregation

## Architecture

### Component Structure

```
MetricsDisplay.tsx
├── useMemo hook for metrics calculation
│   ├── Data validation (null checks)
│   ├── Correria filtering
│   ├── Units calculation (sold & dispatched)
│   ├── Value calculation
│   └── Efficiency metrics
└── Render metrics cards

ChartsVisualization.tsx
├── useMemo hook for seller fulfillment data
│   ├── Data validation (null checks)
│   ├── Correria filtering
│   ├── Order aggregation by seller
│   ├── Dispatch aggregation by seller (with robust resolution)
│   └── Fulfillment calculation
└── Render seller fulfillment bars
```

### Data Resolution Flow

For each dispatch, the system must resolve the seller:

```
Dispatch
  ├─ dispatch.clientId (validate exists)
  │   └─ Client lookup (validate exists)
  │       └─ client.sellerId (validate exists)
  │           └─ Seller lookup (validate exists)
  │               └─ seller.name (use sellerId as fallback)
  └─ If any step fails: skip dispatch from seller attribution
```

## Components and Interfaces

### Utility Functions

#### `resolveDispatchSeller(dispatch, clients, sellers)`

Safely resolves a dispatch to its seller, handling all edge cases.

```typescript
interface DispatchSellerResolution {
  sellerId: string | null;
  sellerName: string;
  isValid: boolean;
}

function resolveDispatchSeller(
  dispatch: Dispatch,
  clients: Client[] | undefined,
  sellers: Seller[] | undefined
): DispatchSellerResolution {
  // Step 1: Validate dispatch has clientId
  if (!dispatch.clientId) {
    return { sellerId: null, sellerName: 'Unknown', isValid: false };
  }

  // Step 2: Find client
  const client = clients?.find(c => c.id === dispatch.clientId);
  if (!client) {
    return { sellerId: null, sellerName: 'Unknown', isValid: false };
  }

  // Step 3: Validate client has sellerId
  if (!client.sellerId) {
    return { sellerId: null, sellerName: 'Unknown', isValid: false };
  }

  // Step 4: Find seller
  const seller = sellers?.find(s => s.id === client.sellerId);
  const sellerName = seller?.name || client.sellerId;

  return {
    sellerId: client.sellerId,
    sellerName,
    isValid: true
  };
}
```

#### `calculateUnitsFromItems(items)`

Safely calculates total units from an items array.

```typescript
function calculateUnitsFromItems(items: ItemEntry[] | undefined): number {
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
}
```

#### `ensureArray<T>(value)`

Safely converts potentially undefined values to arrays.

```typescript
function ensureArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
```

### MetricsDisplay Component Refactoring

The metrics calculation will be refactored to:

1. Validate all state arrays exist (use `ensureArray`)
2. Filter by correria
3. Calculate units sold from orders
4. Calculate units dispatched from dispatches (with proper null handling)
5. Calculate derived metrics (fulfillment %, value, efficiency)

Key changes:
- Add explicit null checks before accessing array methods
- Use `calculateUnitsFromItems` for all unit calculations
- Ensure all calculations return 0 instead of NaN/undefined
- Add comments explaining each calculation step

### ChartsVisualization Component Refactoring

The seller fulfillment calculation will be refactored to:

1. Validate all state arrays exist
2. Filter orders by correria and aggregate by seller
3. Filter dispatches by correria and aggregate by seller using `resolveDispatchSeller`
4. Combine both aggregations into a unified seller map
5. Calculate fulfillment percentages

Key changes:
- Use `resolveDispatchSeller` for each dispatch to safely get the seller
- Skip dispatches where seller resolution fails (`isValid === false`)
- Ensure sellers with only orders show 0% fulfillment
- Ensure sellers with only dispatches show 0% fulfillment (no units to fulfill)
- Add logging for debugging (optional, can be removed later)

## Data Models

### Existing Models (from types.ts)

```typescript
interface Dispatch {
  id: string;
  clientId: string;
  correriaId: string;
  invoiceNo: string;
  remissionNo: string;
  items: ItemEntry[];
  dispatchedBy: string;
  createdAt: string;
  editLogs: AuditLog[];
}

interface Order {
  id: string;
  clientId: string;
  sellerId: string;
  correriaId: string;
  items: ItemEntry[];
  totalValue: number;
  createdAt: string;
  settledBy: string;
  orderNumber?: number;
}

interface Client {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  sellerId: string;
}

interface Seller {
  id: string;
  name: string;
}

interface ItemEntry {
  reference: string;
  quantity: number;
}
```

### New Internal Models

```typescript
interface SellerMetrics {
  sellerId: string;
  sellerName: string;
  unitsSold: number;
  unitsDispatched: number;
  fulfillmentPercentage: number;
}

interface MetricsData {
  unitsSold: number;
  unitsDispatched: number;
  fulfillmentPercentage: number;
  ordersTaken: number;
  valueSold: number;
  valueDispatched: number;
  batchesInProcess: number;
  deliveryEfficiency: number;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Dispatch Seller Resolution Chain

*For any* dispatch with a valid clientId, valid client with a valid sellerId, and valid seller, the system should correctly resolve and attribute the dispatch to that seller.

**Validates: Requirements 1.1, 1.5**

### Property 2: Dispatch Resolution Robustness with Missing Client

*For any* dispatch with an invalid or missing clientId, the system should handle it gracefully without throwing errors and skip it from seller attribution.

**Validates: Requirements 1.2, 1.4**

### Property 3: Dispatch Resolution Robustness with Missing Seller ID

*For any* dispatch with a valid client that has no sellerId assigned, the system should handle it gracefully without throwing errors and skip it from seller attribution.

**Validates: Requirements 1.3**

### Property 4: Units Dispatched Non-Negativity

*For any* correria and any set of dispatches (including those with null items or null quantities), the calculated units dispatched should always be a non-negative integer.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 5: Seller Aggregation Completeness

*For any* correria, every seller that appears in orders or dispatches should appear in the final seller fulfillment data.

**Validates: Requirements 3.1**

### Property 6: Fulfillment Percentage Calculation

*For any* seller with both orders and dispatches, the fulfillment percentage should be calculated as (unitsDispatched / unitsSold) * 100 and rounded to two decimal places.

**Validates: Requirements 3.4, 3.5**

### Property 7: Fulfillment Percentage Bounds

*For any* seller, the fulfillment percentage should always be between 0 and 100 (inclusive), or 0 if no orders exist.

**Validates: Requirements 3.2, 3.3**

### Property 8: Null State Handling

*For any* state with null or undefined orders, dispatches, sellers, or clients arrays, the system should treat them as empty arrays and return valid zero metrics instead of NaN or undefined.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

### Property 9: Seller Name Fallback

*For any* dispatch that resolves to a sellerId that doesn't exist in the sellers array, the system should use the sellerId as the display name fallback.

**Validates: Requirements 4.5**

### Property 10: Correria Filtering Consistency

*For any* correria, metrics should only include orders and dispatches where the correriaId matches the selected correria, and changing the correria should recalculate all metrics.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 11: Zero Metrics Display

*For any* correria with zero units sold or zero units dispatched, the system should display "0" instead of hiding the metric or returning undefined.

**Validates: Requirements 6.4**

### Property 12: Metrics Display Completeness

*For any* correria, both unitsSold and unitsDispatched should always be present in the rendered output as valid numbers (not undefined or NaN).

**Validates: Requirements 6.1, 6.2**

## Error Handling

### Null/Undefined Handling

- All array accesses are guarded with `ensureArray()` or explicit null checks
- All object property accesses check for existence before use
- All calculations default to 0 if data is missing

### Invalid Data Handling

- Dispatches with missing clientId are skipped
- Dispatches with invalid clientId (client not found) are skipped
- Dispatches with clients that have no sellerId are skipped
- Sellers that cannot be found are replaced with sellerId as display name
- Invalid quantity values (null, undefined, NaN) are treated as 0

### Calculation Safety

- All reduce operations start with 0 as initial value
- All division operations check for zero denominator
- All percentage calculations are bounded to [0, 100]
- All results are rounded to 2 decimal places for consistency

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Test dispatch resolution with missing client**: Verify that a dispatch with invalid clientId is skipped
2. **Test dispatch resolution with missing sellerId**: Verify that a dispatch with a client lacking sellerId is skipped
3. **Test units calculation with null items**: Verify that dispatches with null items return 0 units
4. **Test units calculation with null quantities**: Verify that items with null quantities are treated as 0
5. **Test fulfillment percentage with zero orders**: Verify that 0% is returned instead of NaN
6. **Test seller aggregation with only orders**: Verify that sellers with only orders show 0% fulfillment
7. **Test seller aggregation with only dispatches**: Verify that sellers with only dispatches show 0% fulfillment
8. **Test correria filtering**: Verify that only orders/dispatches matching the correria are included
9. **Test empty state handling**: Verify that empty arrays are handled gracefully
10. **Test seller name fallback**: Verify that sellerId is used as name when seller is not found

### Property-Based Tests

Property-based tests will verify universal properties across many generated inputs:

1. **Property 1: Dispatch Seller Resolution Chain**
   - Generate dispatches with valid client/seller chains
   - Verify that seller is correctly resolved and attributed
   - Verify that units are correctly summed for that seller

2. **Property 2: Dispatch Resolution Robustness with Missing Client**
   - Generate dispatches with invalid/missing clientIds
   - Verify that no errors are thrown
   - Verify that dispatch is skipped from seller attribution

3. **Property 3: Dispatch Resolution Robustness with Missing Seller ID**
   - Generate clients without sellerId
   - Generate dispatches pointing to those clients
   - Verify that no errors are thrown
   - Verify that dispatch is skipped from seller attribution

4. **Property 4: Units Dispatched Non-Negativity**
   - Generate random dispatches with various item configurations
   - Include dispatches with null items and null quantities
   - Verify that calculated units dispatched is always >= 0
   - Verify that result is always an integer

5. **Property 5: Seller Aggregation Completeness**
   - Generate random orders and dispatches for multiple sellers
   - Verify that every seller in orders appears in final data
   - Verify that every seller in dispatches appears in final data

6. **Property 6: Fulfillment Percentage Calculation**
   - Generate sellers with various order/dispatch combinations
   - Verify that fulfillment is calculated as (unitsDispatched / unitsSold) * 100
   - Verify that result is rounded to 2 decimal places

7. **Property 7: Fulfillment Percentage Bounds**
   - Generate random sellers with various order/dispatch combinations
   - Verify that fulfillment percentage is always in [0, 100]
   - Verify that result is always a number (not NaN)

8. **Property 8: Null State Handling**
   - Generate states with null/undefined orders, dispatches, sellers, clients
   - Verify that no errors are thrown
   - Verify that all calculations return valid numbers (not NaN/undefined)

9. **Property 9: Seller Name Fallback**
   - Generate dispatches that resolve to non-existent sellers
   - Verify that sellerId is used as display name
   - Verify that no errors are thrown

10. **Property 10: Correria Filtering Consistency**
    - Generate orders and dispatches for multiple correrias
    - Verify that metrics only include data matching selected correria
    - Verify that changing correria updates metrics correctly

11. **Property 11: Zero Metrics Display**
    - Generate correrias with zero units sold or dispatched
    - Verify that metrics display "0" instead of undefined
    - Verify that metrics are always present in output

12. **Property 12: Metrics Display Completeness**
    - Generate various correria states
    - Verify that both unitsSold and unitsDispatched are always present
    - Verify that both values are always valid numbers (not undefined)

### Testing Configuration

- Minimum 100 iterations per property test
- Use fast-check or similar library for property generation
- Tag each test with: `Feature: fix-dispatches-metrics-rendering, Property N: [property text]`
- Include both positive cases (valid data) and negative cases (missing/invalid data)

