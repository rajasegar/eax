'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const log = require('../utils/log');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/utils';

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'white', fg: 'black' } },
    label: 'Utils',
    search: function (callback) {
      prompt.input('Search Util:', '', function (err, value) {
        if (err) return;
        return callback(null, value);
      });
    },
  });

  const folder = path.resolve(`${root}/${namespace}`);
  if (fs.existsSync(folder)) {
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
    leftCol.setLabel(`Utils: (${items.length})`);

    const component = grid.set(0, 3, 2, 9, blessed.box, {
      label: 'File info:',
    });

    const usedIn = grid.set(4, 3, 8, 9, blessed.list, {
      label: 'Used in:',
      keys: true,
      vi: true,
      style: { fg: 'yellow', selected: { bg: 'white', fg: 'black' } },
    });

    const mixins = grid.set(2, 3, 2, 4, blessed.list, {
      label: 'Mixins',
    });

    const utils = grid.set(2, 7, 2, 5, blessed.list, {
      label: 'Utils',
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

      // Find util name in all js files
      const utilName = content.replace('.js', '');
      exec(`find ${root}/app -name "*.js" | xargs grep -l "utils/${utilName}"`)
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
          usedIn.setItems([
            'Some error occured. Please check eax.log for more details.',
          ]);
          usedIn.setLabel(`Used in :`);
          screen.render();
        });

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
      screen.render();
    });

    leftCol.focus();

    screen.append(prompt);
    screen.render();
  }
};
