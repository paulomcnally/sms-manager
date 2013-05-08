var express = require('express')
 , mongoose = require('mongoose')
 , stylus = require('stylus')
 , nib = require('nib')
 , controllers = require('./controllers')
 , config = require('./config')
 , models = require('./models')
 , string = require('string')
 , moment = require('moment')
 , db = mongoose.createConnection( config.mongodb.url );
 moment.lang("es");

/*
 var row = new models.users;
    row.name = "Paulo McNally",
    row.email = "paulomcnally@gmail.com";
    row.password = "6b59383bf5e823b168de73ddb0f937a2"; // polin
    row.registered = new Date();
    row.range = 1;
    row.active = true;
    row.save(function(err){
      if(err){
        console.log(err);
      }
      else{
       console.log(row.name + ' addeded');
      }
    });
*/

function IsAuthenticated(req,res,next){
  var path = ( req.path == null ) ? '/' : req.path;
  if(req.session.user_id){
    next();
  }else{
    res.redirect('/login?redirect='+path);
  }
}

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

var app = express();
// express settings
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: '023197422617bce43335cbd3c675aeed' }));
app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));

controllers.plataform.setup(models);

// routes
app.get("/",IsAuthenticated,controllers.plataform.homeGet);
app.get("/login",controllers.plataform.loginGet);
app.post('/login',controllers.plataform.loginPost);
app.get("/logout",controllers.plataform.logoutGet);
app.get("/sms/inbox",IsAuthenticated,controllers.plataform.smsInboxGet);

var server = require('http').createServer(app)
var WebSocket = require("socket.io").listen( server );
WebSocket.sockets.on("connection", ws_start);
function ws_start(data){
  data.on("new_message", ws_sendData);
}
function ws_sendData(data){

  var obj = {};
  data.message = string(data.message).stripTags().s;
  data.registered = moment(new Date()).fromNow();

  var row = new models.sms;
  row.number = obj.number;
  row.message = data.message;
  row.registered = new Date();
  row.read = false;
  row.save(function(err){
      if(err){
        console.log(err);
      }
      else{
       WebSocket.sockets.emit("ws_getData",data);
      }
    });
}

server.listen(80);