define([], function () {
  'use strict';

  return {
    currApp: function () {
      return {
        getAppObjectList: () => {

        },
        getStoryList: () => {

        },
        getList: () => {}
      };
    },
    getGlobal: () => {
      return {
        getAppList: () => {
          return Promise.resolve();
        }
      };
    },
    Promise: {
      defer: function () {
        return {
          promise: function () {}
        };
      }
    }
  };
});
