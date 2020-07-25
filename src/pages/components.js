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
const semver = require('semver');
const voca = require('voca');
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');

module.exports = function(screen) {

  const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

  const _root = process.argv[2] || ".";
  const root = path.resolve(_root);

  const packageManifest = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf-8'));
  const emberCli = packageManifest.devDependencies['ember-cli'];
  const isOctane = semver.gte(semver.coerce(emberCli), semver.valid('3.15.0'));

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line'
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Components', 
    keys: true, 
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search:  function(callback) {
      prompt.input('Search Component:', '', function(err, value) {
        if (err) return;
        return callback(null, value);
      });
    }
  });

  const folder = path.resolve(`${root}/app/components`);
  let _items = walkSync(folder, { 
    directories: false,
    includeBasePath: true,
    globs: ['**/*/component.js'],
    ignore: ['.gitkeep', 'template.hbs', 'style.scss']
  })

  const pods = _items.length > 0;

  if(!pods) { // No pods style

_items = walkSync(folder, { 
    directories: false,
    includeBasePath: true,
    globs: ['**/*.js'],
    ignore: ['.gitkeep']
  })
  }

  const items = _items.map(f => {
    let s =  f.replace(`${root}/app/components/`,'');
    s = pods ? s.replace('/component.js','') : s.replace('.js','');
    return s;
  });


  leftCol.setItems(items);
  leftCol.setLabel(`Components: (${items.length})`);

  const template = grid.set(0, 3, 2, 2, blessed.box, {
    label: 'template.hbs', 
  });

  const component = grid.set(0, 7, 2, 2, blessed.box, {
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

  const services = grid.set(2, 7, 2, 2, blessed.box, {
    label: 'Services', 
  });

  const helpers = grid.set(2, 9, 2, 2, blessed.box, {
    label: 'Helpers', 
  });
  const utils = grid.set(2, 3, 2, 2, blessed.list, {
    label: 'Utils', 
  });
  leftCol.on('select', function(node) {
    //console.log(node);
    const { content } = node;
    const js = pods ? `${root}/app/components/${content}/component.js` : `${root}/app/components/${content}.js`;
    const hbs = pods ? `${root}/app/components/${content}/template.hbs` : `${root}/app/templates/components/${content}.hbs`;
    const jsStat = fs.existsSync(js) && fs.statSync(js);
    const hbsStat = fs.existsSync(hbs) && fs.statSync(hbs);
    if(jsStat) {
      component.setContent(`Size: ${filesize(jsStat.size)}`);
    }
    if(hbsStat) {
      template.setContent(`Size: ${filesize(hbsStat.size)}`);
    }

    // Find component name in all template files
    const componentName = isOctane ? content.split('-').map(voca.capitalize).join('') : content;
    const findCommand = isOctane
      ? `find ${root}/app -name "*.hbs" | xargs grep -l "<${componentName}"`
      : `find ${root}/app -name "*.hbs" | xargs grep -l "[{{{#]${componentName}"`;

    exec(findCommand).then(data => {
      let fileNames = data.stdout.split('\n').map(line => {
        return line.replace(root, '');
      });

      fileNames = fileNames.filter(Boolean); // remove empty entries

      const componentList = fileNames
        .filter(f =>  { 
          return pods ? f.includes('app/components') : f.includes('app/templates/components');
        })
        .map(f => { 
          return pods ?
          f.replace('/app/components/','').replace('/template.hbs','')
            : f.replace('/app/templates/components/','')
        });

      const routeList = fileNames
        .filter(f => !f.includes('app/components'))
        .map(f => f.replace('/app/templates/',''));

      usedInComponents.setItems(componentList);
      usedInComponents.setLabel(`Used in ${componentList.length} components`);
      usedInRoutes.setItems(routeList);
      usedInRoutes.setLabel(`Used in ${routeList.length} routes`);

      getUtilDeps(js).then(data => {
        utils.setItems(data);
        utils.setLabel(`Utils (${data.length})`);
        screen.render();
      });


      getMixinDeps(js).then(data => {
        mixins.setItems(data);
        mixins.setLabel(`Mixins (${data.length})`);
        screen.render();
      });

    }).catch(err => {
      // TODO: Log these errors
      //console.log(err);
      usedInComponents.setItems(['Some error occured.']);
      usedInRoutes.setItems(['Some error occured.']);
      usedInComponents.setLabel(`Used in components`);
      usedInRoutes.setLabel(`Used in routes`);
      screen.render();
    });

  });

  leftCol.focus();

  screen.append(prompt);
  screen.render()
};