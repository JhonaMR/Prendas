# Requirements Document: Fix Dispatches Metrics Rendering

## Introduction

The HomeView dashboard displays sales metrics including "Unidades Vendidas" (Units Sold) and "Unidades Despachadas" (Units Dispatched). Currently, the dispatches metrics are not rendering correctly due to issues in how dispatches are related to sellers through clients. The system needs to robustly handle the relationship chain: Dispatch → Client → Seller, with proper fallback mechanisms when data is missing or incomplete.

## Glossary

- **Dispatch**: A shipment record containing items sent to a client, identified by `id`, `clientId`, `correriaId`, and `items`
- **Order**: A sales order containing items sold to a client, identified by `id`, `clientId`, `sellerId`, `correriaId`, and `items`
- **Client**: A customer record with `id`, `name`, `sellerId` linking to the seller responsible for that client
- **Seller**: A sales representative identified by `id` and `name`
- **Correria**: A sales campaign/batch identified by `id`, `name`, and `year`
- **MetricsDisplay**: React component responsible for calculating and rendering sales and efficiency metrics
- **ChartsVisualization**: React component responsible for grouping and visualizing metrics by seller
- **Fulfillment**: The percentage of units dispatched relative to units sold (unitsDispatched / unitsSold * 100)
- **System**: The dashboard application that aggregates and displays metrics

## Requirements

### Requirement 1: Robust Dispatch-to-Seller Relationship Resolution

**User Story:** As a dashboard user, I want the system to correctly identify which seller is responsible for each dispatch, so that metrics are accurately attributed and displayed.

#### Acceptance Criteria

1. WHEN a dispatch is processed, THE System SHALL resolve the seller by following the chain: dispatch.clientId → client.sellerId
2. WHEN a client does not exist in the state, THE System SHALL handle the missing client gracefully and skip that dispatch from seller attribution
3. WHEN a client exists but has no sellerId assigned, THE System SHALL handle the missing sellerId gracefully and skip that dispatch from seller attribution
4. WHEN a dispatch has an invalid or missing clientId, THE System SHALL handle the invalid reference gracefully and skip that dispatch from seller attribution
5. WHEN all required data is present (dispatch.clientId → valid client → valid sellerId), THE System SHALL correctly attribute the dispatch units to that seller

### Requirement 2: Accurate Units Dispatched Calculation

**User Story:** As a dashboard user, I want the "Unidades Despachadas" metric to accurately reflect all dispatches for the selected correria, so that I can monitor fulfillment status.

#### Acceptance Criteria

1. WHEN calculating units dispatched for a correria, THE System SHALL sum all items.quantity from all dispatches where dispatch.correriaId matches the selected correria
2. WHEN a dispatch has no items or items is null, THE System SHALL treat it as zero units
3. WHEN a dispatch item has no quantity or quantity is null, THE System SHALL treat it as zero units
4. WHEN all dispatches for a correria are processed, THE System SHALL return the total units dispatched as a non-negative integer

### Requirement 3: Seller Fulfillment Metrics Aggregation

**User Story:** As a dashboard user, I want to see fulfillment metrics grouped by seller, so that I can identify which sellers are meeting dispatch targets.

#### Acceptance Criteria

1. WHEN grouping dispatches by seller, THE System SHALL create an entry for each seller that has either orders or dispatches in the selected correria
2. WHEN a seller has orders but no dispatches, THE System SHALL display 0% fulfillment
3. WHEN a seller has dispatches but no orders, THE System SHALL display 0% fulfillment (no units to fulfill)
4. WHEN a seller has both orders and dispatches, THE System SHALL calculate fulfillment as (unitsDispatched / unitsSold) * 100
5. WHEN fulfillment percentage is calculated, THE System SHALL round to two decimal places

### Requirement 4: Data Validation and Error Handling

**User Story:** As a system administrator, I want the dashboard to handle incomplete or corrupted data gracefully, so that missing data doesn't break the entire metrics display.

#### Acceptance Criteria

1. WHEN state.orders is null or undefined, THE System SHALL treat it as an empty array
2. WHEN state.dispatches is null or undefined, THE System SHALL treat it as an empty array
3. WHEN state.sellers is null or undefined, THE System SHALL treat it as an empty array
4. WHEN state.clients is null or undefined, THE System SHALL treat it as an empty array
5. WHEN a seller cannot be found by sellerId, THE System SHALL use the sellerId as the display name fallback
6. WHEN calculating metrics with missing data, THE System SHALL return zero values instead of undefined or NaN

### Requirement 5: Correria Filtering Consistency

**User Story:** As a dashboard user, I want metrics to be consistently filtered by the selected correria, so that I see only relevant data for that campaign.

#### Acceptance Criteria

1. WHEN filtering orders by correria, THE System SHALL only include orders where order.correriaId === selectedCorreria
2. WHEN filtering dispatches by correria, THE System SHALL only include dispatches where dispatch.correriaId === selectedCorreria
3. WHEN a correria has no orders or dispatches, THE System SHALL display zero metrics
4. WHEN the selected correria changes, THE System SHALL recalculate all metrics for the new correria

### Requirement 6: Metrics Display Consistency

**User Story:** As a dashboard user, I want all metrics to be displayed consistently and completely, so that I have a complete view of sales and dispatch status.

#### Acceptance Criteria

1. WHEN rendering MetricsDisplay, THE System SHALL display both "Unidades Vendidas" and "Unidades Despachadas" metrics
2. WHEN rendering MetricsDisplay, THE System SHALL display the fulfillment percentage calculated from both metrics
3. WHEN rendering ChartsVisualization, THE System SHALL display fulfillment data for all sellers with orders or dispatches
4. WHEN a metric value is zero, THE System SHALL display "0" instead of hiding the metric
5. WHEN rendering seller fulfillment bars, THE System SHALL show the ratio of unitsDispatched to unitsSold

