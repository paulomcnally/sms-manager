var models
, websocket
, string = require('string')
, moment = require('moment');

moment.lang("es");
exports.setup = function( _models, _websocket ){
	models = _models;
	websocket = _websocket;
};

function webSocketSendData (data){
	data.text = string(decodeURIComponent(data.text.replace(/\+/g, '%20'))).stripTags().s;
	data.registered = moment(new Date()).fromNow();

	var row = new models.sms;
	row.number = data.number;
	row.text = data.text;
	row.registered = new Date();
	row.read = false;
	row.save(function(err){
		if(err){
			console.log(err);
		}
		else{
			websocket.sockets.emit("ws_getData",data);
		}
	});
}


exports.webSocketStart = function (data){
	function out(){
		data.on("new_message", webSocketSendData);
	}
  return out();
}

/**
 * Load login template form
 */
exports.receiber = function(req, res){
	function out(  ){
		req.body.type="sms";
		webSocketSendData(req.body);
		res.send('true');
	}
	return out( );
}