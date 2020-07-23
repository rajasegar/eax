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

  const template = grid.set(0, 3, 2, 2, blessed.box, {
    label: 'template.hbs', 
  });

  const component = grid.set(0, 7, 2, 2, blessed.box, {
    label: 'route.js', 
  });

  const usedInComponents = grid.set(4, 3, 8, 9, blessed.list, {
    label: 'Components used:', 
  });


  const mixins = grid.set(2, 5, 2, 2, blessed.box, {
    label: 'Mixins', 
  });

  const services = grid.set(2, 7, 2, 2, blessed.box, {
    label: 'Services', 
  });

  const helpers = grid.set(2, 9, 2, 2, blessed.box, {
    label: 'Helpers', 
  });

  const utils = grid.set(2, 3, 2, 2, blessed.box, {
    label: 'Utils', 
  });

  leftCol.on('select', function(node) {
    //console.log(node);
    const { content } = node;
    const js = `${root}/app/routes/${content}`;
    const templateName = content.replace('.js','.hbs');
    const hbs = `${root}/app/templates/${templateName}`;
    const jsStat = fs.existsSync(js) && fs.statSync(js);
    const hbsStat = fs.existsSync(hbs) && fs.statSync(hbs);
    if(jsStat) {
      component.setContent(`Size: ${filesize(jsStat.size)}`);
    }
    if(hbsStat) {
      template.setContent(`Size: ${filesize(hbsStat.size)}`);
    }

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
