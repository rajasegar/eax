'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');
const R = require('ramda');
const getFolderSize = require('../utils/getFolderSize');
const getAssetSize = require('../utils/getAssetSize');
const filesize = require('filesize');
const CompressionStats = require('compression-stats-cli');

module.exports = function (screen) {
  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);

  const assetTypes = [
    { name: 'JS', globs: ['**/*.js'] },
    { name: 'CSS', globs: ['**/*.css'] },
    { name: 'Images', globs: ['**/*.png', '**/*.jpg', '**/*.svg'] },
    { name: 'JSON', globs: ['**/*.json'] },
  ];

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const loadingWidget = blessed.loading({
    parent: screen,
    top: 'center',
    left: 'center',
    height: 'shrink',
    width: 'shrink',
    border: 'line',
    hidden: true,
  });

  const assetTypeList = grid.set(0, 0, 6, 2, blessed.list, {
    label: 'Asset Type',
    keys: true,
    vi: true,
    style: { fg: 'yellow', selected: { bg: 'green', fg: 'black' } },
  });
  assetTypeList.setItems(assetTypes.map((a) => a.name));

  const table = grid.set(0, 2, 6, 10, contrib.table, {
    keys: true,
    vi: true,
    fg: 'green',
    label: 'dist/assets/',
    columnWidth: [50, 10, 10, 10],
  });

  const assetsFolder = `${root}/dist/assets`;
  let data = [[]];

  const barChart = grid.set(6, 0, 6, 6, contrib.bar, {
    label: 'Build Assets: (dist/assets) File Size (KB)',
    barWidth: 10,
    barSpacing: 10,
    xOffset: 0,
    maxHeight: 9,
  });

  const donutChart = grid.set(6, 6, 6, 6, contrib.donut, {
    label: 'Size composition of dist/assets/ folder',
    radius: 16,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
    data: [],
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
        fg: '#f0f0f0',
      },
      hover: {
        bg: 'green',
      },
    },
  });

  if (fs.existsSync(`${root}/dist/assets`)) {
    const assetSize = getFolderSize(`${root}/dist/assets`);
    barChart.setLabel(
      'Build Assets: (dist/assets) File Size (KB): ' +
        Math.round(assetSize / 1024)
    );

    const jsSize = getAssetSize(`${root}/dist/assets`, ['*.js']);
    const cssSize = getAssetSize(`${root}/dist/assets`, ['*.css']);
    const imgSize = getAssetSize(`${root}/dist/assets`, [
      '**/*.png',
      '**/*.jpg',
      '**/*.svg',
    ]);
    const jsonSize = getAssetSize(`${root}/dist/assets`, ['**/*.json']);

    const donutData = [];
    donutData.push({
      label: 'JS',
      percent: Math.round((jsSize / assetSize) * 100),
    });
    donutData.push({
      label: 'CSS',
      percent: Math.round((cssSize / assetSize) * 100),
    });
    donutData.push({
      label: 'Images',
      percent: Math.round((imgSize / assetSize) * 100),
    });
    donutData.push({
      label: 'JSON',
      percent: Math.round((jsonSize / assetSize) * 100),
    });

    const percent = donutData.map((v, index) => {
      return {
        percent: v.percent,
        label: v.label,
        color: index,
      };
    });

    const kbSizes = [jsSize, cssSize, imgSize, jsonSize].map((s) =>
      Math.round(s / 1024)
    );

    barChart.setData({ titles: assetTypes.map((a) => a.name), data: kbSizes });
    donutChart.setData(percent);

    assetTypeList.on('select', function (node) {
      const { content } = node;
      const _include = assetTypes
        .find((a) => a.name === content)
        .globs.map((g) => g.split('.')[1]);

      const requireCompression = ['JS', 'CSS', 'SVG'].includes(content);

      if (requireCompression) {
        const cs = new CompressionStats({
          inputPath: `${root}/dist/assets`,
          include: _include,
        });

        // show loading
        loadingWidget.load('Calculating sizes, please wait...');

        cs.getFileSizesObject()
          .then((files) => {
            if (files.length !== 0) {
              data = files.map((f) => {
                return [f.name, f.size, f.gzipSize, f.brotliSize];
              });

              const fileSizeSort = R.sortWith([R.descend(R.prop(2))]);

              data = fileSizeSort(data).map((d) => {
                const [name, length, gzip, brotli] = d;
                return [
                  name.replace(`${assetsFolder}/`, ''),
                  filesize(length),
                  filesize(gzip),
                  filesize(brotli),
                ];
              });

              //set default table
              table.setData({
                headers: ['Name', 'File Size', 'gzip', 'brotli'],
                data,
              });
              loadingWidget.stop();
              screen.render();
            }
          })
          .catch((err) => {
            loadingWidget.stop();
            const message = err;
            prompt.display(message, 0, function (err1) {
              if (err1) return;
              return;
            });
          });
      } else {
        // Process non compressed assets here
        const _globs = assetTypes.find((a) => a.name === content).globs;

        data = walkSync(assetsFolder, {
          globs: _globs,
          directories: false,
          includeBasePath: true,
        }).map((f) => {
          const buffer = fs.readFileSync(f);
          return [f.replace(`${assetsFolder}/`, ''), filesize(buffer.length)];
        });

        //set default table
        table.setData({
          headers: ['Name', 'File Size'],
          data,
        });
        screen.render();
      }
    });

    table.focus();
    screen.render();
  } else {
    const message = `Looks like you didn't build your Ember project yet.
    Please run 'ember build' and check again.
      Press any key to dismiss this message.`;
    prompt.display(message, 0, function (err) {
      if (err) return;
      //return callback(null, value);
      return;
    });
  }

  screen.append(prompt);
  screen.append(loadingWidget);
  assetTypeList.focus();

  screen.key(['tab'], function (/*ch, key*/) {
    if (screen.focused === assetTypeList) table.focus();
    else assetTypeList.focus();
  });

  screen.render();
};
