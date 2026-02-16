# Requirements Document: Add Order Number Field

## Introduction

This feature adds an optional "Order Number" field to the OrderSettleView, allowing users to associate a purchase order number with sales transactions. The field will be stored in the database and can be edited after the sale is settled, providing better traceability and integration with external order management systems.

## Glossary

- **OrderSettleView**: The React component responsible for displaying and managing the sale settlement interface
- **Order Number**: An optional numeric identifier that references an external purchase order
- **Sale Settlement**: The process of recording a completed sale transaction in the system
- **Backend Controller**: The Express.js controller that handles API requests for movement/sale operations
- **Database**: SQLite database storing all transaction and order information

## Requirements

### Requirement 1: Add Order Number Field to User Interface

**User Story:** As a sales user, I want to enter an order number when settling a sale, so that I can track and reference external purchase orders.

#### Acceptance Criteria

1. WHEN the OrderSettleView is displayed, THE OrderSettleView SHALL render an input field labeled "Número de pedido"
2. WHEN a user enters a value in the order number field, THE OrderSettleView SHALL accept numeric input
3. WHEN a user leaves the order number field empty, THE OrderSettleView SHALL allow the sale to be settled without a value
4. WHEN a user attempts to enter non-numeric characters in the order number field, THE OrderSettleView SHALL reject the input and maintain the previous valid value

### Requirement 2: Store Order Number in Database

**User Story:** As a system administrator, I want order numbers to be persisted in the database, so that sales can be tracked and audited.

#### Acceptance Criteria

1. WHEN a sale is settled with an order number, THE Backend Controller SHALL store the order number in the orders table
2. WHEN a sale is settled without an order number, THE Backend Controller SHALL store a null value in the orders table
3. WHEN the database schema is initialized, THE Database SHALL include an order_number column in the orders table with nullable numeric type

### Requirement 3: Update Data Model

**User Story:** As a developer, I want the Order type to include the order number field, so that the frontend can properly handle and display order data.

#### Acceptance Criteria

1. WHEN the Order type is defined in types.ts, THE Order type SHALL include an optional order_number property of numeric type
2. WHEN an order object is created from API response data, THE Order object SHALL contain the order_number value from the backend

### Requirement 4: Transmit Order Number to Backend

**User Story:** As a system user, I want the order number to be sent to the backend when settling a sale, so that it is properly recorded.

#### Acceptance Criteria

1. WHEN a user settles a sale with an order number, THE OrderSettleView SHALL include the order_number in the API request payload
2. WHEN a user settles a sale without an order number, THE OrderSettleView SHALL include null for order_number in the API request payload
3. WHEN the API request is sent, THE Backend Controller SHALL receive the order_number parameter and process it correctly

### Requirement 5: Edit Order Number After Settlement

**User Story:** As a sales user, I want to edit the order number after a sale has been settled, so that I can correct or update the reference if needed.

#### Acceptance Criteria

1. WHEN an existing order is loaded for editing, THE OrderSettleView SHALL display the current order_number value in the input field
2. WHEN a user modifies the order_number and saves the changes, THE Backend Controller SHALL update the order_number in the database
3. WHEN the update is successful, THE OrderSettleView SHALL reflect the new order_number value
