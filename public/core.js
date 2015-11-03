angular.module('warZone', ['ui.router','restangular','ngCookies'])

.config(['$stateProvider','$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise("/mainstage");

	$stateProvider.state('mainstage', {
		url: '/mainstage',
		templateUrl: 'mainstage.html',
		controller : "warStageCtrl"

	});

	$stateProvider.state('warplayers', {
		url: '/warplayers',
		templateUrl: 'warplayers.html',
		controller : "warPlayersCtrl"
	});
}])


.factory('WarRest', ['Restangular', function(Restangular){
	return function(baseurl){
		var restangular = Restangular.withConfig(function(RestangularConfigurer){
			RestangularConfigurer.setBaseUrl(baseurl);
		});

		restangular.extendModel('player', function(model){
			model.setplayer = function(){
				return model.post('setplayer');
			};
			return model;
		});

		return restangular;

	}
}])


.factory('interScope',  [ function(){
	var interdata = {};

	var child_scope ; 

	interdata.gui = {};

	interdata.military = {
		china : {}, 
		russia : {}
	};


	interdata.battle = {
		plane : {}, 
		soldier : {},
		tank : {}
	};


	interdata.battle = { 
		"plane" : { "won" : "", "ratio" : 0 },
		"soldier" : {"won" : "", "ratio" : 0 },
		"tank" : {"won" : "", "ratio" : 0 }
	};

	interdata.storeGui = function( vars){
		interdata.gui = {content:vars};

	};

	interdata.storeEquipment = function(msg_data){
		var player 		= msg_data['player'];
		var equipment 	= msg_data['equipment'];
		interdata.military[player] = equipment;

	};

	interdata.storeBattle = function(msg_data){
		interdata.battle = msg_data;

	};


	// interdata.handleBattleMessage = function(msg){
	// 	var msg_data = JSON.parse(msg.data);
	// 	interdata.storeBattle(msg_data);

	// };


	// interdata.handleStateMessage = function(msg){
	// 	var msg_data = JSON.parse(msg.data);
	// 	// interdata.storeEquipment(msg_data);
	// 	// console.log(" interScope handleStateMessage ");


	// 	// interdata.child_scope.$apply(function(){
	// 	// 	interdata.storeEquipment(msg_data);
	// 	// 	// $scope.militaryState = interScope.military;

	// 	// });

	// };

	// // interdata.setChildScope = function(child_scope){
	// // 	interdata.child_scope = child_scope;
	// // 	// console.log("child_scope");
	// // 	// console.log(child_scope);
	// // };



	return interdata ; 

}])

.directive('warScene',  function(){
	return {
		templateUrl: 'warscene.html',
		scope: {
			title : "@",

		},

	};
})

.directive('controlGodPanel',  function(){
	return {
		templateUrl: 'control_god_panel.html',
		// restrict: 'E',
		// transclude: true,
		scope: false, 

	}

})


.directive('controlPlayerPanel',  function(){
	return {
		templateUrl: 'control_player_panel.html',
		scope: {
			playerEquipment: '=militaryState',
			playerName: '@playername'
		},

	};
})


.directive('battleResult',  function(){
	return {
		templateUrl: 'battle_result.html',
		// scope: false
		scope: {
			// battleResult: '=',
			// battle: '=battleStats'
			battleResult: '=battleStats'
		}

	};
})


.controller("warMainCtrl", [ '$rootScope','$scope','WarRest','interScope', function($rootScope, $scope, restng, interScope){
	console.log("warMainCtrl");
	$scope.event_source = new EventSource('/events') ; 

	$rootScope.wargame_loaded = false ; 


	// var handleBattleMessage = interScope.handleBattleMessage;
	// $scope.event_source.addEventListener('battleMessage', handleBattleMessage, false);
	

	// var handleBattleMessage = function(msg){
	// 	var msg_data = JSON.parse(msg.data);
	// 	console.log("handleBattleMessage");

	// 	$scope.$apply(function(){
	// 		interScope.storeBattle(msg_data);

	// 	});
	// };
	// $scope.event_source.addEventListener('battleMessage', handleBattleMessage, false);


	var handleStateMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		
		$scope.$apply(function(){
			interScope.storeEquipment(msg_data);

		});
	};
	$scope.event_source.addEventListener('equipmentStateMessage', handleStateMessage, false);

}])


