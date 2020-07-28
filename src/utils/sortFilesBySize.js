const R = require('ramda');
const fs = require('fs');
const walkSync = require('walk-sync');
const path = require('path');

const _root = process.argv[2] || '.';
const root = path.resolve(_root);
module.exports = function (path, globs, ignore) {
  let items = [];
  const _globs = globs || ['**/*.js'];
  const _ignore = ignore || ['.gitkeep'];
  const folder = `${root}/${path}`;
  if (fs.existsSync(folder)) {
    items = walkSync(folder, {
      directories: false,
      includeBasePath: true,
      globs: _globs,
      ignore: _ignore,
    }).map((f) => {
      const stat = fs.readFileSync(f, 'utf-8');
      return [f, stat.length, stat.split('\n').length - 1];
    });

    const fileSizeSort = R.sortWith([R.descend(R.prop(1))]);

    items = fileSizeSort(items).map((i) => {
      const [fileName] = i;
      return fileName.replace(`${folder}/`, '');
    });
  }
  return items;
};
