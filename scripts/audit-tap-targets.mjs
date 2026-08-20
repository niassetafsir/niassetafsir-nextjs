// The same crawl, narrowed to one question: which controls are smaller than
// the 44px touch guideline *and* are not inline markers inside running prose.
// An inline [N] footnote marker is meant to be small; a navigation link is not.
// The distinction is made by comparing a control's own text length against its
// parent's, which is why this exists separately from audit-routes.mjs.
//
// Usage: node scripts/audit-tap-targets.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const BASE=process.env.BASE ?? 'http://localhost:3111';
const F='/tmp/amiri/Amiri-1.000';
const files={'Amiri-Regular.ttf':[400,'normal'],'Amiri-Bold.ttf':[700,'normal'],'Amiri-Italic.ttf':[400,'italic']};
const face=Object.entries(files).map(([f,[w,s]])=>`@font-face{font-family:'Amiri';font-style:${s};font-weight:${w};src:url('http://amiri.local/${f}') format('truetype');font-display:block}`).join('');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await c.route('**fonts.googleapis.com**',r=>r.fulfill({status:200,contentType:'text/css',body:face}));
await c.route('http://amiri.local/*',r=>{const n=r.request().url().split('/').pop();r.fulfill({status:200,contentType:'font/ttf',body:fs.readFileSync(`${F}/${n}`)});});
const p=await c.newPage();
const ROUTES=['/','/verse','/verse/1/1','/read','/lesson/1','/surah/2','/research','/search','/footnotes','/glossary','/notes','/saved','/about','/about/tafsir','/translators-note','/audio','/order','/get-involved','/volume/1','/hadith','/preorder'];
const agg={};
for(const route of ROUTES){
  await p.goto(BASE+route,{waitUntil:'networkidle'}); await p.waitForTimeout(350);
  const small=await p.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    // An inline marker sits inside running prose: its parent holds much more
    // text than the control itself. A standalone control does not.
    const inlineish=e=>{
      const par=e.parentElement; if(!par) return false;
      const own=(e.textContent||'').trim().length;
      const par_=(par.textContent||'').trim().length;
      const cs=getComputedStyle(e);
      return cs.display.startsWith('inline') && par_ > own*4 && par_ > 60;
    };
    return [...document.querySelectorAll('a[href],button,input,select,textarea,[role=button],[role=tab],summary')]
      .filter(vis)
      .filter(e=>{const r=e.getBoundingClientRect();return r.height<40||r.width<28;})
      .filter(e=>!inlineish(e))
      .map(e=>{const r=e.getBoundingClientRect();
        return {tag:e.tagName.toLowerCase(),
                cls:(e.className||'').toString().split(' ').slice(0,3).join(' ').slice(0,40),
                t:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,26),
                h:Math.round(r.height),w:Math.round(r.width)};});
  });
  if(small.length){
    for(const s of small){ const k=`${s.tag} "${s.t}" ${s.h}x${s.w}`; (agg[k]=agg[k]||[]).push(route); }
  }
}
const rows=Object.entries(agg).sort((a,b)=>b[1].length-a[1].length);
console.log('standalone controls under 44px, mobile 390:');
for(const [k,rs] of rows) console.log(`  ${String(rs.length).padStart(2)} pages  ${k}   ${rs.slice(0,3).join(' ')}${rs.length>3?' …':''}`);
console.log('total distinct:',rows.length);
await b.close();
