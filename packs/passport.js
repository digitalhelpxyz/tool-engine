/* tool-engine pack: passport v1 - Passport Photo Maker (data-it-tool="passport/maker")
   Steps: 1 crop and size, 2 background, 3 download and print sheet. Runs fully in the browser. */
(function(){
var IT=window.IT=window.IT||{},TID='passport/maker';

var PRESETS=[
['India / UK / EU / Australia - 35 x 45 mm',35,45],
['PAN card - 25 x 35 mm',25,35],
['US passport and visa - 2 x 2 in',50.8,50.8],
['China visa - 33 x 48 mm',33,48],
['Canada passport - 50 x 70 mm',50,70],
['Stamp size - 20 x 25 mm',20,25],
['Custom size',0,0]];
var PAPERS=[['A4 (210 x 297 mm)',210,297],['4 x 6 in',101.6,152.4],['5 x 7 in',127,177.8],['Letter (8.5 x 11 in)',215.9,279.4]];
var COLORS=[['White','#ffffff'],['Light grey','#eeeeee'],['Light blue','#cfe3f5'],['Blue','#2a63b8'],['Red','#c62828']];
var AIJS='@mediapipe/selfie_segmentation@0.1.1675465747/';
var AI=null;

/* ---------- pure helpers ---------- */
function mk(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function toBlob(c,t,q){return new Promise(function(r){c.toBlob(r,t,q)})}
function kb(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':Math.max(1,Math.round(n/1024))+' KB'}
function num(v,d){var n=parseFloat(v);return isFinite(n)?n:d}
function lim(v,a,b){return Math.max(a,Math.min(b,v))}
function smooth(a,b,x){var t=lim((x-a)/(b-a),0,1);return t*t*(3-2*t)}
function median(a){if(!a.length)return 255;a.sort(function(x,y){return x-y});return a[a.length>>1]}
/* how many photos of w x h (mm) fit on a pw x ph sheet */
function layout(pw,ph,w,h,gap,m){
var cols=Math.floor((pw-2*m+gap+1e-6)/(w+gap)),rows=Math.floor((ph-2*m+gap+1e-6)/(h+gap));
cols=Math.max(0,cols);rows=Math.max(0,rows);return{cols:cols,rows:rows,cap:cols*rows}}
/* box blur radius 1 on a W*H alpha array */
function blur1(a,W,H){var o=new Uint8ClampedArray(W*H);
for(var y=0;y<H;y++)for(var x=0;x<W;x++){var s=0,n=0;
for(var j=-1;j<=1;j++){var yy=y+j;if(yy<0||yy>=H)continue;for(var i=-1;i<=1;i++){var xx=x+i;if(xx<0||xx>=W)continue;s+=a[yy*W+xx];n++}}
o[y*W+x]=s/n}
return o}
/* mask from a plain background: flood fill from the photo border over pixels close to the border colour. d = RGBA data */
function keyAlpha(d,W,H,tol){
var rs=[],gs=[],bs=[],bw=Math.max(2,Math.round(W*.03));
function s(x,y){var i=(y*W+x)*4;if(d[i+3]<200)return;rs.push(d[i]);gs.push(d[i+1]);bs.push(d[i+2])}
var x,y;for(y=0;y<H*.6;y+=2){for(x=0;x<bw;x++){s(x,y);s(W-1-x,y)}}
for(x=0;x<W;x+=2){for(y=0;y<bw;y++)s(x,y)}
var br=median(rs),bg=median(gs),bb=median(bs),L=tol*tol,seen=new Uint8Array(W*H),st=new Int32Array(W*H),sp=0;
function near(p){var i=p*4;if(d[i+3]<30)return true;var a=d[i]-br,b=d[i+1]-bg,c=d[i+2]-bb;return a*a+b*b+c*c<=L}
function push(p){if(!seen[p]&&near(p)){seen[p]=1;st[sp++]=p}}
for(x=0;x<W;x++){push(x);push((H-1)*W+x)}
for(y=0;y<H;y++){push(y*W);push(y*W+W-1)}
while(sp){var p=st[--sp],px=p%W,py=(p-px)/W;
if(px>0)push(p-1);if(px<W-1)push(p+1);if(py>0)push(p-W);if(py<H-1)push(p+W)}
var a=new Uint8ClampedArray(W*H);for(var i=0;i<a.length;i++)a[i]=seen[i]?0:255;
return{alpha:a,color:[br,bg,bb]}}
/* minimal one-page PDF around a JPEG (Uint8Array) */
function makePDF(jpg,iw,ih,pwMm,phMm){
var enc=new TextEncoder(),parts=[],off=0,xr=[];
function add(x){var u=typeof x==='string'?enc.encode(x):x;parts.push(u);off+=u.length}
function obj(n,b){xr[n]=off;add(n+' 0 obj\n'+b+'\nendobj\n')}
var pw=(pwMm*72/25.4).toFixed(2),ph=(phMm*72/25.4).toFixed(2);
add('%PDF-1.4\n');
obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pw+' '+ph+'] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
var cs='q '+pw+' 0 0 '+ph+' 0 0 cm /Im0 Do Q';
obj(4,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
xr[5]=off;add('5 0 obj\n<< /Type /XObject /Subtype /Image /Width '+iw+' /Height '+ih+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n');
add(jpg);add('\nendstream\nendobj\n');
var xo=off,x='xref\n0 6\n0000000000 65535 f \n';
for(var i=1;i<=5;i++)x+=('0000000000'+xr[i]).slice(-10)+' 00000 n \n';
add(x+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'})}
IT.pp={layout:layout,keyAlpha:keyAlpha,makePDF:makePDF,blur1:blur1};

/* ---------- styles ---------- */
var css='.pp{max-width:860px}.pp *{box-sizing:border-box}'+
'.pp-steps{display:flex;gap:6px;list-style:none;margin:0 0 16px;padding:0}.pp-steps li{flex:1;padding:9px 6px;text-align:center;font-size:13px;font-weight:700;border-bottom:3px solid var(--line,#d9dfe7);color:var(--muted,#5b6778)}'+
'.pp-steps li.on{border-color:#0b6e5f;color:var(--ink,#0f1b2d)}.pp-steps li.done{border-color:#0b6e5f;cursor:pointer}'+
'.pp-row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;margin-top:14px}.pp-stage{flex:0 1 340px;width:100%;max-width:340px;margin:0 auto}.pp-ctl{flex:1 1 260px;display:grid;gap:12px;min-width:0}'+
'.pp-ctl label{display:grid;gap:4px;font-weight:600;font-size:14px}.pp-ctl label.pp-ck{display:flex;align-items:center;gap:8px}.pp-ctl label.pp-ck input{width:auto}.pp-ctl>b,.pp-h{font-size:15px}'+
'.pp-ctl select,.pp-ctl input[type=number]{background:var(--card,#fff);color:var(--ink,#0f1b2d);border:1px solid var(--line,#c5cdd9);width:100%}'+
'.pp-cv{display:block;width:100%;height:auto;border:1px solid var(--line,#c5cdd9);border-radius:6px;touch-action:none;cursor:grab}'+
'.pp-chk{background-color:#fff;background-image:linear-gradient(45deg,#d8dde4 25%,transparent 25%,transparent 75%,#d8dde4 75%),linear-gradient(45deg,#d8dde4 25%,transparent 25%,transparent 75%,#d8dde4 75%);background-size:16px 16px;background-position:0 0,8px 8px}'+
'.pp-hint,.pp-info,.pp-msg,.pp-sinfo{font-size:13px;color:var(--muted,#5b6778);margin-top:6px}.pp-msg.err{color:#b42318;font-weight:600}'+
'.pp .it-bt2 button{background:var(--card,#fff);color:var(--ink,#0f1b2d);border-color:var(--line,#c5cdd9)}.pp .it-bt2 button.on{background:#0b6e5f;color:#fff;border-color:#0b6e5f}.pp .it-bt2 button:disabled{opacity:.5}'+
'.pp-sw{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.pp-sw button{width:34px;height:34px;border-radius:50%;border:2px solid var(--line,#c5cdd9);cursor:pointer;padding:0}.pp-sw button.on{outline:3px solid #0b6e5f;outline-offset:2px}.pp-sw input[type=color]{width:38px;height:34px;padding:0;border:0;background:none;cursor:pointer}'+
'.pp-nav{display:flex;justify-content:space-between;gap:10px;margin-top:20px}.pp-nav .it-b{flex:0 1 220px}.pp-nav .it-b[hidden]{display:none}'+
'.pp-fin{display:block;max-width:100%;height:auto;border:1px solid var(--line,#c5cdd9)}.pp-act{display:flex;flex-wrap:wrap;gap:8px}.pp-act .it-b{flex:1 1 140px;padding:11px 8px;font-size:14px}'+
'.pp-sheet{margin-top:22px;padding-top:6px;border-top:1px solid var(--line,#d9dfe7)}.pp-sheetpv{flex:0 1 300px;width:100%;max-width:300px;margin:0 auto}.pp-sheetpv canvas{cursor:default;touch-action:auto}'+
'.pp input[type=range]{width:100%;padding:0}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- tool ---------- */
function mount(el){
if(el._it)return;el._it=1;
var S={step:1,img:null,src:null,rot:0,tilt:0,zoom:100,nx:.5,ny:.5,W:0,H:0,mmw:35,mmh:45,dpi:300,guide:true,
crop:null,adj:null,adjKey:'',mask:null,mx:null,method:'',bg:'#ffffff',bri:0,con:0,tool:'',brush:20,dirty:true,final:null,pho:null,phoUrl:'',sheet:null,sheetInfo:null};
var presetOpts=PRESETS.map(function(p,i){return'<option value="'+i+'">'+p[0]+'</option>'}).join(''),
paperOpts=PAPERS.map(function(p,i){return'<option value="'+i+'">'+p[0]+'</option>'}).join(''),
sw=COLORS.map(function(c){return'<button type="button" data-c="'+c[1]+'" title="'+c[0]+'" aria-label="'+c[0]+'" style="background:'+c[1]+'"></button>'}).join('');
el.innerHTML='<div class="it-wrap pp">'+
'<ol class="pp-steps"><li data-s="1">1. Crop and size</li><li data-s="2">2. Background</li><li data-s="3">3. Download and print</li></ol>'+
/* step 1 */
'<div class="pp-p" data-p="1"><label class="it-drop"><input type="file" accept="image/*" hidden><b>Select photo</b><span>or drop it here. Use a clear, front-facing photo.</span></label><div class="pp-msg pp-m1" role="alert"></div>'+
'<div class="pp-work" hidden><div class="pp-row"><div class="pp-stage"><canvas class="pp-cv pp-c1"></canvas><div class="pp-hint">Drag to move. Scroll, pinch or use the zoom slider. Keep the head inside the oval.</div></div>'+
'<div class="pp-ctl"><label>Photo size<select class="pp-pre">'+presetOpts+'</select></label>'+
'<div class="pp-cust" hidden style="display:none;gap:10px;grid-template-columns:1fr 1fr"><label>Width (mm)<input type="number" class="pp-cw" min="10" max="250" step="0.1" value="35"></label><label>Height (mm)<input type="number" class="pp-ch" min="10" max="250" step="0.1" value="45"></label></div>'+
'<label>Output quality<select class="pp-dpi"><option value="200">200 DPI (small file)</option><option value="300" selected>300 DPI (recommended)</option><option value="600">600 DPI (large)</option></select></label>'+
'<label>Zoom<input type="range" class="pp-zoom" min="40" max="400" value="100"></label>'+
'<label>Straighten<input type="range" class="pp-tilt" min="-15" max="15" step="0.5" value="0"></label>'+
'<div class="it-bt2"><button type="button" data-r="-1">\u21BA Rotate left</button><button type="button" data-r="1">\u21BB Rotate right</button><button type="button" data-r="0">Reset</button></div>'+
'<label class="pp-ck"><input type="checkbox" class="pp-guide" checked> Show face guide</label><div class="pp-info pp-i1"></div></div></div></div></div>'+
/* step 2 */
'<div class="pp-p" data-p="2" hidden><div class="pp-row"><div class="pp-stage"><canvas class="pp-cv pp-c2 pp-chk"></canvas><div class="pp-hint">Result preview. Use the brush to clean the edges.</div></div>'+
'<div class="pp-ctl"><b>Remove background</b><div class="it-bt2"><button type="button" class="pp-ai">Auto remove (AI)</button><button type="button" class="pp-key">Plain background</button><button type="button" class="pp-rst">Keep original</button></div>'+
'<label class="pp-tolw" hidden>Colour match<input type="range" class="pp-tol" min="10" max="120" value="45"></label><div class="pp-msg pp-m2" role="status"></div>'+
'<b>Fix edges with brush</b><div class="it-bt2 pp-tools"><button type="button" data-t="e">Erase</button><button type="button" data-t="r">Restore</button><button type="button" data-t="" class="on">Brush off</button></div>'+
'<label>Brush size<input type="range" class="pp-br" min="4" max="60" value="20"></label>'+
'<b>Background colour</b><div class="pp-sw">'+sw+'<input type="color" class="pp-cc" value="#ffffff" title="Custom colour" aria-label="Custom colour"><button type="button" data-c="" class="pp-chk" title="No colour (transparent PNG)" aria-label="Transparent"></button></div>'+
'<label>Brightness<input type="range" class="pp-bri" min="-40" max="40" value="0"></label><label>Contrast<input type="range" class="pp-con" min="-40" max="40" value="0"></label></div></div></div>'+
/* step 3 */
'<div class="pp-p" data-p="3" hidden><div class="pp-row"><div class="pp-stage"><img class="pp-fin" alt="Passport photo preview"></div>'+
'<div class="pp-ctl"><b>Download photo</b><label>Format<select class="pp-fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></label>'+
'<label>Maximum file size in KB (optional)<input type="number" class="pp-kb" min="5" placeholder="e.g. 50"></label><div class="pp-info pp-i3"></div><button type="button" class="it-b pp-dl1">Download photo</button></div></div>'+
'<div class="pp-sheet"><b class="pp-h">Print sheet</b><div class="pp-row"><div class="pp-sheetpv"><canvas class="pp-cv pp-c3"></canvas></div>'+
'<div class="pp-ctl"><label>Paper size<select class="pp-paper">'+paperOpts+'</select></label>'+
'<label>Number of photos (empty = fill the sheet)<input type="number" class="pp-n" min="1" max="200" placeholder="Fill the sheet"></label>'+
'<div style="display:grid;gap:10px;grid-template-columns:1fr 1fr"><label>Gap (mm)<input type="number" class="pp-gap" min="0" max="20" step="0.5" value="2"></label><label>Margin (mm)<input type="number" class="pp-mar" min="0" max="30" step="0.5" value="5"></label></div>'+
'<label class="pp-ck"><input type="checkbox" class="pp-cut" checked> Cut lines</label><div class="pp-sinfo"></div>'+
'<div class="pp-act"><button type="button" class="it-b pp-dls">Download sheet (JPG)</button><button type="button" class="it-b alt pp-pdf">Download PDF</button><button type="button" class="it-b alt pp-prt">Print</button></div></div></div></div></div>'+
'<div class="pp-nav"><button type="button" class="it-b alt pp-back" hidden>Back</button><button type="button" class="it-b pp-next" hidden>Next</button></div></div>';

function q(s){return el.querySelector(s)}
function qa(s){return[].slice.call(el.querySelectorAll(s))}
var c1=q('.pp-c1'),c2=q('.pp-c2'),c3=q('.pp-c3');

/* ----- sizes ----- */
function calc(){S.W=lim(Math.round(S.mmw/25.4*S.dpi),60,3200);S.H=lim(Math.round(S.mmh/25.4*S.dpi),60,3200)}
function cover(){return Math.max(S.W/S.src.width,S.H/S.src.height)}
function kk(){return cover()*S.zoom/100}
function clampPos(){var W=S.W,H=S.H,k=kk(),iw=S.src.width*k,ih=S.src.height*k,cx=S.nx*W,cy=S.ny*H;
cx=iw>=W?lim(cx,W-iw/2,iw/2):lim(cx,iw/2,W-iw/2);cy=ih>=H?lim(cy,H-ih/2,ih/2):lim(cy,ih/2,H-ih/2);S.nx=cx/W;S.ny=cy/H}
function note(s,t,err){var e=q(s);e.textContent=t||'';e.classList.toggle('err',!!err)}

/* ----- photo ----- */
function setSrc(){var im=S.img,w=im.naturalWidth,h=im.naturalHeight,m=Math.min(1,2600/Math.max(w,h)),tw=Math.round(w*m),th=Math.round(h*m),odd=Math.abs(S.rot)%2===1,c=mk(odd?th:tw,odd?tw:th),x=c.getContext('2d');
x.translate(c.width/2,c.height/2);x.rotate(S.rot*Math.PI/2);x.imageSmoothingQuality='high';x.drawImage(im,-tw/2,-th/2,tw,th);S.src=c}
function resetView(){S.nx=.5;S.ny=.5;S.zoom=100;S.tilt=0;q('.pp-zoom').value=100;q('.pp-tilt').value=0}
function paint1(x,f){var W=S.W,H=S.H,k=kk();x.save();x.scale(f,f);x.translate(S.nx*W,S.ny*H);x.rotate(S.tilt*Math.PI/180);x.scale(k,k);x.imageSmoothingQuality='high';x.drawImage(S.src,-S.src.width/2,-S.src.height/2);x.restore()}
function draw1(){if(!S.src)return;calc();clampPos();var SW=Math.min(S.W,480),SH=Math.round(SW*S.H/S.W),f=SW/S.W;
if(c1.width!==SW||c1.height!==SH){c1.width=SW;c1.height=SH}
var x=c1.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,SW,SH);paint1(x,f);
if(S.guide){x.save();x.setLineDash([7,5]);x.lineJoin='round';
[['rgba(0,0,0,.55)',3.5],['rgba(255,255,255,.95)',1.6]].forEach(function(s){x.strokeStyle=s[0];x.lineWidth=s[1];
x.beginPath();x.ellipse(SW/2,SH*.45,SW*.29,SH*.36,0,0,Math.PI*2);x.stroke();
x.beginPath();x.moveTo(SW*.12,SH*.4);x.lineTo(SW*.88,SH*.4);x.stroke()});x.restore()}
var k=kk();q('.pp-i1').textContent='Output: '+S.W+' \u00d7 '+S.H+' px ('+(+S.mmw.toFixed(1))+' \u00d7 '+(+S.mmh.toFixed(1))+' mm at '+S.dpi+' DPI).'+(k>2?' This photo has low resolution for this size and may look soft.':'')}
function touch1(){S.dirty=true;draw1()}
function setZoom(z){S.zoom=lim(z,40,400);q('.pp-zoom').value=S.zoom;touch1()}

function loadFile(f){
note('.pp-m1','');
if(!f)return;
var url=URL.createObjectURL(f),im=new Image();
im.onload=function(){S.img=im;S.rot=0;setSrc();resetView();q('.pp-work').hidden=false;dz.classList.add('sm');q('.it-drop b').textContent='Choose another photo';touch1();nav()};
im.onerror=function(){note('.pp-m1','This file could not be opened. Please choose a JPG, PNG or WebP photo.',true)};
im.src=url}
var inp=q('input[type=file]'),dz=q('.it-drop');
inp.onchange=function(){loadFile(inp.files[0]);inp.value=''};
['dragover','dragenter'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.add('over')})});
['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.remove('over')})});
dz.addEventListener('drop',function(v){loadFile(v.dataTransfer.files[0])});

/* stage gestures: drag, wheel, pinch */
var ptr={},pd=0;
c1.addEventListener('pointerdown',function(e){ptr[e.pointerId]={x:e.clientX,y:e.clientY};c1.setPointerCapture(e.pointerId);c1.style.cursor='grabbing';pd=0});
c1.addEventListener('pointermove',function(e){var p=ptr[e.pointerId];if(!p||!S.src)return;var ids=Object.keys(ptr);
if(ids.length>=2){ptr[e.pointerId]={x:e.clientX,y:e.clientY};var a=ptr[ids[0]],b=ptr[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd)setZoom(S.zoom*d/pd);pd=d;return}
var r=c1.getBoundingClientRect(),s=S.W/r.width;S.nx+=(e.clientX-p.x)*s/S.W;S.ny+=(e.clientY-p.y)*s/S.H;ptr[e.pointerId]={x:e.clientX,y:e.clientY};touch1()});
function up(e){delete ptr[e.pointerId];pd=0;c1.style.cursor='grab'}
c1.addEventListener('pointerup',up);c1.addEventListener('pointercancel',up);
c1.addEventListener('wheel',function(e){if(!S.src)return;e.preventDefault();setZoom(S.zoom*(e.deltaY<0?1.06:.94))},{passive:false});

q('.pp-pre').onchange=function(){var p=PRESETS[+this.value],cu=q('.pp-cust');
if(p[1]){S.mmw=p[1];S.mmh=p[2];cu.hidden=true;cu.style.display='none'}else{cu.hidden=false;cu.style.display='grid';S.mmw=num(q('.pp-cw').value,35);S.mmh=num(q('.pp-ch').value,45)}touch1()};
function cust(){S.mmw=lim(num(q('.pp-cw').value,35),10,250);S.mmh=lim(num(q('.pp-ch').value,45),10,250);touch1()}
q('.pp-cw').oninput=q('.pp-ch').oninput=cust;
q('.pp-dpi').onchange=function(){S.dpi=+this.value;touch1()};
q('.pp-zoom').oninput=function(){S.zoom=+this.value;touch1()};
q('.pp-tilt').oninput=function(){S.tilt=+this.value;touch1()};
q('.pp-guide').onchange=function(){S.guide=this.checked;draw1()};
qa('[data-r]').forEach(function(b){b.onclick=function(){if(!S.img)return;var r=+b.getAttribute('data-r');if(r)S.rot=(S.rot+r+4)%4;else{S.rot=0;S.tilt=0}setSrc();resetView();touch1()}});

/* ----- step 2: background ----- */
function newMask(){S.mask=mk(S.W,S.H);S.mx=S.mask.getContext('2d');S.mx.fillStyle='#000';S.mx.fillRect(0,0,S.W,S.H);S.method='';S.adjKey=''}
function buildCrop(){S.crop=mk(S.W,S.H);paint1(S.crop.getContext('2d'),1);newMask();S.dirty=false;
S.tool='';qa('.pp-tools button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-t')==='')});q('.pp-tolw').hidden=true;note('.pp-m2','');setTool()}
function adjusted(){var key=S.bri+'|'+S.con;if(S.adj&&S.adjKey===key)return S.adj;
if(!S.bri&&!S.con){S.adj=S.crop;S.adjKey=key;return S.adj}
var c=mk(S.W,S.H),x=c.getContext('2d');x.drawImage(S.crop,0,0);var im=x.getImageData(0,0,S.W,S.H),d=im.data,f=1+S.con/100,b=S.bri*1.5;
for(var i=0;i<d.length;i+=4){d[i]=(d[i]-128)*f+128+b;d[i+1]=(d[i+1]-128)*f+128+b;d[i+2]=(d[i+2]-128)*f+128+b}
x.putImageData(im,0,0);S.adj=c;S.adjKey=key;return c}
function compose(){var W=S.W,H=S.H,out=mk(W,H),x=out.getContext('2d');
if(S.bg){x.fillStyle=S.bg;x.fillRect(0,0,W,H)}
var cut=mk(W,H),cx=cut.getContext('2d');cx.drawImage(adjusted(),0,0);cx.globalCompositeOperation='destination-in';cx.drawImage(S.mask,0,0);
x.drawImage(cut,0,0);return out}
var raf=0;
function draw2(){if(!S.crop)return;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var SW=Math.min(S.W,480),SH=Math.round(SW*S.H/S.W);
if(c2.width!==SW||c2.height!==SH){c2.width=SW;c2.height=SH}
var x=c2.getContext('2d');x.clearRect(0,0,SW,SH);x.imageSmoothingQuality='high';x.drawImage(compose(),0,0,SW,SH)})}
function putMask(a){var W=S.W,H=S.H,b=blur1(a,W,H),id=S.mx.createImageData(W,H),d=id.data;for(var i=0;i<b.length;i++)d[i*4+3]=b[i];S.mx.putImageData(id,0,0)}
function busy(on){qa('.pp-ai,.pp-key,.pp-rst').forEach(function(b){b.disabled=on})}
function runKey(){var W=S.W,H=S.H,d=S.crop.getContext('2d').getImageData(0,0,W,H).data,r=keyAlpha(d,W,H,+q('.pp-tol').value);putMask(r.alpha);S.method='key';draw2();
note('.pp-m2','Plain background removed. If parts of the person are missing, lower "Colour match" or use the Restore brush.')}
q('.pp-key').onclick=function(){if(!S.crop)return;q('.pp-tolw').hidden=false;busy(true);setTimeout(function(){try{runKey()}catch(e){note('.pp-m2','Could not remove the background.',true)}busy(false)},20)};
q('.pp-tol').oninput=function(){if(S.method==='key'){clearTimeout(q('.pp-tol')._t);q('.pp-tol')._t=setTimeout(runKey,120)}};
q('.pp-rst').onclick=function(){if(!S.crop)return;newMask();q('.pp-tolw').hidden=true;note('.pp-m2','Original background restored.');draw2()};
q('.pp-ai').onclick=async function(){if(!S.crop)return;busy(true);q('.pp-tolw').hidden=true;
try{
if(!IT.script)throw new Error('lib');
note('.pp-m2','Loading the AI model. The first time can take a few seconds...');
await IT.script(AIJS+'selfie_segmentation.js',function(){return window.SelfieSegmentation});
if(!AI){var base=IT.host||'https://cdn.jsdelivr.net/npm/';AI=new window.SelfieSegmentation({locateFile:function(f){return base+AIJS+f}});AI.setOptions({modelSelection:0});await AI.initialize()}
note('.pp-m2','Removing the background...');
var W=S.W,H=S.H,inC=mk(W,H),ix=inC.getContext('2d');ix.fillStyle='#fff';ix.fillRect(0,0,W,H);ix.drawImage(S.crop,0,0);
var res=await new Promise(function(ok,no){var t=setTimeout(function(){no(new Error('timeout'))},60000);AI.onResults(function(r){clearTimeout(t);ok(r)});AI.send({image:inC}).catch(no)});
var tm=mk(W,H),tx=tm.getContext('2d');tx.drawImage(res.segmentationMask,0,0,W,H);
var d=tx.getImageData(0,0,W,H).data,minA=255,i;for(i=3;i<d.length;i+=4*37)if(d[i]<minA)minA=d[i];
var ch=minA>=250?0:3,a=new Uint8ClampedArray(W*H);
for(i=0;i<a.length;i++)a[i]=smooth(.3,.7,d[i*4+ch]/255)*255;
putMask(a);S.method='ai';draw2();note('.pp-m2','Done. Use the brush below to fix any rough edges.')
}catch(e){note('.pp-m2','The AI model could not be loaded. Check your internet connection, or use "Plain background" if the photo has a plain wall behind you.',true)}
busy(false)};

function setTool(){c2.style.cursor=S.tool?'crosshair':'default';c2.style.touchAction=S.tool?'none':'pan-y'}
qa('.pp-tools button').forEach(function(b){b.onclick=function(){S.tool=b.getAttribute('data-t');qa('.pp-tools button').forEach(function(x){x.classList.toggle('on',x===b)});setTool()}});
q('.pp-br').oninput=function(){S.brush=+this.value};
var last=null;
function dab(x,y){var r=S.brush*S.W/300,m=S.mx,g=m.createRadialGradient(x,y,r*.45,x,y,r);
m.globalCompositeOperation=S.tool==='e'?'destination-out':'source-over';g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');m.fillStyle=g;m.beginPath();m.arc(x,y,r,0,Math.PI*2);m.fill();m.globalCompositeOperation='source-over'}
function pos(e){var r=c2.getBoundingClientRect();return[(e.clientX-r.left)*S.W/r.width,(e.clientY-r.top)*S.H/r.height]}
c2.addEventListener('pointerdown',function(e){if(!S.tool||!S.crop)return;c2.setPointerCapture(e.pointerId);last=pos(e);dab(last[0],last[1]);S.method=S.method||'hand';draw2();e.preventDefault()});
c2.addEventListener('pointermove',function(e){if(!last)return;var p=pos(e),dx=p[0]-last[0],dy=p[1]-last[1],n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(S.brush*S.W/900+1)));
for(var i=1;i<=n;i++)dab(last[0]+dx*i/n,last[1]+dy*i/n);last=p;draw2()});
function end(){last=null}c2.addEventListener('pointerup',end);c2.addEventListener('pointercancel',end);

