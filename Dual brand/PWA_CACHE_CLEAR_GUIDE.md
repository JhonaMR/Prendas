# PWA Cache Clear Guide - Logo Update

## Problem
The PWA cache is persisting the old PLOW logo even when accessing MELAS. This is because the browser's PWA cache stores the manifest and icons.

## Solution

### Option 1: Clear Browser Cache (Recommended for Testing)

#### Chrome/Edge
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data** button (top right)
4. Check all boxes and click **Clear**
5. Refresh the page (Ctrl+R or Cmd+R)

#### Firefox
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Click **Clear All** button
4. Refresh the page

#### Safari
1. Preferences → Privacy
2. Click **Manage Website Data**
3. Find your site and click **Remove**
4. Refresh the page

### Option 2: Uninstall and Reinstall PWA

#### Chrome/Edge
1. Go to `chrome://apps` or `edge://apps`
2. Right-click the app (Plow or Melas)
3. Click **Remove from Chrome/Edge**
4. Go back to the website
5. Click **Install app** button
6. Confirm installation

#### Firefox
1. Go to `about:addons`
2. Find the app in "Apps" section
3. Click **Remove**
4. Go back to the website
5. Click **Install app** button

### Option 3: Force Service Worker Update

Open browser console and run:
```javascript
// Clear all service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
  });
});

// Clear cache storage
caches.keys().then(cacheNames => {
  cacheNames.forEach(cacheName => {
    caches.delete(cacheName);
  });
});

// Reload page
location.reload();
```

## What Changed

### Manifest Files
- **manifest.json** (PLOW): Now uses relative paths `/logos/plow-*.png`
- **manifest-melas.json** (MELAS): Uses relative paths `/logos/melas-*.png`

### manifest-generator.js
- Added timestamp query parameter to prevent caching
- Added Service Worker update trigger
- Better logging for debugging

### Logo Paths
```
Before (PLOW):
  https://10.10.0.34:5173/logos/plow-192x192.png  ❌ Hardcoded port

After (PLOW):
  /logos/plow-192x192.png  ✅ Relative path

After (MELAS):
  /logos/melas-192x192.png  ✅ Relative path
```

## Testing After Cache Clear

### PLOW (Port 5173)
1. Clear cache using Option 1 above
2. Go to `https://10.10.0.34:5173`
3. Open DevTools → Application → Manifest
4. Should show: `manifest.json` with PLOW logo paths
5. Install as PWA
6. Logo should be PLOW logo

### MELAS (Port 5174)
1. Clear cache using Option 1 above
2. Go to `https://10.10.0.34:5174`
3. Open DevTools → Application → Manifest
4. Should show: `manifest-melas.json` with MELAS logo paths
5. Install as PWA
6. Logo should be MELAS logo

## Verification Checklist

- [x] manifest.json has relative paths
- [x] manifest-melas.json has relative paths
- [x] manifest-generator.js adds timestamp
- [x] Service Worker update triggered
- [x] Logos present in dist/logos/
- [x] Build completes successfully

## Browser DevTools Inspection

### To verify manifest is correct:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in left sidebar
4. Check:
   - Name: Should be "Plow" or "Melas"
   - Icons: Should show correct logo paths
   - Theme color: Should be blue (#3b82f6) for PLOW or red (#ef4444) for MELAS

### To verify logos are loading:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by "img"
4. Look for requests to `/logos/plow-*.png` or `/logos/melas-*.png`
5. Should return 200 status

## Troubleshooting

### Issue: Still showing PLOW logo for MELAS
**Solution:** 
1. Use Option 1 to clear all cache
2. Make sure you're on port 5174 (not 5173)
3. Check browser console for manifest-generator logs

### Issue: Manifest not updating
**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache completely
3. Restart browser

### Issue: Service Worker not updating
**Solution:**
1. Go to DevTools → Application → Service Workers
2. Click "Unregister" button
3. Refresh page
4. Service Worker will re-register with new manifest

## Deployment Notes

After deploying to production:
1. Users may need to clear cache manually
2. Or they can uninstall and reinstall the PWA
3. New installations will automatically get correct logos
4. Existing installations may need cache clear

## Files Modified

- `Prendas/public/manifest.json` - Changed to relative paths
- `Prendas/public/manifest-melas.json` - Already had relative paths
- `Prendas/public/manifest-generator.js` - Added timestamp and SW update
- `Prendas/dist/manifest.json` - Updated in build
- `Prendas/dist/manifest-melas.json` - Updated in build
- `Prendas/dist/manifest-generator.js` - Updated in build
