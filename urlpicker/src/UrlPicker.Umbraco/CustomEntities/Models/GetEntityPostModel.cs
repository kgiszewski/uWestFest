namespace UrlPicker.Umbraco.CustomEntities.Models
{
    public class GetEntityPostModel
    {
        public int nodeId { get; set; }
        public string hostPropertyAlias { get; set; }
        public int dataTypeId { get; set; }
        public string typeAlias;
        public string value { get; set; }
    }
}
