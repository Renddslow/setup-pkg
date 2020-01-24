#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const sade = require('sade');
const mkdir = require('make-dir');
const prompts = require('prompts');
const semver = require('semver');
const write = require('write-json-file');
const cpy = require('cpy');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const prog = sade('init-pkg <project_user> [name]');

prog
  .version(require('./package').version)
  .option('-t, --typescript', 'Initialize the package with typescript set up')
  .option('-b, --bitbucket', 'Initialize the repo with pointing at Bitbucket instead of GitHub')
  .option('--skip-git', `Don't initialize a git repository`)
  .action(async (user, name, opts) => {
    if (!name && !user.includes('/')) throw new Error('');

    if (user.includes('/')) {
      [user, name] = user.split('/');
    }

    await mkdir(name);
    const dir = path.join(process.cwd(), name);

    exec('git init', {
      cwd: dir,
    });

    await Promise.all([
      cpy('.gitignore', dir),
      writeFile(path.join(dir, 'yarn.lock'), ''),
    ]);

    const pkg = await prompts([
      {
        name: 'version',
        type: 'text',
        message: 'version',
        initial: '1.0.0',
        validate: (v) => semver.valid(semver.coerce(v)) ? true : 'Must be a valid semver version',
        format: (v) => semver.coerce(v).version,
      },
      {
        name: 'description',
        type: 'text',
        initial: '',
        message: 'description',
      },
      {
        name: 'main',
        type: 'text',
        initial: 'index.js',
        message: 'entry point',
      },
      {
        name: 'license',
        type: 'text',
        initial: 'MIT',
        message: 'license'
      },
      {
        name: 'author',
        type: 'text',
        initial: '',
        message: 'author'
      },
    ]);

    pkg.name = name;
    pkg.private = false;
    pkg.repository = opts.b ? `https://bitbucket.org/${user}/${name}` : `https://github.com/${user}/${name}`;

    await write(path.join(dir, 'package.json'), pkg);
  });

prog.parse(process.argv);
