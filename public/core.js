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

		return restangular;

	}
}])


.factory('interScope',  [ function(){
	var interdata = {};
	interdata.dict = {};

	interdata.store = function(var1){
		interdata.dict = {content:var1};

	};

	return interdata ; 

}])

.controller("warMainCtrl", [ '$rootScope','$scope','WarRest', function($rootScope, $scope, restng){
	console.log("warMainCtrl");
	$scope.event_source = new EventSource('/events') ; 

	$rootScope.wargame_loaded = false ; 

}])


.controller("warPlayersCtrl", [ '$cookies', '$rootScope', '$scope','WarRest', 'interScope', function($cookies, $rootScope, $scope, restng, interScope){
	console.log("warPlayersCtrl");

	var source = $scope.event_source ; 

	if (interScope.dict.content !== undefined){
		$scope.china = interScope.dict.content.china;
		$scope.russia = interScope.dict.content.russia;
		$scope.god = interScope.dict.content.god;
	}

	var handleUrgentMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		var browser_sess_id = $cookies.get('sess_id');
		var player_state  = {};

		$scope.browser_sess_id = browser_sess_id;
		
		$scope.china = {};
		$scope.russia = {};
		$scope.god = {};

		$scope.$apply(function(){
			angular.forEach( msg_data['players'], function( val, key ){
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

				interScope.store(player_state);


			} );
		});
	};

	source.addEventListener('urgentMessage', handleUrgentMessage, false);


	$scope.becomePlayer = function(player_name){
		if (player_name == "god"){
			restng('api').one('player',"god" ).get().then(function(res){
				console.log(res);
			});

		}else if (player_name == "china"){
			console.log("becamechina");
			restng('api').one('player',"china" ).get().then(function(res){
				console.log(res);
			});

		}else if (player_name == "russia"){
			console.log("becamerussia");
			restng('api').one('player',"russia" ).get().then(function(res){
				console.log(res);
			});

		}

	};

	if ( $rootScope.wargame_loaded == false ) {
		restng('api').one('player',"init" ).get().then(function(res){
			$rootScope.wargame_loaded = true ; 
		});
	}


}])

.controller("warStageCtrl", [ '$scope','WarRest', function($scope, restng){
	console.log("in warStageCtrl");
	var source = $scope.event_source ; 

	var handleIntervalMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		$scope.$apply(function(){
			$scope.mydata = msg_data.uptime;
		});
	};

	source.addEventListener('intervalMessage', handleIntervalMessage, false);

}])



; 