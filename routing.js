/*jshint esversion: 6 */
"use strict";

//https://stackoverflow.com/a/4403189
   String.prototype.minify=function(){var e=this;return e=(e=(e=(e=(e=(e=e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g,""))
   .replace(/ {2,}/g," ")).replace(/ ([{:}]) /g,"$1")).replace(/([;,]) /g,"$1")).replace(/([{:}]) /g,"$1")).replace(/ !/g,"!")};

//imports
const $ = require('node-global-storage'),
    ampify = require('ampify'),
    ejs = require('ejs'),
    fs = require('fs'),
    minify = require('express-minify'),
    pino = require('express-pino-logger')(),
    logger = require('pino')({
        prettyPrint: {
            colorize: true
        }
    }),
    rawlogger = require('pino')(),
    fetch = require('node-fetch'),
    smc = require('safe-memory-cache')({
        limit: 512
    }),
    matomo = require('matomo-tracker'),
    //globals
    app = $.get('app'),
    main = $.get('main'),
    baseUrl = $.get('baseUrl'),
    mainUnsafe = $.get('mainUnsafe'),
    cache = $.get('cache'),
    clientCache = require('cache-control'),
    Games = $.get('Games'),
    cTime = $.get('cTime');
//app.use(pino);

////////////////////////////////////////////////////////////////////////////////////
//API
////////////////////////////////////////////////////////////////////////////////////
//index , cache('5 minutes')
app.get([`/${main}/api/games`, `/znw.io/api/games`], cache(cTime), function(req, res) {
    let games = $.Games.all();
    res.status(200).json(games);
});
app.post([`/${main}/api/games/create`, `/znw.io/api/games/create`], function(req, res) {
    if (typeof req.session.admin !== 'undefined' && req.session.admin === true) {
        console.log(req.body);
        Games.add({
            shortName: req.body.newGame_shortName
        });
        res.redirect(`/game=${req.body.newGame_shortName}`);
    } else
        res.status(401).json("no permission");
});



//amp
app.get([`/${main}/amp`], (req, res) => res.send(ampify(ejs.render(fs.readFileSync(__dirname +
    '/views/amp/main.ejs', 'utf8'), {
    $: $
}).minify(), {
    cwd: 'amp'
})));


var znwRouting = function(req, res) {
    console.log("from short");
    res.status(200).json("lel");
};
app.all(['/znw.io/*'], function(req, res, next) {
    let target = req._parsedOriginalUrl.path.split('/').pop().split('/').pop();
    if (target.length > 0) {
        console.log(`Requested: ${target}`);
        logger.info(`User requested game: ${target}`);
    
        switch (target){
            
          case 'social':{
            console.log("sent to mastodon");
            res.status(302).redirect('https://znw.social/about');
          }break;
            
          default: res.redirect(`${baseUrl}`);
          
                      
      }
        
    }else res.redirect(`${baseUrl}`); 
});



const dns = require('dns');
let mainIP = '127.0.0.1';
dns.lookup(main, function(err, result) {
    mainIP = result;
});

///--------------------------------------------------------
//cache manifest
const bootdate = +new Date();
app.get(`/${main}/manifest.appcache`, function(req, res) {

    let _path = req._parsedOriginalUrl.path.split('/')[2];
    let _host = req._parsedOriginalUrl._raw.split('/')[1] || "/";
    let protocol = "http://";
    if (req.headers.secure) protocol = "https://";
    if (req._parsedOriginalUrl._raw.startsWith(main)) _host = main; else _host = main;
  
    let fullUrl = `${protocol}${_host}/${_path}`;
  
  res.status(200).header("Content-Type",'text/cache-manifest').send(`CACHE MANIFEST
#${'\u00A9'}${app.locals.appAuthor}
# ${bootdate}

CACHE:
${fullUrl} ${fullUrl}

NETWORK:
*

FALLBACK:
${fullUrl} ${fullUrl}

SETTINGS:
prefer-online
fast
`);});
//app manifest
app.get(`/${main}/manifest.json`, function(req, res) {

    let _path = req._parsedOriginalUrl.path.split('/')[2];
    let _host = req._parsedOriginalUrl._raw.split('/')[1] || "/";
    let protocol = "http://";
    if (req.headers.secure) protocol = "https://";
    if (req._parsedOriginalUrl._raw.startsWith(main)) _host = main; else _host = main;
  
    let fullUrl = `${protocol}${_host}/${_path}`;
  
  res.status(200).header("Content-Type",'application/manifest+json').send(`
{
  "short_name": "${app.locals.appNameShort}",
  "name": "${app.locals.appName}",
  "icons": [
    {
      "src": "/logo.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#ecf0f1",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#3498db",
  "developer": {
    "name": "${app.locals.appAuthor}",
    "url": "${app.locals.appAuthorUrl}"}
}
`);});

