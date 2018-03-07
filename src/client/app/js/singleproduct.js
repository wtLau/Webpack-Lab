$.extend({
    cm_singleProduct: {
        product: {},
        country: '',
        city: '',
        price: '',
        //shoppingCartList: $.cm_freeseemedia_widget_miniCart.shoppingCartList,
        shoppingCartSessionId: '',
        totalPrice: 0.00,
        data: {
            checkOutPrice: $('.SinglePrice').text(),
        },
        initial: function() {
            var a = $.cm_singleProduct;
            a.qtyButton();
            a.tabController();
            var set = {
                type: 'get',
                async: false
            };

            $.endPoint.Ajax('campaigns/{api}/customers/location', set, function(response) {
                a.country = response.countryCode;
                $.Local.set('crm-location', JSON.stringify(response));
                a.getCampaignProduct();
            });


            // add new item to cart
            a.addProductToCart();

        },
        qtyButton: function() {
            var a = $.cm_singleProduct;

            $(".qty-input").prepend('<button disabled class="dec qty-button">-</button>');
            $(".qty-input").append('<button disabled class="inc qty-button">+</button>');

            $(".qty-button").on("click", function() {
                var $button = $(this);
                var oldValue = $button.parent().find("input").val();
                var newVal = '';
                if ($button.text() == "+") {
                    if (oldValue < 10) {
                        newVal = parseFloat(oldValue) + 1;
                    } else {
                        newVal = 10;
                    }
                } else {
                    // Don't allow decrementing below zero
                    if (oldValue > 1) {
                        newVal = parseFloat(oldValue) - 1;
                    } else {
                        newVal = 1;
                    }
                }
                $button.parent().find("input").val(newVal);
                $.cm_singleProduct.priceChangeOnQty(newVal);
            });
        },
        priceChangeOnQty: function(newVal) {
            var a = $.cm_singleProduct;
            var quantity = newVal;
            var price = Number(a.price.match(/\d+\.\d+/g).slice(''));

            if (!(price === null) || !(price === undefined)) {
                var newPrice = price * quantity;
                var twoDecimal = newPrice.toFixed(2);
                var finalPrice = '$' + twoDecimal;

                $('.SinglePrice').text(finalPrice);
                a.data.checkOutPrice = finalPrice;
            }
        },
        tabController: function() {
            //Tab Controller
            if ($('.info-wrapper').length) {
                $('<hr id=tab-hr>').insertAfter('.SingleProductTitle');
                $('<div class=product-tabs></div>').insertAfter('#tab-hr');
            }
            $('.ProductDesTitle').each(function() {
                $(this).appendTo('.product-tabs')
            });
            $(".ProductDesTitle:first").addClass('active');
            $('.ProductDetail:first').addClass('active');

            $('.ProductDesTitle').click(function(e) {
                e.preventDefault();
                var tab_id = $(this).attr('data-tab');

                $('.ProductDesTitle').removeClass('active');
                $('.ProductDetail').removeClass('active');
                $(this).addClass('active');
                $("." + tab_id).addClass('active');
            });
        },
        getCampaignProduct: function() {
            // getting all products related to this campaign
            var a = $.cm_singleProduct;

            var set = {
                type: 'get',
            };
            $.endPoint.Ajax('campaigns/{api}/products/prices/' + a.country, set, a.setCampaignProduct);
        },
        setCampaignProduct: function(data) {
            var a = $.cm_singleProduct;
            if (data != null && data.length > 0) {
                // store all product data in global js variable
                a.product = data;

                $(data).each(function() {
                    var dt = this;
                    var product = $(".PriceContainer .SinglePrice").attr('id');
                    if (Number(product) === this.productId) {
                        a.price = dt.productPrices.DiscountedPrice.FormattedValue;
                        $('.PriceContainer .SinglePrice').text(dt.productPrices.DiscountedPrice.FormattedValue).attr("data-productid", JSON.stringify(dt));
                        $('.PriceContainer button').removeAttr('disabled');
                        $(".qty-button").removeAttr('disabled');
                    }
                });
            }
            a.setCampaignSliderProduct(data);
        },
        addProductToCart: function() {
            var a = $.cm_singleProduct;

            $('.Checkout-btn').on('click', function() {

                var dt = $('.PriceContainer .SinglePrice').data("productid");
                var shoppingCartSessionId = a.shoppingCartSessionId;
                var productId = Number($('.PriceContainer .SinglePrice').attr('id'));
                var quantity = Number($('#btn-quantity').val());
                var price = dt.productPrices.DiscountedPrice.Value;
                var shippingMethodId = dt.shippings[0].shippingMethodId;

                var afterSuccess = function(data) {
                    var a = $.cm_singleProduct;
                    $.cm_freeseemedia_widget_miniCart.getCartProduct();
                };

                var errorPost = function(msg) {
                    console.log('ProductToCart ajax call to update product is not successful!')
                }

                var product = {
                    productId: productId,
                    quantity: quantity,
                    price: price,
                    shippingMethodId: shippingMethodId
                };

                var addSet = {
                    type: 'post',
                    data: JSON.stringify(product),
                    success: afterSuccess,
                    error: errorPost
                };



                var shoppingCartList = $.cm_freeseemedia_widget_miniCart.shoppingCartList;
                var shoppingCartProductList = shoppingCartList.products;


                // check if the product product has been created and if the productId matches with previously stored local productId
                var checkIfProductWasAdded = function() {
                    // putting all productid that is on the list in an array
                    var productIdArr = [];
                    for (var productIndex in shoppingCartProductList) {
                        var et = shoppingCartProductList[productIndex];
                        if (et.productId) {
                            productIdArr.push(et.productId);
                        } else {
                            return false;
                        }
                    }

                    // checking if the current product has already on the list
                    var match = productIdArr.indexOf(productId);
                    if (match > -1) {
                        return true;
                    } else if (match === -1) {
                        return false;
                    }
                };

                // check if localStorage has session ID
                if (($.Local.has('shoppingCartSessionId') && ($.Local.get('shoppingCartSessionId') != ''))) {
                    shoppingCartSessionId = $.Local.get('shoppingCartSessionId');
                    // check if the product has been created and if the productId matches with previously stored local productId                    
                    if (checkIfProductWasAdded() && (shoppingCartList != null) && (shoppingCartList != undefined)) {
                        for (var productIndex in shoppingCartProductList) {
                            var et = shoppingCartProductList[productIndex];
                            if (productId === et.productId) {
                                // Calculate total quantity with previously stored local variable and new input value
                                var newQuantity = et.quantity + quantity;
                                var putData = {
                                    sessionId: shoppingCartSessionId,
                                    productId: productId,
                                    quantity: newQuantity
                                };

                                // Ajax call to update shoppingcart product
                                var set = {
                                    type: 'put',
                                    success: afterSuccess,
                                    error: errorPost,
                                };
                                $.endPoint.Ajax('shoppingcart/{api}/update?sessionId=' + shoppingCartSessionId + '&productId=' + productId + '&quantity=' + newQuantity, set);
                            }
                        }
                    } else if (shoppingCartList) {
                        // add a new product when CartProductList exist but it is empty or this product has not been register
                        // Ajax call to add a new shoppingcart product
                        a.addShoppingCartEndpoint(shoppingCartSessionId, addSet);
                    }
                } else {
                    a.createCartSession();
                }
            });
        },
        addShoppingCartEndpoint: function(shoppingCartSessionId, addSet) {
            var set = addSet;
            $.endPoint.Ajax('shoppingcart/{api}/add?sessionId=' + shoppingCartSessionId, set);
        },
        createCartSession: function() {
            var a = $.cm_singleProduct;

            var dt = $('.PriceContainer .SinglePrice').data("productid");
            var productId = Number($('.PriceContainer .SinglePrice').attr('id'));
            var quantity = Number($('#btn-quantity').val());
            var price = dt.productPrices.DiscountedPrice.Value;
            var shippingMethodId = dt.shippings[0].shippingMethodId;

            var product = {
                productId: productId,
                quantity: quantity,
                price: price,
                shippingMethodId: shippingMethodId
            };
            var data = {
                product: product
            };

            var afterSuccess = function(response) {
                var a = $.cm_singleProduct;
                if ((response != null) && (response.length > 0)) {
                    $.Local.set('shoppingCartSessionId', response);
                    a.shoppingCartSessionId = response;
                    $.cm_freeseemedia_widget_miniCart.getCartProduct();
                } else {
                    a.errorpost();
                }
            };
            var errorpost = function(a, b, c) {
                console.log('error');
                // $.RedirectPage("/decline.html", {});
            };

            var set = {
                type: 'post',
                data: JSON.stringify(data),
                success: afterSuccess,
                error: errorpost
            };

            $.endPoint.Ajax('shoppingcart/{api}/new', set);

        },
        setCampaignSliderProduct: function(data) {
            var a = $.cm_singleProduct;

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
$(document).ready($.cm_singleProduct.initial);

$(window).on('load', function() {
    $('.main-image').css('background-image', $($('.slider-item')[0]).css('background-image'));
});
$('.product-gallery .slider-item').on('click', function() {
    var bg = $(this).css('background-image');
    $('.main-image').css('background-image', bg);
});

var gallery_thumb = new image_slider('product-gallery', 4, false, 5000, 500, true, false);
var freesee_related = new image_slider('freesee-related-slider', 4, false, 5000, 500, true, false);


$(window).on('load resize', function() {
    gallery_thumb.update_value(3);
    if (window.matchMedia('(max-width: 1024px)').matches) {
        gallery_thumb.update_value(3);
    } else {
        gallery_thumb.update_value(4);
    }

    if (window.matchMedia('(max-width: 992px)').matches) {
        freesee_related.update_value(2);
    } else if (window.matchMedia('(max-width: 1200px)').matches) {
        freesee_related.update_value(3);
    } else {
        freesee_related.update_value(4);
    }
});