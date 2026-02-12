# Design Document: Complete CRUD for Users and Correrias

## Overview

This design document specifies the implementation of complete CRUD functionality for Users and Correrias modules. The implementation follows the exact architectural pattern established by the Sellers module, which is already fully functional. By replicating this pattern across all layers (backend routes, controller methods, API service, React state management, and form handling), we ensure consistency and maintainability.

The design is organized into four implementation layers:
1. **Backend Layer**: Express.js routes and controller methods
2. **API Service Layer**: TypeScript methods for HTTP communication
3. **Frontend State Layer**: React state management in App.tsx
4. **Frontend UI Layer**: Form handling and CRUD operations in MastersView.tsx

## Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    MastersView (React)                      │
│              Form handling & CRUD operations                │
└────────────────────┬────────────────────────────────────────┘
                     │ Props: data, callbacks
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    App.tsx (React)                          │
│         State management & callback handlers                │
└────────────────────┬────────────────────────────────────────┘
                     │ Calls api methods
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Service (TypeScript)                   │
│         HTTP communication with backend                     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Routes (Express)                   │
│         Route definitions & middleware                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Routes to handlers
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Controller Methods (Node.js)                   │
│         Business logic & database operations                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### Users Controller Methods

```javascript
// GET /api/auth/users
getUsers(req, res) {
  // Returns all active users with complete data
  // Response: { success: true, data: User[] }
}

// POST /api/auth/users
createUser(req, res) {
  // Creates new user
  // Request body: { loginCode, name, pin, role, year }
  // Response: { success: true, data: User }
}

// PUT /api/auth/users/:id
updateUser(req, res) {
  // Updates existing user
  // Request body: { name, role, year }
  // Response: { success: true, data: User }
}

// DELETE /api/auth/users/:id
deleteUser(req, res) {
  // Soft deletes user (marks as inactive)
  // Response: { success: true, message: string }
}
```

#### Correrias Controller Methods

```javascript
// GET /api/correrias
getCorrerias(req, res) {
  // Returns all active correrias
  // Response: { success: true, data: Correria[] }
}

// POST /api/correrias
createCorreria(req, res) {
  // Creates new correria
  // Request body: { name, year }
  // Response: { success: true, data: Correria }
}

// PUT /api/correrias/:id
updateCorreria(req, res) {
  // Updates existing correria
  // Request body: { name, year }
  // Response: { success: true, data: Correria }
}

// DELETE /api/correrias/:id
deleteCorreria(req, res) {
  // Soft deletes correria (marks as inactive)
  // Response: { success: true, message: string }
}
```

### Frontend API Service

```typescript
class ApiService {
  // Users methods
  async listUsers(): Promise<User[]>
  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>>
  async deleteUser(id: string): Promise<ApiResponse>

  // Correrias methods
  async updateCorreria(id: string, correria: Partial<Correria>): Promise<ApiResponse<Correria>>
  async deleteCorreria(id: string): Promise<ApiResponse>
}
```

### Frontend State Management

```typescript
interface AppState {
  users: User[];
  correrias: Correria[];
  // ... other state
}

// In App.tsx:
// - Load users on mount: api.listUsers()
// - Pass state.users to MastersView
// - Pass callbacks: onAddUser, onUpdateUser, onDeleteUser
// - Pass callbacks: onAddCorreria, onUpdateCorreria, onDeleteCorreria
```

### Frontend Form Handling

```typescript
// In MastersView.tsx:
// - Display users/correrias in table
// - Edit button: populate form and set editingId
// - Submit button: check editingId to call update or create
// - Delete button: call delete callback
// - Form reset after successful submission
```

## Data Models

### User Model

```typescript
interface User {
  id: string;           // Unique identifier
  loginCode: string;    // Login code for authentication (3 characters)
  name: string;         // User's full name
  role: UserRole;       // admin or general
  active: boolean;      // Soft delete flag
}
```

### Correria Model

