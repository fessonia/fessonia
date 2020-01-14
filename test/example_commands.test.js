const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs');

const FFmpegCommand = require('../lib/ffmpeg_command');
const FFmpegInput = require('../lib/ffmpeg_input');
const FFmpegOutput = require('../lib/ffmpeg_output');
const FilterNode = require('../lib/filter_node');
const config = require('../lib/util/config')();

describe('Example Commands', function () {
  describe('example encode commands from real use', function () {
    it('encodes example #1, pass 1', function () {
      const scaleNode = new FilterNode('scale', [320, 180]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=320:180" -c:v "libx264" -preset:v "slow" -profile:v "baseline" -level:v "1.3" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "112k" -minrate "100.8k" -maxrate "123.2k" -bufsize "13.44k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'baseline'],
        ['level:v', 1.3],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '112k'],
        ['minrate', '100.8k'],
        ['maxrate', '123.2k'],
        ['bufsize', '13.44k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #1, pass 2', function () {
      const scaleNode = new FilterNode('scale', [320, 180]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=320:180" -c:v "libx264" -preset:v "slow" -profile:v "baseline" -level:v "1.3" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "112k" -movflags "+faststart" -minrate "100.8k" -maxrate "123.2k" -bufsize "13.44k" -c:a "aac" -b:a "24k" -ar "24k" -ac "1" -f "mp4" -aspect "16:9" -pass "2" "/some/output_320x180_Low.mp4"`
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_320x180_Low.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'baseline'],
        ['level:v', 1.3],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '112k'],
        ['movflags', '+faststart'],
        ['minrate', '100.8k'],
        ['maxrate', '123.2k'],
        ['bufsize', '13.44k'],
        ['c:a', 'aac'],
        ['b:a', '24k'],
        ['ar', '24k'],
        ['ac', 1],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #2, pass 1', function () {
      const scaleNode = new FilterNode('scale', [320, 180]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=320:180" -c:v "libx264" -preset:v "fast" -profile:v "baseline" -level:v "3.0" -pix_fmt "yuv420p" -g "48" -b:v "180k" -minrate "162k" -maxrate "198k" -bufsize "36k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'baseline'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['g', 48],
        ['b:v', '180k'],
        ['minrate', '162k'],
        ['maxrate', '198k'],
        ['bufsize', '36k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #2, pass 2', function () {
      const scaleNode = new FilterNode('scale', [320, 180]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=320:180" -c:v "libx264" -preset:v "fast" -profile:v "baseline" -level:v "3.0" -pix_fmt "yuv420p" -g "48" -b:v "180k" -movflags "+faststart" -minrate "162k" -maxrate "198k" -bufsize "36k" -c:a "libfdk_aac" -b:a "40k" -ar "44.1k" -ac "1" -f "mp4" -aspect "16:9" -pass "2" "/some/output_320x180_High.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_320x180_High.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'baseline'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['g', 48],
        ['b:v', '180k'],
        ['movflags', '+faststart'],
        ['minrate', '162k'],
        ['maxrate', '198k'],
        ['bufsize', '36k'],
        ['c:a', 'libfdk_aac'],
        ['b:a', '40k'],
        ['ar', '44.1k'],
        ['ac', 1],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #3, pass 1', function () {
      const scaleNode = new FilterNode('scale', [416, 234]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=416:234" -c:v "libx264" -preset:v "slow" -profile:v "baseline" -level:v "3.0" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "300k" -minrate "270k" -maxrate "330k" -bufsize "30k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'baseline'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '300k'],
        ['minrate', '270k'],
        ['maxrate', '330k'],
        ['bufsize', '30k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #3, pass 2', function () {
      const scaleNode = new FilterNode('scale', [416, 234]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=416:234" -c:v "libx264" -preset:v "slow" -profile:v "baseline" -level:v "3.0" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "300k" -movflags "+faststart" -minrate "270k" -maxrate "330k" -bufsize "30k" -c:a "aac" -b:a "40k" -ar "44.1k" -ac "1" -f "mp4" -aspect "16:9" -pass "2" "/some/output_416x234_Low.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_416x234_Low.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'baseline'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '300k'],
        ['movflags', '+faststart'],
        ['minrate', '270k'],
        ['maxrate', '330k'],
        ['bufsize', '30k'],
        ['c:a', 'aac'],
        ['b:a', '40k'],
        ['ar', '44.1k'],
        ['ac', 1],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #4, pass 1', function () {
      const scaleNode = new FilterNode('scale', [416, 234]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=416:234" -c:v "libx264" -preset:v "fast" -profile:v "high" -level:v "3.0" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "427.5k" -minrate "384.75k" -maxrate "470.25k" -bufsize "64.125k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'high'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '427.5k'],
        ['minrate', '384.75k'],
        ['maxrate', '470.25k'],
        ['bufsize', '64.125k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #4, pass 2', function () {
      const scaleNode = new FilterNode('scale', [416, 234]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=416:234" -c:v "libx264" -preset:v "fast" -profile:v "high" -level:v "3.0" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "427.5k" -movflags "+faststart" -minrate "384.75k" -maxrate "470.25k" -bufsize "64.125k" -c:a "libfdk_aac" -b:a "40k" -ar "44.1k" -ac "1" -f "mp4" -aspect "16:9" -pass "2" "/some/output_416x234_High.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_416x234_High.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'high'],
        ['level:v', '3.0'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '427.5k'],
        ['movflags', '+faststart'],
        ['minrate', '384.75k'],
        ['maxrate', '470.25k'],
        ['bufsize', '64.125k'],
        ['c:a', 'libfdk_aac'],
        ['b:a', '40k'],
        ['ar', '44.1k'],
        ['ac', 1],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #5, pass 1', function () {
      const scaleNode = new FilterNode('scale', [480, 270]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=480:270" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "600k" -minrate "540k" -maxrate "660k" -bufsize "60k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '600k'],
        ['minrate', '540k'],
        ['maxrate', '660k'],
        ['bufsize', '60k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #5, pass 2', function () {
      const scaleNode = new FilterNode('scale', [480, 270]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=480:270" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "600k" -movflags "+faststart" -minrate "540k" -maxrate "660k" -bufsize "60k" -c:a "aac" -b:a "50k" -ar "44.1k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_480x270.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_480x270.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '600k'],
        ['movflags', '+faststart'],
        ['minrate', '540k'],
        ['maxrate', '660k'],
        ['bufsize', '60k'],
        ['c:a', 'aac'],
        ['b:a', '50k'],
        ['ar', '44.1k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #6, pass 1', function () {
      const scaleNode = new FilterNode('scale', [640, 360]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=640:360" -c:v "libx264" -preset:v "fast" -profile:v "high" -level:v "3.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "900k" -minrate "810k" -maxrate "990k" -bufsize "115k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'high'],
        ['level:v', 3.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '900k'],
        ['minrate', '810k'],
        ['maxrate', '990k'],
        ['bufsize', '115k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #6, pass 2', function () {
      const scaleNode = new FilterNode('scale', [640, 360]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=640:360" -c:v "libx264" -preset:v "fast" -profile:v "high" -level:v "3.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "900k" -movflags "+faststart" -minrate "810k" -maxrate "990k" -bufsize "115k" -c:a "libfdk_aac" -b:a "75k" -ar "44.1k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_640x360.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_640x360.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'fast'],
        ['profile:v', 'high'],
        ['level:v', 3.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '900k'],
        ['movflags', '+faststart'],
        ['minrate', '810k'],
        ['maxrate', '990k'],
        ['bufsize', '115k'],
        ['c:a', 'libfdk_aac'],
        ['b:a', '75k'],
        ['ar', '44.1k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #7, pass 1', function () {
      const scaleNode = new FilterNode('scale', [854, 480]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=854:480" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "1200k" -minrate "1080k" -maxrate "1320k" -bufsize "120k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '1200k'],
        ['minrate', '1080k'],
        ['maxrate', '1320k'],
        ['bufsize', '120k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #7, pass 2', function () {
      const scaleNode = new FilterNode('scale', [854, 480]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=854:480" -c:v "libx264" -preset:v "slow" -profile:v "high" -level:v "3.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "1200k" -minrate "1080k" -maxrate "1320k" -bufsize "120k" -c:a "aac" -b:a "96k" -ar "44.1k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_854x480.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_854x480.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['level:v', 3.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '1200k'],
        ['minrate', '1080k'],
        ['maxrate', '1320k'],
        ['bufsize', '120k'],
        ['c:a', 'aac'],
        ['b:a', '96k'],
        ['ar', '44.1k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #8, pass 1', function () {
      const scaleNode = new FilterNode('scale', [1280, 720]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=1280:720" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3000k" -minrate "2700k" -maxrate "3300k" -bufsize "300k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '3000k'],
        ['minrate', '2700k'],
        ['maxrate', '3300k'],
        ['bufsize', '300k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #8, pass 2', function () {
      const scaleNode = new FilterNode('scale', [1280, 720]);
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -filter_complex "scale=1280:720" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3000k" -movflags "+faststart" -minrate "2700k" -maxrate "3300k" -bufsize "300k" -c:a "aac" -b:a "96k" -ar "48k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_1280x720_High.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_1280x720_High.mp4', new Map([
        ['vf', scaleNode],
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '3000k'],
        ['movflags', '+faststart'],
        ['minrate', '2700k'],
        ['maxrate', '3300k'],
        ['bufsize', '300k'],
        ['c:a', 'aac'],
        ['b:a', '96k'],
        ['ar', '48k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #9, pass 1', function () {
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -level:v "4.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3900k" -minrate "3510k" -maxrate "4290k" -bufsize "488k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['level:v', 4.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '3900k'],
        ['minrate', '3510k'],
        ['maxrate', '4290k'],
        ['bufsize', '488k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #9, pass 2', function () {
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -level:v "4.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3900k" -movflags "+faststart" -minrate "3510k" -maxrate "4290k" -bufsize "488k" -c:a "aac" -b:a "96k" -ar "48k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_1920x1080_Low.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_1920x1080_Low.mp4', new Map([
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['level:v', 4.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '3900k'],
        ['movflags', '+faststart'],
        ['minrate', '3510k'],
        ['maxrate', '4290k'],
        ['bufsize', '488k'],
        ['c:a', 'aac'],
        ['b:a', '96k'],
        ['ar', '48k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #10, pass 1', function () {
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "5000k" -flags "+bitexact" -sws_flags "+accurate_rnd+bitexact" -fflags "+bitexact" -minrate "4500k" -maxrate "5500k" -bufsize "500k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/dev/null', new Map([
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '5000k'],
        ['flags', '+bitexact'],
        ['sws_flags', '+accurate_rnd+bitexact'],
        ['fflags', '+bitexact'],
        ['minrate', '4500k'],
        ['maxrate', '5500k'],
        ['bufsize', '500k'],
        ['an', null],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 1]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
    it('encodes example #10, pass 2', function () {
      const expected = `${config.ffmpeg_bin} -y -i "/some/input_master.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -level:v "4.1" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "5000k" -movflags "+faststart" -flags "+bitexact" -sws_flags "+accurate_rnd+bitexact" -fflags "+bitexact" -minrate "4500k" -maxrate "5500k" -bufsize "500k" -c:a "libfdk_aac" -b:a "96k" -ar "48k" -ac "2" -f "mp4" -aspect "16:9" -pass "2" "/some/output_1920x1080_High.mp4"`;
      const fc = new FFmpegCommand({ y: null });
      const fi = new FFmpegInput('/some/input_master.mov', {});
      const fo = new FFmpegOutput('/some/output_1920x1080_High.mp4', new Map([
        ['c:v', 'libx264'],
        ['preset:v', 'slow'],
        ['profile:v', 'high'],
        ['level:v', 4.1],
        ['pix_fmt', 'yuv420p'],
        ['coder', 1],
        ['g', 48],
        ['b:v', '5000k'],
        ['movflags', '+faststart'],
        ['flags', '+bitexact'],
        ['sws_flags', '+accurate_rnd+bitexact'],
        ['fflags', '+bitexact'],
        ['minrate', '4500k'],
        ['maxrate', '5500k'],
        ['bufsize', '500k'],
        ['c:a', 'libfdk_aac'],
        ['b:a', '96k'],
        ['ar', '48k'],
        ['ac', 2],
        ['f', 'mp4'],
        ['aspect', '16:9'],
        ['pass', 2]
      ]));
      fc.addInput(fi);
      fc.addOutput(fo);
      expect(fc.toString()).to.eql(expected);
    });
  });
});
