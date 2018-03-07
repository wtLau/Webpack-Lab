$.extend({
    cm_freeseemedia_order: {
        auth: {
            authToken: '',
            username: '',
            orderNumber: '',
            expiresIn: '',
        },
        endPoint: {
            BasicURL: "https://emanage-prod-csm-api.azurewebsites.net/",
            logIn: "customer/auth",
            orderList: "order/FreeseeTV/list",
            orderSingleProduct: "order/FreeseeTV/",
            orderSingleProductReview: "ticket/FreeseeTV/2268081/new",
            ticketSingleProductReview: "ticket/FreeseeTV/{orderNumber}/new",
            masterAccount: "FreeseeTV",
        },
        clone: {},
        orderList: {},
        totalPrice: 0.00,
        address: '',
        currencySign: '',

        initial: function() {
            var a = $.cm_freeseemedia_order;

            // retrive token from local
            a.getLocalAuthToken();

            // Check if loggin before else redirect
            a.hasAuthToken();

            //login Event Listener
            a.checkIfAuthExpired();

            //logout Event Listener
            a.logOut();

            // write review to customer service button event
            a.showTextArea();
            a.submitReview();
        },

        hasAuthToken: function() {
            var a = $.cm_freeseemedia_order;
            a.getLocalAuthToken();

            //if does not have auth token then redirect to login page
            if (a.auth.authToken === undefined && a.auth.authToken === null && a.auth.authToken.length === 0) {
                $.RedirectPage("../customerlogin.html", {});
            }
        },
        checkIfAuthExpired: function() {
            var a = $.cm_freeseemedia_order;

            var successPost = function(res) {
                a.orderList = res;

                a.renderOrderList(res);
                return res;
            };

            var errorPost = function(res) {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
                return res;
            };

            var set = {
                type: "GET",
                url: url,
                dataType: 'json',
                success: successPost,
                error: errorPost,
                headers: {
                    "Authorization": "Bearer " + a.auth.authToken
                }
            };
            // change the basicURL to https: //emanage-prod-csm-api.azurewebsites.net/
            $.endPoint.BasicURL = a.endPoint.BasicURL;

            var url = a.endPoint.orderList;

            $.endPoint.Ajax(url, set);
        },
        logOut: function() {
            var a = $.cm_freeseemedia_order;

            $('.fontAwesomeIcon').on('click', '.logout-btn', function() {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
            });
        },
        storeAuthToken: function(token) {
            var a = $.cm_freeseemedia_order;

            $.Local.set('authToken', token);
        },
        getLocalAuthToken: function() {
            var a = $.cm_freeseemedia_order;

            a.auth.authToken = $.Local.has('authToken') ? $.Local.get('authToken') : $.Local.set('authToken', '');
            return true;
        },
        renderOrderList: function() {
            var a = $.cm_freeseemedia_order;
            var org = $('.orders-products-container').removeClass('hidden');
            var clone = org.clone(true);
            a.clone = clone;
            var orderList = a.orderList;
            var i = 0,
                n = orderList.length;
            var orderPriceUSD = '';
            var totalPrice = '';
            var address = '';
            var orderStatus = '';

            for (var index in orderList) {
                var html = $('.orders-products-container');
                if (orderList[index].orderId) {
                    a.singleProductAjax(orderList[index].orderId);
                }
                html.each(function() {
                    if ($(this).children().length > 0) {
                        $(this).html($(this).html().toString().replace('{productName}', orderList[index].productName));
                        $(this).html($(this).html().toString().replace('/contentAsset/raw-data/0cbc178c-7c7d-48b5-a6cb-583c85effa2a/fileAsset?language_id=1', a.getProductImage(orderList[index].sku)));
                        $(this).html($(this).html().toString().replace('{productStatus}', orderList[index].orderStatus));
                        $(this).html($(this).html().toString().replace('{productId}', '<div class="productID">' + orderList[index].orderId + '</div>'));
                        $(this).html($(this).html().toString().replace('{productDate}', new Date(orderList[index].createDate).toDateString()));
                    }
                });
                i++;
                if (i < n) {
                    var org = $('.orders-products-container').last();
                    clone = a.clone.clone(true);
                    clone.insertAfter(org);
                }

                $('.please-wait').remove();
            }

            var orderInfo = $('.yourOrder-info').removeClass('hidden');
            orderInfo.each(function() {
                if ($(this).children().length > 0) {
                    $(this).html($(this).html().toString().replace('{orderDataPlaced}', new Date(orderList[0].createDate).toDateString()));
                    // $(this).html($(this).html().toString().replace('{orderTotalPrice}', a.currencySign + " " + (a.totalPrice)));
                    // $(this).html($(this).html().toString().replace('{orderAddressPlaced}', a.address ? a.address : ''));
                }
            });
        },
        singleProductAjax: function(orderId) {
            var a = $.cm_freeseemedia_order;

            var successPost = function(res) {

                a.response = res;
                var response = res;

                var orderPriceUSD = response.currencySign + " " + response.orderPriceUSD;
                var orderStatusArrLength = response.statusHistory.length - 1;
                var orderStatus = response.statusHistory[orderStatusArrLength].statusName;

                if (response.address != null & response.address != undefined) {
                    var address = response.address.address1 + ', ' + response.address.city + ', ' + response.address.countryName;
                }

                a.currencySign = response.currencySign;

                a.totalPrice += response.orderPriceUSD;

                $(".account-order-shipto .aboutus-content-details").text(address);
                $(".account-order-total .aboutus-content-details").text(a.currencySign + " " + (a.totalPrice).toFixed(2));

                var thisProduct = $('.productID:contains(' + orderId + ')').parents('.orders-products-container');
                $(thisProduct).html($(thisProduct).html().toString().replace('{productPrice}', '<span class="productPrice">' + orderPriceUSD + '</span>'));

                // Render order progress bar base on status
                a.orderStatusProgress(thisProduct, orderStatus);
                return res;
            };
            var errorPost = function(res) {
                console.log('Failed to get ' + orderId + 'information');
                return res;
            };

            // change the basicURL to https://emanage-prod-csm-api.azurewebsites.net/
            $.endPoint.BasicURL = a.endPoint.BasicURL;

            var url = a.endPoint.orderSingleProduct + orderId;

            var set = {
                type: "GET",
                url: url,
                async: true,
                dataType: 'json',
                success: successPost,
                error: errorPost,
                headers: {
                    "Authorization": "Bearer " + a.auth.authToken
                }
            };

            $.endPoint.Ajax(url, set);
        },
        orderStatusProgress: function(org, orderStatus) {
            var a = $.cm_freeseemedia_order;

            switch (orderStatus) {
                case 'New':
                    org.find('.yoorders-progress__first').addClass('is-active');
                    break;
                case 'Paid':
                    org.find('.yoorders-progress__first').removeClass('is-active').addClass('is-complete');
                    org.find('.yoorders-progress__second').addClass('is-complete');
                    org.find('.yoorders-progress__third').addClass('is-active');
                    break;
                case 'Delivered':
                    org.find('.yoorders-progress__first').removeClass('is-active').addClass('is-complete');
                    org.find('.yoorders-progress__second').addClass('is-complete');
                    org.find('.yoorders-progress__third').addClass('is-complete');
                    org.find('.yoorders-progress__foruth').addClass('is-complete');
                    org.find('.yoorders-progress__last').addClass('is-active');
                    break;
                case 'Refunded':
                    org.find('.yoorders-progressbar').empty();
                    org.find('.yoorders-progressbar').append('<h2 class="text-center pt-40">Order ' + orderStatus + '</h2>');
                    org.find('.single-product-btn').addClass('hidden');
                    break;
                case 'Cancel':
                    org.find('.yoorders-progressbar').empty();
                    org.find('.yoorders-progressbar').append('<h2 class="text-center pt-40">Order ' + orderStatus + '</h2>');
                    org.find('.single-product-btn').addClass('hidden');
                    break;
            }
        },
        getProductImage: function(productSku) {
            var a = $.cm_freeseemedia_order;
            var url = '';

            if (productSku.length > 0 && productSku != null && productSku != undefined) {
                url = "https://tplwebapi.azurewebsites.net/product/" + productSku + "/image";
            }
            return url;
        },
        showTextArea: function() {
            var a = $.cm_freeseemedia_order;

            $('.single-product-btn a, .freeseemedia-order-submit-btn a').attr('href', "javascript:void(0)");
            $('.orders-products-container').on('click', '.single-product-btn>a>button', function(e) {
                e.preventDefault();
                $(this).addClass('hidden');
                var parent = $(this).parents('.orders-products-container');
                parent.find('.message-textarea').removeClass('hidden');
                parent.find('.freeseemedia-order-submit-btn').removeClass('hidden');
            });
        },
        submitReview: function() {
            var a = $.cm_freeseemedia_order;

            $('.orders-products-container').on('click', '.freeseemedia-order-submit-btn>a>button', function() {
                var parent = $(this).parents('.orders-products-container');
                var inputValue = parent.find('.message-textarea').val();
                var orderId = parent.find('.productID').text();

                var afterSuccess = function(res) {
                    a.orderList = res;

                    parent.find('.freeseemedia-order-submit-btn').addClass('hidden');
                    parent.find('.message-textarea').addClass('hidden');
                    alert("Your message has been sent!");
                    return res;
                };
                var errorPost = function(res) {
                    alert("Error, unable to complete your request at this time.");
                    return res;
                };

                var postData = {
                    subject: "FreeSeeTV Customer Service Request Refund" + orderId,
                    body: "" + inputValue
                };

                if (inputValue.length > 0 && inputValue != null && orderId.length > 0 && orderId != null) {
                    var set = {
                        type: 'post',
                        data: JSON.stringify(postData),
                        success: afterSuccess,
                        error: errorPost,
                        headers: {
                            "Authorization": "Bearer " + a.auth.authToken
                        }
                    };

                    // change the basicURL to https://emanage-prod-csm-api.azurewebsites.net/                    
                    $.endPoint.BasicURL = a.endPoint.BasicURL;

                    var url = a.endPoint.ticketSingleProductReview.replace("{orderNumber}", orderId);

                    $.endPoint.Ajax(url, set);
                } else {
                    alert("Error, unable to complete your request at this time.");
                }
            });
        }
    }
});
$(document).ready($.cm_freeseemedia_order.initial);