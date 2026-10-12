const KEY='today-app-v1';
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)};
const streakLog=n=>Array.from({length:n},(_,i)=>ago(i+1));
const defHabits=ex=>[['Keyboard practice',10,ex?12:0],['Sketching',10,ex?5:0],['Knitting',0,ex?2:0],['Space reset',5,0]].map(([name,mins,n])=>({name,mins,log:streakLog(n)}));
export const sample=()=>({sample:true,name:'',ladderUrl:'',liftNote:'Follow today’s session in Ladder.',
events:[{time:'09:30',title:'Design critique'},{time:'11:00',title:'Focus block'},{time:'13:00',title:'Lunch'},{time:'15:30',title:'Team 1:1'}],
todos:[{text:'Send research synthesis',done:true},{text:'Finalize flow mocks',done:false},{text:'Book dentist appointment',done:false}],
later:[{text:'Organize component library',done:false},{text:'Plan weekend trip',done:false}],
lift:[true,false,true,false,true,false,false],habits:defHabits(true),
media:[{title:'Thinking in Systems',by:'Donella Meadows',type:'read',link:'',why:'A chapter tonight.'},{title:'Abstract: The Art of Design',type:'watch',link:'',why:''},{title:'Design Details podcast',type:'listen',link:'',why:''}],
chores:[{name:'Wipe kitchen counters',freq:'daily',last:ago(1)},{name:'Vacuum living room',freq:'weekly',last:ago(8)},{name:'Change sheets',freq:'weekly',last:ago(2)},{name:'Clean fridge',freq:'monthly',last:ago(10)}]});
export const empty=()=>({sample:false,name:'',ladderUrl:'',liftNote:'Follow today’s session in Ladder.',events:[],todos:[],later:[],lift:[false,false,false,false,false,false,false],habits:defHabits(false),media:[],chores:[]});
export function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s?{...empty(),...s}:sample()}catch{return sample()}}
export function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
