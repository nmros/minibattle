var is_china = false ; 
var china_id ;

exports.create = function(id){
	is_china = true;
	china_id = id;
};


exports.check_china= function(){
	return is_china;
}

exports.get_player_id = function(){
	return china_id;
}