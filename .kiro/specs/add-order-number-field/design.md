# Design Document: Add Order Number Field

## Overview

This design adds an optional "Order Number" field to the order settlement workflow. The field will be integrated into the OrderSettleView component, transmitted to the backend, and persisted in the SQLite database. The implementation follows the existing patterns in the codebase for optional fields and maintains backward compatibility with existing orders.

## Architecture

The feature follows a three-layer architecture:

1. **Frontend Layer (React/TypeScript)**: OrderSettleView component with UI input field
2. **API Layer (Express.js)**: movementsController handles order creation and updates
3. **Data Layer (SQLite)**: orders table stores the order_number field

The data flow is:
- User enters order number in OrderSettleView
- Form submission sends order_number in API request payload
- Backend validates and stores in database
- Order object is returned with order_number field

## Components and Interfaces

### Frontend Components

**OrderSettleView.tsx**
- Add state variable for order number input
- Add input field in the "1. Datos del Pedido" section
- Include order_number in the newOrder object when saving
- Pass order_number to the API request

**types.ts - Order Interface**
- Add optional `orderNumber?: number` property to Order interface
- Maintains backward compatibility with existing orders

### Backend Components

**movementsController.js - createOrder function**
- Extract `orderNumber` from request body (optional)
- Pass orderNumber to database INSERT statement
- Include orderNumber in response payload

**database.js - initDatabase function**
- Add `order_number` column to orders table
- Column type: INTEGER, nullable
- No unique constraint (multiple orders can share same number)

## Data Models

### Order Interface (Frontend)
```typescript
interface Order {
  id: string;
  clientId: string;
  sellerId: string;
  correriaId: string;
  items: ItemEntry[];
  totalValue: number;
  createdAt: string;
  settledBy: string;
  orderNumber?: number;  // NEW: Optional order number
}
```

### Database Schema (Backend)
```sql
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    correria_id TEXT NOT NULL,
    total_value REAL NOT NULL,
    created_at TEXT NOT NULL,
    settled_by TEXT NOT NULL,
    order_number INTEGER,  -- NEW: Optional order number
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    FOREIGN KEY (correria_id) REFERENCES correrias(id)
)
```

### API Request Payload
```json
{
  "clientId": "string",
  "sellerId": "string",
  "correriaId": "string",
  "items": [
    {
      "reference": "string",
      "size": "string",
      "quantity": "number"
    }
  ],
  "totalValue": "number",
  "settledBy": "string",
  "orderNumber": "number | null"  -- NEW: Optional order number
}
```

### API Response Payload
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": "string",
    "clientId": "string",
    "sellerId": "string",
    "correriaId": "string",
    "items": [...],
    "totalValue": "number",
    "createdAt": "string",
    "settledBy": "string",
    "orderNumber": "number | null"  -- NEW: Optional order number
  }
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Order Number Input Validation
*For any* input to the order number field, if the input contains non-numeric characters, the field SHALL reject the input and maintain the previously valid value (or empty state if no prior value existed).

**Validates: Requirements 1.4**

### Property 2: Optional Order Number Persistence
*For any* order created with an order number, querying the database for that order SHALL return the same order number value that was submitted.

**Validates: Requirements 2.1**

### Property 3: Null Order Number Handling
*For any* order created without an order number (null or undefined), the database SHALL store a null value, and subsequent queries SHALL return null for the order_number field.

**Validates: Requirements 2.2**

### Property 4: Order Number Round Trip
*For any* order with an order number, serializing the order to JSON and deserializing it SHALL preserve the order_number value exactly.

**Validates: Requirements 3.1**

### Property 5: Order Number Editability
*For any* existing order, updating the order_number field and persisting the change SHALL result in the database containing the new order_number value when queried.

**Validates: Requirements 5.2, 5.3**

### Property 6: Order Number Display on Load
*For any* order loaded from the database with a non-null order_number, the OrderSettleView SHALL display that value in the order number input field.

**Validates: Requirements 5.1**

## Error Handling

**Invalid Input Handling**
- Non-numeric input: Reject silently, maintain previous value
- Negative numbers: Accept (no validation constraint specified)
- Decimal numbers: Accept (HTML number input handles this)
- Very large numbers: Accept (SQLite INTEGER supports large values)

**Database Errors**
- If order_number column doesn't exist: Migration will add it
- If database insert fails: Return 500 error with message
- If order_number is invalid type: Coerce to null

**API Error Responses**
- 400: Missing required fields (clientId, sellerId, correriaId, items, totalValue, settledBy)
- 500: Database error during insert/update

## Testing Strategy

### Unit Tests
- Test that non-numeric input is rejected in the input field
- Test that empty order number field allows form submission
- Test that order number is included in API request payload
- Test that null order number is handled correctly in database
- Test that order number is displayed when loading existing order
- Test edge cases: very large numbers, zero, negative numbers

### Property-Based Tests
- **Property 1**: Generate random strings and verify non-numeric characters are rejected
- **Property 2**: Generate random valid orders with order numbers, verify persistence
- **Property 3**: Generate random orders without order numbers, verify null storage
- **Property 4**: Generate random orders, serialize/deserialize, verify round trip
- **Property 5**: Generate random orders, update order number, verify update persists
- **Property 6**: Generate random orders with order numbers, load from DB, verify display

### Test Configuration
- Minimum 100 iterations per property test
- Use fast-check or similar library for property-based testing
- Tag each test with: **Feature: add-order-number-field, Property {number}: {property_text}**
- Mock database for unit tests
- Use real database for integration tests

## Implementation Notes

- The order_number field is optional and nullable to maintain backward compatibility
- No unique constraint on order_number (multiple orders can share the same number)
- No format validation (accepts any integer value)
- Field can be edited after order settlement (requires update endpoint)
- No changes needed to App.tsx (state management already handles optional fields)
- Existing orders will have null order_number values
