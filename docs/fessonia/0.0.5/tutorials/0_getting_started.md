## Install

Install via `npm`:

```{bash}
npm i fessonia
```

Or via `yarn`

```{bash}
yarn i fessonia
```

## Import

You can import the whole library:

```{javascript}
const fessonia = require('fessonia');
```

Or you can use destructuring to import individual classes:

```{javascript}
const { FFmpegCommand, FFmpegInput, FFmpegOutput } = require('fessonia');
```

## Understanding the library

If, for example, you wanted convert an `mp4` video into `avi` format,
the `ffmpeg` CLI command would look like this:

```{bash}
ffmpeg -i input.mp4 output.avi
```

The library constructs this in pieces: first the input, then the output, then the command:

```{javascript}
const ffin = new fessonia.FFmpegInput('input.mp4', {});
const ffout = new fessonia.FFmpegOutput('output.avi', {});

const cmd = new fessonia.FFmpegCommand({});
cmd.addInput(ffin);
cmd.addOutput(ffout);

console.log(cmd.toString()); //=> /path/to/ffmpeg -i "input.mp4" "output.avi"
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

### Executing the Command

To execute the command **synchronously**, you can use the `execute` method:

```{javascript}
cmd.execute();
```

To execute the command **asynchronously**, you can use the `spawn` method:

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
  scoped options, assembling command components into a complete command,
  executing the command, and reporting progress, success or failure via events.
* **The `FFmpegInput` object** -- handles the construction of an input to the 
  `ffmpeg` command, including inputs using files, URIs or filters as sources.
* **The `FilterNode` object** -- handles the assembly and validation of a single
  filter node in an `ffmpeg` filter graph.
* **The `FilterGraph` object** -- handles assembling filter nodes into a graph
  usable as an input source or on an output processing chain.
* **The `FFmpegOutput` object** -- handles the construction and validation of
  an output specification for the `ffmpeg` command, including application of
  output processing options.

By assembling these pieces, you can construct an `ffmpeg` command that is
quite complex with ease.

## A few more complex examples

Often, the work we need to do with `ffmpeg` is quite complex. For example,
we may want to overlay images on top of a video stream or generate test
video streams with accompanying audio.

The following examples each provide both a practical, real-life command, as
well as the code for constructing and executing it in the library. For brevity,
event handling is omitted (but would be handled as above).

1. {@tutorial 1_example_overlay_images}
2. {@tutorial 2_example_generate_test_video}
