'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const filesize = require('filesize');
const entityPageMap = require('../utils/entity-page-map');

const style = {
  bg: 'black',
  fg: 'yellow',
  border: {
    type: 'line',
    bg: 'black',
  },
  focus: {
    border: {
      fg: 'white',
    },
  },
  selected: {
    fg: 'black',
    bg: 'white',
  },
};

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);

  const menu = [
    'Adapters',
    'Components',
    'Constants',
    'Controllers',
    'Helpers',
    'Initializers',
    'Mixins',
    'Models',
    'Routes',
    'Services',
    'Storages',
    'Styles',
    'Templates',
    'Transforms',
    'Utils',
    'Validators',
  ];

  const leftCol = grid.set(0, 0, 12, 2, blessed.list, {
    label: 'Menu',
    keys: true,
    vi: true,
    style,
  });
  leftCol.setItems(menu);

  const right = grid.set(0, 2, 12, 10, contrib.table, {
    label: 'Items',
    keys: true,
    vi: true,
    interactive: true,
    style,
    columnWidth: [80, 10, 10],
    selectedBg: 'white',
    selectedFg: 'black',
  });

  //set default table
  right.setData({ headers: ['Name', 'Size', 'LOC'], data: [[]] });

  let currentEntity = 'adapters';
  let exportData = [];

  leftCol.on('select', function (node) {
    const { content } = node;
    const name = content.slice(0, 1).toLowerCase() + content.slice(1);
    currentEntity = name;

    const folder = path.resolve(`${root}/app/${name}`);
    if (fs.existsSync(folder)) {
      let items = walkSync(folder, {
        directories: false,
        includeBasePath: true,
        ignore: ['.*'],
      });

      right.setLabel(`${content}: app/${name} (${items.length})`);
      items = items.map((f) => {
        const stat = fs.readFileSync(f, 'utf-8');
        return [f.replace(root, ''), stat.length, stat.split('\n').length - 1];
      });

      exportData = items;

      const fileSizeSort = R.sortWith([R.descend(R.prop(1))]);

      items = fileSizeSort(items).map((i) => {
        const [fileName, size, loc] = i;
        return [fileName.replace(`/app/${name}/`, ''), filesize(size), loc];
      });

      right.setData({ headers: ['Name', 'Size', 'LOC'], data: items });
      screen.render();
    } else {
      right.setData({ headers: ['Name', 'Size', 'LOC'], data: [[]] });
      screen.render();
    }
  });

  right.rows.on('select', function (item) {
    const { content } = item;

    const [name] = content.split(' ');
    var i = screen.children.length;
    while (i--) screen.children[i].detach();

    const pageFunction = entityPageMap[currentEntity];
    pageFunction(screen, 2, name);
    screen.render();
  });

  const exportPrompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
    label: 'Export List',
  });

  right.rows.key('e', function () {
    exportData.unshift('Name,Size,LOC');
    exportPrompt.input('Enter file name :', `${currentEntity}.csv`, function (
      err,
      value
    ) {
      if (err) return;
      fs.writeFile(`${value}`, exportData.join('\n'), 'utf8', (err) => {
        if (err) throw err;
      });
      screen.render();
    });
  });

  leftCol.focus();

  leftCol.key(['tab'], function (/*ch, key*/) {
    right.focus();
  });

  right.rows.key(['tab'], function (/*ch, key*/) {
    leftCol.focus();
  });

  screen.append(exportPrompt);
  screen.render();
};
