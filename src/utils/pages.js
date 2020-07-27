const homePage = require('../pages/home');
const fileSizesPage = require('../pages/filesizes');
const components = require('../pages/components');
const routes = require('../pages/routes');
const models = require('../pages/models');
const mixins = require('../pages/mixins');
const adapters = require('../pages/adapters');
const controllers = require('../pages/controllers');
const helpers = require('../pages/helpers');
const utils = require('../pages/utils');
const services = require('../pages/services');
const buildPage = require('../pages/build-assets');
const helpPage = require('../pages/help');

const pages = [
  { name: 'home', page: homePage, keyCodes: ['0'] },
  { name: 'fileSizes', page: fileSizesPage, keyCodes: ['f'] },
  { name: 'components', page: components, keyCodes: ['c'] },
  { name: 'routes', page: routes, keyCodes: ['r'] },
  { name: 'models', page: models, keyCodes: ['m'] },
  { name: 'mixins', page: mixins, keyCodes: ['x'] },
  { name: 'adapters', page: adapters, keyCodes: ['a'] },
  {
    name: 'controllers',
    page: controllers,
    keyCodes: ['o'],
  },
  {
    name: 'helpers',
    page: helpers,
    keyCodes: ['h'],
  },
  { name: 'utils', page: utils, keyCodes: ['u'] },
  { name: 'services', page: services, keyCodes: ['s'] },
  {
    name: 'build',
    page: buildPage,
    keyCodes: ['b'],
  },
  { name: 'help', page: helpPage, keyCodes: ['?', '!'] },
];

module.exports = pages;
