const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();

const homePage = require('./src/pages/home');
const fileSizesPage = require('./src/pages/filesizes');
const components = require('./src/pages/components');
const routes = require('./src/pages/routes');
const models = require('./src/pages/models');
const mixins = require('./src/pages/mixins');
const adapters = require('./src/pages/adapters');
const controllers = require('./src/pages/controllers');
const helpers = require('./src/pages/helpers');
const utils = require('./src/pages/utils');
const services = require('./src/pages/services');
const buildPage = require('./src/pages/build-assets');
const helpPage = require('./src/pages/help');

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


const pages = [
  { name: 'home',
    page: homePage
  },
  { name: 'fileSizes',
    page: fileSizesPage
  },
  { name: 'components',
    page: components
  },
  { name: 'routes',
    page: routes
  },
  { name: 'models',
    page: models
  },
  { name: 'mixins',
    page: mixins
  },
  { name: 'adapters',
    page: adapters
  },
  {
    name: 'controllers',
    page: controllers,
  },
  {
    name: 'helpers',
    page: helpers
  },
  { name: 'utils',
    page: utils
  },
  { name: 'services',
    page: services
  },
  {
    name: 'build',
    page: buildPage
  },
  { name: 'help',
    page: helpPage
  }

];

const _pages = pages.map(p => p.page);
var carousel = new contrib.carousel(_pages 
  , { screen: screen
    , interval: 0 //how often to switch views (set 0 to never swicth automatically)
    , controlKeys: true  //should right and left keyboard arrows control view rotation
  })

// Show help page when ? is pressed
screen.key(['?'], function(ch, key) {
  carousel.end(); 
});

// Goto home when h key is pressed
screen.key(['h'], function(ch, key) {
  carousel.home();
});

// Goto build stats page when b key is pressed
screen.key(['b'], function(ch, key) {
  carousel.currPage = pages.findIndex(p => p.name === 'build');
  carousel.move();
});

module.exports = carousel;
