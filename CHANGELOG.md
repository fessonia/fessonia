# CHANGE LOG

## On master since the last release...

* [View the commits.](https://github.com/tedconf/fessonia/compare/2.1.2...master)

## 2.2.0 (2021-02-12)

* [View the commits.](https://github.com/tedconf/fessonia/compare/2.1.2...2.2.0)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/2.2.0/)

### New Features

* Added TypeScript support with types defined in the `types` folder. ([PR #44](https://github.com/tedconf/fesso    nia/pull/44) by [@universalhandle](https://github.com/universalhandle) and [@glensc](https://github.com/glensc))

### Bug fixes

* Fix improper use of the Config singleton object, and update docs accordingly ([PR #43](https://github.com/tedconf/fessonia/pull/43) by [@universalhandle](https://github.com/universalhandle))

## 2.1.2 (2020-08-07)

* [View the commits.](https://github.com/tedconf/fessonia/compare/2.1.1...2.1.2)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/2.1.2/)

### Internal Changes

* Refactor of command string creation within `FFmpegCommand`, `FFmpegOutput` and `FFmpegInput` to reduce repeated code for concatenation and option value quote handling. ([PR #40](https://github.com/tedconf/fessonia/pull/40))

## 2.1.1 (2020-08-07)

* [View the commits.](https://github.com/tedconf/fessonia/compare/2.1.0...2.1.1)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/2.1.1/)

### Bug Fixes

* A bug ([Issue #38](https://github.com/tedconf/fessonia/issues/38)) in command string generation preventing quoting of option values starting with `-` was fixed. ([PR #39](https://github.com/tedconf/fessonia/pull/39))

### CI Changes

* Remove node 8 from Travis CI config, and bump the default node version to 12.15.0. This is in response to the [Node.js February 2020 security releases](https://nodejs.org/en/blog/vulnerability/february-2020-security-releases/) addressing CVEs [CVE-2019-15604](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-15604), [CVE-2019-15605](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-15605), and [CVE-2019-15606](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-15606).
* Convert from using the `nyc` library for test coverage reporting to using `c8`, which uses V8's internal coverage metrics. This change was made due to bug [instanbuljs/nyc#619](https://github.com/istanbuljs/nyc/issues/619), whereby reported line numbers in error stack traces from tests are incorrect, as well as for generally more simplicity in the test run. 
* Dependabot update of dev dependency acorn. No impact to production code. ([PR #32](https://github.com/tedconf/fessonia/pull/32))
* Dependency update of dev dependency minimist. No impact to production code. ([4b63ea2](https://github.com/tedconf/fessonia/commit/4b63ea2d0631e1d32b8b65cd16731b794f3bb84e))
* Dependabot update of dev dependency lodash. No impact to production code. ([PR #37](https://github.com/tedconf/fessonia/pull/37))
* Dependency update of dev dependencies c8 and all-contributors-cli. No impact to production code. ([7de5991](https://github.com/tedconf/fessonia/commit/7de59913deebf1a1d41751bd79ce9885ef890ad6))

### Documentation Changes

* A stray symlink causing a page load failure in the documentation site was removed.
* The _Talks about this Library_ section of the _About Fessonia_ page in the docs site was updated.
* A documentation bug in the _Events_ section of the _Getting Started_ page in the docs ([#35](https://github.com/tedconf/fessonia/issues/35)) was found and fixed ([PR #34](https://github.com/tedconf/fessonia/pull/34) by [@glensc](https://github.com/glensc).

## 2.1.0 (2020-01-14)

* [View the commits.](https://github.com/tedconf/fessonia/compare/2.0.0...2.1.0)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/2.1.0/)

### Bug Fixes

This release alters the way filter pad names are handled by the library.

* `FilterChain` output pad names are only applied in the command output (`cmd.toString()` and `cmd.toCommand()`) when `streamSpecifier()` is called on the `FilterChain` object. This fixes bug #24 (explicit output pad names added to commands where streams were not explicitly mapped, breaking resulting the `ffmpeg` command).

### Internal Changes

* The library now applies predictable names to output pads of `FilterChain` objects, replacing the previously used salted hash with a structure that provides for replication of output when running the same code multiple times.
* The `FilterNode` class has been altered to remove live `ffmpeg`-based validation and information retrieval for filters and their arguments, relying on `ffmpeg` to error when filters and arguments are not correct. This decision was made because the complexity in code and automated testing added by this validation were considered to be far greater than the protection provided by such validation.

### Documentation Changes

* A section has been added to the *About Fessonia* guide explaining how stream specifiers are used and what to expect when using explicit mappings.

## 2.0.0 (2019-12-03)

* [View the commits.](https://github.com/tedconf/fessonia/compare/1.0.1...2.0.0)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/2.0.0/)

### Breaking Changes

This release alters the way run log and progress log output from ffmpeg is handled by the library:

* The library now modifies the specified ffmpeg command by default, adding the `-progress` global option for use in eventing on progress updates. To disable this, you can pass `false` to the `spawn` method of `FFmpegCommand`.
* Run log returned by `FFmpegCommand` no longer includes progress lines, as those are treated as ephemeral and only used to generate the events.
* The `FFmpegCommand` no longer emits `failure` events, instead emitting `error` events with appropriate information on any `ffmpeg` failure with a new `FFmpegError` object.

### Documentation Changes

Documentation has been updated to reflect the new progress and log handling.

## 1.0.1 (2019-11-06)

* [View the commits.](https://github.com/tedconf/fessonia/compare/1.0.0...1.0.1)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/1.0.1/)

### New Features

This release adds support for appending and prepending `FilterNode`s to existing `FilterChain`s.

### Documentation Changes

* New documentation for 
* Fix of broken link ([@iameli](https://github.com/iameli)) [d8d5332](https://github.com/tedconf/fessonia/commit/d8d5332603ba0c95fa243ac1dd770126dd75512c)

### CI Changes

* Add explicit testing of node 12 [5ae9ce2](https://github.com/tedconf/fessonia/commit/5ae9ce2cceb38774d57b18c8135afb6faf6cda38)

## 1.0.0 (2019-10-04)

* [View the commits.](https://github.com/tedconf/fessonia/commits/e9c0b425321c172f0a5f56346985f34a827138d0)
* [View the docs.](https://tedconf.github.io/fessonia/fessonia/1.0.0/)

### New Features

This initial version provides an implementation of the core features:

* `FFmpegCommand` supporting `execute` and `spawn` and integrating a `FilterGraph` as part of the command
* `FFmpegInput` and `FFmpegOutput` supporting the various options supported by `ffmpeg`
* `FilterNode` and `FilterChain` supporting creation of filter chains for addition to the command's filter graph
* Stream selection and stream mapping from `FFmpegInput`s to `FilterChain`s and `FFmpegOutput`s, and from `FilterChain`s to `FFmpegOutput`s.

### Documentation Changes

Documentation auto-generation capability, as well as several tutorials and informational documents were created and published with this release. Documentation for this release can be found at [https://tedconf.github.io/fessonia/fessonia/1.0.0/](https://tedconf.github.io/fessonia/fessonia/1.0.0/).
