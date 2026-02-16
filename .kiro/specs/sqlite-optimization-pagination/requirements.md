# Requirements Document: SQLite Optimization and Pagination

## Introduction

This feature optimizes the SQLite database with strategic indexing, persistent connections, and implements pagination across multiple views to handle growing data volumes efficiently. The system currently projects ~8,750 records annually (750 references, 3,000 dispatches, 5,000 reception/return/delivery records). Pagination will improve performance and user experience by limiting data retrieval and display.

## Glossary

- **Database_Connection**: A persistent SQLite connection using better-sqlite3 that remains open for the application lifetime
- **Index**: A database structure that improves query performance by organizing data for faster lookups
- **Pagination**: A technique to divide large datasets into smaller, manageable pages
- **Page**: A subset of records returned from a paginated query, typically 10-20 records
- **Limit**: The maximum number of records to return per page
- **Offset**: The number of records to skip before returning results
- **Filter**: Query parameters that restrict results (date range, confeccionista_id, reference_id, etc.)
- **Lazy_Loading**: Loading data only when needed, typically when a user navigates to a specific page
- **Cache**: In-memory storage of frequently accessed master data (references, clients, confeccionistas)
- **Query_Optimization**: Techniques to reduce database load and improve response times

## Requirements

### Requirement 1: Database Connection Persistence

**User Story:** As a system administrator, I want the database connection to persist throughout the application lifetime, so that I can reduce connection overhead and improve performance.

#### Acceptance Criteria

1. WHEN the application starts, THE Database_Connection SHALL be established once and reused for all queries
2. WHEN a query is executed, THE Database_Connection SHALL be reused instead of creating a new connection
3. WHEN the application terminates, THE Database_Connection SHALL be properly closed
4. WHEN multiple queries are executed in sequence, THE Database_Connection SHALL remain open between queries

### Requirement 2: Strategic Database Indexing

**User Story:** As a database administrator, I want strategic indexes on critical tables, so that query performance is optimized for the projected data volume.

#### Acceptance Criteria

1. WHEN querying delivery_dates by confeccionista_id and reference_id, THE Index on (confeccionista_id, reference_id, send_date) SHALL exist and be used
2. WHEN querying dispatch_items by reference_id, THE Index on (reference_id) SHALL exist and be used
3. WHEN querying reception_items by reference_id, THE Index on (reference_id) SHALL exist and be used
4. WHEN querying orders by correria_id or client_id, THE Index on (correria_id, client_id) SHALL exist and be used
5. WHEN indexes are created, THE Database_Schema SHALL be updated without data loss

### Requirement 3: Pagination in DeliveryDatesView

**User Story:** As a user, I want to view delivery dates in paginated format, so that I can navigate large datasets efficiently without performance degradation.

#### Acceptance Criteria

1. WHEN the DeliveryDatesView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters (date range, confeccionista), THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 4: Pagination in DispatchView

**User Story:** As a user, I want to view dispatch records in paginated format, so that I can efficiently browse dispatch history.

#### Acceptance Criteria

1. WHEN the DispatchView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters, THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 5: Pagination in ReceptionView

**User Story:** As a user, I want to view reception records in paginated format, so that I can efficiently manage reception data.

#### Acceptance Criteria

1. WHEN the ReceptionView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters, THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 6: Pagination in ReturnReceptionView

**User Story:** As a user, I want to view return reception records in paginated format, so that I can efficiently manage returns.

#### Acceptance Criteria

1. WHEN the ReturnReceptionView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters, THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 7: Pagination in DispatchControlView

**User Story:** As a user, I want to view dispatch control records in paginated format, so that I can efficiently monitor dispatch operations.

#### Acceptance Criteria

1. WHEN the DispatchControlView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters, THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 8: Pagination in OrderHistoryView

**User Story:** As a user, I want to view order history in paginated format, so that I can efficiently browse historical orders.

#### Acceptance Criteria

