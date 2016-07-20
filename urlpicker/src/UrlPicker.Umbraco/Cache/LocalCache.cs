using System;
using Umbraco.Core;

namespace UrlPicker.Umbraco.Cache
{
    internal static class LocalCache
    {
        internal static T GetLocalCacheItem<T>(string cacheKey)
        {
            var runtimeCache = ApplicationContext.Current.ApplicationCache.RuntimeCache;
            var cachedItem = runtimeCache.GetCacheItem(cacheKey);
            return (T) cachedItem;
        }

        internal static void InsertLocalCacheItem<T>(string cacheKey, Func<object> getCacheItem)
        {
            var runtimeCache = ApplicationContext.Current.ApplicationCache.RuntimeCache;
            runtimeCache.InsertCacheItem(cacheKey, getCacheItem);
        }
    }
}
