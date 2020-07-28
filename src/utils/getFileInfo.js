const fs = require('fs');
const filesize = require('filesize');

// A function to get raw file info in an object
// Can be used with utils/fileInfo to display in a formatted way
module.exports = function (file) {
  const buffer = fs.existsSync(file) && fs.readFileSync(file, 'utf-8');
  const size = (buffer && filesize(buffer.length)) || 0;
  const loc = (buffer && buffer.split('\n').length - 1) || 0;

  return {
    path: file,
    size,
    loc,
    content: buffer,
  };
};
