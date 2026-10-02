const fs=require('fs'), path=require('path'), http=require('http'), cp=require('child_process'), assert=require('assert');
const root=path.resolve('output'), trial='app-v0.4.4-trial';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const old=fs.readFileSync(path.join(root,'app-v0.4.3/index.html'),'utf8');
const fresh=fs.readFileSync(path.join(root,trial,'index.html'),'utf8');
assert.equal(old.match(/<style>([\s\S]*?)<\/style>/)[1],fresh.match(/<style>([\s\S]*?)<\/style>/)[1]);
assert.equal(old.match(/<script>([\s\S]*?)<\/script>/)[1].replace('"0.4.3"','"0.4.4-trial"').replace('textContent = labels.title','textContent = "智頭急行"'),fresh.match(/<script>([\s\S]*?)<\/script>/)[1]);
for(const f of ['timetable.js','manifest.json','icon-192.png','icon-512.png']) assert(fs.readFileSync(path.join(root,'app-v0.4.3',f)).equals(fs.readFileSync(path.join(root,trial,f))));
for(const f of ['static','scroll','en']) assert(fs.readFileSync(path.join(root,'2027-html',`2027_timetable_${f}.html`)).equals(fs.readFileSync(path.join(root,trial,'paper',`2027_timetable_${f}.html`))));
const server=http.createServer((req,res)=>{try{let name=decodeURIComponent(req.url.split('?')[0]);if(name.endsWith('/'))name+='index.html';const f=path.join(root,name);if(!f.startsWith(root+path.sep))throw Error();const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json'};res.setHeader('Content-Type',mime[path.extname(f)]||'text/plain');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(8766,'127.0.0.1',r));
 const browserPath=process.env.CHROME_PATH || (process.platform==='win32' ? path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe') : 'google-chrome');
 const browser=cp.spawn(browserPath,['--headless=new','--remote-debugging-port=9224','--user-data-dir='+path.join(require('os').tmpdir(),'timetable-menu-'+Date.now()),'--no-first-run','about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws;
 try{
  let targets;for(let i=0;i<20;i++){try{targets=await (await fetch('http://127.0.0.1:9224/json',{signal:AbortSignal.timeout(1000)})).json();break;}catch{await pause(150);}}
  ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const waitFor=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await pause(100);}throw Error('Timeout '+expr);};
  const navigate=async folder=>{await send('Page.navigate',{url:`http://127.0.0.1:8766/${folder}/index.html`});await waitFor('!!document.getElementById("table-body")?.children.length');};
  await send('Page.enable');
  const references={};await navigate('app-v0.4.3');
  for(const lang of ['ja','en'])for(const dir of ['up','down'])references[lang+dir]=await evaluate(`switchLanguage('${lang}');switchDirection('${dir}');document.getElementById('timetable-table').outerHTML`);
  await navigate(trial);
  for(const lang of ['ja','en'])for(const dir of ['up','down'])assert.equal(await evaluate(`switchLanguage('${lang}');switchDirection('${dir}');document.getElementById('timetable-table').outerHTML`),references[lang+dir]);
  for(const width of [390,1280]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
   await evaluate(`switchLanguage('ja');switchDirection('down');document.getElementById('table-scroll').scrollTo(260,180);document.querySelector('summary').click()`);
   assert(await evaluate(`document.getElementById('paper-picker').open && document.getElementById('paper-options').getBoundingClientRect().right <= innerWidth`));
   const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,`paper-menu-${width}.png`),Buffer.from(shot.data,'base64'));
   for(const kind of ['static','scroll','en']){
    const before=await evaluate(`JSON.stringify([currentDirection,currentLanguage,document.getElementById('table-scroll').scrollTop,document.getElementById('table-scroll').scrollLeft])`);
    await evaluate(`document.querySelector('[data-paper$="_${kind}.html"]').click()`);
    await waitFor(`document.getElementById('paper-view').open && document.getElementById('paper-frame').contentDocument?.title.includes('${kind==='en'?'English':kind}')`);
    assert(await evaluate(`document.getElementById('paper-frame').getBoundingClientRect().height > 600`));
    await evaluate(`document.getElementById('paper-close').click()`);
    assert.equal(await evaluate(`JSON.stringify([currentDirection,currentLanguage,document.getElementById('table-scroll').scrollTop,document.getElementById('table-scroll').scrollLeft])`),before);
   }
  }
  console.log('PASS: unchanged table DOM (JP/EN × up/down), unchanged timetable data and 3 HTML files; 390/1280px menu, all 3 viewers and return position.');
  await send('Browser.close');
 }finally{if(ws)ws.close();browser.kill();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
