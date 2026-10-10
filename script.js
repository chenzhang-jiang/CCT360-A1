const CLUES = {
  quickMeals:{id:'quickMeals',title:'Quick Meals',tag:'LIFE',symbol:'🍜',desc:'Instant noodles, takeout containers, and very little fresh food suggest a schedule built around convenience.'},
  critique:{id:'critique',title:'“Crit — 2 PM”',tag:'SCHOOL?',symbol:'☕',desc:'A note by the mug says “Crit — 2 PM.” It sounds academic, but not like a normal lecture.'},
  planner:{id:'planner',title:'Weekly Planner',tag:'SCHOOL',symbol:'📅',desc:'Lecture. Studio. Quiz. Project meeting. The pattern strongly suggests the owner is a university student.'},
  visualWork:{id:'visualWork',title:'Visual Work',tag:'CREATIVE',symbol:'🎨',desc:'Typography, exhibition notes, and storyboard fragments appear around the room. Visual work is more than a casual hobby here.'},
  usb:{id:'usb',title:'USB Drive',tag:'OBJECT',symbol:'◫',desc:'A small USB drive was hidden in the desk drawer. It may connect to another clue.'},
  projectFiles:{id:'projectFiles',title:'Project Files',tag:'DIGITAL MEDIA',symbol:'💻',desc:'The USB contains an interactive web project, a short video edit, a type specimen, and an image-and-sound assignment.'},
  courseCodes:{id:'courseCodes',title:'Course Codes',tag:'IDENTITY',symbol:'▣',desc:'The locked school folder contains repeated CCT and FAH course codes, plus a UTM timetable export. This is the strongest identity clue.'}
};
const initialState=()=>({scene:'living',history:['living'],clues:[],hasUSB:false,foundPassword:false,schoolUnlocked:false,visited:{},timeStep:0});
let state=loadState()||initialState();
const $=(s)=>document.querySelector(s); const $$=(s)=>[...document.querySelectorAll(s)];
const screens={title:$('#titleScreen'),intro:$('#introScreen'),main:$('#mainScreen'),ending:$('#endingScreen')};
const sceneNames={living:'LIVING ROOM',kitchen:'KITCHEN',bedroom:'BEDROOM',desk:'DESK',laptop:'LAPTOP',deduction:'FINAL DEDUCTION'};
const times=['11:47 PM','11:51 PM','11:55 PM','11:58 PM','12:01 AM','12:05 AM','12:08 AM'];

function saveState(){localStorage.setItem('whoLivesHereState',JSON.stringify(state));}
function loadState(){try{return JSON.parse(localStorage.getItem('whoLivesHereState'))}catch(e){return null}}
function showScreen(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
function setScene(name,push=true){if(push&&state.scene!==name)state.history.push(name);state.scene=name;state.timeStep=Math.min(state.timeStep+1,times.length-1);$$('.scene').forEach(s=>s.classList.toggle('active',s.dataset.scene===name));$('#sceneLabel').textContent=sceneNames[name];$('#clockText').textContent=times[state.timeStep];$('#computerTime').textContent=times[Math.min(state.timeStep+1,times.length-1)];state.visited[name]=true;saveState();refreshUI()}
function backScene(){if(state.history.length>1){state.history.pop();const prev=state.history[state.history.length-1];state.scene=prev;$$('.scene').forEach(s=>s.classList.toggle('active',s.dataset.scene===prev));$('#sceneLabel').textContent=sceneNames[prev];saveState();}}
function resetGame(){localStorage.removeItem('whoLivesHereState');state=initialState();closeOverlays();showScreen('intro');refreshUI()}
function refreshUI(){
  $('#clueCount').textContent=state.clues.length;
  $('#finalBtn').classList.toggle('locked',state.clues.length<5);
  $('#usbIcon').classList.toggle('hidden',!state.hasUSB);
  $('#terminalNote').textContent=state.hasUSB?'USB DRIVE CONNECTED.':'No external drive detected.';
  renderNotebook();saveState();
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1800)}
function addClue(id){if(!state.clues.includes(id)){state.clues.push(id);toast(`EVIDENCE ADDED — ${CLUES[id].title}`);refreshUI();}}
function openOverlay(id){closeOverlays();$(id).classList.add('open')}
function closeOverlays(){$$('.overlay').forEach(o=>o.classList.remove('open'))}
function modal(html){$('#modalContent').innerHTML=html;openOverlay('#modal')}
function renderNotebook(){
  const list=$('#clueList');list.innerHTML='';Object.values(CLUES).forEach((c,i)=>{const found=state.clues.includes(c.id);const b=document.createElement('button');b.className='clue-entry '+(found?'':'locked');b.innerHTML=`<span>${String(i+1).padStart(2,'0')} ${found?c.title:'UNKNOWN'}</span><span>${found?'✓':'—'}</span>`;if(found)b.onclick=()=>showClue(c.id,b);list.appendChild(b)});
}
function showClue(id,btn){$$('.clue-entry').forEach(e=>e.classList.remove('active'));btn.classList.add('active');const c=CLUES[id];$('#clueDetail').innerHTML=`<span class="clue-tag">${c.tag}</span><h3>${c.title}</h3><div class="clue-image">${c.symbol}</div><p>${c.desc}</p>`}

