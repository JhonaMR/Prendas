# Design Document: Delivery Dates Module

## Overview

The Delivery Dates Module is a full-stack feature that enables tracking and management of manufacturing batch delivery schedules. It consists of a backend API layer for data persistence and a frontend React component for user interaction.

## Architecture

### Backend Architecture

#### Database Layer
- **Table**: `delivery_dates`
- **Fields**: id, confeccionista_id, reference_id, quantity, send_date, expected_date, delivery_date, process, observation, created_at, created_by
- **Primary Key**: id (TEXT)
- **Foreign Keys**: confeccionista_id (references confeccionistas), reference_id (references product_references)

#### Service Layer
- **File**: `backend/src/controllers/entities/deliveryDates/deliveryDatesService.js`
- **Responsibilities**:
  - Business logic for delivery date operations
  - Data transformation and validation
  - Calculation of metrics (delays, efficiency, rotations)

#### Validator Layer
- **File**: `backend/src/controllers/entities/deliveryDates/deliveryDatesValidator.js`
- **Responsibilities**:
  - Validate required fields
  - Validate data types
  - Validate date formats
  - Validate foreign key references

#### Controller Layer
- **File**: `backend/src/controllers/entities/deliveryDates/deliveryDatesController.js`
- **Endpoints**:
  - `GET /api/delivery-dates` - Retrieve all delivery dates
  - `POST /api/delivery-dates/batch` - Create/update multiple delivery dates
  - `DELETE /api/delivery-dates/:id` - Delete a delivery date

### Frontend Architecture

#### Type Definitions
- **File**: `src/types.ts`
- **Interface**: `DeliveryDate` with all required fields
- **Integration**: Add `deliveryDates: DeliveryDate[]` to `AppState`

#### API Service
- **File**: `src/services/api.ts`
- **Methods**:
  - `getDeliveryDates()` - Fetch all delivery dates
  - `saveDeliveryDatesBatch(dates)` - Save multiple delivery dates
  - `deleteDeliveryDate(id)` - Delete a delivery date

#### View Component
- **File**: `src/views/DeliveryDatesView.tsx`
- **Features**:
  - Editable table with inline editing
  - Filters (confeccionista, date range)
  - Metrics dashboard
  - Add/Edit/Delete operations
  - Permission-based UI (admin only)

#### Integration
- **File**: `src/App.tsx`
- **Changes**:
  - Import DeliveryDatesView
  - Add deliveryDates to AppState initialization
  - Add menu item between "Comercial" and "Reportes"
  - Add case handler in renderContent

## Data Flow

### Create/Update Flow
1. User adds/edits row in table
2. Changes tracked in component state
3. User clicks "Save"
4. Component validates changes
5. API sends batch update request
6. Backend validates and stores in database
7. Frontend updates state with confirmation

### Read Flow
1. App loads
2. useEffect triggers data load
3. API fetches all delivery dates
4. Frontend updates AppState
5. DeliveryDatesView renders table

### Delete Flow
1. User clicks delete button
2. Confirmation dialog appears
3. If confirmed, API sends DELETE request
4. Backend deletes from database
5. Frontend removes from state

## Correctness Properties

### Property 1: Data Persistence
**Validates: Requirement 1, 3**
- When a delivery date record is created or updated, it must be persisted in the database
- When the application reloads, the same data must be retrievable

### Property 2: Date Calculations
**Validates: Requirement 2, 6**
- Date difference = expected_date - delivery_date (in days)
- Rotation initial = send_date to expected_date (in days)
- Rotation final = send_date to delivery_date (in days)
- Rotation difference = rotation_final - rotation_initial

### Property 3: Metrics Accuracy
**Validates: Requirement 6**
- Priority batches count = count of records where (delivery_date - expected_date) > 20 days
- Batches in process = count of records where delivery_date is null
- Average delay = mean of all (delivery_date - expected_date) values
- Efficiency = (count of on-time deliveries / total records) * 100

### Property 4: Permission Control
**Validates: Requirement 7**
- Non-admin users cannot see edit/delete buttons
- Non-admin users cannot call POST/DELETE endpoints
- API returns 403 Forbidden for unauthorized requests

### Property 5: Data Validation
**Validates: Requirement 8**
- All required fields must be present
- Dates must be valid ISO format
- Quantity must be positive integer
- Foreign keys must reference existing entities

### Property 6: Filter Accuracy
**Validates: Requirement 5**
- Confeccionista filter shows only records matching selected confeccionista
- Date filter shows only records within date range
- Hide delivered filter excludes records with delivery_date set
- Filters can be combined

### Property 7: Unsaved Changes Tracking
**Validates: Requirement 9**
- When a record is modified, unsaved changes flag is set
- When save is clicked, flag is cleared
- When page is closed with unsaved changes, warning appears

## Component Structure

### DeliveryDatesView Component
```
DeliveryDatesView
├── Header (title + filters)
├── Metrics Cards (4 cards)
├── Add Row Button
├── Table
│   ├── Header Row
│   └── Data Rows
│       ├── Confeccionista Autocomplete
│       ├── Reference Input
│       ├── Quantity Input
│       ├── Date Inputs (4)
│       ├── Calculated Fields (4)
│       ├── Process Input
│       ├── Observation Input
│       └── Delete Button
└── Save Button
```

### ConfeccionistaAutocomplete Component
- Dropdown with search
- Filters by name or ID
- Shows active confeccionistas only

## State Management

### Component State
- `initialData`: Original data for change detection
- `isSaving`: Loading state during save
- `hideDelivered`: Filter toggle
- `confFilter`: Confeccionista filter value
- `dateFilter`: Date filter value
- `hasUnsavedChanges`: Ref to track unsaved state

### AppState Integration
- `deliveryDates`: Array of DeliveryDate objects
- Loaded on app initialization
- Updated on save/delete operations

## Error Handling

### Backend Errors
- Invalid data: Return 400 with field-specific errors
- Not found: Return 404 for delete operations
- Unauthorized: Return 403 for non-admin users
- Server errors: Return 500 with generic message

### Frontend Errors
- Network errors: Show alert with connection message
- Validation errors: Show alert with error details
- Unsaved changes: Show confirmation dialog

## Performance Considerations

- Batch operations for multiple saves
- Memoized calculations for metrics
- Filtered data computed with useMemo
- Inline editing without full table re-render
- Lazy loading of confeccionistas in autocomplete

## Security Considerations

- Token-based authentication on all endpoints
- Role-based access control (admin only)
- Input validation on both frontend and backend
- SQL injection prevention through parameterized queries
- CORS headers properly configured
