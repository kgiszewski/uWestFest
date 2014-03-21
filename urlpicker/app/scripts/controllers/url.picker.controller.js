angular.module('umbraco').controller('UrlPickerController', function($scope, dialogService) {
/*  $scope.model.value = {
  	"type" : "content",
  	"meta" : {
  		"title" : "My awesome title",
  		"newWindow" : true
  	},
  	"typeData": {
  		"url" : "http://google.com",
  		"contentId" : 1051,
  		"mediaId" : 1052
  	}
  };*/

  $scope.switchType = function(type) {
  	$scope.model.value.type = type;
  }

  $scope.openTreePicker = function (type) {
  	var ds = dialogService.treePicker({
  		section: type,
  		treeAlias: type,
  		scope: $scope,
  		multiPicker: false,
  		callback: function(data) {
  			$scope.model.value.typeData.contentId = data.id
  		}
  	});
  }
});

