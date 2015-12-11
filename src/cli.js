const program = require('commander');
const pkg = require('../package.json');

let run = function (command) {
    require('./' + command.name())[command.name()](command.opts());
};

program
.version(pkg.version)
.description('Compile source files for deloyment')
.arguments('<file> [dir]')
.action(function (file, dir) {
    require('./deploy').deploy({
        file: file,
        dir: dir || process.cwd()
    });
});

program
.command('help [cmd]')
.description('display help for [cmd]')
.action(function (cmd) {
    program.commands.some(function (command) {
        if (command.name() === cmd) {
            command.help();
        }
    });
    if (cmd) {
        console.log("'\s' is not a gss command. See 'gsp --help'.", cmd);
    }
    else {
        program.help();
    }
});

program
.command('ready')
.option('--cwd [dir]', 'path to Gsp workspace, default is process.cwd()', process.cwd())
.description('clone/update all the git repositories and configure workspace')
.action(run);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
