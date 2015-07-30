var path = require('path');
var es = require('event-stream');

var gutil = require('gulp-util');

var _ = require('lodash');

module.exports = function(shared) {
  var config = shared.config;
  var paths = config.paths;

  return es.map(function(file, cb) {
    var config = shared.config;
    var layout = file.globals.internals.layout;
    var adapter = require('adapter-template');
    var engineName = config.template.language;
    var engine = adapter(engineName);

    engine.filters = config.template.filters || config.ssg;

    if (config.verbose) {
      gutil.log('Template engine set to:', engineName);
      gutil.log('Filters set to:', engine.filters);
    }

    var _cb = function (err, html){
      if (err){
        return cb(err);
      }
      file.contents = new Buffer(html);
      cb(null, file);
    };
    file.globals.content = String(file.contents);
    file.globals.post = _.cloneDeep(file.globals.page);
    var params = {
      locals: file.globals,
      includeDir: paths.includes
    };
    params.locals.site.posts = _.sortByOrder(params.locals.site.posts, 'date', 'desc');

    if (layout) {
      engine.renderFile(path.join(paths.layouts, layout + '.html'), params, _cb);
    } else {
      engine.render(file.globals.content, params, _cb);
    }
  });
};