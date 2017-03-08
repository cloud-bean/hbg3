(function() {
    'use strict';

    angular.module('core')
        .filter('unique', unique);

    function unique() {
        return function(array, key) {
            var arrayInfos = [],
                arrayValues = [];
            if (array !== undefined) {
                array.forEach(function(obj) {
                    if (obj[key] && arrayValues.indexOf(obj[key]) === -1) {
                        arrayInfos.push(obj);
                        arrayValues.push(obj[key]);
                    }
                });
            }
            return arrayInfos;
        };
    }
}());
