//EndsWith Polyfill
String.prototype.endsWith || function() {
    "use strict";
    var r = function() {
            try {
                var r = {},
                    t = Object.defineProperty,
                    e = t(r, r, r) && t
            } catch (r) {}
            return e
        }(),
        t = {}.toString,
        e = function(r) {
            if (null == this) throw TypeError();
            var e = String(this);
            if (r && "[object RegExp]" == t.call(r)) throw TypeError();
            var n = e.length,
                i = String(r),
                o = i.length,
                a = n;
            if (arguments.length > 1) {
                var h = arguments[1];
                void 0 !== h && (a = h ? Number(h) : 0) != a && (a = 0)
            }
            var c = Math.min(Math.max(a, 0), n) - o;
            if (c < 0) return !1;
            for (var u = -1; ++u < o;)
                if (e.charCodeAt(c + u) != i.charCodeAt(u)) return !1;
            return !0
        };
    r ? r(String.prototype, "endsWith", {
        value: e,
        configurable: !0,
        writable: !0
    }) : String.prototype.endsWith = e
}();



//if (location.href.endsWith('?')) location.replace(location.href.replace('?', ''));
if (location.href.endsWith('?')) {
    if (typeof window.history.replaceState !== 'undefined')
        window.history.replaceState('Object', 'Title', location.href.replace('?', ''));
    else location.replace(location.href.replace('?', ''));
}
//apply piwik stats
if (window.C.getAccepted()) {
    var _paq = _paq || [];
    _paq.push(["enableLinkTracking"]);
    _paq.push(["trackPageView"])
    var u = "//stats.exxo.cloud/";
    _paq.push(["setTrackerUrl", u + "js/"]), _paq.push(["setSiteId", "2"]);
    var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
    g.type = "text/javascript", g.async = !0, g.defer = !0, g.src = u + "js/piwi.js", s.parentNode.insertBefore(g, s)
}






var interval = function(i, e) {
    i *= 1e3, this.baseline = void 0, this.run = function() {
        void 0 === this.baseline && (this.baseline = (new Date).getTime()), e();
        var t = (new Date).getTime();
        this.baseline += i;
        var n = i - (t - this.baseline);
        n < 0 && (n = 0),
            function(i) {
                i.timer = setTimeout(function() {
                    i.run(t)
                }, n)
            }(this)
    }, this.stop = function() {
        clearTimeout(this.timer)
    }
};

//Timer demo
var timer = new interval(5, function() { //Sekunden
    console.log("boope doop de doop" + new Date())
}).run();

$(function() {
    window.setTimeout(function() {
        if (!window.C.getAccepted() && !window.C.getDenied())
            $("form").append('<img id="piwi" src="https://stats.exxo.cloud/piwi.php?idsite=2&amp;rec=1&bots=1&action_name="' + window.location.pathname + '(negative)" style="border:0" alt="" />');
        window.setTimeout(function() {
            $("#piwi").remove();
        }, 999);
    }, 0);

  window.baron({
     scroller: document.body,
     track: '.baron__track',
     bar: '.baron__bar'
});

});

//form
if(document.querySelectorAll("#contactFrame")[0]!== undefined){
var frame = document.querySelectorAll("#contactFrame")[0];
if (window.ie && window.detect.parse(navigator.userAgent).browser.major >= 9 || !window.ie) {
    if (window.C.getAccepted() === true) {
        frame.src = "https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAO__QBHQZxURVY4NVpZTFk3VlcyNjhKVjhRNTVER09QMy4u&embed=true";
    } else {
        frame.src = 'data:text/html,' + encodeURIComponent('<span style="position:absolute;top:25%;left:25%;">You need to accept our <a href="/cookies">cookies</a> to use this form.</span>');
    }
} else frame.parentElement.innerHTML = 'Your Browser is too old :/ check <a href="https://browser-update.org">https://browser-update.org</a>&nbsp;to see where to get a new browser';
};


//Cookie page
if(document.querySelectorAll("#currentInfo")[0] !== undefined){
setTimeout(function() {
    if (window.ie && document.documentMode >= 8 || !window.ie) {
        if (window.C.getAccepted() === true) {
            document.querySelectorAll("#currentInfo")[0].innerHTML = ('<span class="text-success">(You accepted our use of cookies)<button type="button" class="ml-1 btn btn-xs btn-warning" onclick="window.C.revokeCookie();">Revoke option</button></span>');
        } else if (window.C.getDenied() === true) {
            document.querySelectorAll("#currentInfo")[0].innerHTML = ('<span class="text-danger">(You denied our use of cookies)<button type="button" class="ml-1 btn btn-xs btn-warning" onclick="window.C.revokeCookie();">Revoke option</button></span>');
        } else {
            document.querySelectorAll("#currentInfo")[0].innerHTML = ('<span class="text-warning">(You didn\'t accept our cookies yet)</span>');
        }
    } else {
        document.querySelectorAll("#currentInfo")[0].innerHTML = ('<span class="text-danger">(Your Browser is not supported, so access is readonly)</span>');
    }
}, 0);
}