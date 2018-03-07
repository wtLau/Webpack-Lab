$.extend({
    cm_freeseemedia_term: {
        termToken: {
            "companyEmail": "support@freeseemedia.com",
            "returnAddress": "Postbus 67 6670 AB ZETTEN, Netherlands",
        },
        initial: function() {
            var a = $.cm_freeseemedia_term;
            a.replaceToken();
        },
        clearToken: function() {
            var a = $.cm_freeseemedia_term;

            var objs = $('body *');
            objs.each(function() {
                if ($(this).children().length == 0) {
                    $(this).html($(this).html().toString().replace(/\{/g, '<h4><strong>').replace(/\}/g, '</strong></h4>'));
                }
            });
        },
        replaceToken: function() {
            var a = $.cm_freeseemedia_term;

            var objs = $('body *');
            objs.each(function() {
                if ($(this).children().length == 0) {
                    $(this).html($(this).html().toString().replace(/\{companyEmail\}/g, '<a href="mailto:' + a.termToken.companyEmail + '">' + a.termToken.companyEmail + '</a>'));
                    $(this).html($(this).html().toString().replace(/\{returnAddress\}/g, a.termToken.returnAddress));
                }
            });
            a.clearToken();
        },
    }
});

$(document).ready($.cm_freeseemedia_term.initial);