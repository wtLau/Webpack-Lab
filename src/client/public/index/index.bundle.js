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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);

$.extend({
    fadeoutSlider: {
        initial: function initial(displayArrow, displayBar) {
            var a = $.fadeoutSlider;
            a.sliderCounter = 0;
            a.sliderActive = false;
            a.autoSlider = [];
            a.displayBar = displayBar;
            a.displayArrow = displayArrow;
            $totalSliderItems = $('.landing-slider .slider-item');
            var $allBars = $('.landing-slider .little-bar-wrapper');
            for (var i = 0; i < $totalSliderItems.length - 1; i++) {
                $allBars.append('<span class="little-bar"></span>');
            }
            $totalBars = $('.landing-slider .little-bar');
            $($totalSliderItems[0]).addClass('active');
            $($totalBars[0]).addClass('active');
            a.hideArrow();
            a.hideBar();
        },
        slideControl: function slideControl(autoPlay, playDelay) {
            var a = $.fadeoutSlider;
            a.autoPlay = autoPlay;
            a.playDelay = playDelay;
            // a.displayBar = displayBar;
            // a.displayArrow = displayArrow;

            if (a.autoPlay) {
                a.autoPlaySlide(a.playDelay);
                $('.landing-slider').on({
                    mouseover: function mouseover() {
                        a.stopAutoPlay();
                    },
                    mouseleave: function mouseleave() {
                        a.autoPlaySlide(a.playDelay);
                    }
                });
            }
            // a.hideArrow();
            // a.hideBar();
            a.arrowClick();
            a.barClick();
        },
        slidAnimation: function slidAnimation(direction) {
            var a = $.fadeoutSlider;
            if (a.sliderActive) {
                return;
            }
            a.sliderActive = true;

            if (direction == "next") {
                $($totalSliderItems[a.sliderCounter]).removeClass('active');
                $($totalSliderItems[a.sliderCounter + 1]).addClass('active');

                $($totalBars[a.sliderCounter]).removeClass('active');
                $($totalBars[a.sliderCounter + 1]).addClass('active');
                a.sliderCounter++;
            } else if (direction == "prev") {
                $($totalSliderItems[a.sliderCounter]).removeClass('active');
                $($totalSliderItems[a.sliderCounter - 1]).addClass('active');

                $($totalBars[a.sliderCounter]).removeClass('active');
                $($totalBars[a.sliderCounter - 1]).addClass('active');

                a.sliderCounter--;
            }

            if (a.sliderCounter > $totalSliderItems.length - 1) {

                a.sliderCounter = 0;
                $($totalSliderItems[$totalSliderItems.length - 1]).removeClass('active');
                $($totalBars[$totalSliderItems.length - 1]).removeClass('active');

                $($totalSliderItems[0]).addClass('active');
                $($totalBars[0]).addClass('active');
            } else if (a.sliderCounter < 0) {
                $($totalSliderItems[0]).removeClass('active');
                $($totalBars[0]).removeClass('active');

                $($totalSliderItems[$totalSliderItems.length - 1]).addClass('active');
                $($totalBars[$totalSliderItems.length - 1]).addClass('active');

                a.sliderCounter = $totalSliderItems.length - 1;
            }

            setTimeout(function () {
                a.sliderActive = false;
            }, 1500);
        },

        arrowClick: function arrowClick() {
            var a = $.fadeoutSlider;
            var $sliderPrev = $('.landing-slider .prev-arrow');
            var $sliderNext = $('.landing-slider .next-arrow');
            $sliderPrev.on('click', function () {
                a.slidAnimation('prev');
            });
            $sliderNext.on('click', function () {
                a.slidAnimation('next');
            });
        },

        autoPlaySlide: function autoPlaySlide(playDelay) {
            var a = $.fadeoutSlider;
            if (a.autoPlay) {
                a.autoSlider = setInterval(function () {
                    a.slidAnimation('next');
                    a.sliderActive = false;
                }, playDelay);
            }
        },

        stopAutoPlay: function stopAutoPlay() {
            var a = $.fadeoutSlider;
            clearInterval(a.autoSlider);
        },

        barClick: function barClick() {
            var a = $.fadeoutSlider;
            var $allBars = $('.landing-slider .little-bar');
            $allBars.on('click', function () {
                var theBarClicked = $(this).prevAll().length;
                $($totalSliderItems[a.sliderCounter]).removeClass('active');
                $($totalBars[a.sliderCounter]).removeClass('active');

                $($totalSliderItems[theBarClicked]).addClass('active');
                $($totalBars[theBarClicked]).addClass('active');

                a.sliderCounter = theBarClicked;
            });
        },

        hideBar: function hideBar() {
            var a = $.fadeoutSlider;
            if (!a.displayBar) {
                $('.landing-slider .little-bar-wrapper').addClass('hidden');
            }
        },

        hideArrow: function hideArrow() {
            var a = $.fadeoutSlider;
            if (!a.displayArrow) {
                console.log('aaaaaaa');
                $('.landing-slider .prev-arrow').addClass('hidden');
                $('.landing-slider .next-arrow').addClass('hidden');
            }
        }

    }
});

$(function () {
    $.fadeoutSlider.initial(true, true);
    $.fadeoutSlider.slideControl(false, 3000, true, true);
    var my_related = new image_slider('freesee-related-slider', 4, false, 5000, 500, true, false);

    $(window).on('load resize', function () {
        if (window.matchMedia('(max-width: 992px)').matches) {
            my_related.update_value(2);
        } else if (window.matchMedia('(max-width: 1200px)').matches) {
            my_related.update_value(3);
        } else {
            my_related.update_value(4);
        }
    });
});

$.extend({
    cm_freeseemedia_index: {
        initial: function initial() {
            var a = $.cm_freeseemedia_index;
            var set = {
                type: 'get',
                async: false
            };

            $.endPoint.Ajax('campaigns/{api}/customers/location', set, function (response) {
                a.country = response.countryCode;
                $.Local.set('crm-location', JSON.stringify(response));
                a.getCampaignProduct();
            });
        },
        getCampaignProduct: function getCampaignProduct() {
            // getting all products related to this campaign
            var a = $.cm_freeseemedia_index;

            var set = {
                type: 'get'
            };
            $.endPoint.Ajax('campaigns/{api}/products/prices/' + a.country, set, a.setCampaignProduct);
        },
        setCampaignProduct: function setCampaignProduct(data) {
            var a = $.cm_freeseemedia_index;

            if (data != null && data.length > 0) {
                var productIdArr = [];
                $(".display-wrapper .slider-item").each(function (i, ele) {
                    var productId = $(this).data("productid");
                    productIdArr.push(productId);
                });

                $(data).each(function () {
                    var dt = this;
                    $(".display-wrapper .slider-item").each(function (i, ele) {
                        var productId = $(ele).data("productid");
                        if (productId === dt.productId) {
                            $(ele).find('.slider-product-name>a').text(dt.productName);
                            $(ele).find('.slider-product-price').text(dt.productPrices.DiscountedPrice.FormattedValue);
                        }
                    });
                });
            }
        }
    }
});

$(document).ready($.cm_freeseemedia_index.initial);

/***/ })
/******/ ]);