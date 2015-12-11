const di = require('di');
const gsp = require('gsp');

exports.ready = function (options) {
    let injector = new di.Injector([{
        options: ['value', options],
        callback: ['value', function (err) {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }
        }]
    }]);
    injector.invoke(gsp.ready);
};
