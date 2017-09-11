using UrlPicker.Umbraco.CustomEntities.Models;

namespace UrlPicker.Umbraco.CustomEntities
{
    public interface ICustomEntityProvider
    {
        bool CanProviderFor(string contentTypeAlias, string propertyAlias, int dataTypeId, string customTypeAlias);
        CustomEntity GetEntity(string value);
    }
}
