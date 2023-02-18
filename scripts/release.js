#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { prompt } = require('enquirer');
const semver = require('semver');

const packageJson = require('../package.json');

function step(message) {
  console.log(chalk.cyan(message));
}

function updatePackageJson(version) {
  const pkgPath = path.resolve(path.resolve(__dirname, '..'), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  pkg.version = version;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

async function main() {
  const custom = 'custom';

  const selectedRelease = await prompt({
    type: 'select',
    name: 'version',
    message: 'Select release',
    choices: ['major', 'minor', 'patch']
      .map((releaseType) => {
        const newVersion = semver.inc(packageJson.version, releaseType);
        const choice = `${releaseType} (${newVersion})`;

        return { name: choice, value: newVersion };
      })
      .concat([custom]),
    result(name) {
      const version = this.map(name)[name];
      return version;
    },
  });

  let newVersion = selectedRelease.version;

  if (selectedRelease.version === custom) {
    const customRelease = await prompt({
      type: 'input',
      name: 'version',
      initial: packageJson.version,
      message: 'Enter custom version',
      validate(value) {
        return semver.valid(value) ? true : 'Invalid version';
      },
    });

    newVersion = customRelease.version;
  }

  const confirm = await prompt({
    type: 'confirm',
    name: 'ok',
    message: `Releasing v${newVersion}. Confirm?`,
  });

  if (!confirm.ok) {
    console.log('Release cancelled...');
    process.exit(0);
  }

  step('Updating package.json...');
  updatePackageJson(newVersion);

  step('Building...');
  await execa('yarn', ['build'], { stdio: 'inherit' });

  // Implement the rest... and refactor current code.
  // https://github.com/vuejs/petite-vue/blob/main/scripts/release.js
}

main();
