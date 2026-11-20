/* Run: node tools/test.cjs. Optional UI checks: node tools/test.cjs --browser (Playwright + Chrome). */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let count = 0;
function test(name, fn) { fn(); count++; console.log('OK ' + name); }
const elements = new Map();
const storage = new Map();
const listeners = {};
const noop = () => {};
function element() { return {value:'',textContent:'',innerHTML:'',dataset:{},classList:{add:noop,remove:noop,toggle:noop},style:{setProperty:noop},addEventListener:noop,setAttribute:noop,focus:noop,remove:noop,prepend:noop}; }
const ctx = {console, Date, JSON, URL, Blob, setTimeout:()=>0,clearTimeout:noop,setInterval:fn=>{listeners.timer=fn;}, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{hash:'#accueil',protocol:'file:',href:'file:///revision/index.html'},navigator:{},matchMedia:()=>({matches:false}),alert:noop,confirm:()=>true,innerWidth:1440,scrollTo:noop,addEventListener:noop,document:{documentElement:{dataset:{}},body:{appendChild:noop,classList:{toggle:noop}},querySelector:selector=>{ if (selector === '#xrep' || selector === '#rep' || selector === '#lessonAudio') return null; if (!elements.has(selector)) elements.set(selector,element()); return elements.get(selector); },getElementById:()=>null,querySelectorAll:()=>[],createElement:element,addEventListener:noop}};
ctx.window = ctx; vm.createContext(ctx);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const [,src] of html.matchAll(/<script src="(.*?)"/g)) {
 let code=fs.readFileSync(path.join(root,src),'utf8');
 if(src==='js/app.js') {
   code=code.slice(0,code.lastIndexOf('fixSel(); applyTheme(); render();')) + `
   window.T = { study, blank, readState, getState:()=>S, setState:(v)=>{S=v;buildCtrl();refreshThemeStats();}, save, buildCtrl, CTRLQ:()=>CTRLQ, CTRLC:()=>CTRLC, SUJETS, QUESTIONS, NOT, THEME_STATS, fsrsReview, deckStats, deckDue, autoScore, daysUntil, joursAvant, parseDossier, ctrlImport, ACT, V, examRendre, setResult:(v)=>{examRes=v;}, getResult:()=>examRes, render, getSession:()=>session, resetTransient };
   })();`;
 }
 vm.runInContext(code,ctx,{filename:src});
}
const T=ctx.T;
test('All official questions have corrections, existing subjects and themes',()=>{
 for(const q of T.QUESTIONS){assert(T.SUJETS[q.sujet],q.id); assert(q.corr.trim(),q.id); for(const theme of q.themes) assert(ctx.THEMES[theme],q.id+' theme '+theme);}
 assert.equal(new Set(T.QUESTIONS.map(q=>q.id)).size,T.QUESTIONS.length);
 assert.equal(new Set(T.NOT.map(n=>n.id)).size,T.NOT.length);
});
test('All linked local PDFs, scripts, styles, manifest assets exist',()=>{
 const texts = [html,...fs.readdirSync(path.join(root,'data')).map(f=>fs.readFileSync(path.join(root,'data',f),'utf8'))];
 for(const text of texts) for(const m of text.matchAll(/(?:sujets\/[a-zA-Z0-9_./-]+\.pdf|(?:data|js|css|icons)\/[a-zA-Z0-9_.-]+\.(?:js|css|png))/g)) assert(fs.existsSync(path.join(root,m[0])),m[0]);
});
test('Question document references resolve and every subject view renders',()=>{
 for(const q of T.QUESTIONS) for(const doc of q.utiles || []) assert(T.SUJETS[q.sujet].docs[doc],q.id+' -> '+doc);
 for(const subject of Object.values(T.SUJETS)) assert(T.V.annales(subject.id).includes('<h1>'),subject.id);
});
test('Existing and legacy backups preserve progress including numeric zoom',()=>{
 const s=T.blank(); s.zoom=150; s.cards.old={b:2,d:123}; s.cards.new=T.fsrsReview(null,3,1000); s.learned.sample=123;
 const r=T.readState(JSON.parse(JSON.stringify(s))); assert.equal(r.zoom,150); assert.equal(r.learned.sample,123); assert.equal(r.cards.old.b,2);
 assert.equal(T.readState({learned:{},cards:{}}).option,'');
});
test('Malformed backup types, nested records and prototype keys are rejected',()=>{
 for(const bad of [{learned:[],cards:{}},{answers:{x:'bad'}},{ctrl:[{id:'x',titre:'X',mat:'cyber',dossiers:null}]},{cards:{x:{d:'tomorrow'}}},{examRun:{sid:'unknown'}},JSON.parse('{"__proto__":{"polluted":1}}')]) assert.throws(()=>T.readState(bad));
});
test('Restored controls rebuild their questions and cards; deletion removes pseudo subjects',()=>{
 const s=T.blank(); s.ctrl=[{id:'c1',titre:'DNS',mat:'sisr',dossiers:[{n:1,d:100,fiche:'Cours',cards:[{q:'DNS ?',r:'Noms'}],qs:[{q:'Explique',motscles:['dns'],correction:'Réponse'}]}]}];
 T.setState(T.readState(s)); assert.equal(Object.keys(T.CTRLQ()).length,1); assert.equal(Object.keys(T.CTRLC()).length,1); assert(T.SUJETS.K_c1);
 T.setState(T.blank()); assert.equal(Object.keys(T.CTRLQ()).length,0); assert(!T.SUJETS.K_c1);
});
test('AI dossiers accept keyword text and reject malformed arrays',()=>{
 const d=T.parseDossier('```json\n'+JSON.stringify({questions:[{q:'DNS ?',motscles:'dns;nom|domaine',correction:'OK'}]})+'\n```');
 assert.equal(d.qs[0].motscles.length,2); assert.throws(()=>T.parseDossier('{"questions":{}}'));
});
test('Malformed shared control cannot mutate current progress',()=>{
 const before=JSON.stringify(T.getState());
 assert.throws(()=>T.ctrlImport(JSON.stringify({type:'bts-sio-controle',controle:{titre:'Test',dossiers:[{qs:[{q:'x',motscles:{bad:true}}]}]}})));
 assert.equal(JSON.stringify(T.getState()),before);
});
test('Short keyword IP is not matched inside equipement',()=>{
 const q={mc:[['ip']],mcLabel:['IP']};assert.equal(T.autoScore(q,'équipement').score,0);assert.equal(T.autoScore(q,'une adresse IP.').score,1);
});
test('Due mature cards are counted as due and offered for review',()=>{
 const n=T.NOT[0],s=T.blank();s.cards[n.id]={s:40,d:Date.now()-100};T.setState(s);assert.equal(T.deckStats([n]).revoir,1);assert.equal(T.deckDue([n]).length,1);T.setState(T.blank());
});
test('Local calendar countdown is zero today and negative after the exam',()=>{
 const d=new Date(),fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 assert.equal(T.daysUntil(fmt(d)),0);assert.equal(T.joursAvant(fmt(d)),0);d.setDate(d.getDate()-1);assert.equal(T.daysUntil(fmt(d)),-1);
});
test('Cyber frequencies respect the chosen option',()=>{
 const id=Object.keys(ctx.THEMES).find(id=>ctx.THEMES[id][1]==='cyber'&&!T.THEME_STATS[id].est);
 const s=T.blank();s.option='SISR';T.setState(s);assert.equal(T.THEME_STATS[id].total,ctx.ANNALES.sujets.filter(s=>s.option==='SISR'&&!s.autre).length);T.setState(T.blank());
});
test('FSRS schedules finite valid states for repeated ratings',()=>{
 for(let grade=1;grade<=4;grade++){let c;for(let i=0;i<100;i++){c=T.fsrsReview(c,grade,Date.now()+i*86400000);assert(c.s>0&&c.k>=1&&c.k<=10&&Number.isFinite(c.d));}}
});
test('Expired exam is submitted even away from its page',()=>{
 const s=T.blank(),sid=ctx.ANNALES.sujets[0].id;s.examRun={sid,start:Date.now()-10000,dur:100,reps:{},i:0,page:0,doc:''};T.setState(s);listeners.timer();assert.equal(T.getState().examRun,null);assert.equal(T.getState().examHist.length,1);T.setState(T.blank());T.resetTransient();
});
test('Exam regrading changes its own history and response, not a later practice',()=>{
 const s=T.blank(),sid=ctx.ANNALES.sujets[0].id;s.examRun={sid,start:Date.now(),dur:100000,reps:{},i:0,page:0,doc:''};T.setState(s);T.examRendre();
 const q=T.getResult().items[0].q.id; T.getState().history.push({note:7});T.getState().answers[q].push({note:.4});
 T.ACT.xself({dataset:{i:'0',v:'1'}});assert.equal(T.getState().history.at(-1).note,7);assert.equal(T.getState().answers[q].at(-1).note,.4);assert.equal(T.getState().answers[q][0].note,1);T.setState(T.blank());T.resetTransient();
});
test('Reset clears active sessions and all derived control data',()=>{T.ACT.reset();assert.equal(T.getSession(),null);assert.equal(T.getResult(),null);assert.equal(Object.keys(T.CTRLQ()).length,0);});
test('All base routes render for both options',()=>{for(const option of ['SISR','SLAM']){const s=T.blank();s.option=option;T.setState(s);for(const [route,view] of Object.entries(T.V)){if(route==='matiere')continue;assert.equal(typeof view(),'string',route);}}T.setState(T.blank());T.resetTransient();});
test('Service worker only deletes old caches from its own scope',()=>{
 const handlers={},deleted=[];let pending;
 const sw={self:{registration:{scope:'https://example.org/app/'},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:()=>Promise.resolve()},skipWaiting:()=>Promise.resolve()},caches:{open:async()=>({keys:async()=>[]}),keys:()=>Promise.resolve(['unrelated','bts-sio:https://example.org/other/:v19','bts-sio:https://example.org/app/:v19','bts-sio:https://example.org/app/:v21']),delete:k=>{deleted.push(k);return Promise.resolve(true);}},URL};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),sw);handlers.activate({waitUntil:p=>pending=p});
 globalThis.swCheck=pending.then(()=>assert.deepEqual(deleted,['bts-sio:https://example.org/app/:v19']));
});
async function browserTests(){
 const {chromium}=require('playwright');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 const context=await browser.newContext({viewport:{width:1440,height:960},timezoneId:'Europe/Paris'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const url=require('node:url').pathToFileURL(path.join(root,'index.html')).href;
 const go=async route=>{await page.goto(url+'#'+route);await page.waitForTimeout(30);};
 await go('accueil');
 const routes=Object.keys(T.V).filter(r=>r!=='matiere').concat(['matiere/cyber','flash/deck/all','qcm/E7','biblio/theme/auth','realisations/nouvelle']);
 // Unknown theme links must also fail gracefully.
 for(const option of ['SISR','SLAM']) {
  await page.selectOption('#optSel',option);
  for(const width of [1440,390,320]) {
   await page.setViewportSize({width,height:900});
   for(const route of routes){await go(route);assert(await page.locator('#view').innerText(),route);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route}: overflow at ${width}px (${option})`);}
  }
 }
 count++;console.log('OK browser: all routes / both options / desktop, 390px, 320px');
 await page.setViewportSize({width:390,height:844});await go('accueil');await page.click('#menuBtn');assert.equal(await page.getAttribute('#menuBtn','aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.getAttribute('#menuBtn','aria-expanded'),'false');
 await go('flash/deck/all');await page.click('[data-a="flip"].btn');await page.click('[data-a="fgrade"][data-v="2"]');assert(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('bts-sio-revision-v1')).cards).length>0));
 count++;console.log('OK browser: keyboard menu and flashcard save');
 await go('cas');await page.click('[data-a="start"]');await page.fill('#rep','Ma réponse conservée');await go('accueil');await go('cas');assert.equal(await page.inputValue('#rep'),'Ma réponse conservée');await page.click('[data-a="valider"]');await page.click('[data-a="suivant"]');assert.equal(await page.inputValue('#rep'),'');
 count++;console.log('OK browser: case draft survives navigation and next question is empty');
 await go('suivi');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('bts-sio-revision-v1')));
 saved.ctrl=[{id:'testctrl',titre:'Contrôle restauré',mat:'sisr',dossiers:[{n:1,d:Date.now(),fiche:'Fiche',cards:[{q:'Question restaurée ?',r:'Réponse'}],qs:[{q:'Question',motscles:['dns'],correction:'Corrigé'}]}]}];
 await page.setInputFiles('#imp',{name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});await page.waitForTimeout(100);await go('flash/ctrl/testctrl');assert((await page.locator('#view').innerText()).includes('Question restaurée'));
 await go('suivi');const before=await page.evaluate(()=>localStorage.getItem('bts-sio-revision-v1'));await page.setInputFiles('#imp',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"learned":{},"cards":{},"ctrl":null}')});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>localStorage.getItem('bts-sio-revision-v1')),before);
 count++;console.log('OK browser: restore rebuilds controls and malformed import is atomic');
 // A fresh page restores persisted state and retains the imported cards.
 await page.reload();await go('flash/ctrl/testctrl');assert((await page.locator('#view').innerText()).includes('Question restaurée'));
 await go('examen');await page.selectOption('#xSu',await page.locator('#xSu option').first().getAttribute('value'));await page.click('[data-a="xstart"]');await page.fill('#xrep','Réponse examen A');await page.click('[data-a="xgo"][data-v="1"]');assert.equal(await page.inputValue('#xrep'),'');await page.fill('#xrep','Réponse examen B');await page.click('[data-a="xgo"][data-v="0"]');assert.equal(await page.inputValue('#xrep'),'Réponse examen A');await page.reload();assert.equal(await page.inputValue('#xrep'),'Réponse examen A');
 count++;console.log('OK browser: exam question switching and reload preserve separate answers');
 await go('controles/testctrl');
 await page.setInputFiles('#kF',{name:'cours.html',mimeType:'text/html',buffer:Buffer.from('<h1>Mon cours</h1><img src="missing" onerror="window.importExecuted=true"><script>window.importExecuted=true</script>')});await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>window.importExecuted),undefined);assert((await page.inputValue('#kX')).includes('Mon cours'));assert(!(await page.inputValue('#kX')).includes('window.importExecuted'));
 count++;console.log('OK browser: HTML course imported as inert text');
 await go('examen');await page.evaluate(()=>{const key='bts-sio-revision-v1',s=JSON.parse(localStorage.getItem(key));s.examRun.start=Date.now()-s.examRun.dur-1000;localStorage.setItem(key,JSON.stringify(s));});
 // Leave the current document without firing its autosave over the expiry fixture.
 const expired=await page.context().newPage();await expired.goto(url+'#examen');await expired.waitForTimeout(100);assert((await expired.locator('#view').innerText()).includes('Résultat de l’examen blanc')||(await expired.locator('#view').innerText()).includes("Résultat de l'examen blanc"));await expired.close();
 count++;console.log('OK browser: an expired persisted exam is submitted on load');
 // Screenshots use a clean, disposable SISR profile, never the user's browser.
 await go('suivi');await page.click('[data-a="reset"]');await page.selectOption('#optSel','SISR');
 await go('accueil');await page.setViewportSize({width:1440,height:960});
 const shots=process.env.SCREENSHOT_DIR;
 if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,'interface-ordinateur.png')});await page.click('#themeBtn');await page.screenshot({path:path.join(shots,'interface-sombre.png')});await page.click('#themeBtn');await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(shots,'interface-mobile.png')});}
 assert.deepEqual(errors,[]); count++;console.log('OK browser: no uncaught JavaScript errors');
 } finally {await browser.close();}
}
(async()=>{await globalThis.swCheck;if(process.argv.includes('--browser'))await browserTests();console.log(`PASS: ${count} test groups; ${T.QUESTIONS.length} questions, ${T.NOT.length} notions checked.`);})().catch(e=>{console.error(e);process.exitCode=1;});


