using System;
using System.Collections.Generic;
using Umbraco.Core.ObjectResolution;

namespace UrlPicker.Umbraco.CustomEntities
{
    public class CustomEntityProvidersResolver : ManyObjectsResolverBase<CustomEntityProvidersResolver, ICustomEntityProvider>
    {
        internal CustomEntityProvidersResolver(IEnumerable<Type> providers) : base(providers)
        {
        }

        public IEnumerable<ICustomEntityProvider> Providers
        {
            get { return Values; }
        }
    }
}
