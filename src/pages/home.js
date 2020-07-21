//const blessed = require('blessed');
const contrib = require('blessed-contrib');
/*
const screen = blessed.screen();
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const filesize = require('filesize');

const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

const root = '/Users/rajasegarchandran/Code/freshsales/frontend';

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

const right = grid.set(0, 3, 12, 10, contrib.table, {
  label: 'Page', 
  keys: true, 
  vi: true,
  style: { fg: 'yellow', bg: 'black'},
  columnWidth: [100, 10]
});

//set default table
right.setData({headers: ['Name', 'Size'], data: [[]]});


leftCol.on('select', function(node) {
  //console.log(node);
  const { content } = node;
  const name = content.slice(0,1).toLowerCase() + content.slice(1);
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
    const [ name , size ] = i;
    return [name, filesize(size)];
  });

  right.setData({headers: ['Name', 'Size'], data: items});
  screen.render();

});
*/

module.exports = function(screen) {
   const line = contrib.line(
         { style:
           { line: "yellow"
           , text: "green"
           , baseline: "black"}
         , xLabelPadding: 3
         , xPadding: 5
         , label: 'Title'});
     const data = {
         x: ['t1', 't2', 't3', 't4'],
         y: [5, 1, 7, 5]
      };
  screen.append(line);
  line.setData([data]);
}

