angular.module('umbraco').controller('UrlPickerController', function($scope, dialogService, entityResource, mediaHelper, angularHelper) {
  
  var currentDialog = null;

  var alreadyDirty = false;
  
  init();
  
  //get a reference to the current form
  $scope.form = $scope.form || angularHelper.getCurrentForm($scope);

  $scope.switchType = function(type, picker) {
    var index = $scope.pickers.indexOf(picker);
    $scope.pickers[index].type = type;
    //$scope.model.value.type = type;
  }

  $scope.resetType = function (type, picker) {
    var index = $scope.pickers.indexOf(picker);
      if (type == "content") {
          $scope.pickers[index].typeData.contentId = null;
          $scope.pickers[index].content = null;

          //$scope.model.value.typeData.contentId = null;
          //$scope.contentName = "";
          //$scope.content = null;
      } else if (type == "media") {
          $scope.pickers[index].typeData.mediaId = null;
          $scope.pickers[index].media = null;

          //$scope.model.value.typeData.mediaId = null;
          //$scope.mediaName = "";
          //$scope.media = null;
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

        picker.content = { "name": content.name, "icon": content.icon };

        //$scope.model.value.typeData.contentId = data.id;
        //$scope.contentName = getEntityName(data.id, "Document");

        picker.typeData.contentId = data.id;
      }
    });

    }
    
    //save the currently assigned dialog so it can be removed before a new one is created
    currentDialog = dialog;
  }
  
  $scope.getPickerIcon = function (picker) {
      var icon = "icon-anchor";
      
      if(!$scope.isEmpty(picker)) {
            if(picker.type == "content" && picker.content && picker.content.icon) {
                icon = picker.content.icon;
            }
            if(picker.type == "media" && picker.media && picker.media.icon) {
                icon = picker.media.icon;
            }
            if(picker.type == "url") {
                icon = "icon-link";
            } 
      }
      
      return icon; 
  }
  
  $scope.getPickerHeading = function (picker) {
      var title = "(no link)";
      
      if(!$scope.isEmpty(picker) && picker.typeData) {
            var metaTitle = picker.meta.title;
            
            if(picker.type == "content" && picker.content) {
                title = metaTitle || picker.content.name;
            }
            if(picker.type == "media" && picker.media) {
                title = metaTitle || picker.media.name;
            }
            if(picker.type == "url") {
                title = metaTitle || picker.typeData.url;
            }
      }
      
      return title;
  }
  
  //helper to check if picker is empty
  $scope.isEmpty = function (picker) {
      if (picker.type == "content") { 
          if(!isNullOrEmpty(picker.typeData.contentId)) {
             return false;
          }
      }
      if (picker.type == "media") {
          if(!isNullOrEmpty(picker.typeData.mediaId)) {
             return false;
          }
      }
      if (picker.type == "url") {
          if(!isNullOrEmpty(picker.typeData.url)) {
             return false;
          }
      }
      return true;
  }
  
  //helper that returns if an item can be sorted
  $scope.canSort = function () {
      return countVisible() > 1;
  }
  
  //helper that returns if an item can be disabled
  $scope.canDisable = function () {
      return $scope.model.config.enableDisabling;
  }
  
  $scope.enableDisable = function (picker, $event) {
      picker.disabled = !picker.disabled;
      // explicitly set the form as dirty when manipulating the enabled/disabled state of a picker
      $scope.setDirty();
      
      // On recent browsers, only $event.stopPropagation() is needed
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
  }

  //helpers for determining if a user can do something
  $scope.canAdd = function () {
      if(!$scope.model.config.multipleItems && countVisible() == 1) {
        return false;
      }
      return ($scope.model.config.maxItems > countVisible());
  }    

  //helper that returns if an item can be removed
  $scope.canRemove = function () {
      return countVisible() > 1;
  }
  
  // helper to force the current form into the dirty state
  $scope.setDirty = function () {
      if($scope.form) {
          $scope.form.$setDirty();
      }
  }

  $scope.addItem = function(picker, $event) {
    var defaultType = "content";
    var pickerObj = { "type": defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null } };

    if($scope.model.config.defaultType) {
      defaultType = $scope.model.config.defaultType;
    }
    
    if($scope.model.config.oneAtATime) {
        for (var i = 0; i < $scope.pickers.length; i++) { 
            $scope.pickers[i].active = false;
        }
    }
    
    if(picker != null) {
        var index = $scope.pickers.indexOf(picker);
        $scope.pickers.splice(index + 1, 0, pickerObj);
        $scope.pickers[index].active = false;
        $scope.pickers[index + 1].active = true;
    }
    else {
        $scope.pickers.push(pickerObj);
        $scope.pickers[$scope.pickers.length - 1].active = true;   
    }
    
      // explicitly set the form as dirty when manipulating the enabled/disabled state of a picker
      $scope.setDirty();
      
      // On recent browsers, only $event.stopPropagation() is needed
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
  }

  $scope.editItem = function(picker) {
      
    var index = $scope.pickers.indexOf(picker);
    var isActive = $scope.pickers[index].active;
    
    // collapse other panels
    if($scope.model.config.oneAtATime) {
      for (var i = 0; i < $scope.pickers.length; i++) { 
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
            $scope.setDirty();
      },
      stop: function (ev, ui) {

      }
  };
  
  //helper to count what is visible
  function countVisible()
  {
      return $scope.pickers.length;
  }
  
  function isNullOrEmpty(value)
  {
      return value == null || value == "";
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

  function isNumeric(n) {
    return !isNaN(parseInt(n, 10));
  }

  // Setup "render model" & defaults
  function init() {

    // content start node
    if (!$scope.model.config.contentStartNode)
        $scope.model.config.contentStartNode = -1;

    // media start node
    if (!$scope.model.config.mediaStartNode)
        $scope.model.config.mediaStartNode = -1;

    // multiple items
    if (!$scope.model.config.multipleItems || $scope.model.config.multipleItems == 0) {
        $scope.model.config.multipleItems = false;
    }
    else {
        $scope.model.config.multipleItems = true;
    }

    // enable/disable pickers
    if (!$scope.model.config.enableDisabling || $scope.model.config.enableDisabling == 0) {
        $scope.model.config.enableDisabling = false;
    }
    else {
        $scope.model.config.enableDisabling = true;
    }

    // one picker open at a time
    if (!$scope.model.config.oneAtATime || $scope.model.config.oneAtATime == 0) {
        $scope.model.config.oneAtATime = false;
    }
    else {
        $scope.model.config.oneAtATime = true;
    }

    // use picker icons
    if (!$scope.model.config.usePickerIcons || $scope.model.config.usePickerIcons == 0) {
        $scope.model.config.usePickerIcons = false;
    }
    else {
        $scope.model.config.usePickerIcons = true;
    }
    
    // max items
    if(!$scope.model.config.maxItems) {
        $scope.model.config.maxItems = Number.MAX_VALUE;
    }
    else {
        $scope.model.config.maxItems = isNumeric($scope.model.config.maxItems) && $scope.model.config.maxItems !== 0 && $scope.model.config.maxItems > 0 ? $scope.model.config.maxItems : Number.MAX_VALUE;
    }

    // allow only to select media images
    if (!$scope.model.config.mediaImagesOnly || $scope.model.config.mediaImagesOnly == 0) {
      $scope.model.config.mediaImagesOnly = false;
    }
    else {
      $scope.model.config.mediaImagesOnly = true;
    }

    // use media preview
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
      
      console.log($scope.pickers);
      $scope.pickers.push(pickerObj);
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
