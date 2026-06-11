// ===== PRODUTOS INICIAIS =====
const PRODUTOS_PADRAO = [
  {id:1,nome:"Camiseta Premium",preco:149,desc:"Camiseta oversized em algodão Pima 100%. Corte relaxado, acabamento impecável.",img:"https://picsum.photos/900/1200?random=1",badge:"Destaque",sizes:["P","M","G","GG"],estoque:12},
  {id:2,nome:"Moletom Black",preco:229,desc:"Moletom premium em fleece ultra macio. Design minimalista com interior escovado.",img:"https://picsum.photos/900/1200?random=2",badge:"Novo",sizes:["P","M","G","GG","XGG"],estoque:8},
  {id:3,nome:"Jaqueta Premium",preco:349,desc:"Jaqueta de couro sintético premium com acabamento fosco. Design atemporal.",img:"https://picsum.photos/900/1200?random=3",badge:null,sizes:["P","M","G","GG"],estoque:5},
  {id:4,nome:"Calça Cargo Slim",preco:279,desc:"Calça cargo com corte slim moderno. Bolsos laterais funcionais e tecido ripstop.",img:"https://picsum.photos/900/1200?random=4",badge:"Novo",sizes:["38","40","42","44","46"],estoque:0},
  {id:5,nome:"Polo Piqué",preco:189,desc:"Camisa polo clássica em piqué de algodão egípcio. Bordado discreto.",img:"https://picsum.photos/900/1200?random=5",badge:null,sizes:["P","M","G","GG"],estoque:20},
  {id:6,nome:"Bermuda Linho",preco:169,desc:"Bermuda em linho italiano lavado. Leve, respirável e com caimento perfeito.",img:"https://picsum.photos/900/1200?random=6",badge:null,sizes:["38","40","42","44"],estoque:3},
  {id:7,nome:"Jaqueta Bomber",preco:389,desc:"Bomber clássica com forro em seda sintética e ribana no punho, barra e gola.",img:"https://picsum.photos/900/1200?random=7",badge:"Destaque",sizes:["P","M","G","GG"],estoque:6},
  {id:8,nome:"Regata Dry-Fit",preco:99,desc:"Regata técnica em dry-fit com proteção UV50+. Ideal para treinos ou uso casual.",img:"https://picsum.photos/900/1200?random=8",badge:null,sizes:["P","M","G","GG","XGG"],estoque:15},
  {id:9,nome:"Sobretudo Wool",preco:699,desc:"Sobretudo em lã virgem italiana com forro de seda. Elegância atemporal.",img:"https://picsum.photos/900/1200?random=9",badge:"Premium",sizes:["P","M","G","GG"],estoque:2},
  {id:10,nome:"Calça Alfaiataria",preco:319,desc:"Calça de alfaiataria em tecido técnico com queda impecável.",img:"https://picsum.photos/900/1200?random=10",badge:null,sizes:["38","40","42","44","46"],estoque:0},
  {id:11,nome:"Camisa Oxford",preco:209,desc:"Camisa oxford em algodão 100% com textura característica. Colarinho button-down.",img:"https://picsum.photos/900/1200?random=31",badge:null,sizes:["P","M","G","GG"],estoque:9},
  {id:12,nome:"Blazer Slim",preco:479,desc:"Blazer slim em tecido techno-wool italiano. Forro parcial em viscose.",img:"https://picsum.photos/900/1200?random=36",badge:"Premium",sizes:["48","50","52","54"],estoque:4},
];

// ===== PERSISTÊNCIA =====
const DB_KEY = 'f2store_produtos';

function salvarDB(){
  try{ localStorage.setItem(DB_KEY, JSON.stringify(produtos)); } catch(e){}
}

function carregarDB(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch(e){}
  return null;
}

let produtos = carregarDB() || JSON.parse(JSON.stringify(PRODUTOS_PADRAO));

