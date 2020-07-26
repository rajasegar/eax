const fs = require('fs');
const walkSync = require('walk-sync');

const getTotalSize = function (assetsPath, globs) {
  const arrayOfFiles = walkSync(assetsPath, {
    directories: false,
    globs,
    includeBasePath: true,
  });

  let totalSize = 0;

  arrayOfFiles.forEach(function (filePath) {
    totalSize += fs.statSync(filePath).size;
  });

  return totalSize;
};

module.exports = getTotalSize;
