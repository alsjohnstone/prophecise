/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/javascript/embed-api/components/date-range-selector.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/javascript/embed-api/components/date-range-selector.js":
/*!********************************************************************!*\
  !*** ./src/javascript/embed-api/components/date-range-selector.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global gapi */

/**
 * A DateRangeSelector component for the Embed API.
 */
gapi.analytics.ready(function () {
  var nDaysAgo = /(\d+)daysAgo/;
  var dateFormat = /\d{4}-\d{2}-\d{2}/;
  /**
   * Convert a date acceptable to the Core Reporting API (e.g. `today`,
   * `yesterday` or `NdaysAgo`) into the format YYYY-MM-DD. Dates
   * already in that format are simply returned.
   * @param {string} str The date string to format.
   * @return {string} The formatted date.
   */

  function convertDate(str) {
    // If str is in the proper format, do nothing.
    if (dateFormat.test(str)) return str;
    var match = nDaysAgo.exec(str);

    if (match) {
      return daysAgo(+match[1]);
    } else if (str == 'today') {
      return daysAgo(0);
    } else if (str == 'yesterday') {
      return daysAgo(1);
    } else if (str == 'firstDayOfMonth') {
      return firstDayOfMonth();
    } else {
      throw new Error('Cannot convert date ' + str);
    }
  }
  /**
   * Get a firstDayOfMonth formatted as YYYY-MM-DD
   * @return {string} The formatted date.
   */


  function firstDayOfMonth() {
    var now = new Date();
    var year = now.getFullYear().toString().padStart(4, 0);
    var month = (now.getMonth() + 1).toString().padStart(2, 0);
    return "".concat(year, "-").concat(month, "-01");
  }
  /**
   * Accept a number and return a date formatted as YYYY-MM-DD that
   * represents that many days ago.
   * @param {number} numDays The number of days ago whose date to return.
   * @return {string} The formatted date.
   */


  function daysAgo(numDays) {
    var date = new Date();
    date.setDate(date.getDate() - numDays);
    var month = String(date.getMonth() + 1);
    month = month.length == 1 ? '0' + month : month;
    var day = String(date.getDate());
    day = day.length == 1 ? '0' + day : day;
    return date.getFullYear() + '-' + month + '-' + day;
  }

  gapi.analytics.createComponent('DateRangeSelector', {
    /**
     * Initialize the DateRangeSelector instance and render it to the page.
     * @return {DateRangeSelector} The instance.
     */
    execute: function execute() {
      var options = this.get();
      options['start-date'] = options['start-date'] || '7daysAgo';
      options['end-date'] = options['end-date'] || 'yesterday'; // Allow container to be a string ID or an HTMLElement.

      this.container = typeof options.container == 'string' ? document.getElementById(options.container) : options.container; // Allow the template to be overridden.

      if (options.template) this.template = options.template;
      this.container.innerHTML = this.template;
      var dateInputs = this.container.querySelectorAll('input');
      this.startDateInput = dateInputs[0];
      this.startDateInput.value = convertDate(options['start-date']);
      this.endDateInput = dateInputs[1];
      this.endDateInput.value = convertDate(options['end-date']);
      this.setValues();
      this.setMinMax();
      this.container.onchange = this.onChange.bind(this);
      return this;
    },

    /**
     * Emit a change event based on the currently selected dates.
     * Pass an object containing the start date and end date.
     */
    onChange: function onChange() {
      this.setValues();
      this.setMinMax();
      this.emit('change', {
        'start-date': this['start-date'],
        'end-date': this['end-date']
      });
    },

    /**
     * Updates the instance properties based on the input values.
     */
    setValues: function setValues() {
      this['start-date'] = this.startDateInput.value;
      this['end-date'] = this.endDateInput.value;
    },

    /**
     * Updates the input min and max attributes so there's no overlap.
     */
    setMinMax: function setMinMax() {
      this.startDateInput.max = this.endDateInput.value;
      this.endDateInput.min = this.startDateInput.value;
    },

    /**
     * The html structure used to build the component. Developers can
     * override this by passing it to the component constructor.
     * The only requirement is that the structure contain two inputs, the
     * first will be the start date and the second will be the end date.
     */
    template: '<div class="DateRangeSelector">' + '  <div class="DateRangeSelector-item">' + '    <label>Start Date</label> ' + '    <input type="date">' + '  </div>' + '  <div class="DateRangeSelector-item">' + '    <label>End Date</label> ' + '    <input type="date">' + '  </div>' + '</div>'
  });
});

/***/ })

/******/ });
//# sourceMappingURL=date-range-selector.js.map