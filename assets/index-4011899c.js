import{g as Q,s as xt,d as St,e as vt,t as X,a as n,i,c as e}from"./entry-client-9a1c3f2c.js";import{M as a}from"./markdown-1ca63c6c.js";import{s as d}from"./v8-66035ba3.js";import{I as o}from"./items-47baa67d.js";import{C as s}from"./caption-7113fb62.js";import"./property-783a2d80.js";import"./subtitle-cab57821.js";const wt="_image_1st6w_1",kt={image:wt},Tt=X('<img alt="">');function c(u){const t=`/maplibre-style-spec/img/src/${u.imageId}.png`;return(()=>{const y=Q(Tt);return xt(y,"src",t),St(()=>vt(y,kt.image)),y})()}function p(u,t){const h=u.map(r=>({ref:d[`${r}_${t}`],kind:r,section:`${r}-${t}`})).reduce((r,l)=>(Object.keys(l.ref).forEach(g=>{l.ref[g].kind=l.kind,l.ref[g].section=l.section,r[g]=l.ref[g]}),r),{});return Object.keys(h).sort().reduce((r,l)=>(r[l]=h[l],r),{})}const It=X('<div><!#><!/><!#><!/><hr class="my36"><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/><!#><!/>');function Et(){const u=["background","fill","line","symbol","raster","circle","fill-extrusion","heatmap","hillshade"];return(()=>{const t=Q(It),y=t.firstChild,[h,r]=n(y.nextSibling),l=h.nextSibling,[g,Z]=n(l.nextSibling),ee=g.nextSibling,te=ee.nextSibling,[m,ne]=n(te.nextSibling),ie=m.nextSibling,[b,ae]=n(ie.nextSibling),re=b.nextSibling,[$,le]=n(re.nextSibling),oe=$.nextSibling,[_,se]=n(oe.nextSibling),ce=_.nextSibling,[f,pe]=n(ce.nextSibling),ge=f.nextSibling,[x,ye]=n(ge.nextSibling),ue=x.nextSibling,[S,he]=n(ue.nextSibling),de=S.nextSibling,[v,me]=n(de.nextSibling),be=v.nextSibling,[w,$e]=n(be.nextSibling),_e=w.nextSibling,[k,fe]=n(_e.nextSibling),xe=k.nextSibling,[T,Se]=n(xe.nextSibling),ve=T.nextSibling,[I,we]=n(ve.nextSibling),ke=I.nextSibling,[L,Te]=n(ke.nextSibling),Ie=L.nextSibling,[M,Le]=n(Ie.nextSibling),Me=M.nextSibling,[A,Ae]=n(Me.nextSibling),Ce=A.nextSibling,[C,je]=n(Ce.nextSibling),Ne=C.nextSibling,[j,De]=n(Ne.nextSibling),Ee=j.nextSibling,[N,Ye]=n(Ee.nextSibling),Ge=N.nextSibling,[D,Oe]=n(Ge.nextSibling),qe=D.nextSibling,[E,ze]=n(qe.nextSibling),Pe=E.nextSibling,[Y,Re]=n(Pe.nextSibling),Ve=Y.nextSibling,[G,We]=n(Ve.nextSibling),Je=G.nextSibling,[O,Ue]=n(Je.nextSibling),Be=O.nextSibling,[q,He]=n(Be.nextSibling),Fe=q.nextSibling,[z,Ke]=n(Fe.nextSibling),Qe=z.nextSibling,[P,Xe]=n(Qe.nextSibling),Ze=P.nextSibling,[R,et]=n(Ze.nextSibling),tt=R.nextSibling,[V,nt]=n(tt.nextSibling),it=V.nextSibling,[W,at]=n(it.nextSibling),rt=W.nextSibling,[J,lt]=n(rt.nextSibling),ot=J.nextSibling,[U,st]=n(ot.nextSibling),ct=U.nextSibling,[B,pt]=n(ct.nextSibling),gt=B.nextSibling,[H,yt]=n(gt.nextSibling),ut=H.nextSibling,[F,ht]=n(ut.nextSibling),dt=F.nextSibling,[K,mt]=n(dt.nextSibling),bt=K.nextSibling,[$t,_t]=n(bt.nextSibling);return i(t,e(a,{get content(){return`# Layers

A style's \`layers\` property lists all the layers available in that style. The type of layer is specified by the \`"type"\` property, and must be one of ${u.map(ft=>`\`${ft}\``).join(", ")}.

Except for layers of the \`background\` type, each layer needs to refer to a source. Layers take the data that they get from a source, optionally filter features, and then define how those features are styled.

\`\`\`json
"layers": ${JSON.stringify(d.$root.layers.example,null,2)}
\`\`\`

## Layer properties
`}}),h,r),i(t,e(o,{get entry(){return d.layer}}),g,Z),i(t,e(a,{content:`


### Sub properties
Layers have two sub-properties that determine how data from that layer is rendered: \`layout\` and \`paint\` properties, explained below.

### layout property
Layout properties appear in the layer's \`"layout"\` object. They are applied early in the rendering process and define how data for that layer is passed to the GPU. Changes to a layout property require an asynchronous "layout" step.

### paint property
Paint properties are applied later in the rendering process. Paint properties appear in the layer's \`"paint"\` object. Changes to a paint property are cheap and happen synchronously.

## background

The \`background\` style layer covers the entire map. Use a background style layer to configure a color or pattern to show below all other map content. If the background layer is transparent or omitted from the style, any part of the map view that does not show another style layer is transparent.
`}),m,ne),i(t,e(c,{imageId:"layer-background",alt:"Vintage map style with a brown halftone background pattern."}),b,ae),i(t,e(s,{get children(){return e(a,{get content(){return"\nThe [Vintage map style](https://blog.mapbox.com/designing-the-vintage-style-in-mapbox-studio-9da4aa2a627f) uses a custom SVG [`background-pattern`](/maplibre-style-spec/layers/#paint-background-background-pattern) to achieve a textured vintage look.\n"}})}}),$,le),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"background")}}),_,se),i(t,e(a,{content:`
## fill

A \`fill\` style layer renders one or more filled (and optionally stroked) polygons on a map. You can use a fill layer to configure the visual appearance of polygon or multipolygon features.
`}),f,pe),i(t,e(c,{imageId:"layer-fill",alt:"Map of Washington, D.C. with a purple isochrone polygon in the center."}),x,ye),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis map of Washington, D.C. uses the [`fill-opacity`](/maplibre-style-spec/layers/#paint-fill-fill-opacity) paint property to render a semi-transparent polygon, showing how far a person can walk from the center of the city in ten minutes.\n"}})}}),S,he),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"fill")}}),v,me),i(t,e(a,{content:`
## line

A \`line\` style layer renders one or more stroked polylines on the map. You can use a line layer to configure the visual appearance of polyline or multipolyline features.
`}),w,$e),i(t,e(c,{imageId:"layer-line",alt:"Outdoors style map with a red line showing a hiking path."}),k,fe),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis map of a [Strava](https://blog.mapbox.com/strava-launches-gorgeous-new-outdoor-maps-977c74cf37f9) user's hike through Grand Teton National Park uses the [`line-color`](/maplibre-style-spec/layers/#paint-line-line-color) and [`line-width`](/maplibre-style-spec/layers/#paint-line-line-width) paint properties to style the strong red line of the user's route.\n"}})}}),T,Se),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"line")}}),I,we),i(t,e(a,{content:`
## symbol

A \`symbol\` style layer renders icon and text labels at points or along lines on a map. You can use a symbol layer to configure the visual appearance of labels for features in vector tiles.
`}),L,Te),i(t,e(c,{imageId:"layer-symbol",alt:"Map with thirty shopping bag icons, color-coded red, orange, and green."}),M,Le),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis map of Denver area businesses uses the [`icon-image`](/maplibre-style-spec/layers/#layout-symbol-icon-image) layout property to use a custom image as an icon in a symbol layer.\n"}})}}),A,Ae),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"symbol")}}),C,je),i(t,e(a,{content:`
## raster

A \`raster\` style layer renders raster tiles on a map. You can use a raster layer to configure the color parameters of raster tiles.
`}),j,De),i(t,e(c,{imageId:"layer-raster",alt:"Shortwave infrared imagery of California wildfires overlayed near the city of Morgan Hill."}),N,Ye),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis [interactive SWIR imagery map by Maxar](https://blog.maxar.com/news-events/2020/maxar-and-mapbox-release-interactive-swir-imagery-map-of-california-wildfires?utm_source=mapbox&utm_medium=blog&utm_campaign=ca-wildfires-2020-map) uses the [`visibility`](/maplibre-style-spec/layers/#layout-raster-visibility) layout property to show or hide raster layers with shortwave infrared satellite imagery of California wildfires.\n"}})}}),D,Oe),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"raster")}}),E,ze),i(t,e(a,{content:`
## circle

A \`circle\` style layer renders one or more filled circles on a map. You can use a circle layer to configure the visual appearance of point or point collection features in vector tiles. A circle layer renders circles whose radii are measured in screen units.
`}),Y,Re),i(t,e(c,{imageId:"layer-circle",alt:"Map with circles of different sizes and colors."}),G,We),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis [cluster map](/maplibre-gl-js-docs/example/cluster/) uses a circle layer with a GeoJSON data source and sets the source's [`cluster`](/maplibre-style-spec/sources/#geojson-cluster) property to `true` to visualize points as clusters.\n"}})}}),O,Ue),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"circle")}}),q,He),i(t,e(a,{content:`
## fill-extrusion