let carrinho = [];
let produtoAtual = null;
let tamanhoSel = null;
let filtroAtivo = 'todos';
let badgeSel = '';

// ===== HELPERS =====
function fmt(v){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});}
function nextId(){return produtos.length ? Math.max(...produtos.map(p=>p.id))+1 : 1;}

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('on');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2600);
}

// ===== SLIDESHOW =====
const SLIDES = [
  'https://picsum.photos/1600/900?random=201',
  'https://picsum.photos/1600/900?random=202',
  'https://picsum.photos/1600/900?random=203',
  'https://picsum.photos/1600/900?random=204',
  'https://picsum.photos/1600/900?random=205',
];
let slideIdx = 0, slideTimer = null;

function initSlideshow(){
  const hero = document.getElementById('hero');
  const dots = document.getElementById('heroDots');
  // criar slides
  SLIDES.forEach((src, i) => {
    const el = document.createElement('div');
    el.className = 'hero-slide' + (i===0?' active':'');
    el.style.backgroundImage = `url('${src}')`;
    el.id = 'slide-' + i;
    hero.insertBefore(el, hero.querySelector('.hero-overlay'));
  });
  // criar dots
  dots.innerHTML = SLIDES.map((_,i)=>`<button class="hero-dot${i===0?' on':''}" onclick="goSlide(${i})"></button>`).join('');
  startSlideTimer();
}

function goSlide(n){
  document.getElementById('slide-'+slideIdx).classList.remove('active');
  document.querySelectorAll('.hero-dot')[slideIdx].classList.remove('on');
  slideIdx = (n + SLIDES.length) % SLIDES.length;
  const el = document.getElementById('slide-'+slideIdx);
  el.classList.add('active');
  // reset zoom
  el.style.animation='none'; el.offsetHeight; el.style.animation='';
  document.querySelectorAll('.hero-dot')[slideIdx].classList.add('on');
  startSlideTimer();
}
function slideNext(){ goSlide(slideIdx+1); }
function slidePrev(){ goSlide(slideIdx-1); }
function startSlideTimer(){ clearInterval(slideTimer); slideTimer=setInterval(slideNext, 5000); }

// ===== ABRIR LOJA =====
function abrirLoja(){
  document.getElementById('splash').style.display='none';
  document.getElementById('loja').style.display='block';
  initSlideshow();
  renderGrid();
  renderFiltros();
}

// ===== FILTROS =====
function renderFiltros(){
  const badges=['todos',...new Set(produtos.filter(p=>p.badge).map(p=>p.badge))];
  document.getElementById('filterRow').innerHTML=badges.map(b=>`
    <button class="filter-btn${b===filtroAtivo?' on':''}" onclick="setFiltro('${b}',this)">${b==='todos'?'Todos':b}</button>
  `).join('');
}

function setFiltro(b,el){
  filtroAtivo=b;
  document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('on'));
  el.classList.add('on');
  renderGrid();
}

// ===== RENDER GRID =====
function renderGrid(){
  const q=document.getElementById('searchInput').value.toLowerCase();
  let lista=produtos.filter(p=>{
    const matchQ=p.nome.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q);
    const matchF=filtroAtivo==='todos'||(p.badge&&p.badge===filtroAtivo);
    return matchQ&&matchF;
  });
  document.getElementById('shopMeta').textContent=lista.length+' '+(lista.length===1?'item':'itens');
  const g=document.getElementById('grid');
  if(!lista.length){
    g.innerHTML='<div class="empty-state"><i class="fa-regular fa-face-meh"></i>Nenhum produto encontrado.</div>';
    return;
  }
  g.innerHTML=lista.map(p=>{
    const semE=p.estoque<=0;
    const low=p.estoque>0&&p.estoque<=3;
    let stockEl=semE
      ?'<span class="card-stock stock-out">Esgotado</span>'
      :low
        ?`<span class="card-stock stock-low">Últimas ${p.estoque}</span>`
        :`<span class="card-stock stock-ok">Em estoque</span>`;
    let badge=semE
      ?'<div class="card-badge badge-sem">Esgotado</div>'
      :p.badge
        ?`<div class="card-badge">${p.badge}</div>`
        :'';
    let hoverTxt=semE?'<i class="fa-solid fa-xmark"></i> Esgotado':'<i class="fa-regular fa-eye"></i> Ver produto';
    return `
    <div class="card${semE?' sem-estoque':''}" onclick="abrirModal(${p.id})">
      <div class="card-img-wrap">
        ${badge}
        <img class="card-img" src="${p.img}" alt="${p.nome}" loading="lazy">
        <div class="card-hover-btn">${hoverTxt}</div>
      </div>
      <div class="card-body">
        <div class="card-name">${p.nome}</div>
        <div class="card-desc">${p.desc.substring(0,58)}…</div>
        <div class="card-row">
          <div class="card-price">${fmt(p.preco)}</div>
          ${stockEl}
        </div>
      </div>
    </div>`;
  }).join('');
}

