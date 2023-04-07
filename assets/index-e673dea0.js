import{g as pe,a as t,i as o,c as i,t as me}from"./entry-client-e66f88b6.js";import{M as s}from"./markdown-caad30ca.js";import{s as r}from"./v8-c0965a88.js";import{I as n}from"./items-98146b5a.js";import{S as a}from"./property-9aa3b88c.js";import"./subtitle-7af82e94.js";const ge=me("<div><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/>");function _e(){const T=["vector","raster","raster-dem","geojson","image","video"];return(()=>{const e=pe(ge),w=e.firstChild,[l,L]=t(w.nextSibling),z=l.nextSibling,[c,k]=t(z.nextSibling),M=c.nextSibling,[p,G]=t(M.nextSibling),N=p.nextSibling,[m,O]=t(N.nextSibling),A=m.nextSibling,[g,I]=t(A.nextSibling),J=g.nextSibling,[u,R]=t(J.nextSibling),U=u.nextSibling,[d,E]=t(U.nextSibling),B=d.nextSibling,[b,P]=t(B.nextSibling),C=b.nextSibling,[h,D]=t(C.nextSibling),W=h.nextSibling,[x,F]=t(W.nextSibling),q=x.nextSibling,[y,H]=t(q.nextSibling),K=y.nextSibling,[_,V]=t(K.nextSibling),Q=_.nextSibling,[S,X]=t(Q.nextSibling),Y=S.nextSibling,[$,Z]=t(Y.nextSibling),ee=$.nextSibling,[v,te]=t(ee.nextSibling),oe=v.nextSibling,[f,ie]=t(oe.nextSibling),se=f.nextSibling,[j,re]=t(se.nextSibling),ne=j.nextSibling,[ae,le]=t(ne.nextSibling);return o(e,i(s,{get content(){return`# Sources
Sources state which data the map should display. Specify the type of source with the \`"type"\` property, which must be one of 
${T.map(ce=>`\`${ce}\``).join(", ")}. Adding a source isn't enough to make data appear on the map because sources don't contain styling details like color or width. Layers refer to a source and give it a visual representation. This makes it possible to style the same source in different ways, like differentiating between types of roads in a highways layer.

Tiled sources (vector and raster) must specify their details according to the [TileJSON specification](https://github.com/mapbox/tilejson-spec). There are several ways to do so:
- By supplying TileJSON properties such as \`"tiles"\`, \`"minzoom"\`, and \`"maxzoom"\` directly in the source:

\`\`\`json
"maplibre-streets": {
    "type": "vector",
    "tiles": [
        "http://a.example.com/tiles/{z}/{x}/{y}.pbf",
        "http://b.example.com/tiles/{z}/{x}/{y}.pbf"
    ],
    "maxzoom": 14
}
\`\`\`

- By providing a \`"url"\` to a TileJSON resource:

\`\`\`json
"maplibre-streets": {
    "type": "vector",
    "url": "http://api.example.com/tilejson.json"
}
\`\`\`

- By providing a URL to a WMS server that supports EPSG:3857 (or EPSG:900913) as a source of tiled data. The server URL should contain a \`"{bbox-epsg-3857}"\` replacement token to supply the \`bbox\` parameter.

\`\`\`json
"wms-imagery": {
    "type": "raster",
    "tiles": [
        "http://a.example.com/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=example"
    ],
    "tileSize": 256
}
\`\`\`

## vector


A vector tile source. Tiles must be in [Mapbox Vector Tile format](https://docs.mapbox.com/vector-tiles/). All geometric coordinates in vector tiles must be between \`-1 * extent\` and \`(extent * 2) - 1\` inclusive. All layers that use a vector source must specify a [\`"source-layer"\`](/maplibre-style/layers/#source-layer) value. 

\`\`\`json
"maplibre-streets": {
    "type": "vector",
    "tiles": [
        "http://a.example.com/tiles/{z}/{x}/{y}.pbf"
    ],
}
\`\`\`

`}}),l,L),o(e,i(n,{headingLevel:"3",get entry(){return r.source_vector},section:"vector"}),c,k),o(e,i(a,{supportItems:{"basic functionality":{js:"0.10.0",android:"2.0.1",ios:"2.0.0",macos:"0.1.0"}}}),p,G),o(e,i(s,{content:`
## raster

A raster tile source.

\`\`\`json
"maplibre-satellite": {
    "type": "raster",
    "tiles": [
        "http://a.example.com/tiles/{z}/{x}/{y}.png"
    ],
    "tileSize": 256
}
\`\`\`
`}),m,O),o(e,i(n,{headingLevel:"3",get entry(){return r.source_raster},section:"raster"}),g,I),o(e,i(a,{supportItems:{"basic functionality":{js:"0.10.0",android:"2.0.1",ios:"2.0.0",macos:"0.1.0"}}}),u,R),o(e,i(s,{content:`
## raster-dem

A raster DEM source. Only supports [Mapbox Terrain RGB](https://blog.mapbox.com/global-elevation-data-6689f1d0ba65) and Mapzen Terrarium tiles.

\`\`\`json
"maplibre-terrain-rgb": {
    "type": "raster-dem",
    "encoding": "mapbox",
    "tiles": [
        "http://a.example.com/dem-tiles/{z}/{x}/{y}.png"
    ],
}
\`\`\`
`}),d,E),o(e,i(n,{headingLevel:"3",get entry(){return r.source_raster_dem},section:"raster-dem"}),b,P),o(e,i(a,{supportItems:{"basic functionality":{js:"0.43.0"}}}),h,D),o(e,i(s,{content:`
## geojson

A [GeoJSON](http://geojson.org/) source. Data must be provided via a \`"data"\` property, whose value can be a URL or inline GeoJSON.

\`\`\`json
"geojson-marker": {
    "type": "geojson",
    "data": {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [12.550343, 55.665957]
        },
        "properties": {
            "title": "Somewhere",
            "marker-symbol": "monument"
        }
    }
}
\`\`\`

This example of a GeoJSON source refers to an external GeoJSON document via its URL. The GeoJSON document must be on the same domain or accessible using [CORS](http://enable-cors.org/).

\`\`\`json
"geojson-lines": {
    "type": "geojson",
    "data": "./lines.geojson"
}
\`\`\`
`}),x,F),o(e,i(n,{headingLevel:"3",get entry(){return r.source_geojson},section:"geojson"}),y,H),o(e,i(a,{supportItems:{"basic functionality":{js:"0.10.0",android:"2.0.1",ios:"2.0.0",macos:"0.1.0"},clustering:{js:"0.14.0",android:"4.2.0",ios:"3.4.0",macos:"0.3.0"},"line distance metrics":{js:"0.45.0",android:"6.5.0",ios:"4.4.0",macos:"0.11.0"}}}),_,V),o(e,i(s,{content:`
## image

An image source. The \`"url"\` value contains the image location.

The \`"coordinates"\` array contains \`[longitude, latitude]\` pairs for the image corners listed in clockwise order: top left, top right, bottom right, bottom left.

\`\`\`json
"image": {
    "type": "image",
    "url": "https://maplibre.org/maplibre-gl-js-docs/assets/radar.gif",
    "coordinates": [
        [-80.425, 46.437],
        [-71.516, 46.437],
        [-71.516, 37.936],
        [-80.425, 37.936]
    ]
}
\`\`\`
`}),S,X),o(e,i(n,{headingLevel:"3",get entry(){return r.source_image},section:"image"}),$,Z),o(e,i(a,{supportItems:{"basic functionality":{js:"0.10.0",android:"5.2.0",ios:"3.7.0",macos:"0.6.0"}}}),v,te),o(e,i(s,{content:`
## video

A video source. The \`"urls"\` value is an array. For each URL in the array, a video element [source](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source) will be created. To support the video across browsers, supply URLs in multiple formats.

The \`"coordinates"\` array contains \`[longitude, latitude]\` pairs for the video corners listed in clockwise order: top left, top right, bottom right, bottom left.

\`\`\`json
"video": {
    "type": "video",
    "urls": [
        "https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4",
        "https://static-assets.mapbox.com/mapbox-gl-js/drone.webm"
    ],
    "coordinates": [
        [-122.51596391201019, 37.56238816766053],
        [-122.51467645168304, 37.56410183312965],
        [-122.51309394836426, 37.563391708549425],
        [-122.51423120498657, 37.56161849366671]
    ]
}
\`\`\`
`}),f,ie),o(e,i(n,{headingLevel:"3",get entry(){return r.source_video},section:"video"}),j,re),o(e,i(a,{supportItems:{"basic functionality":{js:"0.10.0"}}}),ae,le),e})()}export{_e as default};
