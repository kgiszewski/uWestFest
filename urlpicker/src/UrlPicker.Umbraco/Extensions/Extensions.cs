using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Web;
using UrlPicker.Umbraco.PropertyConverters;

namespace UrlPicker.Umbraco.Extensions
{
    public static class Extensions
    {
        //lifted from the core as it is marked 'internal'
        public static bool DetectIsJson(this string input)
        {
            input = input.Trim();
            return input.StartsWith("{") && input.EndsWith("}")
                   || input.StartsWith("[") && input.EndsWith("]");
        }

        [Obsolete("You should use the property 'Target' instead.")]
        public static string GetUrlPickerTarget(this Models.UrlPicker picker)
        {
            if (picker == null)
                return "";

            return picker.Meta.NewWindow ? "_blank" : "";
        }

    public static IEnumerable<Models.UrlPicker> AsTyped(this UmbracoHelper helper, string json)
        {
            try
            {
                var pickers = JsonConvert.DeserializeObject<IEnumerable<Models.UrlPicker>>(json);

                var urlPickers = pickers as IList<Models.UrlPicker> ?? pickers.ToList();
                foreach (var picker in urlPickers)
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
                                picker.Name = picker.Meta.Title.IsNullOrWhiteSpace()
                                    ? picker.TypeData.Content.Name
                                    : picker.Meta.Title;
                            }
                            break;

                        case Models.UrlPicker.UrlPickerTypes.Media:
                            if (picker.TypeData.Media != null)
                            {
                                picker.Url = picker.TypeData.Media.Url;
                                picker.UrlAbsolute = picker.TypeData.Media.Url();
                                picker.Name = picker.Meta.Title.IsNullOrWhiteSpace()
                                    ? picker.TypeData.Media.Name
                                    : picker.Meta.Title;
                            }
                            break;

                        default:
                            picker.Url = picker.TypeData.Url;
                            picker.UrlAbsolute = picker.TypeData.Url;
                            picker.Name = picker.Meta.Title.IsNullOrWhiteSpace()
                                ? picker.TypeData.Url
                                : picker.Meta.Title;
                            break;
                    }
                }

                return urlPickers;
            }
            catch (Exception ex)
            {
                LogHelper.Error<UrlPickerValueConverter>(ex.Message, ex);
                return new List<Models.UrlPicker>();
            }
        }
    }
}