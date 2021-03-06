'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const voca = require('voca');
const getFileInfo = require('../utils/getFileInfo');
const showFileInfo = require('../utils/showFileInfo');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const getServiceDeps = require('../utils/getServiceDeps');
const highlight = require('../utils/highlight');
const log = require('../utils/log');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/services';

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
    label: 'Services',
    search: function (callback) {
      prompt.input('Search Service:', '', function (err, value) {
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
    leftCol.setLabel(`Services: (${items.length})`);

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

    const usedIn = grid.set(4, 3, 8, 4, blessed.list, {
      label: 'Used in:',
      keys: true,
      vi: true,
      style: { fg: 'yellow', selected: { bg: 'white', fg: 'black' } },
    });

    const fileContents = grid.set(4, 7, 8, 5, blessed.box, {
      label: 'Contents:',
    });

    leftCol.on('select', function (node) {
      //console.log(node);
      const { content } = node;
      const js = `${root}/${namespace}/${content}`;
      const _fileInfo = getFileInfo(js);
      fileInfo.setContent(showFileInfo(_fileInfo));
      fileContents.setContent(highlight(_fileInfo.content));

      // Find service name in all js files
      const serviceName = voca.camelCase(content.replace('.js', ''));
      exec(
        `find ${root}/app -name "*.js" | xargs grep -l "${serviceName}: service()"`
      )
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
  }
};
