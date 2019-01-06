var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice']);
addCtrl.controller('addCtrl', function($scope, $http, $rootScope, geolocation, gservice){

    
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;


    $scope.formData.longitude = 21.011;
    $scope.formData.latitude = 52.228;


    geolocation.getLocation().then(function(data){

        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);


        $scope.formData.htmlverified = "Pozycja zweryfikowana";

        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });


    $rootScope.$on("clicked", function(){

        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
            $scope.formData.htmlverified = "Pozycja niezweryfikowana";
        });
    });

   
    $scope.refreshLoc = function(){
        geolocation.getLocation().then(function(data){
            coords = {lat:data.coords.latitude, long:data.coords.longitude};

            $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
            $scope.formData.htmlverified = "Zweryfikowana";
            gservice.refresh(coords.lat, coords.long);
        });
    };


    $scope.createUser = function() {

   
        var userData = {
            username: $scope.formData.username,
            server: $scope.formData.server,
            age: $scope.formData.age,
            favlane: $scope.formData.favlane,
            location: [$scope.formData.longitude, $scope.formData.latitude],
            htmlverified: $scope.formData.htmlverified
        };


        $http.post('/users', userData)
            .success(function (data) {


                $scope.formData.username = "";
                $scope.formData.server = "";
                $scope.formData.age = "";
                $scope.formData.favlane = "";

                gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});

