/* tool-engine core v1 - shared workspace for all tool sites */
(function(){
var IT=window.IT=window.IT||{};
if(IT.v)return;IT.v=1;IT.tools={};IT.unit='px';IT.dpi=300;
var css='.it-wrap{max-width:780px;margin:0 auto;font-family:inherit;color:#0f1b2d}.it-wrap *{box-sizing:border-box}'+
'.it-drop{display:block;text-align:center;padding:36px 14px;border:2px dashed #b8c2d0;border-radius:14px;background:#f4f6f8;cursor:pointer}.it-drop b{display:block;font-size:18px}.it-drop:hover,.it-drop.over{border-color:#0b6e5f;background:#ddf1ec}'+
'.it-ws,.it-rs{margin-top:14px}.it-ut{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-weight:600;font-size:14px;margin-bottom:10px}'+
'.it-wrap select,.it-wrap input,.it-ov select,.it-ov input{padding:9px;border:1px solid #c5cdd9;border-radius:8px;font:inherit;max-width:100%}'+
'.it-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}'+
'.it-card{position:relative;border:1px solid #d9dfe7;border-radius:12px;padding:8px;background:#fff;font-size:12px;line-height:1.45}'+
'.it-th{width:100%;height:120px;object-fit:contain;background:#f4f6f8;border-radius:8px;display:block}'+
'.it-nm{font-weight:700;margin:6px 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.it-bt{display:flex;gap:4px;margin-top:6px}.it-bt button{flex:1;padding:7px 2px;border:1px solid #0b6e5f;border-radius:8px;background:#fff;color:#0b6e5f;font:inherit;font-weight:700;font-size:12px;cursor:pointer}'+
'.it-x{position:absolute;top:4px;right:4px;width:26px;height:26px;border:0;border-radius:50%;background:rgba(15,27,45,.75);color:#fff;cursor:pointer;line-height:1}'+
'.it-opts{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0}.it-opts label,.it-mb label{display:grid;gap:4px;font-weight:600;font-size:14px;flex:1 1 130px}'+
'.it-b{padding:13px 24px;border:0;border-radius:10px;background:#0b6e5f;color:#fff;font:inherit;font-weight:800;cursor:pointer;text-decoration:none;display:inline-block;text-align:center}.it-b:disabled{opacity:.5}.it-b.alt{background:#fff;color:#0b6e5f;border:2px solid #0b6e5f}.it-go{width:100%}'+
'.it-rl{display:grid;gap:10px}.it-rl .it-card{display:flex;gap:10px;align-items:center;font-size:13px}.it-rl img{width:70px;height:70px;object-fit:contain;background:#f4f6f8;border-radius:8px;flex:none}.it-rl .it-b{margin-left:auto;padding:10px 14px}.it-err{color:#b42318;font-weight:600}'+
'.it-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:rgba(15,27,45,.6);display:flex;align-items:center;justify-content:center;padding:8px;font-family:inherit;color:#0f1b2d}'+
'.it-md{background:#fff;width:100%;max-width:560px;max-height:96vh;display:flex;flex-direction:column;border-radius:16px;overflow:hidden}'+
'.it-mh{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #d9dfe7;font-size:18px}.it-mh button{border:0;background:none;font-size:22px;cursor:pointer}'+
'.it-mb{padding:14px 16px;overflow:auto;display:flex;flex-wrap:wrap;gap:12px}.it-full{width:100%}.it-fl{display:flex;flex-wrap:wrap;gap:12px}.it-mf{display:flex;gap:10px;padding:12px 16px;border-top:1px solid #d9dfe7}.it-mf .it-b{flex:1}'+
'.it-st{position:relative;display:inline-block;line-height:0;max-width:100%;touch-action:none;user-select:none;-webkit-user-select:none}.it-st img{max-width:100%;max-height:52vh}'+
'.it-dm{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none}.it-db{position:absolute;box-shadow:0 0 0 9999px rgba(0,0,0,.5)}'+
'.it-cb{position:absolute;border:2px solid #fff;cursor:move;touch-action:none}.it-cb i{position:absolute;width:26px;height:26px;background:#fff;border:3px solid #0b6e5f;border-radius:50%;touch-action:none}'+
'.it-cb i[data-h=nw]{left:-14px;top:-14px}.it-cb i[data-h=ne]{right:-14px;top:-14px}.it-cb i[data-h=sw]{left:-14px;bottom:-14px}.it-cb i[data-h=se]{right:-14px;bottom:-14px}'+
'.it-pc{max-width:100%;max-height:44vh;border-radius:8px;background:#f4f6f8}.it-bt2{display:flex;flex-wrap:wrap;gap:8px}.it-bt2 button{padding:10px 12px;border:1px solid #c5cdd9;border-radius:8px;background:#fff;font:inherit;font-weight:700;cursor:pointer}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var $=function(r,s){return r.querySelector(s)},$$=function(r,s){return [].slice.call(r.querySelectorAll(s))};
function mk(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function blob(c,t,q){return new Promise(function(r){c.toBlob(r,t,q)})}
function kb(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':Math.round(n/1024)+' KB'}
function ext(t){return t.split('/')[1].replace('jpeg','jpg')}
function white(c,t){if(t==='image/jpeg'){var x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-over';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}}
function same(it){return /jpeg|png|webp/.test(it.file.type)?it.file.type:'image/png'}
IT.u={mk:mk,blob:blob,kb:kb,ext:ext,white:white,same:same};
function bdim(it){var o=it.o,c=o.crop||{w:it.w,h:it.h},t=(o.rot||0)%180!==0;return{w:t?c.h:c.w,h:t?c.w:c.h}}
function dim(it){return it.o.rw?{w:it.o.rw,h:it.o.rh}:bdim(it)}
function toU(px){var u=IT.unit;if(u==='px')return Math.round(px)+' px';var i=px/IT.dpi;return(u==='in'?i:u==='cm'?i*2.54:i*25.4).toFixed(1)+' '+u}
/* apply crop, rotate, flip, resize to a fresh canvas */
IT.edit=function(it,noResize){
var o=it.o,c=o.crop||{x:0,y:0,w:it.w,h:it.h},rot=o.rot||0,tilt=rot%180!==0,cw=tilt?c.h:c.w,ch=tilt?c.w:c.h,out=mk(cw,ch),x=out.getContext('2d');
x.translate(cw/2,ch/2);x.rotate(rot*Math.PI/180);x.scale(o.fh?-1:1,o.fv?-1:1);x.drawImage(it.img,c.x,c.y,c.w,c.h,-c.w/2,-c.h/2,c.w,c.h);
if(!noResize&&o.rw&&(o.rw!==cw||o.rh!==ch)){var r=mk(o.rw,o.rh),y=r.getContext('2d');
if(o.fit==='fill'){var s=Math.max(o.rw/cw,o.rh/ch),dw=cw*s,dh=ch*s;y.drawImage(out,(o.rw-dw)/2,(o.rh-dh)/2,dw,dh)}else y.drawImage(out,0,0,o.rw,o.rh);out=r}
return out};
/* minimal store-only ZIP writer */
function crc(u){var t=IT._t;if(!t){t=IT._t=[];for(var n=0,c,k;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}}var c2=-1;for(var i=0;i<u.length;i++)c2=t[(c2^u[i])&255]^(c2>>>8);return(c2^-1)>>>0}
IT.zip=function(files){
var parts=[],cd=[],off=0,cds=0,enc=new TextEncoder();
files.forEach(function(f){var n=enc.encode(f.name),c=crc(f.data),s=f.data.length,l=new DataView(new ArrayBuffer(30)),h=new DataView(new ArrayBuffer(46));
l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x0800,true);l.setUint16(12,0x21,true);l.setUint32(14,c,true);l.setUint32(18,s,true);l.setUint32(22,s,true);l.setUint16(26,n.length,true);
h.setUint32(0,0x02014b50,true);h.setUint16(4,20,true);h.setUint16(6,20,true);h.setUint16(8,0x0800,true);h.setUint16(14,0x21,true);h.setUint32(16,c,true);h.setUint32(20,s,true);h.setUint32(24,s,true);h.setUint16(28,n.length,true);h.setUint32(42,off,true);
parts.push(l,n,f.data);cd.push(h,n);off+=30+n.length+s;cds+=46+n.length});
var e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cds,true);e.setUint32(16,off,true);
return new Blob(parts.concat(cd,[e]),{type:'application/zip'})};
/* popup */
IT.modal=function(title,body,ok,open){
var m=document.createElement('div');m.className='it-ov';
m.innerHTML='<div class="it-md"><div class="it-mh"><b></b><button type="button" data-c>\u2715</button></div><div class="it-mb"></div><div class="it-mf"><button type="button" class="it-b alt" data-c>Cancel</button><button type="button" class="it-b" data-ok>Apply</button></div></div>';
$(m,'b').textContent=title;$(m,'.it-mb').appendChild(body);document.body.appendChild(m);
function close(){if(m.parentNode)m.parentNode.removeChild(m)}
$$(m,'[data-c]').forEach(function(b){b.onclick=close});
$(m,'[data-ok]').onclick=function(){if(ok()!==false)close()};
if(open)open();return m};
function popResize(it,done){
var b=document.createElement('div'),bd=bdim(it),cur=dim(it),pw=cur.w,ph=cur.h,r=cur.w/cur.h;b.className='it-full it-fl';
b.innerHTML='<label>Unit<select class="u"><option>px</option><option>mm</option><option>cm</option><option>in</option></select></label><label>DPI<input class="d" type="number" value="'+IT.dpi+'"></label><label>Width<input class="w" type="number" step="any"></label><label>Height<input class="h" type="number" step="any"></label><label>Scale (%)<input class="s" type="number" placeholder="e.g. 50"></label><label>Fit<select class="f"><option value="s">Stretch</option><option value="fill">Crop to fill</option></select></label><label style="display:flex;align-items:center;gap:8px"><input class="l" type="checkbox" checked style="width:auto"> Keep aspect ratio</label>';
var U=$(b,'.u'),D=$(b,'.d'),W=$(b,'.w'),H=$(b,'.h'),S=$(b,'.s'),F=$(b,'.f'),L=$(b,'.l');
U.value=IT.unit;F.value=it.o.fit==='fill'?'fill':'s';
function k(){return U.value==='in'?1:U.value==='cm'?2.54:25.4}
function cv(v){return U.value==='px'?Math.round(v):+(v/(+D.value||300)*k()).toFixed(2)}
function px(v){return U.value==='px'?v:v/k()*(+D.value||300)}
function put(){W.value=cv(pw);H.value=cv(ph)}put();
W.oninput=function(){pw=px(+W.value);S.value='';if(L.checked){ph=pw/r;H.value=cv(ph)}else ph=px(+H.value)};
H.oninput=function(){ph=px(+H.value);S.value='';if(L.checked){pw=ph*r;W.value=cv(pw)}else pw=px(+W.value)};
S.oninput=function(){pw=bd.w*S.value/100;ph=bd.h*S.value/100;put()};
U.onchange=D.onchange=put;
IT.modal('Resize image',b,function(){var w=Math.round(pw),h=Math.round(ph);if(!(w>0&&h>0)||w>10000||h>10000){alert('Enter a valid size (max 10000 px)');return false}
it.o.rw=w;it.o.rh=h;it.o.fit=F.value;IT.unit=U.value;IT.dpi=+D.value||300;done()})}
function popCrop(it,done){
var b=document.createElement('div');b.className='it-full';
b.innerHTML='<label style="display:grid;gap:4px;font-weight:600;font-size:14px;margin-bottom:8px">Aspect ratio<select class="ar"><option value="">Free</option><option value="1:1">1:1 Square</option><option value="4:3">4:3</option><option value="3:4">3:4</option><option value="16:9">16:9</option><option value="9:16">9:16</option></select></label><div class="it-st"><img alt=""><div class="it-dm"><div class="it-db"></div></div><div class="it-cb"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div><div class="inf" style="font-size:13px;color:#5b6778;margin:6px 0"></div><button type="button" class="it-b alt" data-full style="padding:8px 14px">Reset to full image</button>';
var pv=$(b,'img'),bx=$(b,'.it-cb'),db=$(b,'.it-db'),inf=$(b,'.inf'),W=it.w,H=it.h,R=0,drag=null,MIN=20,oc=it.o.crop,C=oc?{x:oc.x,y:oc.y,w:oc.w,h:oc.h}:{x:W*.1,y:H*.1,w:W*.8,h:H*.8};
function sc(){return pv.clientWidth/W}
function draw(){var s=sc();[bx,db].forEach(function(e){e.style.left=C.x*s+'px';e.style.top=C.y*s+'px';e.style.width=C.w*s+'px';e.style.height=C.h*s+'px'});inf.textContent=Math.round(C.w)+' \u00d7 '+Math.round(C.h)+' px'}
function clamp(){C.w=Math.max(MIN,Math.min(C.w,W));C.h=Math.max(MIN,Math.min(C.h,H));C.x=Math.max(0,Math.min(C.x,W-C.w));C.y=Math.max(0,Math.min(C.y,H-C.h))}
$(b,'.ar').onchange=function(){var p=this.value.split(':');R=this.value?p[0]/p[1]:0;if(R){var w=W*.9,h=w/R;if(h>H*.9){h=H*.9;w=h*R}C={x:(W-w)/2,y:(H-h)/2,w:w,h:h};draw()}};
$(b,'[data-full]').onclick=function(){R=0;$(b,'.ar').value='';C={x:0,y:0,w:W,h:H};draw()};
bx.onpointerdown=function(e){drag={k:e.target.getAttribute('data-h')||'mv',x:e.clientX,y:e.clientY,c:{x:C.x,y:C.y,w:C.w,h:C.h}};bx.setPointerCapture(e.pointerId);e.preventDefault()};
bx.onpointermove=function(e){if(!drag)return;var s=sc(),dx=(e.clientX-drag.x)/s,dy=(e.clientY-drag.y)/s,o=drag.c,k=drag.k;
if(k==='mv'){C={x:o.x+dx,y:o.y+dy,w:o.w,h:o.h};clamp()}else{
var x1=o.x,y1=o.y,x2=o.x+o.w,y2=o.y+o.h,Lf=k.indexOf('w')>-1,T=k.indexOf('n')>-1;
if(Lf)x1=Math.min(o.x+dx,x2-MIN);else x2=Math.max(x2+dx,x1+MIN);
if(T)y1=Math.min(o.y+dy,y2-MIN);else y2=Math.max(y2+dy,y1+MIN);
x1=Math.max(0,x1);y1=Math.max(0,y1);x2=Math.min(W,x2);y2=Math.min(H,y2);
if(R){var w=x2-x1,h=w/R;if(T)y1=y2-h;else y2=y1+h;
if(y1<0){y1=0;h=y2;w=h*R;if(Lf)x1=x2-w;else x2=x1+w}
if(y2>H){y2=H;h=y2-y1;w=h*R;if(Lf)x1=x2-w;else x2=x1+w}}
C={x:x1,y:y1,w:x2-x1,h:y2-y1}}draw()};
bx.onpointerup=bx.onpointercancel=function(){drag=null};
pv.onload=draw;pv.src=it.url;
IT.modal('Crop image',b,function(){var w=Math.round(C.w),h=Math.round(C.h);if(w<1||h<1)return false;
it.o.crop={x:Math.round(C.x),y:Math.round(C.y),w:w,h:h};if(!it.pre){delete it.o.rw;delete it.o.rh}done()},draw)}
function popRot(it,done){
var b=document.createElement('div'),t={rot:it.o.rot||0,fh:!!it.o.fh,fv:!!it.o.fv};b.className='it-full';
b.innerHTML='<div style="text-align:center;margin-bottom:10px"><canvas class="it-pc"></canvas></div><div class="it-bt2"><button type="button" data-k="l">\u21BA Rotate left</button><button type="button" data-k="r">\u21BB Rotate right</button><button type="button" data-k="h">Flip horizontal</button><button type="button" data-k="v">Flip vertical</button><button type="button" data-k="0">Reset</button></div>';
function pr(){var s=it.sm,tilt=t.rot%180!==0,c=$(b,'canvas'),x=c.getContext('2d');c.width=tilt?s.height:s.width;c.height=tilt?s.width:s.height;
x.translate(c.width/2,c.height/2);x.rotate(t.rot*Math.PI/180);x.scale(t.fh?-1:1,t.fv?-1:1);x.drawImage(s,-s.width/2,-s.height/2)}
$$(b,'[data-k]').forEach(function(e){e.onclick=function(){var k=e.getAttribute('data-k');
if(k==='l')t.rot=(t.rot+270)%360;else if(k==='r')t.rot=(t.rot+90)%360;else if(k==='h')t.fh=!t.fh;else if(k==='v')t.fv=!t.fv;else{t.rot=0;t.fh=t.fv=false}pr()}});
IT.modal('Rotate and flip',b,function(){it.o.rot=t.rot;it.o.fh=t.fh;it.o.fv=t.fv;if(!it.pre){delete it.o.rw;delete it.o.rh}done()},pr)}
function mount(el,cfg){
var D=el.dataset,S={items:[]};
el.innerHTML='<div class="it-wrap"><label class="it-drop"><input type="file" accept="image/*" multiple hidden><b>Select images</b>or drop them here</label>'+
'<div class="it-ws" hidden><div class="it-ut">Unit: <select class="un"><option>px</option><option>mm</option><option>cm</option><option>in</option></select><span class="dp" hidden>DPI <input class="dpi" type="number" value="'+IT.dpi+'" style="width:80px"></span></div><div class="it-list"></div><div class="it-opts"></div><button type="button" class="it-b it-go"></button></div>'+
'<div class="it-rs" hidden><div class="it-rl"></div><div class="za" style="margin-top:10px"></div></div></div>';
var inp=$(el,'input[type=file]'),dz=$(el,'.it-drop'),ws=$(el,'.it-ws'),list=$(el,'.it-list'),go=$(el,'.it-go'),rs=$(el,'.it-rs'),rl=$(el,'.it-rl'),un=$(el,'.un'),dpi=$(el,'.dpi'),dp=$(el,'.dp');
$(el,'.it-opts').innerHTML=cfg.options?cfg.options(D):'';go.textContent=D.btn||cfg.btn||'Download';
function R(s){return $(el,s)}
function draw(){list.innerHTML='';
S.items.forEach(function(it,i){var d=dim(it),card=document.createElement('div');card.className='it-card';
card.innerHTML='<button type="button" class="it-x" data-a="x">\u2715</button><canvas class="it-th"></canvas><div class="it-nm"></div><div>Size: '+kb(it.size)+'<br>Width: '+toU(d.w)+'<br>Height: '+toU(d.h)+'</div><div class="it-bt"><button type="button" data-a="r">Resize</button><button type="button" data-a="c">Crop</button><button type="button" data-a="o">Rotate</button></div>';
$(card,'.it-nm').textContent=it.name;
var th=$(card,'canvas'),o=it.o,src=(o.crop||o.rot||o.fh||o.fv)?IT.edit(it,1):it.sm;
th.width=Math.min(src.width,240);th.height=Math.max(1,Math.round(th.width*src.height/src.width));th.getContext('2d').drawImage(src,0,0,th.width,th.height);
card.onclick=function(e){var a=e.target.getAttribute('data-a');if(!a)return;
if(a==='x'){S.items.splice(i,1);draw()}else open(it,a==='r'?'resize':a==='c'?'crop':'rotate')};
list.appendChild(card)});
ws.hidden=!S.items.length;dp.hidden=IT.unit==='px'}
function open(it,k){(k==='crop'?popCrop:k==='rotate'?popRot:popResize)(it,draw)}
un.onchange=function(){IT.unit=un.value;draw()};dpi.onchange=function(){IT.dpi=+dpi.value||300;draw()};
function load(f){return new Promise(function(ok){var im=new Image(),url=URL.createObjectURL(f);
im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,m=Math.min(1,700/Math.max(w,h)),sm=mk(w*m,h*m);sm.getContext('2d').drawImage(im,0,0,sm.width,sm.height);
var it={file:f,url:url,img:im,w:w,h:h,name:f.name,size:f.size,o:{},sm:sm,pre:!!(D.w&&D.h)};
if(it.pre){it.o.rw=+D.w;it.o.rh=+D.h;it.o.fit='fill'}ok(it)};
im.onerror=function(){ok(null)};im.src=url})}
async function pick(files){
var a=[].filter.call(files,function(f){return f.type.indexOf('image/')===0}),first=!S.items.length;
for(var i=0;i<a.length;i++){var it=await load(a[i]);if(it)S.items.push(it)}
un.value=IT.unit;draw();rs.hidden=true;
if(first&&D.open&&S.items.length)open(S.items[0],D.open)}
inp.onchange=function(){pick(inp.files);inp.value=''};
['dragover','dragenter'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.add('over')})});
['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.remove('over')})});
dz.addEventListener('drop',function(v){pick(v.dataTransfer.files)});
go.onclick=async function(){
if(!S.items.length)return;var lbl=go.textContent,res=[];go.disabled=true;rl.innerHTML='';
try{for(var i=0;i<S.items.length;i++){go.textContent='Working... '+(i+1)+'/'+S.items.length;var it=S.items[i],r=await cfg.run(IT.edit(it),it,R,D);r.it=it;res.push(r)}show(res)}
catch(e){rl.innerHTML='<p class="it-err"></p>';$(rl,'p').textContent=e.message||String(e);rs.hidden=false}
go.disabled=false;go.textContent=lbl};
function show(res){
rl.innerHTML='';var za=$(el,'.za'),seen={},files=[],tot=0;za.innerHTML='';
res.forEach(function(r){var base=r.it.name.replace(/\.[^.]+$/,'')+'-'+r.suffix,nm=base+'.'+ext(r.type);
if(seen[nm]){seen[nm]++;nm=base+'-'+seen[nm]+'.'+ext(r.type)}else seen[nm]=1;
r.nm=nm;tot+=r.blob.size;var u=URL.createObjectURL(r.blob),c=document.createElement('div');c.className='it-card';
c.innerHTML=(r.type.indexOf('image/')===0?'<img alt="">':'')+'<div><b class="n"></b><br>'+kb(r.it.size)+' \u2192 <b>'+kb(r.blob.size)+'</b></div><a class="it-b">Download</a>';
$(c,'.n').textContent=nm;var im=$(c,'img');if(im)im.src=u;var a=$(c,'a');a.href=u;a.download=nm;rl.appendChild(c)});
if(res.length>1){var z=document.createElement('button');z.type='button';z.className='it-b alt it-go';z.textContent='Download all (ZIP)';
z.onclick=async function(){z.disabled=true;var f=[];for(var i=0;i<res.length;i++)f.push({name:res[i].nm,data:new Uint8Array(await res[i].blob.arrayBuffer())});
var u=URL.createObjectURL(IT.zip(f)),a=document.createElement('a');a.href=u;a.download='images.zip';document.body.appendChild(a);a.click();a.remove();z.disabled=false};za.appendChild(z)}
rs.hidden=false;rs.scrollIntoView&&rs.scrollIntoView({behavior:'smooth'})}
}
IT.register=function(id,cfg){IT.tools[id]=cfg;$$(document,'[data-tool="'+id+'"]').forEach(function(el){if(!el._it){el._it=1;mount(el,cfg);el.setAttribute('data-it',id);el.removeAttribute('data-tool')}})};
})();
