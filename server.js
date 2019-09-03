

//////
'use strict';
const $ = require('node-global-storage');
$.set('require', require);
//imports and globals

const FlatDB = $.set('FlatDB', require('flat-db')), //$
    apicache = require('apicache'),
    express = require('express'),
    app = $.set('app', express()), //$
    bodyParser = require('body-parser'),
    compression = require('compression'),
    compressor = require('node-minify'),
    favicon = require('serve-favicon'),
    //favicons = require('favicons'),
    fs = require('fs'),
    mini = require('minify'),
    minify = require('express-minify'),
    minifyHTML = require('express-minify-html'),
    path = require('path'),
    session = require('express-session'),
    robots = require('robots-generator'),
    bouncer = require('express-bouncer')(5 * (3600000), 10 * (3600000)),
    sm = require('sitemap'),
    fetch = require('node-fetch'),
    ampify = require('ampify'),
    glob = require('glob'),
    md5 = require('md5-file'),
    pngToIco = require('png-to-ico'),
    pino = require('express-pino-logger')(),
    logger = require('pino')({
        prettyPrint: {
            colorize: true
        }
    });


//favicon
pngToIco(`${process.env.PWD}/assets/logo.png`)
    .then(s => {
        fs.writeFile(`${process.env.PWD}/assets/favicon.ico`, s, () => {
            logger.info(`Favicon generated.`);
        })
    }).catch(console.error)
////////////////////////////////////////////////////////////////////////////////////
//DATENBANK
////////////////////////////////////////////////////////////////////////////////////
//Konfig
FlatDB.configure({
    dir: './storage'
});
//GameDB
let Games = $.set('Games', new FlatDB.Collection('games', {
    shortName: '',
    longName: '',
    description: '',
    discord: '',
    isWebapp: !1
}));
////////////////////////////////////////////////////////////////////////////////////
//Assets minify (only changed files)
////////////////////////////////////////////////////////////////////////////////////
let Assets = $.set('Assets', new FlatDB.Collection('assets', {
    file: '',
    hash: ''}));
if (true)glob(`${process.env.PWD}/assets/js/*.js`, function(er, files) {
        files.forEach(function(script) {
  
            let entry = Assets.find().equals('file', script).entries[0];
            const doCompress = function(exist) {
                compressor.minify({
                    compressor: 'gcc',
                    input: script,
                    output: `${script}-min`,
                    callback: function(err, min) {
                        if (exist) {
                          Assets.update(entry._id_, {
                                file: script,
                                hash: md5.sync(`${script}`)
                            })
                        }
                        logger.info(`${script} compressed.`)
                    }
                });
            }
            
            if (entry === undefined) {

                Assets.add({
                    file: script,
                    hash: md5.sync(`${script}`)
                });
                doCompress();
            } else if (entry.hash !== md5.sync(script)) doCompress(true);
            //console.log(md5.sync(`${script}.min`))if (md5.sync(script) !== md5.sync(`${script}.min`))

        });
    });
////////////////////////////////////////////////////////////////////////////////////
//Session (Api & Website)
////////////////////////////////////////////////////////////////////////////////////
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
}));
////////////////////////////////////////////////////////////////////////////////////
//Bodyparser
////////////////////////////////////////////////////////////////////////////////////
//form-vars auslesen
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
////////////
//vars
const main = $.set('main', "zircon.network");
app.locals.main = main;
const cTime = $.set('cTime', '30 minutes');
const baseUrl = $.set('baseUrl', `https://zircon.network/`);
$.set('game', {
    shortEnd: '@ZNW',
    ipEnd: '.znw.at'
});
app.locals.$ = $;
$.set('fs', fs);
////////////////////////////////////////////////////////////////////////////////////
//API
////////////////////////////////////////////////////////////////////////////////////
//index , cache('5 minutes')
app.get('/api/games', function(req, res) {
    let games = Games.all();
    res.status(200).json(games);
});
app.post('/api/games/create', function(req, res) {
    if (typeof req.session.admin !== 'undefined' && req.session.admin === true) {
        console.log(req.body);
        Games.add({
            shortName: req.body.newGame_shortName
        });
        res.redirect(`/game=${req.body.newGame_shortName}`);
    } else
        res.status(401).json("no permission");
});
////////////////////////////////////////////////////////////////////////////////////
//WEBSITE
////////////////////////////////////////////////////////////////////////////////////
//cache
app.use(compression());
const cache = $.set('cache', apicache.middleware);
app.use(minify({
    cache: !0
}));

app.use("/fallback", express.static(__dirname + '/fallback'));
//favicon
app.get(`/${main}/favicon.ico`, function(req, res) {
    res.sendFile('assets/favicon.ico', {
        root: __dirname
    });
});
//logo
app.get(`/${main}/logo.png`, function(req, res) {
    res.sendFile('assets/logo.png', {
        root: __dirname
    });
});

//minifying
app.use(minifyHTML({
    override: !0,
    exception_url: !1,
    htmlMinifier: {
        removeComments: !0,
        collapseWhitespace: !0,
        collapseBooleanAttributes: !0,
        removeAttributeQuotes: !1,
        removeEmptyAttributes: !1,
        minifyJS: !1
    }
}));

//antibruteforce
bouncer.blocked = function(req, res, next, remaining) {
    res.send(429, `Too many requests have been made,
        please wait ${remaining / 1000} seconds`);
};

////////////////////////////////////////////////////////////////////////////
//login get cache('5 minutes')
app.get([`/${main}/live/login?`], cache(cTime), bouncer.block, function(req, res) {
    res.render('../views/live/login');
});
//login post
app.post([`/${main}/live/login?`], bouncer.block, function(req, res) {
    if (req.body.password === process.env.SECRET) {
        req.session.admin = true;
        res.redirect('/live');
        bouncer.reset(req);
    } else {
        bouncer.block();
        res.render('../views/live/login');
    }
});
//logout get
app.get(`/${main}/live/logout`, function(req, res) {
    if (typeof req.session !== 'undefined' && req.session.admin) req.session.admin = false;
    res.redirect('/');
    bouncer.reset(req);
});
////////////////////////////////////////////////////////////////////////////

//server
app.set('view engine', 'ejs');
//sitemap
const sitemap = sm.createSitemap({
    hostname: `${main}`,
    cacheTime: 3000,
    urls: {
        url: `https://${main}/`,
        url: `https://${main}/about`
    }
});
Games.all().forEach(function(game) {
    sitemap.add({
        url: `https://${main}/game=${game.shortName}`
    });
});
app.get([`/${main}/sitemap.xml`], function(req, res) {
    sitemap.toXML(function(err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});
//robots
app.get([`/${main}/robots.txt`], function(req, res) {
    robots({
        useragent: '*',
        allow: ['/*'],
        disallow: ['/live', '/cookies', '/contact'],
        sitemap: `https://${main}/sitemap.xml`
    }, function(error, robots) {
        res.status(200);
        res.send(robots);
    });
});


//routing
require('./routing.js');
//(process.env.PORT)
//webend
app.listen(process.env.PORT, function() {
    console.log(`Web server listening on ${process.env.PORT}`);
});

//Webserver restart alle 6 Stunden
var h = 6;
const resetter = setTimeout(() => {
    console.log(`Restarting Glitch project...`);
    require('child_process').exec('refresh');
}, h * (60000 * 60));