function setBg(c){S.bg=c||null;qa('.pp-sw button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-c')===(c||''))});draw2()}
qa('.pp-sw button').forEach(function(b){b.onclick=function(){setBg(b.getAttribute('data-c'))}});
q('.pp-cc').oninput=function(){qa('.pp-sw button').forEach(function(b){b.classList.remove('on')});S.bg=this.value;draw2()};
q('.pp-bri').oninput=function(){S.bri=+this.value;draw2()};q('.pp-con').oninput=function(){S.con=+this.value;draw2()};

/* ----- step 3: export and sheet ----- */
function flat(c,t){if(t!=='image/jpeg'||S.bg)return c;var o=mk(c.width,c.height),x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(c,0,0);return o}
async function exportPhoto(){var t=q('.pp-fmt').value,lim_=num(q('.pp-kb').value,0)*1024,base=flat(S.final,t),s=1,b,c=base,note_='';
for(var n=0;n<14;n++){
if(s<1){c=mk(base.width*s,base.height*s);var cx=c.getContext('2d');cx.imageSmoothingQuality='high';cx.drawImage(base,0,0,c.width,c.height)}
if(t==='image/png'){b=await toBlob(c,t)}
else if(!lim_){b=await toBlob(c,t,.95)}
else{var lo=.3,hi=.95;b=await toBlob(c,t,lo);if(b.size<=lim_){for(var i=0;i<7;i++){var m=(lo+hi)/2,bb=await toBlob(c,t,m);if(bb.size>lim_)hi=m;else{lo=m;b=bb}}}}
if(!lim_||b.size<=lim_)break;s*=.9}
if(lim_&&b.size>lim_)note_='Could not reach the size limit. Try a larger limit.';
else if(s<1)note_='Resized to '+c.width+' \u00d7 '+c.height+' px to fit the size limit.';
return{blob:b,w:c.width,h:c.height,note:note_}}
var exT=0;
function refreshPhoto(){clearTimeout(exT);exT=setTimeout(async function(){if(!S.final)return;
try{var r=await exportPhoto();S.pho=r;if(S.phoUrl)URL.revokeObjectURL(S.phoUrl);S.phoUrl=URL.createObjectURL(r.blob);q('.pp-fin').src=S.phoUrl;
q('.pp-i3').textContent=r.w+' \u00d7 '+r.h+' px \u00b7 '+(+S.mmw.toFixed(1))+' \u00d7 '+(+S.mmh.toFixed(1))+' mm \u00b7 '+kb(r.blob.size)+(r.note?'. '+r.note:'')}
catch(e){q('.pp-i3').textContent='Could not prepare the photo.'}},150)}
function save(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function fname(ext){return'passport-photo-'+(+S.mmw.toFixed(1))+'x'+(+S.mmh.toFixed(1))+'mm.'+ext}
q('.pp-dl1').onclick=function(){if(S.pho)save(S.pho.blob,fname(q('.pp-fmt').value==='image/png'?'png':'jpg'))};
q('.pp-fmt').onchange=q('.pp-kb').oninput=refreshPhoto;

var shT=0;
function sheet(){clearTimeout(shT);shT=setTimeout(drawSheet,120)}
function drawSheet(){if(!S.final)return;
var P=PAPERS[+q('.pp-paper').value],gap=lim(num(q('.pp-gap').value,2),0,20),m=lim(num(q('.pp-mar').value,5),0,30),w=S.mmw,h=S.mmh,
A=layout(P[1],P[2],w,h,gap,m),B=layout(P[2],P[1],w,h,gap,m),land=B.cap>A.cap,pw=land?P[2]:P[1],ph=land?P[1]:P[2],L=land?B:A,
want=Math.floor(num(q('.pp-n').value,0)),n=want>0?Math.min(want,L.cap):L.cap,K=300/25.4,
W=Math.round(pw*K),H=Math.round(ph*K),c=c3;c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);
if(!L.cap){S.sheet=null;q('.pp-sinfo').textContent='The photo does not fit on this paper. Reduce the margin or gap, or choose a larger paper.';return}
var ph_=flat(S.final,'image/jpeg'),cols=Math.min(L.cols,n),rows=Math.ceil(n/L.cols),bw=cols*w+(cols-1)*gap,bh=rows*h+(rows-1)*gap,ox=(pw-bw)/2,oy=(ph-bh)/2;
x.imageSmoothingQuality='high';
for(var i=0;i<n;i++){var cc=i%L.cols,rr=Math.floor(i/L.cols),px=Math.round((ox+cc*(w+gap))*K),py=Math.round((oy+rr*(h+gap))*K),pwid=Math.round(w*K),phei=Math.round(h*K);
if(!S.bg){x.fillStyle='#fff';x.fillRect(px,py,pwid,phei)}
x.drawImage(ph_,px,py,pwid,phei);
if(q('.pp-cut').checked){x.strokeStyle='#8d97a6';x.lineWidth=2;x.strokeRect(px+1,py+1,pwid-2,phei-2)}}
S.sheet={pw:pw,ph:ph,W:W,H:H};
q('.pp-sinfo').textContent=n+' photo'+(n>1?'s':'')+' on '+P[0].split(' (')[0]+' ('+(land?'landscape':'portrait')+', '+L.cols+' \u00d7 '+L.rows+' fit)'+(want>L.cap?'. Only '+L.cap+' fit on one sheet.':'')+'.'}
['.pp-paper','.pp-n','.pp-gap','.pp-mar','.pp-cut'].forEach(function(s){q(s).oninput=q(s).onchange=sheet});
q('.pp-dls').onclick=async function(){if(!S.sheet)return;save(await toBlob(c3,'image/jpeg',.95),'passport-photo-sheet.jpg')};
q('.pp-pdf').onclick=async function(){if(!S.sheet)return;var b=await toBlob(c3,'image/jpeg',.95),u=new Uint8Array(await b.arrayBuffer());save(makePDF(u,S.sheet.W,S.sheet.H,S.sheet.pw,S.sheet.ph),'passport-photo-sheet.pdf')};
q('.pp-prt').onclick=async function(){if(!S.sheet)return;var b=await toBlob(c3,'image/jpeg',.95),u=URL.createObjectURL(b),s=S.sheet,f=document.createElement('iframe');
f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
var d=f.contentWindow.document;d.open();d.write('<!doctype html><html><head><title>Passport photo sheet</title><style>@page{size:'+s.pw+'mm '+s.ph+'mm;margin:0}html,body{margin:0;padding:0}img{display:block;width:'+s.pw+'mm;height:'+s.ph+'mm}</style></head><body><img src="'+u+'"></body></html>');d.close();
var im=d.querySelector('img'),go=function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(e){}setTimeout(function(){f.remove();URL.revokeObjectURL(u)},60000)};
if(im.complete)go();else im.onload=go};

