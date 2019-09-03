"use strict";
window.ie = true;
// IE7 support for querySelectorAll in 274 bytes. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/
(function(d,s){d=document,s=d.createStyleSheet();d.querySelectorAll=function(r,c,i,j,a){a=d.all,c=[],r=r.replace(/\[for\b/gi,'[htmlFor').split(',');for(i=r.length;i--;){s.addRule(r[i],'k:v');for(j=a.length;j--;)a[j].currentStyle.k&&c.push(a[j]);s.removeRule(0)}return c}})();

//IE addEventListener
!function(e,t,n){if((!e.addEventListener||!e.removeEventListener)&&e.attachEvent&&e.detachEvent){var r=function(e){return"function"==typeof e},a=function(e,t){var n=t["x-ms-event-listeners"];if(n)for(var r,a=n.length;a--;)if((r=n[a])[0]===e)return r[1]},i=function(e){var n=t[e];t[e]=function(e){return c(n(e))}},o=function(n,i,o){if(r(i)){var v=this;v.attachEvent("on"+n,function(e,t,n){var r=t["x-ms-event-listeners"]||(t["x-ms-event-listeners"]=[]);return a(e,t)||(r[r.length]=[e,n],n)}(v,i,function(n){(n=n||e.event).preventDefault=n.preventDefault||function(){n.returnValue=!1},n.stopPropagation=n.stopPropagation||function(){n.cancelBubble=!0},n.target=n.target||n.srcElement||t.documentElement,n.currentTarget=n.currentTarget||v,n.timeStamp=n.timeStamp||(new Date).getTime(),i.call(v,n)}))}},v=function(e,t,n){if(r(t)){var i=a(this,t);i&&this.detachEvent("on"+e,i)}},c=function(e){var t=e.length;if(t)for(;t--;)e[t].addEventListener=o,e[t].removeEventListener=v;else e.addEventListener=o,e.removeEventListener=v;return e};if(c([t,e]),"Element"in e){var u=e.Element;u.prototype.addEventListener=o,u.prototype.removeEventListener=v}else t.attachEvent("onreadystatechange",function(){c(t.all)}),i("getElementsByTagName"),i("getElementById"),i("createElement"),c(t.all)}}(window,document);

var _sF = function(){
  if(document.querySelectorAll("button").length > 1){
    window.location.href=document.activeElement.attributes.formaction.nodeValue
  } else {
    document.querySelectorAll("form")[0].submit();
  }
};