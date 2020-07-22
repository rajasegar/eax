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

const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
  label: 'Menu', 
  keys: true, 
  vi: true,
  style: { fg: 'yellow', bg: 'black' }
});
leftCol.setItems(menu);

const right = grid.set(0, 3, 12, 9, contrib.table, {
  label: 'Items', 
  keys: true, 
  vi: true,
  style: { fg: 'yellow', bg: 'black'},
  columnWidth: [70, 10]
});

//set default table
right.setData({headers: ['Name', 'Size'], data: [[]]});


leftCol.on('select', function(node) {
  const { content } = node;
  const name = content.slice(0,1).toLowerCase() + content.slice(1);
  right.setLabel(`${content}: app/${name}`);
  const folder = path.resolve(`${root}/app/${name}`);
  let items = walkSync(folder, { 
    directories: false,
    includeBasePath: true,
    ignore: ['.*']
  }).map(f => {
    const stat = fs.statSync(f);
    return [f.replace(root,''), stat.size];

  });

  const fileSizeSort = R.sortWith([
    R.descend(R.prop(1))
  ]);

  items = fileSizeSort(items).map(i => {
    const [ fileName , size ] = i;

    return [fileName.replace(`/app/${name}/`,''), filesize(size)];
  });

  right.setData({headers: ['Name', 'Size'], data: items});
  screen.render();

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
