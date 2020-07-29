const components = require('../pages/components');
const routes = require('../pages/routes');
const models = require('../pages/models');
const mixins = require('../pages/mixins');
const adapters = require('../pages/adapters');
const controllers = require('../pages/controllers');
const helpers = require('../pages/helpers');
const utils = require('../pages/utils');
const services = require('../pages/services');

const entityPageMap = {
  adapters,
  components,
  routes,
  models,
  mixins,
  controllers,
  helpers,
  utils,
  services,
};

module.exports = entityPageMap;
