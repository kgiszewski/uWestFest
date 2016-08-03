using System;
using UrlPicker.Umbraco.Extensions;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Web;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Logging;
using System.Collections.Generic;
using System.Linq;
using UrlPicker.Umbraco.Cache;
using UrlPicker.Umbraco.Helpers;

namespace UrlPicker.Umbraco.PropertyConverters
{
    public class UrlPickerValueConverter : PropertyValueConverterBase, IPropertyValueConverterMeta
    {
        public override bool IsConverter(PublishedPropertyType propertyType)
        {
            return propertyType.PropertyEditorAlias.Equals("Imulus.UrlPicker");
        }

        public override object ConvertSourceToObject(PublishedPropertyType propertyType, object source, bool preview)
        {
            if (source == null)
            {
                return new Models.UrlPicker();
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
                    if (IsMultipleDataType(propertyType.DataTypeId))
                    {
                        return pickers.Yield().Where(x => x != null);
                    }
                    else
                    {
                        return pickers.FirstOrDefault();
                    }
                        
                }
                catch (Exception ex)
                {
                    LogHelper.Error<UrlPickerValueConverter>(ex.Message, ex);
                    if (IsMultipleDataType(propertyType.DataTypeId))
                    {
                        return Enumerable.Empty<Models.UrlPicker>();
                    }
                    else
                    {
                        return new Models.UrlPicker();
                    }
                }
            }

            return sourceString;
        }

        public Type GetPropertyValueType(PublishedPropertyType propertyType)
        {
            return IsMultipleDataType(propertyType.DataTypeId) ? typeof(IEnumerable<Models.UrlPicker>) : typeof(Models.UrlPicker);
        }

        public PropertyCacheLevel GetPropertyCacheLevel(PublishedPropertyType propertyType, PropertyCacheValue cacheValue)
        {
            PropertyCacheLevel returnLevel;
            switch (cacheValue)
            {
                case PropertyCacheValue.Object:
                    returnLevel = PropertyCacheLevel.ContentCache;
                    break;
                case PropertyCacheValue.Source:
                    returnLevel = PropertyCacheLevel.Content;
                    break;
                case PropertyCacheValue.XPath:
                    returnLevel = PropertyCacheLevel.Content;
                    break;
                default:
                    returnLevel = PropertyCacheLevel.None;
                    break;
            }

            return returnLevel;
        }

        /// <summary>
        /// The is multiple data type.
        /// </summary>
        /// <param name="dataTypeId">
        /// The data type id.
        /// </param>
        /// <returns>
        /// The <see cref="bool"/>.
        /// </returns>
        private bool IsMultipleDataType(int dataTypeId)
        {
            var cacheKey = string.Format("{0}{1}", Constants.Keys.CachePrefix, dataTypeId);

            var cachedValue = LocalCache.GetLocalCacheItem<bool?>(cacheKey);
            if (cachedValue != null)
            {
                return (bool) cachedValue;
            }

            var dts = ApplicationContext.Current.Services.DataTypeService;

            var multiPickerPreValue =
                dts.GetPreValuesCollectionByDataTypeId(dataTypeId)
                    .PreValuesAsDictionary.FirstOrDefault(
                        x => string.Equals(x.Key, "multipleItems", StringComparison.InvariantCultureIgnoreCase)).Value;

            var multipleItems = false;

            var attemptConvert = multiPickerPreValue.Value.TryConvertTo<bool>();

            if (attemptConvert.Success)
            {
                multipleItems = attemptConvert.Result;
            }

            LocalCache.InsertLocalCacheItem<bool>(cacheKey, () => multipleItems);
            return multipleItems;
        }
    }
}
