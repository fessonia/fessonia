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
const { FilterNode, FilterChain, FFmpegInput, FFmpegOutput, FFmpegCommand } = require('@tedconf/fessonia')();

// Construct the video filtergraph and corresponding input
const lifeFilter = new FilterNode('life',{
  size: '320x240',
  mold: 10,
  rate: 23.976,
  ratio: 0.5,
  death_color: '#C83232',
  life_color: '#00ff00',
  stitch: 0
});
const scaleFilter = new FilterNode('scale', [1920, 1080]);
const videoFilters = new FilterChain([lifeFilter, scaleFilter]);
const videoIn = new FFmpegInput(videoFilters, new Map([
  ['r', 23.976],
  ['f', 'lavfi']
]));

// Construct the audio filtergraph and corresponding input
const sineFilter = new FilterNode('sine', {
  frequency: 620,
  beep_factor: 4,
  duration: 999999,
  sample_rate: 48000,
});
const audioFilters = new FilterChain([sineFilter]);
const audioIn = new FFmpegInput(audioFilters, new Map([
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
