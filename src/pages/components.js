'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const voca = require('voca');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');
const getServiceDeps = require('../utils/getServiceDeps');
const checkOctane = require('../utils/isOctane');
const log = require('../utils/log');

module.exports = function (screen) {
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
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search: function (callback) {
      prompt.input('Search Component:', '', function (err, value) {
        if (err) return;
        return callback(null, value);
      });
    },
  });

  const folder = path.resolve(`${root}/app/components`);
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
    let s = f.replace(`${root}/app/components/`, '');
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
    const js = isOctane
      ? `${root}/app/components/${content}${ext}`
      : pods
      ? `${root}/app/components/${content}/component${ext}`
      : `${root}/app/components/${content}${ext}`;
    const hbs = isOctane
      ? `${root}/app/templates/components/${content}.hbs`
      : pods
      ? `${root}/app/components/${content}/template.hbs`
      : `${root}/app/templates/components/${content}.hbs`;
    const jsStat = fs.existsSync(js) && fs.readFileSync(js, 'utf-8');
    const hbsStat = fs.existsSync(hbs) && fs.readFileSync(hbs, 'utf-8');
    if (jsStat) {
      let _content = `Full Path: ${js}`;
      _content += `\nSize: ${filesize(jsStat.length)}`;
      _content += `\nLOC: ${jsStat.split('\n').length - 1}`;
      component.setContent(_content);
    }
    if (hbsStat) {
      let _content = `Full Path: ${hbs}\n`;
      _content += `Size: ${filesize(hbsStat.length)}`;
      _content += `\nLOC: ${hbsStat.split('\n').length - 1}`;
      template.setContent(_content);
    }

    // Find component name in all template files
    const componentName = isOctane
      ? content.split('-').map(voca.capitalize).join('')
      : content;
    const findCommand = isOctane
      ? `find ${root}/app -name "*.hbs" | xargs grep -l "<${componentName}"`
      : `find ${root}/app -name "*.hbs" | xargs grep -l "[{{{#]${componentName}"`;

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
      })
      .catch((err) => {
        log(err);
        usedInComponents.setItems(['Some error occured.']);
        usedInRoutes.setItems(['Some error occured.']);
        usedInComponents.setLabel(`Used in components`);
        usedInRoutes.setLabel(`Used in routes`);
        screen.render();
      });
  });

  leftCol.focus();

  screen.append(prompt);
  screen.render();
};
