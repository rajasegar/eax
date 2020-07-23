'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const walkSync = require('walk-sync');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const filesize = require('filesize');

module.exports = function(screen) {

  const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

  const helpWidget = grid.set(0, 0, 12, 12, contrib.table, {
    label: 'Help: Keyboard Navigation', 
    keys: true,
    vi: true,
    style: { fg: 'yellow', bg: 'black'},
    columnWidth: [40, 40]
  });

  const helpKeys = [
    ['Next Page', 'Right Arrow'],
    ['Prev Page', 'Left Arrow'],
    ['Up', 'Up Arrow / k'],
    ['Down', 'Down Arrow / j'],
    ['Select', 'Enter / l'],
    ['Quit', 'q / Esc / Ctrl-c'],
    ['Help', '?'],
    ['Go to Home', 'h'],
    ['Search', '/']
  ];

  helpWidget.setData({headers: ['Function', 'Key'], data: helpKeys});
  helpWidget.focus();


  screen.render();
};
