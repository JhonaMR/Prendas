# Design Document: SQLite Optimization and Pagination

## Overview

This design implements database optimization through strategic indexing and persistent connections, combined with pagination across multiple views to handle growing data volumes. The architecture separates concerns between database layer, backend API layer, and frontend UI layer, ensuring maintainability and scalability.

**Key Design Decisions:**
- Persistent SQLite connection managed at application startup/shutdown
- Strategic composite indexes on frequently queried columns
- Pagination implemented at both backend (query level) and frontend (UI level)
- Reusable pagination component for consistency across views
- In-memory cache for master data to reduce database queries
- Lazy loading of paginated data to maintain responsiveness

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Views (DeliveryDates, Dispatch, Reception, etc.)    │   │
│  │  ├─ PaginationComponent (reusable)                   │   │
│  │  ├─ FilterComponent                                  │   │
│  │  └─ DataTable                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Client (fetch with page, limit, filters)        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  ├─ GET /api/delivery-dates?page=1&limit=20         │   │
│  │  ├─ GET /api/dispatches?page=1&limit=20             │   │
│  │  ├─ GET /api/receptions?page=1&limit=20             │   │
│  │  └─ GET /api/returns?page=1&limit=20                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Service Layer (with pagination logic)               │   │
│  │  ├─ DeliveryDatesService.getAllWithPagination()      │   │
│  │  ├─ DispatchService.getAllWithPagination()           │   │
│  │  ├─ ReceptionService.getAllWithPagination()          │   │
│  │  └─ ReturnService.getAllWithPagination()             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cache Layer (Master Data)                           │   │
│  │  ├─ ReferenceCache                                   │   │
│  │  ├─ ClientCache                                      │   │
│  │  └─ ConfeccionistaCache                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database Layer (Query Optimization)                 │   │
│  │  ├─ Persistent Connection Manager                    │   │
│  │  ├─ Query Builder with Index Hints                   │   │
│  │  └─ Index Management                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  SQLite Database                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables with Strategic Indexes:                      │   │
│  │  ├─ delivery_dates (idx: confeccionista_id,          │   │
│  │  │                      reference_id, send_date)     │   │
│  │  ├─ dispatch_items (idx: reference_id)               │   │
│  │  ├─ reception_items (idx: reference_id)              │   │
│  │  └─ orders (idx: correria_id, client_id)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Connection Manager

**Purpose**: Manages persistent SQLite connection lifecycle

```typescript
interface DatabaseConnection {
  connection: Database;
  isConnected: boolean;
  connect(): void;
  disconnect(): void;
  query(sql: string, params?: any[]): any[];
  queryOne(sql: string, params?: any[]): any;
}
```

### 2. Pagination Service

**Purpose**: Handles pagination logic for all data retrieval

```typescript
interface PaginationParams {
  page: number;        // 1-indexed
  limit: number;       // 10-20 records per page
  filters?: FilterParams;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FilterParams {
  startDate?: string;
  endDate?: string;
  confeccionista_id?: number;
  reference_id?: number;
  client_id?: number;
  correria_id?: number;
  [key: string]: any;
}
```

### 3. Cache Manager

**Purpose**: Manages in-memory cache for master data

```typescript
interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  invalidate(key: string): void;
  clear(): void;
  loadMasterData(): void;
}
```

### 4. Pagination Component (React)

**Purpose**: Reusable UI component for pagination controls

```typescript
interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
```

### 5. Service Layer with Pagination

**Purpose**: Implements pagination logic for each data type

```typescript
interface DeliveryDatesService {
  getAllWithPagination(params: PaginationParams): Promise<PaginatedResponse<DeliveryDate>>;
  getByConfeccionista(confeccionista_id: number, params: PaginationParams): Promise<PaginatedResponse<DeliveryDate>>;
  getByReference(reference_id: number, params: PaginationParams): Promise<PaginatedResponse<DeliveryDate>>;
}
```

## Data Models

### Pagination Response Structure

```typescript
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: FilterParams;
};
```

### Database Index Definitions