A \`fill-extrusion\` style layer renders one or more filled (and optionally stroked) extruded (3D) polygons on a map. You can use a fill-extrusion layer to configure the extrusion and visual appearance of polygon or multipolygon features.
`}),z,Ke),i(t,e(c,{imageId:"layer-fill-extrusion",alt:"Map of Europe and North Africa with countries extruded to various heights."}),P,Xe),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis map uses an external dataset to provide data-driven values for the [`fill-extrusion-height`](/maplibre-style-spec/layers/#paint-fill-extrusion-fill-extrusion-height) paint property of various [country polygons](https://blog.mapbox.com/high-resolution-administrative-country-polygons-in-studio-57cf4abb0768) in a fill-extrusion layer.\n"}})}}),R,et),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"fill-extrusion")}}),V,nt),i(t,e(a,{content:`
## heatmap

A \`heatmap\` style layer renders a range of colors to represent the density of points in an area.
`}),W,at),i(t,e(c,{imageId:"layer-heatmap",alt:"Dark map with a heatmap layer glowing red inside and white outside."}),J,lt),i(t,e(s,{get children(){return e(a,{get content(){return`
[This visualization of earthquake data](/maplibre-gl-js-docs/example/heatmap-layer/) uses a heatmap layer with carefully defined [paint](/maplibre-style-spec/layers/#paint-property) properties to highlight areas where earthquake frequency is high and many points are clustered closely together.
`}})}}),U,st),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"heatmap")}}),B,pt),i(t,e(a,{content:`
## hillshade

A \`hillshade\` style layer renders digital elevation model (DEM) data on the client-side. The implementation only supports Mapbox Terrain RGB and Mapzen Terrarium tiles.
`}),H,yt),i(t,e(c,{imageId:"layer-hillshade",alt:"Map of Mount Shasta rising up with striking texture and shading."}),F,ht),i(t,e(s,{get children(){return e(a,{get content(){return"\nThis map of Mount Shasta uses a high value for the [`hillshade-exaggeration`](/maplibre-style-spec/layers/#paint-hillshade-hillshade-exaggeration) paint property to apply an intense shading effect.\n"}})}}),K,mt),i(t,e(o,{headingLevel:"3",get entry(){return p(["layout","paint"],"hillshade")}}),$t,_t),t})()}export{Et as default};
