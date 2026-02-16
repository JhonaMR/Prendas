# Design Document: Home Dashboard View

## Overview

The Home Dashboard View is a role-based landing screen that serves as the primary navigation hub after user authentication. The design implements two distinct layouts:

1. **General User Layout**: A responsive grid of navigation buttons that fills the screen without scrolling
2. **Administrator Layout**: A two-column dashboard with navigation sidebar and analytics panel

The component integrates with existing React/TypeScript architecture, uses Tailwind CSS for styling, and leverages existing hooks for data fetching (useCorrerias, useSellers, etc.).

## Architecture

### Component Structure

```
HomeView (Main Component)
├── Role Detection (from AppContext)
├── GeneralUserLayout
│   └── NavigationGrid
│       ├── ReceptionButton
│       ├── DispatchButton
│       ├── InventoryButton
│       ├── OrdersButton
│       ├── SettleButton
│       ├── SalesReportButton
│       ├── OrderHistoryButton
│       ├── ReportsButton
│       └── MastersButton
└── AdminLayout
    ├── NavigationSidebar
    │   ├── SidebarButton (for each menu item)
    │   └── LogoutButton
    └── AnalyticsPanel
        ├── CorreriaSelectorDropdown
        ├── MetricsDisplay
        │   ├── SalesMetrics
        │   ├── FulfillmentMetrics
        │   └── EfficiencyMetrics
        └── ChartsVisualization
            ├── PieCharts
            └── BarCharts
```

### Data Flow

```
HomeView Component
├── useAppContext() → Get user role and authentication state
├── useCorrerias() → Fetch all available correrias
├── useSellers() → Fetch seller data
├── useAppState() → Access state.orders, state.dispatches, state.deliveryDates
└── Computed Metrics
    ├── Filter data by selected correria
    ├── Calculate sales metrics
    ├── Calculate fulfillment percentages
    └── Calculate delivery efficiency
```

## Components and Interfaces

### HomeView Component

**Purpose**: Main component that renders the appropriate layout based on user role

**Props**:
```typescript
interface HomeViewProps {
  onNavigate: (tab: string) => void;
}
```

**State**:
```typescript
interface HomeViewState {
  selectedCorreria: string | null;
  loading: boolean;
  error: string | null;
  correrias: Correria[];
  sellers: Seller[];
}
```

**Responsibilities**:
- Detect user role from authentication context
- Render appropriate layout (general or admin)
- Handle correria selection
- Fetch and manage data
- Handle navigation callbacks

### GeneralUserLayout Component

**Purpose**: Displays a grid of navigation buttons for general users

**Props**:
```typescript
interface GeneralUserLayoutProps {
  onNavigate: (tab: string) => void;
}
```

**Features**:
- Responsive grid layout (2-3 columns depending on screen size)
- Buttons fill available screen space without scrolling
- Moderate button size with consistent styling
- Icons and labels for each navigation option
- Hover effects and transitions

**Navigation Items**:
1. Batch Reception (Recepción de Lotes)
2. Merchandise Return (Devolución de Mercancía)
3. Dispatch (Despachos)
4. Inventory (Inventario)
5. Orders (Pedidos)
6. Settle Sales (Asentar Ventas)
7. Sales Report (Informe de Ventas)
8. Order History (Historial Pedidos)
9. General Reports (Reportes Generales)
10. Masters (Maestros)

### AdminLayout Component

**Purpose**: Displays a two-column dashboard with navigation and analytics

**Props**:
```typescript
interface AdminLayoutProps {
  onNavigate: (tab: string) => void;
  selectedCorreria: string | null;
  onCorreriChange: (correriaId: string) => void;
  correrias: Correria[];
  metrics: MetricsData;
  loading: boolean;
}
```

**Left Column (Navigation Sidebar)**:
- Vertical list of navigation buttons
- Same items as general user layout
- Highlighted active state
- Logout button at bottom

**Right Column (Analytics Panel)**:
- Correria selector dropdown with autocomplete
- Metrics display section
- Charts visualization section

### CorreriaSelectorDropdown Component

**Purpose**: Allows administrators to select and filter by correría

**Props**:
```typescript
interface CorreriaSelectorDropdownProps {
  correrias: Correria[];
  selectedCorreria: string | null;
  onSelect: (correriaId: string) => void;
  loading: boolean;
}
```

**Features**:
- Autocomplete search functionality
- Displays all available correrias
- Pre-selects first correria on load
- Persists selection during session
- Handles empty state gracefully

### MetricsDisplay Component

