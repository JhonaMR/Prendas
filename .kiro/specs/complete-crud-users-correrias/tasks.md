# Implementation Plan: Complete CRUD for Users and Correrias

## Overview

This implementation plan breaks down the complete CRUD functionality for Users and Correrias into discrete, manageable coding tasks. Each task builds on previous tasks and follows the exact pattern established by the Sellers module. The implementation proceeds through four layers: backend routes, backend controllers, API service, frontend state management, and frontend form handling.

## Tasks

- [x] 1. Backend: Add Users CRUD routes
  - Add PUT route for updating users: `PUT /api/auth/users/:id`
  - Add DELETE route for deleting users: `DELETE /api/auth/users/:id`
  - Ensure routes use verifyToken middleware for authentication
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Backend: Implement Users controller methods
  - Implement `updateUser(req, res)` method following Sellers pattern
  - Implement `deleteUser(req, res)` method with soft delete (set active = 0)
  - Include proper error handling (400 for invalid data, 404 for not found)
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Backend: Add Correrias CRUD routes
  - Add PUT route for updating correrias: `PUT /api/correrias/:id`
  - Add DELETE route for deleting correrias: `DELETE /api/correrias/:id`
  - Ensure routes use verifyToken middleware for authentication
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 4. Backend: Implement Correrias controller methods
  - Implement `updateCorreria(req, res)` method following Sellers pattern
  - Implement `deleteCorreria(req, res)` method with soft delete (set active = 0)
  - Include proper error handling (400 for invalid data, 404 for not found)
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Backend: Export new controller methods
  - Add `updateUser` and `deleteUser` to module.exports in crudController.js
  - Add `updateCorreria` and `deleteCorreria` to module.exports in crudController.js
  - _Requirements: 1.3, 1.4, 2.3, 2.4_

- [x] 6. Frontend: Add API service methods for Users
  - Implement `updateUser(id, user)` method that calls PUT `/api/auth/users/:id`
  - Implement `deleteUser(id)` method that calls DELETE `/api/auth/users/:id`
  - Follow the same pattern as `updateSeller` and `deleteSeller`
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 7. Frontend: Add API service methods for Correrias
  - Implement `updateCorreria(id, correria)` method that calls PUT `/api/correrias/:id`
  - Implement `deleteCorreria(id)` method that calls DELETE `/api/correrias/:id`
  - Follow the same pattern as `updateSeller` and `deleteSeller`
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Frontend: Load Users in App.tsx
  - Call `api.listUsers()` in the useEffect that loads data
  - Store result in `state.users`
  - Ensure users are loaded alongside other master data
  - _Requirements: 5.1_

- [x] 9. Frontend: Add Users callbacks to App.tsx
  - Create `onUpdateUser` callback that calls `api.updateUser()` and updates state
  - Create `onDeleteUser` callback that calls `api.deleteUser()` and updates state
  - Pass these callbacks to MastersView component
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 10. Frontend: Add Correrias callbacks to App.tsx
  - Create `onUpdateCorreria` callback that calls `api.updateCorreria()` and updates state
  - Create `onDeleteCorreria` callback that calls `api.deleteCorreria()` and updates state
  - Pass these callbacks to MastersView component
  - _Requirements: 6.1, 6.2_

- [x] 11. Frontend: Update MastersView props
  - Add `onUpdateUser` and `onDeleteUser` props to MastersView interface
  - Add `onUpdateCorreria` and `onDeleteCorreria` props to MastersView interface
  - Receive these props in the component
  - _Requirements: 5.5, 6.3_

- [x] 12. Frontend: Implement Users form handling in MastersView
  - Display users table with all user data (id, loginCode, name, role)
  - Add edit button that populates form and sets `editingId`
  - Modify form submission to check `editingId` and call `onUpdateUser` if set
  - Add delete button that calls `onDeleteUser` with user ID
  - Clear form and reset `editingId` after successful submission
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 13. Frontend: Implement Correrias form handling in MastersView
  - Display correrias table with all correria data (id, name, year)
  - Add edit button that populates form and sets `editingId`
  - Modify form submission to check `editingId` and call `onUpdateCorreria` if set
  - Add delete button that calls `onDeleteCorreria` with correria ID
  - Clear form and reset `editingId` after successful submission
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 14. Checkpoint - Verify all CRUD operations work
  - Test creating a new user through the UI
  - Test editing an existing user through the UI
  - Test deleting a user through the UI
  - Test creating a new correria through the UI
  - Test editing an existing correria through the UI
  - Test deleting a correria through the UI
  - Verify all changes persist in the backend
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All implementation follows the exact pattern established by the Sellers module
- Backend uses soft deletes (marking as inactive) rather than hard deletes
- Frontend state is updated immediately after successful API calls
- Error handling is consistent across all layers
- Form handling uses `editingId` to determine whether to create or update
