const semver = require('semver');
const path = require('path');
const fs = require('fs');

// Checks whether the current project is Octane version or not
module.exports = function () {
  const _root = process.argv[2] || '.';
  const root = path.resolve(_root);

  const packageManifest = JSON.parse(
    fs.readFileSync(`${root}/package.json`, 'utf-8')
  );
  const emberCli =
    packageManifest.devDependencies['ember-cli'] ||
    packageManifest.dependencies['ember-cli'];
  const isOctane = semver.gte(semver.coerce(emberCli), semver.valid('3.15.0'));
  return isOctane;
};
