'use strict';

const workerpool = require('workerpool');
const compressFile = require('../compressFile');

// create worker and register public functions
workerpool.worker({
  compressFile,
});
