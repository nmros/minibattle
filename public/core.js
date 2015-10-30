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

.controller("warMainCtrl", [ '$rootScope','$scope','WarRest', function($rootScope, $scope, restng){
	console.log("warMainCtrl");
	$scope.event_source = new EventSource('/events') ; 

	$rootScope.wargame_loaded = false ; 

}])


.controller("warPlayersCtrl", [ '$cookies', '$rootScope', '$scope','WarRest', function($cookies, $rootScope, $scope, restng){
	console.log("warPlayersCtrl");

	var source = $scope.event_source ; 

	

	var handleUrgentMessage = function(msg){
		var msg_data = JSON.parse(msg.data);
		var browser_sess_id = $cookies.get('sess_id');

		$scope.$apply(function(){
			angular.forEach( msg_data['players'], function( val, key ){
				if (key == "china_id" ){
					if (browser_sess_id == val){
						$scope.china_active = true;
						$scope.russia_active = false;
						$scope.god_active = false;
					}else {
						$scope.china_active = false;
					}

				}else if (key == "russia_id" ){
					if (browser_sess_id == val){
						$scope.russia_active = true;
						$scope.china_active = false;
						$scope.god_active = false;
					}else {
						$scope.russia_active = false;
					}
				}else if (key == "god_id" ){
					if (browser_sess_id == val){
						$scope.god_active = true;
						$scope.russia_active = false;
						$scope.china_active = false;
					}else {
						$scope.god_active = false;
					}
				}

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