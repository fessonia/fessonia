## Install

Install via `npm`:

```{bash}
npm i @tedconf/fessonia
```

Or via `yarn`

```{bash}
yarn i @tedconf/fessonia
```

## Import

You can import the whole library:

```{javascript}
const fessonia = require('@tedconf/fessonia')();
```

Or you can use destructuring to import individual classes:

```{javascript}
const { FFmpegCommand, FFmpegInput, FFmpegOutput } = require('@tedconf/fessonia')();
```

You may also specify a few configuration options on input:

* `ffmpeg_bin` - the location of the `ffmpeg` binary on the system where the library is running (default: `"ffmpeg"`)
* `ffprobe_bin` - the location of the `ffprobe` binary on the system where the library is running (default: `"ffprobe"`)
* `debug` - a flag indicating that debug logging should be enabled (default: `process.env.DEBUG || false`)
* `log_warnings` - a flag indicating that warnings and errors should be logged by the library (default: `process.env.LOG_WARNINGS || false`)

To do so, add the config options as an object argument to the function call:

```{javascript}
const { FFmpegCommand, FFmpegInput, FFmpegOutput } = require('@tedconf/fessonia')({
  ffmpeg_bin: "/path/to/ffmpeg/binary/here",
  ffprobe_bin: "/path/to/ffprobe/binary/here",
  debug: true,
  log_warnings: true
});
```

## Understanding the library

If, for example, you wanted convert an `mp4` video into `avi` format,
the `ffmpeg` CLI command would look like this:

```{bash}
ffmpeg -i input.mp4 output.avi
```

The library constructs this in pieces: first the input, then the output, then the command:

```{javascript}
const ffin = new FFmpegInput('input.mp4');
const ffout = new FFmpegOutput('output.avi');

const cmd = new FFmpegCommand();
cmd.addInput(ffin);
cmd.addOutput(ffout);

console.log(cmd.toString()); //=> ffmpeg -i "input.mp4" "output.avi"
```

### Events

The `FFmpegCommand` object is an `EventEmitter`, so you can attach handlers
for the `update`, `success`, `failure` and `error` events:

```{javascript}
cmd.on('update', (data) => {
  console.log(`Received update on ffmpeg process:`, data);
  // handle the update here
});

cmd.on('success', (data) => {
  assert(data.exitCode === 0);
  assert(data.hasOwnProperty('progressData'));
  console.log(`Completed successfully with exit code ${data.exitCode}`, data.progressData);
  // handle the success here
});

cmd.on('failure', (data) => {
  console.log('Failure in ffmpeg execution', data);
  // handle the failure here
});

cmd.on('error', (err) => {
  console.log(err.message, err.stack);
  // handle the error here
});
```

#### A Note on Progress Events

In order to manage progress updates through events, the library by default modifies the FFmpeg command you specify upon execution by `spawn`, adding the global `-progress` option if not already specified (ref: [FFmpeg "Options"](http://ffmpeg.org/ffmpeg.html#Options), search for `-progress`).

To disable this, you can disable progress event emitting by passing `false` as an argument to `FFmpegCommand`'s `spawn` method. `spawn` returns the `childProcess` object so you can interpret `stderr` on your own. Process events `success`, `failure` and `error` will still be emitted. See {@link FFmpegCommand#spawn}.

```{javascript}
cmd.spawn(false); // 'update' events will not be emitted
```

### Executing the Command

To execute the command and get a `Promise` for the `stdout` output of `ffmpeg`, you can use the `execute` method:

```{javascript}
cmd.execute();
```

To execute the command and get the actual `child_process` object back, you can use the `spawn` method:

```{javascript}
cmd.spawn();
```

## Why the complexity?

With the very simple example above, you may wonder why we need the
added complexity of the library's objects and classes. As you deal
with more complex `ffmpeg` commands, it becomes more and more difficult
to construct/parse the command syntax, and constructing it in pieces
makes things much easier.

There are 5 key pieces you can construct using the library:

* **The `FFmpegCommand` object** -- provides the mechanism for handling global
  scoped options, hosting a filter graph, assembling command components into a
  complete command, executing the command, and reporting progress, success or
  failure via events.
* **The `FFmpegInput` object** -- handles the construction of an input to the
  `ffmpeg` command, including inputs using files, URIs or filters as sources.
* **The `FilterNode` object** -- handles the assembly and validation of a single
  filter node in an `ffmpeg` filter chain or graph.
* **The `FilterChain` object** -- handles assembling filter nodes into a chain
  usable as an input source or adding to a command's filter graph.
* **The `FFmpegOutput` object** -- handles the construction and validation of
  an output specification for the `ffmpeg` command, including application of
  output processing options.

By assembling these pieces, you can construct an `ffmpeg` command that is
quite complex with ease.

## Where to go for more on these key pieces

The `ffmpeg` documentation provides much more detailed information on how these
pieces work, and since this library provides an interface to that software, the
best resource to learn about these topics is from the `ffmpeg` docs.

(We've intentionally kept the language here consistent with the `ffmpeg` documentation,
so there should be no translation gap between what is described here and what is
available in the `ffmpeg` documentation. If you find that is not true, please submit a PR!)

In particular, the following topics may be helpful:

* [Options](http://ffmpeg.org/ffmpeg.html#Options)
  * [Global/Generic options](http://ffmpeg.org/ffmpeg.html#Generic-options)
  * [Per-stream options](http://ffmpeg.org/ffmpeg.html#Main-options)
  * [Stream specifiers](http://ffmpeg.org/ffmpeg.html#Stream-specifiers-1)
  * [Stream selection](http://ffmpeg.org/ffmpeg.html#Stream-selection)
* [Filtering](http://ffmpeg.org/ffmpeg.html#Filtering)
  * [Intro to Filtering](http://ffmpeg.org/ffmpeg-filters.html#Filtering-Introduction)
  * [List of available filters](http://ffmpeg.org/ffmpeg-filters.html#Audio-Filters)
  * [Filtergraphs and linklabels](http://ffmpeg.org/ffmpeg-filters.html#Filtergraph-description)
  * [Filters as input, and the `lavfi` device](http://ffmpeg.org/ffmpeg-devices.html#lavfi)
* [Formats (demuxers & muxers)](http://ffmpeg.org/ffmpeg-formats.html)

## A few more complex examples

Often, the work we need to do with `ffmpeg` is quite complex. For example,
we may want to overlay images on top of a video stream or generate test
video streams with accompanying audio.

The following examples each provide both a practical, real-life command, as
well as the code for constructing and executing it in the library. For brevity,
event handling is omitted (but would be handled as above).

1. {@tutorial 1_example_overlay_images}
2. {@tutorial 2_example_generate_test_video}
