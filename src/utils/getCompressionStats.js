const workerpool = require('workerpool');
const walkSync = require('walk-sync');
const path = require('path');

function _findFiles(inputPath, include) {
  let _inputPath = inputPath || '.';
  let _options = { directories: false };

  // include filter
  if (include && include.length > 0) {
    _options.globs = include;
  }

  try {
    return walkSync(_inputPath, _options).map((x) => path.join(_inputPath, x));
  } catch (e) {
    if (e !== null && typeof e === 'object' && e.code === 'ENOENT') {
      //throw new Error(`No files found in the path provided: ${inputPath}`);
      console.log(`No files found in the path provided: ${inputPath}`);
      return [];
    } else {
      throw e;
    }
  }
}

module.exports = function (inputPath, include) {
  const { options } = this;
  return new Promise((resolve) => {
    let files = _findFiles(inputPath, include);

    // create a dedicated worker
    const pool = workerpool.pool(__dirname + '/workers/compression.js');

    let assets = files
      // Print human-readable file sizes (including gzip and brotli)
      .map((file) => {
        return pool
          .exec('compressFile', [file, options])
          .then(function (result) {
            //console.log(result);
            return result;
          })
          .catch(function (err) {
            console.error(err);
          });
      });

    return Promise.all(assets).then((data) => {
      pool.terminate(); // terminate all workers when done
      resolve(data);
    });
  });
};
