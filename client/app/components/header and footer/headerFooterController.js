angular.module("main")
    .controller("HeaderFooterCtrl", function($scope, auth, $state){

        $scope.logOutApp = function(){
            auth.logOut().then(function(){
                $state.go('login');
            });
        }

    });