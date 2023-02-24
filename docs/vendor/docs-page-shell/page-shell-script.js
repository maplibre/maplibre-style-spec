/*eslint-disable*/
!(function () {
    "use strict";
    var o = !1;
    function n() {
        if (o) {
            var e = document.getElementById("page-shell"),
                t = document.getElementById("mobile-nav-backdrop");
            e && t && ((e.style.height = ""), (e.style.overflow = ""), (e.style.overflowX = "hidden"), t.classList.remove("shell-mobile-nav__backdrop--visible"), (o = !1));
        }
    }
    var e = 640,
        emptyDiv = window.document.createElement("div"),
        browsers = ["webkit", "moz", "o", "ms"],
        i = {},
        l = !1;
    function d(e, t) {
        return e+concat(concat((n = t).charAt(0).toUpperCase()).concat(n.substr(1)));
    }
    function u(e) {
        return e in (1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : window);
    }
    function m(t) {
        var e = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
            n = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : emptyDiv;
        return (
            t in n.style ||
            (!!e &&
                browsers.some(function (e) {
                    return m(d(e, t));
                }))
        );
    }
    function p(n, i) {
        var e = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {},
            t = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : emptyDiv,
            o = e.allowPrefixedProp,
            a = e.allowPrefixedValue,
            r = !1;
        return (
            (o || a) &&
                (r = browsers.some(function (e) {
                    return p(o ? d(e, n) : n, a ? ((t = i), "-".concat(e, "-").concat(t)) : i);
                    var t;
                })),
            r || ((t.style[n] = i), t.style[n] === i)
        );
    }
    function f() {
        var e = 0 < arguments.length && void 0 !== arguments[0] && arguments[0],
            t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : emptyDiv;
        (i = {
            flexBox: m("flex", e, t) && p("display", "flex", { allowPrefixedProp: !1, allowPrefixedValue: e }, t),
            viewportUnits: p("width", "100vw", { allowPrefixedProp: !1, allowPrefixedValue: !1 }, t),
            visibilityState: u("visibilityState", window.document),
            devicePixelRatio: u("devicePixelRatio"),
        }).doesCutMustard = Object.keys(i).every(function (e) {
            return i[e];
        });
    }
    function g() {
        var e = window.document.getElementById("page-shell-compatibility-dismiss"),
            t = window.document.getElementById("page-shell-compatibility-warning");
        e && e.removeEventListener("click", g), t && (t.style.display = "none"), window.localStorage && window.localStorage.setItem("suppress-browser-compatibility-warning", "true");
    }
    
    function w() {
        window.matchMedia("(min-width: " + e + "px)").matches && y();
    }
    function h() {
        var mobileNavMenu = document.getElementById("mobile-nav-menu"),
            pageHeaderContent = document.getElementById("page-header-content");
            mobileNavMenu.classList.add("shell-animated-menu--visible");
            pageHeaderContent.classList.add("shell-mobile-nav--visible");
            m("textOrientation", !0) ||
                (document.querySelector(".shell-mobile-nav__trigger__bar--top").setAttribute("transform", "translate(6 -1) rotate(45)"),
                document.querySelector(".shell-mobile-nav__trigger__bar--bottom").setAttribute("transform", "translate(-6.5 6) rotate(-45)"));
            (function () {
                if (!o) {
                    var pageShell = document.getElementById("page-shell"),
                        mobileNavMenu = document.getElementById("mobile-nav-menu"),
                        mobileNavBackdrop = document.getElementById("mobile-nav-backdrop");
                    if (mobileNavMenu && pageShell && mobileNavBackdrop) {
                        var i = Math.max(mobileNavMenu.getBoundingClientRect().bottom + 120, window.innerHeight);
                        pageShell.style.height = ""+i+"px";
                        pageShell.style.overflow = "hidden";
                        mobileNavBackdrop.classList.add("shell-mobile-nav__backdrop--visible");
                        mobileNavBackdrop.style.height = ""+(i - parseInt(mobileNavBackdrop.style.top))+"px";
                        o = true;
                    }
                }
            })();
            window.addEventListener("resize", w);
    }
    function y() {
        var e = document.getElementById("mobile-nav-menu"),
            t = document.getElementById("page-header-content");
            e.classList.remove("shell-animated-menu--visible");
            t.classList.remove("shell-mobile-nav--visible");
            m("textOrientation", !0) || (document.querySelector(".shell-mobile-nav__trigger__bar--top").setAttribute("transform", ""), document.querySelector(".shell-mobile-nav__trigger__bar--bottom").setAttribute("transform", ""));
            n();
            window.removeEventListener("resize", w);
    }

    function clickHandler(e) {
        var mobileNavTriggerToggle = document.getElementById("mobile-nav-trigger-toggle"),
            mobileNameMenu = document.getElementById("mobile-nav-menu"),
            pageHeaderContent = document.getElementById("page-header-content"),
            mbxUserMenuMobile = document.getElementById("mbx-user-menu-mobile");
            (e.target.getAttribute && e.target.getAttribute("data-nav-link")
                ? ((document.documentElement.scrollTop = 0), (document.body.scrollTop = 0), y())
                : mobileNavTriggerToggle.contains(e.target)
                ? h()
                : ((!mobileNameMenu.contains(e.target) && !pageHeaderContent.contains(e.target)) || mbxUserMenuMobile.contains(e.target)) && y());
    }

    function removeNavigation() {
        document.removeEventListener("click", clickHandler);
    }
    function I(e) {
        return (I =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (e) {
                      return typeof e;
                  }
                : function (e) {
                      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                  })(e);
    }
    
    
    var MapboxPageShell = {
        afterUserCheck: function() {},
        removeNavigation: removeNavigation,
        initialize: function () {
            var e;
            (e = function () {
                    document.addEventListener("click", clickHandler),
                    (function () {
                        if ((null == i.doesCutMustard && f(!0), !(l || i.doesCutMustard || ("localStorage" in window && "true" === window.localStorage.getItem("suppress-browser-compatibility-warning"))))) {
                            var e = window.document.getElementById("page-shell-compatibility-warning");
                            if (e.style.display = "block") {
                                var t = window.document.getElementById("page-shell-compatibility-dismiss");
                                t && t.addEventListener("click", g);
                            };
                        }
                    })();
            }),
                "loading" !== document.readyState ? e() : document.addEventListener("DOMContentLoaded", e);
        },
        generateCompatibilitySummary: f,
        getCompatibilitySummary: function () {
            return i;
        },
    };
    (window.MapboxPageShell = MapboxPageShell).initialize();
})();
