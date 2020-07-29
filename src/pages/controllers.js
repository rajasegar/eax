'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const getFileInfo = require('../utils/getFileInfo');
const showFileInfo = require('../utils/showFileInfo');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const getServiceDeps = require('../utils/getServiceDeps');
const highlight = require('../utils/highlight');

module.exports = function (screen, currPage, selected) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/controllers';

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Controllers',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search: function (callback) {
      prompt.input('Search Controller:', '', function (err, value) {
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
  leftCol.setLabel(`Controllers: (${items.length})`);

  if (selected) {
    leftCol.select(leftCol.getItemIndex(selected));
  }

  const fileInfo = grid.set(0, 3, 2, 9, blessed.box, {
    label: 'File info:',
  });

  const mixins = grid.set(2, 5, 2, 2, blessed.list, {
    label: 'Mixins',
  });

  const services = grid.set(2, 7, 2, 2, blessed.list, {
    label: 'Services',
  });

  const utils = grid.set(2, 3, 2, 2, blessed.list, {
    label: 'Utils',
  });

  const fileContents = grid.set(4, 3, 8, 9, blessed.box, {
    label: 'Contents:',
  });

  leftCol.on('select', function (node) {
    //console.log(node);
    const { content } = node;
    const js = `${root}/${namespace}/${content}`;
    let _fileInfo = getFileInfo(js);
    fileInfo.setContent(showFileInfo(_fileInfo));
    fileContents.setContent(highlight(_fileInfo.content));

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

    getServiceDeps(js).then((data) => {
      services.setItems(data);
      services.setLabel(`Services (${data.length})`);
      screen.render();
    });

    screen.render();
  });

  leftCol.focus();

  screen.append(prompt);
  screen.render();
};
