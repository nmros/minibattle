var is_god = false ; 
var god_id ;

// exports.create = function(cb){
// 	god = true;
// 	console.log("god created");
// };

exports.create = function(id){
	is_god = true;
	god_id = id;
	console.log("god created");
};


exports.check_god = function(){
	return is_god;
}

exports.get_player_id = function(){
	return god_id;
}