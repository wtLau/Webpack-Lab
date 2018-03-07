$.extend({
    cm_freeseemedia_cartSummary: {
        shoppingCartList: {},
        shoppingCartSessionId: '',
        totalPrice: 0.00,
        timeout: null,
        campaignProductList: {},

        initial: function() {
            var a = $.cm_freeseemedia_cartSummary;

            a.shoppingCartSessionId = $.Local.has('shoppingCartSessionId') ? $.Local.get('shoppingCartSessionId') : '';
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
            var a = $.cm_freeseemedia_cartSummary;

            var set = {
                type: 'get',
                async: false,
                success: a.setCampaignProduct
            };
            $.endPoint.Ajax('campaigns/{api}/products/prices/' + a.country, set);
        },
        setCampaignProduct: function(data) {
            var a = $.cm_freeseemedia_cartSummary;

            a.campaignProductList = data;

            // get cart data from sessionId 
            a.getCartInfo();
        },
        getCartInfo: function() {
            var a = $.cm_freeseemedia_cartSummary;

            // clear all data
            $('.cart-table tbody').empty();
            $('.cart-table-wrapper, .total-price, .currency-unit, .checkout-button').addClass('hidden');
            $('.no-product-message').removeClass('hidden');
            var shoppingCartSessionId = a.shoppingCartSessionId;

            var set = {
                async: false,
                type: 'get',
                success: a.showCartInfo
            };
            if ((shoppingCartSessionId != null) && (shoppingCartSessionId.length > 0)) {
                $.endPoint.Ajax('shoppingcart/{api}?sessionId=' + shoppingCartSessionId, set);
            }
        },
        showCartInfo: function(data) {
            // render widget cart list
            var a = $.cm_freeseemedia_cartSummary;

            a.totalPrice = 0.00;
            a.shoppingCartList = data;
            var cartList = data;
            var cartProduct = cartList.products;
            if ((cartProduct !== null) && (cartProduct !== undefined) && cartProduct.length >= 1) {
                for (var productIndex in cartProduct) {
                    var productKey = cartProduct[productIndex].productId;
                    var productName = cartProduct[productIndex].productName;
                    var productPrice = (cartProduct[productIndex].price).toFixed(2);
                    var productUrl = '#';
                    var productImgurl = a.getProductImage(productKey);
                    var quantity = cartProduct[productIndex].quantity;
                    var shippingPrice = (cartProduct[productIndex].shippingPrice).toFixed(2);
                    var productSubTotal = (productPrice * quantity).toFixed(2);
                    a.totalPrice += Number(productSubTotal);

                    // dynamically render shopping cart base on receieved data
                    var product = a.htmlProduct(productKey, productName, productPrice, productUrl, productImgurl, quantity, shippingPrice, productSubTotal);
                    $('.cart-table tbody').append(product);
                    $('.no-product-message').addClass('hidden');
                    $('.cart-table-wrapper, .total-price, .currency-unit, .checkout-button').removeClass('hidden');
                }
            }
            $('.total-price p').text('Total: $' + (a.totalPrice).toFixed(2));
        },
        removeProduct: function() {
            var a = $.cm_freeseemedia_cartSummary;

            var productId = $(this).data("productid");
            var shoppingCartSessionId = a.shoppingCartSessionId;

            var afterSuccess = function(data) {
                a.getCartInfo();
                $.cm_freeseemedia_widget_miniCart.getCartProduct();
            };

            var errorpost = function() {
                console.log('ajax call to remove product is not successful!');
            };

            var set = {
                type: 'delete',
                success: afterSuccess,
                error: errorpost
            };
            $.endPoint.Ajax('shoppingcart/{api}/remove?sessionId=' + shoppingCartSessionId + '&productId=' + productId, set);
        },
        getProductImage: function(productId) {
            var a = $.cm_freeseemedia_cartSummary;

            a.campaignProductList.forEach(function(ele, i) {
                var product = ele;
                if (product.productId.toString() == productId.toString()) {
                    url = "https://tplwebapi.azurewebsites.net/product/" + product.sku + "/image";
                }
            });
            return url;
        },
        updateProductQuantity: function() {
            var a = $.cm_freeseemedia_cartSummary;
            //if already have a timout, clear it
            if (a.timeout != null) {
                clearTimeout(a.timeout);
            }


            var input = this;

            var ajaxCall = function(input) {
                var shoppingCartSessionId = a.shoppingCartSessionId;
                var productId = Number($(input).attr("data-productid"));
                var newQuantity = Number($(input).val());
                var afterSuccess = function(data) {
                    var a = $.cm_freeseemedia_cartSummary;
                    a.getCartInfo();
                    //update shopping cart
                    $.cm_freeseemedia_widget_miniCart.getCartProduct();
                };

                var errorPost = function(msg) {
                    console.log('ProductToCart ajax call to update product was not successful!')
                };

                var set = {
                    type: 'put',
                    success: afterSuccess,
                    error: errorPost
                };
                if (productId != null || productId != undefined || newQuantity != null || newQuantity != undefined) {
                    $.endPoint.Ajax('shoppingcart/{api}/update?sessionId=' + shoppingCartSessionId + '&productId=' + productId + '&quantity=' + newQuantity, set);
                    a.timeout = null;
                }
            };
            //start new time to perform 
            a.timeout = setTimeout(function() {
                ajaxCall(input);
            }, 500);

        },
        htmlProduct: function(productKey, productName, productPrice, productUrl, productImgUrl, quantity, shippingPrice, productSubTotal) {
            var a = $.cm_freeseemedia_cartSummary;

            var product = $("<tr></tr>").addClass("product-item " + productKey).attr("data-productid", productKey).attr("id", productKey);

            var imgWrap = $("<td></td>").addClass("product-thumbnail");
            imgWrap.appendTo(product);
            productImg = $("<div></div>").addClass("thumbnail-wrapper");
            productImg.appendTo(imgWrap);
            aImg = $("<a></a>").addClass("thumbnail-title").attr("href", productUrl).text(productName);
            aImg.appendTo(imgWrap);
            Img = $("<img></img>").attr("src", productImgUrl).attr("alt", productName);
            Img.appendTo(productImg);

            var price = $("<td></td>").addClass("product-price");
            price.appendTo(product);
            var productTitle = $("<span></span>").addClass("mobile-title").text("Price");
            var productValue = $("<span></span>").addClass("product-value").text(productPrice);
            productTitle.appendTo(price);
            productValue.appendTo(price);

            var productQuantity = $("<td></td>").addClass("product-quantity");
            productQuantity.appendTo(product);
            var quantityTitle = $("<span></span>").addClass("mobile-title").text("Quantity");
            var quantityInput = $("<span></span>").addClass("quantity-input");
            quantityTitle.appendTo(productQuantity);
            quantityInput.appendTo(productQuantity);
            var quantityButton = $("<input></input>").addClass("quantity-button").attr('value', quantity).attr("data-productid", productKey).keyup(a.updateProductQuantity);
            quantityButton.appendTo(quantityInput);

            var shipping = $("<td></td>").addClass("product-shipping");
            shipping.appendTo(product);
            var shippingTitle = $("<span></span>").addClass("mobile-title").text("Shipping");
            var shippingValue = $("<span></span>").addClass("product-value").text(shippingPrice);
            shippingTitle.appendTo(shipping);
            shippingValue.appendTo(shipping);

            var subtotal = $("<td></td>").addClass("product-subtotal");
            subtotal.appendTo(product);
            var subtotalTitle = $("<span></span>").addClass("mobile-title").text("Subtotal");
            var subtotalValue = $("<span></span>").addClass("product-value").text(productSubTotal);
            subtotalTitle.appendTo(subtotal);
            subtotalValue.appendTo(subtotal);

            var remove = $("<td></td>").addClass("product-remove");
            remove.appendTo(product);
            var removeTitle = $("<span></span>").addClass("mobile-title").text("Remove");
            var removeValue = $("<a></a>").addClass("product-value").attr("href", '#').attr("data-productid", productKey).text('X').click(a.removeProduct);
            removeTitle.appendTo(remove);
            removeValue.appendTo(remove);

            return (product);
        },
    }
});
$(document).ready($.cm_freeseemedia_cartSummary.initial);