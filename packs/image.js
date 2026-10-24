/* tool-engine image pack v3: all image tools, every tool can download as JPG, JPEG, PNG or WebP. Needs the template core (window.IT). */
(function(){
var IT=window.IT;if(!IT||!IT.register)return;
var U=IT.u,mk=U.mk,blob=U.blob,white=U.white,same=U.same;
var FM={jpg:['image/jpeg','jpg'],jpeg:['image/jpeg','jpeg'],png:['image/png','png'],webp:['image/webp','webp']},NM={'':'Same as original',jpg:'JPG',jpeg:'JPEG',png:'PNG',webp:'WebP'},MV={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
function val(R,n){var e=R('[name='+n+']');return e?e.value.trim():''}
function Q(v){return '<label>Quality (%)<input name="q" type="range" min="10" max="100" value="'+v+'"></label>'}
function qv(R){var e=R('[name=q]');return e?e.value/100:.92}
function FMT(d,def,list){var v=MV[d.output]||d.out||def;list=list||['','jpg','jpeg','png','webp'];return '<label>Download as<select name="of">'+list.map(function(k){return '<option value="'+k+'"'+(k===v?' selected':'')+'>'+NM[k]+(k==='jpg'||k==='jpeg'?' (.'+k+')':'')+'</option>'}).join('')+'</select></label>'}
function fixT(r){if(r.blob&&r.blob.type&&r.type&&r.blob.type!==r.type&&/^image\//.test(r.blob.type)){r.note='Your browser cannot save '+r.ext.toUpperCase()+', so this file was saved as '+U.ext(r.blob.type).toUpperCase()+'.';r.type=r.blob.type;r.ext=U.ext(r.type)}return r}
function pick(R,it,def){var v=val(R,'of');if(v&&FM[v])return FM[v];if(def&&FM[def]&&!v&&def!=='same')return FM[def];var t=same(it);return[t,U.ext(t)]}
async function enc(c,f,R,suffix){var t=f[0],d=mk(c.width,c.height);d.getContext('2d').drawImage(c,0,0);white(d,t);return fixT({blob:await blob(d,t,qv(R)),type:t,suffix:suffix,ext:f[1]})}
function ab(b){return b.arrayBuffer?b.arrayBuffer():new Promise(function(r){var f=new FileReader();f.onload=function(){r(f.result)};f.readAsArrayBuffer(b)})}
function dr(c,s,t){var d=mk(c.width*s,c.height*s);d.getContext('2d').drawImage(c,0,0,d.width,d.height);white(d,t);return d}
/* ---- compress ---- */
IT.register('image/compress',{btn:'Compress now',
options:function(d){return '<label>Target size<input name="tk" type="number" min="1" value="'+(d.target||'')+'" placeholder="e.g. 200"></label><label>Unit<select name="tu"><option>KB</option><option>MB</option></select></label>'+Q(70)+FMT(d,'jpg',['jpg','jpeg','webp','png'])},
run:async function(c,it,R){var f=FM[val(R,'of')||'jpg'],t=f[0],tk=+val(R,'tk')*(val(R,'tu')==='MB'?1048576:1024),s=1,b;
if(!tk)b=await blob(dr(c,1,t),t,qv(R));
else if(t==='image/png'){for(var k=0;k<9;k++){b=await blob(dr(c,s,t),t);if(b.size<=tk)break;s*=.85}}
else{for(var k2=0;k2<8;k2++){var cc=dr(c,s,t),lo=.1,hi=.95;for(var i=0;i<7;i++){var m=(lo+hi)/2;b=await blob(cc,t,m);if(b.size>tk)hi=m;else lo=m}b=await blob(cc,t,lo);if(b.size<=tk)break;s*=.85}}
return fixT({blob:b,type:t,suffix:'compressed',ext:f[1]})}});
/* ---- convert (also the "image to JPG / PNG / WebP" pages) ---- */
IT.register('image/convert',{btn:'Convert now',
options:function(d){var f=d.format,l=!f?['jpg','jpeg','png','webp']:f==='image/jpeg'?['jpg','jpeg']:[];return (l.length?FMT(d,l[0],l):'')+(f==='image/png'?'':Q(90))},
run:async function(c,it,R,D){var v=val(R,'of')||MV[D.format]||'jpg';return enc(c,FM[v],R,'converted')}});
/* ---- resize, crop, rotate (the popups do the work) ---- */
IT.register('image/edit',{btn:'Download',
options:function(d){return '<div style="width:100%;font-size:13px;color:#5b6778">Use Resize, Crop and Rotate on each image above, then download.</div>'+FMT(d,'')+Q(90)},
run:async function(c,it,R){return enc(c,pick(R,it),R,'edited')}});
/* ---- black and white ---- */
IT.register('image/gray',{btn:'Make black and white',
options:function(d){return FMT(d,'')+Q(92)},
run:async function(c,it,R){var d=mk(c.width,c.height),x=d.getContext('2d');x.drawImage(c,0,0);var g=x.getImageData(0,0,d.width,d.height),p=g.data;for(var i=0;i<p.length;i+=4){var v=p[i]*.299+p[i+1]*.587+p[i+2]*.114;p[i]=p[i+1]=p[i+2]=v}x.putImageData(g,0,0);return enc(d,pick(R,it),R,'bw')}});
/* ---- remove EXIF ---- */
IT.register('image/exif',{btn:'Remove metadata',
options:function(d){return '<div style="width:100%;font-size:13px;color:#5b6778">The photo is saved again from its pixels only, so location, camera and date info are removed.</div>'+FMT(d,'')+Q(95)},
run:async function(c,it,R){return enc(c,pick(R,it),R,'clean')}});
/* ---- watermark ---- */
IT.register('image/watermark',{btn:'Add watermark',
options:function(d){return '<label>Text<input name="t" value="\u00A9 mysite.com"></label><label>Logo image (optional)<input name="lg" type="file" accept="image/*"></label><label>Size (%)<input name="z" type="number" value="5" min="1" max="60"></label><label>Opacity (%)<input name="o" type="number" value="50" min="5" max="100"></label><label>Position<select name="p"><option value="br">Bottom right</option><option value="bl">Bottom left</option><option value="c">Center</option><option value="tr">Top right</option><option value="tl">Top left</option></select></label>'+FMT(d,'')+Q(92)},
run:async function(c,it,R){var d=mk(c.width,c.height),x=d.getContext('2d');x.drawImage(c,0,0);var z=+val(R,'z')||5,p=val(R,'p'),o=(+val(R,'o')||50)/100,m=c.width*.02,lg=R('[name=lg]'),lf=lg&&lg.files&&lg.files[0];x.globalAlpha=o;
function pos(w,h){return[p.indexOf('l')>-1?m:p==='c'?(c.width-w)/2:c.width-w-m,p==='c'?(c.height-h)/2:p.charAt(0)==='t'?m:c.height-h-m]}
if(lf){var im=await new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){no(new Error('Could not read the logo image.'))};i.src=URL.createObjectURL(lf)}),w=c.width*z/100,h=w*im.naturalHeight/im.naturalWidth,q=pos(w,h);x.drawImage(im,q[0],q[1],w,h)}
else{var s=val(R,'t');if(!s)throw new Error('Enter the watermark text or choose a logo.');var f=Math.max(8,Math.round(c.width*z/100));x.font='800 '+f+'px sans-serif';x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=f/12;x.textBaseline='top';var tw=x.measureText(s).width,q2=pos(tw,f);x.strokeText(s,q2[0],q2[1]);x.fillText(s,q2[0],q2[1])}
x.globalAlpha=1;return enc(d,pick(R,it),R,'watermark')}});
/* ---- circle crop ---- */
IT.register('image/circle',{btn:'Crop to circle',
options:function(d){return '<label>Size (px)<input name="s" type="number" value="512" min="32" max="4000"></label>'+FMT(d,'png',['png','webp','jpg','jpeg'])+Q(92)},
run:async function(c,it,R){var s=+val(R,'s')||512,m=Math.min(c.width,c.height),d=mk(s,s),x=d.getContext('2d');x.beginPath();x.arc(s/2,s/2,s/2,0,7);x.clip();x.drawImage(c,(c.width-m)/2,(c.height-m)/2,m,m,0,0,s,s);return enc(d,FM[val(R,'of')||'png'],R,'circle')}});
/* ---- photo and signature resizer (exact pixels and max KB) ---- */
IT.register('image/exact',{btn:'Resize now',
options:function(d){return '<label>Preset<select name="pr"><option value="">Custom</option><option value="200x230">Photo 200x230</option><option value="100x120">Photo 100x120</option><option value="140x60">Signature 140x60</option><option value="300x300">300x300</option><option value="413x531">35x45 mm (413x531)</option><option value="600x600">600x600</option></select></label><label>Width (px)<input name="w" type="number" min="1" value="'+(d.sw||200)+'"></label><label>Height (px)<input name="h" type="number" min="1" value="'+(d.sh||230)+'"></label><label>Max file size (KB), optional<input name="mk" type="number" min="5" placeholder="e.g. 50"></label><label>Fit<select name="ft"><option value="c">Crop to fill (no stretch)</option><option value="s">Stretch</option><option value="p">Fit with white padding</option></select></label>'+FMT(d,'jpg',['jpg','jpeg','webp','png'])},
init:function(R){R('[name=pr]').onchange=function(){if(!this.value)return;var p=this.value.split('x');R('[name=w]').value=p[0];R('[name=h]').value=p[1]}},
run:async function(c,it,R){var w=+val(R,'w'),h=+val(R,'h'),mk2=+val(R,'mk')*1024,ft=val(R,'ft'),f=FM[val(R,'of')||'jpg'],t=f[0];if(!w||!h)throw new Error('Enter width and height.');if(w>8000||h>8000)throw new Error('Maximum size is 8000 px.');
var d=mk(w,h),x=d.getContext('2d'),W=c.width,H=c.height;x.fillStyle='#fff';x.fillRect(0,0,w,h);
if(ft==='s')x.drawImage(c,0,0,w,h);else{var s=ft==='c'?Math.max(w/W,h/H):Math.min(w/W,h/H),dw=W*s,dh=H*s;x.drawImage(c,(w-dw)/2,(h-dh)/2,dw,dh)}
var b;if(!mk2)b=await blob(d,t,.92);
else{if(t==='image/png')throw new Error('Max file size works with JPG, JPEG and WebP. Please choose one of them.');var lo=.05,hi=.95;for(var i=0;i<8;i++){var m=(lo+hi)/2;b=await blob(d,t,m);if(b.size>mk2)hi=m;else lo=m}b=await blob(d,t,lo);if(b.size>mk2)throw new Error('Cannot reach '+val(R,'mk')+' KB at this size. Use a smaller width and height or a higher limit.')}
return fixT({blob:b,type:t,suffix:w+'x'+h,ext:f[1]})}});
/* ---- images to PDF ---- */
function mkpdf(P){var parts=[],off=0,offs=[],n=P.length,kids=[],i;function add(s){var b=typeof s==='string'?new TextEncoder().encode(s):s;parts.push(b);off+=b.length}function obj(id,s){offs[id]=off;add(id+' 0 obj\n'+s+'\nendobj\n')}
add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');for(i=0;i<n;i++)kids.push((3+3*i)+' 0 R');obj(2,'<</Type/Pages/Count '+n+'/Kids['+kids.join(' ')+']>>');
P.forEach(function(p,i){var pg=3+3*i,cs='q '+p.dw.toFixed(2)+' 0 0 '+p.dh.toFixed(2)+' '+p.dx.toFixed(2)+' '+p.dy.toFixed(2)+' cm /I Do Q';
obj(pg,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+p.pw+' '+p.ph+']/Contents '+(pg+1)+' 0 R/Resources<</XObject<</I '+(pg+2)+' 0 R>>>>>>');obj(pg+1,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');
offs[pg+2]=off;add((pg+2)+' 0 obj\n<</Type/XObject/Subtype/Image/Width '+p.w+'/Height '+p.h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+p.d.length+'>>\nstream\n');add(p.d);add('\nendstream\nendobj\n')});
var xr=off,tot=3+3*n,s='xref\n0 '+tot+'\n0000000000 65535 f \n';for(var id=1;id<tot;id++)s+=('0000000000'+offs[id]).slice(-10)+' 00000 n \n';add(s+'trailer\n<</Size '+tot+'/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');return new Blob(parts,{type:'application/pdf'})}
IT.register('image/to-pdf',{btn:'Create PDF',order:true,
options:function(){return '<label>Page size<select name="ps"><option value="img">Same as image</option><option value="a4">A4</option><option value="lt">Letter</option></select></label><label>Margin (mm, for A4 and Letter)<input name="mg" type="number" value="10" min="0" max="40"></label>'+Q(85)},
runAll:async function(items,R,D,P){var ps=val(R,'ps'),mg=(+val(R,'mg')||0)*72/25.4,pages=[];
for(var k=0;k<items.length;k++){P('Page '+(k+1)+'/'+items.length);var c=IT.edit(items[k]),m=Math.min(1,2000/Math.max(c.width,c.height)),cc=mk(c.width*m,c.height*m),x=cc.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cc.width,cc.height);x.drawImage(c,0,0,cc.width,cc.height);
var b=await blob(cc,'image/jpeg',qv(R)),d=new Uint8Array(await ab(b)),pw,ph,dx=0,dy=0,dw,dh;
if(ps==='img'){pw=dw=Math.round(cc.width*.75);ph=dh=Math.round(cc.height*.75)}else{var land=cc.width>cc.height,B=ps==='a4'?[595,842]:[612,792];pw=land?B[1]:B[0];ph=land?B[0]:B[1];var sc=Math.min((pw-2*mg)/cc.width,(ph-2*mg)/cc.height);dw=cc.width*sc;dh=cc.height*sc;dx=(pw-dw)/2;dy=(ph-dh)/2}
pages.push({w:cc.width,h:cc.height,d:d,pw:pw,ph:ph,dx:dx,dy:dy,dw:dw,dh:dh})}
return[{blob:mkpdf(pages),type:'application/pdf',name:'images.pdf',ext:'pdf',note:items.length+' page'+(items.length>1?'s':'')}]}});
})();
/* ---- v3 studio tools: background remover and passport photo studio (custom canvas UI) ---- */
(function(){
var IT=window.IT,U=IT.u||{};
var mk=U.mk||function(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
var blob=U.blob||function(c,t,q){return new Promise(function(r){c.toBlob(r,t,q)})};
var css='.sx{max-width:980px;margin:0 auto;color:var(--ink,#0f1b2d);font-family:inherit}.sx *{box-sizing:border-box}.sx [hidden]{display:none!important}'+
'.sx-app{display:grid;grid-template-columns:1fr 310px;gap:14px;margin-top:8px}@media(max-width:820px){.sx-app{grid-template-columns:1fr}}'+
'.sx-stage{position:relative;background:var(--paper,#f4f6f8);border:1px solid var(--line,#d9dfe7);border-radius:14px;padding:10px;display:flex;justify-content:center;align-items:center;min-height:280px}'+
'.sx-board{position:relative;display:inline-block;line-height:0;max-width:100%;background:repeating-conic-gradient(#c9d1dc 0 25%,#fff 0 50%) 0 0/16px 16px}'+
'.sx canvas{max-width:100%;max-height:66vh;touch-action:none}.sx-brush{cursor:none}.sx-pp{cursor:grab;background:#fff;box-shadow:0 2px 14px rgba(0,0,0,.2)}'+
'.sx-cur{position:absolute;pointer-events:none;border:2px solid #fff;outline:1px solid #000;border-radius:50%;display:none}'+
'.sx-busy{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(15,27,45,.72);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;border-radius:14px;font-weight:600}'+
'.sx-box{border:1px solid var(--line,#d9dfe7);background:var(--card,#fff);border-radius:12px;padding:12px;margin-bottom:12px}.sx-box h4{margin:0 0 8px;font-size:15px}.sx-box>*+*{margin-top:10px}.sx-box>*+h4{margin-top:16px}'+
'.sx-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.sx-row>*{flex:1}'+
'.sx-s{padding:9px 10px;border:1px solid var(--line,#d9dfe7);border-radius:8px;background:var(--paper,#f4f6f8);color:var(--ink,#0f1b2d);font:inherit;font-weight:600;font-size:14px;cursor:pointer}.sx-s:hover{border-color:var(--accent,#0b6e5f)}.sx-s.on{border-color:var(--accent,#0b6e5f);box-shadow:inset 0 0 0 1px var(--accent,#0b6e5f);color:var(--accent,#0b6e5f)}'+
'.sx-sw{flex:none!important;width:32px;height:32px;padding:0;border-radius:50%}'+
'.sx label.sx-f{display:grid;gap:4px;font-size:13px;font-weight:600;color:var(--muted,#5b6778)}.sx select,.sx input[type=number]{padding:9px;border:1px solid var(--line,#c5cdd9);border-radius:8px;font:inherit;background:var(--card,#fff);color:var(--ink,#0f1b2d);width:100%}'+
'.sx input[type=range]{width:100%;accent-color:var(--accent,#0b6e5f)}.sx input[type=color]{flex:none;width:44px;height:34px;padding:0;border:1px solid var(--line,#c5cdd9);border-radius:8px;background:none}'+
'.sx-tabs{display:flex;gap:6px;margin-bottom:10px}.sx-tabs .sx-s{flex:1}.sx-note{font-size:12.5px;color:var(--muted,#5b6778);line-height:1.5}.sx-wide{width:100%}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function tool(id,html,init){[].forEach.call(document.querySelectorAll('[data-it-tool="'+id+'"]'),function(el){
 if(el._it)return;el._it=1;el.innerHTML='<div class="sx">'+html+'</div>';var root=el.firstChild;
 init(function(s){return root.querySelector(s)},root);el.setAttribute('data-it',id);el.removeAttribute('data-it-tool')})}
