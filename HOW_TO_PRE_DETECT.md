# How to Pre-Detect Faces

## Quick Setup

The app now loads faces instantly from a pre-detected file. To populate this file:

### Option 1: Use the Detection Script (Recommended)

1. Start your dev server: `npm run dev`
2. Open: `http://localhost:3000/scripts/detect-and-save-faces.html`
3. Click "Detect Faces" - wait for detection to complete
4. Click "Save Results" - this downloads `pre-detected-faces.json`
5. Copy the downloaded file to `/public/pre-detected-faces.json`
6. Refresh your app - faces will load instantly!

### Option 2: Manual Detection (One-time)

If you need to detect faces manually:

1. Temporarily add back the detection code
2. Run detection once
3. Copy the console output (faces array)
4. Paste into `/public/pre-detected-faces.json`:

```json
{
  "eventPhoto": "/event-photo.jpeg",
  "faces": [
    {
      "id": "face-1",
      "x": 0.1,
      "y": 0.2,
      "width": 0.05,
      "height": 0.06
    }
    // ... more faces
  ],
  "detectedAt": "2026-01-18T00:00:00.000Z"
}
```

### File Location

- Source: `/lib/pre-detected-faces.json`
- Public: `/public/pre-detected-faces.json` (this is what the app loads)

## Current Status

✅ **No detection on page load** - instant loading
✅ **Pre-detected faces** - loaded from JSON file
✅ **Labels ready** - users can add LinkedIn profiles immediately
