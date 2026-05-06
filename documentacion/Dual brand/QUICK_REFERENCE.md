# Quick Reference - Dual Brand System

## URLs

### PLOW
- **Frontend:** https://10.10.0.34:5173
- **Backend:** https://10.10.0.34:3000
- **Database:** inventory_plow
- **Color:** Blue (#3b82f6)

### MELAS
- **Frontend:** https://10.10.0.34:5174
- **Backend:** https://10.10.0.34:3001
- **Database:** inventory_melas
- **Color:** Red (#ef4444)

---

## Build & Deploy

```bash
# Build
npm run build

# Restart PM2
pm2 restart all

# Check status
pm2 status

# View logs
pm2 logs
```

---

## Testing

### Check API Routing
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API calls
4. Should see:
   - PLOW: `https://10.10.0.34:3000/api/*`
   - MELAS: `https://10.10.0.34:3001/api/*`

### Check Manifest
1. Open DevTools (F12)
2. Go to Application tab
3. Click Manifest in sidebar
4. Should show:
   - PLOW: manifest.json with plow logos
   - MELAS: manifest-melas.json with melas logos

### Check Console Logs
```
[Config] Marca detectada: Plow/Melas
[Config] API URL: https://10.10.0.34:3000/api or 3001/api
🔧 Seleccionando manifest para Plow/Melas: manifest.json or manifest-melas.json
✅ Manifest cargado: /manifest.json?t=TIMESTAMP
🔄 Service Worker actualizado
```

---

## Clear PWA Cache

### Chrome/Edge
1. DevTools (F12) → Application
2. Click "Clear site data" button
3. Check all boxes
4. Click "Clear"
5. Refresh page

### Firefox
1. DevTools (F12) → Storage
2. Click "Clear All"
3. Refresh page

### Safari
1. Preferences → Privacy
2. Click "Manage Website Data"
3. Find site and click "Remove"
4. Refresh page

---

## Files Modified

### API Routing (7 files)
- `src/services/chatService.ts`
- `src/App.tsx`
- `src/vi