if(window.applicationCache){
window.applicationCache.addEventListener('updateready', handleUpdate, false)

if(window.navigator.onLine)
    applicationCache.addEventListener('error', handleCacheError, false);

function handleUpdate(e) {
    if (window.applicationCache !== null) window.applicationCache.update();
    //alert("the app updated.");
    window.location.reload();
};

function handleCacheError(e) {
    setTimeout(function () {
        if (window.applicationCache !== null) {

            window.applicationCache.update();
            window.location.reload();
        }
        //alert("boom");
    }, 3000);
    console.error("cache error");
}
} else console.log("Application cache not supported, ignoring");