```typescript
interface Correria {
  id: string;           // Unique identifier
  name: string;         // Correria name
  year: string;         // Associated year
  active: boolean;      // Soft delete flag
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Backend API Properties

**Property 1: Users GET returns all active users**
*For any* set of users in the database, a GET request to `/api/auth/users` should return only users where `active = true`, with all required fields present (id, loginCode, name, role).
**Validates: Requirements 1.1**

**Property 2: Users POST creates and persists**
*For any* valid user data, a POST request to `/api/auth/users` should create the user in the database and return the created user object with the same data.
**Validates: Requirements 1.2**

**Property 3: Users PUT updates and persists**
*For any* existing user and valid update data, a PUT request to `/api/auth/users/:id` should update the user in the database and return the updated user object with the new data.
**Validates: Requirements 1.3**

**Property 4: Users DELETE soft deletes**
*For any* existing user, a DELETE request to `/api/auth/users/:id` should mark the user as inactive (set `active = false`) and subsequent GET requests should not return that user.
**Validates: Requirements 1.4**

**Property 5: Users invalid request returns 400**
*For any* POST or PUT request with missing required fields, the API should return a 400 status code with an error message.
**Validates: Requirements 1.5**

**Property 6: Users not found returns 404**
*For any* PUT or DELETE request with a non-existent user ID, the API should return a 404 status code with an error message.
**Validates: Requirements 1.6**

**Property 7: Correrias GET returns all active correrias**
*For any* set of correrias in the database, a GET request to `/api/correrias` should return only correrias where `active = true`, with all required fields present (id, name, year).
**Validates: Requirements 2.1**

**Property 8: Correrias POST creates and persists**
*For any* valid correria data, a POST request to `/api/correrias` should create the correria in the database and return the created correria object with the same data.
**Validates: Requirements 2.2**

**Property 9: Correrias PUT updates and persists**
*For any* existing correria and valid update data, a PUT request to `/api/correrias/:id` should update the correria in the database and return the updated correria object with the new data.
**Validates: Requirements 2.3**

**Property 10: Correrias DELETE soft deletes**
*For any* existing correria, a DELETE request to `/api/correrias/:id` should mark the correria as inactive (set `active = false`) and subsequent GET requests should not return that correria.
**Validates: Requirements 2.4**

**Property 11: Correrias invalid request returns 400**
*For any* POST or PUT request with missing required fields, the API should return a 400 status code with an error message.
**Validates: Requirements 2.5**

**Property 12: Correrias not found returns 404**
*For any* PUT or DELETE request with a non-existent correria ID, the API should return a 404 status code with an error message.
**Validates: Requirements 2.6**

### Frontend API Service Properties

**Property 13: listUsers calls correct endpoint**
*For any* call to `api.listUsers()`, the method should make a GET request to `/api/auth/users` and return the response data as an array.
**Validates: Requirements 3.1**

**Property 14: updateUser calls correct endpoint**
*For any* call to `api.updateUser(id, userData)`, the method should make a PUT request to `/api/auth/users/:id` with the userData in the request body.
**Validates: Requirements 3.2**

**Property 15: deleteUser calls correct endpoint**
*For any* call to `api.deleteUser(id)`, the method should make a DELETE request to `/api/auth/users/:id`.
**Validates: Requirements 3.3**

**Property 16: API error handling returns error response**
*For any* failed API call, the method should return an error response with an appropriate error message.
**Validates: Requirements 3.4**

**Property 17: updateCorreria calls correct endpoint**
*For any* call to `api.updateCorreria(id, correriadata)`, the method should make a PUT request to `/api/correrias/:id` with the correriadata in the request body.
**Validates: Requirements 4.1**

**Property 18: deleteCorreria calls correct endpoint**
*For any* call to `api.deleteCorreria(id)`, the method should make a DELETE request to `/api/correrias/:id`.
**Validates: Requirements 4.2**

### Frontend State Management Properties

**Property 19: Users loaded on app mount**
*For any* authenticated user, when the application mounts, `api.listUsers()` should be called and `state.users` should be populated with the returned data.
**Validates: Requirements 5.1**

**Property 20: Created user added to state**
*For any* newly created user, after successful creation, the user should be added to `state.users`.
**Validates: Requirements 5.2**

**Property 21: Updated user reflected in state**
*For any* updated user, after successful update, the corresponding entry in `state.users` should reflect the new data.
**Validates: Requirements 5.3**

**Property 22: Deleted user removed from state**
*For any* deleted user, after successful deletion, the user should be removed from `state.users`.
**Validates: Requirements 5.4**

**Property 23: Correrias update reflected in state**
*For any* updated correria, after successful update, the corresponding entry in `state.correrias` should reflect the new data.
**Validates: Requirements 6.1**

**Property 24: Deleted correria removed from state**
*For any* deleted correria, after successful deletion, the correria should be removed from `state.correrias`.
**Validates: Requirements 6.2**

### Frontend Form Handling Properties

**Property 25: Users table displays all users**
*For any* set of users in `state.users`, the Users table in MastersView should display all users with their complete data.
**Validates: Requirements 7.1**

**Property 26: Edit button populates form**
*For any* user in the table, clicking the edit button should populate the form fields with that user's data and set `editingId` to that user's ID.
**Validates: Requirements 7.2**

**Property 27: Form submission calls update when editing**
*For any* form submission with `editingId` set, the form should call `onUpdateUser()` instead of `onAddUser()`.
**Validates: Requirements 7.3**

**Property 28: Delete button calls delete callback**
*For any* user in the table, clicking the delete button should call `onDeleteUser()` with that user's ID.
**Validates: Requirements 7.4**

**Property 29: Form cleared after successful submission**
*For any* successful form submission, the form fields should be cleared and `editingId` should be reset to null.
**Validates: Requirements 7.5**

**Property 30: Error message displayed on failure**
*For any* failed form submission, an error message should be displayed to the user.
**Validates: Requirements 7.6**

**Property 31: Correrias table displays all correrias**
*For any* set of correrias in `state.correrias`, the Correrias table in MastersView should display all correrias with their complete data.
**Validates: Requirements 8.1**

**Property 32: Edit button populates correria form**
*For any* correria in the table, clicking the edit button should populate the form fields with that correria's data and set `editingId` to that correria's ID.
**Validates: Requirements 8.2**

**Property 33: Form submission calls update when editing correria**
*For any* form submission with `editingId` set, the form should call `onUpdateCorreria()` instead of `onAddCorreria()`.
**Validates: Requirements 8.3**

**Property 34: Delete button calls delete correria callback**
*For any* correria in the table, clicking the delete button should call `onDeleteCorreria()` with that correria's ID.
**Validates: Requirements 8.4**

## Error Handling

### Backend Error Handling

- **400 Bad Request**: Missing or invalid required fields
- **404 Not Found**: Resource ID does not exist
- **500 Internal Server Error**: Unexpected server errors with descriptive logging

### Frontend Error Handling

- **API Errors**: Caught and displayed to user in form submission
- **Network Errors**: Handled gracefully with user-friendly messages
- **Validation Errors**: Prevented at form level before API call

## Testing Strategy

### Unit Testing

Unit tests should cover:
- Individual form field validation
- Specific error conditions (missing fields, invalid IDs)
- Edge cases (empty strings, special characters)
- Component rendering with different data states

### Property-Based Testing

Property-based tests should verify:
- **Backend**: All CRUD operations maintain data consistency
- **API Service**: Correct endpoints are called with correct parameters
- **State Management**: State updates correctly after each operation
- **Form Handling**: Form behavior is consistent across all operations

Each property-based test should:
- Run minimum 100 iterations with randomized inputs
- Reference the corresponding design property
- Use tag format: `Feature: complete-crud-users-correrias, Property N: [property text]`
- Test universal properties that hold for all valid inputs

### Test Organization

```
Backend Tests:
- Users CRUD operations (create, read, update, delete)
- Correrias CRUD operations (create, read, update, delete)
- Error handling (400, 404, 500 responses)

Frontend Tests:
- API service methods (correct endpoints, parameters)
- State management (state updates after operations)
- Form handling (edit, delete, form reset)
- UI rendering (table display, form population)
```
