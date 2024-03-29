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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/javascript/embed-api/components/active-users.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/javascript/embed-api/components/active-users.js":
/*!*************************************************************!*\
  !*** ./src/javascript/embed-api/components/active-users.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright 2015 Google Inc. All rights reserved.
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
gapi.analytics.ready(function () {
  gapi.analytics.createComponent('ActiveUsers', {
    initialize: function initialize() {
      this.activeUsers = 0;
      gapi.analytics.auth.once('signOut', this.handleSignOut_.bind(this));
    },
    execute: function execute() {
      // Stop any polling currently going on.
      if (this.polling_) {
        this.stop();
      }

      this.render_(); // Wait until the user is authorized.

      if (gapi.analytics.auth.isAuthorized()) {
        this.pollActiveUsers_();
      } else {
        gapi.analytics.auth.once('signIn', this.pollActiveUsers_.bind(this));
      }
    },
    stop: function stop() {
      clearTimeout(this.timeout_);
      this.polling_ = false;
      this.emit('stop', {
        activeUsers: this.activeUsers
      });
    },
    render_: function render_() {
      var opts = this.get(); // Render the component inside the container.

      this.container = typeof opts.container == 'string' ? document.getElementById(opts.container) : opts.container;
      this.container.innerHTML = opts.template || this.template;
      this.container.querySelector('b').innerHTML = this.activeUsers;
    },
    pollActiveUsers_: function pollActiveUsers_() {
      var options = this.get();
      var pollingInterval = (options.pollingInterval || 5) * 1000;

      if (isNaN(pollingInterval) || pollingInterval < 5000) {
        throw new Error('Frequency must be 5 seconds or more.');
      }

      this.polling_ = true;
      gapi.client.analytics.data.realtime.get({
        ids: options.ids,
        metrics: 'rt:activeUsers'
      }).then(function (response) {
        var result = response.result;
        var newValue = result.totalResults ? +result.rows[0][0] : 0;
        var oldValue = this.activeUsers;
        this.emit('success', {
          activeUsers: this.activeUsers
        });

        if (newValue != oldValue) {
          this.activeUsers = newValue;
          this.onChange_(newValue - oldValue);
        }

        if (this.polling_ == true) {
          this.timeout_ = setTimeout(this.pollActiveUsers_.bind(this), pollingInterval);
        }
      }.bind(this));
    },
    onChange_: function onChange_(delta) {
      var valueContainer = this.container.querySelector('b');
      if (valueContainer) valueContainer.innerHTML = this.activeUsers;
      this.emit('change', {
        activeUsers: this.activeUsers,
        delta: delta
      });

      if (delta > 0) {
        this.emit('increase', {
          activeUsers: this.activeUsers,
          delta: delta
        });
      } else {
        this.emit('decrease', {
          activeUsers: this.activeUsers,
          delta: delta
        });
      }
    },
    handleSignOut_: function handleSignOut_() {
      this.stop();
      gapi.analytics.auth.once('signIn', this.handleSignIn_.bind(this));
    },
    handleSignIn_: function handleSignIn_() {
      this.pollActiveUsers_();
      gapi.analytics.auth.once('signOut', this.handleSignOut_.bind(this));
    },
    template: '<div class="ActiveUsers">' + 'Active Users: <b class="ActiveUsers-value"></b>' + '</div>'
  });
});

/***/ })

/******/ });
//# sourceMappingURL=active-users.js.map