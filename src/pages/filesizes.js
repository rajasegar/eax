'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const filesize = require('filesize');

module.exports = function(screen) {

  const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

  const _root = process.argv[2] || ".";
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
    'Validators'
  ];

  const leftCol = grid.set(0, 0, 12, 2, blessed.list, {
    label: 'Menu', 
    keys: true, 
    vi: true,
    style: { fg: 'yellow'  }
  });
  leftCol.setItems(menu);

  const right = grid.set(0, 2, 12, 10, contrib.table, {
    label: 'Items', 
    keys: true, 
    vi: true,
    style: { fg: 'yellow'},
    columnWidth: [80, 10, 10]
  });

  //set default table
  right.setData({headers: ['Name', 'Size', 'LOC'], data: [[]]});


  leftCol.on('select', function(node) {
    const { content } = node;
    const name = content.slice(0,1).toLowerCase() + content.slice(1);
    right.setLabel(`${content}: app/${name}`);
    const folder = path.resolve(`${root}/app/${name}`);
    if(fs.existsSync(folder)) {
      let items = walkSync(folder, { 
        directories: false,
        includeBasePath: true,
        ignore: ['.*']
      });

      items = items.map(f => {
        const stat = fs.readFileSync(f, 'utf-8');
        return [f.replace(root,''), stat.length, stat.split('\n').length - 1];
      });

      const fileSizeSort = R.sortWith([
        R.descend(R.prop(1))
      ]);

      items = fileSizeSort(items).map(i => {
        const [ fileName , size, loc ] = i;
        return [fileName.replace(`/app/${name}/`,''), filesize(size), loc];
      });

      right.setData({headers: ['Name', 'Size', 'LOC'], data: items});
      screen.render();
    } else {
      right.setData({headers: ['Name', 'Size', 'LOC'], data: [[]]});
      screen.render();
    }
  });


  leftCol.focus();

  screen.key(['tab'], function(ch, key) {
    if(screen.focused === leftCol)
      right.focus();
    else
      leftCol.focus();
  });

  screen.render()
};
