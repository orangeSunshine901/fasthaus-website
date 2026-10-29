import { LAMPS, ROUND_COUNT, INTRO_DIALOGUE, createGame, enterStudio, advanceIntro, chooseLamp, revealHint, advanceGame } from './game.mjs';
import { createTypewriter } from './typewriter.mjs';

const $ = id => document.getElementById(id);
const arrowMark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const scene = $('scene');
const ctx = scene.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 480px)');
let state = createGame();
let hovered = null;
let soundOn = false;
let audio;
let animationFrame = 0;
let glowStart = null;
let lastFound = null;
let speechKey = null;
let speechParts = [];
const speechTyper = createTypewriter((count, complete) => {
  let offset = 0;
  for (const part of speechParts) {
    const visible = Math.max(0, Math.min(part.characters.length, count - offset));
    part.typed.textContent = part.characters.slice(0, visible).join('');
    part.pending.textContent = part.characters.slice(visible).join('');
    offset += part.characters.length + 1;
  }
  $('skip-speech').style.visibility = complete ? 'hidden' : 'visible';
  $('skip-speech').disabled = complete;
  $('dialogue').classList.toggle('is-speaking', !complete);
});

function say(title, detail) {
  const key = title + '\n' + detail;
  if (key === speechKey) return;
  speechKey = key;
  speechParts = [title, detail].map((text, index) => {
    const accessible = document.createElement('span');
    accessible.className = 'sr-only'; accessible.textContent = text;
    const visual = document.createElement('span'); visual.setAttribute('aria-hidden', 'true');
    const typed = document.createElement('span'), pending = document.createElement('span');
    pending.className = 'speech-pending'; visual.append(typed, pending);
    $(index === 0 ? 'dialogue-title' : 'dialogue-copy').replaceChildren(accessible, visual);
    return { typed, pending, characters: Array.from(text) };
  });
  speechTyper.play(key, reducedMotion.matches);
}

const glyphs = {
  A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'], D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
  G:['01111','10000','10000','10111','10001','10001','01110'], H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['111','010','010','010','010','010','111'], J:['00111','00010','00010','00010','10010','10010','01100'],
  K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'],
  W:['10001','10001','10001','10101','10101','10101','01010'], X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'],
  '0':['0110','1001','1011','1001','1001','1001','0110'], '1':['010','110','010','010','010','010','111'],
  '2':['1110','0001','0001','0110','1000','1000','1111'], '3':['1110','0001','0001','0110','0001','0001','1110'],
  '4':['1001','1001','1001','1111','0001','0001','0001'], '?':['1110','0001','0010','0100','0100','0000','0100'],
};

