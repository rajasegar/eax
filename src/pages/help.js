'use strict';

const contrib = require('blessed-contrib');
const pageList = require('../utils/pages');
const capitalize = require('../utils/capitalize');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const helpWidget = grid.set(0, 0, 12, 12, contrib.table, {
    label: 'Help: Keyboard Navigation',
    keys: true,
    vi: true,
    style: { fg: 'yellow', bg: 'black' },
    selectedBg: 'white',
    selectedFg: 'black',
    columnWidth: [40, 40],
  });

  const helpKeys = [
    ['Next Page', 'Right Arrow'],
    ['Prev Page', 'Left Arrow'],
    ['Up', 'Up Arrow / k'],
    ['Down', 'Down Arrow / j'],
    ['Select', 'Enter / l'],
    ['Quit', 'q / Esc / Ctrl-c'],
    ['Search', '/'],
    ['Go to the beginning of any list', 'gg'],
    ['Go to the end of any list', 'G'],
    ['Help', '? / !'],
    ['Navigate within a page', 'Tab'],
    ['Export list data as CSV', 'e'],
  ];

  // Generating keycodes from page objects
  pageList.forEach((p) => {
    const helpText = `Go to ${capitalize(p.name)}`;
    helpKeys.push([helpText, p.keyCodes.join(' / ')]);
  });

  helpWidget.setData({ headers: ['Function', 'Key'], data: helpKeys });
  helpWidget.focus();

  screen.render();
};
