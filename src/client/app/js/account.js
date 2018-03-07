$.extend({
    cm_freeseemedia_account: {
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
            orderSingleProductReview: "ticket/FreeseeTV/2268081/new",
            masterAccount: "FreeseeTV",
        },

        initial: function() {
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

        hasAuthToken: function() {
            var a = $.cm_freeseemedia_account;
            a.getLocalAuthToken();

            //if does not have auth token then redirect to login page
            if (a.auth.authToken === undefined && a.auth.authToken === null && a.auth.authToken.length === 0) {
                $.RedirectPage("../customerlogin.html", {});
            }
        },
        checkIfAuthExpired: function() {
            var a = $.cm_freeseemedia_account;

            var successPost = function(res) {
                console.log(res);
                return res;
            };
            var errorPost = function(res) {
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
        logOut: function() {
            var a = $.cm_freeseemedia_account;

            $('.fontAwesomeIcon').on('click', '.logout-btn', function() {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
            });
        },
        storeAuthToken: function(token) {
            var a = $.cm_freeseemedia_account;

            $.Local.set('authToken', token);
        },
        getLocalAuthToken: function() {
            var a = $.cm_freeseemedia_account;

            a.auth.authToken = $.Local.has('authToken') ? $.Local.get('authToken') : $.Local.set('authToken', '');
            return true;
        },
    }
});
$(document).ready($.cm_freeseemedia_account.initial);