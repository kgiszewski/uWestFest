angular.module('umbraco').controller('UrlPickerController', function($scope, dialogService, entityResource, mediaHelper) {

  var currentDialog = null;

  var alreadyDirty = false;
  
  init();

  $scope.switchType = function(type, picker) {
    var index = $scope.pickers.indexOf(picker);
    $scope.pickers[index].type = type;
    //$scope.model.value.type = type;
  }

  $scope.resetType = function (type, picker) {
    var index = $scope.pickers.indexOf(picker);
      if (type == "content") {
          $scope.pickers[index].typeData.contentId = null;

          //$scope.model.value.typeData.contentId = null;
          $scope.contentName = "";
          $scope.content = null;
      } else if (type == "media") {
          $scope.pickers[index].typeData.mediaId = null;
          $scope.pickers[index].mediaName = "";

          //$scope.model.value.typeData.mediaId = null;
          $scope.mediaName = "";
          $scope.media = null;
      } else {
          $scope.pickers[index].typeData.url = "";
          //$scope.model.value.typeData.url = "";
      }
  }

  $scope.openTreePicker = function (type, picker) {

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

          picker.media = { "name": media.name, "thumbnail": media.thumbnail, "icon": media.icon };

          //$scope.model.value.typeData.mediaId = data.id;
          //$scope.mediaName = getEntityName(data.id, "Media");
          //picker.mediaName = getEntityName(data.id, "Media");
          picker.typeData.mediaId = data.id;
        }

      });
    } else {

      dialog = dialogService.treePicker({
      section: type,
      treeAlias: type,
      startNodeId: getStartNodeId(type),
      multiPicker: false,
      callback: function(data) {

        var content = data;

        picker.content = { "name": content.name };

        //$scope.model.value.typeData.contentId = data.id;
        //$scope.contentName = getEntityName(data.id, "Document");

        picker.typeData.contentId = data.id;
      }
    });

    }
    
    //save the currently assigned dialog so it can be removed before a new one is created
    currentDialog = dialog;
  }

  $scope.canAddItem = function () {
      if(!$scope.model.config.multipleItems && $scope.pickers.length == 1) {
        return false;
      }
      return ($scope.model.config.maxItems > $scope.pickers.length);
  }

  $scope.canRemoveItem = function () {
      return ($scope.pickers.length > 1); //($scope.model.value.length > 1);
  }

  $scope.addItem = function() {
    var defaultType = "content";

    if($scope.model.config.defaultType) {
      defaultType = $scope.model.config.defaultType;
    }
    var pickerObj = { "type": defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null } };
    
    for (i = 0; i < $scope.pickers.length; i++) { 
        $scope.pickers[i].active = false;
    }

    $scope.pickers.push(pickerObj);
    $scope.pickers[$scope.pickers.length - 1].active = true;
  }

  $scope.editItem = function(picker) {
    var index = $scope.pickers.indexOf(picker);
    var oneAtATime = false;

    /*for (i = 0; i < $scope.pickers.length; i++) { 
        $scope.pickers[i].active = i == index ? true : false;
    }*/
    
    var isActive = $scope.pickers[index].active;
    //console.log("isActive", isActive);
    
    // collapse other panels
    if(oneAtATime) {
      for (i = 0; i < $scope.pickers.length; i++) { 
        if(i !== index || isActive) {
          $scope.pickers[i].active = false;
        }
      }
    }
    
    if(!isActive) {
      $scope.pickers[index].active = true;
    } else {
      $scope.pickers[index].active = false;
    }
    
    
  }

  $scope.removeItem = function(picker) {
    var index = $scope.pickers.indexOf(picker);
    if (confirm('Are you sure you want to remove this item?')) {
        $scope.pickers.splice(index, 1);
    }
  }
  //sort config
  $scope.sortableOptions = {
      axis: 'y',
      cursor: "move",
      handle: ".handle",
      cancel: ".no-drag",
      containment: "parent",
      items: "> li:not(.unsortable)",
      placeholder: 'sortable-placeholder',
      forcePlaceholderSize: true,
      update: function (ev, ui) {

      },
      stop: function (ev, ui) {

      }
  };
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

  function isNumeric(n) {
    return !isNaN(parseInt(n, 10));
  }

  // Setup "render model" & defaults
  function init() {

    if (!$scope.model.config.contentStartNode)
        $scope.model.config.contentStartNode = -1;

    if (!$scope.model.config.mediaStartNode)
        $scope.model.config.mediaStartNode = -1;

    if (!$scope.model.config.multipleItems)
        $scope.model.config.multipleItems = false;

    $scope.model.config.maxItems = isNumeric($scope.model.config.maxItems) && $scope.model.config.maxItems !== 0 ? $scope.model.config.maxItems : Number.MAX_VALUE;

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

    if(!$scope.pickers) {
      $scope.pickers = [];
    }

    if (!$scope.model.value || !$scope.model.value.type) {
      var defaultType = "content";

      if($scope.model.config.defaultType) {
        defaultType = $scope.model.config.defaultType;
      }

      var pickerObj =  { "type": defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null } };
      $scope.pickers.push(pickerObj);
      console.log($scope.pickers);
      $scope.model.value = angular.toJson($scope.pickers, true);
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
