const fs=require('fs'), path=require('path'), os=require('os'), http=require('http'), cp=require('child_process'), assert=require('assert');
const root=path.resolve(__dirname,'..'), baseline=path.resolve(process.argv[2] || path.join(root,'../app-v0.4.4-trial'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'chizu-offline-test-'));
const candidate=path.join(temp,'candidate');fs.cpSync(root,candidate,{recursive:true});
const originalVersion=fs.readFileSync(path.join(root,'app-version.js'),'utf8').match(/"([^"]+)"/)[1];
let served=root, migration=baseline, browser, ws, send, evaluate, offline=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const server=http.createServer((req,res)=>{
 if(offline){req.socket.destroy();return;}
 try{
  const url=new URL(req.url,'http://localhost');const base=url.pathname.startsWith('/baseline/')?baseline:url.pathname.startsWith('/migration/')?migration:served;
  let file=decodeURIComponent(url.pathname.replace(/^\/(app|baseline|migration)\//,''));if(!file)file='index.html';
  const full=path.resolve(base,file);if(!full.startsWith(base+path.sep))throw Error('path');
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(full)]||'text/plain');res.end(fs.readFileSync(full));
 }catch{res.writeHead(404).end();}
});
async function openBrowser(){
 const chrome=process.env.CHROME_PATH || path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe');
 browser=cp.spawn(chrome,['--headless=new','--remote-debugging-port=9234','--user-data-dir='+path.join(temp,'profile'),'--no-first-run','about:blank'],{windowsHide:true,stdio:'ignore'});
 let targets;for(let i=0;i<35;i++){try{targets=await(await fetch('http://127.0.0.1:9234/json',{signal:AbortSignal.timeout(500)})).json();break;}catch{await pause(150);}}
 assert(targets,'Chrome did not start');
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 const pending=new Map();let id=0;ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
 send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:850,deviceScaleFactor:1,mobile:false});
}
async function closeBrowser(){const exit=new Promise(r=>browser.once('exit',r));await send('Browser.close');ws.close();await Promise.race([exit,pause(2500)]);}
async function wait(expr){for(let i=0;i<200;i++){try{if(await evaluate(expr))return;}catch{}await pause(100);}throw Error('Timeout: '+expr);}
async function nav(url='/app/index.html'){await send('Page.navigate',{url:'http://127.0.0.1:8776'+url});await wait('!!document.getElementById("table-body")?.children.length');}
async function versionIs(version){await wait(`document.getElementById('app-version')?.textContent === 'Ver.${version}'`);}
async function update(){await evaluate(`document.getElementById('update-button').click()`);}
function release(version){
 fs.copyFileSync(path.join(root,'timetable.js'),path.join(candidate,'timetable.js'));
 fs.writeFileSync(path.join(candidate,'app-version.js'),`const APP_VERSION = "${version}";\n`);
 cp.execFileSync(process.execPath,[path.join(candidate,'tools/build-release.cjs')]);served=candidate;
}
(async()=>{
 await new Promise(r=>server.listen(8776,'127.0.0.1',r));await openBrowser();
 // Preserve exact table output across the update UI change.
 await nav('/baseline/index.html');const reference={};
 for(const lang of ['ja','en'])for(const dir of ['up','down'])reference[lang+dir]=await evaluate(`switchLanguage('${lang}');switchDirection('${dir}');document.getElementById('timetable-table').outerHTML`);
 await nav();await versionIs(originalVersion);await wait('!!navigator.serviceWorker.controller');
 for(const lang of ['ja','en'])for(const dir of ['up','down'])assert.equal(await evaluate(`switchLanguage('${lang}');switchDirection('${dir}');document.getElementById('timetable-table').outerHTML`),reference[lang+dir]);
 assert(fs.readFileSync(path.join(root,'timetable.js')).equals(fs.readFileSync(path.join(baseline,'timetable.js'))));
 for(const f of ['static','scroll','en'])assert(fs.readFileSync(path.join(root,'paper',`2027_timetable_${f}.html`)).equals(fs.readFileSync(path.join(baseline,'paper',`2027_timetable_${f}.html`))));
 await evaluate(`localStorage.setItem('test-user-data','keep');switchLanguage('en');caches.open('other-app-test').then(c=>c.put('/unrelated',new Response('keep')))`);
 assert(await evaluate(`document.querySelector('header').scrollWidth <= innerWidth`));
 fs.writeFileSync(path.join(temp,'header-390.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 console.log('PASS initial online, exact table/data/HTML preservation, 390px header');
 // Stop serving every request, fully close Chrome, and cold-start with the same profile.
 offline=true;await closeBrowser();await openBrowser();await nav('/app/?from=home');await versionIs(originalVersion);
 assert.equal(await evaluate(`localStorage.getItem('timetable-language')`),'en');
 for(const kind of ['static','scroll','en']){
  await evaluate(`document.querySelector('[data-paper$="_${kind}.html"]').click()`);
  await wait(`document.getElementById('paper-frame').contentDocument?.title.includes('${kind==='en'?'English':kind}')`);
  await evaluate(`document.getElementById('paper-close').click()`);
 }
 await update();await wait(`document.getElementById('update-status').textContent.includes('更新できませんでした')`);await nav();await versionIs(originalVersion);
 console.log('PASS offline cold restart, root/query start URL, all 3 paper views, offline update failure');
 offline=false;release('0.4.6-test');
 await evaluate(`navigator.serviceWorker.getRegistration().then(r=>r.update())`);
 await wait(`navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)`);await versionIs(originalVersion);
 await update();await versionIs('0.4.6-test');
 assert.equal(await evaluate(`localStorage.getItem('test-user-data')`),'keep');assert.equal(await evaluate(`document.documentElement.lang`),'en');
 assert(await evaluate(`caches.has('other-app-test')`));
 console.log('PASS staged update stays on old version until button; successful switch, settings and unrelated cache retained');
 // Integrity mismatch must fail even when the server returns HTTP 200.
 release('0.4.7-test');fs.appendFileSync(path.join(candidate,'timetable.js'),'\n// broken deployment');
 await update();await wait(`document.getElementById('update-status').textContent.includes('更新できませんでした')`);await versionIs('0.4.6-test');
 offline=true;await closeBrowser();await openBrowser();await nav();await versionIs('0.4.6-test');
 assert.equal(await evaluate(`localStorage.getItem('test-user-data')`),'keep');
 console.log('PASS corrupt update rejected; old release cold-starts offline afterward');
 offline=false;release('0.4.8-test');fs.unlinkSync(path.join(candidate,'paper/2027_timetable_en.html'));
 await update();await wait(`document.getElementById('update-status').textContent.includes('更新できませんでした')`);await versionIs('0.4.6-test');
 console.log('PASS missing file rejects entire update; current version remains usable');
 // Repeat with complete files to prove recovery requires no data/cache deletion.
 fs.copyFileSync(path.join(root,'paper/2027_timetable_en.html'),path.join(candidate,'paper/2027_timetable_en.html'));release('0.4.9-test');
 await update();await versionIs('0.4.9-test');
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:850,deviceScaleFactor:1,mobile:false});
 assert(await evaluate(`document.querySelector('header').scrollWidth <= innerWidth`));
 console.log('PASS retry after failure succeeds; 1280px header. Screenshots: '+temp);
 await nav('/migration/index.html');await versionIs('0.4.4-trial');await wait('!!navigator.serviceWorker.controller');
 await evaluate(`switchLanguage('en');caches.open('migration-other-app').then(c=>c.put('/marker',new Response('keep')))`);
 migration=root;
 await evaluate(`navigator.serviceWorker.getRegistration().then(r=>r.update())`);
 await wait(`navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)`);await versionIs('0.4.4-trial');
 await closeBrowser();await openBrowser();await nav('/migration/index.html');await versionIs(originalVersion);
 assert.equal(await evaluate(`document.documentElement.lang`),'en');assert(await evaluate(`caches.has('migration-other-app')`));
 console.log('PASS migration from v0.4.4: staged download, full close/reopen activates new update UI without deleting settings or unrelated cache');
 await closeBrowser();server.closeAllConnections();server.close();
})().catch(async error=>{console.error(error);try{await closeBrowser();}catch{browser?.kill();}server.closeAllConnections();server.close();process.exitCode=1;});
