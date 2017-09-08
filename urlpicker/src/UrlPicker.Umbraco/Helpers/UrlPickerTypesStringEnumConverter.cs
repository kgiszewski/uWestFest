using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace UrlPicker.Umbraco.Helpers
{
    public class UrlPickerTypesStringEnumConverter : StringEnumConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Models.UrlPicker.UrlPickerTypes);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            Models.UrlPicker.UrlPickerTypes type;
            if (Enum.TryParse(reader.Value.ToString(), true, out type))
            {
                return type;
            }
            else
            {
                return Models.UrlPicker.UrlPickerTypes.Custom;
            }
        }
    }
}
