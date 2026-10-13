import {load,save,empty} from './store.js';
import {activeSource} from './schedule-source.js';
import {promptFor} from './prompts.js';
import {intentionFor} from './intentions.js';
let S=load();const $=id=>document.getElementById(id);
const isoOf=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayISO=()=>isoOf(new Date());
const DAYS=['M','T','W','T','F','S','S'],DAYN=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';
const commit=()=>{save(S);render()};
const daysSince=d=>d?Math.round((new Date(todayISO())-new Date(d))/864e5):Infinity;
const isDue=c=>daysSince(c.last)>={daily:1,weekly:7,monthly:30}[c.freq];
const lastTxt=c=>{const n=daysSince(c.last);return n===Infinity?'never done':n===0?'done today':n===1?'done yesterday':`${n} days ago`};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const empty1=t=>`<li class="empty">${t}</li>`;
const streak=h=>{let n=0,d=new Date();if(!h.log.includes(isoOf(d)))d.setDate(d.getDate()-1);while(h.log.includes(isoOf(d))){n++;d.setDate(d.getDate()-1)}return n};
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
async function render(){
 const now=new Date(),dow=(now.getDay()+6)%7,h=now.getHours(),nm=mins(`${h}:${now.getMinutes()}`);
 $('date').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
 $('greeting').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+(S.name?`, ${S.name}`:'');
 const ev=await activeSource.getEvents(S);
 let nowIdx=-1;ev.forEach((e,i)=>{if(mins(e.time)<=nm)nowIdx=i});
 const cur=nowIdx;
 $('evCount').textContent=ev.length?`${ev.length} event${ev.length>1?'s':''}`:'';
 $('events').innerHTML=ev.length?ev.map((e,i)=>`<li class="${i===cur?'now':i<cur?'past':''}"><span class="time">${esc(e.time)}</span><span class="t">${esc(e.title)}</span>${i===cur?'<span class="sub">now</span>':''}<span class="ctl"><button data-del-ev="${S.events.indexOf(e)}" aria-label="Remove">Remove</button></span></li>`).join(''):empty1('Nothing scheduled.');
 const todoLi=(t,i,l)=>`<li class="${t.done?'checked':''}"><input type="checkbox" data-chk="${l}:${i}" ${t.done?'checked':''} aria-label="Done"><span class="t">${esc(t.text)}</span><span class="ctl">`+
  (l==='todos'?`<button data-up="${i}" aria-label="Move up">↑</button><button data-down="${i}" aria-label="Move down">↓</button><button data-tolater="${i}">Later</button>`:`<button data-totop="${i}">To top 3</button>`)+`<button data-deltodo="${l}:${i}" aria-label="Remove">Remove</button></span></li>`;
 const doneN=S.todos.filter(t=>t.done).length;
 $('todoCount').textContent=S.todos.length?`${doneN} of ${S.todos.length} done`:'';
 $('todos').innerHTML=S.todos.length?S.todos.map((t,i)=>todoLi(t,i,'todos')).join(''):empty1('Choose up to three.');
 $('later').innerHTML=S.later.map((t,i)=>todoLi(t,i,'later')).join('');
 $('laterSum').textContent=`Later · ${S.later.length} item${S.later.length===1?'':'s'}`;
 const lift=S.lift[dow];
 $('liftStatus').textContent=lift?'Lift day':'Rest day';
 $('liftNote').textContent=!S.lift.some(Boolean)?'Tap the days you lift.':lift?S.liftNote:'Recover. A walk counts.';
 $('liftGrid').innerHTML=DAYS.map((d,i)=>`<button class="${S.lift[i]?'on':''} ${i===dow?'today':''}" data-lift="${i}" aria-pressed="${S.lift[i]}" aria-label="${DAYN[i]}">${d}</button>`).join('');
 $('ladderLink').href=safeUrl(S.ladderUrl)||'https://www.joinladder.com/';
 const hd=S.habits.filter(x=>x.log.includes(todayISO())).length;
 $('habitCount').textContent=S.habits.length?`${hd} of ${S.habits.length}`:'';
 $('habits').innerHTML=S.habits.length?S.habits.map((x,i)=>{const on=x.log.includes(todayISO()),k=streak(x);return `<li class="${on?'checked':''}"><input type="checkbox" data-habit="${i}" ${on?'checked':''} aria-label="Done today"><span class="t">${esc(x.name)}${x.mins?` <span class="sub">${x.mins} min</span>`:''}</span><span class="ctl"><button data-delhabit="${i}" aria-label="Remove">Remove</button></span><span class="streak">${k?`<b>${k}</b> day${k>1?'s':''}`:'—'}</span></li>`}).join(''):empty1('No habits yet.');
 const due=S.chores.map((c,i)=>({...c,i})).filter(isDue);
 $('choreCount').textContent=S.chores.length?`${due.length} of ${S.chores.length} tasks`:'';
 $('chores').innerHTML=due.length?due.map(c=>`<li><span class="t">${esc(c.name)}</span><span class="ctl"><button data-delchore="${c.i}">Remove</button></span><span class="meta2">${cap(c.freq)} · ${lastTxt(c)}</span><button class="btn" data-done="${c.i}">Done</button></li>`).join(''):empty1(S.chores.length?'Nothing due today.':'No tasks yet.');
 $('meal').innerHTML=S.meal&&S.meal.text?`<p class="meal">${esc(S.meal.text)}</p>${safeUrl(S.meal.link)?`<a class="link" href="${esc(S.meal.link)}" target="_blank" rel="noopener">Recipe ↗</a>`:''}`:'<p class="empty" style="margin:0">No meal note today</p>';
 const fb=intentionFor(now),it=S.intention||{};
 $('intention').innerHTML=[['Intention',it.text||fb.text],['Journal',it.journal||fb.journal],['Ritual',it.ritual||fb.ritual]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
 const p=promptFor(now);if(S.sketch&&S.sketch.text){$('prompt').textContent=S.sketch.text;$('promptNum').textContent=''}else{$('prompt').textContent=p.text+'.';$('promptNum').textContent=`${p.n} / ${p.total}`}
 const tl=m=>safeUrl(m.link)?`<a href="${esc(m.link)}" target="_blank" rel="noopener">${esc(m.title)}</a>`:esc(m.title);
 const TY={read:'Reading',watch:'Watching',listen:'Listening'};
 const [c0,...q]=S.media;
 $('mediaNow').innerHTML=c0?`<span class="type">${TY[c0.type]||'Now'}</span><p class="title">${tl(c0)}${c0.by?` <span class="by">${esc(c0.by)}</span>`:''}</p>${c0.why?`<p class="note">${esc(c0.why)}</p>`:''}<button class="btn" data-mnext>Finished</button>`:'<p class="empty">Nothing picked.</p>';
 $('media').innerHTML=q.length?q.map((m,j)=>`<li><span class="type">${cap(m.type)}</span><span class="t">${tl(m)}</span><span class="ctl"><button data-mpick="${j+1}">Start</button><button data-mdel="${j+1}">Remove</button></span></li>`).join(''):empty1('Queue is empty.');
 const parts=[`<b>${ev.length}</b> event${ev.length===1?'':'s'}`,`<b>${S.todos.length-doneN}</b> open`,`<b>${lift?'Lift':'Rest'} day</b>`];
 $('summary').innerHTML=parts.join(' · ');
}
document.addEventListener('click',e=>{const d=e.target.dataset;if(!d)return;
 if(d.delEv!=null)S.events.splice(+d.delEv,1);
 else if(d.up!=null){const i=+d.up;if(i>0)[S.todos[i-1],S.todos[i]]=[S.todos[i],S.todos[i-1]]}
 else if(d.down!=null){const i=+d.down;if(i<S.todos.length-1)[S.todos[i+1],S.todos[i]]=[S.todos[i],S.todos[i+1]]}
 else if(d.tolater!=null)S.later.unshift(...S.todos.splice(+d.tolater,1));
 else if(d.totop!=null){if(S.todos.length>=3){alert('Top 3 is full. Move one to Later first.');return}S.todos.push(...S.later.splice(+d.totop,1))}
 else if(d.deltodo){const[l,i]=d.deltodo.split(':');S[l].splice(+i,1)}
 else if(d.chk){const[l,i]=d.chk.split(':');S[l][+i].done=e.target.checked}
 else if(d.lift!=null)S.lift[+d.lift]=!S.lift[+d.lift];
 else if(d.done!=null)S.chores[+d.done].last=todayISO();
 else if(d.delchore!=null)S.chores.splice(+d.delchore,1);
 else if(d.habit!=null){const x=S.habits[+d.habit],t=todayISO();x.log=e.target.checked?[...new Set([...x.log,t])]:x.log.filter(v=>v!==t)}
 else if(d.delhabit!=null)S.habits.splice(+d.delhabit,1);
 else if(d.mnext!=null)S.media.shift();
 else if(d.mpick!=null)S.media.unshift(...S.media.splice(+d.mpick,1));
 else if(d.mdel!=null)S.media.splice(+d.mdel,1);
 else return;commit()});
const onAdd=(id,fn)=>$(id).onsubmit=e=>{e.preventDefault();fn();e.target.reset();commit()};
onAdd('eventForm',()=>S.events.push({time:$('evTime').value.padStart(5,'0'),title:$('evTitle').value.trim()}));
onAdd('todoForm',()=>{const t={text:$('todoText').value.trim(),done:false};(S.todos.length<3?S.todos:S.later).push(t)});
onAdd('habitForm',()=>S.habits.push({name:$('habitName').value.trim(),mins:+$('habitMins').value||0,log:[]}));
onAdd('choreForm',()=>S.chores.push({name:$('choreName').value.trim(),freq:$('choreFreq').value,last:''}));
onAdd('mediaForm',()=>S.media.push({title:$('mTitle').value.trim(),type:$('mType').value,link:$('mLink').value.trim(),why:$('mWhy').value.trim()}));
const wipe=()=>{const keep={name:S.name,ladderUrl:S.ladderUrl,liftNote:S.liftNote};S={...empty(),...keep};save(S);applyToday().then(render)};
$('resetBtn').onclick=()=>{if(confirm('Clear all data on this device? Export first if you want a backup.'))wipe()};
$('settingsBtn').onclick=()=>{$('setName').value=S.name||'';$('setLadder').value=S.ladderUrl||'';$('setNote').value=S.liftNote||'';$('settings').showModal()};
$('settings').addEventListener('close',()=>{if($('settings').returnValue!=='save')return;S.name=$('setName').value.trim();S.ladderUrl=$('setLadder').value.trim();S.liftNote=$('setNote').value.trim()||empty().liftNote;commit()});
$('exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download=`today-backup-${todayISO()}.json`;a.click()};
$('importFile').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());save({...empty(),...d,migration:d.migration||0});location.reload()}catch{alert('Could not read that file.')}};
// today.json: daily suggestions written by another process. Merged once per new content; checkmarks preserved.
async function applyToday(){try{const r=await fetch('today.json',{cache:'no-store'});if(!r.ok)return;const txt=await r.text();if(S.todayApplied===txt)return;const j=JSON.parse(txt);
 if(Array.isArray(j.top3)){const old=new Map([...S.todos,...S.later].map(t=>[t.text,t.done]));const drop=S.todos.filter(t=>!j.top3.includes(t.text)&&!t.done);
  S.todos=j.top3.slice(0,3).map(t=>({text:t,done:!!old.get(t)}));S.later=[...drop,...S.later.filter(l=>!j.top3.includes(l.text)&&!drop.some(d=>d.text===l.text))]}
 if(j.media){const items=[j.media.current,...(j.media.queue||[])].filter(Boolean);const titles=new Set(items.map(m=>m.title));S.media=[...items,...S.media.filter(m=>!titles.has(m.title))]}
 if(Array.isArray(j.cleaning))for(const c of j.cleaning){const ex=S.chores.find(x=>x.name===c.name);if(ex)ex.freq=c.freq||ex.freq;else S.chores.push({name:c.name,freq:c.freq||'weekly',last:c.last||''})}
 S.meal=j.meal&&j.meal.text?{text:String(j.meal.text),link:String(j.meal.link||'')}:null;
 S.intention=j.intention&&typeof j.intention==='object'?{text:String(j.intention.text||''),journal:String(j.intention.journal||''),ritual:String(j.intention.ritual||'')}:null;
 S.sketch=j.sketch&&j.sketch.text?{text:String(j.sketch.text)}:null;
 S.todayApplied=txt;save(S)}catch(err){console.warn('today.json skipped',err)}}
applyToday().then(render);
setInterval(render,60000);
new MutationObserver(()=>document.querySelectorAll('li:not([tabindex])').forEach(l=>l.tabIndex=-1)).observe(document.body,{childList:true,subtree:true});
