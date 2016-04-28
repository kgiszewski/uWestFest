angular.module('umbraco').controller('UrlPickerController', function ($scope, $timeout, dialogService, entityResource, mediaHelper, angularHelper, iconHelper, localizationService) {

    var currentDialog = null;
    var alreadyDirty = false;
    
    init();

    //get a reference to the current form
    $scope.form = $scope.form || angularHelper.getCurrentForm($scope);

    $scope.switchType = function (type, picker) {
        var index = $scope.pickers.indexOf(picker);
        $scope.pickers[index].type = type;
    }

    $scope.resetType = function (type, picker) {
        var index = $scope.pickers.indexOf(picker);
        if (type == "content") {
            $scope.pickers[index].typeData.contentId = null;
            $scope.pickers[index].content = null;
        } else if (type == "media") {
            $scope.pickers[index].typeData.mediaId = null;
            $scope.pickers[index].media = null;
        } else {
            $scope.pickers[index].typeData.url = "";
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
                callback: function (data) {

                    var media = data;
                    console.log("media", media);

                    //only show non-trashed items
                    if (media.parentId >= -1) {

                        if (!media.thumbnail) {
                            media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
                        }

                        picker.media = { "name": media.name, "thumbnail": media.thumbnail, "icon": getSafeIcon(media.icon) };
                        picker.typeData.mediaId = media.id;
                    }

                    $scope.sync();
                    $scope.setDirty();
                }

            });
        } else {

            dialog = dialogService.treePicker({
                section: type,
                treeAlias: type,
                startNodeId: getStartNodeId(type),
                multiPicker: false,
                callback: function (data) {

                    var content = data;

                    picker.content = { "name": content.name, "icon": getSafeIcon(content.icon) };
                    picker.typeData.contentId = content.id;
                    
                    $scope.sync();
                    $scope.setDirty();
                }
            });

        }

        //save the currently assigned dialog so it can be removed before a new one is created
        currentDialog = dialog;
    }

    $scope.getPickerIcon = function (picker) {
        var icon = "icon-anchor";

        if (!$scope.isEmpty(picker)) {
            if (picker.type == "content" && picker.content && picker.content.icon) {
                icon = picker.content.icon;
            }
            if (picker.type == "media" && picker.media && picker.media.icon) {
                icon = picker.media.icon;
            }
            if (picker.type == "url") {
                icon = "icon-link";
            }
        }

        return icon;
    }

    $scope.getPickerHeading = function (picker) {
        var title = "(no link)";

        if (!$scope.isEmpty(picker) && picker.typeData) {
            var metaTitle = picker.meta.title;

            if (picker.type == "content" && picker.content) {
                title = metaTitle || picker.content.name;
            }
            if (picker.type == "media" && picker.media) {
                title = metaTitle || picker.media.name;
            }
            if (picker.type == "url") {
                title = metaTitle || picker.typeData.url;
            }
        }

        return title;
    }

    //helper to check if picker is empty
    $scope.isEmpty = function (picker) {
        if (picker.type == "content") {
            if (!isNullOrEmpty(picker.typeData.contentId)) {
                return false;
            }
        }
        if (picker.type == "media") {
            if (!isNullOrEmpty(picker.typeData.mediaId)) {
                return false;
            }
        }
        if (picker.type == "url") {
            if (!isNullOrEmpty(picker.typeData.url)) {
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

    //helpers for determining if the add button should be shown
    $scope.showAddButton = function () {
        return $scope.model.config.startWithAddButton && countVisible() === 0;
    }

    $scope.enableDisable = function (picker, $event) {
        picker.disabled = picker.disabled ? false : true;
        $scope.sync();
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
        if (!$scope.model.config.multipleItems && countVisible() == 1) {
            return false;
        }
        return ($scope.model.config.maxItems > countVisible());
    }

    //helper that returns if an item can be removed
    $scope.canRemove = function () {
        return countVisible() > 1 || $scope.model.config.startWithAddButton;
    }

    // helper to force the current form into the dirty state
    $scope.setDirty = function () {
        if ($scope.form) {
            $scope.form.$setDirty();
        }
    }

    $scope.addItem = function (picker, $event) {
        var defaultType = "content";
        if ($scope.model.config.defaultType) {
            defaultType = $scope.model.config.defaultType;
        }
        
        var pickerObj = { "type": defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null}, "disabled": false };

        // collapse other panels
        if ($scope.model.config.oneAtATime) {
            for (var i = 0; i < $scope.pickers.length; i++) {
                $scope.pickers[i].active = false;
            }
        }

        if (picker != null) {
            var index = $scope.pickers.indexOf(picker);
            $scope.pickers.splice(index + 1, 0, pickerObj);
            $scope.pickers[index].active = false;
            $scope.pickers[index + 1].active = true;
        }
        else {
            $scope.pickers.push(pickerObj);
            $scope.pickers[$scope.pickers.length - 1].active = true;
        }

        console.log("$scope.sync()");
        $scope.sync();

        // explicitly set the form as dirty when manipulating the enabled/disabled state of a picker
        $scope.setDirty();

        // On recent browsers, only $event.stopPropagation() is needed
        if ($event.stopPropagation) $event.stopPropagation();
        if ($event.preventDefault) $event.preventDefault();
        $event.cancelBubble = true;
        $event.returnValue = false;
    }

    $scope.editItem = function (picker) {

        var index = $scope.pickers.indexOf(picker);
        var isActive = $scope.pickers[index].active;

        // collapse other panels
        if ($scope.model.config.oneAtATime) {
            for (var i = 0; i < $scope.pickers.length; i++) {
                if (i !== index || isActive) {
                    $scope.pickers[i].active = false;
                }
            }
        }

        if (!isActive) {
            $scope.pickers[index].active = true;
        } else {
            $scope.pickers[index].active = false;
        }

    }

    $scope.removeItem = function (picker, $event) {
        var index = $scope.pickers.indexOf(picker);
        if (confirm('Are you sure you want to remove this item?')) {
            $scope.pickers.splice(index, 1);
            $scope.sync();
            $scope.setDirty();
        }

        // On recent browsers, only $event.stopPropagation() is needed
        if ($event.stopPropagation) $event.stopPropagation();
        if ($event.preventDefault) $event.preventDefault();
        $event.cancelBubble = true;
        $event.returnValue = false;
    }

    //sort config
    $scope.sortableOptions = {
        axis: 'y',
        cursor: "move",
        //cursorAt: { top: height / 2, left: width / 2 },
        handle: ".handle",
        cancel: ".no-drag",
        //containment: "parent", // it seems to be an issue to use containment, when sortable items not have same height
        tolerance: 'intersect', //'pointer'
        items: "> li:not(.unsortable)",
        placeholder: 'sortable-placeholder',
        forcePlaceholderSize: true,
        start: function (ev, ui) {
            //var panelHeight = $(ui.item).find(".panel").height();

            //ui.placeholder.height(ui.item.height());
            //ui.placeholder.width(ui.item.width());
            var height = ui.item.height();
            var width = ui.item.width();

            $(ui.helper.item).draggable("option", "cursorAt", {
                left: Math.floor(width / 2),
                top: Math.floor(height / 2)
            });
        },
        update: function (ev, ui) {
            $scope.setDirty();
        },
        stop: function (ev, ui) {

        }
    };

    //helper to count what is visible
    function countVisible() {
        return $scope.pickers.length;
    }

    // helper to get initial model if none was provided
    function getDefaultModel(config) {
        if (config.startWithAddButton)
            return [];

        return [{ "type": config.defaultType, "meta": { "title": "", "newWindow": false }, "typeData": { "url": "", "contentId": null, "mediaId": null}, "disabled": false }]; //[getEmptyRenderFieldset(config.fieldsets[0])] };
    }

    function isNullOrEmpty(value) {
        return value == null || value == "";
    }
    
    function getSafeIcon(icon) {
        // fix icon if it is a legacy icon
        if (iconHelper.isLegacyIcon(icon)) {
            return iconHelper.convertFromLegacyIcon(icon);
        }
        return icon;
    }

    function getStartNodeId(type) {
        if (type == "content") {
            return $scope.model.config.contentStartNode
        } else {
            return $scope.model.config.mediaStartNode
        }
    }

    function getEntityName(id, typeAlias) {
        if (!id) {
            return "";
        }

        return entityResource.getById(id, typeAlias).then(function (entity) {
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

        // default type
        if ($scope.model.config.defaultType) {
            defaultType = $scope.model.config.defaultType;
        } else {
            defaultType = "content";
        }

        // start with add-button
        if (!$scope.model.config.startWithAddButton || $scope.model.config.startWithAddButton == 0) {
            $scope.model.config.startWithAddButton = false;
        }
        else {
            $scope.model.config.startWithAddButton = true;
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
        if (!$scope.model.config.maxItems) {
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
        }
        
        $scope.enableTooltip = localizationService.localize("urlPicker_enable");
        $scope.disableTooltip = localizationService.localize("urlPicker_disable");

        $scope.pickers = $scope.model.value ? angular.fromJson($scope.model.value) : getDefaultModel($scope.model.config);
        
        // init media and content name and icon from typeData id's
        angular.forEach($scope.pickers, function (obj) {
            var contentId;
            var mediaId;
                
            if(obj.typeData) {
                if (obj.typeData.contentId) {
                    contentId = obj.typeData.contentId;
                };
                if (obj.typeData.mediaId) {
                    mediaId = obj.typeData.mediaId;
                };   
            }
            
            if (contentId) {
                entityResource.getById(contentId, "Document").then(function (content) {
                    //only show non-trashed items
                    if (content.parentId >= -1) {
                        obj.content = { "name": content.name, "icon": getSafeIcon(content.icon) };
                    }
                });
            }
            
            if (mediaId) {
                entityResource.getById(mediaId, "Media").then(function (media) {
                    //only show non-trashed items
                    if (media.parentId >= -1) {

                        if (!media.thumbnail) {
                            media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
                        }

                        obj.media = { "name": media.name, "thumbnail": media.thumbnail, "icon": getSafeIcon(media.icon) };
                    }
                });
                //Todo: handle scenario where selected media has been deleted
            }
        });
        
    }

    $scope.sync = function () {
        var array = $scope.pickers ? angular.copy($scope.pickers) : [];
        array.forEach(function (v) {
            delete v.active;
            //delete v.disabled;
            delete v.media;
            delete v.content;
        });

        $scope.model.value = angular.toJson(array, true);
    };
});