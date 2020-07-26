'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const getHasMany = require('../utils/getHasMany');
const getBelongsTo = require('../utils/getBelongsTo');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/models';

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Models',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search: function (callback) {
      prompt.input('Search Model:', '', function (err, value) {
        if (err) return;
        return callback(null, value);
      });
    },
  });

  const folder = path.resolve(`${root}/${namespace}`);
  let items = walkSync(folder, {
    directories: false,
    includeBasePath: true,
    globs: ['**/*.js'],
    ignore: ['.gitkeep'],
  }).map((f) => {
    let s = f.replace(`${root}/${namespace}/`, '');
    return s;
  });

  leftCol.setItems(items);
  leftCol.setLabel(`Models: (${items.length})`);

  const component = grid.set(0, 3, 2, 9, blessed.box, {
    label: 'File info:',
  });

  const hasManyWidget = grid.set(2, 3, 2, 2, blessed.list, {
    label: 'hasMany',
  });

  const belongsToWidget = grid.set(2, 5, 2, 2, blessed.list, {
    label: 'belongsTo',
  });

  const utils = grid.set(2, 7, 2, 2, blessed.list, {
    label: 'Utils',
  });
  const mixins = grid.set(2, 9, 2, 2, blessed.list, {
    label: 'Mixins',
  });

  leftCol.on('select', function (node) {
    //console.log(node);
    const { content } = node;
    const js = `${root}/${namespace}/${content}`;
    const jsStat = fs.existsSync(js) && fs.readFileSync(js, 'utf-8');
    if (jsStat) {
      let _content = `Full path: ${js}`;
      _content += `\nSize: ${filesize(jsStat.length)}`;
      _content += `\nLOC: ${jsStat.split('\n').length - 1}`;
      component.setContent(_content);
    }

    getUtilDeps(js).then((data) => {
      utils.setItems(data);
      utils.setLabel(`Utils (${data.length})`);
      screen.render();
    });

    getMixinDeps(js).then((data) => {
      mixins.setItems(data);
      mixins.setLabel(`Mixins (${data.length})`);
      screen.render();
    });

    getHasMany(js).then((data) => {
      hasManyWidget.setItems(data);
      hasManyWidget.setLabel(`hasMany (${data.length})`);
      screen.render();
    });

    getBelongsTo(js).then((data) => {
      belongsToWidget.setItems(data);
      belongsToWidget.setLabel(`belongsTo (${data.length})`);
      screen.render();
    });

    screen.render();
  });

  leftCol.focus();

  screen.append(prompt);
  screen.render();
};