var DROP='<label class="it-drop"><input type="file" accept="image/*" hidden><b>Select image</b><span>or drop it here</span></label>';
function dropInit(R,cb){var dz=R('.it-drop'),f=R('input[type=file]');
 f.onchange=function(){if(f.files[0])cb(f.files[0]);f.value=''};
 ['dragover','dragenter'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.add('over')})});
 ['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.remove('over')})});
 dz.addEventListener('drop',function(v){var g=v.dataTransfer.files[0];if(g&&g.type.indexOf('image/')===0)cb(g)})}
function readImg(file){return new Promise(function(ok,no){var im=new Image();im.onload=function(){var s=Math.min(1,2000/Math.max(im.width,im.height)),c=mk(im.width*s,im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c)};im.onerror=function(){no(new Error('Could not read this image'))};im.src=URL.createObjectURL(file)})}
var BGJS=['https://digitalhelpxyz.github.io/tool-engine/packs/bgremove.v1.js','https://cdn.jsdelivr.net/gh/digitalhelpxyz/tool-engine@main/packs/bgremove.v1.js'],DATA=['','https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/'];
function loadJS(u){return new Promise(function(ok,no){var e=document.createElement('script');e.src=u;e.onload=ok;e.onerror=function(){no(new Error('Could not load '+u))};document.head.appendChild(e)})}
function engine(){if(window.__imglyRB)return Promise.resolve(window.__imglyRB);
 return BGJS.reduce(function(p,u){return p.catch(function(){return window.__imglyRB?0:loadJS(u)})},Promise.reject()).then(function(){if(!window.__imglyRB)throw new Error('AI engine file not found');return window.__imglyRB})}
