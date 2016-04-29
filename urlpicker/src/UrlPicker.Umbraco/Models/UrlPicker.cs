using System.Web;

namespace UrlPicker.Umbraco.Models
{
    public class UrlPicker
    {
        public UrlPickerTypes Type { get; set; }
        public Meta Meta { get; set; }
        public TypeData TypeData { get; set;}
        public string Url { get; set; }
        public string UrlAbsolute { get; set; }
        public string Name { get; set; }
        public bool Disabled { get; set; }
        public enum UrlPickerTypes { Url, Content, Media };
        public IHtmlString Target
        {
            get
            {
                if (Meta != null && Meta.NewWindow)
                {
                    return new HtmlString(@"target=""_blank""");
                }

                return new HtmlString("");
            }
        }
    }
}
