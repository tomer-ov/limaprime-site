/* ===== CONFIG ===== */
const WA_NUMBER="35796777511";      // מספר וואטסאפ בפורמט בינלאומי
const PIXEL_ID="434134976994198";   // Meta Pixel ID — Lima Prime
const GA_ID="G-GB4LXZDK0C";          // Google Analytics 4
const ORG_TOKEN="4a35df86-1450-4063-b27c-e5ab7ddc5812"; // Leads Pulse — Lima Prime org
const SUPA="https://glvknjbkseemekvtvlcq.supabase.co/functions/v1";
const CRM_ENDPOINT=SUPA+"/receive-lead?org="+ORG_TOKEN;
const CAPI_ENDPOINT=SUPA+"/meta-capi"; // server-to-server Conversions API
/* ================== */

/* Meta Pixel — יופעל אוטומטית כשמזינים PIXEL_ID */
if(PIXEL_ID){
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
 if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
 s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fbq('init',PIXEL_ID);fbq('track','PageView');
}
/* Google Analytics 4 */
if(GA_ID){
 const gs=document.createElement('script');gs.async=true;gs.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(gs);
 window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};
 gtag('js',new Date());gtag('config',GA_ID);
}
function gaEvent(name,params){ if(window.gtag) gtag('event',name,params||{}); }
function fbTrack(ev,data,event_id){ if(window.fbq) fbq('track',ev,data||{}, event_id?{eventID:event_id}:undefined); }
function getCookie(n){const m=document.cookie.match('(^|;)\\s*'+n+'\\s*=\\s*([^;]+)');return m?decodeURIComponent(m.pop()):undefined;}
function getFbc(){const c=getCookie('_fbc');if(c)return c;const p=new URLSearchParams(location.search).get('fbclid');return p?('fb.1.'+Date.now()+'.'+p):undefined;}
function genId(){return (self.crypto&&crypto.randomUUID)?crypto.randomUUID():(String(Date.now())+'-'+Math.round(Math.random()*1e9));}
function sendCapi(eventName,event_id,extra){try{fetch(CAPI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify(Object.assign({org:ORG_TOKEN,event_name:eventName,event_id:event_id,fbp:getCookie('_fbp'),fbc:getFbc(),event_source_url:location.href},extra||{}))});}catch(_){}}

let pendingWa=null;
function wa(name){pendingWa=name||null;const m=document.getElementById('waModal');m.classList.add('show');m.setAttribute('aria-hidden','false');setTimeout(()=>{const p=document.getElementById('wa-phone');if(p)p.focus();},60);}
function waClose(){const m=document.getElementById('waModal');m.classList.remove('show');m.setAttribute('aria-hidden','true');}
function openChat(){const msg=pendingWa?('היי, אשמח לפרטים על פרויקט '+pendingWa+' בלימסול'):'היי, אשמח לפרטים על דירות בלימסול';window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg),'_blank');}
function waSkip(){fbTrack('Contact',{method:'whatsapp'});openChat();waClose();}
async function waSubmit(e){
 e.preventDefault();
 const name=(document.getElementById('wa-name').value||'').trim();
 const phone=(document.getElementById('wa-phone').value||'').trim();
 const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;
 try{await fetch(CRM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({full_name:name||phone,phone:phone,campaign_name:pendingWa||'',form_name:'וואטסאפ — אתר Lima Prime',source:'whatsapp'})});}catch(_){}
 const eid=genId();fbTrack('Contact',{method:'whatsapp'});fbTrack('Lead',{content_name:pendingWa||'whatsapp'},eid);sendCapi('Lead',eid,{phone:phone,content_name:pendingWa||'whatsapp'});gaEvent('generate_lead',{method:'whatsapp',project:pendingWa||'whatsapp'});
 openChat();btn.disabled=false;e.target.reset();waClose();return false;
}
function goContact(){ location.hash=''; setTimeout(()=>document.getElementById('contact').scrollIntoView({behavior:'smooth'}),60); }

