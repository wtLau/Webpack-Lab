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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


$.extend({
    cm_freeseemedia_account: {
        auth: {
            authToken: '',
            username: '',
            orderNumber: '',
            expiresIn: ''
        },
        endPoint: {
            BasicURL: "https://emanage-prod-csm-api.azurewebsites.net/",
            logIn: "customer/auth",
            orderList: "order/FreeseeTV/list",
            orderSingleProduct: "order/FreeseeTV/2122586",
            orderSingleProductReview: "ticket/FreeseeTV/2268081/new",
            masterAccount: "FreeseeTV"
        },

        initial: function initial() {
            var a = $.cm_freeseemedia_account;

            // retrive token from local
            a.getLocalAuthToken();

            // Check if loggin before
            a.hasAuthToken();

            //login Event Listener
            a.checkIfAuthExpired();

            //logout Event Listener
            a.logOut();
        },

        hasAuthToken: function hasAuthToken() {
            var a = $.cm_freeseemedia_account;
            a.getLocalAuthToken();

            //if does not have auth token then redirect to login page
            if (a.auth.authToken === undefined && a.auth.authToken === null && a.auth.authToken.length === 0) {
                $.RedirectPage("../customerlogin.html", {});
            }
        },
        checkIfAuthExpired: function checkIfAuthExpired() {
            var a = $.cm_freeseemedia_account;

            var successPost = function successPost(res) {
                console.log(res);
                return res;
            };
            var errorPost = function errorPost(res) {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
                return res;
            };
            var url = a.endPoint.BasicURL + a.endPoint.orderList;

            return $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                success: successPost,
                error: errorPost,
                headers: {
                    "Authorization": "Bearer " + a.auth.authToken
                }
            });
        },
        logOut: function logOut() {
            var a = $.cm_freeseemedia_account;

            $('.fontAwesomeIcon').on('click', '.logout-btn', function () {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
            });
        },
        storeAuthToken: function storeAuthToken(token) {
            var a = $.cm_freeseemedia_account;

            $.Local.set('authToken', token);
        },
        getLocalAuthToken: function getLocalAuthToken() {
            var a = $.cm_freeseemedia_account;

            a.auth.authToken = $.Local.has('authToken') ? $.Local.get('authToken') : $.Local.set('authToken', '');
            return true;
        }
    }
});
$(document).ready($.cm_freeseemedia_account.initial);

/***/ })
/******/ ]);