/* ----- wizard ----- */
function nav(){var back=q('.pp-back'),next=q('.pp-next');back.hidden=S.step===1;next.hidden=S.step===3||!S.img;next.textContent=S.step===1?'Next: Background':'Next: Download and print';
qa('.pp-steps li').forEach(function(li){var n=+li.getAttribute('data-s');li.classList.toggle('on',n===S.step);li.classList.toggle('done',n<S.step)});
qa('.pp-p').forEach(function(p){p.hidden=+p.getAttribute('data-p')!==S.step})}
function go(n){
if(n>1&&!S.img)return;
if(n===2&&(S.dirty||!S.crop))buildCrop();
S.step=n;nav();
if(n===1)draw1();
if(n===2){draw2()}
if(n===3){S.final=compose();refreshPhoto();drawSheet()}
var top=el.getBoundingClientRect().top;if(top<0)el.scrollIntoView({behavior:'smooth',block:'start'})}
q('.pp-next').onclick=function(){go(S.step+1)};q('.pp-back').onclick=function(){go(S.step-1)};
qa('.pp-steps li').forEach(function(li){li.onclick=function(){var n=+li.getAttribute('data-s');if(n<S.step)go(n)}});
setBg('#ffffff');nav();calc();
el.setAttribute('data-it','passport/maker');el.removeAttribute('data-it-tool')}

function init(){[].slice.call(document.querySelectorAll('[data-it-tool="'+TID+'"]')).forEach(mount)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
