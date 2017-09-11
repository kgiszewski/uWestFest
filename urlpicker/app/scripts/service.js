angular.module('umbraco').factory('urlPickerService', function ($http, $q, $injector) {
    return {
       getAllPropertyEditors: function () {
          var deferred = $q.defer();
          $http.get('/Umbraco/backoffice/Api/UrlPickerApi/getAllPropertyEditors/')
              .success(function (data, status, headers, cfg) {
                  deferred.resolve(data);
              }, function (error) {
                  deferred.reject(error);
              });
          return deferred.promise;
      },
      getEntityFromCustomType: function (nodeId, hostPropertyAlias, dataTypeId, typeAlias, value) {
          var data = { nodeId: nodeId, hostPropertyAlias: hostPropertyAlias, dataTypeId: dataTypeId, typeAlias: typeAlias, value: value };
          var deferred = $q.defer();
          $http.post('/Umbraco/backoffice/Api/UrlPickerApi/getEntityFromCustomType/', data)
              .success(function (data, status, headers, cfg) {
                  deferred.resolve(data);
              }, function (error) {
                  deferred.reject(error);
              });
          return deferred.promise;
      }
    };
});
