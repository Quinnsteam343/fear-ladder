// Fear Ladder phone app. Loaded as a file so the page can run under a strict Content Security Policy (no inline scripts).
{
// Universe = live top N by market cap (no stablecoins/wrapped/tokenized assets) + coins you hold. Fallback = CoinGecko top 10 on 14 Nov 2026.

// ---- hardening: everything that comes from outside is treated as untrusted text
const SAFE_ID=/^[a-z0-9][a-z0-9-]{0,63}$/;
function cleanSym(x){return String(x||'').replace(/[^A-Za-z0-9]/g,'').slice(0,12).toUpperCase();}
function cleanTxt(x){return String(x==null?'':x).replace(/[<>&"'`\\]/g,'').slice(0,80);}
const KRP={bitcoin:'XBTUSD',ethereum:'ETHUSD',solana:'SOLUSD',monero:'XMRUSD',near:'NEARUSD',zcash:'ZECUSD',ripple:'XRPUSD',cardano:'ADAUSD',dogecoin:'XDGUSD',tron:'TRXUSD'};
const NOBY=new Set(['monero','zcash']);
const FALLBACK=[['bitcoin','BTC',126080],['ethereum','ETH',4946],['binancecoin','BNB',0],['ripple','XRP',0],['solana','SOL',293.31],['tron','TRX',0],['hyperliquid','HYPE',97.96],['zcash','ZEC',3191.93],['monero','XMR',798],['dogecoin','DOGE',0]];
const COINS={};let TOP=FALLBACK.map(([id,n,ath],i)=>({id,n,rank:i+1,ath}));
function setU(){
  const N=Math.max(1,S.rank||10),keep=TOP.slice(0,N);for(const k of Object.keys(COINS))delete COINS[k];
  keep.forEach(c=>{COINS[c.id]={n:c.n,role:'#'+c.rank,alloc:0.9/keep.length,kr:KRP[c.id],by:NOBY.has(c.id)?null:c.n+'USDT'};if(c.ath)ATH[c.id]=Math.max(ATH[c.id]||0,c.ath);});
  for(const t of J){if(COINS[t.asset]||!SAFE_ID.test(String(t.asset))||!position(t.asset))continue;const rk=RANK&&RANK[t.asset];COINS[t.asset]={n:(TOP.find(x=>x.id===t.asset)||{}).n||t.asset.slice(0,5).toUpperCase(),role:'held · '+(rk?'#'+rk:'outside top 150'),alloc:0,kr:KRP[t.asset],by:null};}
  const sel=$('jA');if(sel){const cur=sel.value;sel.innerHTML=Object.entries(COINS).map(([k,c])=>'<option value="'+k+'">'+c.n+'</option>').join('');if(COINS[cur])sel.value=cur;}
}
const KRK={XXRPZUSD:'ripple',XRPUSD:'ripple',ADAUSD:'cardano',XDGUSD:'dogecoin',TRXUSD:'tron',XXBTZUSD:'bitcoin',XBTUSD:'bitcoin',XETHZUSD:'ethereum',ETHUSD:'ethereum',SOLUSD:'solana',XXMRZUSD:'monero',XMRUSD:'monero',NEARUSD:'near',XZECZUSD:'zcash',ZECUSD:'zcash'};
const DEF={buy:25,deep:50,tranches:4,step:15,gap:30,cap:10000,l1:100,l2:200,l3:300,trail:30,rank:10};
const NONC=/usd|tether|\bdai\b|wrapped|staked|bridged|restak|liquid-staked|liquid staked|gold|xaut|paxg|heloc|treasury|fund|yield|euro|eurc/i;
const DAY=864e5,$=id=>document.getElementById(id);
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
let S=Object.assign({},DEF,ls.get('fl_rules',{})),J=(a=>Array.isArray(a)?a.filter(t=>t&&SAFE_ID.test(String(t.asset))&&(t.side==='buy'||t.side==='sell')&&isFinite(+t.units)&&+t.units>0&&isFinite(+t.price)&&+t.price>0&&/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))&&t.id!=null):[])(ls.get('qm_trades',[])),ATH={};
let P={},fng=null,aud=null,health={},geckoTs=0,RANK=null;

const usd=n=>n==null?'—':'$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:n<10?3:n<1000?2:0});
const pc=n=>n==null?'—':(n>=0?'+':'')+n.toFixed(1)+'%';
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800);}
async function get(u,ms=9000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(t);}}
async function src(k,fn){const t=performance.now();try{const v=await fn();health[k]={ok:true,ms:Math.round(performance.now()-t)};return v;}catch(e){health[k]={ok:false,err:cleanTxt(e.message||e).slice(0,40)};return null;}}
const med=a=>{const x=a.slice().sort((p,q)=>p-q),n=x.length;return n?(n%2?x[(n-1)/2]:(x[n/2-1]+x[n/2])/2):null;};

