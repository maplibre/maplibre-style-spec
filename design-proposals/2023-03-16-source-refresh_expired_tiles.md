# Design Proposal

## Motivation

Currently map.options provide a property [refreshExpiredTiles](https://maplibre.org/maplibre-gl-js-docs/api/map/#map-parameters) (default true). This applies to all tile sources. This causes us to use fetch even for raster images instead of HTMLImageElement which makes raster heavy scenarios quite slow. Fetch is required since reading response header to get the cache duration is not possible with HTMLImageElement.

### Performance consideration
Current code uses fetch to download raster tiles. Here is fetch workflow: fetch(url) --> response.arrayBuffer() --> create blob from arrayBuffer --> createImageBitmap(blob) --> imageBitmap.
* Benchmark test: https://jsbench.me/flldmrgkeb/1
* On Bing maps (Forked version) A/B testing using HTMLImageElement instead of fetch for raster tiles, showed substantial improvement.
![image info](https://user-images.githubusercontent.com/15951646/216262258-8912ed33-5a6e-4ee4-a80d-c26d80db005a.png)
PLT: Page load time, showing a 2+% improvement for overall page load with high statistical confidence.

## Proposed Change

#### Option 1
Proposal is the have a property refreshExpiredTiles (default: true) which can be set for each tile source. This will allow SDK user more granular control over which tile source need to be refreshed. Tiles which does not require refresh can be downloaded using HTMLImageElement.

This property can be made available for Raster, Raster_dem and Vector source Type. Support for Vector source type is just for consistency.

If user has not provided refreshExpiredTiles override then code will continue to use fetch as done currently.

* Alternative property name: 'refreshTiles'

#### Option 2
Instead of having a boolean refreshExpiredTiles (Option 1) on tile sources, we can have a property like expiryDuration in seconds. With this all raster tiles can also be downloaded using HTMLImageElement (Both refreshable and non-refreshable raster tiles).
* Issue with this approach is decoupling of cache data between tiles and style endpoints. This might not be desirable in some cases.

If user has not provided expiryDuration override then code will continue to use fetch as done currently.

## API Modifications
* Design option 1 with refreshExpiredTiles
    ```json
    {sources:
    	{
    		"source1": {
    			"type": "raster",
    			"tiles": ["<Tile url>"],
    			"minzoom": 5,
    			"maxzoom": 13,
    			"tileSize": 256,
    			"refreshExpiredTiles": false
    		},
    		// Default current production behavior
    		"traffic": {
    			"type": "raster",
    			"tiles": ["<Tile url>"],
    			"minzoom": 5,
    			"maxzoom": 13,
    			"tileSize": 256
    		}
    	}
    }
    ```

* Design option 2 with expiryDuration
    ```json
    {sources:
    	{
    	    // Default current production behavior
    	    "source1": {
    			"type": "raster",
    			"tiles": ["<Tile url>"],
    			"minzoom": 5,
    			"maxzoom": 13,
    			"tileSize": 256 
    		},
    		"source2": {
    			"type": "raster",
    			"tiles": ["<Tile url>"],
    			"minzoom": 5,
    			"maxzoom": 13,
    			"tileSize": 256,
    			"expiryDuration": 0 // <=0 sec to not refresh
    		},
    		"traffic": {
    			"type": "raster",
    			"tiles": ["<Tile url>"],
    			"minzoom": 5,
    			"maxzoom": 13,
    			"tileSize": 256,
    			"expiryDuration": 600 // refresh in 600 sec
    		}
    	}
    }
    ```

## Migration Plan and Compatibility

Both design options described above adds an optional propertie and thus are backward compatible.

## Rejected Alternatives

Have listed both options in consideration.