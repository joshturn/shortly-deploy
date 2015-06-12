var mongoose = require('mongoose');

var dbConnect = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/shortlydb';

mongoose.connect(dbConnect);
var mdb = mongoose.connection;
mdb.on('error', function(){
  console.log('connection error');
});
mdb.once('open', function(){
  console.log('Yay!');
});

module.exports = mdb;
