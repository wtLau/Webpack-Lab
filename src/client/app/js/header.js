$.extend({
    cm_freeseemedia_header: {
        parents: [],
        initial: function() {
            var a = $.cm_freeseemedia_header;
            a.sortSubMenuByData();
            a.subMenuIcon();
            a.hamburgerMenuControl();
            a.subMenuControl();
            // a.mediaQuery();
            a.stickyHeader();
        },
        sortSubMenuByData: function() {
            var a = $.cm_freeseemedia_header;
            var sbmenus = $("div.HeadMenus>div.SubMenu");
            sbmenus.sort(function(a, b) {
                return $(a).text() > $(b).text();
            }).each(function() {
                var parent = $(this).data("parent");
                if (a.parents.length === 0 || a.parents.filter(function(b) { return b === parent; }).length === 0) {
                    a.parents.push(parent);
                }
            });
            var menus = $("div.HeadMenus>div.HeadMenuItem");
            a.parents.forEach(function(b, c) {
                menus.each(function() {
                    if ($(this).hasClass(b)) {
                        var submenus = $("<div></div>").addClass("submenuframe");
                        var submenu = sbmenus.toArray().filter(function(d) { return $(d).data("parent") === b; });
                        submenus.append(submenu);
                        $(this).append(submenus);
                    }
                });
            });
        },
        hamburgerMenuControl: function() {
            var a = $.cm_freeseemedia_header;
            $(".hamburgerIcon-main").click(function() {
                $('.hamburgerIcon-main').toggleClass('hidden');
                $(".HeadMenus").parent('.HeaderMenus').toggleClass('showMenu');
            });
        },
        subMenuIcon: function() {
            var a = $.cm_freeseemedia_header;
            var uniqueParent = a.parents;
            uniqueParent.forEach(function(arr) {
                if (arr.length) {
                    $('.' + arr).append("<div class='subMenuIcon-main icon-plus'><a href='#'><i class='fa fa-plus'></i></a></div>");
                    $('.' + arr).append("<div class='subMenuIcon-main icon-minus hidden'><a href='#'><i class='fa fa-minus'></i></a></div>");
                }
            });
            $('.submenuframe').children().removeClass('hidden');
        },
        subMenuControl: function() {
            $('.HeadMenuItem').click(function() {
                $(this).toggleClass('showSubMenu');
                $(this).find('.subMenuIcon-main').toggleClass('hidden');
            });
        },
        stickyHeader: function() {
            var mq = window.matchMedia('(max-width: 992px)');
            $(window).scroll(function() {
                if (!mq.matches) {
                    if ($(window).scrollTop() > 1) {
                        $('.header').addClass("sticky");
                    } else {
                        $('.header').removeClass("sticky");
                    }
                }
            });
        },
    }
});
$(document).ready($.cm_freeseemedia_header.initial);