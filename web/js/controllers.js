angular.module('appname.controllers',[])
.controller('BaseCtrl', ['$scope', 'logoutService','toastr','$location','$rootScope', function ($scope,logoutService,toastr,$location,$rootScope) {
        $scope.logout = function () {
        	logoutService.logout();
        };
 }])
.controller('tempCtrl',['$scope', 'logginService', 'logoutService','toastr','$rootScope','$location', function($scope, logginService,logoutService,toastr,$rootScope,$location){
	$scope.login = function () {
		if ($scope.email && $scope.password) {
			logginService.loggin($scope.email,$scope.password).then(function (result) {
				if(result.status === 'OK'){
					$rootScope.currentUser = result.user;
					$location.path('/profile');
					toastr.success('Logged In');
				}
			});
		} else {
			toastr.error('Must provide a valid email and password');
		}
	};
}])
.controller('signupCtrl',['$scope','signupService','toastr','$rootScope','$location', function($scope,signupService,toastr,$rootScope,$location){
	$scope.signup = function () {
		if($scope.firstName && $scope.lastName && $scope.email && $scope.password){
			var data= {
				email: $scope.email,
				password: $scope.password,
				firstName: $scope.firstName,
				lastName: $scope.lastName
			};
			signupService.signup(data).then(function (result) {
				if(result.status === 'OK'){
					$rootScope.currentUser = result.user;
					$location.path('/profile');
				}
			});
		} else {
			toastr.error('All fields are required');
		}
	}
	
}])
.controller('profileCtrl',['$scope','profileService','$rootScope', function($scope,profileService,$rootScope){
	$scope.getuserinfo = function () {
		profileService.getUserInfo().then(function (result) {
			if(result.status === 'OK'){
				$scope.user = result.user;
			} 
		});
	};
	$scope.getuserinfo();
}]);