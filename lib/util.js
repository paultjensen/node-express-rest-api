(function() {
    let helper = {};
    helper.getOffsetParam = function(params) {
        if (typeof(params.pageNum) === 'undefined') {
            return 0;
        }

        if (params.pageNum !== null) {
            return parseInt(params.pageNum);
        }
        return 0;
    };

    helper.getLimitParam = function(params) {
        if (typeof(params.pageSize) === 'undefined') {
            return 100;
        }
        if (params.pageSize !== null) {
            return parseInt(params.pageSize);
        }
        return 100;
    };

    helper.getOrderParam = function(params, validParamNames) {
        if (typeof(params.sort) === 'undefined') {
            return '';
        }
        if (!(params.sort in  validParamNames)) {
            return null;
        }
        return params.sort;
    };

    helper.getOrderDirection = function(params) {
        if (typeof(params.sortDir) === 'undefined') {
            return '';
        }
        if (params.sortDir.toLowerCase() !== 'asc' && params.sortDir.toLowerCase() !== 'desc' ) {
            return null;
        }
        return params.sortDir.toLowerCase();
    };

    helper.getSearchParam = function(params) {
        if (typeof(params.search) === 'undefined' || params.search === null) {
            return '';
        }
        return params.search.substring(0, 256);
    };

    module.exports = {helper: helper};
})();