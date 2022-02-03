The ffmpeg command to overlay images on video is a bit more complex. The
following command, for example, adds two logos, one on each bottom corner
of the video, copying any audio.

```{bash}
ffmpeg -i input.mov -i logo1.png -i logo2.png -filter_complex 'overlay=x=10:y=main_h-overlay_h-10,overlay=x=main_w-overlay_w-10:y=main_h-overlay_h-10' -c:a copy output.mp4
```

To construct this in JavaScript using the library, you can use the following.

```{javascript}
const fessonia = require('fessonia')();

// Create command
const cmd = new fessonia.FFmpegCommand();

// Add inputs
['input.mov', 'logo1.png', 'logo2.png']
  .forEach((ffin) => cmd.addInput(new fessonia.FFmpegInput(ffin)));

// Generate a filter chain and add it to the command's filter graph
const overlay1 = new fessonia.FilterNode(
  /* the ffmpeg filter name */
  'overlay',
  /* args can be specified as named arguments */
  { x: 10, y: 'main_h-overlay_h-10' }
);
const overlay2 = new fessonia.FilterNode(
  'overlay',
  /* or args can be specified as ordered arguments */
  ['main_w-overlay_w-10', 'main_h-overlay_h-10']
);
const filterchain = new fessonia.FilterChain([overlay1,overlay2]);
cmd.addFilterChain(filterchain);

// Construct and add the output using the filtergraph
const ffout = new fessonia.FFmpegOutput('output.mp4', {'c:a': 'copy'});
cmd.addOutput(ffout);

// ... handle events, etc.

// Execute the command
cmd.spawn();
```
