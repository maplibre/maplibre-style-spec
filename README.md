<p align="center">
  <img src="https://github.com/user-attachments/assets/7ff2cda8-f564-4e70-a971-d34152f969f0#gh-light-mode-only" alt="MapLibre Logo" width="200">
  <img src="https://github.com/user-attachments/assets/cee8376b-9812-40ff-91c6-2d53f9581b83#gh-dark-mode-only" alt="MapLibre Logo" width="200">
</p>

# MapLibre Style Specification & Utilities

[![NPM Version](https://badge.fury.io/js/@maplibre%2Fmaplibre-gl-style-spec.svg)](https://npmjs.org/package/@maplibre/maplibre-gl-style-spec)
[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg?style=flat)](LICENSE.txt) [![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://opensource.org/licenses/BSD-3-Clause) [![codecov](https://codecov.io/gh/maplibre/maplibre-style-spec/branch/main/graph/badge.svg)](https://codecov.io/gh/maplibre/maplibre-style-spec)

This repository contains code and reference files that define the MapLibre style specification and provides some utilities for working with MapLibre styles.

The style specification is used in MapLibre GL JS and in MapLibre Native. Our long-term goal is to have feature parity between the web and the native libraries.

## Contributing

If you want to contribute to the style specification, please open an issue with a design proposal. Once your design proposal has been accepted, you can open a pull request and implement your changes.

We aim to avoid breaking changes in the MapLibre style specification because it makes life easier for our users.

## Documentation

The [documentation](https://maplibre.org/maplibre-style-spec) of the style specification also lives in this repository.
We use [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material) theme.

To work on the documentation locally, you need to have Docker installed and running.
Start MkDocs with

```bash
npm run start-docs
```

Most of the documentation is generated (from e.g. `v8.json`).
In another terminal, run:

```bash
WATCH=1 npm run generate-docs
```

This will re-run the generation script when needed.

Note that generated files should not be checked in, and they are excluded in `.gitignore`.
Make sure to keep this file up to date and ignore generated files while making sure static Markdown files are not ignored.

## NPM Package


The MapLibre style specification and utilities are published as a separate npm
package so that they can be installed without the bulk of GL JS.

```bash
npm install @maplibre/maplibre-gl-style-spec
```

## CLI Tools

If you install this package globally, you will have access to several CLI tools.

```bash
npm install @maplibre/maplibre-gl-style-spec --global
```

### `gl-style-migrate`

This repo contains scripts for migrating GL styles of any version to the latest version (currently v8).
You can migrate a style like this:

```bash
$ gl-style-migrate bright-v7.json > bright-v8.json
```

To migrate a file in place, you can use the `sponge` utility from the `moreutils` package:

```bash
$ brew install moreutils
$ gl-style-migrate bright.json | sponge bright.json
```

### `gl-style-format`

```bash
$ gl-style-format style.json
```

Will format the given style JSON to use standard indentation and sorted object keys.

### `gl-style-validate`

```bash
$ gl-style-validate style.json
```

Will validate the given style JSON and print errors to stdout.
Provide a `--json` flag to get JSON output.