async function fetchAll(){
  if(Date.now()-geckoTs>10*60e3){await src('CoinGecko',async()=>{const r=await get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=1');
      RANK={};const top=[];let k=0;for(const c of r){if(!c||!SAFE_ID.test(String(c.id)))continue;if(c.ath)ATH[c.id]=Math.max(ATH[c.id]||0,c.ath);if(NONC.test(c.id+' '+c.name))continue;k++;RANK[c.id]=k;top.push({id:c.id,n:cleanSym(c.symbol),rank:k,ath:c.ath});}
      if(top.length>=10)TOP=top;geckoTs=Date.now();});}
  else health.CoinGecko=health.CoinGecko||{ok:true,cached:true};
  setU();
  const ids=Object.keys(COINS);
  const [ll,kr,by,fg]=await Promise.all([
    src('DefiLlama',async()=>{const r=await get('https://coins.llama.fi/prices/current/'+ids.map(i=>'coingecko:'+i).join(','));const m={};for(const i of ids){const c=r.coins['coingecko:'+i];if(c)m[i]={p:c.price};}return m;}),
    src('Kraken',async()=>{const r=await get('https://api.kraken.com/0/public/Ticker?pair='+ids.filter(i=>COINS[i].kr).map(i=>COINS[i].kr).join(',')+',USDTAUD');const m={};
      for(const [k,v] of Object.entries(r.result||{})){if(k==='USDTAUD'){aud=+v.c[0];continue;}const i=KRK[k];if(i)m[i]={p:+v.c[0],c:+v.o?((+v.c[0]/+v.o-1)*100):null};}if(!Object.keys(m).length)throw new Error('empty');return m;}),
    src('Bybit',async()=>{const m={};await Promise.all(ids.filter(i=>COINS[i].by).map(async i=>{try{const t=(await get('https://api.bybit.com/v5/market/tickers?category=spot&symbol='+COINS[i].by)).result.list[0];m[i]={p:+t.lastPrice,c:+t.price24hPcnt*100};}catch(e){}}));if(!Object.keys(m).length)throw new Error('empty');return m;}),
    src('alternative.me',async()=>{const d=(await get('https://api.alternative.me/fng/?limit=1')).data[0];const v=Number(d.value);if(!Number.isInteger(v)||v<0||v>100)throw new Error('implausible F&G value');return{v,c:cleanTxt(d.value_classification)};})
  ]);
  if(fg)fng=fg;
  for(const i of ids){const v=[ll,kr,by].map(s=>s&&s[i]&&s[i].p).filter(Boolean);if(!v.length)continue;
    const m=med(v),prev=P[i];const jump=prev&&prev.p&&prev.t&&(Date.now()-prev.t<15*60e3)&&Math.abs(m/prev.p-1)>0.4;
    P[i]={t:Date.now(),jump:!!jump,p:m,n:v.length,spread:v.length>1?(Math.max(...v)-Math.min(...v))/m*100:null,c:(by&&by[i]&&by[i].c!=null)?by[i].c:(kr&&kr[i]?kr[i].c:null)};
    if(m>ATH[i])ATH[i]=m;}

}

