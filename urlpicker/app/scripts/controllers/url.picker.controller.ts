module UrlPicker.Controllers {
    "use strict";
    export class ModelWrapper implements Immulus.IPickerModel {
        private gridControl: Immulus.IGridControl;
        private pickerConfig: Immulus.IPickerConfig;

        constructor(control: Immulus.IGridControl) {
            this.gridControl = control;
            this.pickerConfig = control.editor.config;
        }
        get config(): Immulus.IPickerConfig {
            return this.pickerConfig;
        }
        set config(value: Immulus.IPickerConfig) {
            this.pickerConfig = value;
        }
        get control(): Immulus.IGridControl {
            return this.gridControl;
        }
        set control(value: Immulus.IGridControl) {
            this.gridControl = value;
        }
        get value(): string {
            return this.gridControl.value;
        }
        set value(value: string) {
            this.gridControl.value = value;
        }
    }

    interface IUrlPickerControllerScope extends ng.IScope {
        model: ModelWrapper;
        pickers: Immulus.IUrlPicker[];
        control: Immulus.IGridControl;
        form: ng.IFormController;
        enableTooltip: boolean;
        disableTooltip: boolean;
        switchType(type: string, picker: Immulus.IUrlPicker): void;
        resetType(type: string, picker: Immulus.IUrlPicker): void;
        openTreePicker(type: string, picker: Immulus.IUrlPicker): void;
        setDirty(): void;
        sync(): void;
        getPickerIcon: (picker: Immulus.IUrlPicker) => string;
        isEmpty(picker: Immulus.IUrlPicker);
        getPickerHeading: (picker: Immulus.IUrlPicker) => string;
        canSort: () => boolean;
        canDisable: () => boolean;
        showAddButton: () => boolean;
        enableDisable: (picker: Immulus.IUrlPicker, $event: any) => void;
        canAdd: () => boolean;
        canRemove: () => boolean;
        addItem: (picker: Immulus.IUrlPicker, $event: any) => void;
        editItem: (picker: Immulus.IUrlPicker) => void;
        removeItem: (picker: Immulus.IUrlPicker, $event: any) => void;
        sortableOptions: {
            axis: string;
            cursor: string;
            handle: string;
            cancel: string;
            tolerance: string;
            items: string;
            placeholder: string;
            forcePlaceholderSize: boolean;
            start: (ev: any, ui: any) => void;
            update: (ev: any, ui: any) => void;
            stop: (ev: any, ui: any) => void;
        };
    }


    export class UrlPickerController {
        static $inject = [
            "$scope", "$timeout", "dialogService", "entityResource", "mediaHelper", "angularHelper", "iconHelper",
            "localizationService"
        ];


        constructor(private $scope: IUrlPickerControllerScope,
            $timeout: any,
            dialogService: umbraco.services.IDialogService,
            entityResource: umbraco.resources.IEntityResource,
            mediaHelper: umbraco.services.IMediaHelper,
            angularHelper: umbraco.services.IAngularHelper,
            iconHelper: any, // todo: umbraco.services.IIconHelper
            localizationService: any // todo: umbraco.services.ILocalizationService
        ) {
            if ($scope.control) {
                let model = new ModelWrapper($scope.control);
                $scope.model = model;
            }

            let currentDialog: umbraco.services.IModal = null;
            init();

            // get a reference to the current form
            $scope.form = $scope.form || angularHelper.getCurrentForm($scope);

            $scope.switchType = (type: string, picker: Immulus.IUrlPicker) => {
                const index = $scope.pickers.indexOf(picker);
                $scope.pickers[index].type = type;
            };
            $scope.resetType = (type: string, picker: Immulus.IUrlPicker) => {
                const index = $scope.pickers.indexOf(picker);
                if (type === "content") {
                    $scope.pickers[index].typeData.contentId = null;
                    $scope.pickers[index].content = null;
                } else if (type === "media") {
                    $scope.pickers[index].typeData.mediaId = null;
                    $scope.pickers[index].media = null;
                } else {
                    $scope.pickers[index].typeData.url = "";
                }
                delete $scope.pickers[index].error;
            };
            $scope.openTreePicker = (type: string, picker: Immulus.IUrlPicker) => {

                // ensure the current dialog is cleared before creating another!
                if (currentDialog) {
                    dialogService.close(currentDialog);
                }

                let dialog: umbraco.services.IModal;

                if (type === "media") {
                    dialog = dialogService.mediaPicker(({
                        callback: (data: any) => {

                            delete picker.error;
                            const media = data;

                            // only show non-trashed items
                            if (media.parentId >= -1) {

                                if (!media.thumbnail) {
                                    media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
                                }

                                picker.media = {
                                    "name": media.name,
                                    "thumbnail": media.thumbnail,
                                    "icon": getSafeIcon(media.icon)
                                };
                                picker.typeData.mediaId = media.id;
                            }

                            $scope.setDirty();
                        },
                        multiPicker: false,
                        onlyImages: $scope.model.config.mediaImagesOnly
                    }) as any);
                } else {

                    dialog = dialogService.treePicker({
                        callback: (data: any) => {

                            delete picker.error;
                            const content = data;

                            picker.content = { "name": content.name, "icon": getSafeIcon(content.icon) };
                            picker.typeData.contentId = content.id;

                            $scope.setDirty();
                        },
                        multiPicker: false,
                        section: type,
                        startNodeId: getStartNodeId(type),
                        treeAlias: type
                    });

                }

                // save the currently assigned dialog so it can be removed before a new one is created
                currentDialog = dialog;
            };
            $scope.getPickerIcon = (picker: Immulus.IUrlPicker) => {
                let icon = "icon-anchor";

                if (!$scope.isEmpty(picker)) {
                    if (picker.type === "content" && picker.content && picker.content.icon) {
                        icon = picker.content.icon;
                    }
                    if (picker.type === "media" && picker.media && picker.media.icon) {
                        icon = picker.media.icon;
                    }
                    if (picker.type === "url") {
                        icon = "icon-link";
                    }
                    if (!isNullOrEmpty(picker.error)) {
                        icon = "color-red icon-application-error";
                    }
                }

                return icon;
            };
            $scope.getPickerHeading = (picker: Immulus.IUrlPicker) => {
                let title = "(no link)";

                if (!$scope.isEmpty(picker) && picker.typeData) {
                    const metaTitle = picker.meta.title;

                    if (picker.type === "content" && picker.content) {
                        title = metaTitle || picker.content.name;
                    }
                    if (picker.type === "media" && picker.media) {
                        title = metaTitle || picker.media.name;
                    }
                    if (picker.type === "url") {
                        title = metaTitle || picker.typeData.url;
                    }
                }
                if (!isNullOrEmpty(picker.error)) {
                    title = picker.error;
                }
                return title;
            };

            // helper to check if picker is empty
            $scope.isEmpty = (picker: Immulus.IUrlPicker) => {
                if (picker.type === "content") {
                    if (!isNullOrEmpty(picker.typeData.contentId)) {
                        return false;
                    }
                }
                if (picker.type === "media") {
                    if (!isNullOrEmpty(picker.typeData.mediaId)) {
                        return false;
                    }
                }
                if (picker.type === "url") {
                    if (!isNullOrEmpty(picker.typeData.url)) {
                        return false;
                    }
                }
                return true;
            };

            // helper that returns if an item can be sorted
            $scope.canSort = () => (countVisible() > 1);

            // helper that returns if an item can be disabled
            $scope.canDisable = () => $scope.model.config.enableDisabling;

            // helpers for determining if the add button should be shown
            $scope.showAddButton = () => ($scope.model.config.startWithAddButton && countVisible() === 0);
            $scope.enableDisable = (picker: Immulus.IUrlPicker, $event: any) => {
                picker.disabled = !picker.disabled;

                // explicitly set the form as dirty when manipulating the enabled/disabled state of a picker
                $scope.setDirty();

                // on recent browsers, only $event.stopPropagation() is needed
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
                if ($event.preventDefault) {
                    $event.preventDefault();
                }
                $event.cancelBubble = true;
                $event.returnValue = false;
            };

            // helpers for determining if a user can do something
            $scope.canAdd = () => {
                if (!$scope.model.config.multipleItems && countVisible() === 1) {
                    return false;
                }
                return ($scope.model.config.maxItems > countVisible());
            };

            // helper that returns if an item can be removed
            $scope.canRemove = () => (countVisible() > 1 || $scope.model.config.startWithAddButton);

            // helper to force the current form into the dirty state
            $scope.setDirty = () => {
                $scope.sync();
                if ($scope.form) {
                    $scope.form.$setDirty();
                }
            };
            $scope.addItem = (picker: Immulus.IUrlPicker, $event: any) => {
                let defaultType = "content";
                if ($scope.model.config.defaultType) {
                    defaultType = $scope.model.config.defaultType;
                }

                const pickerObj = {
                    "type": defaultType,
                    "meta": { "title": "", "newWindow": false },
                    "typeData": { "url": "", "contentId": null, "mediaId": null },
                    "disabled": false,
                    "active": true, "error": ""
                };

                // collapse other panels
                if ($scope.model.config.oneAtATime) {
                    for (let i = 0; i < $scope.pickers.length; i++) {
                        $scope.pickers[i].active = false;
                    }
                }

                if (picker != null) {
                    const index = $scope.pickers.indexOf(picker);
                    $scope.pickers.splice(index + 1, 0, pickerObj);
                    $scope.pickers[index].active = false;
                    $scope.pickers[index + 1].active = true;
                } else {
                    $scope.pickers.push(pickerObj);
                    $scope.pickers[$scope.pickers.length - 1].active = true;
                }

                // explicitly set the form as dirty when manipulating the enabled/disabled state of a picker
                $scope.setDirty();

                // on recent browsers, only $event.stopPropagation() is needed
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
                if ($event.preventDefault) {
                    $event.preventDefault();
                }
                $event.cancelBubble = true;
                $event.returnValue = false;
            };
            $scope.editItem = (picker: Immulus.IUrlPicker) => {

                const index = $scope.pickers.indexOf(picker);
                const isActive = $scope.pickers[index].active;

                // collapse other panels
                if ($scope.model.config.oneAtATime) {
                    for (let i = 0; i < $scope.pickers.length; i++) {
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

            };
            $scope.removeItem = (picker: Immulus.IUrlPicker, $event: any) => {
                const index = $scope.pickers.indexOf(picker);
                if (confirm("Are you sure you want to remove this item?")) {
                    $scope.pickers.splice(index, 1);
                    $scope.setDirty();
                }

                // on recent browsers, only $event.stopPropagation() is needed
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
                if ($event.preventDefault) {
                    $event.preventDefault();
                }
                $event.cancelBubble = true;
                $event.returnValue = false;
            };

            // sort config
            $scope.sortableOptions = {
                axis: "y",
                cancel: ".no-drag",
                // containment: "parent", // it seems to be an issue to use containment, when sortable items not have same height
                cursor: "move",
                // cursorAt: { top: height / 2, left: width / 2 },
                forcePlaceholderSize: true,
                handle: ".handle",
                items: "> li:not(.unsortable)",
                placeholder: "sortable-placeholder",
                start: (ev: any, ui: any) => {
                    // var panelHeight = $(ui.item).find(".panel").height();

                    // ui.placeholder.height(ui.item.height());
                    // ui.placeholder.width(ui.item.width());
                    const height = ui.item.height();
                    const width = ui.item.width();

                    $(ui.helper.item)
                        .draggable("option",
                        "cursorAt",
                        {
                            left: Math.floor(width / 2),
                            top: Math.floor(height / 2)
                        });
                },
                stop: () => {
                    return;
                },
                tolerance: "intersect", // 'pointer'
                update: () => {
                    $scope.setDirty();
                }
            };

            // helper to count what is visible
            function countVisible() {
                return $scope.pickers.length;
            }

            // helper to get initial model if none was provided
            function getDefaultModel(config: Immulus.IPickerConfig) {
                if (config.startWithAddButton) {
                    return [];
                }
                return [
                    {
                        "type": config.defaultType,
                        "meta": { "title": "", "newWindow": false },
                        "typeData": { "url": "", "contentId": null, "mediaId": null },
                        "disabled": false,
                        "active": true, "error": ""
                    }
                ]; // [getEmptyRenderFieldset(config.fieldsets[0])] };
            }

            function isNullOrEmpty(value: any) {
                return value == null || value === "";
            }

            function getSafeIcon(icon: any) {
                // fix icon if it is a legacy icon
                if (iconHelper.isLegacyIcon(icon)) {
                    return iconHelper.convertFromLegacyIcon(icon);
                }
                return icon;
            }

            function getStartNodeId(type: string) {
                if (type === "content") {
                    return $scope.model.config.contentStartNode;
                } else {
                    return $scope.model.config.mediaStartNode;
                }
            }

            // function getEntityName(id, typeAlias) {
            //    if (!id) {
            //        return "";
            //    }

            //    return entityResource.getById(id, typeAlias).then(function (entity) {
            //        return entity.data.name;
            //    });
            // }

            function isNumeric(n: any) {
                return !isNaN(parseInt(n, 10));
            }

            // setup "render model" & defaults
            function init() {
                let defaultType: string;
                // content start node
                if (!$scope.model.config.contentStartNode) {
                    $scope.model.config.contentStartNode = -1;
                }
                // media start node
                if (!$scope.model.config.mediaStartNode) {
                    $scope.model.config.mediaStartNode = -1;
                }

                // multiple items
                if (!$scope.model.config.multipleItems) {
                    $scope.model.config.multipleItems = false;
                } else {
                    $scope.model.config.multipleItems = true;
                }

                // default type
                if ($scope.model.config.defaultType) {
                    defaultType = $scope.model.config.defaultType;
                } else {
                    defaultType = "content";
                }

                // start with add-button
                if (!$scope.model.config.startWithAddButton) {
                    $scope.model.config.startWithAddButton = false;
                } else {
                    $scope.model.config.startWithAddButton = true;
                }

                // enable/disable pickers
                if (!$scope.model.config.enableDisabling) {
                    $scope.model.config.enableDisabling = false;
                } else {
                    $scope.model.config.enableDisabling = true;
                }

                // one picker open at a time
                if (!$scope.model.config.oneAtATime) {
                    $scope.model.config.oneAtATime = false;
                } else {
                    $scope.model.config.oneAtATime = true;
                }

                // use picker icons
                if (!$scope.model.config.usePickerIcons) {
                    $scope.model.config.usePickerIcons = false;
                } else {
                    $scope.model.config.usePickerIcons = true;
                }

                // max items
                if (!$scope.model.config.maxItems) {
                    $scope.model.config.maxItems = Number.MAX_VALUE;
                } else {
                    $scope.model.config.maxItems = isNumeric($scope.model.config.maxItems) &&
                        $scope.model.config.maxItems !== 0 &&
                        $scope.model.config.maxItems > 0
                        ? $scope.model.config.maxItems
                        : Number.MAX_VALUE;
                }

                // allow only to select media images
                if (!$scope.model.config.mediaImagesOnly) {
                    $scope.model.config.mediaImagesOnly = false;
                } else {
                    $scope.model.config.mediaImagesOnly = true;
                }

                // use media preview
                if (!$scope.model.config.mediaPreview) {
                    $scope.model.config.mediaPreview = false;
                } else {
                    $scope.model.config.mediaPreview = true;
                }

                $scope.enableTooltip = localizationService.localize("urlPicker_enable");
                $scope.disableTooltip = localizationService.localize("urlPicker_disable");

                $scope.pickers = $scope.model.value
                    ? angular.fromJson($scope.model.value)
                    : getDefaultModel($scope.model.config);

                // init media and content name and icon from typeData id's
                angular.forEach($scope.pickers,
                    (picker: Immulus.IUrlPicker) => {
                        let contentId: number;
                        let mediaId: number;

                        if (picker.typeData) {
                            if (picker.typeData.contentId) {
                                contentId = picker.typeData.contentId;
                            };
                            if (picker.typeData.mediaId) {
                                mediaId = picker.typeData.mediaId;
                            };
                        }

                        if (contentId) {
                            entityResource.getById(contentId, "Document")
                                .then((content: any) => {
                                    // only show non-trashed items
                                    if (content.parentId >= -1) {
                                        picker.content = {
                                            "name": content.name,
                                            "icon": getSafeIcon(content.icon)
                                        };
                                    }
                                },
                                (error: any) => {
                                    picker.error = error.errorMsg;
                                });
                        }
                        if (mediaId) {
                            entityResource.getById(mediaId, "Media")
                                .then((media: any) => {
                                    // only show non-trashed items
                                    if (media.parentId >= -1) {

                                        if (!media.thumbnail) {
                                            media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
                                        }

                                        picker.media = {
                                            "name": media.name,
                                            "thumbnail": media.thumbnail,
                                            "icon": getSafeIcon(media.icon)
                                        };
                                    }
                                },
                                (error: any) => {
                                    picker.error = error.errorMsg;
                                });
                        };
                    });
            }
            $scope.sync = () => {
                const array = $scope.pickers ? angular.copy($scope.pickers) : [];
                array.forEach((v: any) => {
                    delete v.active;
                    // delete v.disabled;
                    delete v.media;
                    delete v.content;
                    if (v.error) {
                        delete v.error;
                    }
                });

                $scope.model.value = angular.toJson(array, true);
            };

        }

    }

    angular.module("umbraco").controller("UrlPicker.Controllers", UrlPickerController);
}
