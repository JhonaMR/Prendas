# Testing Guide - Dual Brand System (PLOW + MELAS)

## Quick Test Steps

### 1. Test PLOW (Port 3000)
```
URL: https://10.10.0.34:5173
Expected:
- Brand name: "Plow"
- API calls to: https://10.10.0.34:3000/api
- Database: inventory_plow
- Logo: Plow logo
```

**Browser Console Check:**
```
[Config] Marca detectada: Plow
[Config] API URL: https://10.10.0.34:3000/api
```

### 2. Test MELAS (Port 3001)
```
URL: https://10.10.0.34:5174
Expected:
- Brand name: "Melas"
- API calls to: https://10.10.0.34:3001/api
- Database: inventory_melas
- Logo: Melas logo
```

**Browser Console Check:**
```
[Config] Marca detectada: Melas
[Config] API URL: https://10.10.0.34:3001/api
```

### 3. Verify API Routing
Open browser DevTools → Network tab and check:

**For PLOW (5173):**
- All fetch requests should go to `https://10.10.0.34:3000/api/*`
- Examples:
  - `/api/clients`
  - `/api/fichas-diseno`
  - `/api/fichas-costo`
  - `/api/maletas`
  - `/api/chat/active-users`

**For MELAS (5174):**
- All fetch requests should go to `https://10.10.0.34:3001/api/*`
- Same endpoints but different port

### 4. Test Critical Features

#### Chat Service
- PLOW: Should connect to `https://10.10.0.34:3000`
- MELAS: Should connect to `https://10.10.0.34:3001`
- Check console for: `🔌 Conectando a Socket.io en https://10.10.0.34:3000` or `3001`

#### Fichas Views
- PLOW: Load fichas from `inventory_plow` database
- MELAS: Load fichas from `inventory_melas` database
- Verify data is different between brands

#### User Preferences
- PLOW: Save/load from port 3000
- MELAS: Save/load from port 3001

### 5. Test Direct Backend Access

**PLOW Backend Direct:**
```
https://10.10.0.34:3000
Expected: PLOW interface with Plow branding
```

**MELAS Backend Direct:**
```
https://10.10.0.34:3001
Expected: MELAS interface with Melas branding
```

## Common Issues & Solutions

### Issue: MELAS showing PLOW data
**Solution:** Check browser console for API URL. Should show `3001` not `3000`

### Issue: Chat not connecting
**Solution:** Check WebSocket URL in console. Should match backend port.

### Issue: Login fails with CORS error
**Solution:** Verify backend is running on correct port and CORS is configured

### Issue: Ficha data not loading
**Solution:** Check Network tab to verify API calls are going to correct port

## Performance Check
- Build size: ~3.6 MB (PWA precache)
- No TypeScript errors
- All modules transformed successfully

## Deployment Checklist
- [x] Build completes without errors
- [x] All hardcoded URLs fixed
- [x] Port detection logic consistent
- [x] Both backends running (PM2)
- [x] Both databases configured
- [x] HTTPS certificates in place
- [x] PWA manifests configured
- [x] Logos in correct locations

## Rollback Plan
If issues occur:
1. Revert to previous git commit
2. Rebuild: `npm run build`
3. Restart PM2: `pm2 restart all`
