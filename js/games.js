function card(i,rank,badge,seed){
  return '<a class="card" href="#"><div class="thumb">'
   +(rank?'<span class="rank'+(rank<4?' r'+rank:'')+'">'+rank+'</span>':'')
   +(badge?'<span class="badge">NEW</span>':'')+'Обложка</div><div class="info"><h3>'+names[(i+seed)%names.length]+' '+(seed+i+1)+'</h3>'
   +'<div class="meta"><span>⬇ '+(9800-((i*317+seed*53)%9000))+'</span><span class="h">❤ '+(1200-((i*58+seed*17)%1100))+'</span></div></div></a>';
}
function fill(id,n,ranked,seed,anim){
  var h="",i; for(i=0;i<n;i++) h+=card(i,ranked?i+1:0,!ranked&&i%5===0,seed);
  var el=document.getElementById(id); el.innerHTML=h;
  if(anim){var c=el.children; for(i=0;i<c.length;i++){c[i].classList.add('pop');c[i].style.animationDelay=(i*35)+'ms'}}
  tilt(el);
}
function tilt(root){
  if(matchMedia('(hover:none)').matches) return;
  [].forEach.call(root.querySelectorAll('.card'),function(c){
    c.addEventListener('mousemove',function(e){
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
      c.style.transform='translateY(-6px) perspective(700px) rotateY('+((x-.5)*8)+'deg) rotateX('+((.5-y)*8)+'deg)';
    });
    c.addEventListener('mouseleave',function(){c.style.transform=''});
  });
}
function renderPager(){
  var p=document.getElementById('pager'),h='',list=[],i;
  function add(n){list.push(n)}
  add(1); if(page>3) add('…');
  for(i=Math.max(2,page-1);i<=Math.min(TOTAL-1,page+1);i++) add(i);
  if(page<TOTAL-2) add('…'); add(TOTAL);
  h+='<a data-p="'+(page-1)+'" class="'+(page===1?'dis':'')+'">‹</a>';
  list.forEach(function(n){h+= n==='…'?'<a class="dots">…</a>':'<a data-p="'+n+'" class="'+(n===page?'on':'')+'">'+n+'</a>'});
  h+='<a data-p="'+(page+1)+'" class="'+(page===TOTAL?'dis':'')+'">›</a>';
  p.innerHTML=h;
  document.getElementById('pinfo').textContent='(827 игр · страница '+page+' из '+TOTAL+')';
}
function go(n,scroll){
  if(n<1||n>TOTAL||n===page&&scroll) return;
  page=n; fill('g3',PER,false,(page-1)*PER,true); renderPager();
  if(scroll) document.getElementById('all').scrollIntoView({behavior:'smooth'});
}
document.getElementById('pager').addEventListener('click',function(e){
  var a=e.target.closest('a[data-p]'); if(a){e.preventDefault();go(+a.dataset.p,true)}
});

fill('g1',10,true,0); fill('g2',10,true,7); go(1,false);