```sql
-- delivery_dates indexes
CREATE INDEX IF NOT EXISTS idx_delivery_dates_confeccionista_reference_date 
  ON delivery_dates(confeccionista_id, reference_id, send_date);

-- dispatch_items indexes
CREATE INDEX IF NOT EXISTS idx_dispatch_items_reference 
  ON dispatch_items(reference_id);

-- reception_items indexes
CREATE INDEX IF NOT EXISTS idx_reception_items_reference 
  ON reception_items(reference_id);

-- orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_correria_client 
  ON orders(correria_id, client_id);
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Pagination Offset Calculation

*For any* paginated query with page number p and limit l, the offset should be calculated as (p - 1) * l, ensuring correct record skipping.

**Validates: Requirements 3.2, 4.2, 5.2, 6.2, 7.2, 8.2**

### Property 2: Total Pages Calculation

*For any* dataset with total records t and limit l, the total pages should be calculated as ceil(t / l), ensuring accurate page count.

**Validates: Requirements 3.3, 4.3, 5.3, 6.3, 7.3, 8.3**

### Property 3: Page Boundary Validation

*For any* paginated response, if the current page is the last page, then hasNextPage should be false, and if it's the first page, hasPreviousPage should be false.

**Validates: Requirements 3.5, 4.5, 5.5, 6.5, 7.5, 8.5**

### Property 4: Filter Application Consistency

*For any* filter applied to a paginated query, all records in the result set should satisfy the filter criteria, regardless of which page is requested.

**Validates: Requirements 3.4, 4.4, 5.4, 6.4, 7.4, 8.4**

### Property 5: Data Integrity After Pagination

*For any* dataset, the union of all pages should equal the complete unfiltered dataset, ensuring no data loss or duplication across pages.

**Validates: Requirements 3.1, 4.1, 5.1, 6.1, 7.1, 8.1**

### Property 6: Index Usage in Queries

*For any* query on indexed columns, the query execution plan should indicate index usage, ensuring performance optimization.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 12.2**

### Property 7: Connection Persistence

*For any* sequence of queries executed in the same session, the database connection should remain open and reused, not creating new connections.

**Validates: Requirements 1.2, 1.4**

### Property 8: Cache Consistency

*For any* master data access, if the cache is valid, the cached value should match the current database value, ensuring data consistency.

**Validates: Requirements 13.2, 13.4**

### Property 9: Lazy Loading Behavior

*For any* paginated view, only the requested page of data should be fetched from the database, not the entire dataset.

**Validates: Requirements 14.1, 14.2**

### Property 10: OrdersView Unaffected

*For any* query to OrdersView, the system SHALL return all orders without pagination, maintaining backward compatibility.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

## Error Handling

### Pagination Errors

- **Invalid Page Number**: If page < 1, return page 1
- **Page Out of Range**: If page > totalPages, return the last page
- **Invalid Limit**: If limit < 1 or limit > 100, use default limit of 20
- **No Results**: Return empty data array with pagination metadata

### Database Errors

- **Connection Failure**: Log error and attempt reconnection
- **Query Timeout**: Return error response with 500 status code
- **Index Creation Failure**: Log warning and continue without index

### Cache Errors

- **Cache Miss**: Fall back to database query
- **Cache Invalidation Failure**: Log warning and continue

## Testing Strategy

### Unit Tests

- Test pagination offset and limit calculations
- Test total pages calculation with various dataset sizes
- Test filter application with edge cases (empty results, single result)
- Test boundary conditions (first page, last page, single page)
- Test cache hit/miss scenarios
- Test connection persistence across multiple queries

### Property-Based Tests

**Property 1: Pagination Offset Calculation**
- Generate random page numbers (1-1000) and limits (1-100)
- Verify offset = (page - 1) * limit
- Minimum 100 iterations

**Property 2: Total Pages Calculation**
- Generate random total records (0-10000) and limits (1-100)
- Verify totalPages = ceil(total / limit)
- Minimum 100 iterations

**Property 3: Page Boundary Validation**
- Generate random page numbers and verify boundary flags
- Verify hasNextPage = (page < totalPages)
- Verify hasPreviousPage = (page > 1)
- Minimum 100 iterations

**Property 4: Filter Application Consistency**
- Generate random datasets with various filters
- Verify all results satisfy filter criteria
- Verify results are consistent across pages
- Minimum 100 iterations

**Property 5: Data Integrity After Pagination**
- Generate random datasets and page through all pages
- Verify union of all pages equals complete dataset
- Verify no duplicates across pages
- Minimum 100 iterations

**Property 6: Index Usage in Queries**
- Execute queries on indexed columns
- Verify query plan shows index usage
- Minimum 100 iterations

**Property 7: Connection Persistence**
- Execute multiple queries in sequence
- Verify connection remains open
- Verify no new connections created
- Minimum 100 iterations

**Property 8: Cache Consistency**
- Load master data into cache
- Verify cached values match database
- Modify database and invalidate cache
- Verify cache reflects changes
- Minimum 100 iterations

**Property 9: Lazy Loading Behavior**
- Request specific page of data
- Verify only that page is fetched
- Verify total dataset not loaded
- Minimum 100 iterations

**Property 10: OrdersView Unaffected**
- Query OrdersView
- Verify all orders returned
- Verify no pagination applied
- Minimum 100 iterations

### Integration Tests

- Test pagination across multiple views
- Test filter combinations with pagination
- Test cache invalidation with data updates
- Test connection persistence across application lifecycle

