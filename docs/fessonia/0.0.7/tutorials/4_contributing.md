We're so glad you're interested in helping to build this library. Before we get started, there are a few ground rules you should know about to ensure we all have a great experience.

## Rules of the Road

* **Identify an issue.** When you start looking at implementing something on the library, ensure there's a corresponding Github Issue associated with the bug or feature. If there isn't one, please feel free to create one using one of our issue templates.
* **Assign the issue to yourself.** Let others know that you're working on this, so we can avoid several folks working on the same thing.
* **Discuss large changes first.** Before putting in a lot of work on a large feature or refactor, please discuss the idea with the maintainers in an Issue conversation. This ensures that what you're intending works with the road map for the library and won't conflict with use cases for the library you may not be aware of at the moment.
* **Keep your work scoped.** When tackling a change to the library, be sure to keep your change limited to one particular issue, and don't include commits that are out-of-scope for the Issue you're working on. If you notice something out of scope that needs to be done, please create a new Issue for that.
* **Create tests for your code.** Any code you add should have tests that provide proof that your work fixes the issue or correctly implements the feature identified in the Issue. If you need help with this, please ask on the Issue.
* **Commit your work with descriptive commit messages.** Ensure that your work is committed to version control with descriptive messages that, to the best of your ability, identify what parts of the library are impacted by the commit.
* **Don't squash others' commits.** Everyone deserves credit for the work they've contributed to the library, so please don't squash commits that others have made. That said, if there are several of your own smaller commits that are very similar in nature, you can feel free to squash those into a single commit with a descriptive message that covers all the changes made.
* **Run the tests and make sure they pass.** Pull requests that don't pass the test suite will not be merged. If there's something that's not passing tests, please fix it. If you need help, please create a Draft PR (see the next bullet) and ask for assistance.
* **Update and regenerate documentation.** Please make sure that if you've modified something that requires an update to the library documentation, you include the updated documentation in your pull request. (To do that, see *Generating Documentation* below.)
* **Submit a pull request.** Once you've pushed up your branch and are ready to create a pull request, please fill out as much of the PR template as you can. If your work is still in progress or not yet passing tests, be sure to create a *Draft* Pull Request instead of a regular one. (You can do this by clicking the dropdown on the right end of the "Create pull request" button.)
* **Be civil and treat others with respect.** Please assume good intent from others and keep your conversation civil in Issue and PR conversations. At TED, we care about maintaining a welcoming and inclusive atmosphere, and that applies to our development practices too. For more details on that, please take a look at our [Code of Conduct](tutorial-5_code_of_conduct.html).

## Developing on the Library

Now, finally, here's a brief guide to getting setup and developing on this library. We look forward to seeing what you contribute!

### Structure

The library is structured in the following folders:

* `/lib` - the location for all library runtime code
* `/test` - the location for all library testing code, including fixtures and test helpers
* `/scripts` - the location for any utility scripts
* `/docs` - the location for generated documentation
* `/coverage` - the location for generated test coverage reports

### Prerequisites

To get started, you'll need an installation of [node.js](https://nodejs.org/), preferably with [`nvm`](https://github.com/nvm-sh/nvm) to manage versions (or [`nvm-windows`](https://github.com/coreybutler/nvm-windows) if you're using Windows). You'll also need a locally installed [`ffmpeg`](http://ffmpeg.org/).

The current build version of the library can be seen in the `.nvmrc` file in the repo root, but the library is also built via Travis CI daily using LTS versions from 8.x up, as well as the most current stable version (12.x at the time of writing).

For ease of operation, you may also be interested in [`avn`](https://github.com/wbyoung/avn), a tool that auto-selects the version of node used by the project based on the `.nvmrc` file in the repo root when you enter a directory at the command line.

You'll also need a package manager for node packages installed. In this document, I'll use `npm` for reference, but corresponding `yarn` commands should also work just fine.

### Setup

You may wish to fork this repo in order to contribute. To do so, click the "Fork" button in the top right of [the main repo page on github.com](https://github.com/fessonia/fessonia).

First, clone this repo locally and enter the directory.

```{bash}
git clone git@github.com:fessonia/fessonia.git
cd fessonia
```

Change the name of the git remote from `origin` to `upstream`, and add your fork of the repo as the `origin`. (The below command assumes your Github username is in an environment variable `GITHUB_USERNAME`.)

```{bash}
git remote rename origin upstream
git remote add origin git@github.com:${GITHUB_USERNAME}/fessonia.git
```

To get setup for development, ensure you're using the correct node version, either via `nvm use` or automatically via `avn`.

Then, install the development dependencies:

```{bash}
npm install
```

To be sure things are working, run the tests:

```{bash}
npm test
```

### Testing

All tests are contained in the `/test` folder, and test files generally end in `.test.js`.

For testing, this library uses a combination of `mocha`, `chai`, and `sinon`, with `nyc` and `istanbul` for test coverage reporting.

### Generating Documentation

Documentation generation is handled through JSdoc 3. For any code changes you make, you'll need to ensure that the JSdoc comments are up to date and match your changes, then regenerate documentation accordingly.

Docs generation is handled via a shell script in the `/scripts` folder, but can be run via the `npm` task:

```{bash}
npm run generate-docs
```

### Continuous Integration via Travis CI

Travis CI is setup to run a build against LTS node versions 8.x and up, as well as the latest stable node version, on each commit to any branch on the repo and each pull request submitted against the repo.

Travis CI also runs a similar build at least once daily to ensure that the build doesn't break due to lack of maintenance. This cron-based build is only run if there has not been a build in the last 24 hours.

You can see the results of Travis CI runs at [https://travis-ci.com/fessonia/fessonia](https://travis-ci.com/fessonia/fessonia).
