var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Menu = new Schema({
    option: {
        type: Object
    }
});

Menu.statics = {
    load: function (options, cb) {
        this.findOne(options.criteria)
        .exec(cb);
    }
};

module.exports = mongoose.model('config', Menu, 'configs');
