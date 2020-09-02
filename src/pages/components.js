'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const voca = require('voca');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const getServiceDeps = require('../utils/getServiceDeps');
const checkOctane = require('../utils/isOctane');
const log = require('../utils/log');
const getFileInfo = require('../utils/getFileInfo');
const showFileInfo = require('../utils/showFileInfo');

module.exports = function (screen, currPage, selected) {
  const ERROR_MESSAGE =
    'Some error occured. Please check eax.log for more details.';

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);

  const isOctane = checkOctane();

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Components',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'white', fg: 'black' } },
    search: function (callback) {
      prompt.input('Search Component:', '', function (err, value) {
        if (err) return;
        return callback(null, value);
      });
    },
  });

  const folder = `${root}/app/components/`;
  let _items = walkSync(folder, {
    directories: false,
    includeBasePath: true,
    globs: ['**/*/component.js', '**/*/component.ts'],
    ignore: ['.gitkeep', 'template.hbs', 'style.scss'],
  });

  const pods = _items.length > 0;

  if (!pods) {
    // No pods style
    _items = walkSync(folder, {
      directories: false,
      includeBasePath: true,
      globs: ['**/*.js', '**/*.ts'],
      ignore: ['.gitkeep'],
    });
  }

  let isTypeScriptProject = false;

  const items = _items.map((f) => {
    let s = f.replace(folder, '');
    isTypeScriptProject = s.includes('.ts');
    if (isTypeScriptProject) {
      s = pods ? s.replace('/component.ts', '') : s.replace('.ts', '');
    } else {
      s = pods ? s.replace('/component.js', '') : s.replace('.js', '');
    }
    return s;
  });

  leftCol.setItems(items);
  leftCol.setLabel(`Components: (${items.length})`);

  // select list item
  if (selected) {
    selected = selected.replace('/component.js', '');
    leftCol.select(leftCol.getItemIndex(selected));
  }

  const template = grid.set(0, 3, 2, 4, blessed.box, {
    label: 'template.hbs',
  });

  const component = grid.set(0, 7, 2, 4, blessed.box, {
    label: 'component.js',
  });

  const usedInRoutes = grid.set(4, 3, 8, 4, blessed.list, {
    label: 'Used in Routes',
  });
  const usedInComponents = grid.set(4, 7, 8, 4, blessed.list, {
    label: 'Used in Components',
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
  leftCol.on('select', function (node) {
    //console.log(node);
    const { content } = node;
    const ext = isTypeScriptProject ? '.ts' : '.js';
    let js;
    if (isOctane) {
      if (pods) {
        js = `${root}/app/components/${content}/component${ext}`;
      } else {
        js = `${root}/app/components/${content}${ext}`;
      }
    } else {
      if (pods) {
        js = `${root}/app/components/${content}/component${ext}`;
      } else {
        js = `${root}/app/components/${content}${ext}`;
      }
    }

    let hbs;

    if (isOctane) {
      if (pods) {
        hbs = `${root}/app/components/${content}/template.hbs`;
      } else {
        hbs = `${root}/app/components/${content}.hbs`;
      }
    } else {
      if (pods) {
        hbs = `${root}/app/components/${content}/template.hbs`;
      } else {
        hbs = `${root}/app/templates/components/${content}.hbs`;
      }
    }

    component.setContent(showFileInfo(getFileInfo(js)));
    template.setContent(showFileInfo(getFileInfo(hbs)));

    // Find component name in all template files
    const componentName = isOctane
      ? content.split('-').map(voca.capitalize).join('')
      : content;
    const findCommand = isOctane
      ? `find ${root}/app -name "*.hbs" | xargs grep -l "<${componentName}"`
      : `find ${root}/app -name "*.hbs" | xargs grep -l "[{{{# ]${componentName}"`;

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

    exec(findCommand)
      .then((data) => {
        let fileNames = data.stdout.split('\n').map((line) => {
          return line.replace(root, '');
        });

        fileNames = fileNames.filter(Boolean); // remove empty entries

        const componentList = fileNames
          .filter((f) => {
            return pods
              ? f.includes('app/components')
              : f.includes('app/templates/components');
          })
          .map((f) => {
            return pods
              ? f.replace('/app/components/', '').replace('/template.hbs', '')
              : f.replace('/app/templates/components/', '');
          });

        const routeList = fileNames
          .filter((f) => !f.includes('app/components'))
          .map((f) => f.replace('/app/templates/', ''));

        usedInComponents.setItems(componentList);
        usedInComponents.setLabel(`Used in ${componentList.length} components`);
        usedInRoutes.setItems(routeList);
        usedInRoutes.setLabel(`Used in ${routeList.length} routes`);
      })
      .catch((err) => {
        log(err);
        usedInComponents.setItems([ERROR_MESSAGE]);
        usedInRoutes.setItems([ERROR_MESSAGE]);
        usedInComponents.setLabel(`Used in components`);
        usedInRoutes.setLabel(`Used in routes`);
        screen.render();
      });
  });

  leftCol.focus();

  screen.append(prompt);
  screen.render();
};
