using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Web.Models;
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
    }
}
