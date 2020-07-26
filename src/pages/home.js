'use strict';

const contrib = require('blessed-contrib');
const path = require('path');
const fs = require('fs');
const walkSync = require('walk-sync');
const filesize = require('filesize');
const getFolderSize = require('../utils/getFolderSize');

module.exports = function (screen) {
  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);
  const packageManifest = JSON.parse(
    fs.readFileSync(`${root}/package.json`, 'utf-8')
  );

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

  let _folders = walkSync
    .entries(`${root}/app`)
    .filter((entry) => entry.isDirectory());

  _folders = _folders
    .map((f) => f.relativePath.replace('/', ''))
    .filter((f) => folders.includes(f));

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  let gitRepo = '';
  if (packageManifest.repository) {
    gitRepo =
      typeof packageManifest.repository === 'string'
        ? packageManifest.repository
        : packageManifest.repository.url;
  }

  let pacman = 'npm';
  if (fs.existsSync(`${root}/yarn.lock`)) pacman = 'yarn';
  if (fs.existsSync(`${root}/pnpm-lock.yaml`)) pacman = 'pnpm';

  const projDetails = [];

  projDetails.push(['ember-cli', packageManifest.devDependencies['ember-cli']]);
  projDetails.push([
    'devDependencies',
    Object.keys(packageManifest.devDependencies).length,
  ]);
  projDetails.push([
    'dependencies',
    (packageManifest.dependencies &&
      Object.keys(packageManifest.dependencies).length) ||
      0,
  ]);
  projDetails.push(['node version', packageManifest.engines.node]);
  projDetails.push(['Package manager', pacman]);
  projDetails.push(['Github', gitRepo]);

  const projSize = getFolderSize(root);
  projDetails.push(['Project size', filesize(projSize)]);

  const appSize = getFolderSize(`${root}/app`);

  projDetails.push(['app/ size', filesize(appSize)]);

  const projWidget = grid.set(0, 0, 6, 4, contrib.table, {
    label: packageManifest.name,
    selectedBg: 'black',
    columnWidth: [15, 50],
    columnSpacing: 3,
  });

  //set default table
  projWidget.setData({ headers: ['', ''], data: projDetails });

  const topRow = grid.set(0, 4, 6, 8, contrib.bar, {
    label: 'Total File Size (KB): ' + Math.round(appSize / 1024),
    barWidth: 4,
    barSpacing: 5,
    xOffset: 0,
    maxHeight: 9,
  });

  const bottomRow = grid.set(6, 0, 6, 12, contrib.donut, {
    label: 'Size composition of app/ folder',
    radius: 8,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
    data: [],
  });

  const folderSizes = _folders.map((f) => {
    return getFolderSize(`${root}/app/${f}`);
  });

  const data = folderSizes.map((f) => Math.round(f / 1024)); // size in kb

  const percent = folderSizes.map((size, index) => {
    let _label = _folders[index];
    let _percent = Math.round((size / appSize) * 100);

    // This is a bug in Donut widget
    if (_percent === 1) _percent = 0.01;

    return {
      percent: _percent,
      label: _label,
      color: index,
    };
  });

  topRow.setData({ titles: _folders, data });
  bottomRow.setData(percent);
  screen.render();
};
