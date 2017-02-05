using System.Collections.Generic;
using System.Linq;
using Umbraco.Web.WebApi;

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
    }

}