function position(id){
  const tl=J.filter(t=>t.asset===id).sort((a,b)=>a.date<b.date?-1:1);let u=0,cyc=[];
  for(const t of tl){if(t.side==='buy'){if(u<=1e-12)cyc=[];u+=t.units;}else u-=t.units;cyc.push(t);}
  if(u<=1e-12)return null;
  const b=cyc.filter(t=>t.side==='buy'),bu=b.reduce((a,t)=>a+t.units,0),bc=b.reduce((a,t)=>a+t.usd,0),su=cyc.filter(t=>t.side==='sell').reduce((a,t)=>a+t.units,0);
  const sold=bu?su/bu:0;return{u,avg:bc/bu,n:b.length,last:b[b.length-1],stage:sold>=.64?2:sold>=.31?1:0};
}
function signal(id){
  if(P[id]&&P[id].jump)return{l:'PAUSED',k:'b-hold',w:'price moved more than 40% in minutes — waiting for it to confirm before signalling'};
  const c=COINS[id],q=P[id],p=q&&q.p,f=fng?fng.v:null,T=[S.l1,S.l2,S.l3];
  if(p==null||f==null)return{l:'NO DATA',k:'b-hold',w:'waiting for prices'};
  const dd=(p/ATH[id]-1)*100,deep=dd<=-S.deep,pos=position(id),warn=q.n<2?' · ⚠ single source':(q.spread>1.5?' · ⚠ sources disagree '+q.spread.toFixed(1)+'%':'');
  if(pos){const g=(p/pos.avg-1)*100;
    if(pos.stage<2&&g>=T[pos.stage])return{l:'SELL ⅓ · +'+T[pos.stage]+'%',k:'b-sell',w:'avg '+usd(pos.avg)+', now '+pc(g)+' — step '+(pos.stage+1)+' of 3'+warn,pos,g};
    if(pos.stage===2)return g>=T[2]?{l:'SELL REST',k:'b-sell',w:'now '+pc(g)+warn,pos,g}:{l:'TRAIL LAST ⅓',k:'b-acc',w:pc(g)+' · exit on a '+S.trail+'% drop from peak or at +'+T[2]+'%'+warn,pos,g};
    const days=(Date.now()-Date.parse(pos.last.date))/DAY;
    if(pos.stage===0&&f<=S.buy&&deep&&pos.n<S.tranches&&days>=S.gap&&p<=pos.last.price*(1-S.step/100))return{l:'BUY · '+(pos.n+1)+'/'+S.tranches,k:'b-buy',w:'F&G '+f+' · '+Math.abs(dd).toFixed(0)+'% below ATH · '+((p/pos.last.price-1)*100).toFixed(0)+'% under last buy'+warn,pos,g};
    return{l:'HOLD',k:'b-hold',w:'avg '+usd(pos.avg)+' ('+pc(g)+') · '+pos.n+'/'+S.tranches+' buys · next sell at '+usd(pos.avg*(1+T[pos.stage]/100))+warn,pos,g};}
  const rk=RANK&&RANK[id];if(f<=S.buy&&deep&&!c.alloc&&RANK&&(!rk||rk>S.rank))return{l:'BLOCKED · RANK '+(rk?'#'+rk:'>120'),k:'b-acc',w:'Fear + deep, but outside the top '+S.rank+' by market cap — in the 2018 and 2021 tests, ranks 11–30 mostly lost money'+warn};
  if(f<=S.buy&&deep)return c.alloc?{l:'BUY · 1/'+S.tranches,k:'b-buy',w:'F&G '+f+' + '+Math.abs(dd).toFixed(0)+'% below ATH'+warn}:{l:'IN ZONE · '+(c.role==='watch'?'WATCH':'NO ALLOC'),k:'b-acc',w:'no allocation in the plan'+warn};
  const near=f<=S.buy+10&&dd<=-(S.deep-10);
  return{l:near?'APPROACHING':'WAIT',k:near?'b-acc':'b-hold',w:'F&G '+f+(f<=S.buy?' ✓':' (≤ '+S.buy+')')+' · '+dd.toFixed(0)+'% from ATH'+(deep?' ✓':' (needs −'+S.deep+'%, zone ≤ '+usd(ATH[id]*(1-S.deep/100))+')')+warn};
}

