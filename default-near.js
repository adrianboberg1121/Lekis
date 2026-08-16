(function(){
  let requested=false;
  function applyWhenReady(){
    if(requested)return;
    const near=document.getElementById('nearMeBtn');
    const apply=document.getElementById('applyBrowse');
    const label=document.getElementById('browseLabel');
    if(!near||!apply||!label)return;
    requested=true;
    near.click();
    const started=Date.now();
    const t=setInterval(()=>{
      if(label.textContent.trim()==='Nära mig'){
        clearInterval(t);
        apply.click();
      }else if(Date.now()-started>10000){
        clearInterval(t);
      }
    },120);
  }

  const start=document.getElementById('startBtn');
  if(start){
    start.addEventListener('click',()=>setTimeout(applyWhenReady,80),{once:true});
  }

  if(localStorage.getItem('lekisOnboarded')){
    window.addEventListener('load',()=>setTimeout(applyWhenReady,250),{once:true});
  }
})();
