using System;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Web.Cache;
using System.Web.Script.Serialization;
using Umbraco.Core.Sync;

namespace UrlPicker.Umbraco.Cache
{
    public class Events : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            CacheRefresherBase<DataTypeCacheRefresher>.CacheUpdated += DataTypeCacheRefresher_Updated;
        }

        private void DataTypeCacheRefresher_Updated(DataTypeCacheRefresher sender, CacheRefresherEventArgs e)
        {
            if (e.MessageType == MessageType.RefreshByJson)
            {
                var payload = DeserializeFromJsonPayload((string)e.MessageObject);
                foreach (var item in payload)
                {
                    var cacheKey = string.Format("{0}{1}", Constants.Keys.CachePrefix, item.Id);
                    LocalCache.ClearLocalCacheItem(cacheKey);
                }
            }
        }

        private static JsonPayload[] DeserializeFromJsonPayload(string json)
        {
            var serializer = new JavaScriptSerializer();
            var jsonObject = serializer.Deserialize<JsonPayload[]>(json);
            return jsonObject;
        }

        private class JsonPayload
        {
            public Guid UniqueId { get; set; }
            public int Id { get; set; }
        }

    }
}
