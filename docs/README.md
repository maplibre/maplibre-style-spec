# MapLibre GL JS Documentation

The source code for https://maplibre.org/maplibre-gl-js-docs/, the website that hosts [API documentation](#writing-api-documentation) and [examples](#writing-examples) for [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js). A GitHub Actions Workflow is triggered on push to the ```main``` branch. This Action builds the static website and deploys it to GitHub Pages by pushing to the ```gh-pages``` branch.

## Requirements

* Node 16
* npm 8

If you're not sure if your Node and NPM versions are up to date, run `nvm use` before installing dependencies. If you don't have NVM installed, you can [find installation instructions here](https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating).

The NPM scripts will not run on Windows, but work perfectly with [WSL2](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux).

## Setting up the Development Environment

After cloning this repository, run:

```bash
npm ci # install dependencies with npm
git submodule update --init # initialize maplibre-gl-js git submodule
```

When pulling in new commits that change the `maplibre-gl-js` submodule,
run `git submodule update` to update the local copy as well.

## Writing API Documentation

API documentation is written as [JSDoc comments](http://usejsdoc.org/) and processed with [documentationjs](http://documentation.js.org/) **in the source code of [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js)**. This repository fetches the source code through a git submodule.

* Classes, methods, events, and anything else in the public interface must be documented with JSDoc comments. Everything outside of the public interface may be documented and must be tagged as `@private`.
* Text within JSDoc comments may use markdown formatting. Code identifiers must be surrounded by \`backticks\`.
* Documentation must be written in grammatically correct sentences ending with periods.
* Documentation must specify measurement units when applicable.
* Documentation descriptions must contain more information than what is obvious from the identifier and JSDoc metadata.
* Class descriptions should describe what the class *is*, or what its instances *are*. They do not document the constructor, but the class. They should begin with either a complete sentence or a phrase that would complete a sentence beginning with "A `T` is..." or "The `T` class is..." Examples: "Lists are ordered indexed dense collections." "A class used for asynchronous computations."
* Function descriptions should begin with a third person singular present tense verb, as if completing a sentence beginning with "This function..." If the primary purpose of the function is to return a value, the description should begin with "Returns..." Examples: "Returns the layer with the specified id." "Sets the map's center point."
* `@param`, `@property`, and `@returns` descriptions should be capitalized and end with a period. They should begin as if completing a sentence beginning with "This is..." or "This..."
* Functions that do not return a value (return `undefined`), should not have a `@returns` annotation.
* Member descriptions should document what a member represents or gets and sets. They should also indicate whether the member is read-only.
* Event descriptions should begin with "Fired when..." and so should describe when the event fires. Event entries should clearly document any data passed to the handler, with a link to MDN documentation of native Event objects when applicable.

## Writing Examples

Examples are written as [Batfish](https://github.com/mapbox/batfish) pages in `docs/pages/example`. Each example requires two files: an `.html` file containing the source
code for the example, and a `.js` file containing example boilerplate and front matter. The front matter should include the following items:

* `title`: A short title for the example in **sentence case** as a **verb phrase**.
* `description`: A one sentence description of the example in plain text. This description will appear alongside a thumbnail and title on the examples page.
* `thumbnail`: The filename of the example's thumbnail image (without the file extension).
* `contentType: example`: Set the contentType to equal example.

In content area of the markdown page include an extended description of the example and add links to documentation or other important resources where possible.

In the `.html` file, write the HTML and JavaScript constituting the example.

* Do **not** include a MapTiler access token in the example code. The access token will be inserted automatically by the template, using the current logged in user's default public token, or a placeholder `<insert token here>` string if the user is not logged in.
* On commit, Prettier will format the code for all files, including HTML.

Every example **must** have an accompanying image.

1. Ensure that you have a build of the latest `maplibre-gl-js` in the neighboring directory (see below).
2. Run `npm run create-image <example-file-name>`. The script will take a screenshot of the map in the example and save it to `docs/img/src/`. Commit the image.
3. Run `npm start` to verify that your example image is loading as expected.

For some examples, `npm run create-image` does not generate an ideal image. In these cases, you can interact with the map after running `ncreate-image`, or take a screenshot yourself by running the site locally with `npm start`, take a screenshot and save it in the `docs/img/src` folder.

To regenerate all images, run `npm run create-image all`. Note that this doesn't support interaction and examples that require manual interaction (e.g. popups). will need to be manually redone afterward. This feature is experimental and may crash before sucessfully generating all examples.

## Running the Documentation Server Locally

To start a documentation server locally, run:

```bash
npm start
```

The command will print the URL you can use to view the documentation.

💡 If you receive an error related to `@mapbox/appropriate-images`, try `nvm use && npm start`.

The examples section of the locally run documentation will use the GL JS version located in `../maplibre-gl-js/dist`,
so make sure to have a working minified build in your local copy of the `maplibre-gl-js` repo (not the submodule; clone `maplibre-gl-js` into the same directory as `maplibre-gl-js-docs` and run `npm run build-dist` there).


## Committing and Publishing Documentation

When a new GL JS release goes out, the release manager will make a PR that updates this repo's `maplibre-gl-js` submodule to point to the new release. When updating the submodule, you may need to run `npm test -- -u` to update Jest snapshots related to the sidebar navigation.

To update or add a new example, PR the relevant changes to this repo. The example will be live once the PR is merged.  If this example uses a version of GL JS that isn't yet released, the PR should not be merged until the release is out.
