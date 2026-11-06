// Появление секций при прокрутке
var rv=[].slice.call(document.querySelectorAll('.sec,.stats,footer'));
rv.forEach(function(el){el.classList.add('reveal')});
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.08});
  rv.forEach(function(el){io.observe(el)});
}else rv.forEach(function(el){el.classList.add('in')});

// Счётчики в статистике
[].forEach.call(document.querySelectorAll('.stat b'),function(b){
  var m=b.textContent.match(/^(\d+)(\+?)$/); if(!m) return;
  var end=+m[1],t0=null; b.textContent='0'+m[2];
  var so=new IntersectionObserver(function(en){if(!en[0].isIntersecting) return; so.disconnect();
    (function step(t){t0=t0||t;var k=Math.min(1,(t-t0)/1200);b.textContent=Math.round(end*(1-Math.pow(1-k,3)))+m[2];if(k<1)requestAnimationFrame(step)})(performance.now());
  });so.observe(b);
});

