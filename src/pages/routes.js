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
const getUtilDeps = require('../utils/getUtilDeps');
const getMixinDeps = require('../utils/getMixinDeps');

module.exports = function(screen) {

  const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

  const _root = process.argv[2] || ".";
  const root = path.resolve(_root);

  const prompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line'
  });

  const leftCol = grid.set(0, 0, 12, 3, blessed.list, {
    label: 'Routes', 
    keys: true, 
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'blue' } },
    search:  function(callback) {
      prompt.input('Search Route:', '', function(err, value) {
        if (err) return;
        return callback(null, value);
      });
    }
  });

  const folder = path.resolve(`${root}/app/routes`);
  let items = walkSync(folder, { 
    directories: false,
    includeBasePath: true,
    globs: ['**/*.js'],
    ignore: ['.gitkeep']
  }).map(f => {
    let s =  f.replace(`${root}/app/routes/`,'');
    return s;
  });

  leftCol.setItems(items);
  leftCol.setLabel(`Routes: (${items.length})`);

  const template = grid.set(0, 3, 2, 4, blessed.box, {
    label: 'template.hbs', 
  });

  const component = grid.set(0, 7, 2, 4, blessed.box, {
    label: 'route.js', 
  });

  const usedInComponents = grid.set(4, 3, 8, 9, blessed.list, {
    label: 'Components used:', 
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
    const js = `${root}/app/routes/${content}`;
    const templateName = content.replace('.js','.hbs');
    const hbs = `${root}/app/templates/${templateName}`;
    const jsStat = fs.existsSync(js) && fs.readFileSync(js,'utf-8');
    const hbsStat = fs.existsSync(hbs) && fs.readFileSync(hbs,'utf-8');
    if(jsStat) {
      let _content = `Full path: ${js}`;
      _content += `\nSize: ${filesize(jsStat.length)}`;
      _content += `\nLOC: ${jsStat.split('\n').length - 1}`;
      component.setContent(_content);
    }
    if(hbsStat) {
      let _content = `Full path: ${hbs}`;
      _content += `\nSize: ${filesize(hbsStat.length)}`;
      _content += `\nLOC: ${hbsStat.split('\n').length - 1}`;
      template.setContent(_content);
    }

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

    screen.render();

    /*
      // Find component name in all template files
    exec(`find ${root}/app -name "*.hbs" | xargs grep "[{{{#]${content}"`).then(data => {
      let fileNames = data.stdout.split('\n').map(line => {
        const [fileName, pattern] = line.split(':');
        return fileName.replace(root, '');
      });

      fileNames = fileNames.filter(Boolean); // remove empty entries

      const componentList = fileNames
        .filter(f => f.includes('app/components'))
        .map(f => f.replace('/app/components/','').replace('/template.hbs',''));
      const routeList = fileNames
        .filter(f => !f.includes('app/components'))
        .map(f => f.replace('/app/templates/',''));

      usedInComponents.setItems(componentList);
      usedInComponents.setLabel(`Used in ${componentList.length} components`);
      screen.render();
    }).catch(err => {
      // TODO: Log these errors
      //console.log(err);
      usedInComponents.setItems(['Some error occured.']);
      usedInComponents.setLabel(`Used in components`);
      screen.render();
    });
    */

    });

  leftCol.focus();

  screen.append(prompt);
  screen.render()
};
