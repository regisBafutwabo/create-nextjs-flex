const { program } = require('commander');
const { setup } = require('.');

program
  .name('create-nextjs-flex') 
  .version('0.1.1')
  .argument('<project-name>', 'Name of the project')
  .option('-e, --example', 'Create an example project')
  .action(async (projectName, options) => {
    try {
      await setup(projectName, options.example);
      console.log(`Project ${projectName} created successfully!`);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });

program.parse(process.argv);