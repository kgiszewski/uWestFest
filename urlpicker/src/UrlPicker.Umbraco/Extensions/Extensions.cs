using System;

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

            return (picker.Meta.NewWindow) ? "_blank" : "";
        }
    }
}
