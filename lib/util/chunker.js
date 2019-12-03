const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

class Chunker extends Transform {
  constructor(options) {
    super(options);
    this.decoder = new StringDecoder('utf8');
  }

  _transform(chunk, encoding, callback) {
    let chunkString = this.decoder.write(chunk);
    if (this.bufferedLine) {
      chunkString = this.bufferedLine + chunkString;
      this.bufferedLine = undefined;
    }
    let lines = chunkString.split(/(?<=[\r\n])/);
    for (let line of lines) {
      if (/[\r\n]$/.test(line)) {
        this.push(line);
      } else {
        this.bufferedLine = line;
      }
    }
    callback();
  }

  _flush(callback) {
    this.push(this.bufferedLine);
    callback();
  }
}

module.exports = Chunker;
