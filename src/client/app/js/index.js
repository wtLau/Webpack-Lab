import './account.js';

$.extend({
    fadeoutSlider: {
        initial: function(displayArrow, displayBar) {
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
        slideControl: function(autoPlay, playDelay) {
            var a = $.fadeoutSlider;
            a.autoPlay = autoPlay;
            a.playDelay = playDelay;
            // a.displayBar = displayBar;
            // a.displayArrow = displayArrow;

            if (a.autoPlay) {
                a.autoPlaySlide(a.playDelay);
                $('.landing-slider').on({
                    mouseover: function() {
                        a.stopAutoPlay();
                    },
                    mouseleave: function() {
                        a.autoPlaySlide(a.playDelay);
                    }
                });
            }
            // a.hideArrow();
            // a.hideBar();
            a.arrowClick();
            a.barClick();
        },
        slidAnimation: function(direction) {
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

            setTimeout(function() {
                a.sliderActive = false;
            }, 1500);

        },

        arrowClick: function() {
            var a = $.fadeoutSlider;
            var $sliderPrev = $('.landing-slider .prev-arrow');
            var $sliderNext = $('.landing-slider .next-arrow');
            $sliderPrev.on('click', function() {
                a.slidAnimation('prev');
            });
            $sliderNext.on('click', function() {
                a.slidAnimation('next');
            });
        },

        autoPlaySlide: function(playDelay) {
            var a = $.fadeoutSlider;
            if (a.autoPlay) {
                a.autoSlider = setInterval(function() {
                    a.slidAnimation('next');
                    a.sliderActive = false;
                }, playDelay);
            }
        },

        stopAutoPlay: function() {
            var a = $.fadeoutSlider;
            clearInterval(a.autoSlider);
        },

        barClick: function() {
            var a = $.fadeoutSlider;
            var $allBars = $('.landing-slider .little-bar');
            $allBars.on('click', function() {
                var theBarClicked = $(this).prevAll().length;
                $($totalSliderItems[a.sliderCounter]).removeClass('active');
                $($totalBars[a.sliderCounter]).removeClass('active');

                $($totalSliderItems[theBarClicked]).addClass('active');
                $($totalBars[theBarClicked]).addClass('active');

                a.sliderCounter = theBarClicked;
            });
        },

        hideBar: function() {
            var a = $.fadeoutSlider;
            if (!a.displayBar) {
                $('.landing-slider .little-bar-wrapper').addClass('hidden');
            }
        },

        hideArrow: function() {
            var a = $.fadeoutSlider;
            if (!a.displayArrow) {
                console.log('aaaaaaa');
                $('.landing-slider .prev-arrow').addClass('hidden');
                $('.landing-slider .next-arrow').addClass('hidden');
            }
        },

    },
});

$(function() {
    $.fadeoutSlider.initial(true, true);
    $.fadeoutSlider.slideControl(false, 3000, true, true);
    var my_related = new image_slider('freesee-related-slider', 4, false, 5000, 500, true, false);

    $(window).on('load resize', function() {
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
        initial: function() {
            var a = $.cm_freeseemedia_index;
            var set = {
                type: 'get',
                async: false
            };

            $.endPoint.Ajax('campaigns/{api}/customers/location', set, function(response) {
                a.country = response.countryCode;
                $.Local.set('crm-location', JSON.stringify(response));
                a.getCampaignProduct();
            });
        },
        getCampaignProduct: function() {
            // getting all products related to this campaign
            var a = $.cm_freeseemedia_index;

            var set = {
                type: 'get',
            };
            $.endPoint.Ajax('campaigns/{api}/products/prices/' + a.country, set, a.setCampaignProduct);
        },
        setCampaignProduct: function(data) {
            var a = $.cm_freeseemedia_index;

            if (data != null && data.length > 0) {
                var productIdArr = [];
                $(".display-wrapper .slider-item").each(function(i, ele) {
                    var productId = $(this).data("productid");
                    productIdArr.push(productId);
                });

                $(data).each(function() {
                    var dt = this;
                    $(".display-wrapper .slider-item").each(function(i, ele) {
                        var productId = $(ele).data("productid");
                        if (productId === dt.productId) {
                            $(ele).find('.slider-product-name>a').text(dt.productName);
                            $(ele).find('.slider-product-price').text(dt.productPrices.DiscountedPrice.FormattedValue);
                        }
                    })
                });
            }
        },
    }
});

$(document).ready($.cm_freeseemedia_index.initial);