function inspect(h){
  switch(h){
    case 'roommate': modal(`<p class="eyebrow">PRIVATE SPACE</p><h3>Roommate's Room</h3><div class="inspect-box">The door is closed.<br><br><em>Better not go in.</em></div><p>This investigation is about the owner of the room you were invited to inspect—not their roommate.</p>`);break;
    case 'kitchen': setScene('kitchen');break;
    case 'bedroom-door': setScene('bedroom');break;
    case 'backpack': modal(`<p class="eyebrow">OBJECT</p><h3>Backpack</h3><div class="inspect-box">A worn backpack. Receipts, chargers, pens… nothing that proves an identity.</div><p>Not every object is evidence.</p>`);break;
    case 'fridge': modal(`<p class="eyebrow">KITCHEN</p><h3>Inside the Fridge</h3><div class="inspect-box large">🥛 &nbsp; 🥡 &nbsp; 🥚 &nbsp; 🧊☕<br><br><span style="color:#8f998f">Half a carton of milk. One egg. Yesterday's takeout. Iced coffee.</span></div><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('quickMeals')">RECORD OBSERVATION</button></div>`);break;
    case 'cabinet': modal(`<p class="eyebrow">KITCHEN</p><h3>Cabinet</h3><div class="inspect-box">Instant noodles. Protein bars. Coffee filters.<br><br>No real groceries.</div><p>The pattern matches what was in the fridge.</p>`);break;
    case 'mug': modal(`<p class="eyebrow">KITCHEN</p><h3>Coffee Mug</h3><div class="inspect-box">A ring of cold coffee at the bottom.<br><br><strong>Sticky note:</strong> “CRIT — 2 PM”</div><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('critique')">ADD TO NOTEBOOK</button></div>`);break;
    case 'desk': setScene('desk');break;
    case 'wall': modal(`<p class="eyebrow">BEDROOM WALL</p><h3>A Visual Trail</h3><div class="inspect-box large">TYPE SPECIMEN &nbsp;&nbsp; / &nbsp;&nbsp; AGO EXHIBITION CARD<br><br>STORYBOARD FRAME 04<br><br>Small layout studies pinned under masking tape.</div><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('visualWork')">RECORD OBSERVATION</button></div>`);break;
    case 'planner': modal(`<p class="eyebrow">DESK</p><h3>Weekly Planner</h3><div class="inspect-box large" style="font-family:Georgia,serif;line-height:2">MON — Lecture 10–12<br>TUE — Edit video<br>WED — Studio 2–5<br>THU — Critique 2 PM<br>FRI — Quiz</div><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('planner')">ADD TO NOTEBOOK</button></div>`);break;
    case 'sketchbook': modal(`<p class="eyebrow">DESK</p><h3>Sketchbook</h3><div class="inspect-box large">PAGE 01 — Letterform studies<br><br>PAGE 02 — Storyboard thumbnails<br><br>PAGE 03 — Gallery notes<br><br><em>The same visual language appears on the wall.</em></div><p>This supports the creative-work clue, but it is not a new piece of evidence on its own.</p>`);break;
    case 'drawer': drawerModal();break;
    case 'sticky': state.foundPassword=true;saveState();modal(`<p class="eyebrow">DESK</p><h3>Sticky Note</h3><div class="inspect-box">“the day this all ends”<br><br><strong>OCT 14</strong></div><p>A strange way to phrase a project deadline. It could also be a password hint.</p>`);toast('PASSWORD HINT REMEMBERED');break;
    case 'laptop': setScene('laptop');break;
    case 'folder-projects': modal(`<p class="eyebrow">OWNER-MAC / PROJECTS</p><h3>Project Folder</h3><div class="file-list">interactive_story_v4.html<br>image_sound_final.mov<br>type_specimen.indd<br>exhibition_notes.pdf</div><p>Creative coursework—probably digital media, design, or both.</p>`);break;
    case 'folder-photos': modal(`<p class="eyebrow">OWNER-MAC / PHOTOS</p><h3>Photos</h3><div class="inspect-box">A museum hallway. A campus courtyard. Several shots of printed layouts.</div><p>Useful atmosphere, but still not enough to identify the owner.</p>`);break;
    case 'usb': usbModal();break;
    case 'folder-school': schoolFolder();break;
  }
}
function drawerModal(){modal(`<p class="eyebrow">DESK DRAWER</p><h3>Inside the Drawer</h3><div class="inspect-box large">${state.hasUSB?'An empty slot where the USB used to be.':'◫ USB DRIVE &nbsp;&nbsp; • &nbsp;&nbsp; old receipt &nbsp;&nbsp; • &nbsp;&nbsp; spare key'}</div><div class="modal-actions">${state.hasUSB?'':'<button class="menu-btn primary" onclick="takeUSB()">TAKE USB</button>'}</div>`)}
window.takeUSB=function(){state.hasUSB=true;addClue('usb');saveState();closeOverlays();toast('USB ADDED TO INVENTORY')}
window.collectFromModal=function(id){addClue(id);closeOverlays()}
function usbModal(){if(!state.hasUSB)return;modal(`<p class="eyebrow">USB DRIVE</p><h3>External Drive</h3><div class="file-list">interactive_web/week4/<br>video_edit/final_v7.mov<br>typeface/specimen_final.indd<br>image_sound/unit1_final.mov</div><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('projectFiles')">RECORD FILE PATTERN</button></div>`)}
function schoolFolder(){
  if(state.schoolUnlocked){showSchoolFiles();return}
  modal(`<p class="eyebrow">OWNER-MAC / SCHOOL</p><h3>Folder Locked</h3><div class="inspect-box">Password required.</div><p>${state.foundPassword?'You remember a note on the desk: “the day this all ends” — OCT 14.':'You have not found a useful password hint yet.'}</p><div class="password-row"><input id="pwInput" placeholder="Enter password" maxlength="6"><button class="menu-btn primary" onclick="tryPassword()">UNLOCK</button></div>`)
}
window.tryPassword=function(){const v=($('#pwInput').value||'').replace(/\D/g,'');if(v==='1014'){state.schoolUnlocked=true;saveState();showSchoolFiles();toast('SCHOOL FOLDER UNLOCKED')}else{toast('PASSWORD INCORRECT')}}
function showSchoolFiles(){modal(`<p class="eyebrow">OWNER-MAC / SCHOOL</p><h3>Fall 2026</h3><div class="file-list">CCT360 — Interactive Media<br>CCT353 — Image & Sound<br>FAH262 — East Asian Art<br>UTM_timetable_export.pdf</div><p>CCT and FAH repeat across the owner's coursework. The timetable export identifies the campus.</p><div class="modal-actions"><button class="menu-btn primary" onclick="collectFromModal('courseCodes')">ADD IDENTITY EVIDENCE</button></div>`)}

