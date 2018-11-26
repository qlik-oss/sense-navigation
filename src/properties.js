/* global define */
define([
  'qlik',
  './lib/js/helpers',
  'text!./lib/data/icons-lui.json'
], function (qlik, utils, iconListLui) { // eslint-disable-line max-params

  'use strict';

  // ****************************************************************************************
  // Helper Promises
  // ****************************************************************************************

  // Helper method to return a list of icons in a format that can be used by the
  // dropdown component.
  function getIcons(iconListRaw) {
    var iconList = JSON.parse(iconListRaw).icons;
    var propDef = [];

    iconList.forEach(function (icon) {
      propDef.push(
        {
          value: icon.id,
          label: icon.name
        }
      );
    });

    propDef.sort(function (a, b) {
      return ('' + a.label).localeCompare(b.label);
    });

    propDef.unshift({
      value: '',
      label: '>> No icon <<'
    });
    return propDef;
  }

  // ****************************************************************************************
  // Layout
  // ****************************************************************************************

  var buttonWidth = {
    type: 'boolean',
    component: 'buttongroup',
    label: 'Button width',
    ref: 'props.fullWidth',
    options: [
      {
        value: true,
        label: 'Full Width',
        tooltip: 'Button has the same width as the element.'
      },
      {
        value: false,
        label: 'Auto Width',
        tooltip: 'Auto width depending on the label defined.'
      }
    ],
    defaultValue: false
  };

  var conditionalEnable = {
    type: 'items',
    label: 'Enable condition',
    items: {
      usecondition: {
        type: 'boolean',
        component: 'switch',
        label: 'Use enable condition',
        ref: 'props.useEnabledCondition',
        defaultValue: false,
        options: [{
          value: true,
          label: 'On'
        }, {
          value: false,
          label: 'Off'
        }]
      },
      condition: {
        ref: 'props.enabledCondition',
        label: 'Enable condition',
        type: 'integer',
        defaultValue: 1,
        expression: 'optional',
        show: function (data) {
          return data.props.useEnabledCondition === true;
        }
      }
    }
  };

  // ****************************************************************************************
  // Icons
  // ****************************************************************************************

  var buttonShowIcon = {
    type: 'boolean',
    component: 'switch',
    label: 'Show icon',
    ref: 'props.buttonShowIcon',
    options: [
      {
        value: true,
        label: 'On'
      }, {
        value: false,
        label: 'Off'
      }
    ],
    defaultValue: false
  };

  var buttonIconsLui = {
    type: 'string',
    component: 'dropdown',
    label: 'Icon (Leonardo UI icon-set)',
    ref: 'props.buttonIconLui',
    options: function () {
      return getIcons(iconListLui);
    },
    show: function (data) { /* eslint-disable-line object-shorthand */
      return data.props.buttonShowIcon === true && data.props.buttonIconSet === 'lui';
    }
  };

  var buttonTextAlign = {
    ref: 'props.buttonTextAlign',
    label: 'Label alignment',
    type: 'string',
    component: 'dropdown',
    defaultValue: 'left',
    options: [
      {
        value: 'center',
        label: 'Center'
      },
      {
        value: 'left',
        label: 'Left'
      },
      {
        value: 'right',
        label: 'Right'
      }
    ],
    show: function (data) { /* eslint-disable-line object-shorthand */
      return data.props.fullWidth;
    }
  };

  // ****************************************************************************************
  // Position, size & alignment
  // ****************************************************************************************

  var buttonAlignment = {
    ref: 'props.buttonAlignment',
    type: 'string',
    component: 'dropdown',
    label: 'Button position',
    defaultValue: 'top-left',
    options: [
      {
        label: 'Top left',
        value: 'top-left'
      },
      {
        label: 'Top middle',
        value: 'top-middle'
      },
      {
        label: 'Top right',
        value: 'top-right'
      },
      {
        label: 'Left middle',
        value: 'left-middle'
      },
      {
        label: 'Centered',
        value: 'centered'
      },
      {
        label: 'Right middle',
        value: 'right-middle'
      },
      {
        label: 'Bottom left',
        value: 'bottom-left'
      },
      {
        label: 'Bottom middle',
        value: 'bottom-middle'
      },
      {
        label: 'Bottom right',
        value: 'bottom-right'
      }
    ]
  };

  var buttonLabel = {
    ref: 'props.buttonLabel',
    label: 'Label',
    type: 'string',
    expression: 'optional',
    show: function () {
      return true;
    },
    defaultValue: 'My Button'
  };

  // ****************************************************************************************
  // Navigation Action
  // ****************************************************************************************

  var navigationAction = {
    ref: 'props.navigationAction',
    label: 'Navigation action',
    type: 'string',
    component: 'dropdown',
    default: 'nextSheet',
    options: [
      {
        label: 'None',
        value: 'none'
      },
      {
        label: 'Go to first sheet',
        value: 'firstSheet'
      },
      {
        label: 'Go to next sheet',
        value: 'nextSheet'
      },
      {
        label: 'Go to previous sheet',
        value: 'prevSheet'
      },
      {
        label: 'Go to last sheet',
        value: 'lastSheet'
      },
      {
        label: 'Go to a sheet',
        value: 'gotoSheet'
      },
      {
        label: 'Go to a sheet (defined by sheet Id)',
        value: 'gotoSheetById'
      },
      {
        label: 'Go to a story',
        value: 'gotoStory'
      },
      {
        label: 'Open a website / eMail',
        value: 'openWebsite'
      },
      {
        label: 'Switch to edit mode',
        value: 'switchToEdit'
      }
    ]
  };

  var sheetId = {
    ref: 'props.sheetId',
    label: 'Sheet Id',
    type: 'string',
    expression: 'optional',
    show: function (data) {
      return data.props.navigationAction === 'gotoSheetById';
    }
  };

  var sheetList = {
    type: 'string',
    component: 'dropdown',
    label: 'Select sheet',
    ref: 'props.selectedSheet',
    options: function() {
      return utils.getPPList({listType: 'sheet', sortBy: 'title'});
    },
    show: function (data) {
      return data.props.navigationAction === 'gotoSheet';
    }
  };

  var storyList = {
    type: 'string',
    component: 'dropdown',
    label: 'Select story',
    ref: 'props.selectedStory',
    options: function() {
      return utils.getPPList({listType: 'story', sortBy: 'title'});
    },
    show: function (data) {
      return data.props.navigationAction === 'gotoStory';
    }
  };

  var websiteUrl = {
    ref: 'props.websiteUrl',
    label: 'Website Url:',
    type: 'string',
    expression: 'optional',
    show: function (data) {
      return data.props.navigationAction === 'openWebsite';
    }
  };

  var sameWindow = {
    ref: 'props.sameWindow',
    label: 'Open in same window',
    type: 'boolean',
    defaultValue: true,
    show: function (data) {
      return data.props.navigationAction === 'openWebsite';
    }
  };

  // ****************************************************************************************
  // Action Options
  // ****************************************************************************************

  var actionOptions = [
    {
      value: 'applyBookmark',
      label: 'Apply a bookmark',
      group: 'bookmark'
    },
    {
      value: 'clearAll',
      label: 'Clear all selections',
      group: 'selection'
    },
    {
      value: 'clearOther',
      label: 'Clear selections in other fields',
      group: 'selection'
    },
    {
      value: 'forward',
      label: 'Move forwards (in your selections)',
      group: 'selection'
    },
    {
      value: 'back',
      label: 'Move backwards (in your selections)',
      group: 'selection'
    },
    {
      value: 'clearField',
      label: 'Clear selections in field',
      group: 'selection'
    },
    {
      value: 'lockAll',
      label: 'Lock all selections',
      group: 'selection'
    },
    {
      value: 'lockField',
      label: 'Lock a specific field',
      group: 'selection'
    },
    {
      value: 'unlockAll',
      label: 'Unlock all selections',
      group: 'selection'
    },
    {
      value: 'unlockField',
      label: 'Unlock a specific field',
      group: 'selection'
    },
    {
      value: 'unlockAllAndClearAll',
      label: 'Unlock all and clear all',
      group: 'selection'
    },
    {
      value: 'selectField',
      label: 'Select a value in a field',
      group: 'selection'
    },
    {
      value: 'selectAll',
      label: 'Select all values in a field',
      group: 'selection'
    },
    {
      value: 'selectValues',
      label: 'Select multiple values in a field',
      group: 'selection'
    },
    {
      value: 'selectAlternative',
      label: 'Select alternatives',
      group: 'selection'
    },
    {
      value: 'selectAndLockField',
      label: 'Select a value and lock field',
      group: 'selection'
    },
    {
      value: 'selectExcluded',
      label: 'Select excluded',
      group: 'selection'
    },
    {
      value: 'selectPossible',
      label: 'Select possible values in a field',
      group: 'selection'
    },
    {
      value: 'setVariable',
      label: 'Set variable value',
      group: 'variables'
    },
    {
      value: 'toggleSelect',
      label: 'Toggle field selection',
      group: 'selection'
    }
  ];

  function getActionLabel(actionType) {
    if ((typeof actionOptions === 'undefined') || (typeof actionType === 'undefined')) {
      return actionType;
    }

    var n = actionOptions.length;
    for (var i = 0; i < n; i++) {
      if (actionOptions[i].value === actionType) {
        return actionOptions[i].label;
      }
    }
    return actionType;
  }

  function getActionItemFromId(arr, actionId) {
    if ((typeof arr === 'undefined') || (typeof actionId === 'undefined')) {
      return null;
    }
    var n = arr.length;
    for (var i = 0; i < n; i++) {
      if (arr[i].cId === actionId) {
        return arr[i];
      }
    }
    return null;
  }

  // ****************************************************************************************
  // n-actions
  // ****************************************************************************************
  var bookmarkEnabler = ['applyBookmark'];
  var fieldEnabler = ['clearField', 'clearOther', 'lockField', 'selectAll', 'selectAlternative', 'selectExcluded', 'selectField', 'selectPossible', 'selectValues', 'selectAndLockField', 'toggleSelect', 'unlockField'];
  var valueEnabler = ['selectField', 'selectValues', 'setVariable', 'selectAndLockField', 'toggleSelect'];
  var valueDescEnabler = ['selectValues'];
  var variableEnabler = ['setVariable'];
  var overwriteLockedEnabler = ['clearOther', 'selectAll', 'selectAlternative', 'selectExcluded', 'selectPossible', 'toggleSelect'];

  var actionsList = {
    type: 'array',
    ref: 'props.actionItems',
    label: 'Actions',
    itemTitleRef: function (data) {
      return getActionLabel(data.actionType);
    },
    allowAdd: true,
    allowRemove: true,
    addTranslation: 'Add Item',
    grouped: true,
    items: {
      actionType: {
        type: 'string',
        ref: 'actionType',
        component: 'dropdown',
        defaultValue: 'none',
        options: actionOptions
      },
      bookmarkList: {
        type: 'string',
        ref: 'selectedBookmark',
        component: 'dropdown',
        label: 'Select bookmark',
        expression: 'optional',
        options: function() {
          return utils.getBookmarkList({});
        },
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && bookmarkEnabler.indexOf(def.actionType) > -1;
        }
      },
      fieldList: {
        type: 'string',
        ref: 'selectedField',
        component: 'dropdown',
        label: 'Select field',
        defaultValue: '',
        options: function () {
          return utils.getFieldList().then(function (fieldList) {
            fieldList.splice(0, 0, {
              value: 'by-expr',
              label: '>> Define field by expression <<'
            });
            return fieldList;
          });
        },
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && fieldEnabler.indexOf(def.actionType) > -1;
        }
      },
      field: {
        type: 'string',
        ref: 'field',
        label: 'Field',
        expression: 'optional',
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && fieldEnabler.indexOf(def.actionType) > -1 && def.selectedField === 'by-expr';
        }
      },
      variable: {
        type: 'string',
        ref: 'variable',
        label: 'Variable name',
        expression: 'optional',
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && variableEnabler.indexOf(def.actionType) > -1;
        }
      },
      value: {
        type: 'string',
        ref: 'value',
        label: 'Value',
        expression: 'optional',
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && valueEnabler.indexOf(def.actionType) > -1;
        }
      },
      valueDesc: {
        type: 'text',
        component: 'text',
        ref: 'valueDesc',
        label: 'Define multiple values separated with a semi-colon (;).',
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && valueDescEnabler.indexOf(def.actionType) > -1;
        }
      },
      overwriteLocked: {
        type: 'boolean',
        ref: 'softLock',
        label: 'Overwrite locked selections',
        defaultValue: false,
        show: function (data, defs) {
          var def = getActionItemFromId(defs.layout.props.actionItems, data.cId);
          return def && overwriteLockedEnabler.indexOf(def.actionType) > -1;
        }
      }
    }
  };

  // ****************************************************************************************
  // Setup
  // ****************************************************************************************
  var sectionAppearance = {
    uses: 'settings',
    items: {
      general: {
        items: {
          showTitles: {
            defaultValue: false
          }
        }
      },
      selections: {
        show: false
      }
    }
  };

  var sectionButtonLayout = {
    type: 'items',
    component: 'expandable-items',
    label: 'Button layout',
    items: {
      label: {
        type: 'items',
        label: 'Label',
        items: {
          buttonLabel: buttonLabel
        }
      },
      icons: {
        type: 'items',
        label: 'Icon',
        items: {
          buttonShowIcon: buttonShowIcon,
          buttonIconsLui: buttonIconsLui
        }
      },
      alignment: {
        type: 'items',
        label: 'Size and alignment',
        items: {
          buttonWidth: buttonWidth,
          buttonAlignment: buttonAlignment,
          buttonTextAlign: buttonTextAlign
        }
      },
      conditionalEnable: conditionalEnable
    }
  };

  var sectionNavigationAndActions = {
    type: 'items',
    component: 'expandable-items',
    label: 'Actions and navigation',
    items: {
      actionsList: actionsList,
      navigationBehavior: {
        type: 'items',
        label: 'Navigation',
        items: {
          action: navigationAction,
          sheetId: sheetId,
          sheetList: sheetList,
          storyList: storyList,
          websiteUrl: websiteUrl,
          sameWindow: sameWindow
        }
      }
    }
  };

  var sectionAbout = {
    component: 'items',
    label: 'About',
    items: {
      header: {
        label: 'Button for navigation',
        style: 'header',
        component: 'text'
      },
      paragraph1: {
        label: 'A button that allows an app developer to pre-define navigation and selection actions.',
        component: 'text'
      },
      paragraph2: {
        label: 'Button for navigation is based upon an extension created by Stefan Walther at QlikTech International AB.',
        component: 'text'
      }
    }
  };

  // ****************************************************************************************
  // Return Values
  // ****************************************************************************************
  return {
    type: 'items',
    component: 'accordion',
    items: {
      sectionAppearance: sectionAppearance,
      sectionButtonLayout: sectionButtonLayout,
      sectionNavigationAndActions: sectionNavigationAndActions,
      sectionAbout: sectionAbout
    }
  };
});
