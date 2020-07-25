'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const getFolderSize = require('../utils/getFolderSize');
const getAssetSize = require('../utils/getAssetSize');
const filesize = require('filesize');
const walkSync = require('walk-sync');
const zlib = require('zlib');

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

  const searchPrompt = blessed.prompt({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line'
  });


  const table =  grid.set(0, 0, 6, 12, contrib.table, 
    { keys: true
      ,  vi: true
      , fg: 'green'
      , label: 'dist/assets/'
      , columnWidth: [80, 10, 10],
    search:  function(callback) {
      searchPrompt.input('Search Component:', '', function(err, value) {
        if (err) return;
        return callback(null, value);
      });
    }
    })

  const assetsFolder = `${root}/dist/assets`;
  let data = [[]];

  if(fs.existsSync(assetsFolder)) {
    data = walkSync(assetsFolder, {
      directories: false,
      includeBasePath: true,
      globs: ['**/*.js','**/*.css','**/*.png','**/*.jpg','**/*.svg','**/*.json']
    }).map(f => {
      let contentsBuffer = fs.readFileSync(f);

      const gzipSize = zlib.gzipSync(contentsBuffer).length;

      return [f.replace(`${assetsFolder}/`,''), filesize(contentsBuffer.length),filesize(gzipSize)];
    });
  }

  //set default table
  table.setData({headers: ['Name','File Size','gzip'], data})

  const barChart = grid.set(6,0,6,6, contrib.bar, { 
    label: 'Build Assets: (dist/assets) File Size (KB)'
    , barWidth: 10
    , barSpacing: 10
    , xOffset: 0
    , maxHeight: 9});

  const donutChart = grid.set(6,6,6,6, contrib.donut, {
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

  if(fs.existsSync(`${root}/dist/assets`)) {
    const assetSize = getFolderSize(`${root}/dist/assets`);
    barChart.setLabel('Build Assets: (dist/assets) File Size (KB): ' + Math.round(assetSize/1024) );

    const jsSize = getAssetSize(`${root}/dist/assets`, ['*.js']);
    const cssSize = getAssetSize(`${root}/dist/assets`,['*.css']);
    const imgSize = getAssetSize(`${root}/dist/assets`, ['**/*.png', '**/*.jpg', '**/*.svg']);
    const jsonSize = getAssetSize(`${root}/dist/assets`, ['**/*.json']);

    const donutData = [];
    donutData.push({ label: 'JS', percent: Math.round(( jsSize / assetSize ) * 100) });
    donutData.push({ label: 'CSS', percent: Math.round(( cssSize / assetSize ) * 100) });
    donutData.push({ label: 'Images', percent: Math.round(( imgSize / assetSize ) * 100) });
    donutData.push({ label: 'JSON', percent: Math.round(( jsonSize / assetSize ) * 100) });

    const percent = donutData.map((v,index) => {
      return {
        percent: v.percent,
        label: v.label,
        color: index
      };
    });

    const kbSizes = [jsSize, cssSize, imgSize, jsonSize].map(s => Math.round(s/1024));

    barChart.setData({ titles, data: kbSizes});
    donutChart.setData(percent);
    screen.append(prompt);
    screen.append(searchPrompt);
    screen.render();
  } else {
    const message = `Looks like you didn't build your Ember project yet.
    Please run 'ember build' and check again.
    Press any key to dismiss this message.`;
    prompt.display(message, 0, function(err, value) {
      if (err) return;
      //return callback(null, value);
      return;
    });
  }

  table.focus();


}

