angular.module('umbraco').controller('UrlPickerAdditionalTypesController', function($scope, dataTypeResource, urlPickerService) {
  $scope.model.value =  $scope.model.value || [];

  urlPickerService.getAllPropertyEditors().then(function (d) {
    $scope.dataTypes = d;
  });

  $scope.add = function () {
    $scope.model.value.push({
      name: '',
      alias: '',
      dataTypeId: 0
    });
  };

  $scope.remove = function ($index) {
    $scope.model.value.splice($index, 1);
  };
});