function submitTheory(){
  const status=$('input[name="status"]:checked')?.value;
  const location=$('input[name="location"]:checked')?.value;
  const fields=$$('input[name="field"]:checked').map(i=>i.value);
  if(!status||!location||fields.length!==2){toast('COMPLETE ALL THREE PARTS OF YOUR THEORY');return}
  const exact=status==='student'&&location==='utm'&&fields.includes('ccit')&&fields.includes('fah');
  const near=status==='student'&&location==='utm';
  showScreen('ending');
  $('#endingClues').textContent=`${state.clues.length}/7 evidence`;
  $('#endingTime').textContent=times[Math.min(state.timeStep+1,times.length-1)];
  if(exact){$('#endingEyebrow').textContent='CASE CLOSED';$('#endingTitle').textContent='YOU FOUND THEM.';$('#endingBody').innerHTML=`The owner is a <strong>UTM student</strong> whose studies combine <strong>Communication / Digital Media</strong> and <strong>Art & Art History</strong>.<br><br>You did not find a single answer lying around the room. You reconstructed it from a pattern of ordinary traces.`}
  else if(near){$('#endingEyebrow').textContent='ALMOST THERE';$('#endingTitle').textContent='THE PERSON FITS. THE FIELD DOESN’T.';$('#endingBody').textContent='Your student and campus deductions fit the evidence, but your academic-field theory leaves some clues unexplained. Return to the room and compare the visual work with the computer files.'}
  else{$('#endingEyebrow').textContent='THEORY INCOMPLETE';$('#endingTitle').textContent='SOMETHING DOESN’T ADD UP.';$('#endingBody').textContent='At least one major part of your theory conflicts with the evidence. Re-open the notebook, then return to the apartment and look for patterns rather than single objects.'}
}

