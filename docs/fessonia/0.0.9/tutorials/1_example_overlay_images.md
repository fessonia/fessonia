The ffmpeg command to overlay images on video is a bit more complex. The
following command, for example, adds two logos, one on each bottom corner
of the video, copying any audio.

```{bash}
ffmpeg -i input.mov -i logo1.png -i logo2.png -filter_complex 'overlay=x=10:y=main_h-overlay_h-10,overlay=x=main_w-overlay_w-10:y=main_h-overlay_h-10' -c:a copy output.mp4
```

To construct this in JavaScript using the library, you can use the following.

```{javascript}
const fessonia = require('@tedconf/fessonia')();

// Create command
const cmd = new fessonia.FFmpegCommand({});

// Add inputs
['input.mov', 'logo1.png', 'logo2.png']
  .forEach((ffin) => cmd.addInput(new fessonia.FFmpegInput(ffin, {}));

// Generate filtergraph
const overlay1 = new fessonia.FilterNode({
  filterName: 'overlay',
  /* args can be specified as named arguments */
  args: [
    {name: 'x', value: 10},
    {name: 'y', value: 'main_h-overlay_h-10'}
  ]
});
const overlay2 = new fessonia.FilterNode({
  filterName: 'overlay',
  /* or args can be specified as ordered arguments */
  args: ['main_w-overlay_w-10', 'main_h-overlay_h-10']
});
const filtergraph = new fessonia.FilterGraph(
  [overlay1,overlay2], /* the list of nodes in the filtergraph */
  [overlay1], /* where the filtergraph starts */
  [ /* connections between nodes in the filtergraph */
    [[overlay1, 0], [overlay2, 0]]
  ]
);

// Construct and add the output using the filtergraph
const ffout = new fessonia.FFmpegOutput('output.mp4', new Map([
  ['filter', filtergraph],
  ['c:a', 'copy']
]));
cmd.addOutput(ffout);

// ... handle events, etc.

// Execute the command
cmd.spawn();
```
