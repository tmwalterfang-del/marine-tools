document.addEventListener('DOMContentLoaded',()=> {
  const page=new URLSearchParams(location.search).get('page');
  if(!page||page==='home')return;
  setTimeout(()=>{
    const btn=document.querySelector('.nav-btn[data-page="'+CSS.escape(page)+'"]');
    if(btn)btn.click();
  },80);
});
