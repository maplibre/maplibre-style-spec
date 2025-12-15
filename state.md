# State

An object used to define default values when using the [`global-state`](https://maplibre.org/maplibre-style-spec/expressions/#global-state) expression.

```json
"state": {
    "chargerType": {"default": ["CCS", "CHAdeMO", "Type2"]},
    "minPreferredChargingSpeed": {"default": 50}
}
```

---

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.6.0|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|
