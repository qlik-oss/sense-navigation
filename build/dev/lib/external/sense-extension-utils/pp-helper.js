/*global window,define*/
define(["angular","underscore","qlik"],function(angular,_,qlik){function getAppList(){var defer=$q.defer();return qlik.getAppList(function(items){defer.resolve(items.map(function(item){return{value:item.qDocId,label:item.qTitle}}))}),defer.promise}function getBookmarkList(){var defer=$q.defer();return app.getList("BookmarkList",function(items){defer.resolve(items.qBookmarkList.qItems.map(function(item){return{value:item.qInfo.qId,label:item.qData.title}}))}),defer.promise}function getFieldList(){var defer=$q.defer();return defer.promise}function getSheetList(){var defer=$q.defer();return app.getAppObjectList(function(data){var sheets=[],sortedData=_.sortBy(data.qAppObjectList.qItems,function(item){return item.qData.rank});return _.each(sortedData,function(item){sheets.push({value:item.qInfo.qId,label:item.qMeta.title})}),defer.resolve(sheets)}),defer.promise}function getStoryList(){var defer=$q.defer();return app.getList("story",function(data){var stories=[];return data&&data.qAppObjectList&&data.qAppObjectList.qItems&&data.qAppObjectList.qItems.forEach(function(item){stories.push({value:item.qInfo.qId,label:item.qMeta.title})}),defer.resolve(_.sortBy(stories,function(item){return item.label}))}),defer.promise}var $injector=angular.injector(["ng"]),$q=$injector.get("$q"),app=qlik.currApp();return{getAppList:getAppList,getBookmarkList:getBookmarkList,getFieldList:getFieldList,getSheetList:getSheetList,getStoryList:getStoryList}});