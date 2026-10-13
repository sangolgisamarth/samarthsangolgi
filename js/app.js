const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const J=f=>fetch('data/'+f+'.json').then(r=>{if(!r.ok)throw Error(f);return r.json()});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tags=a=>`<div class="tags">${(a||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
const thumb=(src,t)=>`<div class="thumb">${src?`<img src="${esc(src)}" alt="${esc(t)}" loading="lazy" onerror="this.remove()">`:''}<span>${esc(t[0])}</span></div>`;
const ext=(u,l)=>u?`<a href="${esc(u)}" target="_blank" rel="noopener">${l}</a>`:'';
const PAGES=[['index.html','Home'],['about.html','About'],['projects.html','Projects'],['achievements.html','Achievements'],['learning.html','Learning'],['contact.html','Contact']];

/* ---------- renderers: each gets (element, data) ---------- */
const R={
stats:(e,d)=>{e.innerHTML=d.map(s=>`<div class="card stat"><b data-n="${esc(s.num)}">${esc(s.num)}</b><span>${esc(s.label)}</span></div>`).join('');
  $$('b',e).forEach(b=>{const m=b.dataset.n.match(/^([\d.]+)(.*)$/);if(!m||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const to=parseFloat(m[1]),dec=(m[1].split('.')[1]||'').length,t0=performance.now();
    (function f(t){const p=Math.min((t-t0)/900,1);b.textContent=(to*p).toFixed(dec)+m[2];if(p<1)requestAnimationFrame(f)})(t0)})},
skills:(e,d)=>e.innerHTML=d.map(s=>`<div class="card skill"><h3>${esc(s.label)}</h3>${tags(s.tags)}</div>`).join(''),
experience:(e,d)=>e.innerHTML=`<div class="tl">${d.map(x=>`<div class="it"><div class="when">${esc(x.duration)} · ${esc(x.company)}</div><h3>${esc(x.title)}</h3><ul>${x.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</div>`,
activities:(e,d)=>e.innerHTML=d.map(x=>`<div class="card"><h3>${esc(x.title)}</h3><div class="meta">${esc(x.org)}</div><p>${esc(x.detail)}</p></div>`).join(''),
education:(e,d)=>e.innerHTML=d.map(x=>`<div class="card"><h3>${esc(x.degree)}</h3><div>${esc(x.institution)}</div><div class="meta">${esc(x.duration)}</div><p>${esc(x.detail)}</p></div>`).join(''),
hackathons:(e,d)=>e.innerHTML=d.map(h=>`<article class="card lift">${thumb(h.image,h.name)}<span class="badge">${esc(h.badge)}</span><h3>${esc(h.name)}</h3><div class="meta"><strong>${esc(h.achievement)}</strong></div><p>${esc(h.detail)}</p>${ext(h.link,'View details')}</article>`).join(''),
projects:(e,d,o)=>{
  if(o.limit)d=d.slice(0,+o.limit);
  const all=[...new Set(d.flatMap(p=>p.stack))].sort(),ui=o.filter!=null;let tag='All',q='';
  const draw=()=>{const l=d.filter(p=>(tag=='All'||p.stack.includes(tag))&&(p.name+p.desc+p.stack).toLowerCase().includes(q));
    $('.list',e).innerHTML=l.length?l.map(p=>`<article class="card lift">${thumb(p.image,p.name)}<h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>${tags(p.stack)}<div class="btns" style="margin-top:12px;gap:16px">${ext(p.github,'Code')}${ext(p.demo,'Live demo')}</div></article>`).join(''):'<div class="empty">No projects match. Clear the search or pick another technology.</div>'};
  e.innerHTML=(ui?`<input class="search" type="search" placeholder="Search projects" aria-label="Search projects"><div class="chips">${['All',...all].map(t=>`<button class="chip" aria-pressed="${t=='All'}">${esc(t)}</button>`).join('')}</div>`:'')+'<div class="grid g2 list"></div>';
  if(ui){$('.search',e).oninput=x=>{q=x.target.value.toLowerCase();draw()};
    $$('.chip',e).forEach(c=>c.onclick=()=>{tag=c.textContent;$$('.chip',e).forEach(k=>k.setAttribute('aria-pressed',k==c));draw()})}
  draw()},
list:(e,d,o)=>{ if(!d.length){e.closest('section').remove();return}
  const row=c=>`<article class="card lift"><h3>${esc(c.name)}</h3><div class="meta">${esc(c.issuer||c.platform||'')}${c.year?' · '+esc(c.year):''}</div>${c.status?`<p>${esc(c.status)}</p>`:''}${ext(c.link||c.credential,'View credential')}</article>`;
  e.innerHTML=`<input class="search" type="search" placeholder="Search" aria-label="Search"><div class="grid g2 l"></div>`;
  const draw=q=>$('.l',e).innerHTML=d.filter(c=>JSON.stringify(c).toLowerCase().includes(q)).map(row).join('')||'<div class="empty">Nothing found.</div>';
  $('.search',e).oninput=x=>draw(x.target.value.toLowerCase());draw('')},
profiles:async(e,d)=>{
  const card=(k,name,url,body)=>`<article class="card lift prof"><div class="top"><div class="dot">${name[0]}</div><h3>${name}</h3></div>${body}<div>${ext(url,'Open profile')}</div></article>`;
  const g=d.github,l=d.leetcode,m=l.manual||{};
  e.innerHTML=card('gh','GitHub',g.url,`<div class="nums" id="gh-n"><div><b>–</b><span>Repositories</span></div><div><b>–</b><span>Followers</span></div></div><div class="live" id="gh-s"></div>`)
   +card('lc','LeetCode',l.url,`<div class="nums" id="lc-n"><div><b>${m.solved??'–'}</b><span>Solved</span></div><div><b>${m.easy??'–'}</b><span>Easy</span></div><div><b>${m.medium??'–'}</b><span>Medium</span></div><div><b>${m.hard??'–'}</b><span>Hard</span></div></div><div class="live" id="lc-s"></div>`)
   +card('in','LinkedIn',d.linkedin.url,`<p>Professional profile, experience and recommendations.</p>`)
   +card('hk',d.hackathon.label||'Hackathons',d.hackathon.url,`<p>${esc(d.hackathon.note||'Hackathon participation and results.')}</p>`);
  const num=(id,a)=>$('#'+id).innerHTML=a.map(([v,t])=>`<div><b>${v}</b><span>${t}</span></div>`).join('');
  try{const r=await fetch('https://api.github.com/users/'+g.username);if(r.ok){const u=await r.json();num('gh-n',[[u.public_repos,'Repositories'],[u.followers,'Followers'],[u.following,'Following']]);$('#gh-s').textContent='Live from GitHub'}}catch{}
  try{const r=await fetch('https://leetcode-stats-api.herokuapp.com/'+l.username);const u=r.ok&&await r.json();if(u&&u.status=='success'){num('lc-n',[[u.totalSolved,'Solved'],[u.easySolved,'Easy'],[u.mediumSolved,'Medium'],[u.hardSolved,'Hard']]);$('#lc-s').textContent='Live from LeetCode'}}catch{}},
repos:async(e,d)=>{
  try{const r=await fetch(`https://api.github.com/users/${d.github.username}/repos?sort=updated&per_page=6`);const l=(await r.json()).filter(x=>!x.fork);
   e.innerHTML=l.map(x=>`<article class="card lift"><h3><a href="${x.html_url}" target="_blank" rel="noopener">${esc(x.name)}</a></h3><p>${esc(x.description||'No description')}</p><div class="meta">${esc(x.language||'')} · ★ ${x.stargazers_count}</div></article>`).join('')||'<div class="empty">No public repositories yet.</div>'}
  catch{e.innerHTML='<div class="empty">Could not load repositories from GitHub right now.</div>'}},
contact:(e,d)=>{e.innerHTML=`<form class="c"><label>Name<input name="n" required autocomplete="name"></label><label>Email<input name="e" type="email" required autocomplete="email"></label><label>Message<textarea name="m" rows="5" required></textarea></label><button class="btn p" type="submit">Send message</button><small class="meta">This opens your email app with the message filled in.</small></form>`;
  $('form',e).onsubmit=ev=>{ev.preventDefault();const f=new FormData(ev.target);location.href=`mailto:${d.email}?subject=${encodeURIComponent('Portfolio message from '+f.get('n'))}&body=${encodeURIComponent(f.get('m')+'\n\n'+f.get('n')+' ('+f.get('e')+')')}`}}
};
const SRC={stats:'stats',skills:'skills',experience:'experience',education:'education',activities:'activities',hackathons:'hackathons',projects:'projects',certs:'certifications',courses:'courses',profiles:'profiles',repos:'profiles',contact:'meta'};
const FN={certs:'list',courses:'list'};

/* ---------- shell ---------- */
async function boot(){
  const meta=await J('meta'),cur=location.pathname.split('/').pop()||'index.html';
  document.title=($('h1')?.dataset.title||document.title.split('·')[0].trim())+' · '+meta.name;
  const links=PAGES.map(([h,t])=>`<li><a href="${h}" ${h==cur?'aria-current="page"':''}>${t}</a></li>`).join('');
  document.body.insertAdjacentHTML('afterbegin',`<a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap bar"><a class="logo" href="index.html">${esc(meta.name)}</a><nav id="nav" aria-label="Main"><ul>${links}</ul></nav><div class="tools"><button class="icon-btn" id="theme" aria-label="Toggle dark mode">◐</button><button class="icon-btn" id="menu" aria-label="Menu" aria-expanded="false">☰</button></div></div></header>`);
  $('main').id='main';
  document.body.insertAdjacentHTML('beforeend',`<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(meta.name)} · ${esc(meta.location)}</span><div class="links"><a href="mailto:${esc(meta.email)}">Email</a>${ext(meta.github,'GitHub')}${ext(meta.linkedin,'LinkedIn')}</div></div></footer>`);
  $('#menu').onclick=e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
  const root=document.documentElement,saved=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');root.dataset.theme=saved;
  $('#theme').onclick=()=>{const t=root.dataset.theme=='dark'?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('theme',t)}catch{}};
  $$('[data-meta]').forEach(n=>{const v=meta[n.dataset.meta];if(n.tagName=='A')n.href=(n.dataset.pre||'')+v;else n.textContent=v});
  for(const el of $$('[data-render]')){const k=el.dataset.render;
    try{const d=await J(el.dataset.src||SRC[k]);await R[FN[k]||k](el,d,el.dataset)}catch(err){el.innerHTML=`<div class="empty">Could not load data/${esc(el.dataset.src||SRC[k])}.json. Open the site through a local server (see README), and check the JSON is valid.</div>`}}
  const io=new IntersectionObserver(a=>a.forEach(x=>x.isIntersecting&&(x.target.classList.add('in'),io.unobserve(x.target))));$$('.rv').forEach(n=>io.observe(n));
}
boot();
