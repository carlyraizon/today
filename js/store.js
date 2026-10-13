const KEY='today-app-v1';
const MIGRATION=3;
const defHabits=()=>[['Keyboard practice',10],['Sketching',10],['Knitting',0],['Space reset',5]].map(([name,mins])=>({name,mins,log:[]}));
export const empty=()=>({migration:MIGRATION,name:'',ladderUrl:'',liftNote:'Follow today’s session in Ladder.',events:[],todos:[],later:[],lift:[false,false,false,false,false,false,false],habits:defHabits(),media:[],chores:[],meal:null,intention:null,liftLog:[]});

// Titles seeded as example data by earlier versions of the app.
const OLD={
 events:['Design critique','Focus block','Lunch','Team 1:1'],
 todos:['Send research synthesis','Finalize flow mocks','Book dentist appointment','Organize component library','Plan weekend trip'],
 media:['Thinking in Systems','Abstract: The Art of Design','Design Details podcast'],
 chores:['Wipe kitchen counters','Vacuum living room','Change sheets','Clean fridge']};
const OLD_LIFT='true,false,true,false,true,false,false';
const APP_START='2026-10-12'; // nothing real can predate the app; earlier habit dates were seeded streaks
const isEx=(t,list)=>/\(example\)\s*$/.test(t||'')||list.includes(t);
function migrate(s){
 if((s.migration||0)>=MIGRATION)return {s,ran:false};
 if((s.migration||0)>=2){s.chores=(s.chores||[]).filter(c=>!('last' in c));s.migration=MIGRATION;s.todayApplied=null;return {s,ran:true}}
 const wasSample=!!s.sample||(s.events||[]).some(e=>isEx(e.title,OLD.events))||(s.todos||[]).some(t=>isEx(t.text,OLD.todos));
 s.events=(s.events||[]).filter(e=>!isEx(e.title,OLD.events));
 s.todos=(s.todos||[]).filter(t=>!isEx(t.text,OLD.todos));
 s.later=(s.later||[]).filter(t=>!isEx(t.text,OLD.todos));
 s.media=(s.media||[]).filter(m=>!isEx(m.title,OLD.media));
 s.chores=(s.chores||[]).filter(c=>!isEx(c.name,OLD.chores));
 s.habits=(s.habits||defHabits()).map(h=>({...h,log:[...new Set((h.log||[]).filter(d=>d>=APP_START))]}));
 if(wasSample&&String(s.lift)===OLD_LIFT)s.lift=empty().lift;
 // v3: cleaning moved to a fixed calendar; drop old due-based tasks (weekly/monthly without day/date, or any with 'last')
 s.chores=s.chores.filter(c=>!('last' in c)&&(c.freq==='daily'||(c.freq==='weekly'&&c.day)||(c.freq==='monthly'&&c.date)));
 delete s.sample;s.migration=MIGRATION;s.todayApplied=null; // force today.json re-merge
 return {s,ran:true};
}
export function load(){let raw=null;try{raw=JSON.parse(localStorage.getItem(KEY))}catch{}
 if(!raw)return empty();
 const {s}=migrate({...empty(),...raw,migration:raw.migration||0});if(!Array.isArray(s.liftLog))s.liftLog=[];s.liftLog=s.liftLog.filter(d=>typeof d==='string');save(s);return s}
export function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
