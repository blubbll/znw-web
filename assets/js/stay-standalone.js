!function(e,n,t){if("standalone"in n&&n.standalone){var r,a=e.location,o=/^(a|html)$/i;e.addEventListener("click",function(e){var chref;for(r=e.target;!o.test(r.nodeName);)r=r.parentNode;"href"in r&&(chref=r.href).replace(a.href,"").indexOf("#")&&(!/^[a-z\+\.\-]+:/i.test(chref)||0===chref.indexOf(a.protocol+"//"+a.host))&&(e.preventDefault(),a.href=r.href)},!1)}}(document,window.navigator);