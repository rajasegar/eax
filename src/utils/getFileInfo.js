const fs = require('fs');
const filesize = require('filesize');

module.exports = function (file) {
  const buffer = fs.existsSync(file) && fs.readFileSync(file, 'utf-8');
  let _content = `Full Path: ${file}`;
  _content += `\nSize: ${filesize(buffer.length)}`;
  _content += `\nLOC: ${buffer.split('\n').length - 1}`;
  return _content;
};
