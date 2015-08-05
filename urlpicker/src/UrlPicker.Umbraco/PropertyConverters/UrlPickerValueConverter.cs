using System;
using System.Linq;
using UrlPicker.Umbraco.Models;
using UrlPicker.Umbraco.Extensions;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Web;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Logging;

namespace UrlPicker.Umbraco.PropertyConverters
{
    [PropertyValueType(typeof(UrlPicker.Umbraco.Models.UrlPicker))]
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
                    var urlPicker = JsonConvert.DeserializeObject<UrlPicker.Umbraco.Models.UrlPicker>(sourceString);

                    var helper = new UmbracoHelper(UmbracoContext.Current);

                    if (urlPicker.TypeData.ContentId != null)
                    {
                        urlPicker.TypeData.Content = helper.TypedContent(urlPicker.TypeData.ContentId);
                    }

                    if (urlPicker.TypeData.MediaId != null)
                    {
                        urlPicker.TypeData.Media = helper.TypedMedia(urlPicker.TypeData.MediaId);
                    }

                    switch (urlPicker.Type)
                    {
                        case UrlPicker.Umbraco.Models.UrlPicker.UrlPickerTypes.Content:

                            if (urlPicker.TypeData.Content != null)
                            {
                                urlPicker.Url = urlPicker.TypeData.Content.Url;
                                urlPicker.UrlAbsolute = urlPicker.TypeData.Content.UrlAbsolute();
                                urlPicker.Name = (urlPicker.Meta.Title.IsNullOrWhiteSpace()) ? urlPicker.TypeData.Content.Name : urlPicker.Meta.Title;
                            }                         
                            break;

                        case UrlPicker.Umbraco.Models.UrlPicker.UrlPickerTypes.Media:
                            if (urlPicker.TypeData.Media != null)
                            {
                                urlPicker.Url = urlPicker.TypeData.Media.Url;
                                urlPicker.UrlAbsolute = urlPicker.TypeData.Media.UrlAbsolute();
                                urlPicker.Name = (urlPicker.Meta.Title.IsNullOrWhiteSpace()) ? urlPicker.TypeData.Media.Name : urlPicker.Meta.Title;
                            }
                            break;

                        default:
                            urlPicker.Url = urlPicker.TypeData.Url;
                            urlPicker.UrlAbsolute = urlPicker.TypeData.Url;
                            urlPicker.Name = (urlPicker.Meta.Title.IsNullOrWhiteSpace()) ? urlPicker.TypeData.Url : urlPicker.Meta.Title;
                            break;
                    }

                    return urlPicker;
                }
                catch (Exception ex)
                {
                    LogHelper.Error<UrlPickerValueConverter>(ex.Message, ex);
                    return new UrlPicker.Umbraco.Models.UrlPicker();
                }
            }

            return sourceString;
        }
    }
}
