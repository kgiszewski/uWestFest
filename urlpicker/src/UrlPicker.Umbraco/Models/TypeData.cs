using Umbraco.Core.Models;

namespace UrlPicker.Umbraco.Models
{
    public class TypeData
    {
        public string Url { get; set; }
        public int? ContentId { get; set; }
        public IPublishedContent Content { get; set; }
        public int? MediaId { get; set; }
        public IPublishedContent Media { get; set; }
        public string Anchor { get; set; }
    }
}