function buscar(){renderGrid();}

// ===== MODAL PRODUTO =====
function abrirModal(id){
  produtoAtual=produtos.find(p=>p.id===id);
  tamanhoSel=null;
  const semE=produtoAtual.estoque<=0;
  document.getElementById('modalImg').src=produtoAtual.img;
  document.getElementById('modalName').textContent=produtoAtual.nome;
  document.getElementById('modalPrice').textContent=fmt(produtoAtual.preco);
  document.getElementById('modalDesc').textContent=produtoAtual.desc;
  // thumbs — usa a mesma imagem como placeholder
  document.getElementById('modalThumbs').innerHTML=`<img src="${produtoAtual.img}" class="on" onclick="trocaImg(this,'${produtoAtual.img}')">`;
  // sizes
  document.getElementById('sizeGrid').innerHTML=(produtoAtual.sizes||[]).map(s=>`
    <button class="sz${semE?' sz-dis':''}" onclick="selSize(this,'${s}')" ${semE?'disabled':''}>${s}</button>
  `).join('');
  // stock info
  const si=document.getElementById('stockInfo');
  if(semE){
    si.textContent='⚠ Produto esgotado';
    si.className='stock-info-modal stock-out';
  }else if(produtoAtual.estoque<=3){
    si.textContent=`⚡ Últimas ${produtoAtual.estoque} unidades!`;
    si.className='stock-info-modal stock-low';
  }else{
    si.textContent=`✓ ${produtoAtual.estoque} unidades em estoque`;
    si.className='stock-info-modal stock-ok';
  }
  const btn=document.getElementById('btnAdd');
  if(semE){
    btn.disabled=true;
    btn.innerHTML='<i class="fa-solid fa-xmark"></i><span>Produto esgotado</span>';
    btn.className='btn-add';
  }else{
    btn.disabled=false;
    btn.innerHTML='<i class="fa-solid fa-plus"></i><span>Adicionar ao carrinho</span>';
    btn.className='btn-add';
  }
  document.getElementById('modal').classList.add('on');
  document.body.style.overflow='hidden';
}

function fecharModal(){
  document.getElementById('modal').classList.remove('on');
  document.body.style.overflow='';
}

function trocaImg(el,src){
  document.getElementById('modalImg').src=src;
  document.querySelectorAll('.modal-thumbs img').forEach(i=>i.classList.remove('on'));
  el.classList.add('on');
}

function selSize(el,s){
  if(produtoAtual.estoque<=0)return;
  document.querySelectorAll('.sz').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  tamanhoSel=s;
}

