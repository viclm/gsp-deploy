const cleancss = require('clean-css');
const Imagemin = require('imagemin');
const uglifyjs = require('uglify-js');
const path = require('path');
const di = require('di');

let compressEngines = (function () {

    const ImageminPlugin = {
        png: 'optipng',
        jpg: 'jpegtran',
        jpeg: 'jpegtran',
        gif: 'gifsicle'
    };

    let image = function (type, filedata, options, callback) {
        new Imagemin()
        .src(filedata)
        .use(Imagemin[ImageminPlugin[type]](options[ImageminPlugin[type]]))
        .run(function (err, file) {
            callback(err, !err && file[0].contents);
        });
    };

    let api = {
        js: function (filedata, options, callback) {
            filedata = uglifyjs.minify(filedata, Object.assign(options.uglifyjs, {fromString: true})).code;
            callback(null, filedata);
        },
        css: function (filedata, options, callback) {
            filedata = new cleancss(options.cleancss).minify(filedata).styles;
            callback(null, filedata);
        }
    };

    Object.keys(ImageminPlugin).forEach(function (type) {
        api[type] = function () {
            image(type, ...arguments);
        }
    });

    return api;

})();

let compress = function (filename, filedata, options, engines, callback) {
    let extname = path.extname(filename).slice(1).toLowerCase();
    if (engines[extname]) {
        engines[extname](filedata, options, callback);
    }
    else {
        callback(null, filedata);
    }
};

exports.compress = function (filename, filedata, options, callback) {

    options = Object.assign({
        uglifyjs: { mangle: {except: ['require']} },
        cleancss: { advanced: false, compatibility: 'ie7' },
        optipng: {},
        gifsicle: {},
        jpegtran: {}
    }, options);

    let injector = new di.Injector([{
        filename: ['value', filename],
        filedata: ['value', filedata],
        options: ['value', options],
        engines: ['value', compressEngines],
        callback: ['value', callback]
    }]);

    injector.invoke(compress);

};
