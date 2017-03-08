(function() {
    'use strict';

    angular.module('core')
        .filter('to_trusted', toTrustedFilter);
    toTrustedFilter.$inject = ['$sce'];

    function toTrustedFilter($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }
}());
