# OSM Integration - Real City Data

## ✅ Implementation Complete

The game now loads **real city data** from OpenStreetMap using the **free Overpass API**.

### How It Works

1. **City Selection**: When you select a city (e.g., New York), the game:
   - Queries the Overpass API with the city's coordinates
   - Fetches buildings and roads within a 1km radius
   - Parses the OSM data into 3D representations

2. **Data Fetched**:
   - **Buildings**: Real building footprints with heights
   - **Roads**: Actual street network with road types
   - **Metadata**: Building levels, road names, one-way streets

3. **Fallback System**: If the API is unavailable or slow:
   - Automatically generates a procedural grid city
   - Ensures the game always works

### API Details

**Endpoint**: `https://overpass-api.de/api/interpreter`
**Cost**: **FREE** (no API key required)
**Rate Limits**: Fair use policy (don't spam)
**Coverage**: Worldwide OpenStreetMap data

### What You'll See

When you select **New York**:
- Real Manhattan buildings (heights from OSM data)
- Actual street grid (Broadway, 5th Ave, etc.)
- Proper building density
- Realistic city layout

### Data Structure

```typescript
{
  buildings: [
    {
      id: "building-123",
      lat: 40.7128,
      lon: -74.0060,
      height: 45,  // meters
      levels: 15,  // floors
      type: "commercial",
      nodes: [...] // building footprint
    }
  ],
  roads: [
    {
      id: "road-456",
      name: "Broadway",
      type: "primary",
      nodes: [...], // road path
      oneway: false
    }
  ]
}
```

### Performance

- **Initial load**: 2-5 seconds (fetching from Overpass API)
- **Cached**: Data is stored in game state
- **Optimized**: Only loads 1km radius (adjustable)

### Customization

To change the radius, edit `CitySelector.tsx`:
```typescript
const osmData = await loadCityData(city.lat, city.lon, 1000) // 1000m = 1km
```

Larger radius = more buildings but slower load time.

### Troubleshooting

**If you see only a green plane:**
1. Check browser console for errors
2. Overpass API might be slow (wait 10-15 seconds)
3. Fallback data will load automatically

**If buildings look wrong:**
- OSM data quality varies by city
- Some cities have better building height data
- Fallback uses estimated heights (3.5m per level)

### Future Enhancements

- [ ] Cache OSM data locally (IndexedDB)
- [ ] Progressive loading (load more as you zoom out)
- [ ] Building textures from OSM tags
- [ ] Real transit data integration
- [ ] Custom city import (upload .osm files)

---

**The game now uses real city data!** 🎉
