
(function(angular){

    function assignServicesToRootScope($rootScope, auth, session){
        $rootScope.auth = auth;
        $rootScope.session = session;
    }

    assignServicesToRootScope.$inject = ['$rootScope', 'auth', 'session'];
    angular.module('main').run(assignServicesToRootScope);
    
})(angular);