function addCarrinho(){
  if(!produtoAtual||produtoAtual.estoque<=0)return;
  if(!tamanhoSel){toast('Selecione um tamanho');return;}
  const exist=carrinho.find(i=>i.id===produtoAtual.id&&i.size===tamanhoSel);
  const totalNoCarrinho=exist?exist.qty:0;
  if(totalNoCarrinho>=produtoAtual.estoque){toast('Quantidade máxima em estoque atingida');return;}
  if(exist)exist.qty++;
  else carrinho.push({id:produtoAtual.id,nome:produtoAtual.nome,preco:produtoAtual.preco,img:produtoAtual.img,size:tamanhoSel,qty:1});
  atualizarBadge();
  const btn=document.getElementById('btnAdd');
  btn.className='btn-add ok';
  btn.innerHTML='<i class="fa-solid fa-check"></i><span>Adicionado!</span>';
  setTimeout(()=>{
    btn.className='btn-add';
    btn.innerHTML='<i class="fa-solid fa-plus"></i><span>Adicionar ao carrinho</span>';
  },1800);
  toast(`${produtoAtual.nome} adicionado!`);
}

function atualizarBadge(){
  const n=carrinho.reduce((a,b)=>a+b.qty,0);
  const b=document.getElementById('cartBadge');
  b.textContent=n;
  b.classList.toggle('on',n>0);
}

// ===== CARRINHO =====
function abrirCarrinho(){
  renderCarrinho();
  document.getElementById('drawer').classList.add('on');
  document.getElementById('overlay').classList.add('on');
}

function fecharCarrinho(){
  document.getElementById('drawer').classList.remove('on');
  document.getElementById('overlay').classList.remove('on');
}

function renderCarrinho(){
  const body=document.getElementById('drawerBody');
  const foot=document.getElementById('drawerFoot');
  if(!carrinho.length){
    body.innerHTML='<div class="cart-empty-msg"><i class="fa-solid fa-bag-shopping"></i><p>Seu carrinho está vazio.</p></div>';
    foot.innerHTML='';return;
  }
  body.innerHTML=carrinho.map((item,i)=>`
  <div class="cart-item">
    <img class="cart-img" src="${item.img}" alt="${item.nome}">
    <div class="ci-info">
      <div class="ci-name">${item.nome}</div>
      <div class="ci-meta">Tam. ${item.size}</div>
      <div class="ci-controls">
        <button class="qty-btn" onclick="qtdCart(${i},-1)">−</button>
        <span class="qty-n">${item.qty}</span>
        <button class="qty-btn" onclick="qtdCart(${i},1)">+</button>
        <button class="ci-rm" onclick="rmCart(${i})"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    </div>
    <div class="ci-price">${fmt(item.preco*item.qty)}</div>
  </div>`).join('');
  const sub=carrinho.reduce((a,b)=>a+b.preco*b.qty,0);
  foot.innerHTML=`
  <div class="sub-row">
    <span>Subtotal</span>
    <strong>${fmt(sub)}</strong>
  </div>
  <button class="btn-wpp" onclick="finalizarWpp()">
    <i class="fa-brands fa-whatsapp"></i> Finalizar no WhatsApp
  </button>
  <button class="btn-continuar" onclick="fecharCarrinho()">Continuar comprando</button>`;
}

function qtdCart(i,d){
  const prod=produtos.find(p=>p.id===carrinho[i].id);
  const novaQty=carrinho[i].qty+d;
  if(novaQty<=0){carrinho.splice(i,1);}
  else if(prod&&novaQty>prod.estoque){toast('Quantidade máxima em estoque');}
  else{carrinho[i].qty=novaQty;}
  atualizarBadge();renderCarrinho();
}

function rmCart(i){
  carrinho.splice(i,1);
  atualizarBadge();renderCarrinho();
}

function finalizarWpp(){
  if(!carrinho.length){toast('Carrinho vazio');return;}
  let msg='Olá! Gostaria de comprar:%0A%0A';
  let total=0;
  carrinho.forEach(i=>{
    msg+=`• ${i.nome} (tam. ${i.size}) x${i.qty} — ${fmt(i.preco*i.qty)}%0A`;
    total+=i.preco*i.qty;
  });
  msg+=`%0A*Total: ${fmt(total)}*`;
  window.open('https://wa.me/5511972833011?text='+msg,'_blank');
}

