'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

module.exports = function(screen) {

  const _root = process.argv[2] || ".";
  const root = path.resolve(_root);
  const titles = [
    'JS',
    'CSS',
    'Images',
    'JSON'
  ];

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const topRow = grid.set(0,0,6,12, contrib.bar, { label: 'Build Assets: (dist/assets) File Size (KB)'
    , barWidth: 10
    , barSpacing: 10
    , xOffset: 0
    , maxHeight: 9});

  const bottomRow = grid.set(6,0,6,12, contrib.donut, {
    label: 'Size composition of dist/assets/ folder',
    radius: 16,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
    data: []
  });


  const prompt = blessed.message({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
    hidden: true,
    style: {
      fg: 'black',
      bg: 'yellow',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
  });

  const data = [];

  exec(`du -ck ${root}/dist/assets`).then(appData => {

    const _a = appData.stdout.split('\n')
    const appSize = _a[_a.length - 2].split('\t')[0];

    const jsSize = exec(`find ${root}/dist/assets -name "*.js" | xargs du -ck `);
    const cssSize = exec(`find ${root}/dist/assets -name "*.css" | xargs du -ck `);
    const imgSize = exec(`find ${root}/dist/assets -type f \\( -name  "*.jpg" -o -name "*.png" -o -name "*.svg" \\) | xargs du -ck `);
    const jsonSize = exec(`find ${root}/dist/assets -name "*.json" | xargs du -ck `);


    Promise.all([jsSize, cssSize, imgSize, jsonSize]).then(values => {
      //console.log(values);

      let temp = values[0].stdout.split('\n');
      const _js = temp[temp.length - 2].split('\t')[0];
      temp = values[1].stdout.split('\n');
      const _css = temp[temp.length - 2].split('\t')[0];
      temp = values[2].stdout.split('\n');
      const _img = temp[temp.length - 2].split('\t')[0];
      temp = values[3].stdout.split('\n');
      const _json = temp[temp.length - 2].split('\t')[0];
      const donutData = [];
      donutData.push({ label: 'JS', percent: Math.round(( _js / appSize ) * 100) });
      donutData.push({ label: 'CSS', percent: Math.round(( _css / appSize ) * 100) });
      donutData.push({ label: 'Images', percent: Math.round(( _img / appSize ) * 100) });
      donutData.push({ label: 'JSON', percent: Math.round(( _json / appSize ) * 100) });

      const percent = donutData.map((v,index) => {

        return {
          percent: v.percent,
          label: v.label,
          color: index
        };
      });

      topRow.setData({ titles, data: [_js, _css, _img, _json]});
      bottomRow.setData(percent);
      screen.append(prompt);
      screen.render();

    });
  }).catch(err => {
    
    const message = `Looks like you didn't build your Ember project yet.
    Please run 'ember build' and check again.
    Press any key to dismiss this message.`;
    prompt.display(message, 0, function(err, value) {
        if (err) return;
        //return callback(null, value);
        return;
      });
  });


}

