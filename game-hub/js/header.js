// Шапка: прячется при скролле вниз, показывается вверх
var hdr=document.querySelector('.hdr'),totop=document.getElementById('totop'),lastY=0;
addEventListener('scroll',function(){
  var y=scrollY; hdr.classList.toggle('scrolled',y>20);
  hdr.classList.toggle('hide',y>lastY&&y>200&&!document.getElementById('nav').classList.contains('open'));
  totop.classList.toggle('show',y>600); lastY=y;
},{passive:true});
totop.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
document.getElementById('burger').onclick=function(){document.getElementById('nav').classList.toggle('open')};
