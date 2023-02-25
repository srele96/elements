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

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts });

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
    initial: true,
    message: `Releasing v${newVersion}. Confirm?`,
  });

  if (!confirm.ok) {
    console.log('Release cancelled...');
    process.exit(0);
  }

  step('Updating package.json...');
  updatePackageJson(newVersion);

  step('Building the library...');
  await run('yarn', ['build']);

  step('Committing changes...');
  await run('git', ['add', 'package.json']);
  await run('git', ['commit', '-m', `release: v${newVersion}`]);
  await run('git', ['tag', `v${newVersion}`]);

  step('Publishing to npm...');
  await run('npm', ['publish']);

  step('Pushing to GitHub...');
  await run('git', ['push', 'origin', `refs/tags/v${newVersion}`]);
  await run('git', ['push']);
}

main().catch((error) => {
  // error.message may be undefined for some reason, prevent `undefined`.
  const errorMessage = error.message ? `: ${error.message}` : '.';
  console.error('An error occurred during release' + errorMessage);
});
