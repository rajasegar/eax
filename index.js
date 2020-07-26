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
const log = require('./src/utils/log');

log('Starting eax');

screen.key(['escape', 'q', 'C-c'], function (/*ch, key*/) {
  return process.exit(0); // eslint-disable-line
});

const pages = [
  { name: 'home', page: homePage, keyCode: '0' },
  { name: 'fileSizes', page: fileSizesPage, keyCode: 'f' },
  { name: 'components', page: components, keyCode: 'c' },
  { name: 'routes', page: routes, keyCode: 'r' },
  { name: 'models', page: models, keyCode: 'm' },
  { name: 'mixins', page: mixins, keyCode: 'x' },
  { name: 'adapters', page: adapters, keyCode: 'a' },
  {
    name: 'controllers',
    page: controllers,
    keyCode: 'o',
  },
  {
    name: 'helpers',
    page: helpers,
    keyCode: 'h',
  },
  { name: 'utils', page: utils, keyCode: 'u' },
  { name: 'services', page: services, keyCode: 's' },
  {
    name: 'build',
    page: buildPage,
    keyCode: 'b',
  },
  { name: 'help', page: helpPage, keyCode: '?' },
];

const _pages = pages.map((p) => p.page);
var carousel = new contrib.carousel(_pages, {
  screen: screen,
  interval: 0, //how often to switch views (set 0 to never swicth automatically)
  controlKeys: true, //should right and left keyboard arrows control view rotation
});

// Define keyboard navigations
pages.forEach((p, index) => {
  screen.key([p.keyCode], function (/*ch, key*/) {
    carousel.currPage = index;
    carousel.move();
  });
});

module.exports = carousel;