function ai(canvas,say){say('Loading the AI model. The first time can take up to a minute.');
 return engine().then(function(fn){return blob(canvas,'image/png').then(function(b){var i=0;
  function go(){var o={progress:function(k,c,t){if(t)say('Removing background: '+Math.round(c/t*100)+'%')}};if(DATA[i])o.publicPath=DATA[i];return fn(b,o).catch(function(e){if(++i<DATA.length){say('Trying another server...');return go()}throw e})}
  return go()})})
 .then(function(o){return new Promise(function(ok,no){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){no(new Error('Bad AI result'))};im.src=URL.createObjectURL(o)})})}
function plain(src,tol){var w=src.width,h=src.height,c=mk(w,h),x=c.getContext('2d');x.drawImage(src,0,0);var im=x.getImageData(0,0,w,h),d=im.data,r=0,g=0,b=0,n=0,i,j;
 function add(k){r+=d[k];g+=d[k+1];b+=d[k+2];n++}
 for(i=0;i<w;i++){add(i*4);add(((h-1)*w+i)*4)}for(j=0;j<h;j++){add(j*w*4);add((j*w+w-1)*4)}
 r/=n;g/=n;b/=n;var T=tol*tol*3,seen=new Uint8Array(w*h),st=new Int32Array(w*h),sp=0;
 function ok(p){var k=p*4,a=d[k]-r,e=d[k+1]-g,f=d[k+2]-b;return a*a+e*e+f*f<=T}
 function push(p){if(!seen[p]&&ok(p)){seen[p]=1;st[sp++]=p}}
 for(i=0;i<w;i++){push(i);push((h-1)*w+i)}for(j=0;j<h;j++){push(j*w);push(j*w+w-1)}
 while(sp){var p=st[--sp],px=p%w;if(px>0)push(p-1);if(px<w-1)push(p+1);if(p>=w)push(p-w);if(p<w*h-w)push(p+w)}
 for(i=0;i<w*h;i++)if(seen[i])d[i*4+3]=0;
 for(i=0;i<w*h;i++)if(!seen[i]){var px2=i%w;if((px2>0&&seen[i-1])||(px2<w-1&&seen[i+1])||(i>=w&&seen[i-w])||(i<w*h-w&&seen[i+w]))d[i*4+3]=140}
 x.putImageData(im,0,0);return c}
