var is_russia = false ; 
var russia_id ;

exports.create = function(id){
	is_russia = true;
	russia_id = id;
};


exports.check_russia= function(){
	return is_russia;
}

exports.get_player_id = function(){
	return russia_id;
}