// Places can belong to several useful browse categories at once.
(function(){
  function norm(s){return String(s||'').toLowerCase();}
  function searchable(p){
    return [p.type,p.name,p.summary,p.vibe,...(p.tags||[]),...(p.features||[])].map(norm).join(' ');
  }
  function matchesCategory(p,filter){
    if(filter==='all')return true;
    const text=searchable(p);
    if(filter==='parklek')return p.type==='parklek'||text.includes('parklek');
    if(filter==='lekpark')return p.type==='lekpark'||text.includes('lekpark')||text.includes('lekplats')||text.includes('temalek');
    if(filter==='djur')return p.type==='djur'||/(djur|4h|kanin|hön|häst|får|get|gård)/.test(text);
    if(filter==='vatten')return p.type==='vatten'||/(plask|vatten|splash|dusch)/.test(text);
    return p.type===filter;
  }

  const rebuilt=function(resetIndex=true){
    let next=allPlaces.filter(p=>matchesCategory(p,activeFilter));
    if(activeArea!=='all'&&!nearMeMode)next=next.filter(p=>p.area===activeArea);
    if(nearMeMode&&userLocation)next.sort((a,b)=>placeDistance(a)-placeDistance(b));
    if(favoritesFirst)next.sort((a,b)=>Number(isFav(b))-Number(isFav(a)));
    places=next;
    if(resetIndex)index=0;
    isAnimating=false;
    render();
    window.dispatchEvent(new CustomEvent('lekis:poolchange'));
  };

  rebuildPlaces=rebuilt;
  if(window.LEKIS)window.LEKIS.rebuildPlaces=rebuilt;
})();
