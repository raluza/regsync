#!/usr/bin/env node

// Parse command line
// @ts-ignore(TS1208): all files must be modules when the '--isolatedModules' flag is provided
const {name, from, to, newScope, dryRun} = require('yargs')
  .usage(`Usage: $0 --name <name> --from.registry <url> [--from.token <x>] --to.registry <url> [--to.token <y>] [--new-scope <scope>] [--dry-run]\n
Publish package versions from one registry to another.`)
  .example('$0 --name @scope/name --from.registry https://registry.npmjs.org/ --from.token $NPM_TOKEN ' +
    '--to.registry https://npm.pkg.github.com --to.token $GITHUB_TOKEN')
  .strict()
  .option('name', {
    demand: true,
    describe: 'Full package name including scope',
    nargs: 1,
    type: 'string'
  })
  .option('from', {
    demand: true,
    describe: 'Source registry and token'
  })
  .option('to', {
    demand: true,
    describe: 'Target registry and token'
  })
  .option('new-scope', {
    demand: false,
    describe: 'New scope for packages',
  })
  .option('dry-run', {
    demand: false,
    describe: 'Does everything except publish',
    boolean: true,
    default: false
  })
  .check(function (argv) {
    if (argv.from.registry === undefined) {
      throw (new Error('from.registry must be specified'))
    }
    if (argv.to.registry === undefined) {
      throw (new Error('to.registry must be specified'))
    }
    return true
  })
  .argv

// Publish all versions of the specified package
require('./index').sync(name, from, to, newScope, dryRun)
  .then(result => console.log('Published: %i %s %s', result, newScope ? '(newScope : ' + newScope + ')' : '', dryRun ? '(Dry Run)' : ''))
