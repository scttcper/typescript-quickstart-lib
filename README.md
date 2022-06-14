# TypeScript Quickstart Library

A fork of [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) with up to date packages and a few subsitutions.

## Use

```sh
git clone https://github.com/TypeCtrl/typescript-quickstart-lib.git --depth=1 YOURFOLDERNAME
cd YOURFOLDERNAME

# Run npm install and write your library name when asked. That's it!
npm install
```

## Features

- Zero Setup
- Vitest test running
- publishes in esm
- typescript type publishing `d.ts`
- **[Prettier](https://github.com/prettier/prettier)** and eslint for code formatting and consistency
- **[circleCI](https://circleci.com)** integration and **[codecov](https://codecov.io)** coverage reporting
- **Automatic releases and changelog**, using [Semantic release](https://github.com/semantic-release/semantic-release)

## NPM scripts

- `npm test`: Run test suite
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run test and generate coverage
- `npm run build`: Generate bundles and typings
- `npm run build:docs`: builds docs
- `npm run lint`: Lints code
- `npm run lint:fix`: Lints code and applies auto fixes
