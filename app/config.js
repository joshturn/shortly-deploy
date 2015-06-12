var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly')

var mdb = mongoose.connection;
mdb.on('error', function(){
  console.log('connection error');
});
mdb.once('open', function(){
  console.log('Yay!');
});

module.exports = mdb;