.controller("warPlayersCtrl", [ '$cookies', '$rootScope', '$scope','WarRest', 'interScope', function($cookies, $rootScope, $scope, restng, interScope){
	console.log("warPlayersCtrl");

	var source = $scope.event_source ; 

	$scope.china = { equipment : {} };
	$scope.russia =  {equipment : {} };
	$scope.god = { equipment : {} };


	if (interScope.gui.content !== undefined){
		$scope.china = interScope.gui.content.china;
		$scope.russia = interScope.gui.content.russia;
		$scope.god = interScope.gui.content.god;
	}

	var handleUrgentMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		var browser_sess_id = $cookies.get('sess_id');
		var player_state  = {};
		var players = msg_data['players'];

		$scope.browser_sess_id = browser_sess_id;

		if ( players.hasOwnProperty('china_id') ||
			 players.hasOwnProperty('god_id') ||
			 players.hasOwnProperty('russia_id') ){

			$scope.$apply(function(){
				angular.forEach( players, function( val, key ){

					if (key == "china_id" ){
						if (browser_sess_id == val){
							$scope.china.active = true;
							$scope.china.model = true;

							$scope.russia.active = false;
							$scope.russia.model = false;

							$scope.god.active = false;
							$scope.god.model = false;


						}else {
							$scope.china.active = false;
							$scope.china.model = false;
						}

					}else if (key == "russia_id" ){
						if (browser_sess_id == val){
							$scope.russia.active = true;
							$scope.russia.model = true;

							$scope.china.active = false;
							$scope.china.model = false;

							$scope.god.active = false;
							$scope.god.model = false;


						}else {
							$scope.russia.active = false;
							$scope.russia.model = false;
						}
					}else if (key == "god_id" ){
						if (browser_sess_id == val){
							$scope.god.active = true;
							$scope.god.model = true;

							$scope.russia.active = false;
							$scope.russia.model = false;

							$scope.china.active = false;
							$scope.china.model = false;



						}else {
							$scope.god.active = false;
							$scope.god.model = false;

						}
					}

					player_state['china'] = $scope.china;
					player_state['russia'] = $scope.russia;
					player_state['god'] = $scope.god;

					interScope.storeGui(player_state);

				} );
			});
		}

	};

	source.addEventListener('urgentMessage', handleUrgentMessage, false);

	$scope.addEquipment = function(player, what){
		restng('api').one('player', player).one('addequipment',what).post().then(function(res){
			if (res.player == "russia"){
				$scope.russia.equipment = res.equipment;

			}else if (res.player == "china"){

				$scope.china.equipment = res.equipment;
			};

		});

	};


	$scope.startBattle = function(){
		var player = "god";
		restng('api').one('player', player).post('startbattle').then(function(res){
			console.log("res battle");
			console.log(res);
		});

	};



	$scope.becomePlayer = function(player_name){
		if (player_name == "god"){
			restng('api').one('player',"god" ).post('setplayer').then(function(res){
				console.log(res);
			});


		}else if (player_name == "china"){
			console.log("becamechina");
			restng('api').one('player',"china" ).post('setplayer').then(function(res){
				console.log(res);
			});

		}else if (player_name == "russia"){
			console.log("becamerussia");
			restng('api').one('player',"russia" ).post('setplayer').then(function(res){
				console.log(res);
			});

		}

	};

	if ( $rootScope.wargame_loaded == false ) {
		restng('api').one('player',"init" ).post('setplayer').then(function(res){
			$rootScope.wargame_loaded = true ; 
		});
	}


}])

.controller("warStageCtrl", [ '$cookies', '$rootScope', '$scope','WarRest', 'interScope', function($cookies, $rootScope, $scope, restng, interScope){

	console.log("in warStageCtrl");
	var source = $scope.event_source ; 

	$scope.china = {};
	$scope.russia = {};
	$scope.god = {};



	if (interScope.gui.content !== undefined){
		$scope.china = interScope.gui.content.china;
		$scope.russia = interScope.gui.content.russia;
		$scope.god = interScope.gui.content.god;
	}


	$scope.militaryState = interScope.military;
	$scope.battleResult = interScope.battle;


	var handleIntervalMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		$scope.$apply(function(){
			$scope.warTimer = msg_data.uptime;
		});
	};



	
	var handleBattleMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		interScope.storeBattle(msg_data);
		
		$scope.$apply(function(){
			$scope.battleResult = interScope.battle;
		});


	};
	source.addEventListener('battleMessage', handleBattleMessage, false);


	// var handleStateMessage = function(msg){
	// 	var msg_data = JSON.parse(msg.data);
		
	// 	$scope.$apply(function(){
	// 		interScope.storeEquipment(msg_data);
	// 		$scope.militaryState = interScope.military;

	// 	});
	// };
	// source.addEventListener('equipmentStateMessage', handleStateMessage, false);

	// $scope.$apply(function(){
	// 	console.log("$apply");
	// 	$scope.militaryState = interScope.military;
	// });


}])



; 