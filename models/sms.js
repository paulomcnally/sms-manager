var mongoose;
var db;
exports.setup = function(_mongoose,_db){
  mongoose = _mongoose;
  db = _db;


  var schema = mongoose.Schema({ 
    number: String,
    text: String,
    registered: Date,
    read: Boolean
  });
  var Sms = db.model('sms', schema);
  var Data = db.model('sms');
  return Data;
};