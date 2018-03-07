$.extend({
    cm_freeseemedia_checkOut: {
        shoppingCartList: {},
        shoppingCartSessionId: '',
        totalPrice: 0.00,
        campaignProductList: {},

        initial: function() {
            var a = $.cm_freeseemedia_checkOut;

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
            var a = $.cm_freeseemedia_checkOut;

            var set = {
                type: 'get',
            };
            $.endPoint.Ajax('campaigns/{api}/products/prices/' + a.country, set, a.setCampaignProduct);
        },
        setCampaignProduct: function(data) {
            var a = $.cm_freeseemedia_checkOut;

            a.campaignProductList = data;

            // get cart data from sessionId 
            a.getCartInfo();
        },
        getCartInfo: function() {
            var a = $.cm_freeseemedia_checkOut;

            // clear all data
            $('.products-container').empty();

            a.shoppingCartSessionId = $.Local.has('shoppingCartSessionId') ? $.Local.get('shoppingCartSessionId') : '';

            var shoppingCartSessionId = a.shoppingCartSessionId;
            var set = {
                type: 'get',
            };
            if ((shoppingCartSessionId != null) && (shoppingCartSessionId.length > 0)) {
                $.endPoint.Ajax('shoppingcart/{api}?sessionId=' + shoppingCartSessionId, set, a.renderCartInfo);
            } else {
                $.RedirectPage("cartsummary.html", {});
            }
        },
        renderCartInfo: function(data) {
            var a = $.cm_freeseemedia_checkOut;

            a.totalPrice = 0.00;
            a.shoppingCartList = data;
            var cartList = data;
            var cartProduct = cartList.products;
            if ((cartProduct !== null) && (cartProduct !== undefined) && (cartProduct.length !== 0)) {
                for (var productIndex in cartProduct) {
                    var productKey = cartProduct[productIndex].productId;
                    var productName = cartProduct[productIndex].productName;
                    var productUrl = '#';
                    var productImgurl = a.getProductImage(cartProduct[productIndex].productId);
                    var quantity = cartProduct[productIndex].quantity;
                    var productPrice = (cartProduct[productIndex].price * quantity).toFixed(2);
                    var shippingPrice = cartProduct[productIndex].shippingPrice;
                    a.totalPrice += Number(productPrice);

                    var product = a.htmlProduct(productKey, productName, productPrice, productUrl, productImgurl, quantity, shippingPrice);
                    $('.products-container').append(product);
                }
            } else {
                $.RedirectPage("cartsummary.html", {});
            }
            $('.total-price p').text('$ ' + (a.totalPrice).toFixed(2));
        },
        getProductImage: function(productId) {
            var a = $.cm_freeseemedia_checkOut;
            var rt = "";
            a.campaignProductList.forEach(function(ele, i) {
                var product = ele;
                if (product.productId.toString() == productId.toString()) {
                    url = "https://tplwebapi.azurewebsites.net/product/" + product.sku + "/image";
                }
            });
            return url;
        },
        htmlProduct: function(productKey, productName, productPrice, productUrl, productImgUrl, productQuantity, shippingPrice, productSubTotal) {
            var product = $("<div></div>").addClass("product-item Product_" + productKey).attr("data-productid", productKey).attr("id", productKey);

            var imgWrapper = $("<div></div>").addClass("product-img");
            imgWrapper.appendTo(product);
            var nameWrapper = $("<div></div>").addClass("product-name");
            nameWrapper.appendTo(product);
            var priceWrapper = $("<div></div>").addClass("product-price").attr("data-productid", productKey);
            priceWrapper.appendTo(product);

            var productImg = $("<img></img>").attr("src", productImgUrl).attr("alt", productName);
            productImg.appendTo(imgWrapper);
            var quantity = $("<p></p>").addClass("product-quantity").text(productQuantity).attr("data-productid", productKey);
            quantity.appendTo(imgWrapper);
            var name = $("<p></p>").text(productName).attr("data-productid", productKey);
            name.appendTo(nameWrapper);
            var price = $("<p></p>").text('$ ' + productPrice).attr("data-productid", productKey);
            price.appendTo(priceWrapper);

            return (product);
        },
    }
});
$(document).ready($.cm_freeseemedia_checkOut.initial);