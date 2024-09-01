#!/usr/bin/env node
const { program } = require('commander');
const { setup } = require('.');
const { version } = require('./package.json');


program
  .name('create-nextjs-flex') 
  .version(version, '-v, --version', 'Output the current version')
  .argument('[project-name]', 'Name of the project')
  .option('-y, --yes', 'Skip prompts and use default options')
  .action(async (projectName, options) => {
    try {
      await setup(projectName, options.yes);
      console.log(`Project ${projectName} created successfully!`);
    } catch (error) {
      console.error('An error occurred:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);