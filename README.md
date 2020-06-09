# setup-pkg

> A command-line tool to initialize a node module project. 

The project will create a new directory with git (including a gitignore), prettier, and yarn set up. Think `yarn init` but with some treats.

## Usage

```
Usage
    $ setup-pkg <project_user> [name] [options]

  Options
    -t, --typescript          Initialize the package with typescript set up
    -b, --bitbucket           Initialize the repo with pointing at Bitbucket instead of GitHub
    --exclude-ava             Exclude Ava installation and configuration
    --exclude-prettier        Exclude Renddslow's opinionated prettier setup
    -v, --version             Displays current version
    -h, --help                Displays this message
```

## API

### `project_user`

- Type: `string`
- Required: ✅

`project_user` is either the owner of the repo, or the owner combined with the repo name, delimited by a slash.

Given:
```
https://github.com/Renddslow/setup-pkg
```

Both `Renddslow` and `Renddslow/setup-pkg` would be valid `project_user` values.

### `name`

- Type: `string`
- Required: ❌

`name` is the repo and module name of the project. If a full owner and repo name is provided under `project_user`, this should be omitted.

Given:
```
https://github.com/Renddslow/setup-pkg
```

`setup-pkg` would be a valid `name` value.

### Options

#### `-t, --typescript`

Initialize the package with typescript set up. This will include `@types/node`, `ts-node`, and `typescript` as dev dependencies. It will also set-up a tsconfig with the following configurations:

```json
{
    "compilerOptions": {
        "declaration": true,
        "declarationDir": "./dist",
        "outDir": "dist",
        "target": "es2018",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "moduleResolution": "node",
        "module": "commonjs",
        "baseUrl": ".",
        "resolveJsonModule": true
    },
    "paths": {
        "*": ["node_modules/*"]
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

#### `-b, --bitbucket`

Initialize the repo with pointing at Bitbucket instead of GitHub. By default, the setup script will setup a git origin pointing at GitHub.

#### `--exclude-ava`

Exclude Ava installation and configuration. 

By default Ava is configured in the package.json with the following settings:

```json
{
    "ava": {
        "files": [
          "src/**/*.test.ts"
        ],
        "concurrency": 4,
        "timeout": "1m",
        "babel": false,
        "compileEnhancements": false,
        "extensions": [
          "ts"
        ],
        "require": [
          "ts-node/register"
        ]
    }
}
```

#### `--exclude-prettier`

Exclude Renddslow's opinionated prettier setup.

By default the package.json has `lint-staged` and `husky` setup to run prettier pre-commit.

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,css,json,md,ts,tsx}": [
      "prettier --write"
    ]
  }
}
```

In addition, it uses `@dmsi/prettier-config` which contains the following settings:

```json
{
    "singleQuote": true,
    "trailingComma": "all",
    "arrowParens": "always",
    "useTabs": false,
    "tabWidth": 2,
    "printWidth": 100
}
```
