declare namespace Immulus {

    interface IControlEditor {
        config: IPickerConfig;
    }

    interface IPickerModel {
        value: string;
        config: IPickerConfig;
    }

    interface IGridControl {
        value: string;
        editor: IControlEditor;
    }

    interface IPickerConfig {
        hideTitle: boolean;
        hideOpenNew: boolean;
        hideUrl: boolean;
        hideContent: boolean;
        hideMedia: boolean;
        defaultType: string;
        contentStartNode: number;
        mediaStartNode: number;
        multipleItems: boolean;
        startWithAddButton: boolean;
        enableDisabling: boolean;
        oneAtATime: boolean;
        usePickerIcons: boolean;
        maxItems: number;
        mediaImagesOnly: boolean;
        mediaPreview: boolean;
    }

    interface IPickerTypeData {
        url: string;
        contentId: number;
        mediaId: number;
    }

    interface IUrlMetaData {
        title: string;
        newWindow: boolean;
    }

    interface IUrlPicker {
        type: string;
        meta: IUrlMetaData;
        typeData: IPickerTypeData;
        disabled: boolean;
        content?: any;
        media?: any;
        active: boolean;
        error: string;
    }

}
