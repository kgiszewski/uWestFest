using System;
using UrlPicker.Umbraco.Extensions;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Web;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Logging;
using System.Collections;
using System.Collections.Generic;

namespace UrlPicker.Umbraco.PropertyConverters
{
    [PropertyValueType(typeof(IEnumerable<UrlPicker.Umbraco.Models.UrlPicker>))]
    [PropertyValueCache(PropertyCacheValue.All, PropertyCacheLevel.Content)]
    public class UrlPickerValueConverter : PropertyValueConverterBase
    {
        public override bool IsConverter(PublishedPropertyType propertyType)
        {
            return propertyType.PropertyEditorAlias.Equals("Imulus.UrlPicker");
        }

        public override object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
        {
            if (source == null)
            {
                return new UrlPicker.Umbraco.Models.UrlPicker();
            }

            var sourceString = source.ToString();

            if (sourceString.DetectIsJson())
            {
                try
                {
                    var pickers = JsonConvert.DeserializeObject<IEnumerable<Models.UrlPicker>>(sourceString);

                    var helper = new UmbracoHelper(UmbracoContext.Current);

                    foreach (var picker in pickers)
                    {
                        if (picker.TypeData.ContentId != null)
                        {
                            picker.TypeData.Content = helper.TypedContent(picker.TypeData.ContentId);
                        }

                        if (picker.TypeData.MediaId != null)
                        {
                            picker.TypeData.Media = helper.TypedMedia(picker.TypeData.MediaId);
                        }

                        switch (picker.Type)
                        {
                            case Models.UrlPicker.UrlPickerTypes.Content:

                                if (picker.TypeData.Content != null)
                                {
                                    picker.Url = picker.TypeData.Content.Url;
                                    picker.UrlAbsolute = picker.TypeData.Content.UrlAbsolute();
                                    picker.Name = (picker.Meta.Title.IsNullOrWhiteSpace()) ? picker.TypeData.Content.Name : picker.Meta.Title;
                                }                         
                                break;

                            case Models.UrlPicker.UrlPickerTypes.Media:
                                if (picker.TypeData.Media != null)
                                {
                                    picker.Url = picker.TypeData.Media.Url;
                                    picker.UrlAbsolute = picker.TypeData.Media.Url();
                                    picker.Name = (picker.Meta.Title.IsNullOrWhiteSpace()) ? picker.TypeData.Media.Name : picker.Meta.Title;
                                }
                                break;

                            default:
                                picker.Url = picker.TypeData.Url;
                                picker.UrlAbsolute = picker.TypeData.Url;
                                picker.Name = (picker.Meta.Title.IsNullOrWhiteSpace()) ? picker.TypeData.Url : picker.Meta.Title;
                                break;
                        }

                    }

                    return pickers;
                }
                catch (Exception ex)
                {
                    LogHelper.Error<UrlPickerValueConverter>(ex.Message, ex);
                    return new List<UrlPicker.Umbraco.Models.UrlPicker>();
                }
            }

            return sourceString;
        }
    }
}
