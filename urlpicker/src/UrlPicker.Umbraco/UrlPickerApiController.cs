using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Umbraco.Web.WebApi;
using UrlPicker.Umbraco.CustomEntities;
using UrlPicker.Umbraco.CustomEntities.Models;

namespace UrlPicker.Umbraco
{
    public class UrlPickerApiController : UmbracoAuthorizedApiController
    {
        public IEnumerable<object> GetAllPropertyEditors()
        {
            var dataTypes = Services.DataTypeService.GetAllDataTypeDefinitions();
            var ret = new List<object>();

            var allPropertyEditors = global::Umbraco.Core.PropertyEditors.PropertyEditorResolver.Current.PropertyEditors;

            foreach (var dataType in dataTypes)
            {
                var pe = allPropertyEditors.FirstOrDefault(n => n.Alias == dataType.PropertyEditorAlias);
                if (pe != null)
                {
                    var preValues = Services.DataTypeService.GetPreValuesCollectionByDataTypeId(dataType.Id);
                    var pvRet = new Dictionary<string, string>();
                    foreach (var preValue in preValues.FormatAsDictionary())
                    {
                        pvRet.Add(preValue.Key, preValue.Value.Value);
                    }
                    ret.Add(new { id = dataType.Id, view = pe.ValueEditor.View, name = dataType.Name, config = pvRet });
                }
            }
            return ret;
        }

        [HttpPost]
        public CustomEntity GetEntityFromCustomType(GetEntityPostModel obj)
        {
            var contentTypeAlias = Services.ContentService.GetById(obj.nodeId).ContentType.Alias;
            var customProvider = new CustomEntityService().GetProvider(contentTypeAlias, obj.hostPropertyAlias, obj.dataTypeId, obj.typeAlias);
            if (customProvider == null) return null;
            return customProvider.GetEntity(obj.value);
        }
    }
}
