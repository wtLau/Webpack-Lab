$.extend({
    paymentForms: {
        CreditCard: $('div.CreditCardForm, div.ShippingAddressForm, .checkout-button>a>button'),
        //PayPal: $('div.PayPalText, div.paypal-button'),
        //Boleto: $('div[name^="Boleto"], div.ShippingAddressForm, div.cta-button'),
        show: function(name) {
            for (var key in $.paymentForms) {
                if (typeof($.paymentForms[key]) !== "function") {
                    $.paymentForms[key].addClass('hidden');
                    $.paymentProcessors[key].object.find(".error-message").addClass('hidden');
                    $.paymentProcessors[key].object.find(".input-error").removeClass('input-error');
                }
            }
            for (var key in $.paymentForms) {
                if (typeof($.paymentForms[key]) !== "function") {
                    if (key.toLowerCase() == name.toLowerCase()) {
                        $.paymentForms[key].removeClass('hidden');
                    }
                }
            }
        }
    },
    order: {
        product: {},
        country: '',
        city: '',
        price: '',
        shoppingCartSessionId: '',
        paymentProcessor: null,
        customerForm: null,
        cardForm: null,
        addressForm: null,
        postData: {},
        //warrantyForm:$.warrantyProduct["WarrantyProduct"],
        initial: function() {
            var a = $.order;
            a.paymentProcessor = $.paymentProcessors;
            a.customerForm = $.CustomerInfor.EcomCustomerInfo;
            a.cardForm = $.creditCardForm;
            a.addressForm = $.AddressForm.EcomBillingAddress;

            // for (var key in $.paymentForms) {
            //     if (typeof($.paymentForms[key]) !== 'function') {
            //         $.paymentForms[key].addClass('hidden');
            //     }
            // }
            // $("div.cta-button").removeClass('hidden');

            // Set Payment Process Bar [creditcard] to be selected by default
            var $radios = $('.widget-PaymentMethod input:radio[name=PaymentMethod]');
            if ($radios.is(':checked') === false) {
                $radios.filter('[value=creditcard]').prop('checked', true);
                $radios.trigger('change');
            }

            $(".checkout-button>a").attr("href", "javascript:void(0)");
            $('.checkout-button>a>button').click(a.submit);
            //$('.paypal-button>span.button-container').click(a.submit);
            a.shoppingCartSessionId = $.Local.has('shoppingCartSessionId') ? $.Local.get('shoppingCartSessionId') : '';

            $.registerSession();
        },
        submit: function() {
            var a = $.order;
            if (a.beforeSubmit()) {
                a.postData = a.postData();
                var shoppingCartSessionId = a.shoppingCartSessionId;

                // register new customer address to fullfill checkout API requirement
                a.postNewCustomer(a.postData);
            }
        },
        postNewCustomer: function(data) {
            var a = $.order;

            var shoppingCartSessionId = $.Local.get('shoppingCartSessionId');
            var newCustomerData = {
                email: data.customer.email,
                useShippingAddressForBilling: data.useShippingAddressForBilling,
                shippingAddress: data.shippingAddress
            };

            var set = {
                type: 'post',
                data: JSON.stringify(newCustomerData),
                success: function() {
                    console.log('Successfully register new customer address to fullfill checkout requirement');
                    // checkout API to complete sale
                    a.postCheckout(a.postData);
                },
                error: function() {
                    console.log('fail to POST new customer address to fullfill checkout requirement');
                    a.errorpost();
                }
            };
            // add loading gif
            $('body').append("<div class='ajaxloading'></div>");
            $('.ajaxloading').append("<img class='ajaxloading-gif' src='/pub-assets/img/ajaxloading.gif' />");

            var newCustomerUrl = "shoppingcart/{api}/customers/new?sessionId=" + shoppingCartSessionId;
            $.endPoint.Ajax(newCustomerUrl, set);
        },
        postCheckout: function(data) {
            var a = $.order;

            // checkout API to complete sale
            var checkoutData = {
                behaviorId: 1,
                sessionId: data.sessionId,
                payment: data.payment,
                fraudSessionId: data.antiFraud.sessionId
            };


            var set = {
                type: 'post',
                data: JSON.stringify(checkoutData),
                success: a.afterSuccess,
                error: a.errorpost,
            };
            // store all product info before checkout, to render product receipt in confirm
            a.storeProductInfoBeforeCheckout();

            // final checkout AJAX call
            var checkoutUrl = "shoppingcart/{api}/checkout";
            $.endPoint.Ajax(checkoutUrl, set);
        },
        storeProductInfoBeforeCheckout: function() {
            shoppingCartSessionId = $.Local.get('shoppingCartSessionId');

            var set = {
                type: 'get',
            };
            if ((shoppingCartSessionId != null) && (shoppingCartSessionId.length > 0)) {
                $.endPoint.Ajax('shoppingcart/{api}?sessionId=' + shoppingCartSessionId, set, function(data) {
                    $.Local.set('checkoutSuccessProductDetail', JSON.stringify(data));
                });
            }
        },
        beforeSubmit: function() {
            var a = $.order;
            //a.product = $("input[type='radio']:checked").data("info");
            a.customerForm.checkForm();
            var paymentprocessor = a.paymentProcessor.form.paymentMethod;
            if (paymentprocessor != undefined) {
                switch (paymentprocessor.toLowerCase()) {
                    case "creditcard":
                        a.cardForm.checkForm();
                        a.addressForm.checkForm();
                        break;
                    case "boleto":
                    case "paypal":
                    default:
                        break;
                }
            }
            // if (a.product == undefined) {
            //     return false;
            // }
            if (paymentprocessor == undefined) {
                return false;
            }
            if ($(".input-error").length > 0) {
                return false;
            }
            return true;
        },
        postData: function() {
            var a = $.order;
            var cf = a.customerForm.form;
            var cus = {
                email: getData(cf["Email"]),
                phoneNumber: getData(cf["Phone"]),
                firstName: getData(cf["FirstName"]) == null ? getData(af["FirstName"]) : getData(cf["FirstName"]),
                lastName: getData(cf["LastName"]) == null ? getData(af["LastName"]) : getData(cf["LastName"]),
            };
            var pay = {};
            var paymentprocessor = a.paymentProcessor.form.paymentMethod;
            var af = a.addressForm.form;
            var addr = null;
            switch (paymentprocessor.toLowerCase()) {
                case "creditcard":
                    var cc = a.cardForm.form;
                    pay = {
                        name: cc.NameOnCard,
                        creditcard: cc.CreditCard,
                        creditCardBrand: cc.CreditCardType,
                        expiration: cc.ExpiryMonth + "/20" + cc.ExpiryYear,
                        cvv: cc.CVV
                    };
                    addr = {
                        firstName: getData(af["FirstName"]) == null ? getData(cf["FirstName"]) : getData(af["FirstName"]),
                        lastName: getData(af["LastName"]) == null ? getData(cf["LastName"]) : getData(af["LastName"]),
                        address1: getData(af["Address"]),
                        address2: getData(af["Address2"]),
                        city: getData(af["City"]),
                        zipCode: getData(af["Zipcode"]),
                        state: getData(af["Province"]),
                        countryCode: getData(af["Country"]),
                        phoneNumber: getData(af["Phone"]),
                    };
                    break;
                case "paypal":
                    pay = {
                        paymentProcessorId: 5
                    };
                    break;
                case "boleto":
                    pay = {
                        paymentProcessorId: 25
                    };
                default:
                    break;
            }
            var anti = null;
            a.shoppingCartSessionId = a.shoppingCartSessionId = $.Local.has('shoppingCartSessionId') ? $.Local.get('shoppingCartSessionId') : '';
            try { anti = JSON.parse($.Local.get("anti")); } catch (ex) { anti = null; }
            var formData = {
                //couponCode: $.Request.QueryString('coupon'),
                //shippingMethodId: a.product.shippings[0].shippingMethodId,
                comment: '',
                sessionId: a.shoppingCartSessionId,
                useShippingAddressForBilling: true,
                //productId: a.product.productId,
                customer: cus,
                payment: pay,
                shippingAddress: addr,
                //analytics: $.makeit(),
                //funnelBoxId: getData(a.warrantyForm.form["funnelID"], 0),
                antiFraud: {
                    sessionId: getData(anti.sessionId)
                }
            };
            return formData;
        },
        afterSuccess: function(data) {
            var a = $.order;
            if (data != null && data.success) {
                $.Local.set('shoppingCartSessionId', '');
                $.Local.set('checkoutSuccessReponse', JSON.stringify(data));

                //$.Local.set("paymentProcessorId", getData(data.paymentProcessorId));
                //$.Local.set("orderNumber", getData(data.orderNumber));
                if (data.callBackUrl) {
                    document.location = data.callBackUrl;
                } else if (data.paymentContinueResult && data.paymentContinueResult.actionUrl !== "") {
                    document.location = data.paymentContinueResult.actionUrl;
                } else {
                    $.RedirectPage("confirm.html", {});
                }
            } else {
                a.errorpost();
            }
        },
        errorpost: function() {
            $.RedirectPage("decline.html", {});
        }
    }
});
$(document).ready($.order.initial);