function render(){
  const ids=Object.keys(COINS),sig=Object.fromEntries(ids.map(i=>[i,signal(i)])),al=ids.filter(i=>COINS[i].alloc);
  const sells=al.filter(i=>sig[i].l.startsWith('SELL')),buys=al.filter(i=>sig[i].l.startsWith('BUY')),f=fng?fng.v:null;
  let t,w,col;
  if(f==null){t='NO DATA';w='Could not reach the Fear & Greed source.';col='var(--violet)';}
  else if(sells.length){t='TAKE PROFIT — '+sells.map(i=>COINS[i].n).join(', ');w=sells.map(i=>COINS[i].n+': '+sig[i].w).join(' · ');col='var(--red)';}
  else if(buys.length){t='BUY TRANCHE — '+buys.map(i=>COINS[i].n).join(', ');w='Extreme fear and these coins are '+S.deep+'%+ below their highs.';col='var(--green)';}
  else if(f<=S.buy){t='FEAR — NOTHING DEEP ENOUGH';w='Fear trigger is on, but no allocated coin is '+S.deep+'%+ below its high.';col='var(--amber)';}
  else{t=f<=S.buy+15?'FEAR BUILDING — WAIT':'NO TRIGGER — WAIT';w='Buy only at F&G ≤ '+S.buy+' on coins '+S.deep+'%+ below their highs.';col='var(--dim)';}
  $('hT').textContent=t;$('hW').classList.toggle('amt',sells.length>0);$('hT').style.color=col;$('hW').textContent=w;$('hero').style.borderColor=col;
  if(fng){$('fngN').textContent=fng.v;$('fngM').style.left=fng.v+'%';$('fngC').textContent=fng.c+' · alternative.me';}
  const parts=[];
  if(sells.length)parts.push(sells.map(i=>COINS[i].n+': '+sig[i].l.toLowerCase()).join(' · '));
  if(buys.length)parts.push('Buy '+buys.map(i=>COINS[i].n+' '+usd(S.cap*COINS[i].alloc/S.tranches)).join(' · ')+', then log it in Journal.');
  $('next').innerHTML='<span class="lbl">Per plan</span>'+(parts.length?parts.join(' | '):'Nothing to do today.');
  $('coins').innerHTML=ids.map(i=>{const c=COINS[i],q=P[i]||{},s=sig[i],dd=q.p?(q.p/ATH[i]-1)*100:null;
    const meX=dd==null?0:Math.min(100,Math.max(0,-dd)),zone=100-S.deep;
    const lad=s.pos?'<div class="ladder">'+[S.l1,S.l2,S.l3].map((x,k)=>'<span class="'+(s.pos.stage>k?'done':(s.pos.stage===k&&s.g>=x?'now':''))+'">+'+x+'% · '+usd(s.pos.avg*(1+x/100))+'</span>').join('')+'</div>':'';
    return '<div class="coin"><div><span class="nm">'+c.n+'</span><span class="role">'+c.role+'</span></div>'+
      '<div><div class="px">'+usd(q.p)+'</div><div class="aud">'+(q.p&&aud?'A$'+(q.p*aud).toLocaleString(undefined,{maximumFractionDigits:q.p*aud<10?3:2}):'')+' <span class="'+(q.c>=0?'pos':'neg')+'">'+(q.c!=null?pc(q.c):'')+'</span></div></div>'+
      '<div><span class="badge '+s.k+'">'+s.l+'</span></div><div class="aud" style="align-self:center">'+(dd!=null?dd.toFixed(0)+'% ATH':'')+'</div>'+
      '<div class="depth" aria-hidden="true"><div class="track"></div><div class="zone" style="left:auto;right:0;width:'+zone+'%;border-right:0;border-left:2px solid var(--green)"></div><div class="me" style="left:'+meX+'%"></div><span class="t1">−'+S.deep+'%</span></div>'+
      '<div class="why'+(s.pos?' amt':'')+'">'+s.w+'</div>'+(lad?lad.replace('class="ladder"','class="ladder amt"'):'')+'</div>';}).join('');
  const ok=Object.values(health).filter(h=>h.ok).length,tot=Object.keys(health).length;
  $('dot').className='dot'+(ok<2?' bad':'');$('stTxt').textContent=ok+'/'+tot+' live · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  $('foot').textContent=aud?'AUD '+aud.toFixed(3)+' per USD · Kraken':'';
  $('srcs').innerHTML=Object.entries(health).map(([k,h])=>'<div class="src"><span>'+k+'</span><span class="'+(h.ok?'pos':'neg')+'">'+(h.ok?(h.cached?'cached':h.ms+' ms'):'down '+(h.err||''))+'</span></div>').join('');
  renderJournal();
}