**Purpose**: Shows key performance metrics for selected correría

**Props**:
```typescript
interface MetricsDisplayProps {
  metrics: MetricsData;
  loading: boolean;
}

interface MetricsData {
  unitsSold: number;
  unitsDispatched: number;
  fulfillmentPercentage: number;
  ordersTaken: number;
  valueSold: number;
  valueDispatched: number;
  fulfillmentBySeller: SellerFulfillment[];
  batchesInProcess: number;
  deliveryEfficiency: number;
}

interface SellerFulfillment {
  sellerId: string;
  sellerName: string;
  fulfillmentPercentage: number;
}
```

**Metrics Displayed**:
1. Units Sold (total quantity)
2. Units Dispatched (total quantity)
3. Fulfillment Percentage (units dispatched / units sold)
4. Orders Taken (total count)
5. Value Sold (total currency)
6. Value Dispatched (total currency)
7. Fulfillment by Seller (percentage per seller)
8. Batches in Process (from delivery_dates)
9. Delivery Efficiency (on-time / total deliveries)

### ChartsVisualization Component

**Purpose**: Renders visual representations of metrics

**Props**:
```typescript
interface ChartsVisualizationProps {
  metrics: MetricsData;
  loading: boolean;
}
```

**Chart Types**:
- **Pie Charts**: For fulfillment percentages, delivery efficiency
- **Bar Charts**: For units/values by seller, batches in process
- **Responsive**: Adapts to available panel space

**Chart Library**: Recharts (recommended for React integration)

## Data Models

### Correria
```typescript
interface Correria {
  id: string;
  name: string;
  year: string;
}
```

### Order
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
  orderNumber?: number;
}
```

### Dispatch
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
```

### DeliveryDate
```typescript
interface DeliveryDate {
  id: string;
  confeccionistaId: string;
  referenceId: string;
  quantity: number;
  sendDate: string;
  expectedDate: string;
  deliveryDate: string | null;
  process: string;
  observation: string;
  createdAt: string;
  createdBy: string;
}
```

