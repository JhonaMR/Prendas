# Hardcoded URLs Fix - MELAS Support

## Problem
The application had hardcoded API URLs pointing to port `3000` (PLOW backend) in multiple service files. This prevented MELAS (running on port `3001`) from working correctly, as all API calls were being routed to the PLOW backend regardless of which brand was being accessed.

## Root Cause
Several service files were using hardcoded port `3000` in their fallback logic instead of dynamically detecting the correct backend port based on the current frontend port.

## Files Fixed

### 1. **Prendas/src/services/chatService.ts**
- **Issue**: Hardcoded `port = 3000` in `getApiUrl()` function
- **Fix**: Updated to detect port dynamically:
  - Port 5173/3000 → Backend 3000 (PLOW)
  - Port 5174/3001 → Backend 3001 (MELAS)
- **Impact**: Chat service now routes to correct backend

### 2. **Prendas/src/App.tsx**
- **Issue**: Four hardcoded fetch calls to `:3000/api` endpoints:
  - Line 132: `disenadoras` endpoint
  - Line 144: `fichas-diseno` endpoint
  - Line 156: `fichas-costo` endpoint
  - Line 168: `maletas` endpoint
- **Fix**: Updated all four to use `window.API_CONFIG?.getApiUrl()` with fallback
- **Impact**: All initial data loads now use correct backend

### 3. **Prendas/src/views/FichasCorteDetalle.tsx**
- **Issue**: Hardcoded fetch to `:3000/api/fichas-costo/{referencia}`
- **Fix**: Updated to use `window.API_CONFIG?.getApiUrl()` with fallback
- **Impact**: Ficha corte detail view now loads from correct backend

### 4. **Prendas/src/services/socketService.ts**
- **Issue**: Hardcoded `port = 3000` in fallback logic
- **Fix**: Updated to detect port dynamically based on frontend location
- **Impact**: WebSocket connections now route to correct backend

### 5. **Prendas/src/services/api.ts**
- **Issue**: Hardcoded `port = 3000` in `getApiUrl()` fallback
- **Fix**: Updated to detect port dynamically
- **Impact**: All API calls through main service now use correct backend

### 6. **Prendas/src/services/apiFichas.ts**
- **Issue**: Hardcoded `port = 3000` in `getApiUrl()` fallback
- **Fix**: Updated to detect port dynamically
- **Impact**: All ficha-related API calls now use correct backend

### 7. **Prendas/src/hooks/useViewPreferences.ts**
- **Issue**: Hardcoded `port = 3000` in `getBaseUrl()` fallback
- **Fix**: Updated to detect port dynamically
- **Impact**: User preferences now load from correct backend

## Port Detection Logic
All services now use consistent port detection:

```typescript
const port = window.location.port;

if (port === '5173' || port === '3000' || port === '') {
  backendPort = '3000'; // PLOW
} else if (port === '5174' || port === '3001') {
  backendPort = '3001'; // MELAS
} else {
  backendPort = '3000'; // Default fallback
}
```

## Testing Checklist
- [x] Build completes without errors
- [x] No TypeScript diagnostics
- [x] All services compile successfully
- [x] Port detection logic is consistent across all files
- [x] Fallback logic properly handles all scenarios

## Expected Behavior After Fix

### PLOW (Port 3000)
- Frontend: `https://10.10.0.34:5173` or `https://10.10.0.34:3000`
- Backend: `https://10.10.0.34:3000/api`
- Database: `inventory_plow`
- All API calls route to port 3000 ✓

### MELAS (Port 3001)
- Frontend: `https://10.10.0.34:5174` or `https://10.10.0.34:3001`
- Backend: `https://10.10.0.34:3001/api`
- Database: `inventory_melas`
- All API calls route to port 3001 ✓

## Verification
Run the following to verify:
1. Access PLOW at `https://10.10.0.34:5173` - should use port 3000 backend
2. Access MELAS at `https://10.10.0.34:5174` - should use port 3001 backend
3. Check browser console for API URLs being logged
4. Verify data loads from correct database for each brand

## Build Output
```
✓ 363 modules transformed
✓ built in 10.91s
PWA v1.2.0 - files generated successfully
```

All files are ready for deployment.
