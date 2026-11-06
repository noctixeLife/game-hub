var sel={},sortBy='';
var chipsEl=document.getElementById('chips');
function drawChips(q){
  var h='';TAGS.forEach(function(t){if(!q||t.toLowerCase().indexOf(q)>-1)h+='<button class="chip'+(sel[t]?' on':'')+'" data-t="'+t+'">'+t+'</button>'});
  chipsEl.innerHTML=h||'<span style="color:var(--dim)">Ничего не найдено</span>';
}
function note(){
  var k=Object.keys(sel).filter(function(x){return sel[x]});
  document.getElementById('fnote').textContent=(k.length?'Выбрано: '+k.join(', '):'Показаны все игры')+(sortBy?' · сортировка: '+(sortBy==='likes'?'по лайкам':'по загрузкам'):'')+(k.length?'':' — выберите теги для фильтра');
  page=1;go(1,false);
  var seed=k.length*5+(sortBy?3:0);fill('g3',PER,false,seed,true);
}
drawChips('');
chipsEl.addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;var t=b.dataset.t;sel[t]=!sel[t];b.classList.toggle('on',sel[t]);note()});
document.getElementById('tagq').addEventListener('input',function(e){drawChips(e.target.value.trim().toLowerCase())});
document.getElementById('more').onclick=function(){var o=chipsEl.classList.toggle('open');this.textContent=o?'⌃ Свернуть жанры':'⌄ Показать все жанры'};
[].forEach.call(document.querySelectorAll('.sbtn'),function(b){b.onclick=function(){var on=b.classList.contains('on');[].forEach.call(document.querySelectorAll('.sbtn'),function(x){x.classList.remove('on')});sortBy=on?'':b.dataset.s;if(!on)b.classList.add('on');note()}});
