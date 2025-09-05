Hi, and thanks in advance for contributing to the MapLibre Style Spec. Here's how we work. Please follow these conventions when submitting an issue or pull request.

## Do not violate Mapbox copyright!

In December 2020 Mapbox decided to publish future versions of mapbox-gl-js under a proprietary license. **You are not allowed to backport code from Mapbox projects which has been contributed under this new license**. Unauthorized backports are the biggest threat to the MapLibre project. If you are unsure about this issue, [please ask](https://github.com/maplibre/maplibre-style-spec/discussions)!

## Best Practices for Contributions

MapLibre welcomes contributions from community! Following these best practices will assist the maintainer team in reviewing your contribution. In general, the project values discussion and communication over process and documentation. Below are some best practices that have aided contributors.

It is a good idea to discuss proposed changes before proceeding to an issue ticket or PR. The project team is active in the following forums:

* For informal chat discussions, visit the project's [Slack Channel](https://osmus.slack.com/archives/C01G3D28DAB).
* For discussions whose output and outcomes should not be ephemeral, consider starting a thread on [GitHub Discussions](https://github.com/maplibre/maplibre-style-spec/discussions). This makes it easier to find and reference the discussion in the future.

MapLibre software relies heavily on automated testing, and the project includes a suite of unit and integration tests. For both new features and bug fixes, contributions should update or add test cases to prevent regressions.

# Building the Style spec JS package

This package is used by `maplibre-gl` in order to validate the spec and parse it.
It also has some other tools as can be read in the main README file.

```bash
npm install
npm run generate-style-spec
npm run generate-typings
npm run build
```

# Running the tests

Tests are using [Jest](https://jestjs.io/).
There are a few layers of tests - integration, unit and build tests.

```bash
npm run test-unit
npm run test-integration
npm run test-build  # follow steps from previous section before
```

In intergration tests, if there's a need to update the expected results you'll need to run the tests with the `UPDATE=1` environment flag. 
For example `UPDATE=1 npm run test-integration`, or if you would like to update only a specific type of integration test use `UPDATE=1 npx jest ./test/integration/style-spec/validate_spec.test.ts`

# Publish style-spec NPM package
In order to publish the package to NPM:
1. Go to "Action" in GitHub
2. Run the create bump version PR action to create a PR with the version bump
3. Approve and merge this PR after you have reviewed the Changelog file
4. Squash and merge the PR, an automatic action will pick up the change and publish the package to npm