function renderJournal(){
  const L=J.slice().sort((a,b)=>a.date<b.date?1:-1);
  $('jList').innerHTML=L.length?L.map(t=>'<div class="tr"><span class="badge '+(t.side==='buy'?'b-buy':'b-sell')+'">'+t.side.toUpperCase()+'</span><div><b>'+(COINS[t.asset]?COINS[t.asset].n:t.asset)+'</b> <span class="amt">'+(+t.units).toLocaleString(undefined,{maximumFractionDigits:6})+' @ '+usd(t.price)+'</span><div class="d">'+t.date+' · <span class="amt">'+usd(t.usd)+'</span></div></div><button class="x" data-del="'+t.id+'" aria-label="Delete">×</button></div>').join(''):'<div class="muted" style="padding:10px 0">No trades yet. Log each buy and sell so the ladder knows your average price.</div>';
}
function prefill(){const a=$('jA').value;if(P[a])$('jP').value=+P[a].p.toPrecision(6);preview();}
function preview(){const u=+$('jU').value,p=+$('jP').value;$('jPrev').textContent=u&&p?'Total '+usd(u*p):'';}

// ---- events
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+b.dataset.v));window.scrollTo(0,0);}));
setU();
$('jD').value=new Date().toISOString().slice(0,10);
$('jA').addEventListener('change',prefill);$('jU').addEventListener('input',preview);$('jP').addEventListener('input',preview);
$('jAdd').addEventListener('click',()=>{const u=+$('jU').value,p=+$('jP').value;if(!(u>0&&p>0)){toast('ENTER UNITS + PRICE');return;}
  J.push({id:Date.now().toString(36),date:$('jD').value||new Date().toISOString().slice(0,10),asset:$('jA').value,side:$('jS').value,units:u,price:p,usd:u*p});ls.set('qm_trades',J);$('jU').value='';preview();render();toast('TRADE LOGGED');});
