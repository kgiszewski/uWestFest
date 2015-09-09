angular.module('umbraco').controller('UrlPickerController', function($scope, dialogService, entityResource, mediaHelper) {

  var currentDialog = null;

  var alreadyDirty = false;
  
  init();

  $scope.switchType = function(type) {
      $scope.model.value.type = type;
  }

  $scope.resetType = function (type) {
      if (type == "content") {
          $scope.model.value.typeData.contentId = null;
          $scope.contentName = "";
      } else if (type == "media") {
          $scope.model.value.typeData.mediaId = null;
          $scope.mediaName = "";
          $scope.media = null;
      } else {
          $scope.model.value.typeData.url = "";
      }
  }

  $scope.openTreePicker = function (type) {

    //ensure the current dialog is cleared before creating another!
    if (currentDialog) {
        dialogService.close(currentDialog);
    }

    var dialog;

    if (type == "media") {
      dialog = dialogService.mediaPicker({
        onlyImages: $scope.model.config.mediaImagesOnly,
        multiPicker: false,
        callback: function(data) {
          
          var media = data;

          if (!media.thumbnail) {
              media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
          }

          $scope.media = media;

          $scope.model.value.typeData.mediaId = data.id;
          $scope.mediaName = getEntityName(data.id, "Media");
        }

      });
    } else {

      dialog = dialogService.treePicker({
      section: type,
      treeAlias: type,
      startNodeId: getStartNodeId(type),
      multiPicker: false,
      callback: function(data) {
        $scope.model.value.typeData.contentId = data.id;
        $scope.contentName = getEntityName(data.id, "Document");
      }
    });

    }
    
    //save the currently assigned dialog so it can be removed before a new one is created
    currentDialog = dialog;
  }

  function getStartNodeId(type) {
      if (type == "content") {
          return $scope.model.config.contentStartNode
      } else {
          return $scope.model.config.mediaStartNode
      }
  }

  function getEntityName(id, typeAlias) {
    if(!id) {
      return "";
    }

    return entityResource.getById(id, typeAlias).then(function(entity) {
      return entity.name;
    });
  }

  // Setup "render model" & defaults
  function init() {

    if (!$scope.model.config.contentStartNode)
        $scope.model.config.contentStartNode = -1;

    if (!$scope.model.config.mediaStartNode)
        $scope.model.config.mediaStartNode = -1;

    if (!$scope.model.config.mediaImagesOnly || $scope.model.config.mediaImagesOnly == 0) {
      $scope.model.config.mediaImagesOnly = false;
    }
    else {
      $scope.model.config.mediaImagesOnly = true;
    }

    if (!$scope.model.config.mediaPreview || $scope.model.config.mediaPreview == 0) {
      $scope.model.config.mediaPreview = false;
    }
    else {
      $scope.model.config.mediaPreview = true;

      var mediaId = $scope.model.value.typeData.mediaId;

      if(mediaId) {
        entityResource.getById(mediaId, "Media").then(function (media) {
          if (!media.thumbnail) { 
              media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
          }

          $scope.media = media;
        });
        //Todo: handle scenario where selected media has been deleted
      }
    }

    if (!$scope.model.value || !$scope.model.value.type) {
      var defaultType = "content";

      if($scope.model.config.defaultType) {
        defaultType = $scope.model.config.defaultType;
      }

      $scope.model.value = { "type": defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null } };
    }
    
    if ($scope.model.value.typeData && $scope.model.value.typeData.contentId) {
      $scope.contentName = getEntityName($scope.model.value.typeData.contentId, "Document");
    }

    if ($scope.model.value.typeData && $scope.model.value.typeData.mediaId) {
      $scope.mediaName =  getEntityName($scope.model.value.typeData.mediaId, "Media");
    }
  }


  $scope.$watch('model.value', function (newval, oldval) {
      //console.log(newval, oldval);

      if (newval !== oldval) {
          //run after DOM is loaded
          $timeout(function () {
              if (!alreadyDirty) {
                  var currForm = angularHelper.getCurrentForm($scope);
                  currForm.$setDirty();
                  alreadyDirty = true;
              }
          }, 0);
      }
  }, true);

});
