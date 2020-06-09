#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const sade = require('sade');
const mkdir = require('make-dir');
const prompts = require('prompts');
const semver = require('semver');
const write = require('write-json-file');
const ejs = require('ejs');
const sort = require('sort-package-json');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const prog = sade('init-pkg <project_user> [name]');

const readTemplate = async (name, data = {}) => {
  const file = (await readFile(path.join(__dirname, 'templates', `${name}.ejs`))).toString();
  return ejs.render(file, data);
};

prog
  .version(require('./package').version)
  .option('-t, --typescript', 'Initialize the package with typescript set up')
  .option('-b, --bitbucket', 'Initialize the repo with pointing at Bitbucket instead of GitHub')
  .option('--exclude-ava', 'Exclude Ava installation and configuration')
  .option('--exclude-prettier', `Exclude Renddslow's opinionated prettier setup`)
  .action(async (user, name, opts) => {
    if (!name && !user.includes('/')) throw new Error('');

    if (user.includes('/')) {
      [user, name] = user.split('/');
    }

    await mkdir(name);
    const dir = path.join(process.cwd(), name);
    const repository = opts.b ? `https://bitbucket.org/${user}/${name}` : `https://github.com/${user}/${name}`;

    execSync('git init', {
      cwd: dir,
    });
    execSync(`git remote add origin ${repository}`, {
      cwd: dir,
    });

    await Promise.all([
      writeFile(path.join(dir, '.gitignore'), await readTemplate('gitignore')),
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
    pkg.repository = repository;
    pkg.scripts = {};

    const devDependencies = [];

    if (!opts['exclude-prettier']) {
      pkg.prettier = '@dmsi/prettier-config';
      pkg.husky = {
        hooks: {
          'pre-commit': 'lint-staged',
        },
      };
      pkg['lint-staged'] = {
        '*.{js,css,json,md,ts,tsx}': [
          'prettier --write',
        ]
      };
      devDependencies.push(...[
        'husky',
        'prettier',
        'lint-staged',
        '@dmsi/prettier-config',
      ]);
    }

    if (!opts['exclude-ava']) {
      pkg.ava = {
        files: ['src/**/*.test.ts'],
        concurrency: 4,
        timeout: '1m',
        babel: false,
        compileEnhancements: false,
        extensions: ['ts'],
        require: ['ts-node/register']
      };
      devDependencies.push('ava');
    }

    await write(path.join(dir, 'package.json'), sort(pkg));

    const readme = await readTemplate('readme', {
      name,
      description: pkg.description,
    });
    await writeFile(path.join(dir, 'README.md'), readme);
    execSync('git add -A', { cwd: dir });
    execSync('git commit -m "[init-pkg] Initial commit"', { stdio: 'inherit', cwd: dir });

    if (opts.typescript) {
      devDependencies.push(
        '@types/node',
        'ts-node',
        'typescript',
      );
      pkg.scripts.build = 'tsc';

      await writeFile(
        path.join(dir, 'tsconfig.json'),
        await readFile(path.join(__dirname, 'templates', 'tsconfig.json')),
      );
    }

    execSync(`yarn add --dev ${devDependencies.join(' ')}`, {
      stdio: 'inherit',
      cwd: dir,
    });

    execSync('git add -A', { cwd: dir });
    execSync('git commit -m "[init-pkg] Added base dev dependencies"', { stdio: 'inherit', cwd: dir });

    console.log(`🦄 ${name} has been created. Have fun storming the castle!`);
  });

prog.parse(process.argv);
