/* The Long Halls — connected mod menu. */
(function(){
 'use strict';
 if(window.TLHMods&&window.TLHMods.menuLoaded)return;
 const groups=[
  {id:'player',label:'Player',items:[
   {id:'speed',name:'Movement speed',desc:'Adjust your walking and sprinting speed.',type:'range',min:.25,max:5,step:.05,value:1,unit:'×',apply:v=>game()?.setPlayerSpeed(v)},
   {id:'stamina',name:'Infinite stamina',desc:'Keep sprint stamina full.',type:'toggle',value:false,apply:v=>game()?.setInfiniteStamina(v)},
   {id:'battery',name:'Infinite flashlight',desc:'Prevent flashlight battery drain.',type:'toggle',value:false,apply:v=>game()?.setInfiniteBattery(v)},
   {id:'noclip',name:'No clip',desc:'Move through walls and obstacles.',type:'toggle',value:false,apply:v=>game()?.setNoClip(v)},
   {id:'nodamage',name:'No damage',desc:'Prevent the local player from being caught.',type:'toggle',value:false,apply:v=>game()?.setNoDamage(v)},
   {id:'toMonster',name:'Teleport to monster',desc:'Move your player near the monster.',type:'button',apply:()=>game()?.teleportPlayerToMonster()},
   {id:'toExit',name:'Teleport to exit',desc:'Move to the exit door on the ground floor.',type:'button',apply:()=>game()?.teleportToExit()},
   {id:'toPlayer',name:'Teleport to player',desc:'Choose an alive player and move to their location.',type:'playerAction',actions:[{label:'TELEPORT ME',apply:pid=>game()?.teleportToPlayer(pid)}]}
  ]},
  {id:'world',label:'World',items:[
   {id:'unlockDoors',name:'Unlock all doors',desc:'Unlock every generated door on every floor.',type:'button',host:true,apply:()=>game()?.unlockAllDoors()},
   {id:'openDoors',name:'Open all doors',desc:'Open every generated door on every floor.',type:'button',host:true,apply:()=>game()?.openAllDoors()},
   {id:'openVents',name:'Open all vents',desc:'Open every vent cover on every floor and synchronize it to the party.',type:'button',host:true,apply:()=>game()?.openAllVents()},
   {id:'fuses',name:'Claim all fuses',desc:'Mark every fuse as collected in the shared game. Multiplayer use depends on the room database permissions.',type:'button',apply:()=>game()?.claimAllFuses()},
   {id:'bottles',name:'Give 10 bottles',desc:'Add ten throwable bottles to your inventory.',type:'button',host:true,apply:()=>game()?.giveItem('bottle',10)},
   {id:'batteries',name:'Give 10 batteries',desc:'Add ten spare flashlight batteries.',type:'button',host:true,apply:()=>game()?.giveItem('battery',10)},
   {id:'key',name:'Give brass key',desc:'Add the brass key to your inventory.',type:'button',host:true,apply:()=>game()?.giveItem('key',1)},
   {id:'screwdriver',name:'Give screwdriver',desc:'Add a screwdriver for vent covers.',type:'button',host:true,apply:()=>game()?.giveItem('screwdriver',1)}
  ]},
  {id:'host',label:'Host',items:[
   {id:'monsterSpeed',name:'Monster speed',desc:'Change the monster movement speed multiplier.',type:'range',min:.1,max:4,step:.05,value:1,unit:'×',host:true,apply:v=>game()?.setMonsterSpeed(v)},
   {id:'freeze',name:'Freeze monster',desc:'Stop monster AI movement while keeping multiplayer updates active.',type:'toggle',value:false,host:true,apply:v=>game()?.setMonsterFrozen(v)},
   {id:'teleportMonster',name:'Teleport monster to me',desc:'Move the authoritative monster near your player.',type:'button',host:true,apply:()=>game()?.teleportMonsterToPlayer()},
   {id:'monsterToPlayer',name:'Teleport monster to player',desc:'Choose an alive player and move the host-controlled monster near them.',type:'playerAction',host:true,actions:[{label:'TELEPORT MONSTER',apply:pid=>game()?.teleportMonsterToPlayer(pid)}]},
   {id:'patrol',name:'Force patrol',desc:'Set the monster back to patrol behavior.',type:'button',host:true,apply:()=>game()?.setMonsterState('patrol')},
   {id:'chase',name:'Force chase',desc:'Make the monster chase the host player.',type:'button',host:true,apply:()=>game()?.setMonsterState('chase')},
   {id:'investigate',name:'Force investigate',desc:'Send the monster to investigate your current position.',type:'button',host:true,apply:()=>game()?.setMonsterState('investigate')}
  ]},
  {id:'visuals',label:'Visuals',items:[
   {id:'fullbright',name:'Fullbright',desc:'Strong local ambient lighting and no fog; only you see this change.',type:'toggle',value:false,apply:v=>game()?.setFullbright(v)},
   {id:'esp',name:'Player ESP',desc:'Show labels for alive players through walls. Hidden players remain hidden.',type:'toggle',value:false,apply:v=>game()?.setPlayerESP(v)},
   {id:'fov',name:'Field of view',desc:'Adjust your local camera field of view.',type:'range',min:55,max:120,step:1,value:72,unit:'°',apply:v=>game()?.setFov(v)},
   {id:'brightness',name:'Brightness',desc:'Adjust local game brightness.',type:'range',min:50,max:300,step:5,value:100,unit:'%',apply:v=>game()?.setBrightness(v)}
  ]}
 ];
 const root=document.createElement('div');root.id='tlh-mod-root';
 root.innerHTML=`<section id="tlh-mod-panel" role="dialog" aria-label="Mod menu"><nav id="tlh-mod-side"><div id="tlh-mod-brand">THE LONG HALLS <span>//</span> CLIENT</div><div id="tlh-mod-tabs">${groups.map(g=>`<button class="tlh-mod-tab" data-tab="${g.id}">${g.label}</button>`).join('')}</div><div id="tlh-mod-status">Checking game…</div></nav><div id="tlh-mod-main"><header id="tlh-mod-top"><h2 id="tlh-mod-title">Player</h2><span id="tlh-mod-hint">RIGHT SHIFT · CLOSE</span></header><input id="tlh-mod-search" type="search" placeholder="Search modifications…" autocomplete="off"><div id="tlh-mod-content"></div><footer id="tlh-mod-footer">CLIENT-SIDE OPTIONS · HOST CONTROLS REQUIRE HOST</footer></div></section>`;
 document.body.appendChild(root);
 const $=sel=>root.querySelector(sel),content=$('#tlh-mod-content'),search=$('#tlh-mod-search');let active='player',drag=null;
 function game(){return window.TLHGame||null}
 function isHost(){return !!game()&&game().host}
 function render(){const group=groups.find(g=>g.id===active)||groups[0];$('#tlh-mod-title').textContent=group.label;root.querySelectorAll('.tlh-mod-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===active));$('#tlh-mod-status').textContent=game()?(game().multiplayer?(isHost()?'MULTIPLAYER · HOST':'MULTIPLAYER · GUEST'):'SINGLE PLAYER'):'GAME API NOT READY';const q=search.value.trim().toLowerCase();const items=group.items.filter(i=>(i.name+' '+i.desc).toLowerCase().includes(q));content.innerHTML=items.length?'':'<div class="tlh-mod-empty">No matching modifications.</div>';
  items.forEach(item=>{const locked=item.host&&!isHost(),card=document.createElement('article');card.className='tlh-mod-item'+(locked?' locked':'');const top=document.createElement('div');top.className='tlh-mod-item-top';const text=document.createElement('div');text.className='tlh-mod-item-text';text.innerHTML=`<strong>${item.name}</strong><small>${item.desc}</small>`;top.appendChild(text);const control=document.createElement('div');control.className='tlh-mod-control';
   if(item.type==='toggle'){const b=document.createElement('button');b.className='tlh-mod-switch'+(item.value?' on':'');b.type='button';b.setAttribute('aria-label',item.name);b.disabled=locked;b.innerHTML='<i></i>';b.onclick=()=>{item.value=!item.value;item.apply(item.value);render()};control.appendChild(b)}
   if(item.type==='button'){const b=document.createElement('button');b.className='tlh-mod-action';b.textContent=locked?'HOST ONLY':'RUN';b.disabled=locked;b.onclick=()=>{const ok=item.apply();if(ok===false){status('Action unavailable right now.')}else{status(item.name+' executed.')}};control.appendChild(b)}
   if(item.type==='range'){const wrap=document.createElement('label');wrap.className='tlh-mod-range';const val=document.createElement('output');val.textContent=Number(item.value).toFixed(item.step<1?2:0)+item.unit;const input=document.createElement('input');input.type='range';input.min=item.min;input.max=item.max;input.step=item.step;input.value=item.value;input.disabled=locked;input.oninput=()=>{item.value=+input.value;val.textContent=Number(item.value).toFixed(item.step<1?2:0)+item.unit;item.apply(item.value)};wrap.append(input,val);control.appendChild(wrap)}
   if(item.type==='playerAction'){const sel=document.createElement('select');sel.className='tlh-mod-player-select';const players=game()?.getPlayers?.()||[];if(!players.length){const o=document.createElement('option');o.value='';o.textContent='No available players';sel.appendChild(o)}else players.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o)});sel.disabled=locked||!players.length;control.appendChild(sel);item.actions.forEach(action=>{const b=document.createElement('button');b.className='tlh-mod-action';b.textContent=locked?'HOST ONLY':action.label;b.disabled=locked||!players.length;b.onclick=()=>{const ok=action.apply(sel.value);status(ok===false?'Action unavailable right now.':action.label+' executed.')};control.appendChild(b)})}
   top.appendChild(control);card.appendChild(top);if(locked){const badge=document.createElement('span');badge.className='tlh-mod-lock';badge.textContent='HOST ONLY';card.appendChild(badge)}content.appendChild(card);
  });
 }
 function status(msg){$('#tlh-mod-footer').textContent=msg;setTimeout(()=>{if(root.classList.contains('tlh-open'))$('#tlh-mod-footer').textContent='CLIENT-SIDE OPTIONS · HOST CONTROLS REQUIRE HOST'},1800)}
 root.querySelectorAll('.tlh-mod-tab').forEach(b=>b.onclick=()=>{active=b.dataset.tab;render()});search.oninput=render;
 function typing(t){return t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))}
 function setOpen(v){const was=root.classList.contains('tlh-open');root.classList.toggle('tlh-open',!!v);if(v){search.value='';render();if(document.pointerLockElement)document.exitPointerLock()}else if(was)window.dispatchEvent(new CustomEvent('tlh-mod-menu-change',{detail:{open:false}}))}
 window.addEventListener('keydown',e=>{if(e.code==='ShiftRight'&&!e.repeat&&!typing(e.target)){e.preventDefault();setOpen(!root.classList.contains('tlh-open'))}},true);
 window.addEventListener('tlh-game-api-ready',render);window.addEventListener('focus',()=>{if(root.classList.contains('tlh-open'))render()});
 window.TLHMods={menuLoaded:true,isOpen:()=>root.classList.contains('tlh-open'),open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(!root.classList.contains('tlh-open'))};render();console.info('[TLH Modded Client] Gameplay mods connected. Press Right Shift.');
})();
