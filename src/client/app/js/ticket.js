$.extend({
    cm_freeseemedia_ticket: {
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
            ticketSingleProductReview: "ticket/FreeseeTV/{orderNumber}/new",
            ticketSingleReviewList: "ticket/FreeseeTV/{orderNumber}/list",
            masterAccount: "FreeseeTV",
        },
        clone: {},
        orderList: {},

        initial: function() {
            var a = $.cm_freeseemedia_ticket;

            // retrive token from local
            a.getLocalAuthToken();

            // Check if loggin before else redirect
            a.hasAuthToken();

            //login Event Listener
            a.checkIfAuthExpired();

            //logout Event Listener
            a.logOut();

            // write review to customer service button event
            a.sumbitReview();
        },

        hasAuthToken: function() {
            var a = $.cm_freeseemedia_ticket;
            a.getLocalAuthToken();

            //if does not have auth token then redirect to login page
            if (a.auth.authToken === undefined && a.auth.authToken === null && a.auth.authToken.length === 0) {
                $.RedirectPage("../customerlogin.html", {});
            }
        },
        checkIfAuthExpired: function() {
            var a = $.cm_freeseemedia_ticket;

            var successPost = function(res) {
                a.orderList = res;

                a.renderTicketList(res);
                //a.singleProductAjax(res);
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
                async: false,
                dataType: 'json',
                success: successPost,
                error: errorPost,
                headers: {
                    "Authorization": "Bearer " + a.auth.authToken
                }
            });
        },
        logOut: function() {
            var a = $.cm_freeseemedia_ticket;

            $('.fontAwesomeIcon').on('click', '.logout-btn', function() {
                a.storeAuthToken('');
                $.RedirectPage("../customerlogin.html", {});
            });
        },
        storeAuthToken: function(token) {
            var a = $.cm_freeseemedia_ticket;

            $.Local.set('authToken', token);
        },
        getLocalAuthToken: function() {
            var a = $.cm_freeseemedia_ticket;

            a.auth.authToken = $.Local.has('authToken') ? $.Local.get('authToken') : $.Local.set('authToken', '');
            return true;
        },
        renderTicketList: function() {
            var a = $.cm_freeseemedia_ticket;
            var org = $('.aboutus-content');
            var clone = org.clone(true);
            a.clone = clone;
            var orderList = a.orderList;
            var i = 0,
                n = orderList.length;

            for (var index in orderList) {
                var html = $('.about-section');
                html.each(function() {
                    if ($(this).children().length > 0) {
                        $(this).html($(this).html().toString().replace('{productName}', orderList[index].productName));
                        $(this).html($(this).html().toString().replace('{productImageURL}', a.getProductImage(orderList[index].sku)));
                        $(this).html($(this).html().toString().replace('{orderNumber}', orderList[index].orderId));
                        $(this).html($(this).html().toString().replace('{productDate}', new Date(orderList[index].createDate).toDateString()));
                    }
                });
                i++;
                if (i < n) {
                    var org = $('.aboutus-content').last();
                    var clone = a.clone.clone(true);
                    clone.insertAfter(org);
                }
            }
        },
        getProductImage: function(productSku) {
            var a = $.cm_freeseemedia_ticket;

            if (productSku.length > 0 && productSku != null && productSku != undefined) {
                url = "https://tplwebapi.azurewebsites.net/product/" + productSku + "/image";
            }
            return url;
        },
        sumbitReview: function() {
            var a = $.cm_freeseemedia_ticket;

            $('.freeseemedia-customerservice-btn a').attr('href', 'javascript: void(0)');
            $('.aboutus-content').on('click', '.freeseemedia-customerservice-btn', function() {
                var parent = $(this).parents('.aboutus-content');
                var orderId = parent.find('.yotickets-order-number').text();

                // hide .freeseemedia-customerservice-btn
                $(this).addClass('hidden');

                // Ajax call for ticket message
                var singleTicket = a.singleTicketListAjax(orderId);
                var singleTicketListReponse = JSON.parse(singleTicket.responseText);


                if (singleTicketListReponse.length === 0) {
                    // Check if there are any reponses in the pass
                    parent.find('.message-textarea').removeClass('hidden');
                    parent.find('.freeseemedia-tickets-submit-btn').removeClass('hidden');

                    a.submitReviewAjax(parent, orderId);

                } else if (singleTicketListReponse != undefined && singleTicketListReponse != undefined && singleTicketListReponse.length > 0) {
                    // If there are reponses, render the message
                    var responseList = a.messageUriAjax((singleTicketListReponse));

                    responseList.forEach(function(messageData) {
                        var htmlAppend = a.reviewHtml(messageData);
                        parent.find('.ticket-table').append(htmlAppend);
                    });

                    parent.find('.message-textarea').removeClass('hidden');
                    parent.find('.freeseemedia-tickets-submit-btn').removeClass('hidden');
                    a.submitReviewAjax(parent, orderId);
                } else {
                    console.log("Error, unable to complete singleTicketListAjax request at this time.");
                }
            });
        },
        singleTicketListAjax: function(orderId) {
            var a = $.cm_freeseemedia_ticket;

            var afterSuccess = function(res) {
                console.log('successfully ajax ' + a.endPoint.ticketSingleReviewList.replace("{orderNumber}", orderId));
                return res;
            };

            var errorPost = function(res) {
                alert("Error, unable to complete " + a.endPoint.ticketSingleReviewList.replace("{orderNumber}", orderId) + " request at this time.");
                return res;
            };

            $.endPoint.BasicURL = a.endPoint.BasicURL;
            var url = a.endPoint.ticketSingleReviewList.replace("{orderNumber}", orderId);

            return $.ajax({
                type: "GET",
                url: $.endPoint.BasicURL = a.endPoint.BasicURL + url,
                async: false,
                dataType: 'json',
                success: afterSuccess,
                error: errorPost,
                headers: {
                    "Authorization": "Bearer " + a.auth.authToken
                }
            });
        },
        submitReviewAjax: function(parent, orderId) {
            var a = $.cm_freeseemedia_ticket;

            parent.on('click', '.freeseemedia-tickets-submit-btn>a>button', function() {
                var inputValue = parent.find('.message-textarea').val();

                var afterSuccess = function(res) {
                    a.orderList = res;

                    parent.find('.freeseemedia-tickets-submit-btn').addClass('hidden');
                    parent.find('.message-textarea').addClass('hidden');
                    alert("Your message has been sent!");
                    return res;
                };
                var errorPost = function(res) {
                    alert("Error, unable to complete your request at this time.");
                    return res;
                };

                var body = {
                    subject: "FreeSeeTV Customer Service " + orderId,
                    body: "" + inputValue
                };

                var postData = body;
                if (inputValue.length > 0 && inputValue != null) {
                    var set = {
                        type: 'post',
                        data: JSON.stringify(postData),
                        success: afterSuccess,
                        error: errorPost,
                        headers: {
                            "Authorization": "Bearer " + a.auth.authToken
                        }
                    };
                    $.endPoint.BasicURL = a.endPoint.BasicURL;
                    var url = a.endPoint.ticketSingleProductReview.replace("{orderNumber}", orderId);
                    $.endPoint.Ajax(url, set);
                } else {
                    alert("Error, unable to complete your request at this time.");
                }
            });
        },
        messageUriAjax: function(singleTicketListReponse) {
            var responseList = [];

            singleTicketListReponse.forEach(function(arr) {
                var ele = arr.ticket.messages;
                var messagesData = {
                    customerMessage: {
                        messageUri: "",
                        sender: "You",
                        receivedDate: ""
                    },
                    customerServiceMessage: {
                        messageUri: "",
                        sender: "",
                        receivedDate: ""
                    }
                };

                ele.forEach(function(obj) {
                    if (obj.isCustomerMessage === true) {
                        messagesData.customerMessage.messageUri = messageAjax(obj.messageUri);
                        messagesData.customerMessage.receivedDate = obj.receivedDate;
                    }
                    if (obj.isCustomerMessage === false) {
                        messagesData.customerServiceMessage.messageUri = messageAjax(obj.messageUri);
                        messagesData.customerServiceMessage.sender = "Customer Service";
                        messagesData.customerServiceMessage.receivedDate = obj.receivedDate;
                    }
                });
                responseList.push(messagesData);
            });

            function messageAjax(messageUri) {

                var response = '';
                var afterSuccess = function(res) {
                    response = res;
                    return res;
                };
                var errorPost = function(res) {
                    console.log("Error, unable to complete your messageAjax request at this time." + messageUri);
                    return res;
                };

                var set = {
                    type: 'get',
                    success: afterSuccess,
                    error: errorPost,
                };

                $.ajax({
                    type: "GET",
                    url: messageUri,
                    async: false,
                    success: afterSuccess,
                    error: errorPost,
                });
                return response;
            }
            return responseList;
        },
        reviewHtml: function(messagesData) {
            var dt = messagesData;
            var topDiv = '';

            if (dt != null && dt != undefined) {
                topDiv = $('<div class="review-message"></div>');

                // append customer service message
                var csm = dt.customerServiceMessage;
                if (csm.messageUri.length > 0 && csm.messageUri != null && csm.messageUri != undefined) {
                    var customerService = $('<div class="customerService-message"></div>');
                    topDiv.append(customerService);

                    var csmHeader = $('<div class="customerService-message-header"></div>');
                    var csmAuthor = $('<p class="cs-message-author">' + csm.sender + '</p>');
                    var csmDate = $('<p class="cs-message-date">' + new Date(csm.receivedDate).toDateString() + '</p>');
                    customerService.append(csmHeader);
                    csmHeader.append(csmAuthor);
                    csmHeader.append(csmDate);

                    var csmBody = $('<div class="cs-message-body"></div>');
                    var csmText = csm.messageUri;
                    customerService.append(csmBody);
                    csmBody.append(csmText);
                }

                // append customer  message
                var cs = dt.customerMessage;
                if (cs.messageUri.length > 0 && cs.messageUri != null && cs.messageUri != undefined) {
                    var customer = $('<div class="customer-message"></div>');
                    topDiv.append(customer);

                    var csHeader = $('<div class="customer-message-header"></div>');
                    var csAuthor = $('<p class="cs-message-author">' + cs.sender + '</p>');
                    var csDate = $('<p class="cs-message-date">' + new Date(cs.receivedDate).toDateString() + '</p>');
                    customer.append(csHeader);
                    csHeader.append(csAuthor);
                    csHeader.append(csDate);

                    var csBody = $('<div class="cs-message-body"></div>');
                    var csText = cs.messageUri;
                    customer.append(csBody);
                    csBody.append(csText);
                }
            }
            return topDiv;
        }
    }
});
$(document).ready($.cm_freeseemedia_ticket.initial);