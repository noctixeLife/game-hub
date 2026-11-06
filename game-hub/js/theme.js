// Смена темы: ночь / день. Выбор запоминается в браузере.
(function(){
  var btn=document.getElementById('theme'),root=document.documentElement;
  function apply(t){
    root.setAttribute('data-theme',t);
    btn.setAttribute('aria-label',t==='light'?'Включить ночной режим':'Включить светлый режим');
    btn.title=t==='light'?'Ночной режим':'Светлый режим';
  }
  apply(root.getAttribute('data-theme')==='light'?'light':'dark');
  btn.onclick=function(){
    var t=root.getAttribute('data-theme')==='light'?'dark':'light';
    apply(t);
    try{localStorage.setItem('theme',t)}catch(e){}
  };
})();
