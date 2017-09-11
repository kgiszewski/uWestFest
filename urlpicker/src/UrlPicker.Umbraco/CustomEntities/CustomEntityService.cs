using System.Linq;

namespace UrlPicker.Umbraco.CustomEntities
{
    public class CustomEntityService
    {
        public CustomEntityService()
        {
        }

        public ICustomEntityProvider GetProvider(string contentTypeAlias, string propertyAlias, int dataTypeId, string customTypeAlias)
        {
            return CustomEntityProvidersResolver.Current.Providers.FirstOrDefault(n => n.CanProviderFor(contentTypeAlias,
                propertyAlias, dataTypeId, customTypeAlias));
        }
    }
}