/* reveal */
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(Math.min(i,6)*40)+'ms';io.observe(el)});
function toastMsg(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3800);}
async function submitLead(e){
 e.preventDefault();
 const f=e.target;
 const name=(document.getElementById('lead-name').value||'').trim();
 const phone=(document.getElementById('lead-phone').value||'').trim();
 const proj=(document.getElementById('lead-proj').value||'').trim();
 const msg=(document.getElementById('lead-msg').value||'').trim();
 const btn=f.querySelector('button[type=submit]');const old=btn.textContent;btn.disabled=true;btn.textContent='שולח…';
 try{
  const res=await fetch(CRM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({full_name:name,phone:phone,campaign_name:proj,form_name:'אתר Lima Prime',source:'website',dynamic_answer:msg||undefined})});
  const data=await res.json().catch(()=>({}));
  if(res.ok&&data.success!==false){const eid=genId();fbTrack('Lead',{content_name:proj},eid);sendCapi('Lead',eid,{phone:phone,content_name:proj});gaEvent('generate_lead',{method:'form',project:proj});toastMsg('קיבלנו! נחזור אליכם בהקדם 🌊');f.reset();}
  else if((data.error||'').toLowerCase().includes('phone')){toastMsg('מספר הטלפון לא תקין — נסו שוב');}
  else{toastMsg('אירעה שגיאה. נסו שוב או דברו איתנו בוואטסאפ');}
 }catch(err){toastMsg('אין חיבור כרגע — דברו איתנו בוואטסאפ');}
 finally{btn.disabled=false;btn.textContent=old;}
 return false;
}


var _pp=document.body.getAttribute('data-project');if(_pp)fbTrack('ViewContent',{content_name:_pp});

/* ===== floating bottom lead bar ===== */
async function barSubmit(e){
 e.preventDefault();
 var f=e.target;
 var nEl=f.querySelector('.lb-name');
 var name=(nEl?nEl.value:'').trim();
 var phone=(f.querySelector('.lb-phone').value||'').trim();
 var proj=document.body.getAttribute('data-project')||'';
 var btn=f.querySelector('.lb-submit');var old=btn.textContent;btn.disabled=true;btn.textContent='שולח…';
 try{
  var res=await fetch(CRM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({full_name:name||phone,phone:phone,campaign_name:proj,form_name:'סרגל תחתון — אתר Lima Prime',source:'website'})});
  var data=await res.json().catch(function(){return {};});
  if(res.ok&&data.success!==false){var eid=genId();fbTrack('Lead',{content_name:proj||'bottom-bar'},eid);sendCapi('Lead',eid,{phone:phone,content_name:proj||'bottom-bar'});gaEvent('generate_lead',{method:'bottom_bar',project:proj||''});toastMsg('קיבלנו! נחזור אליכם בהקדם 🌊');f.reset();}
  else if((data.error||'').toLowerCase().indexOf('phone')>-1){toastMsg('מספר הטלפון לא תקין — נסו שוב');}
  else{toastMsg('אירעה שגיאה. נסו שוב או דברו איתנו בוואטסאפ');}
 }catch(err){toastMsg('אין חיבור כרגע — דברו איתנו בוואטסאפ');}
 finally{btn.disabled=false;btn.textContent=old;}
 return false;
}
(function(){
 if(document.querySelector('.lead-bar'))return;
 var bar=document.createElement('div');bar.className='lead-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','השארת פרטים');
 bar.innerHTML='<form onsubmit="return barSubmit(event)">'
  +'<span class="lb-title">השאירו פרטים</span>'
  +'<input class="lb-name" type="text" placeholder="שם" aria-label="שם" autocomplete="name">'
  +'<input class="lb-phone" type="tel" placeholder="טלפון" aria-label="טלפון" required autocomplete="tel" inputmode="tel">'
  +'<button class="lb-submit" type="submit">שליחת פרטים</button>'
  +'</form>';
 document.body.appendChild(bar);document.body.classList.add('has-lead-bar');
 var contact=document.getElementById('contact');
 if(contact&&'IntersectionObserver'in window){
  new IntersectionObserver(function(es){es.forEach(function(en){var show=!en.isIntersecting;bar.classList.toggle('in',show);document.body.classList.toggle('has-lead-bar',show);});},{threshold:.12}).observe(contact);
 }else{setTimeout(function(){bar.classList.add('in');},500);}
})();
