(() => {
'use strict';

const $=(s,r=document)=>r.querySelector(s);

function injectStyles(){
  if($('#mtUiEnhancements853Styles')) return;
  const style=document.createElement('style');
  style.id='mtUiEnhancements853Styles';
  style.textContent=`
    #weather #wxSummary .weather-metric:nth-child(3){display:none!important}
    #weather .weather-forecast-table th:nth-child(4),
    #weather .weather-forecast-table td:nth-child(4){display:none!important}
    #weather label:has(.ww-current),
    #weather label:has(#wwCur){display:none!important}
  `;
  document.head.appendChild(style);
}

function beaufortFromKn(k){
  const rows=[
    [1,'Light air','1–3'],[4,'Light breeze','4–6'],[7,'Gentle breeze','7–10'],[11,'Moderate breeze','11–16'],
    [17,'Fresh breeze','17–21'],[22,'Strong breeze','22–27'],[28,'Near gale','28–33'],[34,'Gale','34–40'],
    [41,'Strong gale','41–47'],[48,'Storm','48–55'],[56,'Violent storm','56–63'],[64,'Hurricane','64+']
  ];
  if(k<1)return{force:0,desc:'Calm',range:'<1'};
  for(let i=0;i<rows.length;i++){
    const next=rows[i+1]?.[0]??Infinity;
    if(k<next)return{force:i+1,desc:rows[i][1],range:rows[i][2]};
  }
  return{force:12,desc:'Hurricane',range:'64+'};
}

function format(n,d=1){return Number(n).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:0})}

function patchBeaufort(){
  const input=$('#bfKn');
  const button=$('#calcBf');
  if(!input||!button||$('#bfUnit')) return false;

  const label=input.closest('label');
  if(label){
    label.firstChild.textContent='Wind speed ';
    const select=document.createElement('select');
    select.id='bfUnit';
    select.setAttribute('aria-label','Wind speed unit');
    select.innerHTML='<option value="kn">kn</option><option value="ms">m/s</option>';
    label.insertBefore(select,input);
  }

  button.onclick=()=>{
    const raw=Number(input.value);
    const unit=$('#bfUnit')?.value||'kn';
    const result=$('#resBf');
    if(!result) return;
    if(!Number.isFinite(raw)||raw<0){
      result.className='result caution';
      result.innerHTML='<strong>Check wind speed.</strong><small>Wind speed cannot be negative.</small>';
      return;
    }
    const kn=unit==='ms'?raw*1.943844:raw;
    const b=beaufortFromKn(kn);
    const shown=unit==='ms'?`${format(raw,1)} m/s`:`${format(raw,1)} kn`;
    const alt=unit==='ms'?`${format(kn,1)} kn`:`${format(kn/1.943844,1)} m/s`;
    result.className='result';
    result.innerHTML=`<strong>Beaufort ${b.force} · ${b.desc}</strong><small>${shown} · ${alt} · Beaufort range ${b.range} kn.</small>`;
  };
  return true;
}

function patchWeather(){
  if(!$('#weather')) return false;
  injectStyles();
  const currentLabel=$('#weather #wwCur')?.closest('label');
  if(currentLabel) currentLabel.hidden=true;
  document.querySelectorAll('#weather .ww-current').forEach(x=>{const l=x.closest('label');if(l)l.hidden=true});
  return Boolean($('#loadPointWx'));
}

function afterOpen(page,fn,attempt=0){
  if(fn()) return;
  if(attempt<5) setTimeout(()=>afterOpen(page,fn,attempt+1),50*(attempt+1));
}

document.addEventListener('click',e=>{
  const quick=e.target.closest('[data-page="quick"],[data-go="quick"]');
  if(quick)setTimeout(()=>afterOpen('quick',patchBeaufort),40);
  const weather=e.target.closest('[data-page="weather"],[data-go="weather"]');
  if(weather)setTimeout(()=>afterOpen('weather',patchWeather),40);
});

document.addEventListener('DOMContentLoaded',injectStyles);
window.addEventListener('pageshow',()=>{
  if($('#quick')?.classList.contains('active'))afterOpen('quick',patchBeaufort);
  if($('#weather')?.classList.contains('active'))afterOpen('weather',patchWeather);
});
})();
