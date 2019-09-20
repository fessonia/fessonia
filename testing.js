let Fessonia = require('./index')({
  ffmpeg_bin: '/pathways/to/the/moon/ffmpeg_bin',
  ffprobe_bin: '/pathways/to/the/sun/ffprobe_bin'
});
let {
  FFmpegCommand,
  FFmpegInput,
  FFmpegOutput,
  FilterNode,
  FilterGraph,
  Config
} = Fessonia;

console.info(FFmpegOutput)
const ffmpegOutput = new FFmpegOutput('/some/url/path', { 'f': 'mp4' })
console.info(ffmpegOutput)
console.info(Config)
console.info(FFmpegCommand)
console.info(FFmpegInput)
console.info(FilterNode)
console.info(FilterGraph)


process.env.DEBUG = false
Fessonia = require('./index')({
  ffmpeg_bin: '/usr/local/bin/ffmpeg',
  ffprobe_bin: '/usr/local/bin/ffprobe',
  debug: false
});
FFmpegCommand = Fessonia.FFmpegCommand
FFmpegInput = Fessonia.FFmpegInput
FFmpegOutput = Fessonia.FFmpegOutput
FilterNode = Fessonia.FilterNode
FilterGraph = Fessonia.FilterGraph
Config = Fessonia.Config

const scaleFilter = new FilterNode({
 filterName: 'scale',
 args: [640, -1]
})
const subtitlesFilter = new FilterNode({
 filterName: 'subtitles',
 args: [{ name: 'filename', value: '/encode-support/speaker.ass' }]
})
const filters = new FilterGraph(
 [ scaleFilter, subtitlesFilter ],
 [ scaleFilter ],
 [ [ scaleFilter, 0 ], [ subtitlesFilter, 0 ] ]
)
const video = new FFmpegInput(
 '/sources/2018S-RES0601-S02-DMX.mov',
 { 'ss': 5110.77 }
)
const audio = new FFmpegInput(
 '/sources/2018S-RES0601-S02-DMX.mov',
 { 'itsoffset': 0, 'ss': 5110.77 }
)
const output = new FFmpegOutput(
 '/outputs/2018S-Esther_Queen-99497-S02-speaker.mp4',
 { 'c:a': 'libfdk_aac', 'ac': 1, 'b:a': '48k',
   'c:v': 'libx264', 'b:v': '400k', 'filter:v': filters,
   'f': 'mp4', 't': 642.517, 'movflags': 'faststart',
   'preset:v': 'ultrafast', 'tune': 'film', 'pix_fmt': 'yuv420p' }
)
const cmd = new FFmpegCommand({ y: null })
cmd.addInput(video)
cmd.addInput(audio)
cmd.addOutput(output, mappings = [ [video, 'v'], [audio, 'a'] ])

console.log(video)
console.log(audio)
console.log(output)
console.log(scaleFilter)
console.log(subtitlesFilter)
console.log(filters)
// console.log(cmd)
console.log(cmd.toString())
console.log(cmd.toCommand())
