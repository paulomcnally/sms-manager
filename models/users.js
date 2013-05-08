var mongoose;
var db;
exports.setup = function(_mongoose,_db){
  mongoose = _mongoose;
  db = _db;


  var schema = mongoose.Schema({ 
    name: String,
    email: String,
    password: String,
    registered: Date,
    range: Number,
    active: Boolean
  });
  var Users = db.model('users', schema);
  var Data = db.model('users');
  return Data;
};