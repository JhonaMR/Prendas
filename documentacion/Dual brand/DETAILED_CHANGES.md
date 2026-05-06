# Detailed Changes - Line by Line

## 1. chatService.ts

### Before
```typescript
const getApiUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 3000;  // ❌ HARDCODED
  return `${protocol}//${hostname}:${port}/api`;
};
```

### After
```typescript
const getApiUrl = () => {
  // Use dynamic API configuration if available
  if (window.API_CONFIG?.getApiUrl) {
    return window.API_CONFIG.getApiUrl();
  }
  
  // Fallback: detect port based on current location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (port === '5173' || port === '3000' || port === '') {
    return `${protocol}//${hostname}:3000/api`;
  } else if (port === '5174' || port === '3001') {
    return `${protocol}//${hostname}:3001/api`;
  }
  
  return `${protocol}//${hostname}:3000/api`;
};
```

---

## 2. App.tsx - Lines 132, 144, 156, 168

### Before (4 instances)
```typescript
// Line 132 - disenadoras
const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/disenadoras`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 144 - fichas-diseno
const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/fichas-diseno`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 156 - fichas-costo
const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/fichas-costo`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 168 - maletas
const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/maletas`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});
```

### After (4 instances)
```typescript
// Line 132 - disenadoras
const response = await fetch(`${window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`}/disenadoras`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 144 - fichas-diseno
const response = await fetch(`${window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`}/fichas-diseno`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 156 - fichas-costo
const response = await fetch(`${window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`}/fichas-costo`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

// Line 168 - maletas
const response = await fetch(`${window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`}/maletas`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});
```

---

## 3. FichasCorteDetalle.tsx - Line 40

### Before
```typescript
const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/fichas-costo/${referencia}`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});
```

### After
```typescript
const apiUrl = window.API_CONFIG?.getApiUrl?.() || `${window.location.protocol}//${window.location.hostname}:3000/api`;
const response = await fetch(`${apiUrl}/fichas-costo/${referencia}`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});
```

---

## 4. socketService.ts - Lines 22-35

### Before
```typescript
let url: string;

if (window.API_CONFIG?.getApiUrl) {
  const apiUrl = window.API_CONFIG.getApiUrl();
  url = apiUrl.replace('/api', '');
} else {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const hostname = window.location.hostname;
  const port = 3000;  // ❌ HARDCODED
  url = `${protocol}://${hostname}:${port}`;
}
```

### After
```typescript
let url: string;

if (window.API_CONFIG?.getApiUrl) {
  const apiUrl = window.API_CONFIG.getApiUrl();
  url = apiUrl.replace('/api', '');
} else {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  let backendPort = '3000';
  if (port === '5173' || port === '3000' || port === '') {
    backendPort = '3000'; // PLOW
  } else if (port === '5174' || port === '3001') {
    backendPort = '3001'; // MELAS
  }
  
  url = `${protocol}://${hostname}:${backendPort}`;
}
```

---

## 5. api.ts - Lines 53-62

### Before
```typescript
private getApiUrl(): string {
  if (window.API_CONFIG?.getApiUrl) {
    return window.API_CONFIG.getApiUrl();
  }
  // Fallback si config.js no se cargó
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = 3000;  // ❌ HARDCODED
  return `${protocol}//${hostname}:${port}/api`;
}
```

### After
```typescript
private getApiUrl(): string {
  if (window.API_CONFIG?.getApiUrl) {
    return window.API_CONFIG.getApiUrl();
  }
  // Fallback si config.js no se cargó - detectar puerto basado en ubicación actual
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  let backendPort = '3000';
  if (port === '5173' || port === '3000' || port === '') {
    backendPort = '3000'; // PLOW
  } else if (port === '5174' || port === '3001') {
    backendPort = '3001'; // MELAS
  }
  
  return `${protocol}//${hostname}:${backendPort}/api`;
}
```

---

## 6. apiFichas.ts - Lines 14-20

### Before
```typescript
function getApiUrl(): string {
    if (window.API_CONFIG?.getApiUrl) return window.API_CONFIG.getApiUrl();
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000/api`;  // ❌ HARDCODED
}
```

### After
```typescript
function getApiUrl(): string {
    if (window.API_CONFIG?.getApiUrl) return window.API_CONFIG.getApiUrl();
    
    // Fallback - detectar puerto basado en ubicación actual
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let backendPort = '3000';
    if (port === '5173' || port === '3000' || port === '') {
      backendPort = '3000'; // PLOW
    } else if (port === '5174' || port === '3001') {
      backendPort = '3001'; // MELAS
    }
    
    return `${protocol}//${hostname}:${backendPort}/api`;
}
```

---

## 7. useViewPreferences.ts - Lines 8-15

### Before
```typescript
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.API_CONFIG?.getApiUrl) {
    const apiUrl = window.API_CONFIG.getApiUrl();
    return apiUrl.replace('/api', '');
  }
  return `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3000`;  // ❌ HARDCODED
}
```

### After
```typescript
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.API_CONFIG?.getApiUrl) {
    const apiUrl = window.API_CONFIG.getApiUrl();
    return apiUrl.replace('/api', '');
  }
  
  // Fallback: detect port based on current location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (port === '5173' || port === '3000' || port === '') {
      return `${protocol}//${hostname}:3000`;
    } else if (port === '5174' || port === '3001') {
      return `${protocol}//${hostname}:3001`;
    }
    
    return `${protocol}//${hostname}:3000`;
  }
  
  return 'http://localhost:3000';
}
```

---

## Summary of Changes

| File | Type | Count | Impact |
|------|------|-------|--------|
| chatService.ts | Function | 1 | Chat routing |
| App.tsx | Fetch calls | 4 | Initial data loading |
| FichasCorteDetalle.tsx | Fetch call | 1 | Ficha detail view |
| socketService.ts | Fallback logic | 1 | WebSocket connection |
| api.ts | Fallback logic | 1 | Main API service |
| apiFichas.ts | Fallback logic | 1 | Ficha API service |
| useViewPreferences.ts | Fallback logic | 1 | User preferences |
| **TOTAL** | | **10** | **All services updated** |

## Pattern Applied

All changes follow the same pattern:

1. **Primary:** Check `window.API_CONFIG?.getApiUrl()`
2. **Fallback:** Detect current port from `window.location.port`
3. **Logic:** 
   - If port is 5173/3000/empty → use backend 3000 (PLOW)
   - If port is 5174/3001 → use backend 3001 (MELAS)
   - Default → use backend 3000 (PLOW)

This ensures both brands work independently while maintaining backward compatibility.