var FMT={png:['image/png','png'],jpg:['image/jpeg','jpg'],jpeg:['image/jpeg','jpeg'],webp:['image/webp','webp']};
var FOPT='<option value="png">PNG</option><option value="jpg">JPG (.jpg)</option><option value="jpeg">JPEG (.jpeg)</option><option value="webp">WebP</option>';
function save(c,fmt,name,maxKB){var f=FMT[fmt],t=f[0],o=c;
 if(t==='image/jpeg'){o=mk(c.width,c.height);var x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(c,0,0)}
 var go=function(q){return blob(o,t,q)},p;
 if(maxKB&&t!=='image/png'){p=(async function(){var lo=.05,hi=.95,b;for(var i=0;i<8;i++){var m=(lo+hi)/2;b=await go(m);if(b.size>maxKB*1024)hi=m;else lo=m}b=await go(lo);if(b.size>maxKB*1024)throw new Error('Cannot reach '+maxKB+' KB. Use a higher limit.');return b})()}
 else p=go(.95);
 return p.then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name+'.'+f[1];document.body.appendChild(a);a.click();a.remove()})}

/* ---------- Background remover ---------- */
tool('image/remove-bg',DROP+'<div class="sx-app" hidden><div class="sx-stage"><div class="sx-board"><canvas class="sx-brush"></canvas><div class="sx-cur"></div></div><div class="sx-busy" hidden></div></div><div>'+
'<div class="sx-box"><button type="button" class="it-b it-go" data-a="ai">Remove background (AI)</button><button type="button" class="sx-s sx-wide" data-a="plain">Plain background (no AI)</button><label class="sx-f">Plain background strength<input type="range" class="tl" min="5" max="120" value="45"></label><div class="sx-row"><button type="button" class="sx-s" data-a="undo">Undo</button><button type="button" class="sx-s" data-a="redo">Redo</button><button type="button" class="sx-s" data-a="cmp">Hold: original</button></div></div>'+
'<div class="sx-box"><h4>Brush</h4><div class="sx-row"><button type="button" class="sx-s on" data-m="erase">Erase object</button><button type="button" class="sx-s" data-m="keep">Restore</button></div><label class="sx-f">Brush size <input type="range" class="bs" min="5" max="150" value="40"></label></div>'+
'<div class="sx-box"><h4>Background</h4><div class="sx-row sw"></div><div class="sx-row"><button type="button" class="sx-s" data-a="none">Transparent</button><input type="color" class="cc" value="#ffffff" aria-label="Custom color"><label class="sx-s" style="text-align:center">Image<input type="file" class="bi" accept="image/*" hidden></label></div></div>'+
'<div class="sx-box"><h4>Download</h4><label class="sx-f">Format<select class="of">'+FOPT+'</select></label><button type="button" class="it-b it-go" data-a="dl">Download</button><button type="button" class="it-b alt it-go" data-a="new">New image</button><p class="sx-note">PNG and WebP keep transparency. JPG fills empty areas with white.</p></div></div></div>',
function(R,root){
 var cv=R('canvas'),ctx=cv.getContext('2d'),app=R('.sx-app'),dz=R('.it-drop'),cur=R('.sx-cur'),W,H,orig,cut,bg={t:'none'},bgImg,mode='erase',size=40,hist=[],redo=[],showO=false,drawing=false,last,busy=false;
 function say(t){var b=R('.sx-busy');b.hidden=!t;b.textContent=t||''}
 function comp(c){var x=c.getContext('2d');x.clearRect(0,0,W,H);
  if(bg.t==='color'){x.fillStyle=bg.v;x.fillRect(0,0,W,H)}
  else if(bg.t==='img'){var s=Math.max(W/bgImg.width,H/bgImg.height),w=bgImg.width*s,h=bgImg.height*s;x.drawImage(bgImg,(W-w)/2,(H-h)/2,w,h)}
  x.drawImage(cut,0,0)}
 function render(){if(showO){ctx.clearRect(0,0,W,H);ctx.drawImage(orig,0,0)}else comp(cv)}
 function snap(){hist.push(cut.getContext('2d').getImageData(0,0,W,H));if(hist.length>12)hist.shift();redo=[]}
 function run(){if(busy)return;busy=true;ai(orig,say).then(function(im){snap();var x=cut.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(im,0,0,W,H);render()})
  .catch(function(e){alert('The AI could not run: '+(e&&e.message||'unknown error')+'. Check your internet connection, or use the Plain background button.')}).then(function(){busy=false;say('')})}
 dropInit(R,function(f){readImg(f).then(function(c){orig=c;W=c.width;H=c.height;cut=mk(W,H);cut.getContext('2d').drawImage(orig,0,0);cv.width=W;cv.height=H;hist=[];redo=[];bg={t:'none'};
  dz.hidden=true;app.hidden=false;render();run()}).catch(function(e){alert(e.message)})});
 function pt(e){var r=cv.getBoundingClientRect(),k=W/r.width;return{x:(e.clientX-r.left)*k,y:(e.clientY-r.top)*k,sx:e.clientX-r.left,sy:e.clientY-r.top,k:k}}
 function stroke(a,b){var x=cut.getContext('2d');x.save();x.lineCap=x.lineJoin='round';x.lineWidth=size*b.k;
  if(mode==='erase'){x.globalCompositeOperation='destination-out';x.strokeStyle='#000'}else x.strokeStyle=x.createPattern(orig,'no-repeat');
  x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.restore();render()}
 function cursor(p){cur.style.display='block';cur.style.width=cur.style.height=size+'px';cur.style.left=(p.sx-size/2)+'px';cur.style.top=(p.sy-size/2)+'px'}
 cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);snap();drawing=true;last=pt(e);stroke(last,last);cursor(last)});
 cv.addEventListener('pointermove',function(e){var p=pt(e);cursor(p);if(drawing){stroke(last,p);last=p}});
 cv.addEventListener('pointerup',function(){drawing=false});cv.addEventListener('pointerleave',function(){cur.style.display='none'});
 R('.bs').oninput=function(){size=+this.value};
 [].forEach.call(root.querySelectorAll('[data-m]'),function(b){b.onclick=function(){mode=b.dataset.m;[].forEach.call(root.querySelectorAll('[data-m]'),function(o){o.classList.toggle('on',o===b)})}});
 ['#ffffff','#000000','#e11d48','#2563eb','#16a34a','#facc15','#94a3b8'].forEach(function(c){var b=document.createElement('button');b.type='button';b.className='sx-s sx-sw';b.style.background=c;b.setAttribute('aria-label','Background '+c);b.onclick=function(){bg={t:'color',v:c};render()};R('.sw').appendChild(b)});
 R('.cc').oninput=function(){bg={t:'color',v:this.value};render()};
 R('.bi').onchange=function(){var f=this.files[0];if(!f)return;var im=new Image();im.onload=function(){bgImg=im;bg={t:'img'};render()};im.src=URL.createObjectURL(f)};
 var A={ai:run,plain:function(){snap();var r=plain(orig,+R('.tl').value),x=cut.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(r,0,0);render()},none:function(){bg={t:'none'};render()},
  undo:function(){if(!hist.length)return;var x=cut.getContext('2d');redo.push(x.getImageData(0,0,W,H));x.putImageData(hist.pop(),0,0);render()},
  redo:function(){if(!redo.length)return;var x=cut.getContext('2d');hist.push(x.getImageData(0,0,W,H));x.putImageData(redo.pop(),0,0);render()},
  dl:function(){var o=mk(W,H);comp(o);save(o,R('.of').value,'background-removed').catch(function(e){alert(e.message)})},
  'new':function(){app.hidden=true;dz.hidden=false}};
 [].forEach.call(root.querySelectorAll('[data-a]'),function(b){var a=b.dataset.a;if(a==='cmp'){b.addEventListener('pointerdown',function(){showO=true;render()});['pointerup','pointerleave'].forEach(function(n){b.addEventListener(n,function(){if(showO){showO=false;render()}})})}else b.onclick=A[a]})
});

