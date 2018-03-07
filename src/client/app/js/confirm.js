$.extend({
    cm_freeseemedia_confirm: {
        postData: {},
        checkoutResponse: {},
        clone: {},
        chargedPrice: 0.00,
        initial: function() {
            var a = $.cm_freeseemedia_confirm;

            a.postData = JSON.parse($.Local.get('checkoutSuccessProductDetail'));
            a.checkoutResponse = JSON.parse($.Local.get('checkoutSuccessReponse'));
            var org = $('.product-details');
            var clone = org.clone(true);
            a.clone = clone;
            clone.clone(true).insertAfter(org);
            org.remove();
            a.setProductInfo();
            a.setOrderNumber();
        },
        setOrderNumber: function() {
            var a = $.cm_freeseemedia_confirm;

            var html = $('.customer-login-section, .section2');
            html.each(function() {
                if ($(this).children().length > 0) {
                    $(this).html($(this).html().toString().replace('{orderNumber}', a.checkoutResponse.shoppingCartNumber));
                    $(this).html($(this).html().toString().replace('{chargedPrice}', '$ ' + a.chargedPrice));
                    $(this).html($(this).html().toString().replace('{chargedTitle}', a.checkoutResponse.descriptor));
                }
            });
        },
        setProductInfo: function() {
            var a = $.cm_freeseemedia_confirm;

            var product = a.postData.products;
            var i = 0,
                n = product.length;

            a.chargedPrice = 0.00;
            product.forEach(function(ele) {
                a.replaceToken(ele);

                a.chargedPrice += (ele.quantity * ele.price) + ele.shippingPrice;
                i++;
                if (i < n) {
                    var org = $('.product-details').last();
                    var clone = a.clone.clone(true);
                    clone.insertAfter(org);
                }
            });
        },
        replaceToken: function(data) {
            var a = $.cm_freeseemedia_confirm;

            var html = $('.section2');
            var newHtml = html.each(function() {
                if ($(this).children().length > 0) {
                    $(this).html($(this).html().toString().replace('{productName}', data.productName));
                    $(this).html($(this).html().toString().replace('{quantity}', data.quantity));
                    $(this).html($(this).html().toString().replace('{price}', '$ ' + data.price.toFixed(2)));
                    $(this).html($(this).html().toString().replace('{shipping}', '$ ' + data.shippingPrice.toFixed(2)));
                    $(this).html($(this).html().toString().replace('{total}', '$ ' + (data.price * data.quantity).toFixed(2)));
                }
            });
        },
    }
});

$(document).ready($.cm_freeseemedia_confirm.initial);