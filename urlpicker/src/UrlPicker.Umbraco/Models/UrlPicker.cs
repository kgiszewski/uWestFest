using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UrlPicker.Umbraco.Models
{
    public class UrlPicker
    {
        public UrlPickerTypes Type { get; set; }
        public Meta Meta { get; set; }
        public TypeData TypeData { get; set;}

        public string Url { get; set; }
        public string Name { get; set; }
        public enum UrlPickerTypes { Url, Content, Media };
    }
}
