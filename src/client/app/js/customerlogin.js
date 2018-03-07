$.extend({
    cm_freeseemedia_customerlogin: {
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
            orderSingleProduct: "order/FreeseeTV/2122586",
            orderSingleProductReview: "ticket/FreeseeTV/2268081/new"
        },

        initial: function() {
            var a = $.cm_freeseemedia_customerlogin;

            // retrive token from local
            a.getLocalAuthToken();

            // Check if loggin before
            a.isLoggedIn();

            //login Event Listener
            a.logIn();
        },

        isLoggedIn: function() {
            var a = $.cm_freeseemedia_customerlogin;
            a.getLocalAuthToken();

            //if has auth token then redirect to account page
            if (a.auth.authToken != undefined && a.auth.authToken != null && a.auth.authToken.length > 0) {
                $.RedirectPage("./account/account.html", {});
            }
        },
        logIn: function() {
            var a = $.cm_freeseemedia_customerlogin;

            $('#customer-login-form').submit(function(event) {
                event.preventDefault()
                var loginEmail = $('.customer-email').val();
                var loginPassword = $('.customer-password').val();

                var successPost = function(res) {
                    console.log(res);

                    a.auth.authToken = res.token;
                    a.auth.username = res.email;
                    a.auth.orderNumber = res.orderNumber;
                    a.auth.expiresIn = res.expiresIn;

                    a.storeAuthToken(a.auth.authToken);

                    //Set expiry and save to cache
                    var expire = new Date();
                    a.auth.expiresIn = expire.setSeconds(expire.getSeconds() + a.auth.expiresIn);

                    // check if login already
                    a.isLoggedIn();

                    return res;
                };
                var errorPost = function(res) {
                    $('.login-error').removeClass('hidden');
                    return res;
                };
                var url = a.endPoint.BasicURL + a.endPoint.logIn;

                return $.ajax({
                    type: "POST",
                    url: url,
                    dataType: 'json',
                    success: successPost,
                    error: errorPost,
                    headers: {
                        "Authorization": "Basic " + btoa(loginEmail + ":" + loginPassword)
                    }
                });
            });
        },

        storeAuthToken: function(token) {
            var a = $.cm_freeseemedia_customerlogin;

            $.Local.set('authToken', token);
        },
        getLocalAuthToken: function() {
            var a = $.cm_freeseemedia_customerlogin;

            a.auth.authToken = $.Local.has('authToken') ? $.Local.get('authToken') : $.Local.set('authToken', '');
            return true;
        },
    }
});
$(document).ready($.cm_freeseemedia_customerlogin.initial);