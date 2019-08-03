To generate test video usually requires using source filters to generate
video and audio streams, which results in very complex `ffmpeg` commands.

For example, the following command generates a video using the `life`
filter for video and the `sine` filter for audio.

```{bash}
ffmpeg -r "23.976" -f "lavfi" -i \
  "life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080" \
  -f "lavfi" -i "sine=frequency=620:beep_factor=4:duration=999999:sample_rate=48000" \
  -c:v "libx264" -c:a "aac" -pix_fmt "yuv420p" -aspect "16:9" -vframes "500" "gen.mov"
```

To do the same using Fessonia in JavaScript, you would do the following.

```{javascript}
const { FilterNode, FilterGraph, FFmpegInput, FFmpegOutput, FFmpegCommand } = require('fessonia');

// Construct the video filtergraph and corresponding input
const lifeFilter = new FilterNode({
  filterName: 'life',
  args: [
    { name: 'size', value: '320x240' },
    { name: 'mold', value: 10 },
    { name: 'rate', value: 23.976 },
    { name: 'ratio', value: 0.5 },
    { name: 'death_color', value: '#C83232' },
    { name: 'life_color', value: '#00ff00' },
    { name: 'stitch', value: 0 }
  ]
});
const scaleFilter = new FilterNode({
  filterName: 'scale',
  args: [1920, 1080]
});
const videoGraph = new FilterGraph(
  [lifeFilter, scaleFilter],
  null,
  [
    [[lifeFilter, '0'], [scaleFilter, '0']]
  ]
);
const videoIn = new FFmpegInput(videoGraph, new Map([
  ['r', 23.976],
  ['f', 'lavfi']
]));

// Construct the audio filtergraph and corresponding input
const sineFilter = new FilterNode({
  filterName: 'sine',
  args: [
    { name: 'frequency', value: 620 },
    { name: 'beep_factor', value: 4 },
    { name: 'duration', value: 999999 },
    { name: 'sample_rate', value: 48000 }
  ]
});
const audioGraph = new FilterGraph([sineFilter], null, []);
const audioIn = new FFmpegInput(audioGraph, new Map([
  ['f', 'lavfi']
]));

// Construct the output
const out = new FFmpegOutput('gen.mov', new Map([
  ['c:v', 'libx264'],
  ['c:a', 'aac'],
  ['pix_fmt', 'yuv420p'],
  ['aspect', '16:9'],
  ['vframes', 500]
]));

// Construct the command and add inputs and outputs
const cmd = new FFmpegCommand({});
cmd.addInput(videoIn);
cmd.addInput(audioIn);
cmd.addOutput(out);

// Handle events...

// Execute the command
cmd.spawn();
```