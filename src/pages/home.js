'use strict';

const contrib = require('blessed-contrib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

module.exports = function(screen) {

const _root = process.argv[2] || ".";
const root = path.resolve(_root);
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

  const topRow = grid.set(0,0,6,12, contrib.bar, { label: 'Total File Size (KB)'
      , barWidth: 4
      , barSpacing: 10
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

      let _percent = Math.ceil(( size / appSize ) * 100);

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