$$('[data-action]').forEach(el=>el.addEventListener('click',()=>{
  const a=el.dataset.action;
  if(a==='new-game')resetGame();
  if(a==='continue'){const saved=loadState();if(saved){state=saved;showScreen('main');setScene(state.scene,false)}else showScreen('intro')}
  if(a==='how-to')modal(`<p class="eyebrow">HOW TO PLAY</p><h3>Investigate, don't just click.</h3><div class="inspect-box large">Move through the apartment and inspect objects.<br><br>Some interactions only become useful after another action has been completed.<br><br>Your notebook remembers collected evidence.<br><br>Collect at least 5 pieces of evidence to unlock the final deduction.</div>`);
  if(a==='enter-apartment'){showScreen('main');setScene('living',false)}
  if(a==='open-menu')openOverlay('#menuOverlay');
  if(a==='open-notebook'){openOverlay('#notebook');renderNotebook()}
  if(a==='close-overlay')closeOverlays();
  if(a==='back-scene')backScene();
  if(a==='final-deduction'){if(state.clues.length>=5)setScene('deduction');else toast('YOU NEED AT LEAST 5 PIECES OF EVIDENCE')}
  if(a==='return-world'){showScreen('main');setScene('living',false)}
  if(a==='submit-theory')submitTheory();
  if(a==='reset-game')resetGame();
  if(a==='title-screen'){closeOverlays();showScreen('title')}
  if(a==='review-evidence'){showScreen('main');openOverlay('#notebook')}
}));
$$('[data-hotspot]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();inspect(el.dataset.hotspot)}));
$$('input[name="field"]').forEach(cb=>cb.addEventListener('change',()=>{const checked=$$('input[name="field"]:checked');if(checked.length>2){cb.checked=false;toast('CHOOSE TWO FIELDS')}}));
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='n'&&screens.main.classList.contains('active'))openOverlay('#notebook');if(e.key==='Escape')closeOverlays()});
refreshUI();showScreen('title');