/* ---------- Passport photo studio ---------- */
var SZ=[['India, 35 x 45 mm',35,45],['USA, 2 x 2 inch',50.8,50.8],['UK, 35 x 45 mm',35,45],['Canada, 50 x 70 mm',50,70],['Schengen / EU, 35 x 45 mm',35,45],['Australia, 35 x 45 mm',35,45],['China, 33 x 48 mm',33,48],['Japan, 35 x 45 mm',35,45],['Saudi Arabia, 40 x 60 mm',40,60],['UAE, 43 x 55 mm',43,55],['Pakistan, 35 x 45 mm',35,45],['Bangladesh, 40 x 50 mm',40,50],['Custom size',0,0]];
tool('image/passport',DROP+'<div class="sx-app" hidden><div class="sx-stage"><canvas class="sx-pp"></canvas><div class="sx-busy" hidden></div></div><div>'+
'<div class="sx-tabs"><button type="button" class="sx-s on" data-s="1">1 Size and crop</button><button type="button" class="sx-s" data-s="2">2 Background</button><button type="button" class="sx-s" data-s="3">3 Download</button></div>'+
'<div class="sx-box" data-p="1"><label class="sx-f">Country and photo size<select class="ct">'+SZ.map(function(s,i){return '<option value="'+i+'">'+s[0]+'</option>'}).join('')+'</select></label>'+
'<div class="sx-row cu" hidden><label class="sx-f">Width (mm)<input type="number" class="cw" value="35" min="10" max="100"></label><label class="sx-f">Height (mm)<input type="number" class="ch" value="45" min="10" max="150"></label></div>'+
'<label class="sx-f">Zoom (resize)<input type="range" data-k="zoom" min="0.5" max="3" step="0.01" value="1"></label><label class="sx-f">Rotate<input type="range" data-k="rot" min="-45" max="45" step="0.5" value="0"></label>'+
'<label class="sx-f">Move up and down<input type="range" data-k="oy" min="-0.5" max="0.5" step="0.005" value="0"></label><label class="sx-f">Move left and right<input type="range" data-k="ox" min="-0.5" max="0.5" step="0.005" value="0"></label>'+
'<p class="sx-note">You can also drag the photo. Keep the face inside the dotted guide. The guide is not part of the download.</p><button type="button" class="it-b it-go" data-g="2">Next: background</button></div>'+
'<div class="sx-box" data-p="2" hidden><button type="button" class="it-b it-go rm">Remove background (AI)</button><button type="button" class="sx-s sx-wide pl">Plain background (no AI)</button><label class="sx-f">Plain background strength<input type="range" class="tl" min="5" max="120" value="45"></label><button type="button" class="sx-s sx-wide ko">Keep original background</button><div class="sx-note">Fill color</div><div class="sx-row sw"></div><div class="sx-row"><input type="color" class="fc" value="#ffffff" aria-label="Custom fill color"></div><p class="sx-note">The fill color shows only after the background is removed.</p><button type="button" class="it-b it-go" data-g="3">Next: download</button></div>'+
'<div class="sx-box" data-p="3" hidden><h4>Single photo</h4><div class="sx-row"><label class="sx-f">Format<select class="of">'+FOPT.replace('value="png">PNG','value="png">PNG').replace(/^/,'')+'</select></label><label class="sx-f">Max size (KB)<input type="number" class="mk" min="10" placeholder="No limit"></label></div><button type="button" class="it-b it-go d1">Download photo</button>'+
'<h4>Print sheet</h4><div class="sx-row"><label class="sx-f">Paper<select class="pp"><option value="4x6">4 x 6 inch</option><option value="5x7">5 x 7 inch</option><option value="a4">A4</option></select></label><label class="sx-f">Copies<select class="cp"><option value="0">Fill the sheet</option><option>4</option><option>6</option><option>8</option><option>12</option></select></label></div>'+
'<label class="sx-note"><input type="checkbox" class="cl" checked> Cut lines</label><canvas class="shc" style="width:100%;border:1px solid var(--line,#d9dfe7)"></canvas><p class="sx-note si"></p><div class="sx-row"><button type="button" class="it-b it-go dS">Download sheet</button><button type="button" class="sx-s pr">Print</button><button type="button" class="sx-s sh">Share</button></div></div></div></div>',
function(R,root){
 var pv=R('.sx-pp'),px=pv.getContext('2d'),app=R('.sx-app'),dz=R('.it-drop'),srcC,cutC,useCut=false,fill='#ffffff',pw=413,ph=531,v={zoom:1,rot:0,ox:0,oy:0},shC,busy=false;
 R('.of').value='jpg';
 function say(t){var b=R('.sx-busy');b.hidden=!t;b.textContent=t||''}
 function mm(n){return Math.round(n/25.4*300)}
 function drawTo(c,w,h,guide){var x=c.getContext('2d'),im=useCut?cutC:srcC;x.clearRect(0,0,w,h);x.fillStyle=useCut?fill:'#fff';x.fillRect(0,0,w,h);
  var b=Math.max(w/im.width,h/im.height)*v.zoom;x.save();x.translate(w/2+v.ox*w,h/2+v.oy*h);x.rotate(v.rot*Math.PI/180);x.scale(b,b);x.drawImage(im,-im.width/2,-im.height/2);x.restore();
  if(guide){x.save();x.lineWidth=Math.max(2,w/160);x.setLineDash([w/30,w/40]);x.strokeStyle='rgba(255,255,255,.95)';x.beginPath();x.ellipse(w/2,h*.45,w*.3,h*.3,0,0,7);x.stroke();x.strokeStyle='rgba(0,0,0,.55)';x.lineDashOffset=w/30;x.stroke();x.restore()}}
 function draw(){if(srcC)drawTo(pv,pw,ph,true)}
 function size(){var s=SZ[R('.ct').value],cu=!s[1];R('.cu').hidden=!cu;pw=mm(cu?+R('.cw').value||35:s[1]);ph=mm(cu?+R('.ch').value||45:s[2]);pv.width=pw;pv.height=ph;draw()}
 function sync(){[].forEach.call(root.querySelectorAll('[data-k]'),function(e){e.value=v[e.dataset.k]})}
 dropInit(R,function(f){readImg(f).then(function(c){srcC=c;cutC=null;R('.rm')._ai=0;pm=0;useCut=false;v={zoom:1,rot:0,ox:0,oy:0};sync();dz.hidden=true;app.hidden=false;size();step(1)}).catch(function(e){alert(e.message)})});
 [].forEach.call(root.querySelectorAll('[data-k]'),function(e){e.oninput=function(){v[e.dataset.k]=+e.value;draw()}});
 var dr;pv.addEventListener('pointerdown',function(e){pv.setPointerCapture(e.pointerId);dr={x:e.clientX,y:e.clientY}});
 pv.addEventListener('pointermove',function(e){if(!dr)return;var r=pv.getBoundingClientRect();v.ox=Math.max(-.5,Math.min(.5,v.ox+(e.clientX-dr.x)/r.width));v.oy=Math.max(-.5,Math.min(.5,v.oy+(e.clientY-dr.y)/r.height));dr={x:e.clientX,y:e.clientY};sync();draw()});
 pv.addEventListener('pointerup',function(){dr=0});
 R('.ct').onchange=size;R('.cw').oninput=size;R('.ch').oninput=size;
 function step(n){[].forEach.call(root.querySelectorAll('[data-p]'),function(p){p.hidden=+p.dataset.p!==n});[].forEach.call(root.querySelectorAll('[data-s]'),function(b){b.classList.toggle('on',+b.dataset.s===n)});if(n===3)sheet()}
 [].forEach.call(root.querySelectorAll('[data-s],[data-g]'),function(b){b.onclick=function(){step(+(b.dataset.s||b.dataset.g))}});
 ['#ffffff','#e8f1ff','#4a90d9','#d62839','#cfd8dc'].forEach(function(c){var b=document.createElement('button');b.type='button';b.className='sx-s sx-sw';b.style.background=c;b.setAttribute('aria-label','Fill '+c);b.onclick=function(){fill=c;draw()};R('.sw').appendChild(b)});
 R('.fc').oninput=function(){fill=this.value;draw()};R('.ko').onclick=function(){useCut=false;draw()};
 R('.rm').onclick=function(){pm=0;if(cutC&&!pm&&R('.rm')._ai){useCut=true;draw();return}if(busy)return;busy=true;
  ai(srcC,say).then(function(im){cutC=mk(srcC.width,srcC.height);cutC.getContext('2d').drawImage(im,0,0,srcC.width,srcC.height);R('.rm')._ai=1;useCut=true;draw()})
  .catch(function(e){alert('The AI could not run: '+(e&&e.message||'unknown error')+'. Check your internet connection, or use the Plain background button.')}).then(function(){busy=false;say('')})};
 var pm=0;function pl(){cutC=plain(srcC,+R('.tl').value);useCut=true;draw()}
 R('.pl').onclick=function(){pm=1;pl()};R('.tl').oninput=function(){if(pm)pl()};
 function tile(){var t=mk(pw,ph);drawTo(t,pw,ph,false);return t}
 R('.d1').onclick=function(){save(tile(),R('.of').value,'passport-photo',+R('.mk').value||0).catch(function(e){alert(e.message)})};
 function sheet(){var P={'4x6':[1200,1800],'5x7':[1500,2100],a4:[2480,3508]}[R('.pp').value],m=45,g=18,t=tile();
  function fit(a,b){return[Math.floor((a-2*m+g)/(pw+g)),Math.floor((b-2*m+g)/(ph+g))]}
  var p1=fit(P[0],P[1]),p2=fit(P[1],P[0]),land=p2[0]*p2[1]>p1[0]*p1[1],SW=land?P[1]:P[0],SH=land?P[0]:P[1],cr=land?p2:p1,max=cr[0]*cr[1],sc=R('.shc');
  if(max<1){sc.width=SW;sc.height=SH;shC=null;R('.si').textContent='This size does not fit on this paper. Choose a larger paper.';return}
  var want=+R('.cp').value,n=want?Math.min(want,max):max,cols=Math.min(cr[0],n),rows=Math.ceil(n/cols),c=mk(SW,SH),x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,SW,SH);var x0=Math.round((SW-(cols*(pw+g)-g))/2),y0=Math.round((SH-(rows*(ph+g)-g))/2);
  for(var i=0;i<n;i++){var cx=x0+(i%cols)*(pw+g),cy=y0+Math.floor(i/cols)*(ph+g);x.drawImage(t,cx,cy);if(R('.cl').checked){x.strokeStyle='#9aa4b2';x.lineWidth=2;x.strokeRect(cx,cy,pw,ph)}}
  sc.width=SW;sc.height=SH;sc.getContext('2d').drawImage(c,0,0);shC=c;R('.si').textContent=n+' photos, '+(land?'landscape':'portrait')+', 300 DPI. Print at 100 percent size.'}
 ['.pp','.cp','.cl'].forEach(function(s){R(s).onchange=sheet});
 R('.dS').onclick=function(){if(shC)save(shC,'jpg','passport-photo-sheet')};
 R('.pr').onclick=function(){if(!shC)return;var w=window.open('');if(!w)return;w.document.write('<style>@page{margin:0}body{margin:0}img{width:100%;display:block}</style><img src="'+shC.toDataURL('image/jpeg',.95)+'">');w.document.close();setTimeout(function(){w.focus();w.print()},400)};
 R('.sh').onclick=function(){if(!shC)return;shC.toBlob(function(b){var f=new File([b],'passport-photo-sheet.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Passport photos'}).catch(function(){});else alert('Sharing is not supported on this device. Please use Download sheet.')},'image/jpeg',.95)}
});
})();
