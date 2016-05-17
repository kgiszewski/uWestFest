var UrlPicker;
(function (UrlPicker) {
    var Controllers;
    (function (Controllers) {
        "use strict";
        var DefaultTypeController = (function () {
            function DefaultTypeController($scope) {
                this.$scope = $scope;
                $scope.model.value = $scope.model.value || "content";
            }
            DefaultTypeController.$inject = ["$scope"];
            return DefaultTypeController;
        }());
        Controllers.DefaultTypeController = DefaultTypeController;
        angular.module("umbraco").controller("UrlPicker.Controllers", DefaultTypeController);
    })(Controllers = UrlPicker.Controllers || (UrlPicker.Controllers = {}));
})(UrlPicker || (UrlPicker = {}));
//# sourceMappingURL=default.type.js.map