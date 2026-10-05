const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ZALO='0900000000',reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fmt=n=>n.toLocaleString('vi-VN')+'đ';
function toast(t){const e=$('.toast');e.textContent=t;e.classList.add('on');clearTimeout(e.t);e.t=setTimeout(()=>e.classList.remove('on'),1800)}

// Ánh sáng theo chuột
const cur=$('.cursor');
addEventListener('pointermove',e=>{if(cur)cur.style.transform=`translate(${e.clientX}px,${e.clientY}px)`});

// Hiện dần khi cuộn
const io=new IntersectionObserver(l=>l.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Nghiêng thẻ sản phẩm theo chuột
$$('.item').forEach(c=>{
  c.addEventListener('pointermove',e=>{if(reduce||e.pointerType!=='mouse')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`});
  c.addEventListener('pointerleave',()=>c.style.transform='');
});

// Cây nến trang chủ
const candle=$('#candle');
if(candle){
  const hero=$('.hero'),stage=$('.stage');let lit=false,timer;
  const ember=()=>{const s=document.createElement('i');s.className='ember';s.style.left=(88+Math.random()*24)+'px';s.style.setProperty('--dx',(Math.random()*60-30)+'px');candle.appendChild(s);s.onanimationend=()=>s.remove()};
  const setLit=v=>{lit=v;hero.classList.toggle('lit',v);candle.setAttribute('aria-pressed',v);$('#hint').textContent=v?'Chạm lần nữa để tắt nến':'Chạm vào cây nến để thắp';clearInterval(timer);if(v&&!reduce)timer=setInterval(ember,280)};
  candle.addEventListener('click',()=>setLit(!lit));
  setTimeout(()=>{if(!lit)setLit(true)},1600);
  $$('.chip[data-tone]').forEach(b=>b.addEventListener('click',()=>{
    $$('.chip[data-tone]').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    hero.style.setProperty('--tone',b.dataset.tone);
    $('#scentName').textContent=b.dataset.name;$('#scentDesc').textContent=b.dataset.desc;
    candle.classList.remove('pop');void candle.offsetWidth;candle.classList.add('pop');
    if(!lit)setLit(true);
  }));
}

// Lọc sản phẩm
$$('.chip[data-f]').forEach(b=>b.addEventListener('click',()=>{
  $$('.chip[data-f]').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  $$('.item').forEach(i=>{const ok=b.dataset.f==='all'||i.dataset.cat===b.dataset.f;i.hidden=!ok;if(ok){i.classList.remove('show');void i.offsetWidth;i.classList.add('show')}});
}));

// Giỏ hàng
let cart={};try{cart=JSON.parse(localStorage.getItem('cart')||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem('cart',JSON.stringify(cart))}catch(e){}};
document.body.insertAdjacentHTML('beforeend',`<div class="scrim"></div><aside id="cart" aria-label="Giỏ hàng"><div class="head"><h2 style="font-size:24px;margin:0">Giỏ hàng</h2><button class="x" aria-label="Đóng">×</button></div><ul></ul><p id="total" style="margin:0;font-weight:600"></p><button class="btn" id="send">Gửi đơn qua Zalo</button></aside><div class="toast" role="status"></div>`);
const drawer=$('#cart'),scrim=$('.scrim');
const open=v=>{drawer.classList.toggle('open',v);scrim.classList.toggle('open',v)};
$('#cartBtn').onclick=()=>open(true);scrim.onclick=()=>open(false);$('#cart .x').onclick=()=>open(false);
addEventListener('keydown',e=>{if(e.key==='Escape')open(false)});
function orderText(){const k=Object.keys(cart);return 'Xin chào shop, mình muốn đặt:\n'+k.map(n=>`- ${n} x${cart[n].q}`).join('\n')+'\nTổng: '+fmt(k.reduce((s,n)=>s+cart[n].p*cart[n].q,0))}
function render(){
  const k=Object.keys(cart),cnt=k.reduce((s,n)=>s+cart[n].q,0);
  $('#cnt').textContent=cnt;
  $('#cart ul').innerHTML=k.length?k.map(n=>`<li><span>${n}<br><small>${fmt(cart[n].p)}</small></span><span class="q"><button data-n="${n}" data-d="-1" aria-label="Giảm">−</button><b>${cart[n].q}</b><button data-n="${n}" data-d="1" aria-label="Tăng">+</button></span></li>`).join(''):'<li>Giỏ hàng đang trống. Hãy chọn một mùi hương nhé.</li>';
  $('#total').textContent=k.length?'Tổng: '+fmt(k.reduce((s,n)=>s+cart[n].p*cart[n].q,0)):'';
  $('#send').hidden=!k.length;save();
}
$('#cart ul').onclick=e=>{const b=e.target.closest('button');if(!b)return;const n=b.dataset.n;cart[n].q+=+b.dataset.d;if(cart[n].q<1)delete cart[n];render()};
$$('.add').forEach(b=>b.addEventListener('click',()=>{
  const i=b.closest('.item'),n=i.dataset.name;
  cart[n]=cart[n]||{p:+i.dataset.price,q:0};cart[n].q++;render();
  const c=$('#cartBtn');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');toast('Đã thêm '+n+' vào giỏ');
}));
$('#send').onclick=()=>{const t=orderText();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{}).finally(()=>{toast('Đã sao chép đơn hàng, hãy dán vào Zalo');open(false);window.open('https://zalo.me/'+ZALO,'_blank')})};
render();

// Form đặt hàng trang liên hệ
const f=$('#orderForm');
if(f)f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f);
  const t=`Xin chào shop, mình là ${d.get('ten')}. Mình muốn đặt ${d.get('sl')} nến mùi ${d.get('mui')}.${d.get('ghichu')?' Ghi chú: '+d.get('ghichu'):''}`;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{}).finally(()=>{toast('Đã sao chép tin nhắn, hãy dán vào Zalo');window.open('https://zalo.me/'+ZALO,'_blank')})});