// ===== AUTENTICAÇÃO ADMIN =====
const SENHA_ADMIN = 'f2store2025'; // 🔑 TROQUE AQUI
let adminLogado = false;

// — Segredo 1: clicar 5x no logo —
let logoClicks = 0, logoTimer = null;
function logoClick(){
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(()=>logoClicks=0, 2000);
  if(logoClicks >= 5){ logoClicks=0; abrirLogin(); }
}

// — Segredo 2: digitar "f2admin" em qualquer lugar da página —
let konamiBuffer = '';
document.addEventListener('keydown', e=>{
  if(document.activeElement.tagName==='INPUT'||document.activeElement.tagName==='TEXTAREA') return;
  konamiBuffer += e.key.toLowerCase();
  konamiBuffer = konamiBuffer.slice(-7);
  if(konamiBuffer === 'f2admin'){ konamiBuffer=''; abrirLogin(); }
});

function abrirLogin(){
  if(adminLogado){ abrirAdmin(); return; }
  document.getElementById('senhaInput').value='';
  document.getElementById('loginErro').textContent='';
  document.getElementById('loginOverlay').classList.add('on');
  document.body.style.overflow='hidden';
  setTimeout(()=>document.getElementById('senhaInput').focus(),100);
}

function fecharLogin(){
  document.getElementById('loginOverlay').classList.remove('on');
  document.body.style.overflow='';
}

function toggleVerSenha(){
  const inp=document.getElementById('senhaInput');
  const icon=document.getElementById('eyeIcon');
  if(inp.type==='password'){inp.type='text';icon.className='fa-regular fa-eye-slash';}
  else{inp.type='password';icon.className='fa-regular fa-eye';}
}

function verificarSenha(){
  const val=document.getElementById('senhaInput').value;
  const err=document.getElementById('loginErro');
  if(val===SENHA_ADMIN){
    adminLogado=true;
    fecharLogin();
    document.getElementById('btnLogout').classList.add('on');
    abrirAdmin();
  }else{
    err.textContent='Senha incorreta. Tente novamente.';
    document.getElementById('senhaInput').value='';
    document.getElementById('senhaInput').focus();
    const box=document.querySelector('.login-box');
    box.style.animation='none';
    box.offsetHeight;
    box.style.animation='shake .35s var(--ease)';
  }
}

function logout(){
  adminLogado=false;
  document.getElementById('btnLogout').classList.remove('on');
  fecharAdmin();
  toast('Sessão encerrada.');
}

// ===== PAINEL ADMIN =====
let adminTabAtiva='lista';

function abrirAdmin(){
  renderAdminLista();
  document.getElementById('adminOverlay').classList.add('on');
  document.body.style.overflow='hidden';
}

function fecharAdmin(){
  document.getElementById('adminOverlay').classList.remove('on');
  document.body.style.overflow='';
}

function adminTab(tab,el){
  adminTabAtiva=tab;
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('adminLista').style.display=tab==='lista'?'block':'none';
  document.getElementById('adminNovo').style.display=tab==='novo'?'block':'none';
  if(tab==='lista')renderAdminLista();
}