function rect(c,x,y,w,h,color) { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function pixelText(c,text,x,y,color,scale=1) {
  for(const char of text.toUpperCase()) {
    if(char===' '){x+=4*scale;continue;}
    const glyph=glyphs[char]; if(!glyph){x+=4*scale;continue;}
    glyph.forEach((line,row)=>[...line].forEach((p,col)=>{if(p==='1')rect(c,x+col*scale,y+row*scale,scale,scale,color);}));
    x+=(glyph[0].length+1)*scale;
  }
}
function oval(c,x,y,rx,ry,color) {
  for(let row=-ry;row<=ry;row++) {
    const half=Math.floor(rx*Math.sqrt(Math.max(0,1-(row/ry)**2)));
    rect(c,x-half,y+row,half*2+1,1,color);
  }
}
function polygon(c,points,color) {
  const min=Math.ceil(Math.min(...points.map(p=>p[1]))), max=Math.floor(Math.max(...points.map(p=>p[1])));
  for(let y=min;y<=max;y++) {
    const xs=[];
    points.forEach((p,i)=>{const q=points[(i+1)%points.length];if((p[1]<=y&&q[1]>y)||(q[1]<=y&&p[1]>y))xs.push(p[0]+(y-p[1])*(q[0]-p[0])/(q[1]-p[1]));});
    xs.sort((a,b)=>a-b);
    for(let i=0;i<xs.length-1;i+=2)rect(c,Math.ceil(xs[i]),y,Math.floor(xs[i+1])-Math.ceil(xs[i])+1,1,color);
  }
}

function drawLamp(c,id,x,y,lit) {
  c.save();c.translate(x,y);
  const shade=lit?'#ffe8b7':'#cbd0c4', shadow=lit?'#d8b77d':'#9fa99f', light=lit?'#fff3ce':'#e0e1d5';
  oval(c,0,2,30,3,'#252e31');
  if(id==='hamrah') {
    rect(c,-13,-25,26,25,'#ab3935');rect(c,-9,-25,7,25,'#c54e43');rect(c,9,-24,4,24,'#81322f');oval(c,0,-1,12,2,'#a23833');
    polygon(c,[[-17,-66],[17,-66],[27,-55],[32,-42],[30,-30],[26,-25],[-26,-25],[-31,-35],[-32,-43],[-27,-55]],shade);
    polygon(c,[[14,-64],[24,-54],[29,-42],[27,-29],[18,-27],[22,-41],[17,-53]],shadow);
    for(let dx=-24;dx<23;dx+=4)rect(c,dx,-51+Math.round(Math.abs(dx)/4),1,19,light);
    rect(c,-17,-65,34,2,light);rect(c,-23,-28,44,2,shadow);
  } else if(id==='nujaj') {
    polygon(c,[[-14,-27],[14,-27],[15,-7],[10,0],[-10,0],[-15,-7]],'#919f55');
    for(let dx=-11;dx<12;dx+=3)rect(c,dx,-24,1,20,dx<0?'#b0b66e':'#788842');
    polygon(c,[[-11,-68],[11,-68],[37,-28],[-37,-28]],shade);
    for(let i=-10;i<=10;i+=2){const ex=i*3.4;polygon(c,[[i,-66],[i+1,-66],[ex+1,-30],[ex,-30]],i<1?light:shadow);}
    rect(c,-36,-29,72,2,light);rect(c,-11,-68,22,2,shadow);
  } else if(id==='kasane') {
    polygon(c,[[-10,-32],[10,-32],[16,-22],[17,-12],[13,-1],[-13,-1],[-17,-12],[-16,-22]],'#cb7638');
    for(let dx=-12;dx<14;dx+=3)rect(c,dx,-24,1,20,dx<0?'#e49748':'#ab5f2d');
    const pts=[[-11,-71],[11,-71],[20,-61],[28,-49],[39,-32],[35,-28],[29,-29],[25,-26],[17,-28],[10,-26],[2,-28],[-5,-26],[-12,-28],[-20,-26],[-27,-28],[-35,-27],[-39,-32],[-28,-49],[-20,-61]];
    polygon(c,pts,shade);
    for(let i=-10;i<=10;i+=2){const ex=i*3.3;polygon(c,[[i,-68],[i+1,-68],[ex+1,-31],[ex,-31]],i<2?light:shadow);}
    rect(c,-10,-71,20,2,light);
  } else {
    rect(c,-12,-27,24,27,'#3d58a3');rect(c,-9,-27,6,27,'#536eb6');rect(c,8,-27,4,27,'#2f467e');oval(c,0,0,11,2,'#3e5796');
    for(let layer=0;layer<3;layer++) {
      const top=-68+layer*14;
      polygon(c,[[-22,top],[22,top],[27,top+4],[28,top+9],[24,top+14],[-24,top+14],[-28,top+9],[-27,top+4]],shade);
      rect(c,-21,top,42,2,light);rect(c,-23,top+12,47,2,shadow);rect(c,24,top+4,3,6,shadow);
    }
  }
  c.restore();
}

function layout() {
  const mobile=mobileQuery.matches;
  return mobile?{w:320,h:246,floor:208,positions:[[174,98],[267,98],[174,184],[267,184]],shelfLeft:128,shelfRight:307}:
    {w:480,h:204,floor:175,positions:[[252,86],[386,86],[252,162],[386,162]],shelfLeft:196,shelfRight:447};
}

function drawScene(now=performance.now()) {
  const l=layout(), warmth=state.found.length;
  if(scene.width!==l.w||scene.height!==l.h){scene.width=l.w;scene.height=l.h;}
  ctx.imageSmoothingEnabled=false;
  rect(ctx,0,0,l.w,l.h,'#2b353b');rect(ctx,0,0,9,l.floor,'#222c32');rect(ctx,l.w-9,0,9,l.floor,'#263036');
  rect(ctx,9,0,l.w-18,7,'#343e43');rect(ctx,9,7,l.w-18,2,'#42494a');
  rect(ctx,9,l.floor,l.w-18,l.h-l.floor,'#343b3b');rect(ctx,9,l.floor-2,l.w-18,2,'#1f292e');rect(ctx,9,l.floor+2,l.w-18,1,'#4a4d44');
  for(let y=l.floor+17;y<l.h;y+=15)rect(ctx,9,y,l.w-18,1,'#2e3637');
  for(let x=27;x<l.w;x+=63)rect(ctx,x,l.floor+4,1,11,'#303737');
  rect(ctx,15,17,1,l.floor-18,'#47504d');rect(ctx,16,17,5,2,'#47504d');

  const wx=l.w===320?33:46, wy=24, ww=l.w===320?66:103, wh=l.w===320?91:82;
  rect(ctx,wx-4,wy-4,ww+8,wh+8,'#20292f');rect(ctx,wx,wy,ww,wh,'#192c3a');
  rect(ctx,wx+3,wy+3,ww-6,wh-6,'#213749');
  const stars=[[9,13],[42,10],[23,39],[52,45],[16,60],[38,71],[60,23]];
  stars.forEach(([x,y])=>{if(x<ww-6&&y<wh-6)rect(ctx,wx+x,wy+y,1,1,'#a8b5a8');});
  oval(ctx,wx+ww-20,wy+18,8,8,'#ddd3ad');oval(ctx,wx+ww-17,wy+15,7,8,'#213749');
  for(let i=0;i<ww-9;i+=9){const h=[9,14,7,18,11,21,9,13,6,16][Math.floor(i/9)%10];rect(ctx,wx+4+i,wy+wh-h,7,h,'#182b36');}
  rect(ctx,wx+ww/2,wy,3,wh,'#49524d');rect(ctx,wx,wy+wh*.55,ww,3,'#49524d');rect(ctx,wx-7,wy+wh,ww+14,4,'#696c59');rect(ctx,wx-5,wy+wh+4,ww+10,2,'#3c443e');

  if(l.w===480){
    rect(ctx,164,28,1,43,'#878777');rect(ctx,153,41,23,32,'#b1ac8c');rect(ctx,156,44,17,26,'#d1ccb0');
    rect(ctx,158,49,10,1,'#7a826b');rect(ctx,158,52,10,1,'#7a826b');rect(ctx,159,58,7,6,'#929c7e');rect(ctx,157,65,12,1,'#9c9f81');
  }
  const tableY=l.floor-16;
  rect(ctx,27,tableY,57,4,'#85846a');rect(ctx,29,tableY+4,53,3,'#4d584b');rect(ctx,31,tableY+7,4,18,'#3e4b44');rect(ctx,76,tableY+7,4,18,'#3e4b44');
  rect(ctx,38,tableY-4,28,4,'#b9b69c');rect(ctx,42,tableY-6,22,2,'#d0ccb3');rect(ctx,46,tableY-5,13,1,'#979b83');
  rect(ctx,28,tableY-18,6,18,'#7a8066');rect(ctx,26,tableY-19,10,2,'#a4a689');rect(ctx,29,tableY-27,2,9,'#b18b5b');rect(ctx,32,tableY-30,1,12,'#aaba92');
  const bx=l.w===320?88:160;
  rect(ctx,bx,l.floor-14,20,14,'#72765b');rect(ctx,bx+1,l.floor-13,18,2,'#929073');rect(ctx,bx+9,l.floor-14,3,13,'#aeaa88');rect(ctx,bx+3,l.floor-8,3,2,'#434f42');

  for(const [,y] of [l.positions[0],l.positions[2]]){
    rect(ctx,l.shelfLeft,y+3,l.shelfRight-l.shelfLeft,5,'#727a66');rect(ctx,l.shelfLeft,y+3,l.shelfRight-l.shelfLeft,1,'#a8a88a');
    rect(ctx,l.shelfLeft+2,y+8,l.shelfRight-l.shelfLeft-4,3,'#202b2f');
    [l.shelfLeft+16,l.shelfRight-19].forEach(x=>{rect(ctx,x,y+9,3,10,'#525d51');rect(ctx,x-4,y+9,7,2,'#79816b');});
  }
  LAMPS.forEach((lamp,i)=>{
    const [x,y]=l.positions[i], lit=state.found.includes(lamp.id);
    if(lit){
      let intensity=lastFound===lamp.id&&glowStart!==null?Math.min(1,(now-glowStart)/650):1;
      if(reducedMotion.matches)intensity=1;
      for(let ring=6;ring>0;ring--){ctx.globalAlpha=(.009+warmth*.003)*intensity;rect(ctx,x-31-ring*5,y-70-ring*4,62+ring*10,54+ring*8,'#f7c87a');}
      ctx.globalAlpha=1;
    }
    drawLamp(ctx,lamp.id,x,y,lit);
    pixelText(ctx,`0${i+1}`,x-39,y-9,lit?'#e8cd98':'#b0b59b');
    if(hovered===lamp.id&&state.phase==='guess'&&!lit){rect(ctx,x-4,y-79,9,1,'#e9be7d');rect(ctx,x-2,y-78,5,2,'#e9be7d');rect(ctx,x,y-76,1,2,'#e9be7d');}
  });
  if(warmth){ctx.globalAlpha=warmth*.014;rect(ctx,9,9,l.w-18,l.h-9,'#f2c178');ctx.globalAlpha=1;}
}

function animate(now) {
  drawScene(now);
  const glowing=glowStart!==null&&now-glowStart<650;
  if(!reducedMotion.matches&&!document.hidden&&glowing)animationFrame=requestAnimationFrame(animate);
  else animationFrame=0;
}
function requestDraw(animateChanges=false){
  drawScene();
  if(animateChanges&&!reducedMotion.matches&&!animationFrame)animationFrame=requestAnimationFrame(animate);
}

const targets=LAMPS.map((lamp,i)=>{
  const button=document.createElement('button');button.className='lamp-target';button.type='button';
  button.setAttribute('aria-label',`Choose lamp ${i+1}: ${lamp.description}`);button.setAttribute('data-lamp',lamp.id);
  const label=document.createElement('span');label.className='lamp-label';label.setAttribute('aria-hidden','true');label.textContent=`Choose lamp 0${i+1}`;button.append(label);
  const highlight=()=>{hovered=lamp.id;requestDraw();};const clear=()=>{hovered=null;requestDraw();};
  button.addEventListener('pointerenter',highlight);button.addEventListener('pointerleave',clear);button.addEventListener('focus',highlight);button.addEventListener('blur',clear);
  button.addEventListener('click',()=>{
    const next=chooseLamp(state,lamp.id);if(next===state)return;
    const correct=next.phase==='reveal';state=next;
    if(correct){lastFound=lamp.id;glowStart=performance.now();chime();emit('discovery',{lamp:lamp.id,found:state.found.length});}
    update();requestDraw(correct);
    if(correct)$('main-action').focus({preventScroll:true});
  });
  $('lamp-targets').append(button);return button;
});

function emit(action,detail={}) {
  document.dispatchEvent(new CustomEvent(`fasthaus:${action}`,{detail:{...detail,prototype:true}}));
}
function chime() {
  if(!soundOn)return;
  try{
    audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
    [523.25,659.25,783.99].forEach((frequency,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.09;oscillator.type='square';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.025,t);gain.gain.exponentialRampToValueAtTime(.001,t+.12);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(t);oscillator.stop(t+.13);});
  }catch{soundOn=false;updateSound();$('feedback').textContent='Sound is unavailable in this browser. You can keep playing.';}
}
function updateSound(){
  $('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent=soundOn?'Sound on':'Sound off';
  $('sound').querySelector('path').setAttribute('d',soundOn?'m11 4-5 4H3v8h3l5 4V4Zm5 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14':'m11 4-5 4H3v8h3l5 4V4Zm5 5 5 6m0-6-5 6');
}

function positionTargets(){
  const l=layout();targets.forEach((button,i)=>{
    const [x,y]=l.positions[i];button.style.left=`${(x-41)/l.w*100}%`;button.style.top=`${(y-76)/l.h*100}%`;button.style.width=`${82/l.w*100}%`;button.style.height=`${78/l.h*100}%`;
  });
  requestDraw();
}

function update(){
  const lamp=LAMPS.find(lamp=>lamp.id===state.rounds[state.round]), welcome=state.phase==='start',intro=state.phase==='intro',guess=state.phase==='guess',reveal=state.phase==='reveal',complete=state.phase==='complete';
  $('start-overlay').hidden=!welcome;$('game-content').inert=welcome;
  $('progress-count').textContent=`${state.found.length} / ${ROUND_COUNT} lit`;
  document.querySelector('.progress').setAttribute('aria-label',`${state.found.length} of ${ROUND_COUNT} lamps lit`);
  $('progress-lights').replaceChildren(...state.rounds.map(id=>{const pip=document.createElement('span');pip.className=`progress-pip${state.found.includes(id)?' lit':''}`;return pip;}));
  targets.forEach((button,i)=>{button.disabled=!guess||state.found.includes(LAMPS[i].id);});
  $('dialogue').hidden=complete||welcome;$('dialogue').classList.toggle('is-intro',intro);$('reward').hidden=!complete;$('restart').hidden=welcome||(intro&&state.introStep===0)||complete;
  $('player-label').hidden=!intro;
  $('main-action').hidden=guess;$('hint-action').hidden=!guess;
  $('hint-action').disabled=state.hints===3;$('hint-count').textContent=`${state.hints} / 3`;
  $('hint-text').hidden=!guess||state.hints===0;
  $('hint-text').textContent=state.hints?lamp.hints[state.hints-1]:'';
  $('feedback').textContent=state.wrong?'That one has a different story. Try another lamp, or ask for a clue.':'';
  $('room-instruction').textContent=intro?'A little conversation before the lights come on.':complete?'The studio looks better with you in it.':reveal?'A bright idea, found.':'Which lamp am I describing?';
  $('play-tip').lastChild.textContent=intro?' Choose your reply to continue':complete?' All three stories discovered':' Click or tap to choose a lamp';
  $('round-label').textContent=intro?INTRO_DIALOGUE[state.introStep].label:`Story ${state.round+1} of ${ROUND_COUNT}`;
  $('action-note').hidden=complete||intro;
  if(intro){
    const speech=INTRO_DIALOGUE[state.introStep];
    say(speech.line,speech.detail);
    $('main-action').replaceChildren(document.createTextNode(speech.reply+' '));
    $('main-action').insertAdjacentHTML('beforeend',arrowMark);
    $('action-note').textContent=`${state.introStep+1} / ${INTRO_DIALOGUE.length}`;
  } else if(guess){
    say(lamp.clue,'Choose the lamp on the shelf. Follow your eye.');
    $('action-note').textContent='Hints are on the house.';
  } else if(reveal){
    say(`That’s ${lamp.name}.`,lamp.story);
    $('main-action').innerHTML=(state.found.length===ROUND_COUNT?'Open my reward ':'Next story ')+arrowMark;
    $('action-note').textContent=state.found.length===ROUND_COUNT?'Three for three. Nicely spotted.':`${ROUND_COUNT-state.found.length} more ${state.found.length===ROUND_COUNT-1?'story':'stories'} to discover.`;
  }
  if(complete||welcome)speechTyper.finish();
  if(welcome)speechKey=null;
  requestDraw();
}

$('enter-studio').addEventListener('click',()=>{
  state=enterStudio(state);update();
  $('main-action').focus({preventScroll:true});
  $('dialogue').scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});
});
$('main-action').addEventListener('click',()=>{
  if(state.phase==='intro'){
    state=advanceIntro(state);update();
    if(state.phase==='guess'){emit('start');targets[0].focus({preventScroll:true});}
    else $('main-action').focus({preventScroll:true});
  }else if(state.phase==='reveal'){
    state=advanceGame(state);update();
    if(state.phase==='complete'){
      emit('complete',{lamps:[...state.found],attempts:state.attempts});
      $('reward-title').focus({preventScroll:true});$('reward').scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});
    }else targets.find(b=>!b.disabled)?.focus({preventScroll:true});
  }
});
$('hint-action').addEventListener('click',()=>{state=revealHint(state);update();emit('hint',{lamp:state.rounds[state.round],hint:state.hints});});
$('dialogue').querySelector('.dialogue-body').addEventListener('click',()=>speechTyper.finish());
$('skip-speech').addEventListener('click',event=>{
  event.stopPropagation();speechTyper.finish();
  if(state.phase==='guess')targets.find(button=>!button.disabled)?.focus({preventScroll:true});
  else $('main-action').focus({preventScroll:true});
});
function restart(){state=createGame();glowStart=null;lastFound=null;hovered=null;update();requestDraw(true);$('enter-studio').focus();$('copy-status').textContent='Demo code — not active at checkout yet.';$('copy-code').textContent='Copy code';emit('restart');}
$('restart').addEventListener('click',restart);$('replay').addEventListener('click',restart);
$('sound').addEventListener('click',()=>{soundOn=!soundOn;updateSound();if(soundOn)chime();});
$('copy-code').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('coupon-code').textContent);$('copy-code').textContent='Copied';$('copy-status').textContent='Copied. This demo code is not active at checkout yet.';}
  catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('coupon-code'));selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='Select and copy AFTERHOURS10. It is a demo code, not active at checkout.';}
});
LAMPS.forEach(lamp=>{
  const link=document.createElement('a');link.className='product-link';link.href=lamp.url;link.target='_blank';link.rel='noopener';
  const img=document.createElement('img');img.src=`./assets/${lamp.id}.avif`;img.alt=`${lamp.name} table lamp`;img.width=300;img.height=300;img.loading='lazy';
  const name=document.createElement('strong');name.textContent=lamp.name;const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('aria-hidden','true');const arrowPath=document.createElementNS('http://www.w3.org/2000/svg','path');arrowPath.setAttribute('d','M6 18 18 6M6 6h12v12');arrow.append(arrowPath);name.append(arrow);
  const note=document.createElement('p');note.textContent=lamp.note;link.append(img,name,note);$('collection').append(link);
});
mobileQuery.addEventListener('change',positionTargets);reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)speechTyper.finish();requestDraw();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)speechTyper.finish();if(document.hidden&&animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}else if(!document.hidden)requestDraw();});
positionTargets();update();requestDraw(true);
