'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');


module.exports = function(screen) {

  const _root = process.argv[2] || ".";
  const root = path.resolve(_root);
  const packageManifest = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf-8'));

  const folders = [
    'adapters',
    'components',
    //'constants',
    'controllers',
    'helpers',
    'initializers',
    'mixins',
    'models',
    'routes',
    'services',
    //'storages',
    'styles',
    'templates',
    //'transforms',
    'utils',
    //'validators'
  ];

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const gitRepo = (typeof packageManifest.repository === 'string') ? packageManifest.repository : packageManifest.repository.url;

  let pacman = 'npm';
  if(fs.existsSync(`${root}/yarn.lock`)) pacman = 'yarn';
  if(fs.existsSync(`${root}/pnpm-lock.yaml`)) pacman = 'pnpm';

  const projDetails = [];

  projDetails.push(['ember-cli', packageManifest.devDependencies['ember-cli']]);
  projDetails.push(['devDependencies', Object.keys(packageManifest.devDependencies).length]);
  projDetails.push(['dependencies', packageManifest.dependencies && Object.keys(packageManifest.dependencies).length || 0]);
  projDetails.push(['node version', packageManifest.engines.node]);
  projDetails.push(['Package manager', pacman]);
  projDetails.push(['Github', gitRepo]);


  exec(`du -sh -I node_modules ${root}`).then(data => {
    const appSize = data.stdout.split('\t')[0];
    projDetails.push(['Project size',appSize]);
  projWidget.setData({headers: ['', ''], data: projDetails});
    screen.render();
  });

  exec(`du -sh ${root}/app`).then(data => {
    const appSize = data.stdout.split('\t')[0];
    projDetails.push(['app/ size',appSize]);
  projWidget.setData({headers: ['', ''], data: projDetails});
    screen.render();
  });
  
  const projWidget = grid.set(0, 0, 6, 4, contrib.table, {
    label: packageManifest.name,
    selectedBg: 'black',
    columnWidth: [15, 50],
    columnSpacing: 3
  });

  //set default table
  projWidget.setData({headers: ['', ''], data: projDetails});



  const topRow = grid.set(0,4,6,8, contrib.bar, { label: 'Total File Size (KB)'
    , barWidth: 4
    , barSpacing: 5
    , xOffset: 0
    , maxHeight: 9});

  const bottomRow = grid.set(6,0,6,12, contrib.donut, {
    label: 'Size composition of app/ folder',
    radius: 8,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
    data: []
  });


  const data = [];

  exec(`du -sk ${root}/app`).then(appData => {

    const appSize = appData.stdout.split('\t')[0];

    const temp = folders.map(f => {
      return exec(`du -sk ${root}/app/${f}`);
    });

    Promise.all(temp).then(values => {
      const data = values.map(v => {
        const[size, name] =  v.stdout.split('\t');
        return size;
      });

      const percent = values.map((v,index) => {
        const[size, name] =  v.stdout.split('\t');
        let _label = name.replace(root, '')
          .replace('/app/','')
          .replace('\n','');

        let _percent = Math.round(( size / appSize ) * 100);

        // This is a bug in Donut widget
        if(_percent === 1) _percent = 0.01;

        return {
          percent: _percent,
          label: _label,
          color: index
        };
      });

      const titles = values.map(v => {
        const[size, name] =  v.stdout.split('\t');
        return name.replace(root, '')
          .replace('/app/','')
          .replace('\n','');
      });


      topRow.setData( { titles, data})
      bottomRow.setData(percent);
      screen.render();

    });
  });


}