//cache control
app.use(clientCache({
  '/**': 3600,
  '/live/**': false
}));

///--------------------------------------------------------
//Logging
app.all("**", function(req, res, next) {
    app.locals.req = req;
  
    let _ip = req.headers['x-forwarded-for'].split(',')[0].replace('::ffff:', "");
    //let _host = '(endpoint)',
    let _path = req._parsedOriginalUrl.path.split('/')[2];
    let _host = req._parsedOriginalUrl._raw.split('/')[1] || "/";
    let protocol = "http://";
    if (req.headers.secure) protocol = "https://";
    if (req._parsedOriginalUrl._raw.startsWith(main)) _host = main; else _host = "(endpoint)";  
  
    app.locals.icon = `data:image/x-icon;base64,${new Buffer(fs.readFileSync(process.env.PWD + "/assets/favicon.ico")).toString('base64')}`;
    app.locals.fullUrl = `${protocol}${main}/${_path}`;
    app.locals.appName = 'Zircon Network';
    app.locals.appNameShort = 'ZNW';
    app.locals.appAuthor = 'Blubbll';
    app.locals.appAuthorUrl = 'https://Blubbll.me';
    app.locals.appDescription = 'The official Zircon Network website';
    app.locals.appKeywords = 'Zircon Network, znw, znw.io, Blubbll, zircon.network, gameservers, zirconnetwork';
    
  
    const doLog = function(geoip) {
        
        //matomo
        let m = new matomo(2, 'https://stats.exxo.cloud/piwik.php');
        m.track({
            token_auth: process.env.MATOMO_TOKEN,
            cip: _ip,
            url: `${protocol}${_host}/${_path}`,
            action_name: `/${_path}(from log)`,
            ua: `${req.get('User-Agent')}`,
            cvar: JSON.stringify({
                '1': ['from_log', true]
            })
        });

        logger.info({
            country: geoip.country,
            secure: req.headers.secure === 'true',
            host: _host,
            path: _path,
            ip: _ip
        });
    }

    if (smc.get(`geo_${_ip}`) === undefined)
        fetch(`http://ip-api.com/json/${_ip}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            smc.set(`geo_${_ip}`, data);
            doLog(data);
        });
    else doLog(smc.get(`geo_${_ip}`));



    next();
});
//wrong url, redirect to main
app.all(["/znw.io/", "/www.znw.io/", `/www.${main}/`], function(req, res) {
    res.redirect(`${baseUrl}`)
});
//unsafe main, redirect to ssl
app.all([`/${main}/`], function(req, res, next) {
    if (req.headers.secure === 'false') res.redirect(`${baseUrl}`);
    else next();
});
app.all([`/${main}/*`], function(req, res, next) {
    if (req.headers.secure === 'false') res.redirect(`${baseUrl}${req._parsedOriginalUrl.path.split('/').pop()}`);
    else next();
});


////////////////////////////////////////////////////////////////////////////
//index , cache('5 minutes')
app.get(`/${main}/`, cache(cTime), function(req, res) {
    res.render('../views/user/main');
});
//index Live
app.get(`/${main}/live`, function(req, res) {
    if (typeof req.session.admin !== 'undefined' && req.session.admin)
        res.render('../views/live/main', {
            admin: true
        });
    else res.redirect('/live/login');
});
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//games
app.get([`/${main}/game=*`], cache(cTime), function(req, res) {
    let gameId = req.params[0].split('=').pop() || '';
    res.render('../views/user/sub', {
        weather: gameId
    });
});
//games (editing mode)
app.get([`/${main}/live/game=*`], function(req, res) {
    let gameId = req.params[0].split('=').pop() || '';
    if (typeof req.session.admin !== 'undefined' && req.session.admin)
        res.render('../views/live/sub', {
            admin: true
        });
    else res.redirect('/live/login');
});
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//about
app.get([`/${main}/about?`], cache(cTime), function(req, res) {
    res.render('../views/user/about');
});

//cookies
app.get([`/${main}/cookies?`], cache(cTime), function(req, res) {
    res.render('../views/user/cookies');
});

//contact , cache('5 minutes')
app.get([`/${main}/contact?`], cache(cTime), function(req, res) {
    res.render('../views/user/contact');
});
///////////////////////////////////////////////////////////////////////////

app.use(cache(cTime), function(req, res) {
    res.render('../views/404');
});