export = getFessonia;
/**
 * @description "Fessonia"
 * @fileOverview "Fessonia package import and configuration"
 * @author "Ryan B. Harvey <ryan.b.harvey@ted.com>"
 */
/**
 * Main function interface to the library. Returns object of classes when called.
 * @param {Object} opts - an object of configuration options (@see Config)
 * @returns {Object} - the library's interface classes: {@linkcode FFmpegCommand},  {@linkcode FFmpegInput},  {@linkcode FFmpegOutput},  {@linkcode FilterNode},  {@linkcode FilterChain}
 */
declare function getFessonia(opts?: any): any;
