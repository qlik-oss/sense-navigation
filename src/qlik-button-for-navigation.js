/**
 * @license
 * Copyright (c) 2015-present, Stefan Walther. All rights reserved.
 *
 * Copyrights licensed under the terms of the MIT license.
 * Original source <https://github.com/stefanwalther/sense-navigation/tree/v1.0>
 */
/* global define,window */
define(
  [
    'qlik',
    './properties',
    './lib/js/helpers',
    './template.ng.html',
    './popup-editunavailable.ng.html',
    "qvangular",
    './lib/css/main.min.css',
    './lib/less/container.less',
    './lib/less/lui-buttons.less',
    './lib/less/main.less'
  ],
  function (qlik, props, utils, ngTemplate, popupNoEdit, qvangular) { // eslint-disable-line max-params
    'use strict';

    /*
     * Check if running in an iframe.
     *
     * Catching the error is necessary as browsers could block access to window.top due to the same-origin-policy.
     * (see same origin policy)
     *
     * @link https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
     *
     * @returns {boolean}
     */
    function inIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }

    return {

      definition: props,
      support: {
        export: false,
        exportData: false,
        snapshot: false
      },
      initialProperties: {
        props: {
          buttonIconSet: 'lui',
          buttonTextAlign: 'center'
        }
      },
      snapshot: { canTakeSnapshot: false },
      template: ngTemplate,
      controller: [
        '$scope', '$element', function ($scope, $element) {
          function canInteract() {
            return $scope.object && $scope.object.getInteractionState() === 1;
          }

          $scope.doClick = function () {
            if (canInteract()) {
              $scope.doAction()
                .then(function () {
                  $scope.doNavigate();
                })
                .catch(function (err) {
                  window.console.error(err);
                });
            }
          };

          // Ugly workaround for Apple touch devices, iPad etc
          if (typeof ($scope.FirstTime) === 'undefined') {
            $scope.FirstTime = true;
            var clickHandler = ('ontouchstart' in document.documentElement ? 'touchstart' : 'click');
            $element.find('button').bind(clickHandler, $scope.doClick);
          }

          var DELAY_ACTIONS = 100;

          $scope.doNavigate = function () {
            switch ($scope.layout.props.navigationAction) {
              case 'gotoSheet':
                $scope.gotoSheet($scope.layout.props.selectedSheet);
                break;
              case 'gotoSheetById':
                $scope.gotoSheet($scope.layout.props.sheetId);
                break;
              case 'gotoStory':
                $scope.gotoStory($scope.layout.props.selectedStory);
                break;
              case 'firstSheet':
                $scope.firstSheet();
                break;
              case 'nextSheet':
                $scope.nextSheet();
                break;
              case 'openWebsite':
                var url = $scope.layout.props.websiteUrl;
                if (!utils.isEmpty(url)) {
                  var same = $scope.layout.props.sameWindow;
                  var isIframe = inIframe();
                  var target = '';
                  if (same && isIframe) {
                    target = '_parent';
                  } else if (same) {
                    target = '_self';
                  }

                  if (/(mailto:)/.test(url)) {
                    window.location.href = url;
                  } else {
                    window.open(utils.fixUrl(url), target);
                  }
                }
                break;
              case 'prevSheet':
                $scope.prevSheet();
                break;
              case 'lastSheet':
                $scope.lastSheet();
                break;
              // eslint-disable capitalized-comments
              // case "openApp":
              // 	console.log('Open', $scope.layout.props.selectedApp);
              // 	qlik.openApp( $scope.layout.props.selectedApp );
              // 	break;
              // eslint-enable capitalized-comments
              case 'switchToEdit':
                if (qlik.navigation.isModeAllowed(qlik.navigation.EDIT)) {
                  var result = qlik.navigation.setMode(qlik.navigation.EDIT); // eslint-disable-line no-case-declarations
                  if (!result.success) {
                    window.console.error(result.errorMsg);
                  }
                } else {
                  qvangular.getService("luiDialog").show({
                    template: popupNoEdit,
                    closeOnEscape: true,
                    closeOnOutside: true,
                  });
                }
                break;
              default:
                break;
            }
          };

          /*
           * Executes the actions
           *
           * @returns a promise
           */
          $scope.doAction = function () { // eslint-disable-line complexity
            if ($scope.layout.props && $scope.layout.props.actionItems) {
              var actionPromises = [];

              for (var i = 0; i < $scope.layout.props.actionItems.length; i++) {
                var actionType = $scope.layout.props.actionItems[i].actionType;
                var state = $scope.layout.qStateName;
                var fld = (utils.isEmpty($scope.layout.props.actionItems[i].selectedField)
                  || $scope.layout.props.actionItems[i].selectedField === 'by-expr')
                  ? $scope.layout.props.actionItems[i].field
                  : $scope.layout.props.actionItems[i].selectedField;
                var val = $scope.layout.props.actionItems[i].value;
                var softLock = $scope.layout.props.actionItems[i].softLock;
                var bookmark = $scope.layout.props.actionItems[i].selectedBookmark;
                var variable = $scope.layout.props.actionItems[i].variable;

                var l = actionPromises.length;

                switch (actionType) {
                  case 'applyBookmark':
                    if (!utils.isEmpty(bookmark)) {
                      actionPromises.push($scope.actions.applyBookmark.bind(this, bookmark));
                    }
                    break;
                  case 'back':
                    actionPromises.push($scope.actions.back.bind(this));
                    break;
                  case 'clearAll':
                    actionPromises.push($scope.actions.clearAll.bind(this, state));
                    break;
                  case 'forward':
                    actionPromises.push($scope.actions.forward.bind(this));
                    break;
                  case 'lockAll':
                    actionPromises.push($scope.actions.lockAll.bind(this, state));
                    break;
                  case 'clearField':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.clearField.bind(this, fld, state));
                    }
                    break;
                  case 'clearOther':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.clearOther.bind(this, fld, state, softLock));
                    }
                    break;
                  case 'lockField':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.lockField.bind(this, fld, state));
                    }
                    break;
                  case 'unlockField':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.unlockField.bind(this, fld, state));
                    }
                    break;
                  case 'selectAll':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.selectAll.bind(this, fld, state, softLock));
                    }
                    break;
                  case 'selectAlternative':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.selectAlternative.bind(this, fld, state, softLock));
                    }
                    break;
                  case 'selectAndLockField':
                    if (!utils.isEmpty(fld) && (!utils.isEmpty(val))) {
                      actionPromises.push($scope.actions.selectField.bind(this, fld, state, val));
                      actionPromises.push($scope.actions.wait.bind(null, 100));
                      actionPromises.push($scope.actions.lockField.bind(this, fld, state));
                    }
                    break;
                  case 'selectExcluded':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.selectExcluded.bind(this, fld, state, softLock));
                    }
                    break;
                  case 'selectField':
                    if (!utils.isEmpty(fld) && (!utils.isEmpty(val))) {
                      actionPromises.push($scope.actions.selectField.bind(this, fld, state, val));
                    }
                    break;
                  case 'selectValues':
                    if (!utils.isEmpty(fld) && (!utils.isEmpty(val))) {
                      actionPromises.push($scope.actions.selectValues.bind(this, fld, state, val));
                    }
                    break;
                  case 'selectPossible':
                    if (!utils.isEmpty(fld)) {
                      actionPromises.push($scope.actions.selectPossible.bind(this, fld, state, softLock));
                    }
                    break;
                  case 'toggleSelect':
                    if (!utils.isEmpty(fld) && (!utils.isEmpty(val))) {
                      actionPromises.push($scope.actions.toggleSelect.bind(this, fld, state, val, softLock));
                    }
                    break;
                  case 'setVariable':
                    if (!utils.isEmpty(variable)) {
                      actionPromises.push($scope.actions.setVariableContent.bind(this, variable, val));
                    }
                    break;
                  case 'unlockAll':
                    actionPromises.push($scope.actions.unlockAll.bind(this, state));
                    break;
                  case 'unlockAllAndClearAll':
                    actionPromises.push($scope.actions.unlockAll.bind(this, state));
                    actionPromises.push($scope.actions.wait.bind(null, 100));
                    actionPromises.push($scope.actions.clearAll.bind(this, state));
                    break;

                  default:
                    break;
                }

                if (l < actionPromises.length) {
                  actionPromises.push($scope.actions.wait.bind(null, 100));
                }
              }

              var seed = qlik.Promise.resolve(null);
              return actionPromises.reduce(function (a, b) {
                return a.then(b);
              }, seed);
            }
          };

          $scope.getEnableCond = function (props) {
            if (props.useEnabledCondition) {
              var EC = props.enabledCondition;
              if (EC === 0) {
                return true;
              }
            }
            return false;
          };

          $scope.getButtonClasses = function (props) {
            var classes = [];

            classes.push('lui-button');
            classes.push('lui-button--gradient');

            if (props.fullWidth) {
              classes.push('full-width');
            } else {
              classes.push('auto-width');
            }

            return classes.join(' ');
          };

          $scope.getIconClasses = function (props) {
            var classes = [];
            switch (props.buttonIconSet) {
              case 'fa':
                classes.push('fa');
                classes.push('fa-' + props.buttonIconFa);
                break;
              case 'lui':
                classes.push('lui-icon');
                classes.push('lui-icon--small');
                classes.push('lui-icon--' + props.buttonIconLui);
                break;
              default:
                break;
            }
            return classes.join(' ');
          };

          $scope.actions = {
            applyBookmark: function (bookmarkId) {
              var cApp = qlik.currApp();
              return cApp.bookmark.apply(bookmarkId);
            },
            back: function () {
              var cApp = qlik.currApp();
              return cApp.back();
            },
            clearAll: function (state) {
              var cApp = qlik.currApp();
              return cApp.clearAll(null, state);
            },
            clearField: function (field, state) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).clear();
            },
            clearOther: function (field, state, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).clearOther(softLock);
            },
            forward: function () {
              var cApp = qlik.currApp();
              return cApp.forward();
            },
            lockAll: function (state) {
              var cApp = qlik.currApp();
              return cApp.lockAll(state);
            },
            lockField: function (field, state) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).lock();
            },
            selectAll: function (field, state, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).selectAll(softLock);
            },
            selectAlternative: function (field, state, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).selectAlternative(softLock);
            },
            selectExcluded: function (field, state, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).selectExcluded(softLock);
            },
            selectField: function (field, state, value) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).selectMatch(value, false);
            },
            selectPossible: function (field, state, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).selectPossible(softLock);
            },
            selectValues: function (field, state, values) {
              var cApp = qlik.currApp();
              var valsToSelect = utils.splitToStringNum(values, ';');
              return cApp.field(field, state).selectValues(valsToSelect, false);
            },
            setVariableContent: function (varName, varVal) {
              var cApp = qlik.currApp();
              return cApp.variable.setContent(varName, varVal);
            },
            toggleSelect: function (field, state, value, softLock) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).toggleSelect(value, softLock);
            },
            unlockAll: function (state) {
              var cApp = qlik.currApp();
              return cApp.unlockAll(state);
            },
            unlockField: function (field, state) {
              var cApp = qlik.currApp();
              return cApp.field(field, state).unlock();
            },
            wait: function (ms) {
              var waitMs = ms || DELAY_ACTIONS;
              return new qlik.Promise(function (resolve) {
                var wait = setTimeout(function () {
                  clearTimeout(wait);
                  resolve();
                }, waitMs);
              });
            }
          };

          // Todo(refactor): Move all stuff here, this is much cleaner
          $scope.navigationAction = {};

          $scope.firstSheet = function () {
            utils.getFirstSheet().then(function (result) {
              qlik.navigation.gotoSheet(result.id);
            });
          };

          $scope.nextSheet = function () {
            qlik.navigation.nextSheet();
          };

          $scope.prevSheet = function () {
            qlik.navigation.prevSheet();
          };

          $scope.lastSheet = function () {
            utils.getLastSheet().then(function (result) {
              qlik.navigation.gotoSheet(result.id);
            });
          };

          $scope.gotoSheet = function (sheetId) {
            if (!utils.isEmpty(sheetId)) {
              var r = qlik.navigation.gotoSheet(sheetId);
              if (!r.success) {
                window.console.error(r.errorMsg);
              }
            }
          };

          $scope.gotoStory = function (storyId) {
            if (!utils.isEmpty(storyId)) {
              qlik.navigation.gotoStory(storyId);
            }
          };
        }
      ]
    };
  });
