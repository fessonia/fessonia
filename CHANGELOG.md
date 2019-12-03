# CHANGE LOG

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