1. WHEN the OrderHistoryView loads, THE system SHALL display the first page with 10-20 records
2. WHEN a user navigates to a different page, THE system SHALL fetch and display the correct page of records
3. WHEN pagination controls are displayed, THE system SHALL show current page number and total pages
4. WHEN a user applies filters, THE system SHALL apply filters and reset to page 1
5. WHEN the last page is reached, THE system SHALL disable the next page button

### Requirement 9: OrdersView Remains Unchanged

**User Story:** As a user, I want the OrdersView to continue displaying all orders without pagination, so that I can see the complete order list at a glance.

#### Acceptance Criteria

1. THE OrdersView SHALL display all orders without pagination
2. WHEN the OrdersView loads, THE system SHALL fetch and display all available orders
3. WHEN the OrdersView is displayed, THE pagination controls SHALL NOT appear
4. WHEN orders are added or removed, THE OrdersView SHALL reflect all changes without pagination

### Requirement 10: Backend Pagination Endpoints

**User Story:** As a backend developer, I want pagination-enabled endpoints, so that frontend views can request specific pages of data with filters.

#### Acceptance Criteria

1. WHEN getAllDeliveryDates() is called WITH page and limit parameters, THE system SHALL return the correct page of records
2. WHEN a filter parameter is provided, THE system SHALL apply the filter and return filtered results
3. WHEN getAllDeliveryDates() is called, THE system SHALL return total count of records for pagination calculation
4. WHEN getAllReceptions() is called WITH page and limit parameters, THE system SHALL return the correct page of records
5. WHEN getAllDispatches() is called WITH page and limit parameters, THE system SHALL return the correct page of records
6. WHEN getAllReturns() is called WITH page and limit parameters, THE system SHALL return the correct page of records

### Requirement 11: Reusable Pagination Component

**User Story:** As a frontend developer, I want a reusable pagination component, so that I can implement consistent pagination across all views.

#### Acceptance Criteria

1. WHEN a pagination component is created, THE component SHALL accept page, totalPages, and onPageChange props
2. WHEN a user clicks a page button, THE component SHALL call the onPageChange callback with the new page number
3. WHEN the current page is the first page, THE component SHALL disable the previous button
4. WHEN the current page is the last page, THE component SHALL disable the next button
5. WHEN the component is rendered, THE component SHALL display page numbers and navigation controls

### Requirement 12: Query Optimization

**User Story:** As a database administrator, I want queries optimized to use indexes and avoid full table scans, so that performance is maintained as data grows.

#### Acceptance Criteria

1. WHEN a query is executed, THE query SHALL use available indexes instead of performing full table scans
2. WHEN filtering by indexed columns, THE query execution plan SHALL show index usage
3. WHEN pagination is applied, THE query SHALL use LIMIT and OFFSET clauses efficiently
4. WHEN multiple filters are applied, THE query SHALL combine filters efficiently without redundant operations

### Requirement 13: Master Data Caching

**User Story:** As a system administrator, I want master data (references, clients, confeccionistas) cached in memory, so that repeated lookups are fast and reduce database load.

#### Acceptance Criteria

1. WHEN the application starts, THE master data (references, clients, confeccionistas) SHALL be loaded into memory cache
2. WHEN master data is accessed, THE system SHALL retrieve it from cache instead of querying the database
3. WHEN master data is updated, THE cache SHALL be invalidated and refreshed
4. WHEN the cache is refreshed, THE system SHALL reload data from the database

### Requirement 14: Lazy Loading in Paginated Views

**User Story:** As a user, I want data to load only when needed, so that the application remains responsive even with large datasets.

#### Acceptance Criteria

1. WHEN a paginated view loads, THE system SHALL load only the first page of data initially
2. WHEN a user navigates to a different page, THE system SHALL fetch that page's data on demand
3. WHEN data is being fetched, THE system SHALL display a loading indicator
4. WHEN data fetch completes, THE system SHALL display the loaded records

