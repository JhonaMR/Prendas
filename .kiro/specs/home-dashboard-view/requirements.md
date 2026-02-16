# Requirements Document: Home Dashboard View

## Introduction

The Home Dashboard View is the initial landing screen users encounter after successful authentication. It serves as the primary navigation hub for the platform, with distinct layouts tailored to user roles. General users see a grid-based menu interface, while administrators access an analytics-focused dashboard with navigation and performance metrics.

## Glossary

- **HomeView**: The initial screen displayed after user login
- **General_User**: A user with standard platform access (non-administrative)
- **Administrator**: A user with administrative privileges and access to analytics
- **Correría**: A sales route or delivery route entity in the system
- **Grid_Layout**: A responsive button grid interface for navigation
- **Analytics_Panel**: A two-column layout with navigation and metrics visualization
- **Dropdown_Selector**: An autocomplete-enabled dropdown for selecting correrias
- **Fulfillment_Percentage**: The ratio of units dispatched to units sold, expressed as a percentage
- **Delivery_Efficiency**: The ratio of on-time deliveries to total deliveries, expressed as a percentage
- **Batch**: A collection of orders grouped for processing (from delivery_dates)

## Requirements

### Requirement 1: Initial Navigation for General Users

**User Story:** As a general user, I want to see a grid-based menu after logging in, so that I can quickly navigate to different platform features.

#### Acceptance Criteria

1. WHEN a general user logs in successfully, THE HomeView SHALL display a grid layout with navigation buttons
2. WHEN the HomeView is displayed, THE grid buttons SHALL include: Batch Reception, Merchandise Return, and other existing menus
3. WHEN the HomeView is displayed, THE buttons SHALL fill the available screen space without requiring vertical scrolling
4. WHEN the HomeView is displayed, THE button size SHALL be moderate (neither too small nor too large) and consistent across all buttons
5. WHEN a user clicks a navigation button, THE system SHALL navigate to the corresponding feature view
6. WHEN the HomeView is displayed, THE visual styling SHALL match the existing selector components in the platform

### Requirement 2: Initial Navigation for Administrators

**User Story:** As an administrator, I want to see a dashboard with navigation and analytics after logging in, so that I can monitor platform performance and access administrative functions.

#### Acceptance Criteria

1. WHEN an administrator logs in successfully, THE HomeView SHALL display a two-column layout
2. WHEN the HomeView is displayed for an administrator, THE left column SHALL contain a vertical list of navigation buttons
3. WHEN the HomeView is displayed for an administrator, THE right column SHALL display an analytics panel
4. WHEN a user clicks a navigation button in the left column, THE system SHALL navigate to the corresponding feature view
5. WHEN the HomeView is displayed for an administrator, THE visual styling of navigation buttons SHALL match the existing selector components

### Requirement 3: Correría Selection and Filtering

**User Story:** As an administrator, I want to select a specific correría to view its metrics, so that I can analyze performance for individual sales routes.

#### Acceptance Criteria

1. WHEN the analytics panel is displayed, THE system SHALL display a dropdown selector for correrias
2. WHEN the correría dropdown is opened, THE system SHALL display all available correrias with autocomplete search functionality
3. WHEN a correría is selected from the dropdown, THE analytics panel SHALL update to display metrics for that correría
4. WHEN the HomeView loads, THE system SHALL pre-select the first available correría by default
5. WHEN a correría is selected, THE system SHALL persist the selection during the current session

### Requirement 4: Sales Metrics Display

**User Story:** As an administrator, I want to view key sales metrics for a selected correría, so that I can monitor sales performance.

#### Acceptance Criteria

1. WHEN a correría is selected, THE analytics panel SHALL display the total quantity of units sold
2. WHEN a correría is selected, THE analytics panel SHALL display the total quantity of units dispatched
3. WHEN a correría is selected, THE analytics panel SHALL display the fulfillment percentage (units dispatched / units sold)
4. WHEN a correría is selected, THE analytics panel SHALL display the total quantity of orders taken
5. WHEN a correría is selected, THE analytics panel SHALL display the total value of units sold
6. WHEN a correría is selected, THE analytics panel SHALL display the total value of units dispatched

### Requirement 5: Fulfillment and Efficiency Metrics

**User Story:** As an administrator, I want to view fulfillment and efficiency metrics, so that I can assess operational performance.

#### Acceptance Criteria

1. WHEN a correría is selected, THE analytics panel SHALL display the fulfillment percentage by seller
2. WHEN a correría is selected, THE analytics panel SHALL display the quantity of batches currently in process (from delivery_dates)
3. WHEN a correría is selected, THE analytics panel SHALL display the delivery efficiency percentage (on-time deliveries / total deliveries)

### Requirement 6: Analytics Visualization

**User Story:** As an administrator, I want to see visual representations of metrics, so that I can quickly understand performance trends.

#### Acceptance Criteria

1. WHEN the analytics panel is displayed, THE system SHALL render charts to visualize key metrics
2. WHEN charts are displayed, THE system SHALL use pie charts and/or bar charts as appropriate for each metric
3. WHEN a correría is selected, THE charts SHALL update to reflect the selected correría's data
4. WHEN the analytics panel is displayed, THE charts SHALL be responsive and adapt to the available panel space

### Requirement 7: Role-Based View Rendering

**User Story:** As the system, I want to render the appropriate HomeView layout based on user role, so that each user sees relevant content.

#### Acceptance Criteria

1. WHEN a user logs in, THE system SHALL determine the user's role
2. WHEN a general user is authenticated, THE system SHALL render the grid layout
3. WHEN an administrator is authenticated, THE system SHALL render the two-column analytics layout
4. WHEN the HomeView component mounts, THE system SHALL fetch the user's role from the authentication context
5. IF the user's role cannot be determined, THEN THE system SHALL display an error message and prevent navigation

### Requirement 8: Data Loading and Error Handling

**User Story:** As a user, I want the HomeView to load data reliably, so that I can access the dashboard without errors.

#### Acceptance Criteria

1. WHEN the HomeView loads, THE system SHALL fetch correría data from the backend
2. WHEN the HomeView loads, THE system SHALL fetch seller data from the backend
3. WHEN the HomeView loads, THE system SHALL fetch metrics data for the selected correría
4. IF data fetching fails, THEN THE system SHALL display an error message to the user
5. WHEN data is being fetched, THE system SHALL display a loading indicator
6. WHEN correría data is unavailable, THEN THE system SHALL display a message indicating no correrias are available

### Requirement 9: Responsive Design

**User Story:** As a user, I want the HomeView to work on different screen sizes, so that I can access the dashboard from various devices.

#### Acceptance Criteria

1. WHEN the HomeView is displayed on a desktop screen, THE layout SHALL use the full available width
2. WHEN the HomeView is displayed on a tablet screen, THE layout SHALL adapt appropriately
3. WHEN the HomeView is displayed on a mobile screen, THE system SHALL display a mobile-optimized layout
4. WHEN the screen is resized, THE layout SHALL reflow without breaking functionality

