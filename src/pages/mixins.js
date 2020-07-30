'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const path = require('path');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const getServiceDeps = require('../utils/getServiceDeps');
const getFileInfo = require('../utils/getFileInfo');
const showFileInfo = require('../utils/showFileInfo');
const log = require('../utils/log');
const highlight = require('../utils/highlight');
const sortFilesBySize = require('../utils/sortFilesBySize');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const namespace = 'app/mixins';

  const searchPrompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Mixins',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search: function (callback) {
      searchPrompt.input('Search Mixin:', '', function (err, value) {
        if (err) return;
        return callback(null, value);
      });
    },
  });

  const folder = path.resolve(`${root}/${namespace}`);
  if (fs.existsSync(folder)) {
    let items = sortFilesBySize(namespace);

    leftCol.setItems(items);
    leftCol.setLabel(`Mixins: (${items.length})`);

    const component = grid.set(0, 3, 2, 9, blessed.box, {
      label: 'File info:',
    });

    const usedIn = grid.set(4, 3, 8, 4, blessed.list, {
      label: 'Used in:',
      keys: true,
      vi: true,
      style: { fg: 'yellow', selected: { bg: 'blue' } },
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

    const fileContent = grid.set(4, 7, 8, 5, blessed.box, {
      label: 'Contents',
    });

    leftCol.on('select', function (node) {
      //console.log(node);
      const { content } = node;
      const js = `${root}/${namespace}/${content}`;
      const _fileInfo = getFileInfo(js);
      component.setContent(showFileInfo(_fileInfo));
      const highlightedCode = highlight(_fileInfo.content, 'javascript');

      fileContent.setContent(highlightedCode);

      // Find mixin name in all js files
      const mixinName = content.replace('.js', '');
      exec(
        `find ${root}/app -name "*.js" | xargs grep -l "mixins/${mixinName}"`
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

    screen.append(searchPrompt);

    screen.render();
  }
};
