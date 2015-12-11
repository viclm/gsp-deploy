const async = require('async');
const crypto = require('crypto');
const compress = require('./compress');
const di = require('di');
const fs = require('fs-extra');
const gsp = require('gsp');
const path = require('path');

let deploy = function (options, readfile, compress, callback) {
    options.file = options.file.replace(/^\/*/, '/');
    async.waterfall([
        function (callback) {
            readfile(options.file, callback);
        },
        function (filedata, callback) {
            compress(options.file, filedata, {}, callback);
        },
        function (filedata, callback) {
            let shasum = crypto.createHash('sha1');
            shasum.update(filedata);
            callback(null, filedata, shasum.digest('hex'));
        },
        function (filedata, hash, callback) {
            let newfilename = path.basename(options.file).replace(/(\.[^.]+)?$/, `_${hash.slice(0, 7)}$1`);
            newfilename = path.join(options.dir, newfilename);
            fs.outputFile(newfilename, filedata, function (err) {
                callback(err, newfilename);
            });
        }
    ], callback);
};

exports.deploy = function (options) {

    let injector = new di.Injector([{
        options: ['value', options],
        readfile: ['value', gsp.readfile],
        compress: ['value', compress.compress],
        callback: ['value', function (err, newfilename) {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }
            else {
                console.log(newfilename);
            }
        }]
    }]);

    injector.invoke(deploy);
};
