using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web;
using UrlPicker.Umbraco.Extensions;

namespace UrlPicker.Umbraco.PropertyConverters
{
    [PropertyValueType(typeof(Models.UrlPicker))]
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
                return new Models.UrlPicker();
            }

            var sourceString = source.ToString();

            if (sourceString.DetectIsJson())
            {
                var helper = new UmbracoHelper(UmbracoContext.Current);
                var pickers = helper.AsTyped(sourceString);

                return pickers;
            }

            return sourceString;
        }
    }
}
