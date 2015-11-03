var is_china = false ; 
var china_id ;


var equipment = {
	tank : 0, 
	soldier : 0,
	plane : 0
};

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


exports.storeEquipment = function(name){
	switch (name) {
		case "tank" :
			equipment.tank = equipment.tank +1 ;
			break ; 
		case "soldier" :
			equipment.soldier = equipment.soldier +1 ;
			break ; 
		case "plane" :
			equipment.plane = equipment.plane+1 ;
			break ; 
	}

}

exports.getEquipments = function(){
	return equipment;
};