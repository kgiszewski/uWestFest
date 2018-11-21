using Newtonsoft.Json;

namespace UrlPicker.Umbraco.CustomEntities.Models
{
    public class CustomEntity
    {
        [JsonProperty("heading")]
        public string Heading { get; set; }
        [JsonProperty("url")]
        public string Url { get; set; }
    }
}
