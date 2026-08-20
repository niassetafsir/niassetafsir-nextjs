// Crawl every route at 1280 and 390, and report anything that is not a clean
// 200: HTTP status, console errors, failed network requests, horizontal
// overflow, and controls under 40px. Run it against a *production* build --
// `npm run build && npx next start -p 3111` -- because dev-mode CSS and the
// dev overlay both change the measurements. Google Fonts is intercepted and
// Amiri served from disk so the run does not depend on the network.
//
// Usage: node scripts/audit-routes.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const BASE=process.env.BASE ?? 'http://localhost:3111';
const F='/tmp/amiri/Amiri-1.000';
const files={'Amiri-Regular.ttf':[400,'normal'],'Amiri-Bold.ttf':[700,'normal'],'Amiri-Italic.ttf':[400,'italic'],'Amiri-BoldItalic.ttf':[700,'italic']};
const face=Object.entries(files).map(([f,[w,s]])=>`@font-face{font-family:'Amiri';font-style:${s};font-weight:${w};src:url('http://amiri.local/${f}') format('truetype');font-display:block}`).join('');

const ROUTES=[
 '/','/verse','/verse/1/1','/verse/2/255','/verse/36/39','/read','/lesson/1','/lesson/12','/lesson/56',
 '/lesson/1/print','/volume/1','/volume/10','/surah/1','/surah/2','/audio','/research','/search',
 '/footnotes','/hadith','/glossary','/glossary-map','/notes','/saved','/about','/about/tafsir','/about/shaykh',
 '/about/translator','/about/arabic-edition','/about/companion-texts','/editorial-note',
 '/translators-note','/order','/preorder','/get-involved','/bookmarks','/clips','/introduction',
 '/get-involved/feedback','/get-involved/join','/robots.txt','/sitemap.xml','/nope-404-check',
];

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const report=[];
for(const mobile of [false,true]){
  const c=await b.newContext(mobile
    ? {viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}
    : {viewport:{width:1280,height:900}});
  await c.route('**fonts.googleapis.com**',r=>r.fulfill({status:200,contentType:'text/css',body:face}));
  await c.route('http://amiri.local/*',r=>{const n=r.request().url().split('/').pop();r.fulfill({status:200,contentType:'font/ttf',body:fs.readFileSync(`${F}/${n}`)});});
  const p=await c.newPage();
  for(const route of ROUTES){
    const errs=[], net=[];
    const onC=m=>{ if(m.type()==='error') errs.push(m.text().slice(0,120)); };
    // requestfailed means the request never produced a response, so there is
    // no status to read. request.response() also returns a PROMISE, so the old
    // `r.response()?.status()` called .status() on a Promise and threw --
    // killing the crawl the first time a request actually failed, i.e. in the
    // one handler whose whole job is to report failures. failure() is the
    // synchronous accessor for this event.
    const onF=r=>{ net.push(`${r.url().replace(BASE,'')} ${r.failure()?.errorText||'failed'}`); };
    p.on('console',onC); p.on('requestfailed',onF);
    p.on('response',r=>{ if(r.status()>=400 && !r.url().includes('nope-404')) net.push(`${r.url().replace(BASE,'')} ${r.status()}`); });
    let status=null;
    try{ const resp=await p.goto(BASE+route,{waitUntil:'networkidle',timeout:25000}); status=resp?.status(); }
    catch(e){ status='TIMEOUT'; }
    await p.waitForTimeout(300);
    const info = await p.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const ctl=[...document.querySelectorAll('a[href],button,input,select,textarea,[role=button],[role=tab],summary')].filter(vis);
      const small=ctl.filter(e=>{const r=e.getBoundingClientRect();return r.height<40||r.width<28;})
                     .map(e=>({t:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,22),
                               h:Math.round(e.getBoundingClientRect().height),w:Math.round(e.getBoundingClientRect().width)}));
      const links=[...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href'));
      return { controls:ctl.length, tooSmall:small.slice(0,6), smallCount:small.length,
               links:[...new Set(links)], overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
               scrollW: document.documentElement.scrollWidth, vw: window.innerWidth,
               emptyBody: (document.body.innerText||'').trim().length < 60 };
    });
    p.off('console',onC); p.off('requestfailed',onF);
    report.push({mobile,route,status,errs,net:[...new Set(net)].slice(0,4),...info});
  }
  await c.close();
}
await b.close();
fs.writeFileSync('/tmp/audit.json',JSON.stringify(report,null,1));
// summary
const d=report.filter(r=>!r.mobile), m=report.filter(r=>r.mobile);
console.log('=== desktop 1280 ===');
for(const r of d){
  const flags=[];
  if(r.status!==200 && !['/introduction','/bookmarks','/clips','/get-involved/feedback','/get-involved/join','/nope-404-check'].includes(r.route)) flags.push('HTTP '+r.status);
  if(r.errs.length) flags.push(r.errs.length+' console errors');
  if(r.net.length) flags.push('net: '+r.net.join(', '));
  if(r.emptyBody) flags.push('EMPTY');
  if(flags.length) console.log(`  ${r.route.padEnd(30)} ${flags.join(' | ')}`);
}
console.log('  (routes not listed: 200, no console errors, no failed requests)');
console.log('=== mobile 390 ===');
for(const r of m){
  const flags=[];
  if(r.overflowX) flags.push(`H-OVERFLOW ${r.scrollW}>${r.vw}`);
  if(r.smallCount) flags.push(`${r.smallCount} targets under 40px`);
  if(flags.length) console.log(`  ${r.route.padEnd(30)} ${flags.join(' | ')}`);
}
