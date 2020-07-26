'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require('../utils/log');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/helpers';

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Helpers',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search: function (callback) {
      prompt.input('Search Helper:', '', function (err, value) {
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
  leftCol.setLabel(`Helpers: (${items.length})`);

  const component = grid.set(0, 3, 2, 9, blessed.box, {
    label: 'File info:',
  });

  const usedIn = grid.set(4, 3, 8, 9, blessed.list, {
    label: 'Used in:',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
  });

  leftCol.on('select', function (node) {
    //console.log(node);
    const { content } = node;
    const js = `${root}/${namespace}/${content}`;
    const jsStat = fs.existsSync(js) && fs.statSync(js);
    if (jsStat) {
      component.setContent(`Size: ${filesize(jsStat.size)}\nFull Path: ${js}
      `);
    }
    // Find helper name in all hbs files
    const helperName = content.replace('.js', '');
    exec(`find ${root}/app -name "*.hbs" | xargs grep -l "{{${helperName}"`)
      .then((data) => {
        let fileNames = data.stdout.split('\n').map((line) => {
          return line.replace(root, '');
        });

        fileNames = fileNames.filter(Boolean); // remove empty entries

        const fileList = fileNames.map((f) => f.replace('/app/', ''));

        usedIn.setItems(fileList);
        usedIn.setLabel(`Used in ${fileList.length} files`);
        screen.render();
      })
      .catch((err) => {
        log(err);
        usedIn.setItems(['Some error occured.']);
        usedIn.setLabel(`Used in :`);
        screen.render();
      });

    screen.render();
  });

  leftCol.focus();

  screen.append(prompt);
  screen.render();
};
