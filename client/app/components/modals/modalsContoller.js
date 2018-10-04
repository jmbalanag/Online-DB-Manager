angular.module("main")
    .controller("ModalCtrl", function($scope, $http, session){
        $scope.onLoad = function(){
            $scope.modalLoader = false;
            $scope.errorMessage ='';
            $scope.serverProperties.status = session.getServerStatus();

            if($scope.serverProperties.status == "Connected"){
                $scope.serverNameFromUser = session.getServerName();
                $scope.serverDetails.instances.length = 0;
                $scope.serverDetails.instances = JSON.parse(session.getServerInstance());
                $scope.ins = JSON.parse(session.getSelectedInstance());
            }
        }

        $scope.serverDetails = {};
        $scope.serverDetails.instances = [];

        $scope.getInstances = function(){
            $scope.serverDetails.length = 0;
            $scope.serverDetails.instances.length = 0;

            if(typeof($scope.serverNameFromUser) == "undefined" || $scope.serverNameFromUser === null){
                errorServerName();
            }else{
                $scope.serverDetails.server = serverNameCheck($scope.serverNameFromUser);
                $scope.modalLoader = !$scope.modalLoader;  

            $http.post('/api/getInstances', $scope.serverDetails)
                .then(function(obj){
                    if(obj.data != 0){
                        angular.forEach(obj.data, function(response){
                            $scope.serverDetails.instances.push({
                                name: response.instc_name.substring(response.instc_name.indexOf('\\') + 1),
                                port: response.port_number
                            });
                        });
                        $scope.ins = $scope.serverDetails.instances[0].name;
                        $scope.modalLoader = !$scope.modalLoader;
                    }else{
                        errorServerName();
                    }
                    
                }).catch(function(err){
                    console.log('ERROR: ' + err);
                    errorServerName();
                });
            }
        };

        var errorServerName = function(){
            $scope.modalLoader = false;
            $scope.errorMessage = "Enter a Valid Server";
            $('#serverNameFromUser').focus();

        };

        var serverNameCheck = function(serverName){
            if (serverName != '0.0.0.0' && serverName != '255.255.255.255' &&
                serverName.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/)) {
                return serverName;
            } else {
                return serverName = serverName.substring(0, serverName.indexOf('.'));
            }
        };

        $scope.setPasswordFromModal = function(newPw){
            session.setPw(newPw);
            $("#getPasswordFromModal").modal("hide");
        };

        $scope.modalSubmit = function(){
            if(session.getServerStatus() === 'Connected'){
                disconnectToServer();
            }else{
                connectToServer($scope.serverNameFromUser, $scope.ins);
            }
        };

        var disconnectToServer = function(){
            $scope.connectingToServer = true;

            $http.get('/api/serverDisconnect')
                .then(function(res){
                    $scope.connectingToServer = false;
                    console.log(res);
                    session.destroyServerSession();
                    $("#serverConnectModal").modal("hide");
                    clearForm();
                    toastr.warning(res.data.msg, "Server status");
                }).catch(function(err){
                    $scope.connectingToServer = false;
                    console.log(err);
                });
        };

        var connectToServer = function(serverName, serverInstance){
            if(!session.getPw()){
                $("#getPasswordFromModal").modal({ backdrop : 'static' },"show");
            }else{
                $scope.connectingToServer = true;

                var secondaryServerDetails = {
                    server: serverName,
                    instance: serverInstance.name,
                    portNumber: serverInstance.port,
                    user: session.getUser(),
                    pw: session.getPw()
                };
                
                $http.post('/api/server', secondaryServerDetails)
                    .then(function(res){
                        $scope.connectingToServer = false;

                        if(res.status == "200"){
                            angular.forEach(res.data, function(response){
                                console.log(response);
                                toastr.success(response, 'Connected to Server');
                                session.setServerStatus('Connected');
                                session.setServerDetails(response);
                                session.setServerName($scope.serverNameFromUser);
                                session.setServerInstance($scope.serverDetails.instances, $scope.ins);

                                $("#serverConnectModal").modal("hide");

                            });
                        }
                    }).catch(function(err){
                        $scope.connectingToServer = false;
                        errorServerName();
                        console.log(err);
                    });
            }
        };

        var clearForm = function(){
            $('#serverConnectModal').find('form').trigger('reset');
            $('#serverConnectBtn').attr("disabled", true);
            $('#ins').empty().append("<option value=''>--Select Instance--</option>");
        };

        $('#serverConnectModal').on('hidden.bs.modal', function() {
            if(session.getServerStatus() == "Disconnected"){
                clearForm();
            }
        });

        $('#getPasswordFromModal').on('shown.bs.modal', function(){
            $('#serverConnectBtn').attr("disabled", true);
        });

        $('#getPasswordFromModal').on('hide.bs.modal', function(){
            $('#serverConnectBtn').attr("disabled", false);
        });
    });