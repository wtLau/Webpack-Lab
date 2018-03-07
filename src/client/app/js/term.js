$.extend({
    cm_freeseemedia_term: {
        termToken: {
            "companyAddress": "9-21 Crawford Street, Dept 706",
            "companyEmail": "support@freeseemedia.com",
            "productsWebAddress": "www.freeseemedia.com",
            "province": "British Columbia",
            "economicArea": "European Economic Area (EEA)",
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
                    $(this).html($(this).html().toString().replace(/\{companyAddress\}/g, a.termToken.companyAddress));
                    $(this).html($(this).html().toString().replace(/\{companyEmail\}/g, '<a href="mailto:' + a.termToken.companyEmail + '">' + a.termToken.companyEmail + '</a>'));
                    $(this).html($(this).html().toString().replace(/\{productsWebAddress\}/g, '<a href="mailto:' + a.termToken.productsWebAddress + '">' + a.termToken.productsWebAddress + '</a>'));
                    $(this).html($(this).html().toString().replace(/\{province\}/g, a.termToken.province));
                    $(this).html($(this).html().toString().replace(/\{economicArea\}/g, a.termToken.economicArea));
                    $(this).html($(this).html().toString().replace(/\{returnAddress\}/g, a.termToken.returnAddress));
                }
            });
            a.clearToken();
        },
    }
});

$(document).ready($.cm_freeseemedia_term.initial);