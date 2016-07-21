namespace UrlPicker.Umbraco.Helpers
{
    using System.Collections.Generic;

    internal static class ConverterHelper
    {
        internal static IEnumerable<T> Yield<T>(this IEnumerable<T> source)
        {
            foreach (var element in source)
            {
                yield return element;
            }
        }
    }
}