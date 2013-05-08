var models
 , crypto = require('crypto')
 , moment = require('moment');
moment.lang("es");
exports.setup = function( _models ){
	models = _models;
};

/**
 * Load login template form
 */
exports.loginGet = function(req, res){
	function out(  ){
		res.render('login',{ title : 'Iniciar sesion', redirect: req.query.redirect } );
	}
	return out( );
}

/**
 * Validate user and create session
 * Redirect to login or home
 */
exports.loginPost = function(req, res){
	function out(  ){
		var post = req.body;
		models.users.findOne({ email: post.email, password: crypto.createHash('md5').update(post.password).digest("hex") }, function(err,row){
			if( !err ){
				if( row ){
					req.session.user_id = row._id;
					req.session.user_name = row.name;
					req.session.user_range = row.range;
					res.redirect(post.redirect);
				}
				else{
					console.log(err);
					res.redirect('/login');
				}
			}
		});
	}
	return out( );
}

exports.logoutGet = function(req, res){
	function out(  ){
		req.session.destroy(function(){});
		res.redirect('/login');
	}
	return out( );
}

exports.homeGet = function( req, res ){
	function out(  ){
		res.render('index',{ title : 'Inicio' } );
	}
	return out( );
}

exports.smsInboxGet = function( req, res ){
	function out(  ){
		models.sms.find({ },{},{ limit: 20, sort:{ registered: -1 } }, function(err,rows){
			if( !err ){
				if( rows ){
					var items = new Array();
					rows.forEach(function(item){
						var objItem = {};
						objItem.number = item.number;
						objItem.text = item.text;
						objItem._id = item._id;
						objItem.read = item.read;
						objItem.registered = moment(item.registered).fromNow();
						items.push(objItem);
					});
					res.render('sms-inbox',{ title : 'Bandeja de entrada', rows: items } );
				}
				else{
					console.log(err);
					res.redirect('/login');
				}
			}
		});
	}
	return out( );
}