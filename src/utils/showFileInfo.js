// A function to display formatted file info
module.exports = function (info) {
  const { path, size, loc } = info;
  let _content = `Full Path: ${path}`;
  _content += `\nSize: ${size}`;
  _content += `\nLOC: ${loc}`;
  return _content;
};
