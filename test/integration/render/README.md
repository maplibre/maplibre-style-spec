# Render tests

These tests define how a style should **look**, not only how it is described in words.
Each test is a `style.json` and the image a renderer is expected to produce from it.
Every MapLibre renderer (GL JS, Native, …) should run these tests.

## Layout

```
render/
├── assets/
└── tests/
    ├── static/<group>/<test>/
    ├── runtime/<group>/<test>/
    └── placement/<group>/<test>/
```

A test folder contains `style.json` and `expected.png`. It may also contain platform-specific variants
(`expected-<platform>.png`) when a platform cannot match `expected.png` exactly.

`assets/` holds the tiles, glyphs, sprites, data and styles that tests reference with `local://` URLs,
e.g. `local://tiles/{z}-{x}-{y}.mvt` resolves to `assets/tiles/{z}-{x}-{y}.mvt`.

## Families

- **static** - the image is defined by `style.json` alone, with no operations. This is the preferred kind of test and
  should render identically in all renderers.
- **runtime** - the test runs `operations` before the image is captured. Operations come from a small, closed set and
  should only be used when the behavior cannot be tested statically.
- **placement** - the test depends on label placement and collision (any `symbol` layer). Placement currently differs
  between renderers, so these tests live here until they can move to `static` or `runtime`.

## Test format

Test options live in `metadata.test` of `style.json`:

| Field        | Meaning                                                        |
| ------------ | -------------------------------------------------------------- |
| `width`      | Output width in pixels (default 512)                           |
| `height`     | Output height in pixels (default 512)                          |
| `pixelRatio` | Device pixel ratio (default 1)                                 |
| `allowed`    | Allowed fraction of mismatching pixels                         |
| `operations` | `runtime` only: `[name, ...args]` steps run before the capture |
