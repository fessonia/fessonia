export = Chunker;
declare const Chunker_base: any;
declare class Chunker extends Chunker_base {
    [x: string]: any;
    constructor(options: any);
    decoder: any;
    _transform(chunk: any, encoding: any, callback: any): void;
    bufferedLine: any;
    _flush(callback: any): void;
}