function renderAdminLista(){
  const el=document.getElementById('adminLista');
  if(!produtos.length){el.innerHTML='<p style="color:var(--gray-400);font-size:.85rem;text-align:center;padding:2rem">Nenhum produto cadastrado.</p>';return;}
  el.innerHTML=`<div class="admin-product-list">${produtos.map((p,i)=>{
    const semE=p.estoque<=0;
    const low=p.estoque>0&&p.estoque<=3;
    const stockClass=semE?'stock-out':low?'stock-low':'stock-ok';
    return `
    <div class="adm-item" id="adm-item-${p.id}">
      <img class="adm-img" src="${p.img}" alt="${p.nome}">
      <div class="adm-info">
        <div class="adm-name">${p.nome}</div>
        <div class="adm-price">${fmt(p.preco)} • ${p.badge||'Sem badge'}</div>
      </div>
      <div class="adm-stock-wrap">
        <label>Estoque:</label>
        <input class="adm-stock-input" type="number" min="0" id="stock-${p.id}" value="${p.estoque}">
        <button class="btn-salvar-stock" onclick="salvarEstoque(${p.id})">Salvar</button>
        <span class="card-stock ${stockClass}" style="margin-left:.2rem">${semE?'Esgotado':low?'Baixo':'OK'}</span>
      </div>
      <div class="adm-actions">
        <button class="btn-adm-del" onclick="deletarProduto(${p.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function salvarEstoque(id){
  const val=parseInt(document.getElementById('stock-'+id).value)||0;
  const p=produtos.find(x=>x.id===id);
  if(!p)return;
  p.estoque=Math.max(0,val);
  salvarDB();
  renderAdminLista();
  renderGrid();
  toast(`Estoque de "${p.nome}" atualizado para ${p.estoque}`);
}

function deletarProduto(id){
  const p=produtos.find(x=>x.id===id);
  if(!confirm(`Remover "${p.nome}" do catálogo?`))return;
  produtos=produtos.filter(x=>x.id!==id);
  carrinho=carrinho.filter(x=>x.id!==id);
  salvarDB();
  atualizarBadge();
  renderAdminLista();
  renderGrid();
  renderFiltros();
  toast(`"${p.nome}" removido.`);
}

function resetarProdutos(){
  if(!confirm('Restaurar todos os produtos padrão? Os produtos adicionados manualmente serão perdidos.')) return;
  produtos = JSON.parse(JSON.stringify(PRODUTOS_PADRAO));
  salvarDB();
  renderAdminLista();
  renderGrid();
  renderFiltros();
  toast('Catálogo restaurado para o padrão.');
}

// Badge selector
document.querySelectorAll('.bp-opt').forEach(el=>{
  el.addEventListener('click',function(){
    document.querySelectorAll('.bp-opt').forEach(x=>x.classList.remove('on'));
    this.classList.add('on');
    badgeSel=this.dataset.val;
  });
});
document.querySelector('.bp-opt[data-val=""]').classList.add('on');

function adicionarProduto(){
  const nome=document.getElementById('fNome').value.trim();
  const preco=parseFloat(document.getElementById('fPreco').value);
  const desc=document.getElementById('fDesc').value.trim();
  const img=document.getElementById('fImg').value.trim();
  const estoque=parseInt(document.getElementById('fEstoque').value)||0;
  const sizesRaw=document.getElementById('fSizes').value.trim();
  if(!nome){toast('Informe o nome do produto');return;}
  if(!preco||isNaN(preco)){toast('Informe um preço válido');return;}
  if(!img){toast('Informe a URL da imagem');return;}
  const sizes=sizesRaw?sizesRaw.split(',').map(s=>s.trim()).filter(Boolean):['P','M','G','GG'];
  const novo={
    id:nextId(),nome,preco,
    desc:desc||'Produto de alta qualidade.',
    img,badge:badgeSel||null,sizes,estoque
  };
  produtos.push(novo);
  salvarDB();
  // reset form
  document.getElementById('fNome').value='';
  document.getElementById('fPreco').value='';
  document.getElementById('fDesc').value='';
  document.getElementById('fImg').value='';
  document.getElementById('fEstoque').value='10';
  document.getElementById('fSizes').value='';
  document.querySelectorAll('.bp-opt').forEach(x=>x.classList.remove('on'));
  document.querySelector('.bp-opt[data-val=""]').classList.add('on');
  badgeSel='';
  renderGrid();
  renderFiltros();
  toast(`"${nome}" adicionado ao catálogo!`);
  // switch to lista
  const listaTab=document.querySelectorAll('.atab')[0];
  adminTab('lista',listaTab);
}

// ESC fecha
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){fecharModal();fecharCarrinho();fecharAdmin();}
});