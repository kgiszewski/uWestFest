using Umbraco.Core;
using UrlPicker.Umbraco.CustomEntities;

namespace UrlPicker.Umbraco
{
    public class Startup : IApplicationEventHandler
    {
        public void OnApplicationInitialized(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            CustomEntityProvidersResolver.Current = new CustomEntityProvidersResolver(PluginManager.Current.ResolveTypes<ICustomEntityProvider>());
        }

        public void OnApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
        }

        public void OnApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
        }
    }
}
