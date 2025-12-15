# Glyphs

A URL template for loading signed-distance-field glyph sets in PBF format.

If this property is set, any text in the `text-field` layout property is displayed in the font stack named by the `text-font` layout property based on glyphs located at the URL specified by this property. Otherwise, font faces will be determined by the `text-font` property based on the local environment.

The URL must include:

 - `{fontstack}` - When requesting glyphs, this token is replaced with a comma separated list of fonts from a font stack specified in the `text-font` property of a symbol layer. 

 - `{range}` - When requesting glyphs, this token is replaced with a range of 256 Unicode code points. For example, to load glyphs for the Unicode Basic Latin and Basic Latin-1 Supplement blocks, the range would be 0-255. The actual ranges that are loaded are determined at runtime based on what text needs to be displayed.

The URL must be absolute, containing the [scheme, authority and path components](https://en.wikipedia.org/wiki/URL#Syntax).

```json
"glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
```

---

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.0.16|0.1.1|0.1.0|
|omit to use local fonts|5.11.0|❌ ([#165](https://github.com/maplibre/maplibre-native/issues/165))|❌ ([#165](https://github.com/maplibre/maplibre-native/issues/165))|
