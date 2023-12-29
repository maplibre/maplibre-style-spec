Hi, and thanks in advance for contributing to the MapLibre Style Spec. Here's how we work. Please follow these conventions when submitting an issue or pull request.

## Do not violate Mapbox copyright!

In December 2020 Mapbox decided to publish future versions of mapbox-gl-js under a proprietary license. **You are not allowed to backport code from Mapbox projects which has been contributed under this new license**. Unauthorized backports are the biggest threat to the MapLibre project. If you are unsure about this issue, [please ask](https://github.com/maplibre/maplibre-style-spec/discussions)!

## Best Practices for Contributions

MapLibre welcomes contributions from community! Following these best practices will assist the maintainer team in reviewing your contribution. In general, the project values discussion and communication over process and documentation. Below are some best practices that have aided contributors.

It is a good idea to discuss proposed changes before proceeding to an issue ticket or PR. The project team is active in the following forums:

* For informal chat discussions, visit the project's [Slack Channel](https://osmus.slack.com/archives/C01G3D28DAB).
* For discussions whose output and outcomes should not be ephemeral, consider starting a thread on [GitHub Discussions](https://github.com/maplibre/maplibre-style-spec/discussions). This makes it easier to find and reference the discussion in the future.

MapLibre software relies heavily on automated testing, and the project includes a suite of unit and integration tests. For both new features and bug fixes, contributions should update or add test cases to prevent regressions.

# Building the Docs site

The MapLibre style spec documnetions site is based on [SolidStart](https://start.solidjs.com/) in order to get Server Side Rendering for Search Engine Optimization.

```bash
cd docs
npm ci
npm run dev
```

# Building the Style spec JS package

This package is used by `maplibre-gl` in order to validate the spec and parse it.
It also has some other tools as can be read in the main README file.

```bash
npm install
npm run build
```

# Running the tests

Unit tests are using [Jest](https://jestjs.io/).
There are a few layers of tests - integration, unit and build tests.

```bash
npm run test-build
npm run test-integration
npm run test-unit
```