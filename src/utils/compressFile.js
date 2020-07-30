'use strict';

const fs = require('fs');
const zlib = require('zlib');

module.exports = function (file) {
  let contentsBuffer = fs.readFileSync(file);
  let output = {
    name: file,
    size: contentsBuffer.length,
  };

  output.brotliSize = zlib.brotliCompressSync(contentsBuffer).length;

  output.gzipSize = zlib.gzipSync(contentsBuffer).length;

  return output;
};