### ItemEntry
```typescript
interface ItemEntry {
  reference: string;
  size: string;
  quantity: number;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Role-Based Layout Rendering

*For any* authenticated user, the HomeView component SHALL render the general user layout if the user's role is "general", and SHALL render the administrator layout if the user's role is "admin".

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 2: Navigation Button Functionality

*For any* navigation button in either layout, clicking the button SHALL trigger the onNavigate callback with the correct tab identifier corresponding to that button's feature.

**Validates: Requirements 1.5, 2.4**

### Property 3: Correria Selection Persistence

*For any* correria selected in the dropdown, the selected correria SHALL remain selected during the current session until the user explicitly selects a different correria.

**Validates: Requirements 3.5**

### Property 4: Metrics Update on Correria Change

*For any* correria selection change, the metrics display and charts SHALL update to reflect data for the newly selected correria within 500ms.

**Validates: Requirements 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 6.3**

### Property 5: Fulfillment Percentage Calculation

*For any* correria with orders and dispatches, the fulfillment percentage SHALL equal (total units dispatched / total units sold) × 100, rounded to two decimal places.

**Validates: Requirements 4.3**

### Property 6: Delivery Efficiency Calculation

*For any* correria with delivery dates, the delivery efficiency percentage SHALL equal (count of deliveries where deliveryDate <= expectedDate / total deliveries) × 100, rounded to two decimal places.

**Validates: Requirements 5.3**

### Property 7: Default Correria Selection

*For any* HomeView load with available correrias, the first correria in the sorted list SHALL be pre-selected and its metrics SHALL be displayed immediately.

**Validates: Requirements 3.4**

### Property 8: Error Handling and Display

*For any* data fetching failure, the HomeView SHALL display an error message to the user and prevent navigation until the error is resolved or the user refreshes the page.

**Validates: Requirements 8.4, 8.5**

### Property 9: Loading State Indication

*For any* data fetching operation, the HomeView SHALL display a loading indicator while data is being fetched, and SHALL hide the indicator once data is loaded or an error occurs.

**Validates: Requirements 8.5**

### Property 10: Empty Correria Handling

*For any* scenario where no correrias are available, the HomeView SHALL display a message indicating no correrias are available and SHALL prevent correria selection.

**Validates: Requirements 8.6**

### Property 11: Responsive Layout Adaptation

*For any* screen size change, the HomeView layout SHALL reflow appropriately: desktop uses full width, tablet adapts proportionally, and mobile displays a mobile-optimized layout without breaking functionality.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 12: Grid Button Fill

*For any* general user layout, the navigation buttons SHALL fill the available screen space without requiring vertical scrolling on standard desktop resolutions (1920x1080 and above).

**Validates: Requirements 1.3, 1.4**

### Property 13: Visual Consistency

*For any* navigation button in the HomeView, the button styling SHALL match the existing selector components in the platform (same colors, fonts, spacing, and hover effects).

**Validates: Requirements 1.6, 2.5**

## Error Handling

### Data Fetching Errors

**Scenario**: Backend API fails to return correria data

**Handling**:
- Display error message: "No se pudieron cargar las correrias. Por favor, intente nuevamente."
- Disable correria selector
- Show retry button
- Log error to console for debugging

### Missing User Role

**Scenario**: User authentication context does not contain a valid role

**Handling**:
- Display error message: "No se pudo determinar el rol del usuario. Por favor, inicie sesión nuevamente."
- Redirect to login view
- Clear authentication state

### Empty Correria List

**Scenario**: No correrias are available in the system

**Handling**:
- Display message: "No hay correrias disponibles en el sistema."
- Disable analytics panel for admin users
- Allow general users to continue with navigation

### Metrics Calculation Errors

**Scenario**: Data is malformed or missing required fields

**Handling**:
- Display "N/A" for affected metrics
- Log error details
- Continue rendering other metrics
- Show warning message if critical metrics fail

## Testing Strategy

### Unit Testing

**Test Coverage**:
- Role detection logic (general vs admin)
- Navigation button click handlers
- Correria selection and persistence
- Metrics calculations (fulfillment %, delivery efficiency)
- Error message display
- Loading state transitions
- Empty state handling

**Example Unit Tests**:
```typescript
describe('HomeView', () => {
  test('renders general user layout for general role', () => {
    // Test that GeneralUserLayout is rendered
  });

  test('renders admin layout for admin role', () => {
    // Test that AdminLayout is rendered
  });

  test('calls onNavigate with correct tab on button click', () => {
    // Test navigation callback
  });

  test('displays error message when data fetch fails', () => {
    // Test error handling
  });
});
```

### Property-Based Testing

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for TypeScript/JavaScript
- Tag format: `Feature: home-dashboard-view, Property {number}: {property_text}`

**Property Tests**:

1. **Property 1: Role-Based Layout Rendering**
   - Generate random user roles (general, admin)
   - Verify correct layout is rendered for each role
   - Test with various authentication states

2. **Property 2: Navigation Button Functionality**
   - Generate random button clicks
   - Verify onNavigate is called with correct tab
   - Test all navigation items

3. **Property 3: Correria Selection Persistence**
   - Generate random correria selections
   - Verify selection persists across re-renders
   - Test session state management

4. **Property 4: Metrics Update on Correria Change**
   - Generate random correria changes
   - Verify metrics update within time threshold
   - Test with various data sizes

5. **Property 5: Fulfillment Percentage Calculation**
   - Generate random order and dispatch data
   - Verify calculation accuracy
   - Test edge cases (zero dispatches, zero orders)

6. **Property 6: Delivery Efficiency Calculation**
   - Generate random delivery dates
   - Verify calculation accuracy
   - Test with various date combinations

7. **Property 7: Default Correria Selection**
   - Generate random correria lists
   - Verify first correria is selected
   - Test with single and multiple correrias

8. **Property 8: Error Handling and Display**
   - Generate random error scenarios
   - Verify error messages are displayed
   - Test error recovery

9. **Property 9: Loading State Indication**
   - Generate random data fetch delays
   - Verify loading indicator appears and disappears
   - Test with various timing scenarios

10. **Property 10: Empty Correria Handling**
    - Test with empty correria list
    - Verify appropriate message is displayed
    - Test UI state with no data

11. **Property 11: Responsive Layout Adaptation**
    - Generate random viewport sizes
    - Verify layout adapts correctly
    - Test breakpoints (mobile, tablet, desktop)

12. **Property 12: Grid Button Fill**
    - Generate random screen sizes
    - Verify buttons fill available space
    - Test no scrolling on standard resolutions

13. **Property 13: Visual Consistency**
    - Generate random button states (hover, active, disabled)
    - Verify styling matches existing components
    - Test CSS class application

### Integration Testing

**Test Scenarios**:
- User logs in → HomeView renders with correct layout
- Admin selects correria → Metrics update and charts refresh
- General user clicks navigation button → Correct view loads
- Data fetch fails → Error message displays and retry works
- Session persists → Correria selection maintained across navigation

