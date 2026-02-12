# Requirements Document: Complete CRUD for Users and Correrias

## Introduction

This specification documents the implementation of complete CRUD (Create, Read, Update, Delete) functionality for the Users and Correrias modules in the inventory management application. Currently, the Sellers module has a fully functional CRUD implementation that serves as the reference pattern. The Users and Correrias modules are incomplete and need to be brought to feature parity with Sellers.

The implementation will follow the exact same architectural pattern used by Sellers across all layers:
- Backend: Express.js routes and controller methods
- Frontend: API service methods for HTTP calls
- Frontend: React state management in App.tsx
- Frontend: Form handling and CRUD operations in MastersView.tsx

## Glossary

- **System**: The inventory management application (frontend + backend)
- **Users**: System users with authentication credentials and roles (admin, general)
- **Correrias**: Sales routes/territories with associated years
- **Sellers**: Sales representatives (reference implementation with complete CRUD)
- **CRUD**: Create, Read, Update, Delete operations
- **Backend**: Express.js API server
- **Frontend**: React application
- **API Service**: TypeScript service class that handles HTTP communication
- **MastersView**: React component for managing master data (users, sellers, correrias, etc.)
- **App.tsx**: Main React component that manages application state and routing

## Requirements

### Requirement 1: Backend Routes for Users CRUD

**User Story:** As a backend developer, I want to implement complete CRUD routes for Users, so that the frontend can manage user data through HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/auth/users`, THE System SHALL return all active users with their complete data (id, loginCode, name, role, active status)
2. WHEN a POST request is made to `/api/auth/users` with valid user data, THE System SHALL create a new user and return the created user object
3. WHEN a PUT request is made to `/api/auth/users/:id` with valid user data, THE System SHALL update the user and return the updated user object
4. WHEN a DELETE request is made to `/api/auth/users/:id`, THE System SHALL mark the user as inactive (soft delete) and return success confirmation
5. WHEN an invalid request is made (missing required fields), THE System SHALL return a 400 error with descriptive message
6. WHEN a user ID is not found, THE System SHALL return a 404 error with descriptive message

### Requirement 2: Backend Routes for Correrias CRUD

**User Story:** As a backend developer, I want to implement complete CRUD routes for Correrias, so that the frontend can manage correria data through HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/correrias`, THE System SHALL return all active correrias with their complete data (id, name, year, active status)
2. WHEN a POST request is made to `/api/correrias` with valid correria data, THE System SHALL create a new correria and return the created correria object
3. WHEN a PUT request is made to `/api/correrias/:id` with valid correria data, THE System SHALL update the correria and return the updated correria object
4. WHEN a DELETE request is made to `/api/correrias/:id`, THE System SHALL mark the correria as inactive (soft delete) and return success confirmation
5. WHEN an invalid request is made (missing required fields), THE System SHALL return a 400 error with descriptive message
6. WHEN a correria ID is not found, THE System SHALL return a 404 error with descriptive message

### Requirement 3: API Service Methods for Users

**User Story:** As a frontend developer, I want API service methods for Users CRUD, so that the frontend can communicate with the backend.

#### Acceptance Criteria

1. WHEN `api.listUsers()` is called, THE System SHALL make a GET request to `/api/auth/users` and return the users array
2. WHEN `api.updateUser(id, userData)` is called, THE System SHALL make a PUT request to `/api/auth/users/:id` and return the API response
3. WHEN `api.deleteUser(id)` is called, THE System SHALL make a DELETE request to `/api/auth/users/:id` and return the API response
4. WHEN any API call fails, THE System SHALL return an error response with appropriate error message

### Requirement 4: API Service Methods for Correrias

**User Story:** As a frontend developer, I want API service methods for Correrias CRUD, so that the frontend can communicate with the backend.

#### Acceptance Criteria

1. WHEN `api.updateCorreria(id, correriadata)` is called, THE System SHALL make a PUT request to `/api/correrias/:id` and return the API response
2. WHEN `api.deleteCorreria(id)` is called, THE System SHALL make a DELETE request to `/api/correrias/:id` and return the API response
3. WHEN any API call fails, THE System SHALL return an error response with appropriate error message

### Requirement 5: Frontend State Management for Users

**User Story:** As a frontend developer, I want to load and manage Users in App.tsx state, so that the application can display and update user data.

#### Acceptance Criteria

1. WHEN the application loads, THE System SHALL call `api.listUsers()` and populate `state.users` with the returned data
2. WHEN a user is created, THE System SHALL add it to `state.users`
3. WHEN a user is updated, THE System SHALL update the corresponding entry in `state.users`
4. WHEN a user is deleted, THE System SHALL remove it from `state.users`
5. WHEN MastersView needs user data, THE System SHALL pass `state.users` and update callbacks to the component

### Requirement 6: Frontend State Management for Correrias

**User Story:** As a frontend developer, I want to manage Correrias in App.tsx state, so that the application can display and update correria data.

#### Acceptance Criteria

1. WHEN a correria is updated, THE System SHALL update the corresponding entry in `state.correrias`
2. WHEN a correria is deleted, THE System SHALL remove it from `state.correrias`
3. WHEN MastersView needs correria data, THE System SHALL pass update and delete callbacks to the component

### Requirement 7: MastersView Users Form Handling

**User Story:** As a frontend developer, I want to implement complete form handling for Users in MastersView, so that users can be created, edited, and deleted.

#### Acceptance Criteria

1. WHEN the Users tab is active, THE System SHALL display a table of all users with their data
2. WHEN a user clicks the edit button on a user row, THE System SHALL populate the form with that user's data and set `editingId`
3. WHEN a user submits the form with `editingId` set, THE System SHALL call `onUpdateUser()` instead of `onAddUser()`
4. WHEN a user clicks the delete button on a user row, THE System SHALL call `onDeleteUser()` with that user's ID
5. WHEN a form submission succeeds, THE System SHALL clear the form and reset `editingId`
6. WHEN a form submission fails, THE System SHALL display an error message to the user

### Requirement 8: MastersView Correrias Form Handling

**User Story:** As a frontend developer, I want to implement complete form handling for Correrias in MastersView, so that correrias can be created, edited, and deleted.

#### Acceptance Criteria

1. WHEN the Correrias tab is active, THE System SHALL display a table of all correrias with their data
2. WHEN a user clicks the edit button on a correria row, THE System SHALL populate the form with that correria's data and set `editingId`
3. WHEN a user submits the form with `editingId` set, THE System SHALL call `onUpdateCorreria()` instead of `onAddCorreria()`
4. WHEN a user clicks the delete button on a correria row, THE System SHALL call `onDeleteCorreria()` with that correria's ID
5. WHEN a form submission succeeds, THE System SHALL clear the form and reset `editingId`
6. WHEN a form submission fails, THE System SHALL display an error message to the user

### Requirement 9: Consistency with Sellers Pattern

**User Story:** As a system architect, I want Users and Correrias to follow the exact same CRUD pattern as Sellers, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. WHEN examining the backend code, THE System SHALL use identical patterns for route definitions, controller methods, and error handling as Sellers
2. WHEN examining the API service, THE System SHALL use identical method signatures and response handling as Sellers
3. WHEN examining App.tsx, THE System SHALL use identical state management patterns as Sellers
4. WHEN examining MastersView, THE System SHALL use identical form handling and CRUD logic as Sellers
