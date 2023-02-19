(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('json-stringify-pretty-compact'), require('url'), require('csscolorparser'), require('@mapbox/unitbezier'), require('@mapbox/jsonlint-lines-primitives')) :
  typeof define === 'function' && define.amd ? define(['exports', 'json-stringify-pretty-compact', 'url', 'csscolorparser', '@mapbox/unitbezier', '@mapbox/jsonlint-lines-primitives'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.maplibreGlStyleSpecification = {}, global.stringifyPretty, global.URL, global.csscolorparser, global.UnitBezier, global.jsonlint));
})(this, (function (exports, stringifyPretty, URL, csscolorparser, UnitBezier, jsonlint) { 'use strict';

  var $version = 8;
  var $root = {
  	version: {
  		required: true,
  		type: "enum",
  		values: [
  			8
  		],
  		doc: "Style specification version number. Must be 8.",
  		example: 8
  	},
  	name: {
  		type: "string",
  		doc: "A human-readable name for the style.",
  		example: "Bright"
  	},
  	metadata: {
  		type: "*",
  		doc: "Arbitrary properties useful to track with the stylesheet, but do not influence rendering. Properties should be prefixed to avoid collisions, like 'mapbox:'."
  	},
  	center: {
  		type: "array",
  		value: "number",
  		doc: "Default map center in longitude and latitude.  The style center will be used only if the map has not been positioned by other means (e.g. map options or user interaction).",
  		example: [
  			-73.9749,
  			40.7736
  		]
  	},
  	zoom: {
  		type: "number",
  		doc: "Default zoom level.  The style zoom will be used only if the map has not been positioned by other means (e.g. map options or user interaction).",
  		example: 12.5
  	},
  	bearing: {
  		type: "number",
  		"default": 0,
  		period: 360,
  		units: "degrees",
  		doc: "Default bearing, in degrees. The bearing is the compass direction that is \"up\"; for example, a bearing of 90° orients the map so that east is up. This value will be used only if the map has not been positioned by other means (e.g. map options or user interaction).",
  		example: 29
  	},
  	pitch: {
  		type: "number",
  		"default": 0,
  		units: "degrees",
  		doc: "Default pitch, in degrees. Zero is perpendicular to the surface, for a look straight down at the map, while a greater value like 60 looks ahead towards the horizon. The style pitch will be used only if the map has not been positioned by other means (e.g. map options or user interaction).",
  		example: 50
  	},
  	light: {
  		type: "light",
  		doc: "The global light source.",
  		example: {
  			anchor: "viewport",
  			color: "white",
  			intensity: 0.4
  		}
  	},
  	terrain: {
  		type: "terrain",
  		doc: "The terrain configuration.",
  		example: {
  			source: "raster-dem-source",
  			exaggeration: 0.5
  		}
  	},
  	sources: {
  		required: true,
  		type: "sources",
  		doc: "Data source specifications.",
  		example: {
  			"maplibre-demotiles": {
  				type: "vector",
  				url: "https://demotiles.maplibre.org/tiles/tiles.json"
  			}
  		}
  	},
  	sprite: {
  		type: "sprite",
  		doc: "An array of `{id: 'my-sprite', url: 'https://example.com/sprite'} objects. Each object should represent a unique URL to load a sprite from and and a unique ID to use as a prefix when referencing images from that sprite (i.e. 'my-sprite:image'). All the URLs are internally extended to load both .json and .png files. If the `id` field is equal to 'default', the prefix is omitted (just 'image' instead of 'default:image'). All the IDs and URLs must be unique. For backwards compatibility, instead of an array, one can also provide a single string that represent a URL to load the sprite from. The images in this case won't be prefixed.",
  		example: "https://api.maptiler.com/maps/openstreetmap/sprite"
  	},
  	glyphs: {
  		type: "string",
  		doc: "A URL template for loading signed-distance-field glyph sets in PBF format. The URL must include `{fontstack}` and `{range}` tokens. This property is required if any layer uses the `text-field` layout property. The URL must be absolute, containing the [scheme, authority and path components](https://en.wikipedia.org/wiki/URL#Syntax).",
  		example: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
  	},
  	transition: {
  		type: "transition",
  		doc: "A global transition definition to use as a default across properties, to be used for timing transitions between one value and the next when no property-specific transition is set. Collision-based symbol fading is controlled independently of the style's `transition` property.",
  		example: {
  			duration: 300,
  			delay: 0
  		}
  	},
  	layers: {
  		required: true,
  		type: "array",
  		value: "layer",
  		doc: "Layers will be drawn in the order of this array.",
  		example: [
  			{
  				id: "water",
  				source: "mapbox-streets",
  				"source-layer": "water",
  				type: "fill",
  				paint: {
  					"fill-color": "#00ffff"
  				}
  			}
  		]
  	}
  };
  var sources = {
  	"*": {
  		type: "source",
  		doc: "Specification of a data source. For vector and raster sources, either TileJSON or a URL to a TileJSON must be provided. For image and video sources, a URL must be provided. For GeoJSON sources, a URL or inline GeoJSON must be provided."
  	}
  };
  var source = [
  	"source_vector",
  	"source_raster",
  	"source_raster_dem",
  	"source_geojson",
  	"source_video",
  	"source_image"
  ];
  var source_vector = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			vector: {
  				doc: "A vector tile source."
  			}
  		},
  		doc: "The type of the source."
  	},
  	url: {
  		type: "string",
  		doc: "A URL to a TileJSON resource. Supported protocols are `http:` and `https:`."
  	},
  	tiles: {
  		type: "array",
  		value: "string",
  		doc: "An array of one or more tile source URLs, as in the TileJSON spec."
  	},
  	bounds: {
  		type: "array",
  		value: "number",
  		length: 4,
  		"default": [
  			-180,
  			-85.051129,
  			180,
  			85.051129
  		],
  		doc: "An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre GL."
  	},
  	scheme: {
  		type: "enum",
  		values: {
  			xyz: {
  				doc: "Slippy map tilenames scheme."
  			},
  			tms: {
  				doc: "OSGeo spec scheme."
  			}
  		},
  		"default": "xyz",
  		doc: "Influences the y direction of the tile coordinates. The global-mercator (aka Spherical Mercator) profile is assumed."
  	},
  	minzoom: {
  		type: "number",
  		"default": 0,
  		doc: "Minimum zoom level for which tiles are available, as in the TileJSON spec."
  	},
  	maxzoom: {
  		type: "number",
  		"default": 22,
  		doc: "Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels."
  	},
  	attribution: {
  		type: "string",
  		doc: "Contains an attribution to be displayed when the map is shown to a user."
  	},
  	promoteId: {
  		type: "promoteId",
  		doc: "A property to use as a feature id (for feature state). Either a property name, or an object of the form `{<sourceLayer>: <propertyName>}`. If specified as a string for a vector tile source, the same property is used across all its source layers."
  	},
  	volatile: {
  		type: "boolean",
  		"default": false,
  		doc: "A setting to determine whether a source's tiles are cached locally.",
  		"sdk-support": {
  			"basic functionality": {
  				android: "9.3.0",
  				ios: "5.10.0"
  			}
  		}
  	},
  	"*": {
  		type: "*",
  		doc: "Other keys to configure the data source."
  	}
  };
  var source_raster = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			raster: {
  				doc: "A raster tile source."
  			}
  		},
  		doc: "The type of the source."
  	},
  	url: {
  		type: "string",
  		doc: "A URL to a TileJSON resource. Supported protocols are `http:` and `https:`."
  	},
  	tiles: {
  		type: "array",
  		value: "string",
  		doc: "An array of one or more tile source URLs, as in the TileJSON spec."
  	},
  	bounds: {
  		type: "array",
  		value: "number",
  		length: 4,
  		"default": [
  			-180,
  			-85.051129,
  			180,
  			85.051129
  		],
  		doc: "An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre GL."
  	},
  	minzoom: {
  		type: "number",
  		"default": 0,
  		doc: "Minimum zoom level for which tiles are available, as in the TileJSON spec."
  	},
  	maxzoom: {
  		type: "number",
  		"default": 22,
  		doc: "Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels."
  	},
  	tileSize: {
  		type: "number",
  		"default": 512,
  		units: "pixels",
  		doc: "The minimum visual size to display tiles for this layer. Only configurable for raster layers."
  	},
  	scheme: {
  		type: "enum",
  		values: {
  			xyz: {
  				doc: "Slippy map tilenames scheme."
  			},
  			tms: {
  				doc: "OSGeo spec scheme."
  			}
  		},
  		"default": "xyz",
  		doc: "Influences the y direction of the tile coordinates. The global-mercator (aka Spherical Mercator) profile is assumed."
  	},
  	attribution: {
  		type: "string",
  		doc: "Contains an attribution to be displayed when the map is shown to a user."
  	},
  	volatile: {
  		type: "boolean",
  		"default": false,
  		doc: "A setting to determine whether a source's tiles are cached locally.",
  		"sdk-support": {
  			"basic functionality": {
  				android: "9.3.0",
  				ios: "5.10.0"
  			}
  		}
  	},
  	"*": {
  		type: "*",
  		doc: "Other keys to configure the data source."
  	}
  };
  var source_raster_dem = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			"raster-dem": {
  				doc: "A RGB-encoded raster DEM source"
  			}
  		},
  		doc: "The type of the source."
  	},
  	url: {
  		type: "string",
  		doc: "A URL to a TileJSON resource. Supported protocols are `http:` and `https:`."
  	},
  	tiles: {
  		type: "array",
  		value: "string",
  		doc: "An array of one or more tile source URLs, as in the TileJSON spec."
  	},
  	bounds: {
  		type: "array",
  		value: "number",
  		length: 4,
  		"default": [
  			-180,
  			-85.051129,
  			180,
  			85.051129
  		],
  		doc: "An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre GL."
  	},
  	minzoom: {
  		type: "number",
  		"default": 0,
  		doc: "Minimum zoom level for which tiles are available, as in the TileJSON spec."
  	},
  	maxzoom: {
  		type: "number",
  		"default": 22,
  		doc: "Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels."
  	},
  	tileSize: {
  		type: "number",
  		"default": 512,
  		units: "pixels",
  		doc: "The minimum visual size to display tiles for this layer. Only configurable for raster layers."
  	},
  	attribution: {
  		type: "string",
  		doc: "Contains an attribution to be displayed when the map is shown to a user."
  	},
  	encoding: {
  		type: "enum",
  		values: {
  			terrarium: {
  				doc: "Terrarium format PNG tiles. See https://aws.amazon.com/es/public-datasets/terrain/ for more info."
  			},
  			mapbox: {
  				doc: "Mapbox Terrain RGB tiles. See https://www.mapbox.com/help/access-elevation-data/#mapbox-terrain-rgb for more info."
  			}
  		},
  		"default": "mapbox",
  		doc: "The encoding used by this source. Mapbox Terrain RGB is used by default"
  	},
  	volatile: {
  		type: "boolean",
  		"default": false,
  		doc: "A setting to determine whether a source's tiles are cached locally.",
  		"sdk-support": {
  			"basic functionality": {
  				android: "9.3.0",
  				ios: "5.10.0"
  			}
  		}
  	},
  	"*": {
  		type: "*",
  		doc: "Other keys to configure the data source."
  	}
  };
  var source_geojson = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			geojson: {
  				doc: "A GeoJSON data source."
  			}
  		},
  		doc: "The data type of the GeoJSON source."
  	},
  	data: {
  		required: true,
  		type: "*",
  		doc: "A URL to a GeoJSON file, or inline GeoJSON."
  	},
  	maxzoom: {
  		type: "number",
  		"default": 18,
  		doc: "Maximum zoom level at which to create vector tiles (higher means greater detail at high zoom levels)."
  	},
  	attribution: {
  		type: "string",
  		doc: "Contains an attribution to be displayed when the map is shown to a user."
  	},
  	buffer: {
  		type: "number",
  		"default": 128,
  		maximum: 512,
  		minimum: 0,
  		doc: "Size of the tile buffer on each side. A value of 0 produces no buffer. A value of 512 produces a buffer as wide as the tile itself. Larger values produce fewer rendering artifacts near tile edges and slower performance."
  	},
  	filter: {
  		type: "*",
  		doc: "An expression for filtering features prior to processing them for rendering."
  	},
  	tolerance: {
  		type: "number",
  		"default": 0.375,
  		doc: "Douglas-Peucker simplification tolerance (higher means simpler geometries and faster performance)."
  	},
  	cluster: {
  		type: "boolean",
  		"default": false,
  		doc: "If the data is a collection of point features, setting this to true clusters the points by radius into groups. Cluster groups become new `Point` features in the source with additional properties:\n * `cluster` Is `true` if the point is a cluster \n * `cluster_id` A unqiue id for the cluster to be used in conjunction with the [cluster inspection methods](https://www.mapbox.com/mapbox-gl-js/api/#geojsonsource#getclusterexpansionzoom)\n * `point_count` Number of original points grouped into this cluster\n * `point_count_abbreviated` An abbreviated point count"
  	},
  	clusterRadius: {
  		type: "number",
  		"default": 50,
  		minimum: 0,
  		doc: "Radius of each cluster if clustering is enabled. A value of 512 indicates a radius equal to the width of a tile."
  	},
  	clusterMaxZoom: {
  		type: "number",
  		doc: "Max zoom on which to cluster points if clustering is enabled. Defaults to one zoom less than maxzoom (so that last zoom features are not clustered). Clusters are re-evaluated at integer zoom levels so setting clusterMaxZoom to 14 means the clusters will be displayed until z15."
  	},
  	clusterMinPoints: {
  		type: "number",
  		doc: "Minimum number of points necessary to form a cluster if clustering is enabled. Defaults to `2`."
  	},
  	clusterProperties: {
  		type: "*",
  		doc: "An object defining custom properties on the generated clusters if clustering is enabled, aggregating values from clustered points. Has the form `{\"property_name\": [operator, map_expression]}`. `operator` is any expression function that accepts at least 2 operands (e.g. `\"+\"` or `\"max\"`) — it accumulates the property value from clusters/points the cluster contains; `map_expression` produces the value of a single point.\n\nExample: `{\"sum\": [\"+\", [\"get\", \"scalerank\"]]}`.\n\nFor more advanced use cases, in place of `operator`, you can use a custom reduce expression that references a special `[\"accumulated\"]` value, e.g.:\n`{\"sum\": [[\"+\", [\"accumulated\"], [\"get\", \"sum\"]], [\"get\", \"scalerank\"]]}`"
  	},
  	lineMetrics: {
  		type: "boolean",
  		"default": false,
  		doc: "Whether to calculate line distance metrics. This is required for line layers that specify `line-gradient` values."
  	},
  	generateId: {
  		type: "boolean",
  		"default": false,
  		doc: "Whether to generate ids for the geojson features. When enabled, the `feature.id` property will be auto assigned based on its index in the `features` array, over-writing any previous values."
  	},
  	promoteId: {
  		type: "promoteId",
  		doc: "A property to use as a feature id (for feature state). Either a property name, or an object of the form `{<sourceLayer>: <propertyName>}`."
  	}
  };
  var source_video = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			video: {
  				doc: "A video data source."
  			}
  		},
  		doc: "The data type of the video source."
  	},
  	urls: {
  		required: true,
  		type: "array",
  		value: "string",
  		doc: "URLs to video content in order of preferred format."
  	},
  	coordinates: {
  		required: true,
  		doc: "Corners of video specified in longitude, latitude pairs.",
  		type: "array",
  		length: 4,
  		value: {
  			type: "array",
  			length: 2,
  			value: "number",
  			doc: "A single longitude, latitude pair."
  		}
  	}
  };
  var source_image = {
  	type: {
  		required: true,
  		type: "enum",
  		values: {
  			image: {
  				doc: "An image data source."
  			}
  		},
  		doc: "The data type of the image source."
  	},
  	url: {
  		required: true,
  		type: "string",
  		doc: "URL that points to an image."
  	},
  	coordinates: {
  		required: true,
  		doc: "Corners of image specified in longitude, latitude pairs.",
  		type: "array",
  		length: 4,
  		value: {
  			type: "array",
  			length: 2,
  			value: "number",
  			doc: "A single longitude, latitude pair."
  		}
  	}
  };
  var layer = {
  	id: {
  		type: "string",
  		doc: "Unique layer name.",
  		required: true
  	},
  	type: {
  		type: "enum",
  		values: {
  			fill: {
  				doc: "A filled polygon with an optional stroked border.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			},
  			line: {
  				doc: "A stroked line.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			},
  			symbol: {
  				doc: "An icon or a text label.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			},
  			circle: {
  				doc: "A filled circle.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			},
  			heatmap: {
  				doc: "A heatmap.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.41.0",
  						android: "6.0.0",
  						ios: "4.0.0",
  						macos: "0.7.0"
  					}
  				}
  			},
  			"fill-extrusion": {
  				doc: "An extruded (3D) polygon.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.27.0",
  						android: "5.1.0",
  						ios: "3.6.0",
  						macos: "0.5.0"
  					}
  				}
  			},
  			raster: {
  				doc: "Raster map textures such as satellite imagery.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			},
  			hillshade: {
  				doc: "Client-side hillshading visualization based on DEM data. Currently, the implementation only supports Mapbox Terrain RGB and Mapzen Terrarium tiles.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.43.0",
  						android: "6.0.0",
  						ios: "4.0.0",
  						macos: "0.7.0"
  					}
  				}
  			},
  			background: {
  				doc: "The background color or pattern of the map.",
  				"sdk-support": {
  					"basic functionality": {
  						js: "0.10.0",
  						android: "2.0.1",
  						ios: "2.0.0",
  						macos: "0.1.0"
  					}
  				}
  			}
  		},
  		doc: "Rendering type of this layer.",
  		required: true
  	},
  	metadata: {
  		type: "*",
  		doc: "Arbitrary properties useful to track with the layer, but do not influence rendering. Properties should be prefixed to avoid collisions, like 'mapbox:'."
  	},
  	source: {
  		type: "string",
  		doc: "Name of a source description to be used for this layer. Required for all layer types except `background`."
  	},
  	"source-layer": {
  		type: "string",
  		doc: "Layer to use from a vector tile source. Required for vector tile sources; prohibited for all other source types, including GeoJSON sources."
  	},
  	minzoom: {
  		type: "number",
  		minimum: 0,
  		maximum: 24,
  		doc: "The minimum zoom level for the layer. At zoom levels less than the minzoom, the layer will be hidden."
  	},
  	maxzoom: {
  		type: "number",
  		minimum: 0,
  		maximum: 24,
  		doc: "The maximum zoom level for the layer. At zoom levels equal to or greater than the maxzoom, the layer will be hidden."
  	},
  	filter: {
  		type: "filter",
  		doc: "A expression specifying conditions on source features. Only features that match the filter are displayed. Zoom expressions in filters are only evaluated at integer zoom levels. The `feature-state` expression is not supported in filter expressions."
  	},
  	layout: {
  		type: "layout",
  		doc: "Layout properties for the layer."
  	},
  	paint: {
  		type: "paint",
  		doc: "Default paint properties for this layer."
  	}
  };
  var layout = [
  	"layout_fill",
  	"layout_line",
  	"layout_circle",
  	"layout_heatmap",
  	"layout_fill-extrusion",
  	"layout_symbol",
  	"layout_raster",
  	"layout_hillshade",
  	"layout_background"
  ];
  var layout_background = {
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_fill = {
  	"fill-sort-key": {
  		type: "number",
  		doc: "Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "1.2.0",
  				android: "9.1.0",
  				ios: "5.8.0",
  				macos: "0.15.0"
  			},
  			"data-driven styling": {
  				js: "1.2.0",
  				android: "9.1.0",
  				ios: "5.8.0",
  				macos: "0.15.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_circle = {
  	"circle-sort-key": {
  		type: "number",
  		doc: "Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "1.2.0",
  				android: "9.2.0",
  				ios: "5.9.0",
  				macos: "0.16.0"
  			},
  			"data-driven styling": {
  				js: "1.2.0",
  				android: "9.2.0",
  				ios: "5.9.0",
  				macos: "0.16.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_heatmap = {
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_line = {
  	"line-cap": {
  		type: "enum",
  		values: {
  			butt: {
  				doc: "A cap with a squared-off end which is drawn to the exact endpoint of the line."
  			},
  			round: {
  				doc: "A cap with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line."
  			},
  			square: {
  				doc: "A cap with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width."
  			}
  		},
  		"default": "butt",
  		doc: "The display of line endings.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"line-join": {
  		type: "enum",
  		values: {
  			bevel: {
  				doc: "A join with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width."
  			},
  			round: {
  				doc: "A join with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line."
  			},
  			miter: {
  				doc: "A join with a sharp, angled corner which is drawn with the outer sides beyond the endpoint of the path until they meet."
  			}
  		},
  		"default": "miter",
  		doc: "The display of lines when joining.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.40.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-miter-limit": {
  		type: "number",
  		"default": 2,
  		doc: "Used to automatically convert miter joins to bevel joins for sharp angles.",
  		requires: [
  			{
  				"line-join": "miter"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"line-round-limit": {
  		type: "number",
  		"default": 1.05,
  		doc: "Used to automatically convert round joins to miter joins for shallow angles.",
  		requires: [
  			{
  				"line-join": "round"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"line-sort-key": {
  		type: "number",
  		doc: "Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "1.2.0",
  				android: "9.1.0",
  				ios: "5.8.0",
  				macos: "0.15.0"
  			},
  			"data-driven styling": {
  				js: "1.2.0",
  				android: "9.1.0",
  				ios: "5.8.0",
  				macos: "0.15.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_symbol = {
  	"symbol-placement": {
  		type: "enum",
  		values: {
  			point: {
  				doc: "The label is placed at the point where the geometry is located."
  			},
  			line: {
  				doc: "The label is placed along the line of the geometry. Can only be used on `LineString` and `Polygon` geometries."
  			},
  			"line-center": {
  				doc: "The label is placed at the center of the line of the geometry. Can only be used on `LineString` and `Polygon` geometries. Note that a single feature in a vector tile may contain multiple line geometries."
  			}
  		},
  		"default": "point",
  		doc: "Label placement relative to its geometry.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"`line-center` value": {
  				js: "0.47.0",
  				android: "6.4.0",
  				ios: "4.3.0",
  				macos: "0.10.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"symbol-spacing": {
  		type: "number",
  		"default": 250,
  		minimum: 1,
  		units: "pixels",
  		doc: "Distance between two symbol anchors.",
  		requires: [
  			{
  				"symbol-placement": "line"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"symbol-avoid-edges": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer. When using a client that supports global collision detection, like MapLibre GL JS version 0.42.0 or greater, enabling this property is not needed to prevent clipped labels at tile boundaries.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"symbol-sort-key": {
  		type: "number",
  		doc: "Sorts features in ascending order based on this value. Features with lower sort keys are drawn and placed first.  When `icon-allow-overlap` or `text-allow-overlap` is `false`, features with a lower sort key will have priority during placement. When `icon-allow-overlap` or `text-allow-overlap` is set to `true`, features with a higher sort key will overlap over features with a lower sort key.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.53.0",
  				android: "7.4.0",
  				ios: "4.11.0",
  				macos: "0.14.0"
  			},
  			"data-driven styling": {
  				js: "0.53.0",
  				android: "7.4.0",
  				ios: "4.11.0",
  				macos: "0.14.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"symbol-z-order": {
  		type: "enum",
  		values: {
  			auto: {
  				doc: "Sorts symbols by `symbol-sort-key` if set. Otherwise, sorts symbols by their y-position relative to the viewport if `icon-allow-overlap` or `text-allow-overlap` is set to `true` or `icon-ignore-placement` or `text-ignore-placement` is `false`."
  			},
  			"viewport-y": {
  				doc: "Sorts symbols by their y-position relative to the viewport if `icon-allow-overlap` or `text-allow-overlap` is set to `true` or `icon-ignore-placement` or `text-ignore-placement` is `false`."
  			},
  			source: {
  				doc: "Sorts symbols by `symbol-sort-key` if set. Otherwise, no sorting is applied; symbols are rendered in the same order as the source data."
  			}
  		},
  		"default": "auto",
  		doc: "Determines whether overlapping symbols in the same layer are rendered in the order that they appear in the data source or by their y-position relative to the viewport. To control the order and prioritization of symbols otherwise, use `symbol-sort-key`.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.49.0",
  				android: "6.6.0",
  				ios: "4.5.0",
  				macos: "0.12.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-allow-overlap": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, the icon will be visible even if it collides with other previously drawn symbols.",
  		requires: [
  			"icon-image",
  			{
  				"!": "icon-overlap"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-overlap": {
  		type: "enum",
  		values: {
  			never: {
  				doc: "The icon will be hidden if it collides with any other previously drawn symbol."
  			},
  			always: {
  				doc: "The icon will be visible even if it collides with any other previously drawn symbol."
  			},
  			cooperative: {
  				doc: "If the icon collides with another previously drawn symbol, the overlap mode for that symbol is checked. If the previous symbol was placed using `never` overlap mode, the new icon is hidden. If the previous symbol was placed using `always` or `cooperative` overlap mode, the new icon is visible."
  			}
  		},
  		doc: "Allows for control over whether to show an icon when it overlaps other symbols on the map. If `icon-overlap` is not set, `icon-allow-overlap` is used instead.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "2.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-ignore-placement": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, other symbols can be visible even if they collide with the icon.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-optional": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not.",
  		requires: [
  			"icon-image",
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-rotation-alignment": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "When `symbol-placement` is set to `point`, aligns icons east-west. When `symbol-placement` is set to `line` or `line-center`, aligns icon x-axes with the line."
  			},
  			viewport: {
  				doc: "Produces icons whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`."
  			},
  			auto: {
  				doc: "When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line` or `line-center`, this is equivalent to `map`."
  			}
  		},
  		"default": "auto",
  		doc: "In combination with `symbol-placement`, determines the rotation behavior of icons.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"`auto` value": {
  				js: "0.25.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.3.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-size": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		units: "factor of the original icon size",
  		doc: "Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `icon-size`. 1 is the original size; 3 triples the size of the image.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.35.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-text-fit": {
  		type: "enum",
  		values: {
  			none: {
  				doc: "The icon is displayed at its intrinsic aspect ratio."
  			},
  			width: {
  				doc: "The icon is scaled in the x-dimension to fit the width of the text."
  			},
  			height: {
  				doc: "The icon is scaled in the y-dimension to fit the height of the text."
  			},
  			both: {
  				doc: "The icon is scaled in both x- and y-dimensions."
  			}
  		},
  		"default": "none",
  		doc: "Scales the icon to fit around the associated text.",
  		requires: [
  			"icon-image",
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.21.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.2.1"
  			},
  			"stretchable icons": {
  				js: "1.6.0",
  				android: "9.2.0",
  				ios: "5.8.0",
  				macos: "0.15.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-text-fit-padding": {
  		type: "array",
  		value: "number",
  		length: 4,
  		"default": [
  			0,
  			0,
  			0,
  			0
  		],
  		units: "pixels",
  		doc: "Size of the additional area added to dimensions determined by `icon-text-fit`, in clockwise order: top, right, bottom, left.",
  		requires: [
  			"icon-image",
  			"text-field",
  			{
  				"icon-text-fit": [
  					"both",
  					"width",
  					"height"
  				]
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.21.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.2.1"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-image": {
  		type: "resolvedImage",
  		doc: "Name of image in sprite to use for drawing an image background.",
  		tokens: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.35.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-rotate": {
  		type: "number",
  		"default": 0,
  		period: 360,
  		units: "degrees",
  		doc: "Rotates the icon clockwise.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.21.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-padding": {
  		type: "padding",
  		"default": [
  			2
  		],
  		units: "pixels",
  		doc: "Size of additional area round the icon bounding box used for detecting symbol collisions. Values are declared using CSS margin shorthand syntax: a single value applies to all four sides; two values apply to [top/bottom, left/right]; three values apply to [top, left/right, bottom]; four values apply to [top, right, bottom, left]. For backwards compatibility, a single bare number is accepted, and treated the same as a one-element array - padding applied to all sides.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "2.2.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-keep-upright": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, the icon may be flipped to prevent it from being rendered upside-down.",
  		requires: [
  			"icon-image",
  			{
  				"icon-rotation-alignment": "map"
  			},
  			{
  				"symbol-placement": [
  					"line",
  					"line-center"
  				]
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-offset": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		doc: "Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. Each component is multiplied by the value of `icon-size` to obtain the final offset in pixels. When combined with `icon-rotate` the offset will be as if the rotated direction was up.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-anchor": {
  		type: "enum",
  		values: {
  			center: {
  				doc: "The center of the icon is placed closest to the anchor."
  			},
  			left: {
  				doc: "The left side of the icon is placed closest to the anchor."
  			},
  			right: {
  				doc: "The right side of the icon is placed closest to the anchor."
  			},
  			top: {
  				doc: "The top of the icon is placed closest to the anchor."
  			},
  			bottom: {
  				doc: "The bottom of the icon is placed closest to the anchor."
  			},
  			"top-left": {
  				doc: "The top left corner of the icon is placed closest to the anchor."
  			},
  			"top-right": {
  				doc: "The top right corner of the icon is placed closest to the anchor."
  			},
  			"bottom-left": {
  				doc: "The bottom left corner of the icon is placed closest to the anchor."
  			},
  			"bottom-right": {
  				doc: "The bottom right corner of the icon is placed closest to the anchor."
  			}
  		},
  		"default": "center",
  		doc: "Part of the icon placed closest to the anchor.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.40.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			},
  			"data-driven styling": {
  				js: "0.40.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-pitch-alignment": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The icon is aligned to the plane of the map."
  			},
  			viewport: {
  				doc: "The icon is aligned to the plane of the viewport."
  			},
  			auto: {
  				doc: "Automatically matches the value of `icon-rotation-alignment`."
  			}
  		},
  		"default": "auto",
  		doc: "Orientation of icon when map is pitched.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.39.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-pitch-alignment": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The text is aligned to the plane of the map."
  			},
  			viewport: {
  				doc: "The text is aligned to the plane of the viewport."
  			},
  			auto: {
  				doc: "Automatically matches the value of `text-rotation-alignment`."
  			}
  		},
  		"default": "auto",
  		doc: "Orientation of text when map is pitched.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.21.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.2.1"
  			},
  			"`auto` value": {
  				js: "0.25.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.3.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-rotation-alignment": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "When `symbol-placement` is set to `point`, aligns text east-west. When `symbol-placement` is set to `line` or `line-center`, aligns text x-axes with the line."
  			},
  			viewport: {
  				doc: "Produces glyphs whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`."
  			},
  			"viewport-glyph": {
  				doc: "When `symbol-placement` is set to `point`, aligns text to the x-axis of the viewport. When `symbol-placement` is set to `line` or `line-center`, aligns glyphs to the x-axis of the viewport and places them along the line."
  			},
  			auto: {
  				doc: "When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line` or `line-center`, this is equivalent to `map`."
  			}
  		},
  		"default": "auto",
  		doc: "In combination with `symbol-placement`, determines the rotation behavior of the individual glyphs forming the text.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"`auto` value": {
  				js: "0.25.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.3.0"
  			},
  			"`viewport-glyph` value": {
  				js: "2.1.8"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-field": {
  		type: "formatted",
  		"default": "",
  		tokens: true,
  		doc: "Value to use for a text label. If a plain `string` is provided, it will be treated as a `formatted` with default/inherited formatting options.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-font": {
  		type: "array",
  		value: "string",
  		"default": [
  			"Open Sans Regular",
  			"Arial Unicode MS Regular"
  		],
  		doc: "Font stack to use for displaying text.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-size": {
  		type: "number",
  		"default": 16,
  		minimum: 0,
  		units: "pixels",
  		doc: "Font size.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.35.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-max-width": {
  		type: "number",
  		"default": 10,
  		minimum: 0,
  		units: "ems",
  		doc: "The maximum line width for text wrapping.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.40.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-line-height": {
  		type: "number",
  		"default": 1.2,
  		units: "ems",
  		doc: "Text leading value for multi-line text.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-letter-spacing": {
  		type: "number",
  		"default": 0,
  		units: "ems",
  		doc: "Text tracking amount.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.40.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-justify": {
  		type: "enum",
  		values: {
  			auto: {
  				doc: "The text is aligned towards the anchor position."
  			},
  			left: {
  				doc: "The text is aligned to the left."
  			},
  			center: {
  				doc: "The text is centered."
  			},
  			right: {
  				doc: "The text is aligned to the right."
  			}
  		},
  		"default": "center",
  		doc: "Text justification options.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.39.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			},
  			auto: {
  				js: "0.54.0",
  				android: "7.4.0",
  				ios: "4.10.0",
  				macos: "0.14.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-radial-offset": {
  		type: "number",
  		units: "ems",
  		"default": 0,
  		doc: "Radial offset of text, in the direction of the symbol's anchor. Useful in combination with `text-variable-anchor`, which defaults to using the two-dimensional `text-offset` if present.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.54.0",
  				android: "7.4.0",
  				ios: "4.10.0",
  				macos: "0.14.0"
  			},
  			"data-driven styling": {
  				js: "0.54.0",
  				android: "7.4.0",
  				ios: "4.10.0",
  				macos: "0.14.0"
  			}
  		},
  		requires: [
  			"text-field"
  		],
  		"property-type": "data-driven",
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		}
  	},
  	"text-variable-anchor": {
  		type: "array",
  		value: "enum",
  		values: {
  			center: {
  				doc: "The center of the text is placed closest to the anchor."
  			},
  			left: {
  				doc: "The left side of the text is placed closest to the anchor."
  			},
  			right: {
  				doc: "The right side of the text is placed closest to the anchor."
  			},
  			top: {
  				doc: "The top of the text is placed closest to the anchor."
  			},
  			bottom: {
  				doc: "The bottom of the text is placed closest to the anchor."
  			},
  			"top-left": {
  				doc: "The top left corner of the text is placed closest to the anchor."
  			},
  			"top-right": {
  				doc: "The top right corner of the text is placed closest to the anchor."
  			},
  			"bottom-left": {
  				doc: "The bottom left corner of the text is placed closest to the anchor."
  			},
  			"bottom-right": {
  				doc: "The bottom right corner of the text is placed closest to the anchor."
  			}
  		},
  		requires: [
  			"text-field",
  			{
  				"symbol-placement": [
  					"point"
  				]
  			}
  		],
  		doc: "To increase the chance of placing high-priority labels on the map, you can provide an array of `text-anchor` locations: the renderer will attempt to place the label at each location, in order, before moving onto the next label. Use `text-justify: auto` to choose justification based on anchor position. To apply an offset, use the `text-radial-offset` or the two-dimensional `text-offset`.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.54.0",
  				android: "7.4.0",
  				ios: "4.10.0",
  				macos: "0.14.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-anchor": {
  		type: "enum",
  		values: {
  			center: {
  				doc: "The center of the text is placed closest to the anchor."
  			},
  			left: {
  				doc: "The left side of the text is placed closest to the anchor."
  			},
  			right: {
  				doc: "The right side of the text is placed closest to the anchor."
  			},
  			top: {
  				doc: "The top of the text is placed closest to the anchor."
  			},
  			bottom: {
  				doc: "The bottom of the text is placed closest to the anchor."
  			},
  			"top-left": {
  				doc: "The top left corner of the text is placed closest to the anchor."
  			},
  			"top-right": {
  				doc: "The top right corner of the text is placed closest to the anchor."
  			},
  			"bottom-left": {
  				doc: "The bottom left corner of the text is placed closest to the anchor."
  			},
  			"bottom-right": {
  				doc: "The bottom right corner of the text is placed closest to the anchor."
  			}
  		},
  		"default": "center",
  		doc: "Part of the text placed closest to the anchor.",
  		requires: [
  			"text-field",
  			{
  				"!": "text-variable-anchor"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.39.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-max-angle": {
  		type: "number",
  		"default": 45,
  		units: "degrees",
  		doc: "Maximum angle change between adjacent characters.",
  		requires: [
  			"text-field",
  			{
  				"symbol-placement": [
  					"line",
  					"line-center"
  				]
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-writing-mode": {
  		type: "array",
  		value: "enum",
  		values: {
  			horizontal: {
  				doc: "If a text's language supports horizontal writing mode, symbols with point placement would be laid out horizontally."
  			},
  			vertical: {
  				doc: "If a text's language supports vertical writing mode, symbols with point placement would be laid out vertically."
  			}
  		},
  		doc: "The property allows control over a symbol's orientation. Note that the property values act as a hint, so that a symbol whose language doesn’t support the provided orientation will be laid out in its natural orientation. Example: English point symbol will be rendered horizontally even if array value contains single 'vertical' enum value. The order of elements in an array define priority order for the placement of an orientation variant.",
  		requires: [
  			"text-field",
  			{
  				"symbol-placement": [
  					"point"
  				]
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "1.3.0",
  				android: "8.3.0",
  				ios: "5.3.0",
  				macos: "0.15.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-rotate": {
  		type: "number",
  		"default": 0,
  		period: 360,
  		units: "degrees",
  		doc: "Rotates the text clockwise.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.35.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-padding": {
  		type: "number",
  		"default": 2,
  		minimum: 0,
  		units: "pixels",
  		doc: "Size of the additional area around the text bounding box used for detecting symbol collisions.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-keep-upright": {
  		type: "boolean",
  		"default": true,
  		doc: "If true, the text may be flipped vertically to prevent it from being rendered upside-down.",
  		requires: [
  			"text-field",
  			{
  				"text-rotation-alignment": "map"
  			},
  			{
  				"symbol-placement": [
  					"line",
  					"line-center"
  				]
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-transform": {
  		type: "enum",
  		values: {
  			none: {
  				doc: "The text is not altered."
  			},
  			uppercase: {
  				doc: "Forces all letters to be displayed in uppercase."
  			},
  			lowercase: {
  				doc: "Forces all letters to be displayed in lowercase."
  			}
  		},
  		"default": "none",
  		doc: "Specifies how to capitalize text, similar to the CSS `text-transform` property.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-offset": {
  		type: "array",
  		doc: "Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up. If used with text-variable-anchor, input values will be taken as absolute values. Offsets along the x- and y-axis will be applied automatically based on the anchor position.",
  		value: "number",
  		units: "ems",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		requires: [
  			"text-field",
  			{
  				"!": "text-radial-offset"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.35.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-allow-overlap": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, the text will be visible even if it collides with other previously drawn symbols.",
  		requires: [
  			"text-field",
  			{
  				"!": "text-overlap"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-overlap": {
  		type: "enum",
  		values: {
  			never: {
  				doc: "The text will be hidden if it collides with any other previously drawn symbol."
  			},
  			always: {
  				doc: "The text will be visible even if it collides with any other previously drawn symbol."
  			},
  			cooperative: {
  				doc: "If the text collides with another previously drawn symbol, the overlap mode for that symbol is checked. If the previous symbol was placed using `never` overlap mode, the new text is hidden. If the previous symbol was placed using `always` or `cooperative` overlap mode, the new text is visible."
  			}
  		},
  		doc: "Allows for control over whether to show symbol text when it overlaps other symbols on the map. If `text-overlap` is not set, `text-allow-overlap` is used instead",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "2.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-ignore-placement": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, other symbols can be visible even if they collide with the text.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-optional": {
  		type: "boolean",
  		"default": false,
  		doc: "If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not.",
  		requires: [
  			"text-field",
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_raster = {
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var layout_hillshade = {
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		"property-type": "constant"
  	}
  };
  var filter = {
  	type: "array",
  	value: "*",
  	doc: "A filter selects specific features from a layer."
  };
  var filter_operator = {
  	type: "enum",
  	values: {
  		"==": {
  			doc: "`[\"==\", key, value]` equality: `feature[key] = value`"
  		},
  		"!=": {
  			doc: "`[\"!=\", key, value]` inequality: `feature[key] ≠ value`"
  		},
  		">": {
  			doc: "`[\">\", key, value]` greater than: `feature[key] > value`"
  		},
  		">=": {
  			doc: "`[\">=\", key, value]` greater than or equal: `feature[key] ≥ value`"
  		},
  		"<": {
  			doc: "`[\"<\", key, value]` less than: `feature[key] < value`"
  		},
  		"<=": {
  			doc: "`[\"<=\", key, value]` less than or equal: `feature[key] ≤ value`"
  		},
  		"in": {
  			doc: "`[\"in\", key, v0, ..., vn]` set inclusion: `feature[key] ∈ {v0, ..., vn}`"
  		},
  		"!in": {
  			doc: "`[\"!in\", key, v0, ..., vn]` set exclusion: `feature[key] ∉ {v0, ..., vn}`"
  		},
  		all: {
  			doc: "`[\"all\", f0, ..., fn]` logical `AND`: `f0 ∧ ... ∧ fn`"
  		},
  		any: {
  			doc: "`[\"any\", f0, ..., fn]` logical `OR`: `f0 ∨ ... ∨ fn`"
  		},
  		none: {
  			doc: "`[\"none\", f0, ..., fn]` logical `NOR`: `¬f0 ∧ ... ∧ ¬fn`"
  		},
  		has: {
  			doc: "`[\"has\", key]` `feature[key]` exists"
  		},
  		"!has": {
  			doc: "`[\"!has\", key]` `feature[key]` does not exist"
  		},
  		within: {
  			doc: "`[\"within\", object]` feature geometry is within object geometry"
  		}
  	},
  	doc: "The filter operator."
  };
  var geometry_type = {
  	type: "enum",
  	values: {
  		Point: {
  			doc: "Filter to point geometries."
  		},
  		LineString: {
  			doc: "Filter to line geometries."
  		},
  		Polygon: {
  			doc: "Filter to polygon geometries."
  		}
  	},
  	doc: "The geometry type for the filter to select."
  };
  var function_stop = {
  	type: "array",
  	minimum: 0,
  	maximum: 24,
  	value: [
  		"number",
  		"color"
  	],
  	length: 2,
  	doc: "Zoom level and value pair."
  };
  var expression$1 = {
  	type: "array",
  	value: "*",
  	minimum: 1,
  	doc: "An expression defines a function that can be used for data-driven style properties or feature filters."
  };
  var expression_name = {
  	doc: "",
  	type: "enum",
  	values: {
  		"let": {
  			doc: "Binds expressions to named variables, which can then be referenced in the result expression using [\"var\", \"variable_name\"].",
  			group: "Variable binding",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"var": {
  			doc: "References variable bound using \"let\".",
  			group: "Variable binding",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		literal: {
  			doc: "Provides a literal array or object value.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		array: {
  			doc: "Asserts that the input is an array (optionally with a specific item type and length).  If, when the input expression is evaluated, it is not of the asserted type, then this assertion will cause the whole expression to be aborted.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		at: {
  			doc: "Retrieves an item from an array.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"in": {
  			doc: "Determines whether an item exists in an array or a substring exists in a string.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "1.6.0",
  					android: "9.1.0",
  					ios: "5.8.0",
  					macos: "0.15.0"
  				}
  			}
  		},
  		"index-of": {
  			doc: "Returns the first position at which an item can be found in an array or a substring can be found in a string, or `-1` if the input cannot be found. Accepts an optional index from where to begin the search.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "1.10.0"
  				}
  			}
  		},
  		slice: {
  			doc: "Returns an item from an array or a substring from a string from a specified start index, or between a start index and an end index if set. The return value is inclusive of the start index but not of the end index.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "1.10.0"
  				}
  			}
  		},
  		"case": {
  			doc: "Selects the first output whose corresponding test condition evaluates to true, or the fallback value otherwise.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		match: {
  			doc: "Selects the output whose label value matches the input value, or the fallback value if no match is found. The input can be any expression (e.g. `[\"get\", \"building_type\"]`). Each label must be either:\n - a single literal value; or\n - an array of literal values, whose values must be all strings or all numbers (e.g. `[100, 101]` or `[\"c\", \"b\"]`). The input matches if any of the values in the array matches, similar to the `\"in\"` operator.\nEach label must be unique. If the input type does not match the type of the labels, the result will be the fallback value.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		coalesce: {
  			doc: "Evaluates each expression in turn until the first non-null value is obtained, and returns that value.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		step: {
  			doc: "Produces discrete, stepped results by evaluating a piecewise-constant function defined by pairs of input and output values (\"stops\"). The `input` may be any numeric expression (e.g., `[\"get\", \"population\"]`). Stop inputs must be numeric literals in strictly ascending order. Returns the output value of the stop just less than the input, or the first output if the input is less than the first stop.",
  			group: "Ramps, scales, curves",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.42.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		interpolate: {
  			doc: "Produces continuous, smooth results by interpolating between pairs of input and output values (\"stops\"). The `input` may be any numeric expression (e.g., `[\"get\", \"population\"]`). Stop inputs must be numeric literals in strictly ascending order. The output type must be `number`, `array<number>`, or `color`.\n\nInterpolation types:\n- `[\"linear\"]`, or an expression returning one of those types: Interpolates linearly between the pair of stops just less than and just greater than the input.\n- `[\"exponential\", base]`: Interpolates exponentially between the stops just less than and just greater than the input. `base` controls the rate at which the output increases: higher values make the output increase more towards the high end of the range. With values close to 1 the output increases linearly.\n- `[\"cubic-bezier\", x1, y1, x2, y2]`: Interpolates using the cubic bezier curve defined by the given control points.",
  			group: "Ramps, scales, curves",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.42.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"interpolate-hcl": {
  			doc: "Produces continuous, smooth results by interpolating between pairs of input and output values (\"stops\"). Works like `interpolate`, but the output type must be `color`, and the interpolation is performed in the Hue-Chroma-Luminance color space.",
  			group: "Ramps, scales, curves",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.49.0"
  				}
  			}
  		},
  		"interpolate-lab": {
  			doc: "Produces continuous, smooth results by interpolating between pairs of input and output values (\"stops\"). Works like `interpolate`, but the output type must be `color`, and the interpolation is performed in the CIELAB color space.",
  			group: "Ramps, scales, curves",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.49.0"
  				}
  			}
  		},
  		ln2: {
  			doc: "Returns mathematical constant ln(2).",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		pi: {
  			doc: "Returns the mathematical constant pi.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		e: {
  			doc: "Returns the mathematical constant e.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"typeof": {
  			doc: "Returns a string describing the type of the given value.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		string: {
  			doc: "Asserts that the input value is a string. If multiple values are provided, each one is evaluated in order until a string is obtained. If none of the inputs are strings, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		number: {
  			doc: "Asserts that the input value is a number. If multiple values are provided, each one is evaluated in order until a number is obtained. If none of the inputs are numbers, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		boolean: {
  			doc: "Asserts that the input value is a boolean. If multiple values are provided, each one is evaluated in order until a boolean is obtained. If none of the inputs are booleans, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		object: {
  			doc: "Asserts that the input value is an object. If multiple values are provided, each one is evaluated in order until an object is obtained. If none of the inputs are objects, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		collator: {
  			doc: "Returns a `collator` for use in locale-dependent comparison operations. The `case-sensitive` and `diacritic-sensitive` options default to `false`. The `locale` argument specifies the IETF language tag of the locale to use. If none is provided, the default locale is used. If the requested locale is not available, the `collator` will use a system-defined fallback locale. Use `resolved-locale` to test the results of locale fallback behavior.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		format: {
  			doc: "Returns a `formatted` string for displaying mixed-format text in the `text-field` property. The input may contain a string literal or expression, including an [`'image'`](#types-image) expression. Strings may be followed by a style override object that supports the following properties:\n- `\"text-font\"`: Overrides the font stack specified by the root layout property.\n- `\"text-color\"`: Overrides the color specified by the root paint property.\n- `\"font-scale\"`: Applies a scaling factor on `text-size` as specified by the root layout property.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.48.0",
  					android: "6.7.0",
  					ios: "4.6.0",
  					macos: "0.12.0"
  				},
  				"text-font": {
  					js: "0.48.0",
  					android: "6.7.0",
  					ios: "4.6.0",
  					macos: "0.12.0"
  				},
  				"font-scale": {
  					js: "0.48.0",
  					android: "6.7.0",
  					ios: "4.6.0",
  					macos: "0.12.0"
  				},
  				"text-color": {
  					js: "1.3.0",
  					android: "7.3.0",
  					ios: "4.10.0",
  					macos: "0.14.0"
  				},
  				image: {
  					js: "1.6.0",
  					android: "8.6.0",
  					ios: "5.7.0",
  					macos: "0.15.0"
  				}
  			}
  		},
  		image: {
  			doc: "Returns an `image` type for use in `icon-image`, `*-pattern` entries and as a section in the `format` expression. If set, the `image` argument will check that the requested image exists in the style and will return either the resolved image name or `null`, depending on whether or not the image is currently in the style. This validation process is synchronous and requires the image to have been added to the style before requesting it in the `image` argument.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "1.4.0",
  					android: "8.6.0",
  					ios: "5.7.0",
  					macos: "0.15.0"
  				}
  			}
  		},
  		"number-format": {
  			doc: "Converts the input number into a string representation using the providing formatting rules. If set, the `locale` argument specifies the locale to use, as a BCP 47 language tag. If set, the `currency` argument specifies an ISO 4217 code to use for currency-style formatting. If set, the `min-fraction-digits` and `max-fraction-digits` arguments specify the minimum and maximum number of fractional digits to include.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.54.0"
  				}
  			}
  		},
  		"to-string": {
  			doc: "Converts the input value to a string. If the input is `null`, the result is `\"\"`. If the input is a boolean, the result is `\"true\"` or `\"false\"`. If the input is a number, it is converted to a string as specified by the [\"NumberToString\" algorithm](https://tc39.github.io/ecma262/#sec-tostring-applied-to-the-number-type) of the ECMAScript Language Specification. If the input is a color, it is converted to a string of the form `\"rgba(r,g,b,a)\"`, where `r`, `g`, and `b` are numerals ranging from 0 to 255, and `a` ranges from 0 to 1. Otherwise, the input is converted to a string in the format specified by the [`JSON.stringify`](https://tc39.github.io/ecma262/#sec-json.stringify) function of the ECMAScript Language Specification.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"to-number": {
  			doc: "Converts the input value to a number, if possible. If the input is `null` or `false`, the result is 0. If the input is `true`, the result is 1. If the input is a string, it is converted to a number as specified by the [\"ToNumber Applied to the String Type\" algorithm](https://tc39.github.io/ecma262/#sec-tonumber-applied-to-the-string-type) of the ECMAScript Language Specification. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"to-boolean": {
  			doc: "Converts the input value to a boolean. The result is `false` when then input is an empty string, 0, `false`, `null`, or `NaN`; otherwise it is `true`.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"to-rgba": {
  			doc: "Returns a four-element array containing the input color's red, green, blue, and alpha components, in that order.",
  			group: "Color",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"to-color": {
  			doc: "Converts the input value to a color. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.",
  			group: "Types",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		rgb: {
  			doc: "Creates a color value from red, green, and blue components, which must range between 0 and 255, and an alpha component of 1. If any component is out of range, the expression is an error.",
  			group: "Color",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		rgba: {
  			doc: "Creates a color value from red, green, blue components, which must range between 0 and 255, and an alpha component which must range between 0 and 1. If any component is out of range, the expression is an error.",
  			group: "Color",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		get: {
  			doc: "Retrieves a property value from the current feature's properties, or from another object if a second argument is provided. Returns null if the requested property is missing.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		has: {
  			doc: "Tests for the presence of an property value in the current feature's properties, or from another object if a second argument is provided.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		length: {
  			doc: "Gets the length of an array or string.",
  			group: "Lookup",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		properties: {
  			doc: "Gets the feature properties object.  Note that in some cases, it may be more efficient to use [\"get\", \"property_name\"] directly.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"feature-state": {
  			doc: "Retrieves a property value from the current feature's state. Returns null if the requested property is not present on the feature's state. A feature's state is not part of the GeoJSON or vector tile data, and must be set programmatically on each feature. When `source.promoteId` is not provided, features are identified by their `id` attribute, which must be an integer or a string that can be cast to an integer. When `source.promoteId` is provided, features are identified by their `promoteId` property, which may be a number, string, or any primitive data type. Note that [\"feature-state\"] can only be used with paint properties that support data-driven styling.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.46.0"
  				}
  			}
  		},
  		"geometry-type": {
  			doc: "Gets the feature's geometry type: `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		id: {
  			doc: "Gets the feature's id, if it has one.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		zoom: {
  			doc: "Gets the current zoom level.  Note that in style layout and paint properties, [\"zoom\"] may only appear as the input to a top-level \"step\" or \"interpolate\" expression.",
  			group: "Zoom",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"heatmap-density": {
  			doc: "Gets the kernel density estimation of a pixel in a heatmap layer, which is a relative measure of how many data points are crowded around a particular pixel. Can only be used in the `heatmap-color` property.",
  			group: "Heatmap",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"line-progress": {
  			doc: "Gets the progress along a gradient line. Can only be used in the `line-gradient` property.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.6.0",
  					macos: "0.12.0"
  				}
  			}
  		},
  		accumulated: {
  			doc: "Gets the value of a cluster property accumulated so far. Can only be used in the `clusterProperties` option of a clustered GeoJSON source.",
  			group: "Feature data",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.53.0"
  				}
  			}
  		},
  		"+": {
  			doc: "Returns the sum of the inputs.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"*": {
  			doc: "Returns the product of the inputs.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"-": {
  			doc: "For two inputs, returns the result of subtracting the second input from the first. For a single input, returns the result of subtracting it from 0.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"/": {
  			doc: "Returns the result of floating point division of the first input by the second.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"%": {
  			doc: "Returns the remainder after integer division of the first input by the second.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"^": {
  			doc: "Returns the result of raising the first input to the power specified by the second.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		sqrt: {
  			doc: "Returns the square root of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.42.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		log10: {
  			doc: "Returns the base-ten logarithm of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		ln: {
  			doc: "Returns the natural logarithm of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		log2: {
  			doc: "Returns the base-two logarithm of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		sin: {
  			doc: "Returns the sine of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		cos: {
  			doc: "Returns the cosine of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		tan: {
  			doc: "Returns the tangent of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		asin: {
  			doc: "Returns the arcsine of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		acos: {
  			doc: "Returns the arccosine of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		atan: {
  			doc: "Returns the arctangent of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		min: {
  			doc: "Returns the minimum value of the inputs.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		max: {
  			doc: "Returns the maximum value of the inputs.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		round: {
  			doc: "Rounds the input to the nearest integer. Halfway values are rounded away from zero. For example, `[\"round\", -1.5]` evaluates to -2.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		abs: {
  			doc: "Returns the absolute value of the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		ceil: {
  			doc: "Returns the smallest integer that is greater than or equal to the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		floor: {
  			doc: "Returns the largest integer that is less than or equal to the input.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		distance: {
  			doc: "Returns the shortest distance in meters between the evaluated feature and the input geometry. The input value can be a valid GeoJSON of type `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`, `Feature`, or `FeatureCollection`. Distance values returned may vary in precision due to loss in precision from encoding geometries, particularly below zoom level 13.",
  			group: "Math",
  			"sdk-support": {
  				"basic functionality": {
  					android: "9.2.0",
  					ios: "5.9.0",
  					macos: "0.16.0"
  				}
  			}
  		},
  		"==": {
  			doc: "Returns `true` if the input values are equal, `false` otherwise. The comparison is strictly typed: values of different runtime types are always considered unequal. Cases where the types are known to be different at parse time are considered invalid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		"!=": {
  			doc: "Returns `true` if the input values are not equal, `false` otherwise. The comparison is strictly typed: values of different runtime types are always considered unequal. Cases where the types are known to be different at parse time are considered invalid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		">": {
  			doc: "Returns `true` if the first input is strictly greater than the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		"<": {
  			doc: "Returns `true` if the first input is strictly less than the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		">=": {
  			doc: "Returns `true` if the first input is greater than or equal to the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		"<=": {
  			doc: "Returns `true` if the first input is less than or equal to the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				},
  				collator: {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		},
  		all: {
  			doc: "Returns `true` if all the inputs are `true`, `false` otherwise. The inputs are evaluated in order, and evaluation is short-circuiting: once an input expression evaluates to `false`, the result is `false` and no further input expressions are evaluated.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		any: {
  			doc: "Returns `true` if any of the inputs are `true`, `false` otherwise. The inputs are evaluated in order, and evaluation is short-circuiting: once an input expression evaluates to `true`, the result is `true` and no further input expressions are evaluated.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"!": {
  			doc: "Logical negation. Returns `true` if the input is `false`, and `false` if the input is `true`.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		within: {
  			doc: "Returns `true` if the evaluated feature is fully contained inside a boundary of the input geometry, `false` otherwise. The input value can be a valid GeoJSON of type `Polygon`, `MultiPolygon`, `Feature`, or `FeatureCollection`. Supported features for evaluation:\n- `Point`: Returns `false` if a point is on the boundary or falls outside the boundary.\n- `LineString`: Returns `false` if any part of a line falls outside the boundary, the line intersects the boundary, or a line's endpoint is on the boundary.",
  			group: "Decision",
  			"sdk-support": {
  				"basic functionality": {
  					js: "1.9.0",
  					android: "9.1.0",
  					ios: "5.8.0",
  					macos: "0.15.0"
  				}
  			}
  		},
  		"is-supported-script": {
  			doc: "Returns `true` if the input string is expected to render legibly. Returns `false` if the input string contains sections that cannot be rendered without potential loss of meaning (e.g. Indic scripts that require complex text shaping, or right-to-left scripts if the the `mapbox-gl-rtl-text` plugin is not in use in MapLibre GL JS).",
  			group: "String",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.6.0"
  				}
  			}
  		},
  		upcase: {
  			doc: "Returns the input string converted to uppercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.",
  			group: "String",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		downcase: {
  			doc: "Returns the input string converted to lowercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.",
  			group: "String",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		concat: {
  			doc: "Returns a `string` consisting of the concatenation of the inputs. Each input is converted to a string as if by `to-string`.",
  			group: "String",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.41.0",
  					android: "6.0.0",
  					ios: "4.0.0",
  					macos: "0.7.0"
  				}
  			}
  		},
  		"resolved-locale": {
  			doc: "Returns the IETF language tag of the locale being used by the provided `collator`. This can be used to determine the default system locale, or to determine if a requested locale was successfully loaded.",
  			group: "String",
  			"sdk-support": {
  				"basic functionality": {
  					js: "0.45.0",
  					android: "6.5.0",
  					ios: "4.2.0",
  					macos: "0.9.0"
  				}
  			}
  		}
  	}
  };
  var light = {
  	anchor: {
  		type: "enum",
  		"default": "viewport",
  		values: {
  			map: {
  				doc: "The position of the light source is aligned to the rotation of the map."
  			},
  			viewport: {
  				doc: "The position of the light source is aligned to the rotation of the viewport."
  			}
  		},
  		"property-type": "data-constant",
  		transition: false,
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		doc: "Whether extruded geometries are lit relative to the map or viewport.",
  		example: "map",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		}
  	},
  	position: {
  		type: "array",
  		"default": [
  			1.15,
  			210,
  			30
  		],
  		length: 3,
  		value: "number",
  		"property-type": "data-constant",
  		transition: true,
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		doc: "Position of the light source relative to lit (extruded) geometries, in [r radial coordinate, a azimuthal angle, p polar angle] where r indicates the distance from the center of the base of an object to its light, a indicates the position of the light relative to 0° (0° when `light.anchor` is set to `viewport` corresponds to the top of the viewport, or 0° when `light.anchor` is set to `map` corresponds to due north, and degrees proceed clockwise), and p indicates the height of the light (from 0°, directly above, to 180°, directly below).",
  		example: [
  			1.5,
  			90,
  			80
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		}
  	},
  	color: {
  		type: "color",
  		"property-type": "data-constant",
  		"default": "#ffffff",
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		transition: true,
  		doc: "Color tint for lighting extruded geometries.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		}
  	},
  	intensity: {
  		type: "number",
  		"property-type": "data-constant",
  		"default": 0.5,
  		minimum: 0,
  		maximum: 1,
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		transition: true,
  		doc: "Intensity of lighting (on a scale from 0 to 1). Higher numbers will present as more extreme contrast.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		}
  	}
  };
  var terrain = {
  	source: {
  		type: "string",
  		doc: "The source for the terrain data.",
  		required: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "2.2.0"
  			}
  		}
  	},
  	exaggeration: {
  		type: "number",
  		minimum: 0,
  		doc: "The exaggeration of the terrain - how high it will look.",
  		"default": 1,
  		"sdk-support": {
  			"basic functionality": {
  				js: "2.2.0"
  			}
  		}
  	}
  };
  var paint = [
  	"paint_fill",
  	"paint_line",
  	"paint_circle",
  	"paint_heatmap",
  	"paint_fill-extrusion",
  	"paint_symbol",
  	"paint_raster",
  	"paint_hillshade",
  	"paint_background"
  ];
  var paint_fill = {
  	"fill-antialias": {
  		type: "boolean",
  		"default": true,
  		doc: "Whether or not the fill should be antialiased.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-opacity": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		doc: "The opacity of the entire fill layer. In contrast to the `fill-color`, this value will also affect the 1px stroke around the fill, if the stroke is used.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.21.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The color of the filled part of this layer. This color can be specified as `rgba` with an alpha component and the color's opacity will not affect the opacity of the 1px stroke, if it is used.",
  		transition: true,
  		requires: [
  			{
  				"!": "fill-pattern"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.19.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-outline-color": {
  		type: "color",
  		doc: "The outline color of the fill. Matches the value of `fill-color` if unspecified.",
  		transition: true,
  		requires: [
  			{
  				"!": "fill-pattern"
  			},
  			{
  				"fill-antialias": true
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.19.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The fill is translated relative to the map."
  			},
  			viewport: {
  				doc: "The fill is translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `fill-translate`.",
  		"default": "map",
  		requires: [
  			"fill-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-pattern": {
  		type: "resolvedImage",
  		transition: true,
  		doc: "Name of image in sprite to use for drawing image fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoom-dependent expressions will be evaluated only at integer zoom levels.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.49.0",
  				android: "6.5.0",
  				macos: "0.11.0",
  				ios: "4.4.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "cross-faded-data-driven"
  	}
  };
  var paint_line = {
  	"line-opacity": {
  		type: "number",
  		doc: "The opacity at which the line will be drawn.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-color": {
  		type: "color",
  		doc: "The color with which the line will be drawn.",
  		"default": "#000000",
  		transition: true,
  		requires: [
  			{
  				"!": "line-pattern"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.23.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"line-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The line is translated relative to the map."
  			},
  			viewport: {
  				doc: "The line is translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `line-translate`.",
  		"default": "map",
  		requires: [
  			"line-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"line-width": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Stroke thickness.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.39.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-gap-width": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		doc: "Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap.",
  		transition: true,
  		units: "pixels",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-offset": {
  		type: "number",
  		"default": 0,
  		doc: "The line's offset. For linear features, a positive value offsets the line to the right, relative to the direction of the line, and a negative value to the left. For polygon features, a positive value results in an inset, and a negative value results in an outset.",
  		transition: true,
  		units: "pixels",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.12.1",
  				android: "3.0.0",
  				ios: "3.1.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-blur": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Blur applied to the line, in pixels.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"line-dasharray": {
  		type: "array",
  		value: "number",
  		doc: "Specifies the lengths of the alternating dashes and gaps that form the dash pattern. The lengths are later scaled by the line width. To convert a dash length to pixels, multiply the length by the current line width. Note that GeoJSON sources with `lineMetrics: true` specified won't render dashed lines to the expected scale. Also note that zoom-dependent expressions will be evaluated only at integer zoom levels.",
  		minimum: 0,
  		transition: true,
  		units: "line widths",
  		requires: [
  			{
  				"!": "line-pattern"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "cross-faded"
  	},
  	"line-pattern": {
  		type: "resolvedImage",
  		transition: true,
  		doc: "Name of image in sprite to use for drawing image lines. For seamless patterns, image width must be a factor of two (2, 4, 8, ..., 512). Note that zoom-dependent expressions will be evaluated only at integer zoom levels.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.49.0",
  				android: "6.5.0",
  				macos: "0.11.0",
  				ios: "4.4.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "cross-faded-data-driven"
  	},
  	"line-gradient": {
  		type: "color",
  		doc: "Defines a gradient with which to color a line feature. Can only be used with GeoJSON sources that specify `\"lineMetrics\": true`.",
  		transition: false,
  		requires: [
  			{
  				"!": "line-dasharray"
  			},
  			{
  				"!": "line-pattern"
  			},
  			{
  				source: "geojson",
  				has: {
  					lineMetrics: true
  				}
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.45.0",
  				android: "6.5.0",
  				ios: "4.4.0",
  				macos: "0.11.0"
  			},
  			"data-driven styling": {
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"line-progress"
  			]
  		},
  		"property-type": "color-ramp"
  	}
  };
  var paint_circle = {
  	"circle-radius": {
  		type: "number",
  		"default": 5,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Circle radius.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.18.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The fill color of the circle.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.18.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-blur": {
  		type: "number",
  		"default": 0,
  		doc: "Amount to blur the circle. 1 blurs the circle such that only the centerpoint is full opacity.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.20.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-opacity": {
  		type: "number",
  		doc: "The opacity at which the circle will be drawn.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.20.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"circle-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The circle is translated relative to the map."
  			},
  			viewport: {
  				doc: "The circle is translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `circle-translate`.",
  		"default": "map",
  		requires: [
  			"circle-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"circle-pitch-scale": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "Circles are scaled according to their apparent distance to the camera."
  			},
  			viewport: {
  				doc: "Circles are not scaled."
  			}
  		},
  		"default": "map",
  		doc: "Controls the scaling behavior of the circle when the map is pitched.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.21.0",
  				android: "4.2.0",
  				ios: "3.4.0",
  				macos: "0.2.1"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"circle-pitch-alignment": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The circle is aligned to the plane of the map."
  			},
  			viewport: {
  				doc: "The circle is aligned to the plane of the viewport."
  			}
  		},
  		"default": "viewport",
  		doc: "Orientation of circle when map is pitched.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.39.0",
  				android: "5.2.0",
  				ios: "3.7.0",
  				macos: "0.6.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"circle-stroke-width": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "The width of the circle's stroke. Strokes are placed outside of the `circle-radius`.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-stroke-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The stroke color of the circle.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"circle-stroke-opacity": {
  		type: "number",
  		doc: "The opacity of the circle's stroke.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			},
  			"data-driven styling": {
  				js: "0.29.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	}
  };
  var paint_heatmap = {
  	"heatmap-radius": {
  		type: "number",
  		"default": 30,
  		minimum: 1,
  		transition: true,
  		units: "pixels",
  		doc: "Radius of influence of one heatmap point in pixels. Increasing the value makes the heatmap smoother, but less detailed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			},
  			"data-driven styling": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"heatmap-weight": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		transition: false,
  		doc: "A measure of how much an individual point contributes to the heatmap. A value of 10 would be equivalent to having 10 points of weight 1 in the same spot. Especially useful when combined with clustering.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			},
  			"data-driven styling": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"heatmap-intensity": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		transition: true,
  		doc: "Similar to `heatmap-weight` but controls the intensity of the heatmap globally. Primarily used for adjusting the heatmap based on zoom level.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"heatmap-color": {
  		type: "color",
  		"default": [
  			"interpolate",
  			[
  				"linear"
  			],
  			[
  				"heatmap-density"
  			],
  			0,
  			"rgba(0, 0, 255, 0)",
  			0.1,
  			"royalblue",
  			0.3,
  			"cyan",
  			0.5,
  			"lime",
  			0.7,
  			"yellow",
  			1,
  			"red"
  		],
  		doc: "Defines the color of each pixel based on its density value in a heatmap.  Should be an expression that uses `[\"heatmap-density\"]` as input.",
  		transition: false,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			},
  			"data-driven styling": {
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"heatmap-density"
  			]
  		},
  		"property-type": "color-ramp"
  	},
  	"heatmap-opacity": {
  		type: "number",
  		doc: "The global opacity at which the heatmap layer will be drawn.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.41.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  };
  var paint_symbol = {
  	"icon-opacity": {
  		doc: "The opacity at which the icon will be drawn.",
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-color": {
  		type: "color",
  		"default": "#000000",
  		transition: true,
  		doc: "The color of the icon. This can only be used with sdf icons.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-halo-color": {
  		type: "color",
  		"default": "rgba(0, 0, 0, 0)",
  		transition: true,
  		doc: "The color of the icon's halo. Icon halos can only be used with SDF icons.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-halo-width": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Distance of halo to the icon outline.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-halo-blur": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Fade out the halo towards the outside.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"icon-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.",
  		requires: [
  			"icon-image"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"icon-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "Icons are translated relative to the map."
  			},
  			viewport: {
  				doc: "Icons are translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `icon-translate`.",
  		"default": "map",
  		requires: [
  			"icon-image",
  			"icon-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-opacity": {
  		type: "number",
  		doc: "The opacity at which the text will be drawn.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-color": {
  		type: "color",
  		doc: "The color with which the text will be drawn.",
  		"default": "#000000",
  		transition: true,
  		overridable: true,
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-halo-color": {
  		type: "color",
  		"default": "rgba(0, 0, 0, 0)",
  		transition: true,
  		doc: "The color of the text's halo, which helps it stand out from backgrounds.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-halo-width": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "Distance of halo to the font outline. Max text halo width is 1/4 of the font-size.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-halo-blur": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		transition: true,
  		units: "pixels",
  		doc: "The halo's fadeout distance towards the outside.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  				js: "0.33.0",
  				android: "5.0.0",
  				ios: "3.5.0",
  				macos: "0.4.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"text-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.",
  		requires: [
  			"text-field"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"text-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The text is translated relative to the map."
  			},
  			viewport: {
  				doc: "The text is translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `text-translate`.",
  		"default": "map",
  		requires: [
  			"text-field",
  			"text-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  };
  var paint_raster = {
  	"raster-opacity": {
  		type: "number",
  		doc: "The opacity at which the image will be drawn.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-hue-rotate": {
  		type: "number",
  		"default": 0,
  		period: 360,
  		transition: true,
  		units: "degrees",
  		doc: "Rotates hues around the color wheel.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-brightness-min": {
  		type: "number",
  		doc: "Increase or reduce the brightness of the image. The value is the minimum brightness.",
  		"default": 0,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-brightness-max": {
  		type: "number",
  		doc: "Increase or reduce the brightness of the image. The value is the maximum brightness.",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-saturation": {
  		type: "number",
  		doc: "Increase or reduce the saturation of the image.",
  		"default": 0,
  		minimum: -1,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-contrast": {
  		type: "number",
  		doc: "Increase or reduce the contrast of the image.",
  		"default": 0,
  		minimum: -1,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-resampling": {
  		type: "enum",
  		doc: "The resampling/interpolation method to use for overscaling, also known as texture magnification filter",
  		values: {
  			linear: {
  				doc: "(Bi)linear filtering interpolates pixel values using the weighted average of the four closest original source pixels creating a smooth but blurry look when overscaled"
  			},
  			nearest: {
  				doc: "Nearest neighbor filtering interpolates pixel values using the nearest original source pixel creating a sharp but pixelated look when overscaled"
  			}
  		},
  		"default": "linear",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.47.0",
  				android: "6.3.0",
  				ios: "4.2.0",
  				macos: "0.9.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"raster-fade-duration": {
  		type: "number",
  		"default": 300,
  		minimum: 0,
  		transition: false,
  		units: "milliseconds",
  		doc: "Fade duration when a new tile is added.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  };
  var paint_hillshade = {
  	"hillshade-illumination-direction": {
  		type: "number",
  		"default": 335,
  		minimum: 0,
  		maximum: 359,
  		doc: "The direction of the light source used to generate the hillshading with 0 as the top of the viewport if `hillshade-illumination-anchor` is set to `viewport` and due north if `hillshade-illumination-anchor` is set to `map`.",
  		transition: false,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"hillshade-illumination-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The hillshade illumination is relative to the north direction."
  			},
  			viewport: {
  				doc: "The hillshade illumination is relative to the top of the viewport."
  			}
  		},
  		"default": "viewport",
  		doc: "Direction of light source when map is rotated.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"hillshade-exaggeration": {
  		type: "number",
  		doc: "Intensity of the hillshade",
  		"default": 0.5,
  		minimum: 0,
  		maximum: 1,
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"hillshade-shadow-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The shading color of areas that face away from the light source.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"hillshade-highlight-color": {
  		type: "color",
  		"default": "#FFFFFF",
  		doc: "The shading color of areas that faces towards the light source.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"hillshade-accent-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The shading color used to accentuate rugged terrain like sharp cliffs and gorges.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.43.0",
  				android: "6.0.0",
  				ios: "4.0.0",
  				macos: "0.7.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  };
  var paint_background = {
  	"background-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The color with which the background will be drawn.",
  		transition: true,
  		requires: [
  			{
  				"!": "background-pattern"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"background-pattern": {
  		type: "resolvedImage",
  		transition: true,
  		doc: "Name of image in sprite to use for drawing an image background. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoom-dependent expressions will be evaluated only at integer zoom levels.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			},
  			"data-driven styling": {
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "cross-faded"
  	},
  	"background-opacity": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		doc: "The opacity at which the background will be drawn.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.10.0",
  				android: "2.0.1",
  				ios: "2.0.0",
  				macos: "0.1.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  };
  var transition = {
  	duration: {
  		type: "number",
  		"default": 300,
  		minimum: 0,
  		units: "milliseconds",
  		doc: "Time allotted for transitions to complete."
  	},
  	delay: {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		units: "milliseconds",
  		doc: "Length of time before a transition begins."
  	}
  };
  var promoteId = {
  	"*": {
  		type: "string",
  		doc: "A name of a feature property to use as ID for feature state."
  	}
  };
  var v8Spec = {
  	$version: $version,
  	$root: $root,
  	sources: sources,
  	source: source,
  	source_vector: source_vector,
  	source_raster: source_raster,
  	source_raster_dem: source_raster_dem,
  	source_geojson: source_geojson,
  	source_video: source_video,
  	source_image: source_image,
  	layer: layer,
  	layout: layout,
  	layout_background: layout_background,
  	layout_fill: layout_fill,
  	layout_circle: layout_circle,
  	layout_heatmap: layout_heatmap,
  	"layout_fill-extrusion": {
  	visibility: {
  		type: "enum",
  		values: {
  			visible: {
  				doc: "The layer is shown."
  			},
  			none: {
  				doc: "The layer is not shown."
  			}
  		},
  		"default": "visible",
  		doc: "Whether this layer is displayed.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		"property-type": "constant"
  	}
  },
  	layout_line: layout_line,
  	layout_symbol: layout_symbol,
  	layout_raster: layout_raster,
  	layout_hillshade: layout_hillshade,
  	filter: filter,
  	filter_operator: filter_operator,
  	geometry_type: geometry_type,
  	"function": {
  	expression: {
  		type: "expression",
  		doc: "An expression."
  	},
  	stops: {
  		type: "array",
  		doc: "An array of stops.",
  		value: "function_stop"
  	},
  	base: {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		doc: "The exponential base of the interpolation curve. It controls the rate at which the result increases. Higher values make the result increase more towards the high end of the range. With `1` the stops are interpolated linearly."
  	},
  	property: {
  		type: "string",
  		doc: "The name of a feature property to use as the function input.",
  		"default": "$zoom"
  	},
  	type: {
  		type: "enum",
  		values: {
  			identity: {
  				doc: "Return the input value as the output value."
  			},
  			exponential: {
  				doc: "Generate an output by interpolating between stops just less than and just greater than the function input."
  			},
  			interval: {
  				doc: "Return the output value of the stop just less than the function input."
  			},
  			categorical: {
  				doc: "Return the output value of the stop equal to the function input."
  			}
  		},
  		doc: "The interpolation strategy to use in function evaluation.",
  		"default": "exponential"
  	},
  	colorSpace: {
  		type: "enum",
  		values: {
  			rgb: {
  				doc: "Use the RGB color space to interpolate color values"
  			},
  			lab: {
  				doc: "Use the LAB color space to interpolate color values."
  			},
  			hcl: {
  				doc: "Use the HCL color space to interpolate color values, interpolating the Hue, Chroma, and Luminance channels individually."
  			}
  		},
  		doc: "The color space in which colors interpolated. Interpolating colors in perceptual color spaces like LAB and HCL tend to produce color ramps that look more consistent and produce colors that can be differentiated more easily than those interpolated in RGB space.",
  		"default": "rgb"
  	},
  	"default": {
  		type: "*",
  		required: false,
  		doc: "A value to serve as a fallback function result when a value isn't otherwise available. It is used in the following circumstances:\n* In categorical functions, when the feature value does not match any of the stop domain values.\n* In property and zoom-and-property functions, when a feature does not contain a value for the specified property.\n* In identity functions, when the feature value is not valid for the style property (for example, if the function is being used for a `circle-color` property but the feature property value is not a string or not a valid color).\n* In interval or exponential property and zoom-and-property functions, when the feature value is not numeric.\nIf no default is provided, the style property's default is used in these circumstances."
  	}
  },
  	function_stop: function_stop,
  	expression: expression$1,
  	expression_name: expression_name,
  	light: light,
  	terrain: terrain,
  	paint: paint,
  	paint_fill: paint_fill,
  	"paint_fill-extrusion": {
  	"fill-extrusion-opacity": {
  		type: "number",
  		"default": 1,
  		minimum: 0,
  		maximum: 1,
  		doc: "The opacity of the entire fill extrusion layer. This is rendered on a per-layer, not per-feature, basis, and data-driven styling is not available.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-extrusion-color": {
  		type: "color",
  		"default": "#000000",
  		doc: "The base color of the extruded fill. The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use `fill-extrusion-opacity` to set layer opacity.",
  		transition: true,
  		requires: [
  			{
  				"!": "fill-extrusion-pattern"
  			}
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			},
  			"data-driven styling": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-extrusion-translate": {
  		type: "array",
  		value: "number",
  		length: 2,
  		"default": [
  			0,
  			0
  		],
  		transition: true,
  		units: "pixels",
  		doc: "The geometry's offset. Values are [x, y] where negatives indicate left and up (on the flat plane), respectively.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-extrusion-translate-anchor": {
  		type: "enum",
  		values: {
  			map: {
  				doc: "The fill extrusion is translated relative to the map."
  			},
  			viewport: {
  				doc: "The fill extrusion is translated relative to the viewport."
  			}
  		},
  		doc: "Controls the frame of reference for `fill-extrusion-translate`.",
  		"default": "map",
  		requires: [
  			"fill-extrusion-translate"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	},
  	"fill-extrusion-pattern": {
  		type: "resolvedImage",
  		transition: true,
  		doc: "Name of image in sprite to use for drawing images on extruded fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoom-dependent expressions will be evaluated only at integer zoom levels.",
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			},
  			"data-driven styling": {
  				js: "0.49.0",
  				android: "6.5.0",
  				macos: "0.11.0",
  				ios: "4.4.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom",
  				"feature"
  			]
  		},
  		"property-type": "cross-faded-data-driven"
  	},
  	"fill-extrusion-height": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		units: "meters",
  		doc: "The height with which to extrude this layer.",
  		transition: true,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			},
  			"data-driven styling": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-extrusion-base": {
  		type: "number",
  		"default": 0,
  		minimum: 0,
  		units: "meters",
  		doc: "The height with which to extrude the base of this layer. Must be less than or equal to `fill-extrusion-height`.",
  		transition: true,
  		requires: [
  			"fill-extrusion-height"
  		],
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			},
  			"data-driven styling": {
  				js: "0.27.0",
  				android: "5.1.0",
  				ios: "3.6.0",
  				macos: "0.5.0"
  			}
  		},
  		expression: {
  			interpolated: true,
  			parameters: [
  				"zoom",
  				"feature",
  				"feature-state"
  			]
  		},
  		"property-type": "data-driven"
  	},
  	"fill-extrusion-vertical-gradient": {
  		type: "boolean",
  		"default": true,
  		doc: "Whether to apply a vertical gradient to the sides of a fill-extrusion layer. If true, sides will be shaded slightly darker farther down.",
  		transition: false,
  		"sdk-support": {
  			"basic functionality": {
  				js: "0.50.0",
  				ios: "4.7.0",
  				macos: "0.13.0"
  			}
  		},
  		expression: {
  			interpolated: false,
  			parameters: [
  				"zoom"
  			]
  		},
  		"property-type": "data-constant"
  	}
  },
  	paint_line: paint_line,
  	paint_circle: paint_circle,
  	paint_heatmap: paint_heatmap,
  	paint_symbol: paint_symbol,
  	paint_raster: paint_raster,
  	paint_hillshade: paint_hillshade,
  	paint_background: paint_background,
  	transition: transition,
  	"property-type": {
  	"data-driven": {
  		type: "property-type",
  		doc: "Property is interpolable and can be represented using a property expression."
  	},
  	"cross-faded": {
  		type: "property-type",
  		doc: "Property is non-interpolable; rather, its values will be cross-faded to smoothly transition between integer zooms."
  	},
  	"cross-faded-data-driven": {
  		type: "property-type",
  		doc: "Property is non-interpolable; rather, its values will be cross-faded to smoothly transition between integer zooms. It can be represented using a property expression."
  	},
  	"color-ramp": {
  		type: "property-type",
  		doc: "Property should be specified using a color ramp from which the output color can be sampled based on a property calculation."
  	},
  	"data-constant": {
  		type: "property-type",
  		doc: "Property is interpolable but cannot be represented using a property expression."
  	},
  	constant: {
  		type: "property-type",
  		doc: "Property is constant across all zoom levels and property values."
  	}
  },
  	promoteId: promoteId
  };

  function sortKeysBy(obj, reference) {
      const result = {};
      for (const key in reference) {
          if (obj[key] !== undefined) {
              result[key] = obj[key];
          }
      }
      for (const key in obj) {
          if (result[key] === undefined) {
              result[key] = obj[key];
          }
      }
      return result;
  }
  /**
   * Format a MapLibre GL Style.  Returns a stringified style with its keys
   * sorted in the same order as the reference style.
   *
   * The optional `space` argument is passed to
   * [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
   * to generate formatted output.
   *
   * If `space` is unspecified, a default of `2` spaces will be used.
   *
   * @private
   * @param {Object} style a MapLibre GL Style
   * @param {number} [space] space argument to pass to `JSON.stringify`
   * @returns {string} stringified formatted JSON
   * @example
   * var fs = require('fs');
   * var format = require('maplibre-gl-style-spec').format;
   * var style = fs.readFileSync('./source.json', 'utf8');
   * fs.writeFileSync('./dest.json', format(style));
   * fs.writeFileSync('./dest.min.json', format(style, 0));
   */
  function format(style, space = 2) {
      style = sortKeysBy(style, v8Spec.$root);
      if (style.layers) {
          style.layers = style.layers.map((layer) => sortKeysBy(layer, v8Spec.layer));
      }
      return stringifyPretty(style, { indent: space });
  }

  function getPropertyReference(propertyName) {
      for (let i = 0; i < v8Spec.layout.length; i++) {
          for (const key in v8Spec[v8Spec.layout[i]]) {
              if (key === propertyName)
                  return v8Spec[v8Spec.layout[i]][key];
          }
      }
      for (let i = 0; i < v8Spec.paint.length; i++) {
          for (const key in v8Spec[v8Spec.paint[i]]) {
              if (key === propertyName)
                  return v8Spec[v8Spec.paint[i]][key];
          }
      }
      return null;
  }
  function eachSource(style, callback) {
      for (const k in style.sources) {
          callback(style.sources[k]);
      }
  }
  function eachLayer(style, callback) {
      for (const layer of style.layers) {
          callback(layer);
      }
  }
  function eachProperty(style, options, callback) {
      function inner(layer, propertyType) {
          const properties = layer[propertyType];
          if (!properties)
              return;
          Object.keys(properties).forEach((key) => {
              callback({
                  path: [layer.id, propertyType, key],
                  key,
                  value: properties[key],
                  reference: getPropertyReference(key),
                  set(x) {
                      properties[key] = x;
                  }
              });
          });
      }
      eachLayer(style, (layer) => {
          if (options.paint) {
              inner(layer, 'paint');
          }
          if (options.layout) {
              inner(layer, 'layout');
          }
      });
  }

  function eachLayout(layer, callback) {
      for (const k in layer) {
          if (k.indexOf('layout') === 0) {
              callback(layer[k], k);
          }
      }
  }
  function eachPaint(layer, callback) {
      for (const k in layer) {
          if (k.indexOf('paint') === 0) {
              callback(layer[k], k);
          }
      }
  }
  function resolveConstant(style, value) {
      if (typeof value === 'string' && value[0] === '@') {
          return resolveConstant(style, style.constants[value]);
      }
      else {
          return value;
      }
  }
  function isFunction$1(value) {
      return Array.isArray(value.stops);
  }
  function renameProperty(obj, from, to) {
      obj[to] = obj[from];
      delete obj[from];
  }
  function migrateV8(style) {
      style.version = 8;
      // Rename properties, reverse coordinates in source and layers
      eachSource(style, (source) => {
          if (source.type === 'video' && source['url'] !== undefined) {
              renameProperty(source, 'url', 'urls');
          }
          if (source.type === 'video') {
              source.coordinates.forEach((coord) => {
                  return coord.reverse();
              });
          }
      });
      eachLayer(style, (layer) => {
          eachLayout(layer, (layout) => {
              if (layout['symbol-min-distance'] !== undefined) {
                  renameProperty(layout, 'symbol-min-distance', 'symbol-spacing');
              }
          });
          eachPaint(layer, (paint) => {
              if (paint['background-image'] !== undefined) {
                  renameProperty(paint, 'background-image', 'background-pattern');
              }
              if (paint['line-image'] !== undefined) {
                  renameProperty(paint, 'line-image', 'line-pattern');
              }
              if (paint['fill-image'] !== undefined) {
                  renameProperty(paint, 'fill-image', 'fill-pattern');
              }
          });
      });
      // Inline Constants
      eachProperty(style, { paint: true, layout: true }, (property) => {
          const value = resolveConstant(style, property.value);
          if (isFunction$1(value)) {
              value.stops.forEach((stop) => {
                  stop[1] = resolveConstant(style, stop[1]);
              });
          }
          property.set(value);
      });
      delete style['constants'];
      eachLayer(style, (layer) => {
          // get rid of text-max-size, icon-max-size
          // turn text-size, icon-size into layout properties
          // https://github.com/mapbox/mapbox-gl-style-spec/issues/255
          eachLayout(layer, (layout) => {
              delete layout['text-max-size'];
              delete layout['icon-max-size'];
          });
          eachPaint(layer, (paint) => {
              if (paint['text-size']) {
                  if (!layer.layout)
                      layer.layout = {};
                  layer.layout['text-size'] = paint['text-size'];
                  delete paint['text-size'];
              }
              if (paint['icon-size']) {
                  if (!layer.layout)
                      layer.layout = {};
                  layer.layout['icon-size'] = paint['icon-size'];
                  delete paint['icon-size'];
              }
          });
      });
      function migrateFontstackURL(input) {
          const inputParsed = URL.parse(input);
          const inputPathnameParts = inputParsed.pathname.split('/');
          if (inputParsed.protocol !== 'mapbox:') {
              return input;
          }
          else if (inputParsed.hostname === 'fontstack') {
              assert(decodeURI(inputParsed.pathname) === '/{fontstack}/{range}.pbf');
              return 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf';
          }
          else if (inputParsed.hostname === 'fonts') {
              assert(inputPathnameParts[1] === 'v1');
              assert(decodeURI(inputPathnameParts[3]) === '{fontstack}');
              assert(decodeURI(inputPathnameParts[4]) === '{range}.pbf');
              return `mapbox://fonts/${inputPathnameParts[2]}/{fontstack}/{range}.pbf`;
          }
          else {
              assert(false);
          }
          function assert(predicate) {
              if (!predicate) {
                  throw new Error(`Invalid font url: "${input}"`);
              }
          }
      }
      if (style.glyphs) {
          style.glyphs = migrateFontstackURL(style.glyphs);
      }
      function migrateFontStack(font) {
          function splitAndTrim(string) {
              return string.split(',').map((s) => {
                  return s.trim();
              });
          }
          if (Array.isArray(font)) {
              // Assume it's a previously migrated font-array.
              return font;
          }
          else if (typeof font === 'string') {
              return splitAndTrim(font);
          }
          else if (typeof font === 'object') {
              font.stops.forEach((stop) => {
                  stop[1] = splitAndTrim(stop[1]);
              });
              return font;
          }
          else {
              throw new Error('unexpected font value');
          }
      }
      eachLayer(style, (layer) => {
          eachLayout(layer, (layout) => {
              if (layout['text-font']) {
                  layout['text-font'] = migrateFontStack(layout['text-font']);
              }
          });
      });
      // Reverse order of symbol layers. This is an imperfect migration.
      //
      // The order of a symbol layer in the layers list affects two things:
      // - how it is drawn relative to other layers (like oneway arrows below bridges)
      // - the placement priority compared to other layers
      //
      // It's impossible to reverse the placement priority without breaking the draw order
      // in some cases. This migration only reverses the order of symbol layers that
      // are above all other types of layers.
      //
      // Symbol layers that are at the top of the map preserve their priority.
      // Symbol layers that are below another type (line, fill) of layer preserve their draw order.
      let firstSymbolLayer = 0;
      for (let i = style.layers.length - 1; i >= 0; i--) {
          const layer = style.layers[i];
          if (layer.type !== 'symbol') {
              firstSymbolLayer = i + 1;
              break;
          }
      }
      const symbolLayers = style.layers.splice(firstSymbolLayer);
      symbolLayers.reverse();
      style.layers = style.layers.concat(symbolLayers);
      return style;
  }

  function extendBy(output, ...inputs) {
      for (const input of inputs) {
          for (const k in input) {
              output[k] = input[k];
          }
      }
      return output;
  }

  class ExpressionParsingError extends Error {
      constructor(key, message) {
          super(message);
          this.message = message;
          this.key = key;
      }
  }

  /**
   * Tracks `let` bindings during expression parsing.
   * @private
   */
  class Scope {
      constructor(parent, bindings = []) {
          this.parent = parent;
          this.bindings = {};
          for (const [name, expression] of bindings) {
              this.bindings[name] = expression;
          }
      }
      concat(bindings) {
          return new Scope(this, bindings);
      }
      get(name) {
          if (this.bindings[name]) {
              return this.bindings[name];
          }
          if (this.parent) {
              return this.parent.get(name);
          }
          throw new Error(`${name} not found in scope.`);
      }
      has(name) {
          if (this.bindings[name])
              return true;
          return this.parent ? this.parent.has(name) : false;
      }
  }

  const NullType = { kind: 'null' };
  const NumberType = { kind: 'number' };
  const StringType = { kind: 'string' };
  const BooleanType = { kind: 'boolean' };
  const ColorType = { kind: 'color' };
  const ObjectType = { kind: 'object' };
  const ValueType = { kind: 'value' };
  const ErrorType = { kind: 'error' };
  const CollatorType = { kind: 'collator' };
  const FormattedType = { kind: 'formatted' };
  const PaddingType = { kind: 'padding' };
  const ResolvedImageType = { kind: 'resolvedImage' };
  function array$1(itemType, N) {
      return {
          kind: 'array',
          itemType,
          N
      };
  }
  function toString$1(type) {
      if (type.kind === 'array') {
          const itemType = toString$1(type.itemType);
          return typeof type.N === 'number' ?
              `array<${itemType}, ${type.N}>` :
              type.itemType.kind === 'value' ? 'array' : `array<${itemType}>`;
      }
      else {
          return type.kind;
      }
  }
  const valueMemberTypes = [
      NullType,
      NumberType,
      StringType,
      BooleanType,
      ColorType,
      FormattedType,
      ObjectType,
      array$1(ValueType),
      PaddingType,
      ResolvedImageType
  ];
  /**
   * Returns null if `t` is a subtype of `expected`; otherwise returns an
   * error message.
   * @private
   */
  function checkSubtype(expected, t) {
      if (t.kind === 'error') {
          // Error is a subtype of every type
          return null;
      }
      else if (expected.kind === 'array') {
          if (t.kind === 'array' &&
              ((t.N === 0 && t.itemType.kind === 'value') || !checkSubtype(expected.itemType, t.itemType)) &&
              (typeof expected.N !== 'number' || expected.N === t.N)) {
              return null;
          }
      }
      else if (expected.kind === t.kind) {
          return null;
      }
      else if (expected.kind === 'value') {
          for (const memberType of valueMemberTypes) {
              if (!checkSubtype(memberType, t)) {
                  return null;
              }
          }
      }
      return `Expected ${toString$1(expected)} but found ${toString$1(t)} instead.`;
  }
  function isValidType(provided, allowedTypes) {
      return allowedTypes.some(t => t.kind === provided.kind);
  }
  function isValidNativeType(provided, allowedTypes) {
      return allowedTypes.some(t => {
          if (t === 'null') {
              return provided === null;
          }
          else if (t === 'array') {
              return Array.isArray(provided);
          }
          else if (t === 'object') {
              return provided && !Array.isArray(provided) && typeof provided === 'object';
          }
          else {
              return t === typeof provided;
          }
      });
  }

  /**
   * An RGBA color value. Create instances from color strings using the static
   * method `Color.parse`. The constructor accepts RGB channel values in the range
   * `[0, 1]`, premultiplied by A.
   *
   * @param {number} r The red channel.
   * @param {number} g The green channel.
   * @param {number} b The blue channel.
   * @param {number} a The alpha channel.
   * @private
   */
  class Color {
      constructor(r, g, b, a = 1) {
          this.r = r;
          this.g = g;
          this.b = b;
          this.a = a;
      }
      /**
       * Parses valid CSS color strings and returns a `Color` instance.
       * @param input
       * @returns A `Color` instance, or `undefined` if the input is not a valid color string.
       */
      static parse(input) {
          if (!input) {
              return undefined;
          }
          if (input instanceof Color) {
              return input;
          }
          if (typeof input !== 'string') {
              return undefined;
          }
          const rgba = csscolorparser.parseCSSColor(input);
          if (!rgba) {
              return undefined;
          }
          return new Color(rgba[0] / 255 * rgba[3], rgba[1] / 255 * rgba[3], rgba[2] / 255 * rgba[3], rgba[3]);
      }
      /**
       * Returns an RGBA string representing the color value.
       *
       * @returns An RGBA string.
       * @example
       * var purple = new Color.parse('purple');
       * purple.toString; // = "rgba(128,0,128,1)"
       * var translucentGreen = new Color.parse('rgba(26, 207, 26, .73)');
       * translucentGreen.toString(); // = "rgba(26,207,26,0.73)"
       */
      toString() {
          const [r, g, b, a] = this.toArray();
          return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
      }
      toArray() {
          const { r, g, b, a } = this;
          return a === 0 ? [0, 0, 0, 0] : [
              r * 255 / a,
              g * 255 / a,
              b * 255 / a,
              a
          ];
      }
  }
  Color.black = new Color(0, 0, 0, 1);
  Color.white = new Color(1, 1, 1, 1);
  Color.transparent = new Color(0, 0, 0, 0);
  Color.red = new Color(1, 0, 0, 1);

  // Flow type declarations for Intl cribbed from
  // https://github.com/facebook/flow/issues/1270
  class Collator {
      constructor(caseSensitive, diacriticSensitive, locale) {
          if (caseSensitive)
              this.sensitivity = diacriticSensitive ? 'variant' : 'case';
          else
              this.sensitivity = diacriticSensitive ? 'accent' : 'base';
          this.locale = locale;
          this.collator = new Intl.Collator(this.locale ? this.locale : [], { sensitivity: this.sensitivity, usage: 'search' });
      }
      compare(lhs, rhs) {
          return this.collator.compare(lhs, rhs);
      }
      resolvedLocale() {
          // We create a Collator without "usage: search" because we don't want
          // the search options encoded in our result (e.g. "en-u-co-search")
          return new Intl.Collator(this.locale ? this.locale : [])
              .resolvedOptions().locale;
      }
  }

  class FormattedSection {
      constructor(text, image, scale, fontStack, textColor) {
          this.text = text;
          this.image = image;
          this.scale = scale;
          this.fontStack = fontStack;
          this.textColor = textColor;
      }
  }
  class Formatted {
      constructor(sections) {
          this.sections = sections;
      }
      static fromString(unformatted) {
          return new Formatted([new FormattedSection(unformatted, null, null, null, null)]);
      }
      isEmpty() {
          if (this.sections.length === 0)
              return true;
          return !this.sections.some(section => section.text.length !== 0 ||
              (section.image && section.image.name.length !== 0));
      }
      static factory(text) {
          if (text instanceof Formatted) {
              return text;
          }
          else {
              return Formatted.fromString(text);
          }
      }
      toString() {
          if (this.sections.length === 0)
              return '';
          return this.sections.map(section => section.text).join('');
      }
  }

  /**
   * A set of four numbers representing padding around a box. Create instances from
   * bare arrays or numeric values using the static method `Padding.parse`.
   * @private
   */
  class Padding {
      constructor(values) {
          this.values = values.slice();
      }
      /**
       * Numeric padding values
       * @param input
       * @returns A `Padding` instance, or `undefined` if the input is not a valid padding value.
       */
      static parse(input) {
          if (input instanceof Padding) {
              return input;
          }
          // Backwards compatibility: bare number is treated the same as array with single value.
          // Padding applies to all four sides.
          if (typeof input === 'number') {
              return new Padding([input, input, input, input]);
          }
          if (!Array.isArray(input)) {
              return undefined;
          }
          if (input.length < 1 || input.length > 4) {
              return undefined;
          }
          for (const val of input) {
              if (typeof val !== 'number') {
                  return undefined;
              }
          }
          // Expand shortcut properties into explicit 4-sided values
          switch (input.length) {
              case 1:
                  input = [input[0], input[0], input[0], input[0]];
                  break;
              case 2:
                  input = [input[0], input[1], input[0], input[1]];
                  break;
              case 3:
                  input = [input[0], input[1], input[2], input[1]];
                  break;
          }
          return new Padding(input);
      }
      toString() {
          return JSON.stringify(this.values);
      }
  }

  class ResolvedImage {
      constructor(options) {
          this.name = options.name;
          this.available = options.available;
      }
      toString() {
          return this.name;
      }
      static fromString(name) {
          if (!name)
              return null; // treat empty values as no image
          return new ResolvedImage({ name, available: false });
      }
  }

  function validateRGBA(r, g, b, a) {
      if (!(typeof r === 'number' && r >= 0 && r <= 255 &&
          typeof g === 'number' && g >= 0 && g <= 255 &&
          typeof b === 'number' && b >= 0 && b <= 255)) {
          const value = typeof a === 'number' ? [r, g, b, a] : [r, g, b];
          return `Invalid rgba value [${value.join(', ')}]: 'r', 'g', and 'b' must be between 0 and 255.`;
      }
      if (!(typeof a === 'undefined' || (typeof a === 'number' && a >= 0 && a <= 1))) {
          return `Invalid rgba value [${[r, g, b, a].join(', ')}]: 'a' must be between 0 and 1.`;
      }
      return null;
  }
  function isValue(mixed) {
      if (mixed === null) {
          return true;
      }
      else if (typeof mixed === 'string') {
          return true;
      }
      else if (typeof mixed === 'boolean') {
          return true;
      }
      else if (typeof mixed === 'number') {
          return true;
      }
      else if (mixed instanceof Color) {
          return true;
      }
      else if (mixed instanceof Collator) {
          return true;
      }
      else if (mixed instanceof Formatted) {
          return true;
      }
      else if (mixed instanceof Padding) {
          return true;
      }
      else if (mixed instanceof ResolvedImage) {
          return true;
      }
      else if (Array.isArray(mixed)) {
          for (const item of mixed) {
              if (!isValue(item)) {
                  return false;
              }
          }
          return true;
      }
      else if (typeof mixed === 'object') {
          for (const key in mixed) {
              if (!isValue(mixed[key])) {
                  return false;
              }
          }
          return true;
      }
      else {
          return false;
      }
  }
  function typeOf(value) {
      if (value === null) {
          return NullType;
      }
      else if (typeof value === 'string') {
          return StringType;
      }
      else if (typeof value === 'boolean') {
          return BooleanType;
      }
      else if (typeof value === 'number') {
          return NumberType;
      }
      else if (value instanceof Color) {
          return ColorType;
      }
      else if (value instanceof Collator) {
          return CollatorType;
      }
      else if (value instanceof Formatted) {
          return FormattedType;
      }
      else if (value instanceof Padding) {
          return PaddingType;
      }
      else if (value instanceof ResolvedImage) {
          return ResolvedImageType;
      }
      else if (Array.isArray(value)) {
          const length = value.length;
          let itemType;
          for (const item of value) {
              const t = typeOf(item);
              if (!itemType) {
                  itemType = t;
              }
              else if (itemType === t) {
                  continue;
              }
              else {
                  itemType = ValueType;
                  break;
              }
          }
          return array$1(itemType || ValueType, length);
      }
      else {
          return ObjectType;
      }
  }
  function toString(value) {
      const type = typeof value;
      if (value === null) {
          return '';
      }
      else if (type === 'string' || type === 'number' || type === 'boolean') {
          return String(value);
      }
      else if (value instanceof Color || value instanceof Formatted || value instanceof Padding || value instanceof ResolvedImage) {
          return value.toString();
      }
      else {
          return JSON.stringify(value);
      }
  }

  class Literal {
      constructor(type, value) {
          this.type = type;
          this.value = value;
      }
      static parse(args, context) {
          if (args.length !== 2)
              return context.error(`'literal' expression requires exactly one argument, but found ${args.length - 1} instead.`);
          if (!isValue(args[1]))
              return context.error('invalid value');
          const value = args[1];
          let type = typeOf(value);
          // special case: infer the item type if possible for zero-length arrays
          const expected = context.expectedType;
          if (type.kind === 'array' &&
              type.N === 0 &&
              expected &&
              expected.kind === 'array' &&
              (typeof expected.N !== 'number' || expected.N === 0)) {
              type = expected;
          }
          return new Literal(type, value);
      }
      evaluate() {
          return this.value;
      }
      eachChild() { }
      outputDefined() {
          return true;
      }
  }

  class RuntimeError {
      constructor(message) {
          this.name = 'ExpressionEvaluationError';
          this.message = message;
      }
      toJSON() {
          return this.message;
      }
  }

  const types$1 = {
      string: StringType,
      number: NumberType,
      boolean: BooleanType,
      object: ObjectType
  };
  class Assertion {
      constructor(type, args) {
          this.type = type;
          this.args = args;
      }
      static parse(args, context) {
          if (args.length < 2)
              return context.error('Expected at least one argument.');
          let i = 1;
          let type;
          const name = args[0];
          if (name === 'array') {
              let itemType;
              if (args.length > 2) {
                  const type = args[1];
                  if (typeof type !== 'string' || !(type in types$1) || type === 'object')
                      return context.error('The item type argument of "array" must be one of string, number, boolean', 1);
                  itemType = types$1[type];
                  i++;
              }
              else {
                  itemType = ValueType;
              }
              let N;
              if (args.length > 3) {
                  if (args[2] !== null &&
                      (typeof args[2] !== 'number' ||
                          args[2] < 0 ||
                          args[2] !== Math.floor(args[2]))) {
                      return context.error('The length argument to "array" must be a positive integer literal', 2);
                  }
                  N = args[2];
                  i++;
              }
              type = array$1(itemType, N);
          }
          else {
              if (!types$1[name])
                  throw new Error(`Types doesn't contain name = ${name}`);
              type = types$1[name];
          }
          const parsed = [];
          for (; i < args.length; i++) {
              const input = context.parse(args[i], i, ValueType);
              if (!input)
                  return null;
              parsed.push(input);
          }
          return new Assertion(type, parsed);
      }
      evaluate(ctx) {
          for (let i = 0; i < this.args.length; i++) {
              const value = this.args[i].evaluate(ctx);
              const error = checkSubtype(this.type, typeOf(value));
              if (!error) {
                  return value;
              }
              else if (i === this.args.length - 1) {
                  throw new RuntimeError(`Expected value to be of type ${toString$1(this.type)}, but found ${toString$1(typeOf(value))} instead.`);
              }
          }
          throw new Error();
      }
      eachChild(fn) {
          this.args.forEach(fn);
      }
      outputDefined() {
          return this.args.every(arg => arg.outputDefined());
      }
  }

  const types = {
      'to-boolean': BooleanType,
      'to-color': ColorType,
      'to-number': NumberType,
      'to-string': StringType
  };
  /**
   * Special form for error-coalescing coercion expressions "to-number",
   * "to-color".  Since these coercions can fail at runtime, they accept multiple
   * arguments, only evaluating one at a time until one succeeds.
   *
   * @private
   */
  class Coercion {
      constructor(type, args) {
          this.type = type;
          this.args = args;
      }
      static parse(args, context) {
          if (args.length < 2)
              return context.error('Expected at least one argument.');
          const name = args[0];
          if (!types[name])
              throw new Error(`Can't parse ${name} as it is not part of the known types`);
          if ((name === 'to-boolean' || name === 'to-string') && args.length !== 2)
              return context.error('Expected one argument.');
          const type = types[name];
          const parsed = [];
          for (let i = 1; i < args.length; i++) {
              const input = context.parse(args[i], i, ValueType);
              if (!input)
                  return null;
              parsed.push(input);
          }
          return new Coercion(type, parsed);
      }
      evaluate(ctx) {
          if (this.type.kind === 'boolean') {
              return Boolean(this.args[0].evaluate(ctx));
          }
          else if (this.type.kind === 'color') {
              let input;
              let error;
              for (const arg of this.args) {
                  input = arg.evaluate(ctx);
                  error = null;
                  if (input instanceof Color) {
                      return input;
                  }
                  else if (typeof input === 'string') {
                      const c = ctx.parseColor(input);
                      if (c)
                          return c;
                  }
                  else if (Array.isArray(input)) {
                      if (input.length < 3 || input.length > 4) {
                          error = `Invalid rbga value ${JSON.stringify(input)}: expected an array containing either three or four numeric values.`;
                      }
                      else {
                          error = validateRGBA(input[0], input[1], input[2], input[3]);
                      }
                      if (!error) {
                          return new Color(input[0] / 255, input[1] / 255, input[2] / 255, input[3]);
                      }
                  }
              }
              throw new RuntimeError(error || `Could not parse color from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
          }
          else if (this.type.kind === 'padding') {
              let input;
              for (const arg of this.args) {
                  input = arg.evaluate(ctx);
                  const pad = Padding.parse(input);
                  if (pad) {
                      return pad;
                  }
              }
              throw new RuntimeError(`Could not parse padding from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
          }
          else if (this.type.kind === 'number') {
              let value = null;
              for (const arg of this.args) {
                  value = arg.evaluate(ctx);
                  if (value === null)
                      return 0;
                  const num = Number(value);
                  if (isNaN(num))
                      continue;
                  return num;
              }
              throw new RuntimeError(`Could not convert ${JSON.stringify(value)} to number.`);
          }
          else if (this.type.kind === 'formatted') {
              // There is no explicit 'to-formatted' but this coercion can be implicitly
              // created by properties that expect the 'formatted' type.
              return Formatted.fromString(toString(this.args[0].evaluate(ctx)));
          }
          else if (this.type.kind === 'resolvedImage') {
              return ResolvedImage.fromString(toString(this.args[0].evaluate(ctx)));
          }
          else {
              return toString(this.args[0].evaluate(ctx));
          }
      }
      eachChild(fn) {
          this.args.forEach(fn);
      }
      outputDefined() {
          return this.args.every(arg => arg.outputDefined());
      }
  }

  const geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];
  class EvaluationContext {
      constructor() {
          this.globals = null;
          this.feature = null;
          this.featureState = null;
          this.formattedSection = null;
          this._parseColorCache = {};
          this.availableImages = null;
          this.canonical = null;
      }
      id() {
          return this.feature && 'id' in this.feature ? this.feature.id : null;
      }
      geometryType() {
          return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
      }
      geometry() {
          return this.feature && 'geometry' in this.feature ? this.feature.geometry : null;
      }
      canonicalID() {
          return this.canonical;
      }
      properties() {
          return this.feature && this.feature.properties || {};
      }
      parseColor(input) {
          let cached = this._parseColorCache[input];
          if (!cached) {
              cached = this._parseColorCache[input] = Color.parse(input);
          }
          return cached;
      }
  }

  /**
   * State associated parsing at a given point in an expression tree.
   * @private
   */
  class ParsingContext {
      constructor(registry, isConstantFunc, path = [], expectedType, scope = new Scope(), errors = []) {
          this.registry = registry;
          this.path = path;
          this.key = path.map(part => `[${part}]`).join('');
          this.scope = scope;
          this.errors = errors;
          this.expectedType = expectedType;
          this._isConstant = isConstantFunc;
      }
      /**
       * @param expr the JSON expression to parse
       * @param index the optional argument index if this expression is an argument of a parent expression that's being parsed
       * @param options
       * @param options.omitTypeAnnotations set true to omit inferred type annotations.  Caller beware: with this option set, the parsed expression's type will NOT satisfy `expectedType` if it would normally be wrapped in an inferred annotation.
       * @private
       */
      parse(expr, index, expectedType, bindings, options = {}) {
          if (index) {
              return this.concat(index, expectedType, bindings)._parse(expr, options);
          }
          return this._parse(expr, options);
      }
      _parse(expr, options) {
          if (expr === null || typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number') {
              expr = ['literal', expr];
          }
          function annotate(parsed, type, typeAnnotation) {
              if (typeAnnotation === 'assert') {
                  return new Assertion(type, [parsed]);
              }
              else if (typeAnnotation === 'coerce') {
                  return new Coercion(type, [parsed]);
              }
              else {
                  return parsed;
              }
          }
          if (Array.isArray(expr)) {
              if (expr.length === 0) {
                  return this.error('Expected an array with at least one element. If you wanted a literal array, use ["literal", []].');
              }
              const op = expr[0];
              if (typeof op !== 'string') {
                  this.error(`Expression name must be a string, but found ${typeof op} instead. If you wanted a literal array, use ["literal", [...]].`, 0);
                  return null;
              }
              const Expr = this.registry[op];
              if (Expr) {
                  let parsed = Expr.parse(expr, this);
                  if (!parsed)
                      return null;
                  if (this.expectedType) {
                      const expected = this.expectedType;
                      const actual = parsed.type;
                      // When we expect a number, string, boolean, or array but have a value, wrap it in an assertion.
                      // When we expect a color or formatted string, but have a string or value, wrap it in a coercion.
                      // Otherwise, we do static type-checking.
                      //
                      // These behaviors are overridable for:
                      //   * The "coalesce" operator, which needs to omit type annotations.
                      //   * String-valued properties (e.g. `text-field`), where coercion is more convenient than assertion.
                      //
                      if ((expected.kind === 'string' || expected.kind === 'number' || expected.kind === 'boolean' || expected.kind === 'object' || expected.kind === 'array') && actual.kind === 'value') {
                          parsed = annotate(parsed, expected, options.typeAnnotation || 'assert');
                      }
                      else if ((expected.kind === 'color' || expected.kind === 'formatted' || expected.kind === 'resolvedImage') && (actual.kind === 'value' || actual.kind === 'string')) {
                          parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                      }
                      else if (expected.kind === 'padding' && (actual.kind === 'value' || actual.kind === 'number' || actual.kind === 'array')) {
                          parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                      }
                      else if (this.checkSubtype(expected, actual)) {
                          return null;
                      }
                  }
                  // If an expression's arguments are all literals, we can evaluate
                  // it immediately and replace it with a literal value in the
                  // parsed/compiled result. Expressions that expect an image should
                  // not be resolved here so we can later get the available images.
                  if (!(parsed instanceof Literal) && (parsed.type.kind !== 'resolvedImage') && this._isConstant(parsed)) {
                      const ec = new EvaluationContext();
                      try {
                          parsed = new Literal(parsed.type, parsed.evaluate(ec));
                      }
                      catch (e) {
                          this.error(e.message);
                          return null;
                      }
                  }
                  return parsed;
              }
              return this.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
          }
          else if (typeof expr === 'undefined') {
              return this.error('\'undefined\' value invalid. Use null instead.');
          }
          else if (typeof expr === 'object') {
              return this.error('Bare objects invalid. Use ["literal", {...}] instead.');
          }
          else {
              return this.error(`Expected an array, but found ${typeof expr} instead.`);
          }
      }
      /**
       * Returns a copy of this context suitable for parsing the subexpression at
       * index `index`, optionally appending to 'let' binding map.
       *
       * Note that `errors` property, intended for collecting errors while
       * parsing, is copied by reference rather than cloned.
       * @private
       */
      concat(index, expectedType, bindings) {
          const path = typeof index === 'number' ? this.path.concat(index) : this.path;
          const scope = bindings ? this.scope.concat(bindings) : this.scope;
          return new ParsingContext(this.registry, this._isConstant, path, expectedType || null, scope, this.errors);
      }
      /**
       * Push a parsing (or type checking) error into the `this.errors`
       * @param error The message
       * @param keys Optionally specify the source of the error at a child
       * of the current expression at `this.key`.
       * @private
       */
      error(error, ...keys) {
          const key = `${this.key}${keys.map(k => `[${k}]`).join('')}`;
          this.errors.push(new ExpressionParsingError(key, error));
      }
      /**
       * Returns null if `t` is a subtype of `expected`; otherwise returns an
       * error message and also pushes it to `this.errors`.
       * @param expected
       * @param t
       */
      checkSubtype(expected, t) {
          const error = checkSubtype(expected, t);
          if (error)
              this.error(error);
          return error;
      }
  }

  class CollatorExpression {
      constructor(caseSensitive, diacriticSensitive, locale) {
          this.type = CollatorType;
          this.locale = locale;
          this.caseSensitive = caseSensitive;
          this.diacriticSensitive = diacriticSensitive;
      }
      static parse(args, context) {
          if (args.length !== 2)
              return context.error('Expected one argument.');
          const options = args[1];
          if (typeof options !== 'object' || Array.isArray(options))
              return context.error('Collator options argument must be an object.');
          const caseSensitive = context.parse(options['case-sensitive'] === undefined ? false : options['case-sensitive'], 1, BooleanType);
          if (!caseSensitive)
              return null;
          const diacriticSensitive = context.parse(options['diacritic-sensitive'] === undefined ? false : options['diacritic-sensitive'], 1, BooleanType);
          if (!diacriticSensitive)
              return null;
          let locale = null;
          if (options['locale']) {
              locale = context.parse(options['locale'], 1, StringType);
              if (!locale)
                  return null;
          }
          return new CollatorExpression(caseSensitive, diacriticSensitive, locale);
      }
      evaluate(ctx) {
          return new Collator(this.caseSensitive.evaluate(ctx), this.diacriticSensitive.evaluate(ctx), this.locale ? this.locale.evaluate(ctx) : null);
      }
      eachChild(fn) {
          fn(this.caseSensitive);
          fn(this.diacriticSensitive);
          if (this.locale) {
              fn(this.locale);
          }
      }
      outputDefined() {
          // Technically the set of possible outputs is the combinatoric set of Collators produced
          // by all possible outputs of locale/caseSensitive/diacriticSensitive
          // But for the primary use of Collators in comparison operators, we ignore the Collator's
          // possible outputs anyway, so we can get away with leaving this false for now.
          return false;
      }
  }

  const EXTENT = 8192;
  function updateBBox(bbox, coord) {
      bbox[0] = Math.min(bbox[0], coord[0]);
      bbox[1] = Math.min(bbox[1], coord[1]);
      bbox[2] = Math.max(bbox[2], coord[0]);
      bbox[3] = Math.max(bbox[3], coord[1]);
  }
  function mercatorXfromLng(lng) {
      return (180 + lng) / 360;
  }
  function mercatorYfromLat(lat) {
      return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
  }
  function boxWithinBox(bbox1, bbox2) {
      if (bbox1[0] <= bbox2[0])
          return false;
      if (bbox1[2] >= bbox2[2])
          return false;
      if (bbox1[1] <= bbox2[1])
          return false;
      if (bbox1[3] >= bbox2[3])
          return false;
      return true;
  }
  function getTileCoordinates(p, canonical) {
      const x = mercatorXfromLng(p[0]);
      const y = mercatorYfromLat(p[1]);
      const tilesAtZoom = Math.pow(2, canonical.z);
      return [Math.round(x * tilesAtZoom * EXTENT), Math.round(y * tilesAtZoom * EXTENT)];
  }
  function onBoundary(p, p1, p2) {
      const x1 = p[0] - p1[0];
      const y1 = p[1] - p1[1];
      const x2 = p[0] - p2[0];
      const y2 = p[1] - p2[1];
      return (x1 * y2 - x2 * y1 === 0) && (x1 * x2 <= 0) && (y1 * y2 <= 0);
  }
  function rayIntersect(p, p1, p2) {
      return ((p1[1] > p[1]) !== (p2[1] > p[1])) && (p[0] < (p2[0] - p1[0]) * (p[1] - p1[1]) / (p2[1] - p1[1]) + p1[0]);
  }
  // ray casting algorithm for detecting if point is in polygon
  function pointWithinPolygon(point, rings) {
      let inside = false;
      for (let i = 0, len = rings.length; i < len; i++) {
          const ring = rings[i];
          for (let j = 0, len2 = ring.length; j < len2 - 1; j++) {
              if (onBoundary(point, ring[j], ring[j + 1]))
                  return false;
              if (rayIntersect(point, ring[j], ring[j + 1]))
                  inside = !inside;
          }
      }
      return inside;
  }
  function pointWithinPolygons(point, polygons) {
      for (let i = 0; i < polygons.length; i++) {
          if (pointWithinPolygon(point, polygons[i]))
              return true;
      }
      return false;
  }
  function perp(v1, v2) {
      return (v1[0] * v2[1] - v1[1] * v2[0]);
  }
  // check if p1 and p2 are in different sides of line segment q1->q2
  function twoSided(p1, p2, q1, q2) {
      // q1->p1 (x1, y1), q1->p2 (x2, y2), q1->q2 (x3, y3)
      const x1 = p1[0] - q1[0];
      const y1 = p1[1] - q1[1];
      const x2 = p2[0] - q1[0];
      const y2 = p2[1] - q1[1];
      const x3 = q2[0] - q1[0];
      const y3 = q2[1] - q1[1];
      const det1 = (x1 * y3 - x3 * y1);
      const det2 = (x2 * y3 - x3 * y2);
      if ((det1 > 0 && det2 < 0) || (det1 < 0 && det2 > 0))
          return true;
      return false;
  }
  // a, b are end points for line segment1, c and d are end points for line segment2
  function lineIntersectLine(a, b, c, d) {
      // check if two segments are parallel or not
      // precondition is end point a, b is inside polygon, if line a->b is
      // parallel to polygon edge c->d, then a->b won't intersect with c->d
      const vectorP = [b[0] - a[0], b[1] - a[1]];
      const vectorQ = [d[0] - c[0], d[1] - c[1]];
      if (perp(vectorQ, vectorP) === 0)
          return false;
      // If lines are intersecting with each other, the relative location should be:
      // a and b lie in different sides of segment c->d
      // c and d lie in different sides of segment a->b
      if (twoSided(a, b, c, d) && twoSided(c, d, a, b))
          return true;
      return false;
  }
  function lineIntersectPolygon(p1, p2, polygon) {
      for (const ring of polygon) {
          // loop through every edge of the ring
          for (let j = 0; j < ring.length - 1; ++j) {
              if (lineIntersectLine(p1, p2, ring[j], ring[j + 1])) {
                  return true;
              }
          }
      }
      return false;
  }
  function lineStringWithinPolygon(line, polygon) {
      // First, check if geometry points of line segments are all inside polygon
      for (let i = 0; i < line.length; ++i) {
          if (!pointWithinPolygon(line[i], polygon)) {
              return false;
          }
      }
      // Second, check if there is line segment intersecting polygon edge
      for (let i = 0; i < line.length - 1; ++i) {
          if (lineIntersectPolygon(line[i], line[i + 1], polygon)) {
              return false;
          }
      }
      return true;
  }
  function lineStringWithinPolygons(line, polygons) {
      for (let i = 0; i < polygons.length; i++) {
          if (lineStringWithinPolygon(line, polygons[i]))
              return true;
      }
      return false;
  }
  function getTilePolygon(coordinates, bbox, canonical) {
      const polygon = [];
      for (let i = 0; i < coordinates.length; i++) {
          const ring = [];
          for (let j = 0; j < coordinates[i].length; j++) {
              const coord = getTileCoordinates(coordinates[i][j], canonical);
              updateBBox(bbox, coord);
              ring.push(coord);
          }
          polygon.push(ring);
      }
      return polygon;
  }
  function getTilePolygons(coordinates, bbox, canonical) {
      const polygons = [];
      for (let i = 0; i < coordinates.length; i++) {
          const polygon = getTilePolygon(coordinates[i], bbox, canonical);
          polygons.push(polygon);
      }
      return polygons;
  }
  function updatePoint(p, bbox, polyBBox, worldSize) {
      if (p[0] < polyBBox[0] || p[0] > polyBBox[2]) {
          const halfWorldSize = worldSize * 0.5;
          let shift = (p[0] - polyBBox[0] > halfWorldSize) ? -worldSize : (polyBBox[0] - p[0] > halfWorldSize) ? worldSize : 0;
          if (shift === 0) {
              shift = (p[0] - polyBBox[2] > halfWorldSize) ? -worldSize : (polyBBox[2] - p[0] > halfWorldSize) ? worldSize : 0;
          }
          p[0] += shift;
      }
      updateBBox(bbox, p);
  }
  function resetBBox(bbox) {
      bbox[0] = bbox[1] = Infinity;
      bbox[2] = bbox[3] = -Infinity;
  }
  function getTilePoints(geometry, pointBBox, polyBBox, canonical) {
      const worldSize = Math.pow(2, canonical.z) * EXTENT;
      const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
      const tilePoints = [];
      for (const points of geometry) {
          for (const point of points) {
              const p = [point.x + shifts[0], point.y + shifts[1]];
              updatePoint(p, pointBBox, polyBBox, worldSize);
              tilePoints.push(p);
          }
      }
      return tilePoints;
  }
  function getTileLines(geometry, lineBBox, polyBBox, canonical) {
      const worldSize = Math.pow(2, canonical.z) * EXTENT;
      const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
      const tileLines = [];
      for (const line of geometry) {
          const tileLine = [];
          for (const point of line) {
              const p = [point.x + shifts[0], point.y + shifts[1]];
              updateBBox(lineBBox, p);
              tileLine.push(p);
          }
          tileLines.push(tileLine);
      }
      if (lineBBox[2] - lineBBox[0] <= worldSize / 2) {
          resetBBox(lineBBox);
          for (const line of tileLines) {
              for (const p of line) {
                  updatePoint(p, lineBBox, polyBBox, worldSize);
              }
          }
      }
      return tileLines;
  }
  function pointsWithinPolygons(ctx, polygonGeometry) {
      const pointBBox = [Infinity, Infinity, -Infinity, -Infinity];
      const polyBBox = [Infinity, Infinity, -Infinity, -Infinity];
      const canonical = ctx.canonicalID();
      if (polygonGeometry.type === 'Polygon') {
          const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
          const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
          if (!boxWithinBox(pointBBox, polyBBox))
              return false;
          for (const point of tilePoints) {
              if (!pointWithinPolygon(point, tilePolygon))
                  return false;
          }
      }
      if (polygonGeometry.type === 'MultiPolygon') {
          const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
          const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
          if (!boxWithinBox(pointBBox, polyBBox))
              return false;
          for (const point of tilePoints) {
              if (!pointWithinPolygons(point, tilePolygons))
                  return false;
          }
      }
      return true;
  }
  function linesWithinPolygons(ctx, polygonGeometry) {
      const lineBBox = [Infinity, Infinity, -Infinity, -Infinity];
      const polyBBox = [Infinity, Infinity, -Infinity, -Infinity];
      const canonical = ctx.canonicalID();
      if (polygonGeometry.type === 'Polygon') {
          const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
          const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
          if (!boxWithinBox(lineBBox, polyBBox))
              return false;
          for (const line of tileLines) {
              if (!lineStringWithinPolygon(line, tilePolygon))
                  return false;
          }
      }
      if (polygonGeometry.type === 'MultiPolygon') {
          const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
          const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
          if (!boxWithinBox(lineBBox, polyBBox))
              return false;
          for (const line of tileLines) {
              if (!lineStringWithinPolygons(line, tilePolygons))
                  return false;
          }
      }
      return true;
  }
  class Within {
      constructor(geojson, geometries) {
          this.type = BooleanType;
          this.geojson = geojson;
          this.geometries = geometries;
      }
      static parse(args, context) {
          if (args.length !== 2)
              return context.error(`'within' expression requires exactly one argument, but found ${args.length - 1} instead.`);
          if (isValue(args[1])) {
              const geojson = args[1];
              if (geojson.type === 'FeatureCollection') {
                  for (let i = 0; i < geojson.features.length; ++i) {
                      const type = geojson.features[i].geometry.type;
                      if (type === 'Polygon' || type === 'MultiPolygon') {
                          return new Within(geojson, geojson.features[i].geometry);
                      }
                  }
              }
              else if (geojson.type === 'Feature') {
                  const type = geojson.geometry.type;
                  if (type === 'Polygon' || type === 'MultiPolygon') {
                      return new Within(geojson, geojson.geometry);
                  }
              }
              else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
                  return new Within(geojson, geojson);
              }
          }
          return context.error('\'within\' expression requires valid geojson object that contains polygon geometry type.');
      }
      evaluate(ctx) {
          if (ctx.geometry() != null && ctx.canonicalID() != null) {
              if (ctx.geometryType() === 'Point') {
                  return pointsWithinPolygons(ctx, this.geometries);
              }
              else if (ctx.geometryType() === 'LineString') {
                  return linesWithinPolygons(ctx, this.geometries);
              }
          }
          return false;
      }
      eachChild() { }
      outputDefined() {
          return true;
      }
  }

  class Var {
      constructor(name, boundExpression) {
          this.type = boundExpression.type;
          this.name = name;
          this.boundExpression = boundExpression;
      }
      static parse(args, context) {
          if (args.length !== 2 || typeof args[1] !== 'string')
              return context.error('\'var\' expression requires exactly one string literal argument.');
          const name = args[1];
          if (!context.scope.has(name)) {
              return context.error(`Unknown variable "${name}". Make sure "${name}" has been bound in an enclosing "let" expression before using it.`, 1);
          }
          return new Var(name, context.scope.get(name));
      }
      evaluate(ctx) {
          return this.boundExpression.evaluate(ctx);
      }
      eachChild() { }
      outputDefined() {
          return false;
      }
  }

  class CompoundExpression {
      constructor(name, type, evaluate, args) {
          this.name = name;
          this.type = type;
          this._evaluate = evaluate;
          this.args = args;
      }
      evaluate(ctx) {
          return this._evaluate(ctx, this.args);
      }
      eachChild(fn) {
          this.args.forEach(fn);
      }
      outputDefined() {
          return false;
      }
      static parse(args, context) {
          const op = args[0];
          const definition = CompoundExpression.definitions[op];
          if (!definition) {
              return context.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
          }
          // Now check argument types against each signature
          const type = Array.isArray(definition) ?
              definition[0] : definition.type;
          const availableOverloads = Array.isArray(definition) ?
              [[definition[1], definition[2]]] :
              definition.overloads;
          const overloads = availableOverloads.filter(([signature]) => (!Array.isArray(signature) || // varags
              signature.length === args.length - 1 // correct param count
          ));
          let signatureContext = null;
          for (const [params, evaluate] of overloads) {
              // Use a fresh context for each attempted signature so that, if
              // we eventually succeed, we haven't polluted `context.errors`.
              signatureContext = new ParsingContext(context.registry, isExpressionConstant, context.path, null, context.scope);
              // First parse all the args, potentially coercing to the
              // types expected by this overload.
              const parsedArgs = [];
              let argParseFailed = false;
              for (let i = 1; i < args.length; i++) {
                  const arg = args[i];
                  const expectedType = Array.isArray(params) ?
                      params[i - 1] :
                      params.type;
                  const parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
                  if (!parsed) {
                      argParseFailed = true;
                      break;
                  }
                  parsedArgs.push(parsed);
              }
              if (argParseFailed) {
                  // Couldn't coerce args of this overload to expected type, move
                  // on to next one.
                  continue;
              }
              if (Array.isArray(params)) {
                  if (params.length !== parsedArgs.length) {
                      signatureContext.error(`Expected ${params.length} arguments, but found ${parsedArgs.length} instead.`);
                      continue;
                  }
              }
              for (let i = 0; i < parsedArgs.length; i++) {
                  const expected = Array.isArray(params) ? params[i] : params.type;
                  const arg = parsedArgs[i];
                  signatureContext.concat(i + 1).checkSubtype(expected, arg.type);
              }
              if (signatureContext.errors.length === 0) {
                  return new CompoundExpression(op, type, evaluate, parsedArgs);
              }
          }
          if (overloads.length === 1) {
              context.errors.push(...signatureContext.errors);
          }
          else {
              const expected = overloads.length ? overloads : availableOverloads;
              const signatures = expected
                  .map(([params]) => stringifySignature(params))
                  .join(' | ');
              const actualTypes = [];
              // For error message, re-parse arguments without trying to
              // apply any coercions
              for (let i = 1; i < args.length; i++) {
                  const parsed = context.parse(args[i], 1 + actualTypes.length);
                  if (!parsed)
                      return null;
                  actualTypes.push(toString$1(parsed.type));
              }
              context.error(`Expected arguments of type ${signatures}, but found (${actualTypes.join(', ')}) instead.`);
          }
          return null;
      }
      static register(registry, definitions) {
          CompoundExpression.definitions = definitions;
          for (const name in definitions) {
              registry[name] = CompoundExpression;
          }
      }
  }
  function stringifySignature(signature) {
      if (Array.isArray(signature)) {
          return `(${signature.map(toString$1).join(', ')})`;
      }
      else {
          return `(${toString$1(signature.type)}...)`;
      }
  }
  function isExpressionConstant(expression) {
      if (expression instanceof Var) {
          return isExpressionConstant(expression.boundExpression);
      }
      else if (expression instanceof CompoundExpression && expression.name === 'error') {
          return false;
      }
      else if (expression instanceof CollatorExpression) {
          // Although the results of a Collator expression with fixed arguments
          // generally shouldn't change between executions, we can't serialize them
          // as constant expressions because results change based on environment.
          return false;
      }
      else if (expression instanceof Within) {
          return false;
      }
      const isTypeAnnotation = expression instanceof Coercion ||
          expression instanceof Assertion;
      let childrenConstant = true;
      expression.eachChild(child => {
          // We can _almost_ assume that if `expressions` children are constant,
          // they would already have been evaluated to Literal values when they
          // were parsed.  Type annotations are the exception, because they might
          // have been inferred and added after a child was parsed.
          // So we recurse into isConstant() for the children of type annotations,
          // but otherwise simply check whether they are Literals.
          if (isTypeAnnotation) {
              childrenConstant = childrenConstant && isExpressionConstant(child);
          }
          else {
              childrenConstant = childrenConstant && child instanceof Literal;
          }
      });
      if (!childrenConstant) {
          return false;
      }
      return isFeatureConstant(expression) &&
          isGlobalPropertyConstant(expression, ['zoom', 'heatmap-density', 'line-progress', 'accumulated', 'is-supported-script']);
  }
  function isFeatureConstant(e) {
      if (e instanceof CompoundExpression) {
          if (e.name === 'get' && e.args.length === 1) {
              return false;
          }
          else if (e.name === 'feature-state') {
              return false;
          }
          else if (e.name === 'has' && e.args.length === 1) {
              return false;
          }
          else if (e.name === 'properties' ||
              e.name === 'geometry-type' ||
              e.name === 'id') {
              return false;
          }
          else if (/^filter-/.test(e.name)) {
              return false;
          }
      }
      if (e instanceof Within) {
          return false;
      }
      let result = true;
      e.eachChild(arg => {
          if (result && !isFeatureConstant(arg)) {
              result = false;
          }
      });
      return result;
  }
  function isStateConstant(e) {
      if (e instanceof CompoundExpression) {
          if (e.name === 'feature-state') {
              return false;
          }
      }
      let result = true;
      e.eachChild(arg => {
          if (result && !isStateConstant(arg)) {
              result = false;
          }
      });
      return result;
  }
  function isGlobalPropertyConstant(e, properties) {
      if (e instanceof CompoundExpression && properties.indexOf(e.name) >= 0) {
          return false;
      }
      let result = true;
      e.eachChild((arg) => {
          if (result && !isGlobalPropertyConstant(arg, properties)) {
              result = false;
          }
      });
      return result;
  }

  /**
   * Returns the index of the last stop <= input, or 0 if it doesn't exist.
   * @private
   */
  function findStopLessThanOrEqualTo(stops, input) {
      const lastIndex = stops.length - 1;
      let lowerIndex = 0;
      let upperIndex = lastIndex;
      let currentIndex = 0;
      let currentValue, nextValue;
      while (lowerIndex <= upperIndex) {
          currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
          currentValue = stops[currentIndex];
          nextValue = stops[currentIndex + 1];
          if (currentValue <= input) {
              if (currentIndex === lastIndex || input < nextValue) { // Search complete
                  return currentIndex;
              }
              lowerIndex = currentIndex + 1;
          }
          else if (currentValue > input) {
              upperIndex = currentIndex - 1;
          }
          else {
              throw new RuntimeError('Input is not a number.');
          }
      }
      return 0;
  }

  class Step {
      constructor(type, input, stops) {
          this.type = type;
          this.input = input;
          this.labels = [];
          this.outputs = [];
          for (const [label, expression] of stops) {
              this.labels.push(label);
              this.outputs.push(expression);
          }
      }
      static parse(args, context) {
          if (args.length - 1 < 4) {
              return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          }
          if ((args.length - 1) % 2 !== 0) {
              return context.error('Expected an even number of arguments.');
          }
          const input = context.parse(args[1], 1, NumberType);
          if (!input)
              return null;
          const stops = [];
          let outputType = null;
          if (context.expectedType && context.expectedType.kind !== 'value') {
              outputType = context.expectedType;
          }
          for (let i = 1; i < args.length; i += 2) {
              const label = i === 1 ? -Infinity : args[i];
              const value = args[i + 1];
              const labelKey = i;
              const valueKey = i + 1;
              if (typeof label !== 'number') {
                  return context.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
              }
              if (stops.length && stops[stops.length - 1][0] >= label) {
                  return context.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.', labelKey);
              }
              const parsed = context.parse(value, valueKey, outputType);
              if (!parsed)
                  return null;
              outputType = outputType || parsed.type;
              stops.push([label, parsed]);
          }
          return new Step(outputType, input, stops);
      }
      evaluate(ctx) {
          const labels = this.labels;
          const outputs = this.outputs;
          if (labels.length === 1) {
              return outputs[0].evaluate(ctx);
          }
          const value = this.input.evaluate(ctx);
          if (value <= labels[0]) {
              return outputs[0].evaluate(ctx);
          }
          const stopCount = labels.length;
          if (value >= labels[stopCount - 1]) {
              return outputs[stopCount - 1].evaluate(ctx);
          }
          const index = findStopLessThanOrEqualTo(labels, value);
          return outputs[index].evaluate(ctx);
      }
      eachChild(fn) {
          fn(this.input);
          for (const expression of this.outputs) {
              fn(expression);
          }
      }
      outputDefined() {
          return this.outputs.every(out => out.outputDefined());
      }
  }

  function number(a, b, t) {
      return (a * (1 - t)) + (b * t);
  }
  function color(from, to, t) {
      return new Color(number(from.r, to.r, t), number(from.g, to.g, t), number(from.b, to.b, t), number(from.a, to.a, t));
  }
  function array(from, to, t) {
      return from.map((d, i) => {
          return number(d, to[i], t);
      });
  }
  function padding(from, to, t) {
      const fromVal = from.values;
      const toVal = to.values;
      return new Padding([
          number(fromVal[0], toVal[0], t),
          number(fromVal[1], toVal[1], t),
          number(fromVal[2], toVal[2], t),
          number(fromVal[3], toVal[3], t)
      ]);
  }

  var interpolate = /*#__PURE__*/Object.freeze({
    __proto__: null,
    array: array,
    color: color,
    number: number,
    padding: padding
  });

  // Constants
  const Xn = 0.950470, // D65 standard referent
  Yn = 1, Zn = 1.088830, t0 = 4 / 29, t1 = 6 / 29, t2 = 3 * t1 * t1, t3 = t1 * t1 * t1, deg2rad = Math.PI / 180, rad2deg = 180 / Math.PI;
  // Utilities
  function xyz2lab(t) {
      return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }
  function lab2xyz(t) {
      return t > t1 ? t * t * t : t2 * (t - t0);
  }
  function xyz2rgb(x) {
      return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }
  function rgb2xyz(x) {
      x /= 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  // LAB
  function rgbToLab(rgbColor) {
      const b = rgb2xyz(rgbColor.r), a = rgb2xyz(rgbColor.g), l = rgb2xyz(rgbColor.b), x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn), y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn), z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
      return {
          l: 116 * y - 16,
          a: 500 * (x - y),
          b: 200 * (y - z),
          alpha: rgbColor.a
      };
  }
  function labToRgb(labColor) {
      let y = (labColor.l + 16) / 116, x = isNaN(labColor.a) ? y : y + labColor.a / 500, z = isNaN(labColor.b) ? y : y - labColor.b / 200;
      y = Yn * lab2xyz(y);
      x = Xn * lab2xyz(x);
      z = Zn * lab2xyz(z);
      return new Color(xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z), xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z), labColor.alpha);
  }
  function interpolateLab(from, to, t) {
      return {
          l: number(from.l, to.l, t),
          a: number(from.a, to.a, t),
          b: number(from.b, to.b, t),
          alpha: number(from.alpha, to.alpha, t)
      };
  }
  // HCL
  function rgbToHcl(rgbColor) {
      const { l, a, b } = rgbToLab(rgbColor);
      const h = Math.atan2(b, a) * rad2deg;
      return {
          h: h < 0 ? h + 360 : h,
          c: Math.sqrt(a * a + b * b),
          l,
          alpha: rgbColor.a
      };
  }
  function hclToRgb(hclColor) {
      const h = hclColor.h * deg2rad, c = hclColor.c, l = hclColor.l;
      return labToRgb({
          l,
          a: Math.cos(h) * c,
          b: Math.sin(h) * c,
          alpha: hclColor.alpha
      });
  }
  function interpolateHue(a, b, t) {
      const d = b - a;
      return a + t * (d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d);
  }
  function interpolateHcl(from, to, t) {
      return {
          h: interpolateHue(from.h, to.h, t),
          c: number(from.c, to.c, t),
          l: number(from.l, to.l, t),
          alpha: number(from.alpha, to.alpha, t)
      };
  }
  const lab = {
      forward: rgbToLab,
      reverse: labToRgb,
      interpolate: interpolateLab
  };
  const hcl = {
      forward: rgbToHcl,
      reverse: hclToRgb,
      interpolate: interpolateHcl
  };

  var colorSpaces = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hcl: hcl,
    lab: lab
  });

  class Interpolate {
      constructor(type, operator, interpolation, input, stops) {
          this.type = type;
          this.operator = operator;
          this.interpolation = interpolation;
          this.input = input;
          this.labels = [];
          this.outputs = [];
          for (const [label, expression] of stops) {
              this.labels.push(label);
              this.outputs.push(expression);
          }
      }
      static interpolationFactor(interpolation, input, lower, upper) {
          let t = 0;
          if (interpolation.name === 'exponential') {
              t = exponentialInterpolation(input, interpolation.base, lower, upper);
          }
          else if (interpolation.name === 'linear') {
              t = exponentialInterpolation(input, 1, lower, upper);
          }
          else if (interpolation.name === 'cubic-bezier') {
              const c = interpolation.controlPoints;
              const ub = new UnitBezier(c[0], c[1], c[2], c[3]);
              t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
          }
          return t;
      }
      static parse(args, context) {
          let [operator, interpolation, input, ...rest] = args;
          if (!Array.isArray(interpolation) || interpolation.length === 0) {
              return context.error('Expected an interpolation type expression.', 1);
          }
          if (interpolation[0] === 'linear') {
              interpolation = { name: 'linear' };
          }
          else if (interpolation[0] === 'exponential') {
              const base = interpolation[1];
              if (typeof base !== 'number')
                  return context.error('Exponential interpolation requires a numeric base.', 1, 1);
              interpolation = {
                  name: 'exponential',
                  base
              };
          }
          else if (interpolation[0] === 'cubic-bezier') {
              const controlPoints = interpolation.slice(1);
              if (controlPoints.length !== 4 ||
                  controlPoints.some(t => typeof t !== 'number' || t < 0 || t > 1)) {
                  return context.error('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.', 1);
              }
              interpolation = {
                  name: 'cubic-bezier',
                  controlPoints: controlPoints
              };
          }
          else {
              return context.error(`Unknown interpolation type ${String(interpolation[0])}`, 1, 0);
          }
          if (args.length - 1 < 4) {
              return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          }
          if ((args.length - 1) % 2 !== 0) {
              return context.error('Expected an even number of arguments.');
          }
          input = context.parse(input, 2, NumberType);
          if (!input)
              return null;
          const stops = [];
          let outputType = null;
          if (operator === 'interpolate-hcl' || operator === 'interpolate-lab') {
              outputType = ColorType;
          }
          else if (context.expectedType && context.expectedType.kind !== 'value') {
              outputType = context.expectedType;
          }
          for (let i = 0; i < rest.length; i += 2) {
              const label = rest[i];
              const value = rest[i + 1];
              const labelKey = i + 3;
              const valueKey = i + 4;
              if (typeof label !== 'number') {
                  return context.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
              }
              if (stops.length && stops[stops.length - 1][0] >= label) {
                  return context.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.', labelKey);
              }
              const parsed = context.parse(value, valueKey, outputType);
              if (!parsed)
                  return null;
              outputType = outputType || parsed.type;
              stops.push([label, parsed]);
          }
          if (outputType.kind !== 'number' &&
              outputType.kind !== 'color' &&
              outputType.kind !== 'padding' &&
              !(outputType.kind === 'array' &&
                  outputType.itemType.kind === 'number' &&
                  typeof outputType.N === 'number')) {
              return context.error(`Type ${toString$1(outputType)} is not interpolatable.`);
          }
          return new Interpolate(outputType, operator, interpolation, input, stops);
      }
      evaluate(ctx) {
          const labels = this.labels;
          const outputs = this.outputs;
          if (labels.length === 1) {
              return outputs[0].evaluate(ctx);
          }
          const value = this.input.evaluate(ctx);
          if (value <= labels[0]) {
              return outputs[0].evaluate(ctx);
          }
          const stopCount = labels.length;
          if (value >= labels[stopCount - 1]) {
              return outputs[stopCount - 1].evaluate(ctx);
          }
          const index = findStopLessThanOrEqualTo(labels, value);
          const lower = labels[index];
          const upper = labels[index + 1];
          const t = Interpolate.interpolationFactor(this.interpolation, value, lower, upper);
          const outputLower = outputs[index].evaluate(ctx);
          const outputUpper = outputs[index + 1].evaluate(ctx);
          if (this.operator === 'interpolate') {
              return interpolate[this.type.kind.toLowerCase()](outputLower, outputUpper, t); // eslint-disable-line import/namespace
          }
          else if (this.operator === 'interpolate-hcl') {
              return hcl.reverse(hcl.interpolate(hcl.forward(outputLower), hcl.forward(outputUpper), t));
          }
          else {
              return lab.reverse(lab.interpolate(lab.forward(outputLower), lab.forward(outputUpper), t));
          }
      }
      eachChild(fn) {
          fn(this.input);
          for (const expression of this.outputs) {
              fn(expression);
          }
      }
      outputDefined() {
          return this.outputs.every(out => out.outputDefined());
      }
  }
  /**
   * Returns a ratio that can be used to interpolate between exponential function
   * stops.
   * How it works: Two consecutive stop values define a (scaled and shifted) exponential function `f(x) = a * base^x + b`, where `base` is the user-specified base,
   * and `a` and `b` are constants affording sufficient degrees of freedom to fit
   * the function to the given stops.
   *
   * Here's a bit of algebra that lets us compute `f(x)` directly from the stop
   * values without explicitly solving for `a` and `b`:
   *
   * First stop value: `f(x0) = y0 = a * base^x0 + b`
   * Second stop value: `f(x1) = y1 = a * base^x1 + b`
   * => `y1 - y0 = a(base^x1 - base^x0)`
   * => `a = (y1 - y0)/(base^x1 - base^x0)`
   *
   * Desired value: `f(x) = y = a * base^x + b`
   * => `f(x) = y0 + a * (base^x - base^x0)`
   *
   * From the above, we can replace the `a` in `a * (base^x - base^x0)` and do a
   * little algebra:
   * ```
   * a * (base^x - base^x0) = (y1 - y0)/(base^x1 - base^x0) * (base^x - base^x0)
   *                     = (y1 - y0) * (base^x - base^x0) / (base^x1 - base^x0)
   * ```
   *
   * If we let `(base^x - base^x0) / (base^x1 base^x0)`, then we have
   * `f(x) = y0 + (y1 - y0) * ratio`.  In other words, `ratio` may be treated as
   * an interpolation factor between the two stops' output values.
   *
   * (Note: a slightly different form for `ratio`,
   * `(base^(x-x0) - 1) / (base^(x1-x0) - 1) `, is equivalent, but requires fewer
   * expensive `Math.pow()` operations.)
   *
   * @private
  */
  function exponentialInterpolation(input, base, lowerValue, upperValue) {
      const difference = upperValue - lowerValue;
      const progress = input - lowerValue;
      if (difference === 0) {
          return 0;
      }
      else if (base === 1) {
          return progress / difference;
      }
      else {
          return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
      }
  }

  class Coalesce {
      constructor(type, args) {
          this.type = type;
          this.args = args;
      }
      static parse(args, context) {
          if (args.length < 2) {
              return context.error('Expectected at least one argument.');
          }
          let outputType = null;
          const expectedType = context.expectedType;
          if (expectedType && expectedType.kind !== 'value') {
              outputType = expectedType;
          }
          const parsedArgs = [];
          for (const arg of args.slice(1)) {
              const parsed = context.parse(arg, 1 + parsedArgs.length, outputType, undefined, { typeAnnotation: 'omit' });
              if (!parsed)
                  return null;
              outputType = outputType || parsed.type;
              parsedArgs.push(parsed);
          }
          if (!outputType)
              throw new Error('No output type');
          // Above, we parse arguments without inferred type annotation so that
          // they don't produce a runtime error for `null` input, which would
          // preempt the desired null-coalescing behavior.
          // Thus, if any of our arguments would have needed an annotation, we
          // need to wrap the enclosing coalesce expression with it instead.
          const needsAnnotation = expectedType &&
              parsedArgs.some(arg => checkSubtype(expectedType, arg.type));
          return needsAnnotation ?
              new Coalesce(ValueType, parsedArgs) :
              new Coalesce(outputType, parsedArgs);
      }
      evaluate(ctx) {
          let result = null;
          let argCount = 0;
          let requestedImageName;
          for (const arg of this.args) {
              argCount++;
              result = arg.evaluate(ctx);
              // we need to keep track of the first requested image in a coalesce statement
              // if coalesce can't find a valid image, we return the first image name so styleimagemissing can fire
              if (result && result instanceof ResolvedImage && !result.available) {
                  if (!requestedImageName) {
                      requestedImageName = result.name;
                  }
                  result = null;
                  if (argCount === this.args.length) {
                      result = requestedImageName;
                  }
              }
              if (result !== null)
                  break;
          }
          return result;
      }
      eachChild(fn) {
          this.args.forEach(fn);
      }
      outputDefined() {
          return this.args.every(arg => arg.outputDefined());
      }
  }

  class Let {
      constructor(bindings, result) {
          this.type = result.type;
          this.bindings = [].concat(bindings);
          this.result = result;
      }
      evaluate(ctx) {
          return this.result.evaluate(ctx);
      }
      eachChild(fn) {
          for (const binding of this.bindings) {
              fn(binding[1]);
          }
          fn(this.result);
      }
      static parse(args, context) {
          if (args.length < 4)
              return context.error(`Expected at least 3 arguments, but found ${args.length - 1} instead.`);
          const bindings = [];
          for (let i = 1; i < args.length - 1; i += 2) {
              const name = args[i];
              if (typeof name !== 'string') {
                  return context.error(`Expected string, but found ${typeof name} instead.`, i);
              }
              if (/[^a-zA-Z0-9_]/.test(name)) {
                  return context.error('Variable names must contain only alphanumeric characters or \'_\'.', i);
              }
              const value = context.parse(args[i + 1], i + 1);
              if (!value)
                  return null;
              bindings.push([name, value]);
          }
          const result = context.parse(args[args.length - 1], args.length - 1, context.expectedType, bindings);
          if (!result)
              return null;
          return new Let(bindings, result);
      }
      outputDefined() {
          return this.result.outputDefined();
      }
  }

  class At {
      constructor(type, index, input) {
          this.type = type;
          this.index = index;
          this.input = input;
      }
      static parse(args, context) {
          if (args.length !== 3)
              return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
          const index = context.parse(args[1], 1, NumberType);
          const input = context.parse(args[2], 2, array$1(context.expectedType || ValueType));
          if (!index || !input)
              return null;
          const t = input.type;
          return new At(t.itemType, index, input);
      }
      evaluate(ctx) {
          const index = this.index.evaluate(ctx);
          const array = this.input.evaluate(ctx);
          if (index < 0) {
              throw new RuntimeError(`Array index out of bounds: ${index} < 0.`);
          }
          if (index >= array.length) {
              throw new RuntimeError(`Array index out of bounds: ${index} > ${array.length - 1}.`);
          }
          if (index !== Math.floor(index)) {
              throw new RuntimeError(`Array index must be an integer, but found ${index} instead.`);
          }
          return array[index];
      }
      eachChild(fn) {
          fn(this.index);
          fn(this.input);
      }
      outputDefined() {
          return false;
      }
  }

  class In {
      constructor(needle, haystack) {
          this.type = BooleanType;
          this.needle = needle;
          this.haystack = haystack;
      }
      static parse(args, context) {
          if (args.length !== 3) {
              return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
          }
          const needle = context.parse(args[1], 1, ValueType);
          const haystack = context.parse(args[2], 2, ValueType);
          if (!needle || !haystack)
              return null;
          if (!isValidType(needle.type, [BooleanType, StringType, NumberType, NullType, ValueType])) {
              return context.error(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(needle.type)} instead`);
          }
          return new In(needle, haystack);
      }
      evaluate(ctx) {
          const needle = this.needle.evaluate(ctx);
          const haystack = this.haystack.evaluate(ctx);
          if (!haystack)
              return false;
          if (!isValidNativeType(needle, ['boolean', 'string', 'number', 'null'])) {
              throw new RuntimeError(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(typeOf(needle))} instead.`);
          }
          if (!isValidNativeType(haystack, ['string', 'array'])) {
              throw new RuntimeError(`Expected second argument to be of type array or string, but found ${toString$1(typeOf(haystack))} instead.`);
          }
          return haystack.indexOf(needle) >= 0;
      }
      eachChild(fn) {
          fn(this.needle);
          fn(this.haystack);
      }
      outputDefined() {
          return true;
      }
  }

  class IndexOf {
      constructor(needle, haystack, fromIndex) {
          this.type = NumberType;
          this.needle = needle;
          this.haystack = haystack;
          this.fromIndex = fromIndex;
      }
      static parse(args, context) {
          if (args.length <= 2 || args.length >= 5) {
              return context.error(`Expected 3 or 4 arguments, but found ${args.length - 1} instead.`);
          }
          const needle = context.parse(args[1], 1, ValueType);
          const haystack = context.parse(args[2], 2, ValueType);
          if (!needle || !haystack)
              return null;
          if (!isValidType(needle.type, [BooleanType, StringType, NumberType, NullType, ValueType])) {
              return context.error(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(needle.type)} instead`);
          }
          if (args.length === 4) {
              const fromIndex = context.parse(args[3], 3, NumberType);
              if (!fromIndex)
                  return null;
              return new IndexOf(needle, haystack, fromIndex);
          }
          else {
              return new IndexOf(needle, haystack);
          }
      }
      evaluate(ctx) {
          const needle = this.needle.evaluate(ctx);
          const haystack = this.haystack.evaluate(ctx);
          if (!isValidNativeType(needle, ['boolean', 'string', 'number', 'null'])) {
              throw new RuntimeError(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(typeOf(needle))} instead.`);
          }
          if (!isValidNativeType(haystack, ['string', 'array'])) {
              throw new RuntimeError(`Expected second argument to be of type array or string, but found ${toString$1(typeOf(haystack))} instead.`);
          }
          if (this.fromIndex) {
              const fromIndex = this.fromIndex.evaluate(ctx);
              return haystack.indexOf(needle, fromIndex);
          }
          return haystack.indexOf(needle);
      }
      eachChild(fn) {
          fn(this.needle);
          fn(this.haystack);
          if (this.fromIndex) {
              fn(this.fromIndex);
          }
      }
      outputDefined() {
          return false;
      }
  }

  class Match {
      constructor(inputType, outputType, input, cases, outputs, otherwise) {
          this.inputType = inputType;
          this.type = outputType;
          this.input = input;
          this.cases = cases;
          this.outputs = outputs;
          this.otherwise = otherwise;
      }
      static parse(args, context) {
          if (args.length < 5)
              return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          if (args.length % 2 !== 1)
              return context.error('Expected an even number of arguments.');
          let inputType;
          let outputType;
          if (context.expectedType && context.expectedType.kind !== 'value') {
              outputType = context.expectedType;
          }
          const cases = {};
          const outputs = [];
          for (let i = 2; i < args.length - 1; i += 2) {
              let labels = args[i];
              const value = args[i + 1];
              if (!Array.isArray(labels)) {
                  labels = [labels];
              }
              const labelContext = context.concat(i);
              if (labels.length === 0) {
                  return labelContext.error('Expected at least one branch label.');
              }
              for (const label of labels) {
                  if (typeof label !== 'number' && typeof label !== 'string') {
                      return labelContext.error('Branch labels must be numbers or strings.');
                  }
                  else if (typeof label === 'number' && Math.abs(label) > Number.MAX_SAFE_INTEGER) {
                      return labelContext.error(`Branch labels must be integers no larger than ${Number.MAX_SAFE_INTEGER}.`);
                  }
                  else if (typeof label === 'number' && Math.floor(label) !== label) {
                      return labelContext.error('Numeric branch labels must be integer values.');
                  }
                  else if (!inputType) {
                      inputType = typeOf(label);
                  }
                  else if (labelContext.checkSubtype(inputType, typeOf(label))) {
                      return null;
                  }
                  if (typeof cases[String(label)] !== 'undefined') {
                      return labelContext.error('Branch labels must be unique.');
                  }
                  cases[String(label)] = outputs.length;
              }
              const result = context.parse(value, i, outputType);
              if (!result)
                  return null;
              outputType = outputType || result.type;
              outputs.push(result);
          }
          const input = context.parse(args[1], 1, ValueType);
          if (!input)
              return null;
          const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
          if (!otherwise)
              return null;
          if (input.type.kind !== 'value' && context.concat(1).checkSubtype(inputType, input.type)) {
              return null;
          }
          return new Match(inputType, outputType, input, cases, outputs, otherwise);
      }
      evaluate(ctx) {
          const input = this.input.evaluate(ctx);
          const output = (typeOf(input) === this.inputType && this.outputs[this.cases[input]]) || this.otherwise;
          return output.evaluate(ctx);
      }
      eachChild(fn) {
          fn(this.input);
          this.outputs.forEach(fn);
          fn(this.otherwise);
      }
      outputDefined() {
          return this.outputs.every(out => out.outputDefined()) && this.otherwise.outputDefined();
      }
  }

  class Case {
      constructor(type, branches, otherwise) {
          this.type = type;
          this.branches = branches;
          this.otherwise = otherwise;
      }
      static parse(args, context) {
          if (args.length < 4)
              return context.error(`Expected at least 3 arguments, but found only ${args.length - 1}.`);
          if (args.length % 2 !== 0)
              return context.error('Expected an odd number of arguments.');
          let outputType;
          if (context.expectedType && context.expectedType.kind !== 'value') {
              outputType = context.expectedType;
          }
          const branches = [];
          for (let i = 1; i < args.length - 1; i += 2) {
              const test = context.parse(args[i], i, BooleanType);
              if (!test)
                  return null;
              const result = context.parse(args[i + 1], i + 1, outputType);
              if (!result)
                  return null;
              branches.push([test, result]);
              outputType = outputType || result.type;
          }
          const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
          if (!otherwise)
              return null;
          if (!outputType)
              throw new Error('Can\'t infer output type');
          return new Case(outputType, branches, otherwise);
      }
      evaluate(ctx) {
          for (const [test, expression] of this.branches) {
              if (test.evaluate(ctx)) {
                  return expression.evaluate(ctx);
              }
          }
          return this.otherwise.evaluate(ctx);
      }
      eachChild(fn) {
          for (const [test, expression] of this.branches) {
              fn(test);
              fn(expression);
          }
          fn(this.otherwise);
      }
      outputDefined() {
          return this.branches.every(([_, out]) => out.outputDefined()) && this.otherwise.outputDefined();
      }
  }

  class Slice {
      constructor(type, input, beginIndex, endIndex) {
          this.type = type;
          this.input = input;
          this.beginIndex = beginIndex;
          this.endIndex = endIndex;
      }
      static parse(args, context) {
          if (args.length <= 2 || args.length >= 5) {
              return context.error(`Expected 3 or 4 arguments, but found ${args.length - 1} instead.`);
          }
          const input = context.parse(args[1], 1, ValueType);
          const beginIndex = context.parse(args[2], 2, NumberType);
          if (!input || !beginIndex)
              return null;
          if (!isValidType(input.type, [array$1(ValueType), StringType, ValueType])) {
              return context.error(`Expected first argument to be of type array or string, but found ${toString$1(input.type)} instead`);
          }
          if (args.length === 4) {
              const endIndex = context.parse(args[3], 3, NumberType);
              if (!endIndex)
                  return null;
              return new Slice(input.type, input, beginIndex, endIndex);
          }
          else {
              return new Slice(input.type, input, beginIndex);
          }
      }
      evaluate(ctx) {
          const input = this.input.evaluate(ctx);
          const beginIndex = this.beginIndex.evaluate(ctx);
          if (!isValidNativeType(input, ['string', 'array'])) {
              throw new RuntimeError(`Expected first argument to be of type array or string, but found ${toString$1(typeOf(input))} instead.`);
          }
          if (this.endIndex) {
              const endIndex = this.endIndex.evaluate(ctx);
              return input.slice(beginIndex, endIndex);
          }
          return input.slice(beginIndex);
      }
      eachChild(fn) {
          fn(this.input);
          fn(this.beginIndex);
          if (this.endIndex) {
              fn(this.endIndex);
          }
      }
      outputDefined() {
          return false;
      }
  }

  function isComparableType(op, type) {
      if (op === '==' || op === '!=') {
          // equality operator
          return type.kind === 'boolean' ||
              type.kind === 'string' ||
              type.kind === 'number' ||
              type.kind === 'null' ||
              type.kind === 'value';
      }
      else {
          // ordering operator
          return type.kind === 'string' ||
              type.kind === 'number' ||
              type.kind === 'value';
      }
  }
  function eq(ctx, a, b) { return a === b; }
  function neq(ctx, a, b) { return a !== b; }
  function lt(ctx, a, b) { return a < b; }
  function gt(ctx, a, b) { return a > b; }
  function lteq(ctx, a, b) { return a <= b; }
  function gteq(ctx, a, b) { return a >= b; }
  function eqCollate(ctx, a, b, c) { return c.compare(a, b) === 0; }
  function neqCollate(ctx, a, b, c) { return !eqCollate(ctx, a, b, c); }
  function ltCollate(ctx, a, b, c) { return c.compare(a, b) < 0; }
  function gtCollate(ctx, a, b, c) { return c.compare(a, b) > 0; }
  function lteqCollate(ctx, a, b, c) { return c.compare(a, b) <= 0; }
  function gteqCollate(ctx, a, b, c) { return c.compare(a, b) >= 0; }
  /**
   * Special form for comparison operators, implementing the signatures:
   * - (T, T, ?Collator) => boolean
   * - (T, value, ?Collator) => boolean
   * - (value, T, ?Collator) => boolean
   *
   * For inequalities, T must be either value, string, or number. For ==/!=, it
   * can also be boolean or null.
   *
   * Equality semantics are equivalent to Javascript's strict equality (===/!==)
   * -- i.e., when the arguments' types don't match, == evaluates to false, != to
   * true.
   *
   * When types don't match in an ordering comparison, a runtime error is thrown.
   *
   * @private
   */
  function makeComparison(op, compareBasic, compareWithCollator) {
      const isOrderComparison = op !== '==' && op !== '!=';
      return class Comparison {
          constructor(lhs, rhs, collator) {
              this.type = BooleanType;
              this.lhs = lhs;
              this.rhs = rhs;
              this.collator = collator;
              this.hasUntypedArgument = lhs.type.kind === 'value' || rhs.type.kind === 'value';
          }
          static parse(args, context) {
              if (args.length !== 3 && args.length !== 4)
                  return context.error('Expected two or three arguments.');
              const op = args[0];
              let lhs = context.parse(args[1], 1, ValueType);
              if (!lhs)
                  return null;
              if (!isComparableType(op, lhs.type)) {
                  return context.concat(1).error(`"${op}" comparisons are not supported for type '${toString$1(lhs.type)}'.`);
              }
              let rhs = context.parse(args[2], 2, ValueType);
              if (!rhs)
                  return null;
              if (!isComparableType(op, rhs.type)) {
                  return context.concat(2).error(`"${op}" comparisons are not supported for type '${toString$1(rhs.type)}'.`);
              }
              if (lhs.type.kind !== rhs.type.kind &&
                  lhs.type.kind !== 'value' &&
                  rhs.type.kind !== 'value') {
                  return context.error(`Cannot compare types '${toString$1(lhs.type)}' and '${toString$1(rhs.type)}'.`);
              }
              if (isOrderComparison) {
                  // typing rules specific to less/greater than operators
                  if (lhs.type.kind === 'value' && rhs.type.kind !== 'value') {
                      // (value, T)
                      lhs = new Assertion(rhs.type, [lhs]);
                  }
                  else if (lhs.type.kind !== 'value' && rhs.type.kind === 'value') {
                      // (T, value)
                      rhs = new Assertion(lhs.type, [rhs]);
                  }
              }
              let collator = null;
              if (args.length === 4) {
                  if (lhs.type.kind !== 'string' &&
                      rhs.type.kind !== 'string' &&
                      lhs.type.kind !== 'value' &&
                      rhs.type.kind !== 'value') {
                      return context.error('Cannot use collator to compare non-string types.');
                  }
                  collator = context.parse(args[3], 3, CollatorType);
                  if (!collator)
                      return null;
              }
              return new Comparison(lhs, rhs, collator);
          }
          evaluate(ctx) {
              const lhs = this.lhs.evaluate(ctx);
              const rhs = this.rhs.evaluate(ctx);
              if (isOrderComparison && this.hasUntypedArgument) {
                  const lt = typeOf(lhs);
                  const rt = typeOf(rhs);
                  // check that type is string or number, and equal
                  if (lt.kind !== rt.kind || !(lt.kind === 'string' || lt.kind === 'number')) {
                      throw new RuntimeError(`Expected arguments for "${op}" to be (string, string) or (number, number), but found (${lt.kind}, ${rt.kind}) instead.`);
                  }
              }
              if (this.collator && !isOrderComparison && this.hasUntypedArgument) {
                  const lt = typeOf(lhs);
                  const rt = typeOf(rhs);
                  if (lt.kind !== 'string' || rt.kind !== 'string') {
                      return compareBasic(ctx, lhs, rhs);
                  }
              }
              return this.collator ?
                  compareWithCollator(ctx, lhs, rhs, this.collator.evaluate(ctx)) :
                  compareBasic(ctx, lhs, rhs);
          }
          eachChild(fn) {
              fn(this.lhs);
              fn(this.rhs);
              if (this.collator) {
                  fn(this.collator);
              }
          }
          outputDefined() {
              return true;
          }
      };
  }
  const Equals = makeComparison('==', eq, eqCollate);
  const NotEquals = makeComparison('!=', neq, neqCollate);
  const LessThan = makeComparison('<', lt, ltCollate);
  const GreaterThan = makeComparison('>', gt, gtCollate);
  const LessThanOrEqual = makeComparison('<=', lteq, lteqCollate);
  const GreaterThanOrEqual = makeComparison('>=', gteq, gteqCollate);

  class NumberFormat {
      constructor(number, locale, currency, minFractionDigits, maxFractionDigits) {
          this.type = StringType;
          this.number = number;
          this.locale = locale;
          this.currency = currency;
          this.minFractionDigits = minFractionDigits;
          this.maxFractionDigits = maxFractionDigits;
      }
      static parse(args, context) {
          if (args.length !== 3)
              return context.error('Expected two arguments.');
          const number = context.parse(args[1], 1, NumberType);
          if (!number)
              return null;
          const options = args[2];
          if (typeof options !== 'object' || Array.isArray(options))
              return context.error('NumberFormat options argument must be an object.');
          let locale = null;
          if (options['locale']) {
              locale = context.parse(options['locale'], 1, StringType);
              if (!locale)
                  return null;
          }
          let currency = null;
          if (options['currency']) {
              currency = context.parse(options['currency'], 1, StringType);
              if (!currency)
                  return null;
          }
          let minFractionDigits = null;
          if (options['min-fraction-digits']) {
              minFractionDigits = context.parse(options['min-fraction-digits'], 1, NumberType);
              if (!minFractionDigits)
                  return null;
          }
          let maxFractionDigits = null;
          if (options['max-fraction-digits']) {
              maxFractionDigits = context.parse(options['max-fraction-digits'], 1, NumberType);
              if (!maxFractionDigits)
                  return null;
          }
          return new NumberFormat(number, locale, currency, minFractionDigits, maxFractionDigits);
      }
      evaluate(ctx) {
          return new Intl.NumberFormat(this.locale ? this.locale.evaluate(ctx) : [], {
              style: this.currency ? 'currency' : 'decimal',
              currency: this.currency ? this.currency.evaluate(ctx) : undefined,
              minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(ctx) : undefined,
              maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(ctx) : undefined,
          }).format(this.number.evaluate(ctx));
      }
      eachChild(fn) {
          fn(this.number);
          if (this.locale) {
              fn(this.locale);
          }
          if (this.currency) {
              fn(this.currency);
          }
          if (this.minFractionDigits) {
              fn(this.minFractionDigits);
          }
          if (this.maxFractionDigits) {
              fn(this.maxFractionDigits);
          }
      }
      outputDefined() {
          return false;
      }
  }

  class FormatExpression {
      constructor(sections) {
          this.type = FormattedType;
          this.sections = sections;
      }
      static parse(args, context) {
          if (args.length < 2) {
              return context.error('Expected at least one argument.');
          }
          const firstArg = args[1];
          if (!Array.isArray(firstArg) && typeof firstArg === 'object') {
              return context.error('First argument must be an image or text section.');
          }
          const sections = [];
          let nextTokenMayBeObject = false;
          for (let i = 1; i <= args.length - 1; ++i) {
              const arg = args[i];
              if (nextTokenMayBeObject && typeof arg === 'object' && !Array.isArray(arg)) {
                  nextTokenMayBeObject = false;
                  let scale = null;
                  if (arg['font-scale']) {
                      scale = context.parse(arg['font-scale'], 1, NumberType);
                      if (!scale)
                          return null;
                  }
                  let font = null;
                  if (arg['text-font']) {
                      font = context.parse(arg['text-font'], 1, array$1(StringType));
                      if (!font)
                          return null;
                  }
                  let textColor = null;
                  if (arg['text-color']) {
                      textColor = context.parse(arg['text-color'], 1, ColorType);
                      if (!textColor)
                          return null;
                  }
                  const lastExpression = sections[sections.length - 1];
                  lastExpression.scale = scale;
                  lastExpression.font = font;
                  lastExpression.textColor = textColor;
              }
              else {
                  const content = context.parse(args[i], 1, ValueType);
                  if (!content)
                      return null;
                  const kind = content.type.kind;
                  if (kind !== 'string' && kind !== 'value' && kind !== 'null' && kind !== 'resolvedImage')
                      return context.error('Formatted text type must be \'string\', \'value\', \'image\' or \'null\'.');
                  nextTokenMayBeObject = true;
                  sections.push({ content, scale: null, font: null, textColor: null });
              }
          }
          return new FormatExpression(sections);
      }
      evaluate(ctx) {
          const evaluateSection = section => {
              const evaluatedContent = section.content.evaluate(ctx);
              if (typeOf(evaluatedContent) === ResolvedImageType) {
                  return new FormattedSection('', evaluatedContent, null, null, null);
              }
              return new FormattedSection(toString(evaluatedContent), null, section.scale ? section.scale.evaluate(ctx) : null, section.font ? section.font.evaluate(ctx).join(',') : null, section.textColor ? section.textColor.evaluate(ctx) : null);
          };
          return new Formatted(this.sections.map(evaluateSection));
      }
      eachChild(fn) {
          for (const section of this.sections) {
              fn(section.content);
              if (section.scale) {
                  fn(section.scale);
              }
              if (section.font) {
                  fn(section.font);
              }
              if (section.textColor) {
                  fn(section.textColor);
              }
          }
      }
      outputDefined() {
          // Technically the combinatoric set of all children
          // Usually, this.text will be undefined anyway
          return false;
      }
  }

  class ImageExpression {
      constructor(input) {
          this.type = ResolvedImageType;
          this.input = input;
      }
      static parse(args, context) {
          if (args.length !== 2) {
              return context.error('Expected two arguments.');
          }
          const name = context.parse(args[1], 1, StringType);
          if (!name)
              return context.error('No image name provided.');
          return new ImageExpression(name);
      }
      evaluate(ctx) {
          const evaluatedImageName = this.input.evaluate(ctx);
          const value = ResolvedImage.fromString(evaluatedImageName);
          if (value && ctx.availableImages)
              value.available = ctx.availableImages.indexOf(evaluatedImageName) > -1;
          return value;
      }
      eachChild(fn) {
          fn(this.input);
      }
      outputDefined() {
          // The output of image is determined by the list of available images in the evaluation context
          return false;
      }
  }

  class Length {
      constructor(input) {
          this.type = NumberType;
          this.input = input;
      }
      static parse(args, context) {
          if (args.length !== 2)
              return context.error(`Expected 1 argument, but found ${args.length - 1} instead.`);
          const input = context.parse(args[1], 1);
          if (!input)
              return null;
          if (input.type.kind !== 'array' && input.type.kind !== 'string' && input.type.kind !== 'value')
              return context.error(`Expected argument of type string or array, but found ${toString$1(input.type)} instead.`);
          return new Length(input);
      }
      evaluate(ctx) {
          const input = this.input.evaluate(ctx);
          if (typeof input === 'string') {
              return input.length;
          }
          else if (Array.isArray(input)) {
              return input.length;
          }
          else {
              throw new RuntimeError(`Expected value to be of type string or array, but found ${toString$1(typeOf(input))} instead.`);
          }
      }
      eachChild(fn) {
          fn(this.input);
      }
      outputDefined() {
          return false;
      }
  }

  const expressions$1 = {
      // special forms
      '==': Equals,
      '!=': NotEquals,
      '>': GreaterThan,
      '<': LessThan,
      '>=': GreaterThanOrEqual,
      '<=': LessThanOrEqual,
      'array': Assertion,
      'at': At,
      'boolean': Assertion,
      'case': Case,
      'coalesce': Coalesce,
      'collator': CollatorExpression,
      'format': FormatExpression,
      'image': ImageExpression,
      'in': In,
      'index-of': IndexOf,
      'interpolate': Interpolate,
      'interpolate-hcl': Interpolate,
      'interpolate-lab': Interpolate,
      'length': Length,
      'let': Let,
      'literal': Literal,
      'match': Match,
      'number': Assertion,
      'number-format': NumberFormat,
      'object': Assertion,
      'slice': Slice,
      'step': Step,
      'string': Assertion,
      'to-boolean': Coercion,
      'to-color': Coercion,
      'to-number': Coercion,
      'to-string': Coercion,
      'var': Var,
      'within': Within
  };
  function rgba(ctx, [r, g, b, a]) {
      r = r.evaluate(ctx);
      g = g.evaluate(ctx);
      b = b.evaluate(ctx);
      const alpha = a ? a.evaluate(ctx) : 1;
      const error = validateRGBA(r, g, b, alpha);
      if (error)
          throw new RuntimeError(error);
      return new Color(r / 255 * alpha, g / 255 * alpha, b / 255 * alpha, alpha);
  }
  function has(key, obj) {
      return key in obj;
  }
  function get(key, obj) {
      const v = obj[key];
      return typeof v === 'undefined' ? null : v;
  }
  function binarySearch(v, a, i, j) {
      while (i <= j) {
          const m = (i + j) >> 1;
          if (a[m] === v)
              return true;
          if (a[m] > v)
              j = m - 1;
          else
              i = m + 1;
      }
      return false;
  }
  function varargs(type) {
      return { type };
  }
  CompoundExpression.register(expressions$1, {
      'error': [
          ErrorType,
          [StringType],
          (ctx, [v]) => { throw new RuntimeError(v.evaluate(ctx)); }
      ],
      'typeof': [
          StringType,
          [ValueType],
          (ctx, [v]) => toString$1(typeOf(v.evaluate(ctx)))
      ],
      'to-rgba': [
          array$1(NumberType, 4),
          [ColorType],
          (ctx, [v]) => {
              return v.evaluate(ctx).toArray();
          }
      ],
      'rgb': [
          ColorType,
          [NumberType, NumberType, NumberType],
          rgba
      ],
      'rgba': [
          ColorType,
          [NumberType, NumberType, NumberType, NumberType],
          rgba
      ],
      'has': {
          type: BooleanType,
          overloads: [
              [
                  [StringType],
                  (ctx, [key]) => has(key.evaluate(ctx), ctx.properties())
              ], [
                  [StringType, ObjectType],
                  (ctx, [key, obj]) => has(key.evaluate(ctx), obj.evaluate(ctx))
              ]
          ]
      },
      'get': {
          type: ValueType,
          overloads: [
              [
                  [StringType],
                  (ctx, [key]) => get(key.evaluate(ctx), ctx.properties())
              ], [
                  [StringType, ObjectType],
                  (ctx, [key, obj]) => get(key.evaluate(ctx), obj.evaluate(ctx))
              ]
          ]
      },
      'feature-state': [
          ValueType,
          [StringType],
          (ctx, [key]) => get(key.evaluate(ctx), ctx.featureState || {})
      ],
      'properties': [
          ObjectType,
          [],
          (ctx) => ctx.properties()
      ],
      'geometry-type': [
          StringType,
          [],
          (ctx) => ctx.geometryType()
      ],
      'id': [
          ValueType,
          [],
          (ctx) => ctx.id()
      ],
      'zoom': [
          NumberType,
          [],
          (ctx) => ctx.globals.zoom
      ],
      'heatmap-density': [
          NumberType,
          [],
          (ctx) => ctx.globals.heatmapDensity || 0
      ],
      'line-progress': [
          NumberType,
          [],
          (ctx) => ctx.globals.lineProgress || 0
      ],
      'accumulated': [
          ValueType,
          [],
          (ctx) => ctx.globals.accumulated === undefined ? null : ctx.globals.accumulated
      ],
      '+': [
          NumberType,
          varargs(NumberType),
          (ctx, args) => {
              let result = 0;
              for (const arg of args) {
                  result += arg.evaluate(ctx);
              }
              return result;
          }
      ],
      '*': [
          NumberType,
          varargs(NumberType),
          (ctx, args) => {
              let result = 1;
              for (const arg of args) {
                  result *= arg.evaluate(ctx);
              }
              return result;
          }
      ],
      '-': {
          type: NumberType,
          overloads: [
              [
                  [NumberType, NumberType],
                  (ctx, [a, b]) => a.evaluate(ctx) - b.evaluate(ctx)
              ], [
                  [NumberType],
                  (ctx, [a]) => -a.evaluate(ctx)
              ]
          ]
      },
      '/': [
          NumberType,
          [NumberType, NumberType],
          (ctx, [a, b]) => a.evaluate(ctx) / b.evaluate(ctx)
      ],
      '%': [
          NumberType,
          [NumberType, NumberType],
          (ctx, [a, b]) => a.evaluate(ctx) % b.evaluate(ctx)
      ],
      'ln2': [
          NumberType,
          [],
          () => Math.LN2
      ],
      'pi': [
          NumberType,
          [],
          () => Math.PI
      ],
      'e': [
          NumberType,
          [],
          () => Math.E
      ],
      '^': [
          NumberType,
          [NumberType, NumberType],
          (ctx, [b, e]) => Math.pow(b.evaluate(ctx), e.evaluate(ctx))
      ],
      'sqrt': [
          NumberType,
          [NumberType],
          (ctx, [x]) => Math.sqrt(x.evaluate(ctx))
      ],
      'log10': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN10
      ],
      'ln': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.log(n.evaluate(ctx))
      ],
      'log2': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN2
      ],
      'sin': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.sin(n.evaluate(ctx))
      ],
      'cos': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.cos(n.evaluate(ctx))
      ],
      'tan': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.tan(n.evaluate(ctx))
      ],
      'asin': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.asin(n.evaluate(ctx))
      ],
      'acos': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.acos(n.evaluate(ctx))
      ],
      'atan': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.atan(n.evaluate(ctx))
      ],
      'min': [
          NumberType,
          varargs(NumberType),
          (ctx, args) => Math.min(...args.map(arg => arg.evaluate(ctx)))
      ],
      'max': [
          NumberType,
          varargs(NumberType),
          (ctx, args) => Math.max(...args.map(arg => arg.evaluate(ctx)))
      ],
      'abs': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.abs(n.evaluate(ctx))
      ],
      'round': [
          NumberType,
          [NumberType],
          (ctx, [n]) => {
              const v = n.evaluate(ctx);
              // Javascript's Math.round() rounds towards +Infinity for halfway
              // values, even when they're negative. It's more common to round
              // away from 0 (e.g., this is what python and C++ do)
              return v < 0 ? -Math.round(-v) : Math.round(v);
          }
      ],
      'floor': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.floor(n.evaluate(ctx))
      ],
      'ceil': [
          NumberType,
          [NumberType],
          (ctx, [n]) => Math.ceil(n.evaluate(ctx))
      ],
      'filter-==': [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => ctx.properties()[k.value] === v.value
      ],
      'filter-id-==': [
          BooleanType,
          [ValueType],
          (ctx, [v]) => ctx.id() === v.value
      ],
      'filter-type-==': [
          BooleanType,
          [StringType],
          (ctx, [v]) => ctx.geometryType() === v.value
      ],
      'filter-<': [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
              const a = ctx.properties()[k.value];
              const b = v.value;
              return typeof a === typeof b && a < b;
          }
      ],
      'filter-id-<': [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
              const a = ctx.id();
              const b = v.value;
              return typeof a === typeof b && a < b;
          }
      ],
      'filter->': [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
              const a = ctx.properties()[k.value];
              const b = v.value;
              return typeof a === typeof b && a > b;
          }
      ],
      'filter-id->': [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
              const a = ctx.id();
              const b = v.value;
              return typeof a === typeof b && a > b;
          }
      ],
      'filter-<=': [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
              const a = ctx.properties()[k.value];
              const b = v.value;
              return typeof a === typeof b && a <= b;
          }
      ],
      'filter-id-<=': [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
              const a = ctx.id();
              const b = v.value;
              return typeof a === typeof b && a <= b;
          }
      ],
      'filter->=': [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
              const a = ctx.properties()[k.value];
              const b = v.value;
              return typeof a === typeof b && a >= b;
          }
      ],
      'filter-id->=': [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
              const a = ctx.id();
              const b = v.value;
              return typeof a === typeof b && a >= b;
          }
      ],
      'filter-has': [
          BooleanType,
          [ValueType],
          (ctx, [k]) => k.value in ctx.properties()
      ],
      'filter-has-id': [
          BooleanType,
          [],
          (ctx) => (ctx.id() !== null && ctx.id() !== undefined)
      ],
      'filter-type-in': [
          BooleanType,
          [array$1(StringType)],
          (ctx, [v]) => v.value.indexOf(ctx.geometryType()) >= 0
      ],
      'filter-id-in': [
          BooleanType,
          [array$1(ValueType)],
          (ctx, [v]) => v.value.indexOf(ctx.id()) >= 0
      ],
      'filter-in-small': [
          BooleanType,
          [StringType, array$1(ValueType)],
          // assumes v is an array literal
          (ctx, [k, v]) => v.value.indexOf(ctx.properties()[k.value]) >= 0
      ],
      'filter-in-large': [
          BooleanType,
          [StringType, array$1(ValueType)],
          // assumes v is a array literal with values sorted in ascending order and of a single type
          (ctx, [k, v]) => binarySearch(ctx.properties()[k.value], v.value, 0, v.value.length - 1)
      ],
      'all': {
          type: BooleanType,
          overloads: [
              [
                  [BooleanType, BooleanType],
                  (ctx, [a, b]) => a.evaluate(ctx) && b.evaluate(ctx)
              ],
              [
                  varargs(BooleanType),
                  (ctx, args) => {
                      for (const arg of args) {
                          if (!arg.evaluate(ctx))
                              return false;
                      }
                      return true;
                  }
              ]
          ]
      },
      'any': {
          type: BooleanType,
          overloads: [
              [
                  [BooleanType, BooleanType],
                  (ctx, [a, b]) => a.evaluate(ctx) || b.evaluate(ctx)
              ],
              [
                  varargs(BooleanType),
                  (ctx, args) => {
                      for (const arg of args) {
                          if (arg.evaluate(ctx))
                              return true;
                      }
                      return false;
                  }
              ]
          ]
      },
      '!': [
          BooleanType,
          [BooleanType],
          (ctx, [b]) => !b.evaluate(ctx)
      ],
      'is-supported-script': [
          BooleanType,
          [StringType],
          // At parse time this will always return true, so we need to exclude this expression with isGlobalPropertyConstant
          (ctx, [s]) => {
              const isSupportedScript = ctx.globals && ctx.globals.isSupportedScript;
              if (isSupportedScript) {
                  return isSupportedScript(s.evaluate(ctx));
              }
              return true;
          }
      ],
      'upcase': [
          StringType,
          [StringType],
          (ctx, [s]) => s.evaluate(ctx).toUpperCase()
      ],
      'downcase': [
          StringType,
          [StringType],
          (ctx, [s]) => s.evaluate(ctx).toLowerCase()
      ],
      'concat': [
          StringType,
          varargs(ValueType),
          (ctx, args) => args.map(arg => toString(arg.evaluate(ctx))).join('')
      ],
      'resolved-locale': [
          StringType,
          [CollatorType],
          (ctx, [collator]) => collator.evaluate(ctx).resolvedLocale()
      ]
  });

  function success(value) {
      return { result: 'success', value };
  }
  function error(value) {
      return { result: 'error', value };
  }

  function supportsPropertyExpression(spec) {
      return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
  }
  function supportsZoomExpression(spec) {
      return !!spec.expression && spec.expression.parameters.indexOf('zoom') > -1;
  }
  function supportsInterpolation(spec) {
      return !!spec.expression && spec.expression.interpolated;
  }

  function getType(val) {
      if (val instanceof Number) {
          return 'number';
      }
      else if (val instanceof String) {
          return 'string';
      }
      else if (val instanceof Boolean) {
          return 'boolean';
      }
      else if (Array.isArray(val)) {
          return 'array';
      }
      else if (val === null) {
          return 'null';
      }
      else {
          return typeof val;
      }
  }

  function isFunction(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  function identityFunction(x) {
      return x;
  }
  function createFunction(parameters, propertySpec) {
      const isColor = propertySpec.type === 'color';
      const zoomAndFeatureDependent = parameters.stops && typeof parameters.stops[0][0] === 'object';
      const featureDependent = zoomAndFeatureDependent || parameters.property !== undefined;
      const zoomDependent = zoomAndFeatureDependent || !featureDependent;
      const type = parameters.type || (supportsInterpolation(propertySpec) ? 'exponential' : 'interval');
      if (isColor || propertySpec.type === 'padding') {
          const parseFn = isColor ? Color.parse : Padding.parse;
          parameters = extendBy({}, parameters);
          if (parameters.stops) {
              parameters.stops = parameters.stops.map((stop) => {
                  return [stop[0], parseFn(stop[1])];
              });
          }
          if (parameters.default) {
              parameters.default = parseFn(parameters.default);
          }
          else {
              parameters.default = parseFn(propertySpec.default);
          }
      }
      if (parameters.colorSpace && parameters.colorSpace !== 'rgb' && !colorSpaces[parameters.colorSpace]) { // eslint-disable-line import/namespace
          throw new Error(`Unknown color space: ${parameters.colorSpace}`);
      }
      let innerFun;
      let hashedStops;
      let categoricalKeyType;
      if (type === 'exponential') {
          innerFun = evaluateExponentialFunction;
      }
      else if (type === 'interval') {
          innerFun = evaluateIntervalFunction;
      }
      else if (type === 'categorical') {
          innerFun = evaluateCategoricalFunction;
          // For categorical functions, generate an Object as a hashmap of the stops for fast searching
          hashedStops = Object.create(null);
          for (const stop of parameters.stops) {
              hashedStops[stop[0]] = stop[1];
          }
          // Infer key type based on first stop key-- used to encforce strict type checking later
          categoricalKeyType = typeof parameters.stops[0][0];
      }
      else if (type === 'identity') {
          innerFun = evaluateIdentityFunction;
      }
      else {
          throw new Error(`Unknown function type "${type}"`);
      }
      if (zoomAndFeatureDependent) {
          const featureFunctions = {};
          const zoomStops = [];
          for (let s = 0; s < parameters.stops.length; s++) {
              const stop = parameters.stops[s];
              const zoom = stop[0].zoom;
              if (featureFunctions[zoom] === undefined) {
                  featureFunctions[zoom] = {
                      zoom,
                      type: parameters.type,
                      property: parameters.property,
                      default: parameters.default,
                      stops: []
                  };
                  zoomStops.push(zoom);
              }
              featureFunctions[zoom].stops.push([stop[0].value, stop[1]]);
          }
          const featureFunctionStops = [];
          for (const z of zoomStops) {
              featureFunctionStops.push([featureFunctions[z].zoom, createFunction(featureFunctions[z], propertySpec)]);
          }
          const interpolationType = { name: 'linear' };
          return {
              kind: 'composite',
              interpolationType,
              interpolationFactor: Interpolate.interpolationFactor.bind(undefined, interpolationType),
              zoomStops: featureFunctionStops.map(s => s[0]),
              evaluate({ zoom }, properties) {
                  return evaluateExponentialFunction({
                      stops: featureFunctionStops,
                      base: parameters.base
                  }, propertySpec, zoom).evaluate(zoom, properties);
              }
          };
      }
      else if (zoomDependent) {
          const interpolationType = type === 'exponential' ?
              { name: 'exponential', base: parameters.base !== undefined ? parameters.base : 1 } : null;
          return {
              kind: 'camera',
              interpolationType,
              interpolationFactor: Interpolate.interpolationFactor.bind(undefined, interpolationType),
              zoomStops: parameters.stops.map(s => s[0]),
              evaluate: ({ zoom }) => innerFun(parameters, propertySpec, zoom, hashedStops, categoricalKeyType)
          };
      }
      else {
          return {
              kind: 'source',
              evaluate(_, feature) {
                  const value = feature && feature.properties ? feature.properties[parameters.property] : undefined;
                  if (value === undefined) {
                      return coalesce$1(parameters.default, propertySpec.default);
                  }
                  return innerFun(parameters, propertySpec, value, hashedStops, categoricalKeyType);
              }
          };
      }
  }
  function coalesce$1(a, b, c) {
      if (a !== undefined)
          return a;
      if (b !== undefined)
          return b;
      if (c !== undefined)
          return c;
  }
  function evaluateCategoricalFunction(parameters, propertySpec, input, hashedStops, keyType) {
      const evaluated = typeof input === keyType ? hashedStops[input] : undefined; // Enforce strict typing on input
      return coalesce$1(evaluated, parameters.default, propertySpec.default);
  }
  function evaluateIntervalFunction(parameters, propertySpec, input) {
      // Edge cases
      if (getType(input) !== 'number')
          return coalesce$1(parameters.default, propertySpec.default);
      const n = parameters.stops.length;
      if (n === 1)
          return parameters.stops[0][1];
      if (input <= parameters.stops[0][0])
          return parameters.stops[0][1];
      if (input >= parameters.stops[n - 1][0])
          return parameters.stops[n - 1][1];
      const index = findStopLessThanOrEqualTo(parameters.stops.map((stop) => stop[0]), input);
      return parameters.stops[index][1];
  }
  function evaluateExponentialFunction(parameters, propertySpec, input) {
      const base = parameters.base !== undefined ? parameters.base : 1;
      // Edge cases
      if (getType(input) !== 'number')
          return coalesce$1(parameters.default, propertySpec.default);
      const n = parameters.stops.length;
      if (n === 1)
          return parameters.stops[0][1];
      if (input <= parameters.stops[0][0])
          return parameters.stops[0][1];
      if (input >= parameters.stops[n - 1][0])
          return parameters.stops[n - 1][1];
      const index = findStopLessThanOrEqualTo(parameters.stops.map((stop) => stop[0]), input);
      const t = interpolationFactor(input, base, parameters.stops[index][0], parameters.stops[index + 1][0]);
      const outputLower = parameters.stops[index][1];
      const outputUpper = parameters.stops[index + 1][1];
      let interp = interpolate[propertySpec.type] || identityFunction; // eslint-disable-line import/namespace
      if (parameters.colorSpace && parameters.colorSpace !== 'rgb') {
          const colorspace = colorSpaces[parameters.colorSpace]; // eslint-disable-line import/namespace
          interp = (a, b) => colorspace.reverse(colorspace.interpolate(colorspace.forward(a), colorspace.forward(b), t));
      }
      if (typeof outputLower.evaluate === 'function') {
          return {
              evaluate(...args) {
                  const evaluatedLower = outputLower.evaluate.apply(undefined, args);
                  const evaluatedUpper = outputUpper.evaluate.apply(undefined, args);
                  // Special case for fill-outline-color, which has no spec default.
                  if (evaluatedLower === undefined || evaluatedUpper === undefined) {
                      return undefined;
                  }
                  return interp(evaluatedLower, evaluatedUpper, t);
              }
          };
      }
      return interp(outputLower, outputUpper, t);
  }
  function evaluateIdentityFunction(parameters, propertySpec, input) {
      switch (propertySpec.type) {
          case 'color':
              input = Color.parse(input);
              break;
          case 'formatted':
              input = Formatted.fromString(input.toString());
              break;
          case 'resolvedImage':
              input = ResolvedImage.fromString(input.toString());
              break;
          case 'padding':
              input = Padding.parse(input);
              break;
          default:
              if (getType(input) !== propertySpec.type && (propertySpec.type !== 'enum' || !propertySpec.values[input])) {
                  input = undefined;
              }
      }
      return coalesce$1(input, parameters.default, propertySpec.default);
  }
  /**
   * Returns a ratio that can be used to interpolate between exponential function
   * stops.
   *
   * How it works:
   * Two consecutive stop values define a (scaled and shifted) exponential
   * function `f(x) = a * base^x + b`, where `base` is the user-specified base,
   * and `a` and `b` are constants affording sufficient degrees of freedom to fit
   * the function to the given stops.
   *
   * Here's a bit of algebra that lets us compute `f(x)` directly from the stop
   * values without explicitly solving for `a` and `b`:
   *
   * First stop value: `f(x0) = y0 = a * base^x0 + b`
   * Second stop value: `f(x1) = y1 = a * base^x1 + b`
   * => `y1 - y0 = a(base^x1 - base^x0)`
   * => `a = (y1 - y0)/(base^x1 - base^x0)`
   *
   * Desired value: `f(x) = y = a * base^x + b`
   * => `f(x) = y0 + a * (base^x - base^x0)`
   *
   * From the above, we can replace the `a` in `a * (base^x - base^x0)` and do a
   * little algebra:
   * ```
   * a * (base^x - base^x0) = (y1 - y0)/(base^x1 - base^x0) * (base^x - base^x0)
   *                     = (y1 - y0) * (base^x - base^x0) / (base^x1 - base^x0)
   * ```
   *
   * If we let `(base^x - base^x0) / (base^x1 base^x0)`, then we have
   * `f(x) = y0 + (y1 - y0) * ratio`.  In other words, `ratio` may be treated as
   * an interpolation factor between the two stops' output values.
   *
   * (Note: a slightly different form for `ratio`,
   * `(base^(x-x0) - 1) / (base^(x1-x0) - 1) `, is equivalent, but requires fewer
   * expensive `Math.pow()` operations.)
   *
   * @private
   */
  function interpolationFactor(input, base, lowerValue, upperValue) {
      const difference = upperValue - lowerValue;
      const progress = input - lowerValue;
      if (difference === 0) {
          return 0;
      }
      else if (base === 1) {
          return progress / difference;
      }
      else {
          return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
      }
  }

  class StyleExpression {
      constructor(expression, propertySpec) {
          this.expression = expression;
          this._warningHistory = {};
          this._evaluator = new EvaluationContext();
          this._defaultValue = propertySpec ? getDefaultValue(propertySpec) : null;
          this._enumValues = propertySpec && propertySpec.type === 'enum' ? propertySpec.values : null;
      }
      evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
          this._evaluator.globals = globals;
          this._evaluator.feature = feature;
          this._evaluator.featureState = featureState;
          this._evaluator.canonical = canonical;
          this._evaluator.availableImages = availableImages || null;
          this._evaluator.formattedSection = formattedSection;
          return this.expression.evaluate(this._evaluator);
      }
      evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
          this._evaluator.globals = globals;
          this._evaluator.feature = feature || null;
          this._evaluator.featureState = featureState || null;
          this._evaluator.canonical = canonical;
          this._evaluator.availableImages = availableImages || null;
          this._evaluator.formattedSection = formattedSection || null;
          try {
              const val = this.expression.evaluate(this._evaluator);
              // eslint-disable-next-line no-self-compare
              if (val === null || val === undefined || (typeof val === 'number' && val !== val)) {
                  return this._defaultValue;
              }
              if (this._enumValues && !(val in this._enumValues)) {
                  throw new RuntimeError(`Expected value to be one of ${Object.keys(this._enumValues).map(v => JSON.stringify(v)).join(', ')}, but found ${JSON.stringify(val)} instead.`);
              }
              return val;
          }
          catch (e) {
              if (!this._warningHistory[e.message]) {
                  this._warningHistory[e.message] = true;
                  if (typeof console !== 'undefined') {
                      console.warn(e.message);
                  }
              }
              return this._defaultValue;
          }
      }
  }
  function isExpression(expression) {
      return Array.isArray(expression) && expression.length > 0 &&
          typeof expression[0] === 'string' && expression[0] in expressions$1;
  }
  /**
   * Parse and typecheck the given style spec JSON expression.  If
   * options.defaultValue is provided, then the resulting StyleExpression's
   * `evaluate()` method will handle errors by logging a warning (once per
   * message) and returning the default value.  Otherwise, it will throw
   * evaluation errors.
   *
   * @private
   */
  function createExpression(expression, propertySpec) {
      const parser = new ParsingContext(expressions$1, isExpressionConstant, [], propertySpec ? getExpectedType(propertySpec) : undefined);
      // For string-valued properties, coerce to string at the top level rather than asserting.
      const parsed = parser.parse(expression, undefined, undefined, undefined, propertySpec && propertySpec.type === 'string' ? { typeAnnotation: 'coerce' } : undefined);
      if (!parsed) {
          return error(parser.errors);
      }
      return success(new StyleExpression(parsed, propertySpec));
  }
  class ZoomConstantExpression {
      constructor(kind, expression) {
          this.kind = kind;
          this._styleExpression = expression;
          this.isStateDependent = kind !== 'constant' && !isStateConstant(expression.expression);
      }
      evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
          return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
      }
      evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
          return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
      }
  }
  class ZoomDependentExpression {
      constructor(kind, expression, zoomStops, interpolationType) {
          this.kind = kind;
          this.zoomStops = zoomStops;
          this._styleExpression = expression;
          this.isStateDependent = kind !== 'camera' && !isStateConstant(expression.expression);
          this.interpolationType = interpolationType;
      }
      evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
          return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
      }
      evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
          return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
      }
      interpolationFactor(input, lower, upper) {
          if (this.interpolationType) {
              return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
          }
          else {
              return 0;
          }
      }
  }
  function createPropertyExpression(expressionInput, propertySpec) {
      const expression = createExpression(expressionInput, propertySpec);
      if (expression.result === 'error') {
          return expression;
      }
      const parsed = expression.value.expression;
      const isFeatureConstantResult = isFeatureConstant(parsed);
      if (!isFeatureConstantResult && !supportsPropertyExpression(propertySpec)) {
          return error([new ExpressionParsingError('', 'data expressions not supported')]);
      }
      const isZoomConstant = isGlobalPropertyConstant(parsed, ['zoom']);
      if (!isZoomConstant && !supportsZoomExpression(propertySpec)) {
          return error([new ExpressionParsingError('', 'zoom expressions not supported')]);
      }
      const zoomCurve = findZoomCurve(parsed);
      if (!zoomCurve && !isZoomConstant) {
          return error([new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]);
      }
      else if (zoomCurve instanceof ExpressionParsingError) {
          return error([zoomCurve]);
      }
      else if (zoomCurve instanceof Interpolate && !supportsInterpolation(propertySpec)) {
          return error([new ExpressionParsingError('', '"interpolate" expressions cannot be used with this property')]);
      }
      if (!zoomCurve) {
          return success(isFeatureConstantResult ?
              new ZoomConstantExpression('constant', expression.value) :
              new ZoomConstantExpression('source', expression.value));
      }
      const interpolationType = zoomCurve instanceof Interpolate ? zoomCurve.interpolation : undefined;
      return success(isFeatureConstantResult ?
          new ZoomDependentExpression('camera', expression.value, zoomCurve.labels, interpolationType) :
          new ZoomDependentExpression('composite', expression.value, zoomCurve.labels, interpolationType));
  }
  // serialization wrapper for old-style stop functions normalized to the
  // expression interface
  class StylePropertyFunction {
      constructor(parameters, specification) {
          this._parameters = parameters;
          this._specification = specification;
          extendBy(this, createFunction(this._parameters, this._specification));
      }
      static deserialize(serialized) {
          return new StylePropertyFunction(serialized._parameters, serialized._specification);
      }
      static serialize(input) {
          return {
              _parameters: input._parameters,
              _specification: input._specification
          };
      }
  }
  function normalizePropertyExpression(value, specification) {
      if (isFunction(value)) {
          return new StylePropertyFunction(value, specification);
      }
      else if (isExpression(value)) {
          const expression = createPropertyExpression(value, specification);
          if (expression.result === 'error') {
              // this should have been caught in validation
              throw new Error(expression.value.map(err => `${err.key}: ${err.message}`).join(', '));
          }
          return expression.value;
      }
      else {
          let constant = value;
          if (specification.type === 'color' && typeof value === 'string') {
              constant = Color.parse(value);
          }
          else if (specification.type === 'padding' && (typeof value === 'number' || Array.isArray(value))) {
              constant = Padding.parse(value);
          }
          return {
              kind: 'constant',
              evaluate: () => constant
          };
      }
  }
  // Zoom-dependent expressions may only use ["zoom"] as the input to a top-level "step" or "interpolate"
  // expression (collectively referred to as a "curve"). The curve may be wrapped in one or more "let" or
  // "coalesce" expressions.
  function findZoomCurve(expression) {
      let result = null;
      if (expression instanceof Let) {
          result = findZoomCurve(expression.result);
      }
      else if (expression instanceof Coalesce) {
          for (const arg of expression.args) {
              result = findZoomCurve(arg);
              if (result) {
                  break;
              }
          }
      }
      else if ((expression instanceof Step || expression instanceof Interpolate) &&
          expression.input instanceof CompoundExpression &&
          expression.input.name === 'zoom') {
          result = expression;
      }
      if (result instanceof ExpressionParsingError) {
          return result;
      }
      expression.eachChild((child) => {
          const childResult = findZoomCurve(child);
          if (childResult instanceof ExpressionParsingError) {
              result = childResult;
          }
          else if (!result && childResult) {
              result = new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.');
          }
          else if (result && childResult && result !== childResult) {
              result = new ExpressionParsingError('', 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.');
          }
      });
      return result;
  }
  function getExpectedType(spec) {
      const types = {
          color: ColorType,
          string: StringType,
          number: NumberType,
          enum: StringType,
          boolean: BooleanType,
          formatted: FormattedType,
          padding: PaddingType,
          resolvedImage: ResolvedImageType
      };
      if (spec.type === 'array') {
          return array$1(types[spec.value] || ValueType, spec.length);
      }
      return types[spec.type];
  }
  function getDefaultValue(spec) {
      if (spec.type === 'color' && isFunction(spec.default)) {
          // Special case for heatmap-color: it uses the 'default:' to define a
          // default color ramp, but createExpression expects a simple value to fall
          // back to in case of runtime errors
          return new Color(0, 0, 0, 0);
      }
      else if (spec.type === 'color') {
          return Color.parse(spec.default) || null;
      }
      else if (spec.type === 'padding') {
          return Padding.parse(spec.default) || null;
      }
      else if (spec.default === undefined) {
          return null;
      }
      else {
          return spec.default;
      }
  }

  function convertLiteral(value) {
      return typeof value === 'object' ? ['literal', value] : value;
  }
  function convertFunction(parameters, propertySpec) {
      let stops = parameters.stops;
      if (!stops) {
          // identity function
          return convertIdentityFunction(parameters, propertySpec);
      }
      const zoomAndFeatureDependent = stops && typeof stops[0][0] === 'object';
      const featureDependent = zoomAndFeatureDependent || parameters.property !== undefined;
      const zoomDependent = zoomAndFeatureDependent || !featureDependent;
      stops = stops.map((stop) => {
          if (!featureDependent && propertySpec.tokens && typeof stop[1] === 'string') {
              return [stop[0], convertTokenString(stop[1])];
          }
          return [stop[0], convertLiteral(stop[1])];
      });
      if (zoomAndFeatureDependent) {
          return convertZoomAndPropertyFunction(parameters, propertySpec, stops);
      }
      else if (zoomDependent) {
          return convertZoomFunction(parameters, propertySpec, stops);
      }
      else {
          return convertPropertyFunction(parameters, propertySpec, stops);
      }
  }
  function convertIdentityFunction(parameters, propertySpec) {
      const get = ['get', parameters.property];
      if (parameters.default === undefined) {
          // By default, expressions for string-valued properties get coerced. To preserve
          // legacy function semantics, insert an explicit assertion instead.
          return propertySpec.type === 'string' ? ['string', get] : get;
      }
      else if (propertySpec.type === 'enum') {
          return [
              'match',
              get,
              Object.keys(propertySpec.values),
              get,
              parameters.default
          ];
      }
      else {
          const expression = [propertySpec.type === 'color' ? 'to-color' : propertySpec.type, get, convertLiteral(parameters.default)];
          if (propertySpec.type === 'array') {
              expression.splice(1, 0, propertySpec.value, propertySpec.length || null);
          }
          return expression;
      }
  }
  function getInterpolateOperator(parameters) {
      switch (parameters.colorSpace) {
          case 'hcl': return 'interpolate-hcl';
          case 'lab': return 'interpolate-lab';
          default: return 'interpolate';
      }
  }
  function convertZoomAndPropertyFunction(parameters, propertySpec, stops) {
      const featureFunctionParameters = {};
      const featureFunctionStops = {};
      const zoomStops = [];
      for (let s = 0; s < stops.length; s++) {
          const stop = stops[s];
          const zoom = stop[0].zoom;
          if (featureFunctionParameters[zoom] === undefined) {
              featureFunctionParameters[zoom] = {
                  zoom,
                  type: parameters.type,
                  property: parameters.property,
                  default: parameters.default,
              };
              featureFunctionStops[zoom] = [];
              zoomStops.push(zoom);
          }
          featureFunctionStops[zoom].push([stop[0].value, stop[1]]);
      }
      // the interpolation type for the zoom dimension of a zoom-and-property
      // function is determined directly from the style property specification
      // for which it's being used: linear for interpolatable properties, step
      // otherwise.
      const functionType = getFunctionType({}, propertySpec);
      if (functionType === 'exponential') {
          const expression = [getInterpolateOperator(parameters), ['linear'], ['zoom']];
          for (const z of zoomStops) {
              const output = convertPropertyFunction(featureFunctionParameters[z], propertySpec, featureFunctionStops[z]);
              appendStopPair(expression, z, output, false);
          }
          return expression;
      }
      else {
          const expression = ['step', ['zoom']];
          for (const z of zoomStops) {
              const output = convertPropertyFunction(featureFunctionParameters[z], propertySpec, featureFunctionStops[z]);
              appendStopPair(expression, z, output, true);
          }
          fixupDegenerateStepCurve(expression);
          return expression;
      }
  }
  function coalesce(a, b) {
      if (a !== undefined)
          return a;
      if (b !== undefined)
          return b;
  }
  function getFallback(parameters, propertySpec) {
      const defaultValue = convertLiteral(coalesce(parameters.default, propertySpec.default));
      /*
       * Some fields with type: resolvedImage have an undefined default.
       * Because undefined is an invalid value for resolvedImage, set fallback to
       * an empty string instead of undefined to ensure output
       * passes validation.
       */
      if (defaultValue === undefined && propertySpec.type === 'resolvedImage') {
          return '';
      }
      return defaultValue;
  }
  function convertPropertyFunction(parameters, propertySpec, stops) {
      const type = getFunctionType(parameters, propertySpec);
      const get = ['get', parameters.property];
      if (type === 'categorical' && typeof stops[0][0] === 'boolean') {
          const expression = ['case'];
          for (const stop of stops) {
              expression.push(['==', get, stop[0]], stop[1]);
          }
          expression.push(getFallback(parameters, propertySpec));
          return expression;
      }
      else if (type === 'categorical') {
          const expression = ['match', get];
          for (const stop of stops) {
              appendStopPair(expression, stop[0], stop[1], false);
          }
          expression.push(getFallback(parameters, propertySpec));
          return expression;
      }
      else if (type === 'interval') {
          const expression = ['step', ['number', get]];
          for (const stop of stops) {
              appendStopPair(expression, stop[0], stop[1], true);
          }
          fixupDegenerateStepCurve(expression);
          return parameters.default === undefined ? expression : [
              'case',
              ['==', ['typeof', get], 'number'],
              expression,
              convertLiteral(parameters.default)
          ];
      }
      else if (type === 'exponential') {
          const base = parameters.base !== undefined ? parameters.base : 1;
          const expression = [
              getInterpolateOperator(parameters),
              base === 1 ? ['linear'] : ['exponential', base],
              ['number', get]
          ];
          for (const stop of stops) {
              appendStopPair(expression, stop[0], stop[1], false);
          }
          return parameters.default === undefined ? expression : [
              'case',
              ['==', ['typeof', get], 'number'],
              expression,
              convertLiteral(parameters.default)
          ];
      }
      else {
          throw new Error(`Unknown property function type ${type}`);
      }
  }
  function convertZoomFunction(parameters, propertySpec, stops, input = ['zoom']) {
      const type = getFunctionType(parameters, propertySpec);
      let expression;
      let isStep = false;
      if (type === 'interval') {
          expression = ['step', input];
          isStep = true;
      }
      else if (type === 'exponential') {
          const base = parameters.base !== undefined ? parameters.base : 1;
          expression = [getInterpolateOperator(parameters), base === 1 ? ['linear'] : ['exponential', base], input];
      }
      else {
          throw new Error(`Unknown zoom function type "${type}"`);
      }
      for (const stop of stops) {
          appendStopPair(expression, stop[0], stop[1], isStep);
      }
      fixupDegenerateStepCurve(expression);
      return expression;
  }
  function fixupDegenerateStepCurve(expression) {
      // degenerate step curve (i.e. a constant function): add a noop stop
      if (expression[0] === 'step' && expression.length === 3) {
          expression.push(0);
          expression.push(expression[3]);
      }
  }
  function appendStopPair(curve, input, output, isStep) {
      // Skip duplicate stop values. They were not validated for functions, but they are for expressions.
      // https://github.com/mapbox/mapbox-gl-js/issues/4107
      if (curve.length > 3 && input === curve[curve.length - 2]) {
          return;
      }
      // step curves don't get the first input value, as it is redundant.
      if (!(isStep && curve.length === 2)) {
          curve.push(input);
      }
      curve.push(output);
  }
  function getFunctionType(parameters, propertySpec) {
      if (parameters.type) {
          return parameters.type;
      }
      else {
          return propertySpec.expression.interpolated ? 'exponential' : 'interval';
      }
  }
  // "String with {name} token" => ["concat", "String with ", ["get", "name"], " token"]
  function convertTokenString(s) {
      const result = ['concat'];
      const re = /{([^{}]+)}/g;
      let pos = 0;
      for (let match = re.exec(s); match !== null; match = re.exec(s)) {
          const literal = s.slice(pos, re.lastIndex - match[0].length);
          pos = re.lastIndex;
          if (literal.length > 0)
              result.push(literal);
          result.push(['get', match[1]]);
      }
      if (result.length === 1) {
          return s;
      }
      if (pos < s.length) {
          result.push(s.slice(pos));
      }
      else if (result.length === 2) {
          return ['to-string', result[1]];
      }
      return result;
  }

  function isExpressionFilter(filter) {
      if (filter === true || filter === false) {
          return true;
      }
      if (!Array.isArray(filter) || filter.length === 0) {
          return false;
      }
      switch (filter[0]) {
          case 'has':
              return filter.length >= 2 && filter[1] !== '$id' && filter[1] !== '$type';
          case 'in':
              return filter.length >= 3 && (typeof filter[1] !== 'string' || Array.isArray(filter[2]));
          case '!in':
          case '!has':
          case 'none':
              return false;
          case '==':
          case '!=':
          case '>':
          case '>=':
          case '<':
          case '<=':
              return filter.length !== 3 || (Array.isArray(filter[1]) || Array.isArray(filter[2]));
          case 'any':
          case 'all':
              for (const f of filter.slice(1)) {
                  if (!isExpressionFilter(f) && typeof f !== 'boolean') {
                      return false;
                  }
              }
              return true;
          default:
              return true;
      }
  }
  const filterSpec = {
      'type': 'boolean',
      'default': false,
      'transition': false,
      'property-type': 'data-driven',
      'expression': {
          'interpolated': false,
          'parameters': ['zoom', 'feature']
      }
  };
  /**
   * Given a filter expressed as nested arrays, return a new function
   * that evaluates whether a given feature (with a .properties or .tags property)
   * passes its test.
   *
   * @private
   * @param {Array} filter maplibre gl filter
   * @returns {Function} filter-evaluating function
   */
  function createFilter(filter) {
      if (filter === null || filter === undefined) {
          return { filter: () => true, needGeometry: false };
      }
      if (!isExpressionFilter(filter)) {
          filter = convertFilter$1(filter);
      }
      const compiled = createExpression(filter, filterSpec);
      if (compiled.result === 'error') {
          throw new Error(compiled.value.map(err => `${err.key}: ${err.message}`).join(', '));
      }
      else {
          const needGeometry = geometryNeeded(filter);
          return { filter: (globalProperties, feature, canonical) => compiled.value.evaluate(globalProperties, feature, {}, canonical),
              needGeometry };
      }
  }
  // Comparison function to sort numbers and strings
  function compare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
  }
  function geometryNeeded(filter) {
      if (!Array.isArray(filter))
          return false;
      if (filter[0] === 'within')
          return true;
      for (let index = 1; index < filter.length; index++) {
          if (geometryNeeded(filter[index]))
              return true;
      }
      return false;
  }
  function convertFilter$1(filter) {
      if (!filter)
          return true;
      const op = filter[0];
      if (filter.length <= 1)
          return (op !== 'any');
      const converted = op === '==' ? convertComparisonOp$1(filter[1], filter[2], '==') :
          op === '!=' ? convertNegation(convertComparisonOp$1(filter[1], filter[2], '==')) :
              op === '<' ||
                  op === '>' ||
                  op === '<=' ||
                  op === '>=' ? convertComparisonOp$1(filter[1], filter[2], op) :
                  op === 'any' ? convertDisjunctionOp(filter.slice(1)) :
                      op === 'all' ? ['all'].concat(filter.slice(1).map(convertFilter$1)) :
                          op === 'none' ? ['all'].concat(filter.slice(1).map(convertFilter$1).map(convertNegation)) :
                              op === 'in' ? convertInOp$1(filter[1], filter.slice(2)) :
                                  op === '!in' ? convertNegation(convertInOp$1(filter[1], filter.slice(2))) :
                                      op === 'has' ? convertHasOp$1(filter[1]) :
                                          op === '!has' ? convertNegation(convertHasOp$1(filter[1])) :
                                              op === 'within' ? filter :
                                                  true;
      return converted;
  }
  function convertComparisonOp$1(property, value, op) {
      switch (property) {
          case '$type':
              return [`filter-type-${op}`, value];
          case '$id':
              return [`filter-id-${op}`, value];
          default:
              return [`filter-${op}`, property, value];
      }
  }
  function convertDisjunctionOp(filters) {
      return ['any'].concat(filters.map(convertFilter$1));
  }
  function convertInOp$1(property, values) {
      if (values.length === 0) {
          return false;
      }
      switch (property) {
          case '$type':
              return ['filter-type-in', ['literal', values]];
          case '$id':
              return ['filter-id-in', ['literal', values]];
          default:
              if (values.length > 200 && !values.some(v => typeof v !== typeof values[0])) {
                  return ['filter-in-large', property, ['literal', values.sort(compare)]];
              }
              else {
                  return ['filter-in-small', property, ['literal', values]];
              }
      }
  }
  function convertHasOp$1(property) {
      switch (property) {
          case '$type':
              return true;
          case '$id':
              return ['filter-has-id'];
          default:
              return ['filter-has', property];
      }
  }
  function convertNegation(filter) {
      return ['!', filter];
  }

  /*
   * Convert the given filter to an expression, storing the expected types for
   * any feature properties referenced in expectedTypes.
   *
   * These expected types are needed in order to construct preflight type checks
   * needed for handling 'any' filters. A preflight type check is necessary in
   * order to mimic legacy filters' semantics around expected type mismatches.
   * For example, consider the legacy filter:
   *
   *     ["any", ["all", [">", "y", 0], [">", "y", 0]], [">", "x", 0]]
   *
   * Naively, we might convert this to the expression:
   *
   *     ["any", ["all", [">", ["get", "y"], 0], [">", ["get", "z"], 0]], [">", ["get", "x"], 0]]
   *
   * But if we tried to evaluate this against, say `{x: 1, y: null, z: 0}`, the
   * [">", ["get", "y"], 0] would cause an evaluation error, leading to the
   * entire filter returning false. Legacy filter semantics, though, ask for
   * [">", "y", 0] to simply return `false` when `y` is of the wrong type,
   * allowing the subsequent terms of the outer "any" expression to be evaluated
   * (resulting, in this case, in a `true` value, because x > 0).
   *
   * We account for this by inserting a preflight type-checking expression before
   * each "any" term, allowing us to avoid evaluating the actual converted filter
   * if any type mismatches would cause it to produce an evalaution error:
   *
   *     ["any",
   *       ["case",
   *         ["all", ["==", ["typeof", ["get", "y"]], "number"], ["==", ["typeof", ["get", "z"], "number]],
   *         ["all", [">", ["get", "y"], 0], [">", ["get", "z"], 0]],
   *         false
   *       ],
   *       ["case",
   *         ["==", ["typeof", ["get", "x"], "number"]],
   *         [">", ["get", "x"], 0],
   *         false
   *       ]
   *     ]
   *
   * An alternative, possibly more direct approach would be to use type checks
   * in the conversion of each comparison operator, so that the converted version
   * of each individual ==, >=, etc. would mimic the legacy filter semantics. The
   * downside of this approach is that it can lead to many more type checks than
   * would otherwise be necessary: outside the context of an "any" expression,
   * bailing out due to a runtime type error (expression semantics) and returning
   * false (legacy filter semantics) are equivalent: they cause the filter to
   * produce a `false` result.
   */
  function convertFilter(filter, expectedTypes = {}) {
      if (isExpressionFilter(filter))
          return filter;
      if (!filter)
          return true;
      const legacyFilter = filter;
      const legacyOp = legacyFilter[0];
      if (filter.length <= 1)
          return (legacyOp !== 'any');
      switch (legacyOp) {
          case '==':
          case '!=':
          case '<':
          case '>':
          case '<=':
          case '>=': {
              const [, property, value] = filter;
              return convertComparisonOp(property, value, legacyOp, expectedTypes);
          }
          case 'any': {
              const [, ...conditions] = legacyFilter;
              const children = conditions.map((f) => {
                  const types = {};
                  const child = convertFilter(f, types);
                  const typechecks = runtimeTypeChecks(types);
                  return typechecks === true ? child : ['case', typechecks, child, false];
              });
              return ['any', ...children];
          }
          case 'all': {
              const [, ...conditions] = legacyFilter;
              const children = conditions.map(f => convertFilter(f, expectedTypes));
              return children.length > 1 ? ['all', ...children] : children[0];
          }
          case 'none': {
              const [, ...conditions] = legacyFilter;
              return ['!', convertFilter(['any', ...conditions], {})];
          }
          case 'in': {
              const [, property, ...values] = legacyFilter;
              return convertInOp(property, values);
          }
          case '!in': {
              const [, property, ...values] = legacyFilter;
              return convertInOp(property, values, true);
          }
          case 'has':
              return convertHasOp(legacyFilter[1]);
          case '!has':
              return ['!', convertHasOp(legacyFilter[1])];
          default:
              return true;
      }
  }
  // Given a set of feature properties and an expected type for each one,
  // construct an boolean expression that tests whether each property has the
  // right type.
  // E.g.: for {name: 'string', population: 'number'}, return
  // [ 'all',
  //   ['==', ['typeof', ['get', 'name'], 'string']],
  //   ['==', ['typeof', ['get', 'population'], 'number]]
  // ]
  function runtimeTypeChecks(expectedTypes) {
      const conditions = [];
      for (const property in expectedTypes) {
          const get = property === '$id' ? ['id'] : ['get', property];
          conditions.push(['==', ['typeof', get], expectedTypes[property]]);
      }
      if (conditions.length === 0)
          return true;
      if (conditions.length === 1)
          return conditions[0];
      return ['all', ...conditions];
  }
  function convertComparisonOp(property, value, op, expectedTypes) {
      let get;
      if (property === '$type') {
          return [op, ['geometry-type'], value];
      }
      else if (property === '$id') {
          get = ['id'];
      }
      else {
          get = ['get', property];
      }
      if (expectedTypes && value !== null) {
          const type = typeof value;
          expectedTypes[property] = type;
      }
      if (op === '==' && property !== '$id' && value === null) {
          return [
              'all',
              ['has', property],
              ['==', get, null]
          ];
      }
      else if (op === '!=' && property !== '$id' && value === null) {
          return [
              'any',
              ['!', ['has', property]],
              ['!=', get, null]
          ];
      }
      return [op, get, value];
  }
  function convertInOp(property, values, negate = false) {
      if (values.length === 0)
          return negate;
      let get;
      if (property === '$type') {
          get = ['geometry-type'];
      }
      else if (property === '$id') {
          get = ['id'];
      }
      else {
          get = ['get', property];
      }
      // Determine if the list of values to be searched is homogenously typed.
      // If so (and if the type is string or number), then we can use a
      // [match, input, [...values], true, false] construction rather than a
      // bunch of `==` tests.
      let uniformTypes = true;
      const type = typeof values[0];
      for (const value of values) {
          if (typeof value !== type) {
              uniformTypes = false;
              break;
          }
      }
      if (uniformTypes && (type === 'string' || type === 'number')) {
          // Match expressions must have unique values.
          const uniqueValues = values.sort().filter((v, i) => i === 0 || values[i - 1] !== v);
          return ['match', get, uniqueValues, !negate, negate];
      }
      if (negate) {
          return ['all', ...values.map(v => ['!=', get, v])];
      }
      else {
          return ['any', ...values.map(v => ['==', get, v])];
      }
  }
  function convertHasOp(property) {
      if (property === '$type') {
          return true;
      }
      else if (property === '$id') {
          return ['!=', ['id'], null];
      }
      else {
          return ['has', property];
      }
  }

  /**
   * Migrate the given style object in place to use expressions. Specifically,
   * this will convert (a) "stop" functions, and (b) legacy filters to their
   * expression equivalents.
   * @param style
   */
  function expressions(style) {
      const converted = [];
      eachLayer(style, (layer) => {
          if (layer.filter) {
              layer.filter = convertFilter(layer.filter);
          }
      });
      eachProperty(style, { paint: true, layout: true }, ({ path, value, reference, set }) => {
          if (isExpression(value))
              return;
          if (typeof value === 'object' && !Array.isArray(value)) {
              set(convertFunction(value, reference));
              converted.push(path.join('.'));
          }
          else if (reference.tokens && typeof value === 'string') {
              set(convertTokenString(value));
          }
      });
      return style;
  }

  /**
   * Migrate a Mapbox GL Style to the latest version.
   *
   * @private
   * @alias migrate
   * @param {StyleSpecification} style a MapLibre GL Style
   * @returns {StyleSpecification} a migrated style
   * @example
   * var fs = require('fs');
   * var migrate = require('maplibre-gl-style-spec').migrate;
   * var style = fs.readFileSync('./style.json', 'utf8');
   * fs.writeFileSync('./style.json', JSON.stringify(migrate(style)));
   */
  function migrate(style) {
      let migrated = false;
      if (style.version === 7) {
          style = migrateV8(style);
          migrated = true;
      }
      if (style.version === 8) {
          migrated = !!expressions(style);
          migrated = true;
      }
      if (!migrated) {
          throw new Error(`Cannot migrate from ${style.version}`);
      }
      return style;
  }

  const refProperties = ['type', 'source', 'source-layer', 'minzoom', 'maxzoom', 'filter', 'layout'];

  function deref(layer, parent) {
      const result = {};
      for (const k in layer) {
          if (k !== 'ref') {
              result[k] = layer[k];
          }
      }
      refProperties.forEach((k) => {
          if (k in parent) {
              result[k] = parent[k];
          }
      });
      return result;
  }
  /**
   * Given an array of layers, some of which may contain `ref` properties
   * whose value is the `id` of another property, return a new array where
   * such layers have been augmented with the 'type', 'source', etc. properties
   * from the parent layer, and the `ref` property has been removed.
   *
   * The input is not modified. The output may contain references to portions
   * of the input.
   *
   * @private
   * @param {Array<Layer>} layers
   * @returns {Array<Layer>}
   */
  function derefLayers(layers) {
      layers = layers.slice();
      const map = Object.create(null);
      for (let i = 0; i < layers.length; i++) {
          map[layers[i].id] = layers[i];
      }
      for (let i = 0; i < layers.length; i++) {
          if ('ref' in layers[i]) {
              layers[i] = deref(layers[i], map[layers[i].ref]);
          }
      }
      return layers;
  }

  /**
   * Deeply compares two object literals.
   *
   * @private
   */
  function deepEqual(a, b) {
      if (Array.isArray(a)) {
          if (!Array.isArray(b) || a.length !== b.length)
              return false;
          for (let i = 0; i < a.length; i++) {
              if (!deepEqual(a[i], b[i]))
                  return false;
          }
          return true;
      }
      if (typeof a === 'object' && a !== null && b !== null) {
          if (!(typeof b === 'object'))
              return false;
          const keys = Object.keys(a);
          if (keys.length !== Object.keys(b).length)
              return false;
          for (const key in a) {
              if (!deepEqual(a[key], b[key]))
                  return false;
          }
          return true;
      }
      return a === b;
  }

  const operations = {
      /*
       * { command: 'setStyle', args: [stylesheet] }
       */
      setStyle: 'setStyle',
      /*
       * { command: 'addLayer', args: [layer, 'beforeLayerId'] }
       */
      addLayer: 'addLayer',
      /*
       * { command: 'removeLayer', args: ['layerId'] }
       */
      removeLayer: 'removeLayer',
      /*
       * { command: 'setPaintProperty', args: ['layerId', 'prop', value] }
       */
      setPaintProperty: 'setPaintProperty',
      /*
       * { command: 'setLayoutProperty', args: ['layerId', 'prop', value] }
       */
      setLayoutProperty: 'setLayoutProperty',
      /*
       * { command: 'setFilter', args: ['layerId', filter] }
       */
      setFilter: 'setFilter',
      /*
       * { command: 'addSource', args: ['sourceId', source] }
       */
      addSource: 'addSource',
      /*
       * { command: 'removeSource', args: ['sourceId'] }
       */
      removeSource: 'removeSource',
      /*
       * { command: 'setGeoJSONSourceData', args: ['sourceId', data] }
       */
      setGeoJSONSourceData: 'setGeoJSONSourceData',
      /*
       * { command: 'setLayerZoomRange', args: ['layerId', 0, 22] }
       */
      setLayerZoomRange: 'setLayerZoomRange',
      /*
       * { command: 'setLayerProperty', args: ['layerId', 'prop', value] }
       */
      setLayerProperty: 'setLayerProperty',
      /*
       * { command: 'setCenter', args: [[lon, lat]] }
       */
      setCenter: 'setCenter',
      /*
       * { command: 'setZoom', args: [zoom] }
       */
      setZoom: 'setZoom',
      /*
       * { command: 'setBearing', args: [bearing] }
       */
      setBearing: 'setBearing',
      /*
       * { command: 'setPitch', args: [pitch] }
       */
      setPitch: 'setPitch',
      /*
       * { command: 'setSprite', args: ['spriteUrl'] }
       */
      setSprite: 'setSprite',
      /*
       * { command: 'setGlyphs', args: ['glyphsUrl'] }
       */
      setGlyphs: 'setGlyphs',
      /*
       * { command: 'setTransition', args: [transition] }
       */
      setTransition: 'setTransition',
      /*
       * { command: 'setLighting', args: [lightProperties] }
       */
      setLight: 'setLight'
  };
  function addSource(sourceId, after, commands) {
      commands.push({ command: operations.addSource, args: [sourceId, after[sourceId]] });
  }
  function removeSource(sourceId, commands, sourcesRemoved) {
      commands.push({ command: operations.removeSource, args: [sourceId] });
      sourcesRemoved[sourceId] = true;
  }
  function updateSource(sourceId, after, commands, sourcesRemoved) {
      removeSource(sourceId, commands, sourcesRemoved);
      addSource(sourceId, after, commands);
  }
  function canUpdateGeoJSON(before, after, sourceId) {
      let prop;
      for (prop in before[sourceId]) {
          if (!Object.prototype.hasOwnProperty.call(before[sourceId], prop))
              continue;
          if (prop !== 'data' && !deepEqual(before[sourceId][prop], after[sourceId][prop])) {
              return false;
          }
      }
      for (prop in after[sourceId]) {
          if (!Object.prototype.hasOwnProperty.call(after[sourceId], prop))
              continue;
          if (prop !== 'data' && !deepEqual(before[sourceId][prop], after[sourceId][prop])) {
              return false;
          }
      }
      return true;
  }
  function diffSources(before, after, commands, sourcesRemoved) {
      before = before || {};
      after = after || {};
      let sourceId;
      // look for sources to remove
      for (sourceId in before) {
          if (!Object.prototype.hasOwnProperty.call(before, sourceId))
              continue;
          if (!Object.prototype.hasOwnProperty.call(after, sourceId)) {
              removeSource(sourceId, commands, sourcesRemoved);
          }
      }
      // look for sources to add/update
      for (sourceId in after) {
          if (!Object.prototype.hasOwnProperty.call(after, sourceId))
              continue;
          if (!Object.prototype.hasOwnProperty.call(before, sourceId)) {
              addSource(sourceId, after, commands);
          }
          else if (!deepEqual(before[sourceId], after[sourceId])) {
              if (before[sourceId].type === 'geojson' && after[sourceId].type === 'geojson' && canUpdateGeoJSON(before, after, sourceId)) {
                  commands.push({ command: operations.setGeoJSONSourceData, args: [sourceId, after[sourceId].data] });
              }
              else {
                  // no update command, must remove then add
                  updateSource(sourceId, after, commands, sourcesRemoved);
              }
          }
      }
  }
  function diffLayerPropertyChanges(before, after, commands, layerId, klass, command) {
      before = before || {};
      after = after || {};
      let prop;
      for (prop in before) {
          if (!Object.prototype.hasOwnProperty.call(before, prop))
              continue;
          if (!deepEqual(before[prop], after[prop])) {
              commands.push({ command, args: [layerId, prop, after[prop], klass] });
          }
      }
      for (prop in after) {
          if (!Object.prototype.hasOwnProperty.call(after, prop) || Object.prototype.hasOwnProperty.call(before, prop))
              continue;
          if (!deepEqual(before[prop], after[prop])) {
              commands.push({ command, args: [layerId, prop, after[prop], klass] });
          }
      }
  }
  function pluckId(layer) {
      return layer.id;
  }
  function indexById(group, layer) {
      group[layer.id] = layer;
      return group;
  }
  function diffLayers(before, after, commands) {
      before = before || [];
      after = after || [];
      // order of layers by id
      const beforeOrder = before.map(pluckId);
      const afterOrder = after.map(pluckId);
      // index of layer by id
      const beforeIndex = before.reduce(indexById, {});
      const afterIndex = after.reduce(indexById, {});
      // track order of layers as if they have been mutated
      const tracker = beforeOrder.slice();
      // layers that have been added do not need to be diffed
      const clean = Object.create(null);
      let i, d, layerId, beforeLayer, afterLayer, insertBeforeLayerId, prop;
      // remove layers
      for (i = 0, d = 0; i < beforeOrder.length; i++) {
          layerId = beforeOrder[i];
          if (!Object.prototype.hasOwnProperty.call(afterIndex, layerId)) {
              commands.push({ command: operations.removeLayer, args: [layerId] });
              tracker.splice(tracker.indexOf(layerId, d), 1);
          }
          else {
              // limit where in tracker we need to look for a match
              d++;
          }
      }
      // add/reorder layers
      for (i = 0, d = 0; i < afterOrder.length; i++) {
          // work backwards as insert is before an existing layer
          layerId = afterOrder[afterOrder.length - 1 - i];
          if (tracker[tracker.length - 1 - i] === layerId)
              continue;
          if (Object.prototype.hasOwnProperty.call(beforeIndex, layerId)) {
              // remove the layer before we insert at the correct position
              commands.push({ command: operations.removeLayer, args: [layerId] });
              tracker.splice(tracker.lastIndexOf(layerId, tracker.length - d), 1);
          }
          else {
              // limit where in tracker we need to look for a match
              d++;
          }
          // add layer at correct position
          insertBeforeLayerId = tracker[tracker.length - i];
          commands.push({ command: operations.addLayer, args: [afterIndex[layerId], insertBeforeLayerId] });
          tracker.splice(tracker.length - i, 0, layerId);
          clean[layerId] = true;
      }
      // update layers
      for (i = 0; i < afterOrder.length; i++) {
          layerId = afterOrder[i];
          beforeLayer = beforeIndex[layerId];
          afterLayer = afterIndex[layerId];
          // no need to update if previously added (new or moved)
          if (clean[layerId] || deepEqual(beforeLayer, afterLayer))
              continue;
          // If source, source-layer, or type have changes, then remove the layer
          // and add it back 'from scratch'.
          if (!deepEqual(beforeLayer.source, afterLayer.source) || !deepEqual(beforeLayer['source-layer'], afterLayer['source-layer']) || !deepEqual(beforeLayer.type, afterLayer.type)) {
              commands.push({ command: operations.removeLayer, args: [layerId] });
              // we add the layer back at the same position it was already in, so
              // there's no need to update the `tracker`
              insertBeforeLayerId = tracker[tracker.lastIndexOf(layerId) + 1];
              commands.push({ command: operations.addLayer, args: [afterLayer, insertBeforeLayerId] });
              continue;
          }
          // layout, paint, filter, minzoom, maxzoom
          diffLayerPropertyChanges(beforeLayer.layout, afterLayer.layout, commands, layerId, null, operations.setLayoutProperty);
          diffLayerPropertyChanges(beforeLayer.paint, afterLayer.paint, commands, layerId, null, operations.setPaintProperty);
          if (!deepEqual(beforeLayer.filter, afterLayer.filter)) {
              commands.push({ command: operations.setFilter, args: [layerId, afterLayer.filter] });
          }
          if (!deepEqual(beforeLayer.minzoom, afterLayer.minzoom) || !deepEqual(beforeLayer.maxzoom, afterLayer.maxzoom)) {
              commands.push({ command: operations.setLayerZoomRange, args: [layerId, afterLayer.minzoom, afterLayer.maxzoom] });
          }
          // handle all other layer props, including paint.*
          for (prop in beforeLayer) {
              if (!Object.prototype.hasOwnProperty.call(beforeLayer, prop))
                  continue;
              if (prop === 'layout' || prop === 'paint' || prop === 'filter' ||
                  prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom')
                  continue;
              if (prop.indexOf('paint.') === 0) {
                  diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), operations.setPaintProperty);
              }
              else if (!deepEqual(beforeLayer[prop], afterLayer[prop])) {
                  commands.push({ command: operations.setLayerProperty, args: [layerId, prop, afterLayer[prop]] });
              }
          }
          for (prop in afterLayer) {
              if (!Object.prototype.hasOwnProperty.call(afterLayer, prop) || Object.prototype.hasOwnProperty.call(beforeLayer, prop))
                  continue;
              if (prop === 'layout' || prop === 'paint' || prop === 'filter' ||
                  prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom')
                  continue;
              if (prop.indexOf('paint.') === 0) {
                  diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), operations.setPaintProperty);
              }
              else if (!deepEqual(beforeLayer[prop], afterLayer[prop])) {
                  commands.push({ command: operations.setLayerProperty, args: [layerId, prop, afterLayer[prop]] });
              }
          }
      }
  }
  /**
   * Diff two stylesheet
   *
   * Creates semanticly aware diffs that can easily be applied at runtime.
   * Operations produced by the diff closely resemble the maplibre-gl-js API. Any
   * error creating the diff will fall back to the 'setStyle' operation.
   *
   * Example diff:
   * [
   *     { command: 'setConstant', args: ['@water', '#0000FF'] },
   *     { command: 'setPaintProperty', args: ['background', 'background-color', 'black'] }
   * ]
   *
   * @private
   * @param {*} [before] stylesheet to compare from
   * @param {*} after stylesheet to compare to
   * @returns Array list of changes
   */
  function diffStyles(before, after) {
      if (!before)
          return [{ command: operations.setStyle, args: [after] }];
      let commands = [];
      try {
          // Handle changes to top-level properties
          if (!deepEqual(before.version, after.version)) {
              return [{ command: operations.setStyle, args: [after] }];
          }
          if (!deepEqual(before.center, after.center)) {
              commands.push({ command: operations.setCenter, args: [after.center] });
          }
          if (!deepEqual(before.zoom, after.zoom)) {
              commands.push({ command: operations.setZoom, args: [after.zoom] });
          }
          if (!deepEqual(before.bearing, after.bearing)) {
              commands.push({ command: operations.setBearing, args: [after.bearing] });
          }
          if (!deepEqual(before.pitch, after.pitch)) {
              commands.push({ command: operations.setPitch, args: [after.pitch] });
          }
          if (!deepEqual(before.sprite, after.sprite)) {
              commands.push({ command: operations.setSprite, args: [after.sprite] });
          }
          if (!deepEqual(before.glyphs, after.glyphs)) {
              commands.push({ command: operations.setGlyphs, args: [after.glyphs] });
          }
          if (!deepEqual(before.transition, after.transition)) {
              commands.push({ command: operations.setTransition, args: [after.transition] });
          }
          if (!deepEqual(before.light, after.light)) {
              commands.push({ command: operations.setLight, args: [after.light] });
          }
          // Handle changes to `sources`
          // If a source is to be removed, we also--before the removeSource
          // command--need to remove all the style layers that depend on it.
          const sourcesRemoved = {};
          // First collect the {add,remove}Source commands
          const removeOrAddSourceCommands = [];
          diffSources(before.sources, after.sources, removeOrAddSourceCommands, sourcesRemoved);
          // Push a removeLayer command for each style layer that depends on a
          // source that's being removed.
          // Also, exclude any such layers them from the input to `diffLayers`
          // below, so that diffLayers produces the appropriate `addLayers`
          // command
          const beforeLayers = [];
          if (before.layers) {
              before.layers.forEach((layer) => {
                  if (sourcesRemoved[layer.source]) {
                      commands.push({ command: operations.removeLayer, args: [layer.id] });
                  }
                  else {
                      beforeLayers.push(layer);
                  }
              });
          }
          commands = commands.concat(removeOrAddSourceCommands);
          // Handle changes to `layers`
          diffLayers(beforeLayers, after.layers, commands);
      }
      catch (e) {
          // fall back to setStyle
          console.warn('Unable to compute style diff:', e);
          commands = [{ command: operations.setStyle, args: [after] }];
      }
      return commands;
  }

  // Note: Do not inherit from Error. It breaks when transpiling to ES5.
  class ValidationError {
      constructor(key, value, message, identifier) {
          this.message = (key ? `${key}: ` : '') + message;
          if (identifier)
              this.identifier = identifier;
          if (value !== null && value !== undefined && value.__line__) {
              this.line = value.__line__;
          }
      }
  }

  // Note: Do not inherit from Error. It breaks when transpiling to ES5.
  class ParsingError {
      constructor(error) {
          this.error = error;
          this.message = error.message;
          const match = error.message.match(/line (\d+)/);
          this.line = match ? parseInt(match[1], 10) : 0;
      }
  }

  function validateConstants(options) {
      const key = options.key;
      const constants = options.value;
      if (constants) {
          return [new ValidationError(key, constants, 'constants have been deprecated as of v8')];
      }
      else {
          return [];
      }
  }

  // Turn jsonlint-lines-primitives objects into primitive objects
  function unbundle(value) {
      if (value instanceof Number || value instanceof String || value instanceof Boolean) {
          return value.valueOf();
      }
      else {
          return value;
      }
  }
  function deepUnbundle(value) {
      if (Array.isArray(value)) {
          return value.map(deepUnbundle);
      }
      else if (value instanceof Object && !(value instanceof Number || value instanceof String || value instanceof Boolean)) {
          const unbundledValue = {};
          for (const key in value) {
              unbundledValue[key] = deepUnbundle(value[key]);
          }
          return unbundledValue;
      }
      return unbundle(value);
  }

  function validateObject(options) {
      const key = options.key;
      const object = options.value;
      const elementSpecs = options.valueSpec || {};
      const elementValidators = options.objectElementValidators || {};
      const style = options.style;
      const styleSpec = options.styleSpec;
      const validateSpec = options.validateSpec;
      let errors = [];
      const type = getType(object);
      if (type !== 'object') {
          return [new ValidationError(key, object, `object expected, ${type} found`)];
      }
      for (const objectKey in object) {
          const elementSpecKey = objectKey.split('.')[0]; // treat 'paint.*' as 'paint'
          const elementSpec = elementSpecs[elementSpecKey] || elementSpecs['*'];
          let validateElement;
          if (elementValidators[elementSpecKey]) {
              validateElement = elementValidators[elementSpecKey];
          }
          else if (elementSpecs[elementSpecKey]) {
              validateElement = validateSpec;
          }
          else if (elementValidators['*']) {
              validateElement = elementValidators['*'];
          }
          else if (elementSpecs['*']) {
              validateElement = validateSpec;
          }
          else {
              errors.push(new ValidationError(key, object[objectKey], `unknown property "${objectKey}"`));
              continue;
          }
          errors = errors.concat(validateElement({
              key: (key ? `${key}.` : key) + objectKey,
              value: object[objectKey],
              valueSpec: elementSpec,
              style,
              styleSpec,
              object,
              objectKey,
              validateSpec,
          }, object));
      }
      for (const elementSpecKey in elementSpecs) {
          // Don't check `required` when there's a custom validator for that property.
          if (elementValidators[elementSpecKey]) {
              continue;
          }
          if (elementSpecs[elementSpecKey].required && elementSpecs[elementSpecKey]['default'] === undefined && object[elementSpecKey] === undefined) {
              errors.push(new ValidationError(key, object, `missing required property "${elementSpecKey}"`));
          }
      }
      return errors;
  }

  function validateArray(options) {
      const array = options.value;
      const arraySpec = options.valueSpec;
      const validateSpec = options.validateSpec;
      const style = options.style;
      const styleSpec = options.styleSpec;
      const key = options.key;
      const validateArrayElement = options.arrayElementValidator || validateSpec;
      if (getType(array) !== 'array') {
          return [new ValidationError(key, array, `array expected, ${getType(array)} found`)];
      }
      if (arraySpec.length && array.length !== arraySpec.length) {
          return [new ValidationError(key, array, `array length ${arraySpec.length} expected, length ${array.length} found`)];
      }
      if (arraySpec['min-length'] && array.length < arraySpec['min-length']) {
          return [new ValidationError(key, array, `array length at least ${arraySpec['min-length']} expected, length ${array.length} found`)];
      }
      let arrayElementSpec = {
          'type': arraySpec.value,
          'values': arraySpec.values
      };
      if (styleSpec.$version < 7) {
          arrayElementSpec['function'] = arraySpec.function;
      }
      if (getType(arraySpec.value) === 'object') {
          arrayElementSpec = arraySpec.value;
      }
      let errors = [];
      for (let i = 0; i < array.length; i++) {
          errors = errors.concat(validateArrayElement({
              array,
              arrayIndex: i,
              value: array[i],
              valueSpec: arrayElementSpec,
              validateSpec: options.validateSpec,
              style,
              styleSpec,
              key: `${key}[${i}]`
          }));
      }
      return errors;
  }

  function validateNumber(options) {
      const key = options.key;
      const value = options.value;
      const valueSpec = options.valueSpec;
      let type = getType(value);
      // eslint-disable-next-line no-self-compare
      if (type === 'number' && value !== value) {
          type = 'NaN';
      }
      if (type !== 'number') {
          return [new ValidationError(key, value, `number expected, ${type} found`)];
      }
      if ('minimum' in valueSpec && value < valueSpec.minimum) {
          return [new ValidationError(key, value, `${value} is less than the minimum value ${valueSpec.minimum}`)];
      }
      if ('maximum' in valueSpec && value > valueSpec.maximum) {
          return [new ValidationError(key, value, `${value} is greater than the maximum value ${valueSpec.maximum}`)];
      }
      return [];
  }

  function validateFunction(options) {
      const functionValueSpec = options.valueSpec;
      const functionType = unbundle(options.value.type);
      let stopKeyType;
      let stopDomainValues = {};
      let previousStopDomainValue;
      let previousStopDomainZoom;
      const isZoomFunction = functionType !== 'categorical' && options.value.property === undefined;
      const isPropertyFunction = !isZoomFunction;
      const isZoomAndPropertyFunction = getType(options.value.stops) === 'array' &&
          getType(options.value.stops[0]) === 'array' &&
          getType(options.value.stops[0][0]) === 'object';
      const errors = validateObject({
          key: options.key,
          value: options.value,
          valueSpec: options.styleSpec.function,
          validateSpec: options.validateSpec,
          style: options.style,
          styleSpec: options.styleSpec,
          objectElementValidators: {
              stops: validateFunctionStops,
              default: validateFunctionDefault
          }
      });
      if (functionType === 'identity' && isZoomFunction) {
          errors.push(new ValidationError(options.key, options.value, 'missing required property "property"'));
      }
      if (functionType !== 'identity' && !options.value.stops) {
          errors.push(new ValidationError(options.key, options.value, 'missing required property "stops"'));
      }
      if (functionType === 'exponential' && options.valueSpec.expression && !supportsInterpolation(options.valueSpec)) {
          errors.push(new ValidationError(options.key, options.value, 'exponential functions not supported'));
      }
      if (options.styleSpec.$version >= 8) {
          if (isPropertyFunction && !supportsPropertyExpression(options.valueSpec)) {
              errors.push(new ValidationError(options.key, options.value, 'property functions not supported'));
          }
          else if (isZoomFunction && !supportsZoomExpression(options.valueSpec)) {
              errors.push(new ValidationError(options.key, options.value, 'zoom functions not supported'));
          }
      }
      if ((functionType === 'categorical' || isZoomAndPropertyFunction) && options.value.property === undefined) {
          errors.push(new ValidationError(options.key, options.value, '"property" property is required'));
      }
      return errors;
      function validateFunctionStops(options) {
          if (functionType === 'identity') {
              return [new ValidationError(options.key, options.value, 'identity function may not have a "stops" property')];
          }
          let errors = [];
          const value = options.value;
          errors = errors.concat(validateArray({
              key: options.key,
              value,
              valueSpec: options.valueSpec,
              validateSpec: options.validateSpec,
              style: options.style,
              styleSpec: options.styleSpec,
              arrayElementValidator: validateFunctionStop
          }));
          if (getType(value) === 'array' && value.length === 0) {
              errors.push(new ValidationError(options.key, value, 'array must have at least one stop'));
          }
          return errors;
      }
      function validateFunctionStop(options) {
          let errors = [];
          const value = options.value;
          const key = options.key;
          if (getType(value) !== 'array') {
              return [new ValidationError(key, value, `array expected, ${getType(value)} found`)];
          }
          if (value.length !== 2) {
              return [new ValidationError(key, value, `array length 2 expected, length ${value.length} found`)];
          }
          if (isZoomAndPropertyFunction) {
              if (getType(value[0]) !== 'object') {
                  return [new ValidationError(key, value, `object expected, ${getType(value[0])} found`)];
              }
              if (value[0].zoom === undefined) {
                  return [new ValidationError(key, value, 'object stop key must have zoom')];
              }
              if (value[0].value === undefined) {
                  return [new ValidationError(key, value, 'object stop key must have value')];
              }
              if (previousStopDomainZoom && previousStopDomainZoom > unbundle(value[0].zoom)) {
                  return [new ValidationError(key, value[0].zoom, 'stop zoom values must appear in ascending order')];
              }
              if (unbundle(value[0].zoom) !== previousStopDomainZoom) {
                  previousStopDomainZoom = unbundle(value[0].zoom);
                  previousStopDomainValue = undefined;
                  stopDomainValues = {};
              }
              errors = errors.concat(validateObject({
                  key: `${key}[0]`,
                  value: value[0],
                  valueSpec: { zoom: {} },
                  validateSpec: options.validateSpec,
                  style: options.style,
                  styleSpec: options.styleSpec,
                  objectElementValidators: { zoom: validateNumber, value: validateStopDomainValue }
              }));
          }
          else {
              errors = errors.concat(validateStopDomainValue({
                  key: `${key}[0]`,
                  value: value[0],
                  valueSpec: {},
                  validateSpec: options.validateSpec,
                  style: options.style,
                  styleSpec: options.styleSpec
              }, value));
          }
          if (isExpression(deepUnbundle(value[1]))) {
              return errors.concat([new ValidationError(`${key}[1]`, value[1], 'expressions are not allowed in function stops.')]);
          }
          return errors.concat(options.validateSpec({
              key: `${key}[1]`,
              value: value[1],
              valueSpec: functionValueSpec,
              validateSpec: options.validateSpec,
              style: options.style,
              styleSpec: options.styleSpec
          }));
      }
      function validateStopDomainValue(options, stop) {
          const type = getType(options.value);
          const value = unbundle(options.value);
          const reportValue = options.value !== null ? options.value : stop;
          if (!stopKeyType) {
              stopKeyType = type;
          }
          else if (type !== stopKeyType) {
              return [new ValidationError(options.key, reportValue, `${type} stop domain type must match previous stop domain type ${stopKeyType}`)];
          }
          if (type !== 'number' && type !== 'string' && type !== 'boolean') {
              return [new ValidationError(options.key, reportValue, 'stop domain value must be a number, string, or boolean')];
          }
          if (type !== 'number' && functionType !== 'categorical') {
              let message = `number expected, ${type} found`;
              if (supportsPropertyExpression(functionValueSpec) && functionType === undefined) {
                  message += '\nIf you intended to use a categorical function, specify `"type": "categorical"`.';
              }
              return [new ValidationError(options.key, reportValue, message)];
          }
          if (functionType === 'categorical' && type === 'number' && (!isFinite(value) || Math.floor(value) !== value)) {
              return [new ValidationError(options.key, reportValue, `integer expected, found ${value}`)];
          }
          if (functionType !== 'categorical' && type === 'number' && previousStopDomainValue !== undefined && value < previousStopDomainValue) {
              return [new ValidationError(options.key, reportValue, 'stop domain values must appear in ascending order')];
          }
          else {
              previousStopDomainValue = value;
          }
          if (functionType === 'categorical' && value in stopDomainValues) {
              return [new ValidationError(options.key, reportValue, 'stop domain values must be unique')];
          }
          else {
              stopDomainValues[value] = true;
          }
          return [];
      }
      function validateFunctionDefault(options) {
          return options.validateSpec({
              key: options.key,
              value: options.value,
              valueSpec: functionValueSpec,
              validateSpec: options.validateSpec,
              style: options.style,
              styleSpec: options.styleSpec
          });
      }
  }

  function validateExpression(options) {
      const expression = (options.expressionContext === 'property' ? createPropertyExpression : createExpression)(deepUnbundle(options.value), options.valueSpec);
      if (expression.result === 'error') {
          return expression.value.map((error) => {
              return new ValidationError(`${options.key}${error.key}`, options.value, error.message);
          });
      }
      const expressionObj = expression.value.expression || expression.value._styleExpression.expression;
      if (options.expressionContext === 'property' && (options.propertyKey === 'text-font') &&
          !expressionObj.outputDefined()) {
          return [new ValidationError(options.key, options.value, `Invalid data expression for "${options.propertyKey}". Output values must be contained as literals within the expression.`)];
      }
      if (options.expressionContext === 'property' && options.propertyType === 'layout' &&
          (!isStateConstant(expressionObj))) {
          return [new ValidationError(options.key, options.value, '"feature-state" data expressions are not supported with layout properties.')];
      }
      if (options.expressionContext === 'filter' && !isStateConstant(expressionObj)) {
          return [new ValidationError(options.key, options.value, '"feature-state" data expressions are not supported with filters.')];
      }
      if (options.expressionContext && options.expressionContext.indexOf('cluster') === 0) {
          if (!isGlobalPropertyConstant(expressionObj, ['zoom', 'feature-state'])) {
              return [new ValidationError(options.key, options.value, '"zoom" and "feature-state" expressions are not supported with cluster properties.')];
          }
          if (options.expressionContext === 'cluster-initial' && !isFeatureConstant(expressionObj)) {
              return [new ValidationError(options.key, options.value, 'Feature data expressions are not supported with initial expression part of cluster properties.')];
          }
      }
      return [];
  }

  function validateBoolean(options) {
      const value = options.value;
      const key = options.key;
      const type = getType(value);
      if (type !== 'boolean') {
          return [new ValidationError(key, value, `boolean expected, ${type} found`)];
      }
      return [];
  }

  function validateColor(options) {
      const key = options.key;
      const value = options.value;
      const type = getType(value);
      if (type !== 'string') {
          return [new ValidationError(key, value, `color expected, ${type} found`)];
      }
      if (csscolorparser.parseCSSColor(value) === null) {
          return [new ValidationError(key, value, `color expected, "${value}" found`)];
      }
      return [];
  }

  function validateEnum(options) {
      const key = options.key;
      const value = options.value;
      const valueSpec = options.valueSpec;
      const errors = [];
      if (Array.isArray(valueSpec.values)) { // <=v7
          if (valueSpec.values.indexOf(unbundle(value)) === -1) {
              errors.push(new ValidationError(key, value, `expected one of [${valueSpec.values.join(', ')}], ${JSON.stringify(value)} found`));
          }
      }
      else { // >=v8
          if (Object.keys(valueSpec.values).indexOf(unbundle(value)) === -1) {
              errors.push(new ValidationError(key, value, `expected one of [${Object.keys(valueSpec.values).join(', ')}], ${JSON.stringify(value)} found`));
          }
      }
      return errors;
  }

  function validateFilter(options) {
      if (isExpressionFilter(deepUnbundle(options.value))) {
          return validateExpression(extendBy({}, options, {
              expressionContext: 'filter',
              valueSpec: { value: 'boolean' }
          }));
      }
      else {
          return validateNonExpressionFilter(options);
      }
  }
  function validateNonExpressionFilter(options) {
      const value = options.value;
      const key = options.key;
      if (getType(value) !== 'array') {
          return [new ValidationError(key, value, `array expected, ${getType(value)} found`)];
      }
      const styleSpec = options.styleSpec;
      let type;
      let errors = [];
      if (value.length < 1) {
          return [new ValidationError(key, value, 'filter array must have at least 1 element')];
      }
      errors = errors.concat(validateEnum({
          key: `${key}[0]`,
          value: value[0],
          valueSpec: styleSpec.filter_operator,
          style: options.style,
          styleSpec: options.styleSpec
      }));
      switch (unbundle(value[0])) {
          case '<':
          case '<=':
          case '>':
          case '>=':
              if (value.length >= 2 && unbundle(value[1]) === '$type') {
                  errors.push(new ValidationError(key, value, `"$type" cannot be use with operator "${value[0]}"`));
              }
          /* falls through */
          case '==':
          case '!=':
              if (value.length !== 3) {
                  errors.push(new ValidationError(key, value, `filter array for operator "${value[0]}" must have 3 elements`));
              }
          /* falls through */
          case 'in':
          case '!in':
              if (value.length >= 2) {
                  type = getType(value[1]);
                  if (type !== 'string') {
                      errors.push(new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`));
                  }
              }
              for (let i = 2; i < value.length; i++) {
                  type = getType(value[i]);
                  if (unbundle(value[1]) === '$type') {
                      errors = errors.concat(validateEnum({
                          key: `${key}[${i}]`,
                          value: value[i],
                          valueSpec: styleSpec.geometry_type,
                          style: options.style,
                          styleSpec: options.styleSpec
                      }));
                  }
                  else if (type !== 'string' && type !== 'number' && type !== 'boolean') {
                      errors.push(new ValidationError(`${key}[${i}]`, value[i], `string, number, or boolean expected, ${type} found`));
                  }
              }
              break;
          case 'any':
          case 'all':
          case 'none':
              for (let i = 1; i < value.length; i++) {
                  errors = errors.concat(validateNonExpressionFilter({
                      key: `${key}[${i}]`,
                      value: value[i],
                      style: options.style,
                      styleSpec: options.styleSpec
                  }));
              }
              break;
          case 'has':
          case '!has':
              type = getType(value[1]);
              if (value.length !== 2) {
                  errors.push(new ValidationError(key, value, `filter array for "${value[0]}" operator must have 2 elements`));
              }
              else if (type !== 'string') {
                  errors.push(new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`));
              }
              break;
          case 'within':
              type = getType(value[1]);
              if (value.length !== 2) {
                  errors.push(new ValidationError(key, value, `filter array for "${value[0]}" operator must have 2 elements`));
              }
              else if (type !== 'object') {
                  errors.push(new ValidationError(`${key}[1]`, value[1], `object expected, ${type} found`));
              }
              break;
      }
      return errors;
  }

  function validateProperty(options, propertyType) {
      const key = options.key;
      const validateSpec = options.validateSpec;
      const style = options.style;
      const styleSpec = options.styleSpec;
      const value = options.value;
      const propertyKey = options.objectKey;
      const layerSpec = styleSpec[`${propertyType}_${options.layerType}`];
      if (!layerSpec)
          return [];
      const transitionMatch = propertyKey.match(/^(.*)-transition$/);
      if (propertyType === 'paint' && transitionMatch && layerSpec[transitionMatch[1]] && layerSpec[transitionMatch[1]].transition) {
          return validateSpec({
              key,
              value,
              valueSpec: styleSpec.transition,
              style,
              styleSpec
          });
      }
      const valueSpec = options.valueSpec || layerSpec[propertyKey];
      if (!valueSpec) {
          return [new ValidationError(key, value, `unknown property "${propertyKey}"`)];
      }
      let tokenMatch;
      if (getType(value) === 'string' && supportsPropertyExpression(valueSpec) && !valueSpec.tokens && (tokenMatch = /^{([^}]+)}$/.exec(value))) {
          return [new ValidationError(key, value, `"${propertyKey}" does not support interpolation syntax\n` +
                  `Use an identity property function instead: \`{ "type": "identity", "property": ${JSON.stringify(tokenMatch[1])} }\`.`)];
      }
      const errors = [];
      if (options.layerType === 'symbol') {
          if (propertyKey === 'text-field' && style && !style.glyphs) {
              errors.push(new ValidationError(key, value, 'use of "text-field" requires a style "glyphs" property'));
          }
          if (propertyKey === 'text-font' && isFunction(deepUnbundle(value)) && unbundle(value.type) === 'identity') {
              errors.push(new ValidationError(key, value, '"text-font" does not support identity functions'));
          }
      }
      return errors.concat(validateSpec({
          key: options.key,
          value,
          valueSpec,
          style,
          styleSpec,
          expressionContext: 'property',
          propertyType,
          propertyKey
      }));
  }

  function validatePaintProperty(options) {
      return validateProperty(options, 'paint');
  }

  function validateLayoutProperty(options) {
      return validateProperty(options, 'layout');
  }

  function validateLayer(options) {
      let errors = [];
      const layer = options.value;
      const key = options.key;
      const style = options.style;
      const styleSpec = options.styleSpec;
      if (!layer.type && !layer.ref) {
          errors.push(new ValidationError(key, layer, 'either "type" or "ref" is required'));
      }
      let type = unbundle(layer.type);
      const ref = unbundle(layer.ref);
      if (layer.id) {
          const layerId = unbundle(layer.id);
          for (let i = 0; i < options.arrayIndex; i++) {
              const otherLayer = style.layers[i];
              if (unbundle(otherLayer.id) === layerId) {
                  errors.push(new ValidationError(key, layer.id, `duplicate layer id "${layer.id}", previously used at line ${otherLayer.id.__line__}`));
              }
          }
      }
      if ('ref' in layer) {
          ['type', 'source', 'source-layer', 'filter', 'layout'].forEach((p) => {
              if (p in layer) {
                  errors.push(new ValidationError(key, layer[p], `"${p}" is prohibited for ref layers`));
              }
          });
          let parent;
          style.layers.forEach((layer) => {
              if (unbundle(layer.id) === ref)
                  parent = layer;
          });
          if (!parent) {
              errors.push(new ValidationError(key, layer.ref, `ref layer "${ref}" not found`));
          }
          else if (parent.ref) {
              errors.push(new ValidationError(key, layer.ref, 'ref cannot reference another ref layer'));
          }
          else {
              type = unbundle(parent.type);
          }
      }
      else if (type !== 'background') {
          if (!layer.source) {
              errors.push(new ValidationError(key, layer, 'missing required property "source"'));
          }
          else {
              const source = style.sources && style.sources[layer.source];
              const sourceType = source && unbundle(source.type);
              if (!source) {
                  errors.push(new ValidationError(key, layer.source, `source "${layer.source}" not found`));
              }
              else if (sourceType === 'vector' && type === 'raster') {
                  errors.push(new ValidationError(key, layer.source, `layer "${layer.id}" requires a raster source`));
              }
              else if (sourceType === 'raster' && type !== 'raster') {
                  errors.push(new ValidationError(key, layer.source, `layer "${layer.id}" requires a vector source`));
              }
              else if (sourceType === 'vector' && !layer['source-layer']) {
                  errors.push(new ValidationError(key, layer, `layer "${layer.id}" must specify a "source-layer"`));
              }
              else if (sourceType === 'raster-dem' && type !== 'hillshade') {
                  errors.push(new ValidationError(key, layer.source, 'raster-dem source can only be used with layer type \'hillshade\'.'));
              }
              else if (type === 'line' && layer.paint && layer.paint['line-gradient'] &&
                  (sourceType !== 'geojson' || !source.lineMetrics)) {
                  errors.push(new ValidationError(key, layer, `layer "${layer.id}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`));
              }
          }
      }
      errors = errors.concat(validateObject({
          key,
          value: layer,
          valueSpec: styleSpec.layer,
          style: options.style,
          styleSpec: options.styleSpec,
          validateSpec: options.validateSpec,
          objectElementValidators: {
              '*'() {
                  return [];
              },
              // We don't want to enforce the spec's `"requires": true` for backward compatibility with refs;
              // the actual requirement is validated above. See https://github.com/mapbox/mapbox-gl-js/issues/5772.
              type() {
                  return options.validateSpec({
                      key: `${key}.type`,
                      value: layer.type,
                      valueSpec: styleSpec.layer.type,
                      style: options.style,
                      styleSpec: options.styleSpec,
                      validateSpec: options.validateSpec,
                      object: layer,
                      objectKey: 'type'
                  });
              },
              filter: validateFilter,
              layout(options) {
                  return validateObject({
                      layer,
                      key: options.key,
                      value: options.value,
                      style: options.style,
                      styleSpec: options.styleSpec,
                      validateSpec: options.validateSpec,
                      objectElementValidators: {
                          '*'(options) {
                              return validateLayoutProperty(extendBy({ layerType: type }, options));
                          }
                      }
                  });
              },
              paint(options) {
                  return validateObject({
                      layer,
                      key: options.key,
                      value: options.value,
                      style: options.style,
                      styleSpec: options.styleSpec,
                      validateSpec: options.validateSpec,
                      objectElementValidators: {
                          '*'(options) {
                              return validatePaintProperty(extendBy({ layerType: type }, options));
                          }
                      }
                  });
              }
          }
      }));
      return errors;
  }

  function validateString(options) {
      const value = options.value;
      const key = options.key;
      const type = getType(value);
      if (type !== 'string') {
          return [new ValidationError(key, value, `string expected, ${type} found`)];
      }
      return [];
  }

  const objectElementValidators = {
      promoteId: validatePromoteId
  };
  function validateSource(options) {
      const value = options.value;
      const key = options.key;
      const styleSpec = options.styleSpec;
      const style = options.style;
      const validateSpec = options.validateSpec;
      if (!value.type) {
          return [new ValidationError(key, value, '"type" is required')];
      }
      const type = unbundle(value.type);
      let errors;
      switch (type) {
          case 'vector':
          case 'raster':
          case 'raster-dem':
              errors = validateObject({
                  key,
                  value,
                  valueSpec: styleSpec[`source_${type.replace('-', '_')}`],
                  style: options.style,
                  styleSpec,
                  objectElementValidators,
                  validateSpec,
              });
              return errors;
          case 'geojson':
              errors = validateObject({
                  key,
                  value,
                  valueSpec: styleSpec.source_geojson,
                  style,
                  styleSpec,
                  validateSpec,
                  objectElementValidators
              });
              if (value.cluster) {
                  for (const prop in value.clusterProperties) {
                      const [operator, mapExpr] = value.clusterProperties[prop];
                      const reduceExpr = typeof operator === 'string' ? [operator, ['accumulated'], ['get', prop]] : operator;
                      errors.push(...validateExpression({
                          key: `${key}.${prop}.map`,
                          value: mapExpr,
                          validateSpec,
                          expressionContext: 'cluster-map'
                      }));
                      errors.push(...validateExpression({
                          key: `${key}.${prop}.reduce`,
                          value: reduceExpr,
                          validateSpec,
                          expressionContext: 'cluster-reduce'
                      }));
                  }
              }
              return errors;
          case 'video':
              return validateObject({
                  key,
                  value,
                  valueSpec: styleSpec.source_video,
                  style,
                  validateSpec,
                  styleSpec
              });
          case 'image':
              return validateObject({
                  key,
                  value,
                  valueSpec: styleSpec.source_image,
                  style,
                  validateSpec,
                  styleSpec
              });
          case 'canvas':
              return [new ValidationError(key, null, 'Please use runtime APIs to add canvas sources, rather than including them in stylesheets.', 'source.canvas')];
          default:
              return validateEnum({
                  key: `${key}.type`,
                  value: value.type,
                  valueSpec: { values: ['vector', 'raster', 'raster-dem', 'geojson', 'video', 'image'] },
                  style,
                  validateSpec,
                  styleSpec
              });
      }
  }
  function validatePromoteId({ key, value }) {
      if (getType(value) === 'string') {
          return validateString({ key, value });
      }
      else {
          const errors = [];
          for (const prop in value) {
              errors.push(...validateString({ key: `${key}.${prop}`, value: value[prop] }));
          }
          return errors;
      }
  }

  function validateLight(options) {
      const light = options.value;
      const styleSpec = options.styleSpec;
      const lightSpec = styleSpec.light;
      const style = options.style;
      let errors = [];
      const rootType = getType(light);
      if (light === undefined) {
          return errors;
      }
      else if (rootType !== 'object') {
          errors = errors.concat([new ValidationError('light', light, `object expected, ${rootType} found`)]);
          return errors;
      }
      for (const key in light) {
          const transitionMatch = key.match(/^(.*)-transition$/);
          if (transitionMatch && lightSpec[transitionMatch[1]] && lightSpec[transitionMatch[1]].transition) {
              errors = errors.concat(options.validateSpec({
                  key,
                  value: light[key],
                  valueSpec: styleSpec.transition,
                  validateSpec: options.validateSpec,
                  style,
                  styleSpec
              }));
          }
          else if (lightSpec[key]) {
              errors = errors.concat(options.validateSpec({
                  key,
                  value: light[key],
                  valueSpec: lightSpec[key],
                  validateSpec: options.validateSpec,
                  style,
                  styleSpec
              }));
          }
          else {
              errors = errors.concat([new ValidationError(key, light[key], `unknown property "${key}"`)]);
          }
      }
      return errors;
  }

  function validateTerrain(options) {
      const terrain = options.value;
      const styleSpec = options.styleSpec;
      const terrainSpec = styleSpec.terrain;
      const style = options.style;
      let errors = [];
      const rootType = getType(terrain);
      if (terrain === undefined) {
          return errors;
      }
      else if (rootType !== 'object') {
          errors = errors.concat([new ValidationError('terrain', terrain, `object expected, ${rootType} found`)]);
          return errors;
      }
      for (const key in terrain) {
          if (terrainSpec[key]) {
              errors = errors.concat(options.validateSpec({
                  key,
                  value: terrain[key],
                  valueSpec: terrainSpec[key],
                  validateSpec: options.validateSpec,
                  style,
                  styleSpec
              }));
          }
          else {
              errors = errors.concat([new ValidationError(key, terrain[key], `unknown property "${key}"`)]);
          }
      }
      return errors;
  }

  function validateFormatted(options) {
      if (validateString(options).length === 0) {
          return [];
      }
      return validateExpression(options);
  }

  function validateImage(options) {
      if (validateString(options).length === 0) {
          return [];
      }
      return validateExpression(options);
  }

  function validatePadding(options) {
      const key = options.key;
      const value = options.value;
      const type = getType(value);
      if (type === 'array') {
          if (value.length < 1 || value.length > 4) {
              return [new ValidationError(key, value, `padding requires 1 to 4 values; ${value.length} values found`)];
          }
          const arrayElementSpec = {
              type: 'number'
          };
          let errors = [];
          for (let i = 0; i < value.length; i++) {
              errors = errors.concat(options.validateSpec({
                  key: `${key}[${i}]`,
                  value: value[i],
                  validateSpec: options.validateSpec,
                  valueSpec: arrayElementSpec
              }));
          }
          return errors;
      }
      else {
          return validateNumber({
              key,
              value,
              valueSpec: {}
          });
      }
  }

  function validateSprite(options) {
      let errors = [];
      const sprite = options.value;
      const key = options.key;
      if (!Array.isArray(sprite)) {
          return validateString({
              key,
              value: sprite
          });
      }
      else {
          const allSpriteIds = [];
          const allSpriteURLs = [];
          for (const i in sprite) {
              if (sprite[i].id && allSpriteIds.includes(sprite[i].id))
                  errors.push(new ValidationError(key, sprite, `all the sprites' ids must be unique, but ${sprite[i].id} is duplicated`));
              allSpriteIds.push(sprite[i].id);
              if (sprite[i].url && allSpriteURLs.includes(sprite[i].url))
                  errors.push(new ValidationError(key, sprite, `all the sprites' URLs must be unique, but ${sprite[i].url} is duplicated`));
              allSpriteURLs.push(sprite[i].url);
              const pairSpec = {
                  id: {
                      type: 'string',
                      required: true,
                  },
                  url: {
                      type: 'string',
                      required: true,
                  }
              };
              errors = errors.concat(validateObject({
                  key: `${key}[${i}]`,
                  value: sprite[i],
                  valueSpec: pairSpec,
                  validateSpec: options.validateSpec,
              }));
          }
          return errors;
      }
  }

  const VALIDATORS = {
      '*'() {
          return [];
      },
      'array': validateArray,
      'boolean': validateBoolean,
      'number': validateNumber,
      'color': validateColor,
      'constants': validateConstants,
      'enum': validateEnum,
      'filter': validateFilter,
      'function': validateFunction,
      'layer': validateLayer,
      'object': validateObject,
      'source': validateSource,
      'light': validateLight,
      'terrain': validateTerrain,
      'string': validateString,
      'formatted': validateFormatted,
      'resolvedImage': validateImage,
      'padding': validatePadding,
      'sprite': validateSprite,
  };
  // Main recursive validation function. Tracks:
  //
  // - key: string representing location of validation in style tree. Used only
  //   for more informative error reporting.
  // - value: current value from style being evaluated. May be anything from a
  //   high level object that needs to be descended into deeper or a simple
  //   scalar value.
  // - valueSpec: current spec being evaluated. Tracks value.
  // - styleSpec: current full spec being evaluated.
  function validate(options) {
      const value = options.value;
      const valueSpec = options.valueSpec;
      const styleSpec = options.styleSpec;
      options.validateSpec = validate;
      if (valueSpec.expression && isFunction(unbundle(value))) {
          return validateFunction(options);
      }
      else if (valueSpec.expression && isExpression(deepUnbundle(value))) {
          return validateExpression(options);
      }
      else if (valueSpec.type && VALIDATORS[valueSpec.type]) {
          return VALIDATORS[valueSpec.type](options);
      }
      else {
          const valid = validateObject(extendBy({}, options, {
              valueSpec: valueSpec.type ? styleSpec[valueSpec.type] : valueSpec
          }));
          return valid;
      }
  }

  function validateGlyphsUrl(options) {
      const value = options.value;
      const key = options.key;
      const errors = validateString(options);
      if (errors.length)
          return errors;
      if (value.indexOf('{fontstack}') === -1) {
          errors.push(new ValidationError(key, value, '"glyphs" url must include a "{fontstack}" token'));
      }
      if (value.indexOf('{range}') === -1) {
          errors.push(new ValidationError(key, value, '"glyphs" url must include a "{range}" token'));
      }
      return errors;
  }

  /**
   * Validate a MapLibre GL style against the style specification. This entrypoint,
   * `maplibre-gl-style-spec/lib/validate_style.min`, is designed to produce as
   * small a browserify bundle as possible by omitting unnecessary functionality
   * and legacy style specifications.
   *
   * @private
   * @param {Object} style The style to be validated.
   * @param {Object} [styleSpec] The style specification to validate against.
   *     If omitted, the latest style spec is used.
   * @returns {Array<ValidationError>}
   * @example
   *   var validate = require('maplibre-gl-style-spec/lib/validate_style.min');
   *   var errors = validate(style);
   */
  function validateStyleMin(style, styleSpec = v8Spec) {
      let errors = [];
      errors = errors.concat(validate({
          key: '',
          value: style,
          valueSpec: styleSpec.$root,
          styleSpec,
          style,
          validateSpec: validate,
          objectElementValidators: {
              glyphs: validateGlyphsUrl,
              '*'() {
                  return [];
              }
          }
      }));
      if (style['constants']) {
          errors = errors.concat(validateConstants({
              key: 'constants',
              value: style['constants'],
              style,
              styleSpec,
              validateSpec: validate,
          }));
      }
      return sortErrors(errors);
  }
  validateStyleMin.source = wrapCleanErrors(injectValidateSpec(validateSource));
  validateStyleMin.sprite = wrapCleanErrors(injectValidateSpec(validateSprite));
  validateStyleMin.glyphs = wrapCleanErrors(injectValidateSpec(validateGlyphsUrl));
  validateStyleMin.light = wrapCleanErrors(injectValidateSpec(validateLight));
  validateStyleMin.terrain = wrapCleanErrors(injectValidateSpec(validateTerrain));
  validateStyleMin.layer = wrapCleanErrors(injectValidateSpec(validateLayer));
  validateStyleMin.filter = wrapCleanErrors(injectValidateSpec(validateFilter));
  validateStyleMin.paintProperty = wrapCleanErrors(injectValidateSpec(validatePaintProperty));
  validateStyleMin.layoutProperty = wrapCleanErrors(injectValidateSpec(validateLayoutProperty));
  function injectValidateSpec(validator) {
      return function (options) {
          return validator({
              ...options,
              validateSpec: validate,
          });
      };
  }
  function sortErrors(errors) {
      return [].concat(errors).sort((a, b) => {
          return a.line - b.line;
      });
  }
  function wrapCleanErrors(inner) {
      return function (...args) {
          return sortErrors(inner.apply(this, args));
      };
  }

  function readStyle(style) {
      if (style instanceof String || typeof style === 'string' || style instanceof Buffer) {
          try {
              return jsonlint.parse(style.toString());
          }
          catch (e) {
              throw new ParsingError(e);
          }
      }
      return style;
  }

  /**
   * Validate a Mapbox GL style against the style specification.
   *
   * @private
   * @alias validate
   * @param {StyleSpecification|string|Buffer} style The style to be validated. If a `String`
   *     or `Buffer` is provided, the returned errors will contain line numbers.
   * @param {Object} [styleSpec] The style specification to validate against.
   *     If omitted, the spec version is inferred from the stylesheet.
   * @returns {Array<ValidationError|ParsingError>}
   * @example
   *   var validate = require('maplibre-gl-style-spec').validate;
   *   var style = fs.readFileSync('./style.json', 'utf8');
   *   var errors = validate(style);
   */
  function validateStyle(style, styleSpec = v8) {
      let s = style;
      try {
          s = readStyle(s);
      }
      catch (e) {
          return [e];
      }
      return validateStyleMin(s, styleSpec);
  }

  const v8 = v8Spec;
  const expression = {
      StyleExpression,
      isExpression,
      isExpressionFilter,
      createExpression,
      createPropertyExpression,
      normalizePropertyExpression,
      ZoomConstantExpression,
      ZoomDependentExpression,
      StylePropertyFunction
  };
  const styleFunction = {
      convertFunction,
      createFunction,
      isFunction
  };
  const visit = { eachSource, eachLayer, eachProperty };

  exports.Color = Color;
  exports.Padding = Padding;
  exports.ParsingError = ParsingError;
  exports.ValidationError = ValidationError;
  exports.convertFilter = convertFilter;
  exports.derefLayers = derefLayers;
  exports.diff = diffStyles;
  exports.expression = expression;
  exports.featureFilter = createFilter;
  exports.format = format;
  exports.function = styleFunction;
  exports.latest = v8Spec;
  exports.migrate = migrate;
  exports.v8 = v8;
  exports.validate = validateStyle;
  exports.visit = visit;

}));
//# sourceMappingURL=index.cjs.map
