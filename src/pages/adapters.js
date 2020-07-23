'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const filesize = require('filesize');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = function(screen) {

  const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

  const _root = process.argv[2] || ".";
  const root = path.resolve(_root);
  const namespace = 'app/adapters';

  function search(err,value) {
    return value;
  };

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Adapters', 
    keys: true, 
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search
  });

  const folder = path.resolve(`${root}/${namespace}`);
  let items = walkSync(folder, { 
    directories: false,
    includeBasePath: true,
    globs: ['**/*.js'],
    ignore: ['.gitkeep']
  }).map(f => {
    let s =  f.replace(`${root}/${namespace}/`,'');
    return s;
  });

  leftCol.setItems(items);
  leftCol.setLabel(`Adapters: (${items.length})`);


  const component = grid.set(0, 7, 2, 2, blessed.box, {
    label: 'File info:', 
  });



  const mixins = grid.set(2, 5, 2, 2, blessed.box, {
    label: 'Mixins', 
  });

  const services = grid.set(2, 7, 2, 2, blessed.box, {
    label: 'Services', 
  });

  const utils = grid.set(2, 3, 2, 2, blessed.box, {
    label: 'Utils', 
  });

  leftCol.on('select', function(node) {
    //console.log(node);
    const { content } = node;
    const js = `${root}/${namespace}/${content}`;
    const jsStat = fs.existsSync(js) && fs.statSync(js);
    if(jsStat) {
      component.setContent(`Size: ${filesize(jsStat.size)}`);
    }

    screen.render();

  });

  leftCol.focus();

  screen.render()
};
