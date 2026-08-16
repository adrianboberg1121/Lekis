(function(){
  let eventCatalog=[],placeCatalog=[],placeLiked=[],eventLiked=[];
  let currentMode='places',ready=false,initializing=false;
  const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
  const endDate=e=>{const d=new Date((e.endDate||e.startDate)+'T23:59:59');return d};
  const eventSort=(a,b)=>String(a.startDate||'').localeCompare(String(b.startDate||''));

  async function loadEvents(){
    if(eventCatalog.length)return eventCatalog;
    const data=await fetch('./events.json',{cache:'no-store'}).then(r=>r.json());
    eventCatalog=data.filter(e=>endDate(e)>=today()).sort(eventSort);
    return eventCatalog;
  }

  function capturePlaces(){
    if(placeCatalog.length||!window.LEKIS?.allPlaces?.length)return;
    placeCatalog=[...LEKIS.allPlaces];
    placeLiked=[...LEKIS.liked];
  }

  function setModeUI(mode){
    currentMode=mode;window.LEKIS_MODE=mode;
    document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    const quick=document.querySelector('.quickBar');
    const hint=document.querySelector('.hint');
    const savedTitle=document.querySelector('#savedSheet h2');
    const savedIntro=document.querySelector('#savedSheet .intro');
    const group=document.getElementById('duoBtn');
    if(mode==='events'){
      quick?.classList.add('eventHidden');
      if(hint)hint.textContent='Vänster = pass · höger = spara · tryck på kortet = mer info';
      if(savedTitle)savedTitle.textContent='Sparade event';
      if(savedIntro)savedIntro.textContent='Event du har swipat höger på.';
      if(group)group.title='Grupp för event kommer i nästa steg';
    }else{
      quick?.classList.remove('eventHidden');
      if(hint)hint.textContent='Vänster = pass · höger = spara · tryck på kortet = mer info · ☆ = favorit';
      if(savedTitle)savedTitle.textContent='Sparade ställen';
      if(savedIntro)savedIntro.textContent='Dina högerswipes. Stjärnmarkerade favoriter ligger överst.';
      if(group)group.title='';
    }
  }

  async function switchMode(mode){
    if(mode===currentMode)return;
    if(typeof groupRoom!=='undefined'&&groupRoom){alert('Lämna den aktiva gruppen innan du byter mellan Platser och Event.');return;}
    capturePlaces();
    if(mode==='events'){
      await loadEvents();
      placeLiked=[...liked];
      allPlaces=eventCatalog;
      places=[...eventCatalog];
      liked=[...eventLiked];
      activeFilter='all';activeArea='all';nearMeMode=false;index=0;isAnimating=false;
      setModeUI('events');
      render();
    }else{
      eventLiked=[...liked];
      allPlaces=placeCatalog;
      places=[...placeCatalog];
      liked=[...placeLiked];
      activeFilter='all';activeArea='all';index=0;isAnimating=false;
      setModeUI('places');
      populateAreas();
      rebuildPlaces();
    }
    window.dispatchEvent(new CustomEvent('lekis:modechange',{detail:{mode:currentMode}}));
  }

  async function init(){
    if(initializing||ready)return;initializing=true;
    try{
      capturePlaces();
      await loadEvents();
      const tabs=document.getElementById('modeSwitch');
      if(tabs){tabs.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));}
      ready=true;window.LEKIS_EVENT={get events(){return eventCatalog},switchMode,get mode(){return currentMode}};
    }catch(e){console.warn('Kunde inte ladda Lekis Event',e)}finally{initializing=false}
  }

  const baseFindPhoto=typeof findPhoto==='function'?findPhoto:null;
  if(baseFindPhoto){findPhoto=async p=>p?.kind==='event'?null:baseFindPhoto(p)}

  const baseOpenDetails=typeof openDetails==='function'?openDetails:null;
  if(baseOpenDetails){
    openDetails=async function(p){
      await baseOpenDetails(p);
      if(p?.kind!=='event')return;
      detailType.textContent=`EVENT · ${p.area}`;
      const rows=`<div class="detailRow eventWhen"><b>NÄR</b><span>${esc(p.dateLabel||'')} · ${esc(p.timeLabel||'')}</span></div><div class="detailRow"><b>PRIS</b><span>${esc(p.price||'Se arrangör')}</span></div><div class="detailRow"><b>PLATS</b><span>${esc(p.venue||p.area)}</span></div>`;
      detailRows.insertAdjacentHTML('afterbegin',rows);
      if(p.sourceUrl){const a=document.createElement('a');a.className='eventSource';a.href=p.sourceUrl;a.target='_blank';a.rel='noopener';a.textContent=`SE AKTUELL INFO HOS ${String(p.source||'ARRANGÖREN').toUpperCase()} →`;detailRows.appendChild(a)}
    }
  }

  window.addEventListener('lekis:swipe',e=>{
    if(currentMode==='events')eventLiked=[...liked];else placeLiked=[...liked];
  });
  window.addEventListener('lekis:catalog-expanded',()=>{capturePlaces();init()},{once:true});
  window.addEventListener('load',()=>setTimeout(init,900),{once:true});
})();