$('jList').addEventListener('click',e=>{const id=e.target.getAttribute('data-del');if(!id)return;const b=e.target;if(b.dataset.armed){J=J.filter(t=>t.id!==id);ls.set('qm_trades',J);render();toast('DELETED');}else{b.dataset.armed='1';b.textContent='?';b.style.color='var(--red)';setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent='×';b.style.color='';}},2500);}});
$('jExp').addEventListener('click',async()=>{const txt=JSON.stringify(J);$('jIO').value=txt;try{await navigator.clipboard.writeText(txt);toast('COPIED');}catch(e){$('jIO').select();toast('SELECT + COPY');}});
$('jImp').addEventListener('click',()=>{try{const a=JSON.parse($('jIO').value);if(!Array.isArray(a))throw 0;const have=new Set(J.map(t=>t.id));let n=0;for(const t of a)if(t&&SAFE_ID.test(String(t.asset))&&(t.side==='buy'||t.side==='sell')&&isFinite(+t.units)&&+t.units>0&&isFinite(+t.price)&&+t.price>0&&/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))&&t.id!=null&&!have.has(cleanTxt(t.id))){J.push({id:cleanTxt(t.id),date:t.date,asset:t.asset,side:t.side,units:+t.units,price:+t.price,usd:+t.usd||t.units*t.price});n++;}ls.set('qm_trades',J);render();toast('IMPORTED '+n);}catch(e){toast('NOT VALID JSON');}});
const SF={sBuy:'buy',sDeep:'deep',sTr:'tranches',sStep:'step',sGap:'gap',sCap:'cap',sL1:'l1',sL2:'l2',sL3:'l3',sTrail:'trail',sRank:'rank'};
function fillS(){for(const [e,k] of Object.entries(SF))$(e).value=S[k];}
$('sSave').addEventListener('click',()=>{for(const [e,k] of Object.entries(SF)){const v=parseFloat($(e).value);if(isFinite(v))S[k]=v;}S.tranches=Math.max(1,Math.round(S.tranches));ls.set('fl_rules',S);render();toast('RULES SAVED');});
$('sReset').addEventListener('click',()=>{S=Object.assign({},DEF);ls.set('fl_rules',S);fillS();render();toast('DEFAULTS');});
let busy=false;async function cycle(){if(busy)return;busy=true;$('refresh').textContent='…';try{await fetchAll();render();if(!$('jP').value)prefill();}finally{busy=false;$('refresh').textContent='↻';}}
$('refresh').addEventListener('click',cycle);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)cycle();});
fillS();renderJournal();cycle();setInterval(()=>{if(!document.hidden)cycle();},60000);
if('serviceWorker' in navigator&&isSecureContext&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
// ---- install helpers: Android (Chrome install prompt) and iPhone (Safari: Share → Add to Home Screen)
const APP_VERSION='1.0.2';$('ver').textContent='v'+APP_VERSION;
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let deferred=null;
function installUI(){const t=$('installTxt'),b=$('installBtn');
  if(standalone){t.textContent='Installed — opens full-screen from your home screen.';b.style.display='none';return;}
  if(!isSecureContext||location.protocol==='file:'){t.textContent='Open this app from its https link (not a file) to install it.';return;}
  if(ios){t.innerHTML='Tap <b>Share</b> (square with ↑) → <b>Add to Home Screen</b> → keep <b>Open as Web App</b> on → <b>Add</b>. Works in Safari, and in Chrome on recent iOS.';return;}
  if(deferred){t.textContent='Add Fear Ladder to your home screen.';b.style.display='';}else t.innerHTML='In <b>Chrome</b>: tap <b>⋮</b> → <b>Install app</b> (or Add to Home screen).';}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;installUI();});
addEventListener('appinstalled',()=>{deferred=null;toast('INSTALLED');installUI();});
$('installBtn').addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice;}catch(e){}deferred=null;installUI();});
installUI();

// ---- extra protections (v1.0.2)
{ // 1. refuse to run inside someone else's page (click-jacking)
  if(window.top!==window.self){document.body.innerHTML='';try{window.top.location=window.location.href;}catch(e){}}
  // 2. warn if opened from anywhere but the official address (copycat / phishing copies)
  const OFFICIAL='quinnsteam343.github.io',h=location.hostname;
  if(h&&h!==OFFICIAL&&h!=='localhost'&&h!=='127.0.0.1'){const w=$('originWarn');w.style.display='';w.textContent='⚠ This is not the official Fear Ladder address. Only use https://'+OFFICIAL+'/fear-ladder/ — don’t enter anything here.';}
  // 3. ask the phone to keep this app's storage (journal) instead of clearing it
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
  // 4. hide-amounts toggle (remembered on this phone)
  const pb=$('privBtn'),setPriv=on=>{document.body.classList.toggle('priv',on);pb.classList.toggle('on',on);pb.setAttribute('aria-pressed',on?'true':'false');ls.set('fl_priv',on);};
  setPriv(!!ls.get('fl_priv',false));pb.addEventListener('click',()=>{setPriv(!document.body.classList.contains('priv'));toast(document.body.classList.contains('priv')?'AMOUNTS HIDDEN':'AMOUNTS SHOWN');});
}
}
