var ngApp = angular.module('ngApp', []);

ngApp.controller('InputUrlCtrl', ['$scope','$log', '$interval',
    function($scope,$log,$interval) {

        $interval(function() {
            $scope.teek = Date.now();
        },1000);

        $scope.teek = Date.now();
        $scope.url = '';
        $scope.blocks = [];
        function findBlock(block) {
            var res = false;
            angular.forEach($scope.blocks,function(val, key){
                if(val.url === block.url) {
                    return res = key;
                }
            })
            return res;
        }
        $scope.handleUpdate = function(block) {
            angular.extend(block,{du : Date.now()})
        }
        $scope.handleEdit = function(block) {
            if(findBlock(block) !== false) return false;
            angular.extend(block,{url : block.url, updated : parseInt(block.updated)})
        }
        $scope.handleClose = function(block) {
            $scope.blocks.splice(findBlock(block),1);
        }
        $scope.handleClick = function(url,form) {
            if(form.$valid === false) return false;
            if(findBlock({url : url}) !== false) return false;
            $scope.url = '';
            $scope.blocks.unshift({url : url, updated : 0, du : 0});
        }
    }
]);


ngApp.directive('newsBlock', function($log,$http) {
    return {
        link : function(scope, element, attrs) {
            scope.url = '';
            scope.title = 'Нет данных...';
            scope.items = [];
            scope.showEdit = false;
            scope.lastUpdate = 0;
            function update(block) {
                $http.jsonp(document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=5&callback=JSON_CALLBACK&q=' + encodeURIComponent(block.url))
                    .then(function successCallback(response) {
                        try {
                            scope.title = response.data.responseData.feed.title;
                            scope.items = response.data.responseData.feed.entries;
                            scope.block.du = Date.now();
                        }
                        catch (err) {
                            scope.title = 'Нет данных...';
                            scope.items = [];
                            scope.block.du = 0;
                        }
                    })
            }
            scope.$watch(attrs.teek, function(teek) {
                scope.lastUpdate = (scope.block.du === 0  ?  0 : Math.ceil((teek - scope.block.du) / 1000));
                if(scope.lastUpdate && scope.block.updated && scope.block.updated == scope.lastUpdate) {
                    update(scope.block);
                }
            });
            scope.$watch('block.url', function(url) {
                scope.url = url ? url : scope.url;
                update(scope.block);
            });
        },
        restrict: 'A',
        scope: {
            'block': '=',
            'teek': '=',
            'update': '&onUpdate',
            'edit': '&onEdit',
            'close': '&onClose'
        },
        templateUrl: 'assets/js/tmpl/newsBlocks.html'
    };
});