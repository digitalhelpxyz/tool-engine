/* tool-engine photo pack v1: Passport Photo Maker and Background Remover (no AI model, runs fully in the browser). Needs the template core (window.IT). */
(function(){
var IT=window.IT;if(!IT||!IT.u||IT.photoPack)return;IT.photoPack=1;
var U=IT.u,mk=U.mk,blob=U.blob,kb=U.kb;
function $(r,s){return r.querySelector(s)}
function $$(r,s){return [].slice.call(r.querySelectorAll(s))}
function clamp(v,a,b){return v<a?a:v>b?b:v}
var CK='linear-gradient(45deg,#cfd5dd 25%,transparent 25%,transparent 75%,#cfd5dd 75%),linear-gradient(45deg,#cfd5dd 25%,transparent 25%,transparent 75%,#cfd5dd 75%)';
var css='.pp [hidden]{display:none!important}.pp{max-width:880px}.pp *{box-sizing:border-box}.pp-ed{margin-top:14px}.pp-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}'+
'@media(min-width:780px){.pp-grid.two{grid-template-columns:minmax(0,420px) minmax(0,1fr);align-items:start}}'+
'.pp-vw{overflow:auto;max-height:80vh;border:1px solid #d9dfe7;border-radius:12px;background:#f4f6f8;text-align:center}'+
'.pp-cv{position:relative;display:inline-block;line-height:0;vertical-align:top;background-color:#fff;background-image:'+CK+';background-size:16px 16px;background-position:0 0,8px 8px}'+
'.pp-cv.solid{background-image:none}.pp-cv canvas{display:block;max-width:none}.pp-cv.fit canvas{width:100%;height:auto}'+
'.pp-ring{position:absolute;border:2px solid #fff;box-shadow:0 0 0 1px #0f1b2d;border-radius:50%;pointer-events:none;display:none}'+
'.pp-guide{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}'+
'.pp-sec{border:1px solid #d9dfe7;border-radius:12px;padding:12px;margin-bottom:12px;display:grid;gap:10px}.pp-sec h3{margin:0;font-size:15px}'+
'.pp-sec label{display:grid;gap:4px;font-weight:600;font-size:14px}.pp-sec input[type=range]{width:100%;padding:0}.pp-sec input[type=color]{height:36px;padding:2px;width:60px}'+
'.pp-row{display:flex;flex-wrap:wrap;gap:10px;align-items:end}.pp-row>label{flex:1 1 90px}.pp-chk{display:flex!important;grid-template-columns:none!important;align-items:center;gap:8px!important;font-weight:600}.pp-chk input{width:auto}'+
'.pp-sw{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.pp-sw button{width:34px;height:34px;border-radius:50%;border:2px solid #c5cdd9;cursor:pointer;padding:0}.pp-sw button.on{border-color:#0b6e5f;box-shadow:0 0 0 2px #0b6e5f}'+
'.pp-sw .tr{background-color:#fff;background-image:'+CK+';background-size:10px 10px;background-position:0 0,5px 5px}'+
'.pp-msg{padding:12px;font-weight:700;color:#0b6e5f;text-align:center}.pp-hint{font-size:13px;color:#5b6778;margin:8px 0 0}'+
'.pp-tabs{margin-bottom:8px}.pp-tabs button{margin-bottom:6px}.pp-sm{font-size:13px;color:#5b6778;margin:0}'+
'html.dark .pp-vw,html.dark .pp-sec{border-color:var(--line)}html.dark .pp-vw{background:var(--paper)}html.dark .pp-hint,html.dark .pp-sm{color:var(--muted)}html.dark .pp-msg{color:var(--accent)}html.dark .pp-sw button{border-color:var(--line)}';
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- helpers ---------- */
function loadImg(f){return new Promise(function(ok,no){var i=new Image(),u=URL.createObjectURL(f);i.onload=function(){ok(i)};i.onerror=function(){no(new Error('Could not read this image. Please choose a JPG, PNG or WebP photo.'))};i.src=u})}
function workCanvas(img,max){var w=img.naturalWidth,h=img.naturalHeight,m=Math.min(1,max/Math.max(w,h)),c=mk(w*m,h*m),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height);return c}
function pointer(cv,h){var down=false,last=null;
function pt(e){var r=cv.getBoundingClientRect(),k=cv.width/r.width;return{x:(e.clientX-r.left)*k,y:(e.clientY-r.top)*(cv.height/r.height),k:k,cx:e.clientX-r.left,cy:e.clientY-r.top}}
cv.addEventListener('pointerdown',function(e){if(h.on&&!h.on())return;down=true;last=pt(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();if(h.start)h.start(last,e)});
cv.addEventListener('pointermove',function(e){if(h.on&&!h.on())return;var p=pt(e);if(h.hover)h.hover(p,e);if(!down)return;h.move(p,last,e);last=p;e.preventDefault()});
function up(e){if(!down)return;down=false;if(h.end)h.end(e)}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',function(e){if(h.leave)h.leave(e)})}
function stroke(a,b,r,fn){var d=Math.sqrt((b.x-a.x)*(b.x-a.x)+(b.y-a.y)*(b.y-a.y)),st=Math.max(1,r*.3),n=Math.max(1,Math.ceil(d/st));for(var i=1;i<=n;i++)fn(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n)}
function joinRect(a,b){if(!a)return b;if(!b)return a;var x0=Math.min(a.x,b.x),y0=Math.min(a.y,b.y),x1=Math.max(a.x+a.w,b.x+b.w),y1=Math.max(a.y+a.h,b.y+b.h);return{x:x0,y:y0,w:x1-x0,h:y1-y0}}
function box(a,w,h,k){var n=a.length,t=new Float32Array(n),o=new Float32Array(n),P=new Float64Array(Math.max(w,h)+1),x,y,lo,hi,i;
for(y=0;y<h;y++){P[0]=0;for(x=0;x<w;x++)P[x+1]=P[x]+a[y*w+x];for(x=0;x<w;x++){lo=x-k<0?0:x-k;hi=x+k>w-1?w-1:x+k;t[y*w+x]=(P[hi+1]-P[lo])/(hi-lo+1)}}
for(x=0;x<w;x++){P[0]=0;for(y=0;y<h;y++)P[y+1]=P[y]+t[y*w+x];for(y=0;y<h;y++){lo=y-k<0?0:y-k;hi=y+k>h-1?h-1:y+k;o[y*w+x]=(P[hi+1]-P[lo])/(hi-lo+1)}}
return o}
function erode(m,w,h){var o=new Uint8Array(m.length),x,y,i;for(y=0;y<h;y++)for(x=0;x<w;x++){i=y*w+x;o[i]=(m[i]&&(x<1||m[i-1])&&(x>w-2||m[i+1])&&(y<1||m[i-w])&&(y>h-2||m[i+w]))?1:0}return o}
function dlBtn(c,name,b,note,prevUrl,info){var u=URL.createObjectURL(b),el=document.createElement('div');el.className='it-card';
el.innerHTML='<img alt="" style="max-height:220px;object-fit:contain;width:70px;height:auto"><div style="flex:1;min-width:0"><b class="n" style="overflow-wrap:anywhere"></b><br><span class="i"></span></div>'+(note?'<div class="it-note"></div>':'')+'<div class="it-act"><a class="it-b it-dl">Download</a><button type="button" class="it-b it-wa">WhatsApp</button><button type="button" class="it-b it-sh">Share</button></div>';
$(el,'.n').textContent=name;$(el,'.i').textContent=info||kb(b.size);if(note)$(el,'.it-note').textContent=note;var im=$(el,'img');im.src=prevUrl||u;im.style.width='96px';
var a=$(el,'.it-dl');a.href=u;a.download=name;
var H=document.querySelector('h1.pt'),TT=(H?H.textContent:document.title).trim(),PG=location.origin+location.pathname,MSG='Made with '+TT+' - free online tool: '+PG,f=null,sh=$(el,'.it-sh');
try{f=new File([b],name,{type:b.type})}catch(e){}
$(el,'.it-wa').onclick=function(){window.open('https://wa.me/?text='+encodeURIComponent(MSG),'_blank')};
sh.onclick=async function(){try{if(f&&navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:TT,text:MSG});else if(navigator.share)await navigator.share({title:TT,text:MSG,url:PG});else if(navigator.clipboard){await navigator.clipboard.writeText(MSG);sh.textContent='Link copied'}}catch(e){}};
return el}
function sharpen(c,amt){var w=c.width,h=c.height,x=c.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,s=new Uint8ClampedArray(d),i,j,ch,v,sum;
for(var y=1;y<h-1;y++)for(var xx=1;xx<w-1;xx++){i=(y*w+xx)*4;for(ch=0;ch<3;ch++){j=i+ch;sum=s[j-4]+s[j+4]+s[j-w*4]+s[j+w*4]+s[j-4-w*4]+s[j+4-w*4]+s[j-4+w*4]+s[j+4+w*4]+s[j];v=s[j]+amt*(s[j]-sum/9);d[j]=v<0?0:v>255?255:v}}
x.putImageData(id,0,0)}
async function encodeMax(c,type,q,maxKB){var b=await blob(c,type,q);if(!maxKB||type==='image/png')return{b:b};var cap=maxKB*1024;if(b.size<=cap)return{b:b};
var lo=.05,hi=q;for(var i=0;i<9;i++){var m=(lo+hi)/2;b=await blob(c,type,m);if(b.size>cap)hi=m;else lo=m}b=await blob(c,type,lo);
return b.size<=cap?{b:b}:{b:b,note:'Could not reach '+maxKB+' KB at this size. The file is '+kb(b.size)+'. Try a smaller custom size or JPG.'}}
function ab(b){return b.arrayBuffer?b.arrayBuffer():new Promise(function(r){var f=new FileReader();f.onload=function(){r(f.result)};f.readAsArrayBuffer(b)})}
function mkpdf(p){var parts=[],off=0,offs=[],i;function add(s){var b=typeof s==='string'?new TextEncoder().encode(s):s;parts.push(b);off+=b.length}function obj(id,s){offs[id]=off;add(id+' 0 obj\n'+s+'\nendobj\n')}
add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Count 1/Kids[3 0 R]>>');
var cs='q '+p.pw+' 0 0 '+p.ph+' 0 0 cm /I Do Q';obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+p.pw+' '+p.ph+']/Contents 4 0 R/Resources<</XObject<</I 5 0 R>>>>>>');obj(4,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');
offs[5]=off;add('5 0 obj\n<</Type/XObject/Subtype/Image/Width '+p.w+'/Height '+p.h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+p.d.length+'>>\nstream\n');add(p.d);add('\nendstream\nendobj\n');
var xr=off,s='xref\n0 6\n0000000000 65535 f \n';for(var id=1;id<6;id++)s+=('0000000000'+offs[id]).slice(-10)+' 00000 n \n';add(s+'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');return new Blob(parts,{type:'application/pdf'})}

/* ---------- background engine: finds the wall colors on the photo edges, floods inward, smooths the edge ---------- */
function Seg(src){
var w=src.width,h=src.height,n=w*h,sx=src.getContext('2d'),id=sx.getImageData(0,0,w,h),px=id.data,
Lw=new Float32Array(n),Ac=new Float32Array(n),Bc=new Float32Array(n),A=new Float32Array(n),man=new Int8Array(n),hist=[],
od=sx.createImageData(w,h),oc=mk(w,h),ox=oc.getContext('2d'),i,gam=new Float32Array(256);
for(i=0;i<256;i++){var c=i/255;gam[i]=c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
function f(t){return t>.008856?Math.pow(t,1/3):7.787*t+16/116}
for(i=0;i<n;i++){var r=gam[px[4*i]],g=gam[px[4*i+1]],b=gam[px[4*i+2]],X=(.4124*r+.3576*g+.1805*b)/.95047,Y=.2126*r+.7152*g+.0722*b,Z=(.0193*r+.1192*g+.9505*b)/1.08883,fx=f(X),fy=f(Y),fz=f(Z);
Lw[i]=(116*fy-16)*.6;Ac[i]=500*(fx-fy);Bc[i]=200*(fy-fz);A[i]=1;od.data[4*i]=px[4*i];od.data[4*i+1]=px[4*i+1];od.data[4*i+2]=px[4*i+2];od.data[4*i+3]=255}
function centers(){var bw=Math.max(2,Math.round(w*.03)),bh=Math.max(2,Math.round(h*.03)),S=[],x,y,sideMax=Math.round(h*.7);
for(y=0;y<bh;y++)for(x=0;x<w;x+=3){if(x<w*.3||x>w*.7)S.push(y*w+x)}
for(y=0;y<sideMax;y+=3){for(x=0;x<bw;x++)S.push(y*w+x);for(x=w-bw;x<w;x++)S.push(y*w+x)}
S.sort(function(p,q){return Lw[p]-Lw[q]});var K=3,C=[],k,it,m=S.length;
for(k=0;k<K;k++){var s=S[Math.floor(m*(.15+.35*k))];C.push({l:Lw[s],a:Ac[s],b:Bc[s],n:0,v:0})}
var asg=new Uint8Array(m);
for(it=0;it<8;it++){for(k=0;k<K;k++){C[k].sl=0;C[k].sa=0;C[k].sb=0;C[k].n=0}
for(i=0;i<m;i++){var s2=S[i],best=0,bd=1e9;for(k=0;k<K;k++){var dl=Lw[s2]-C[k].l,da=Ac[s2]-C[k].a,db=Bc[s2]-C[k].b,d=dl*dl+da*da+db*db;if(d<bd){bd=d;best=k}}asg[i]=best;var q=C[best];q.sl+=Lw[s2];q.sa+=Ac[s2];q.sb+=Bc[s2];q.n++}
for(k=0;k<K;k++)if(C[k].n){C[k].l=C[k].sl/C[k].n;C[k].a=C[k].sa/C[k].n;C[k].b=C[k].sb/C[k].n}}
for(k=0;k<K;k++)C[k].v=0;
for(i=0;i<m;i++){var q2=C[asg[i]],s3=S[i];q2.v+=Math.sqrt(Math.pow(Lw[s3]-q2.l,2)+Math.pow(Ac[s3]-q2.a,2)+Math.pow(Bc[s3]-q2.b,2))}
var big=0;for(k=0;k<K;k++){if(C[k].n)C[k].v/=C[k].n;if(C[k].n>big)big=C[k].n}
var out=C.filter(function(q){return q.n>=big*.25&&q.n>=m*.08&&q.v<14});
if(!out.length)out=C.filter(function(q){return q.n===big});return out}
var S={w:w,h:h,canvas:oc,man:man};
S.fa=function(i){var m=man[i],a=A[i];return m<0?a*(1+m/127):m>0?a+(1-a)*m/127:a};
S.flush=function(r){var d=od.data,x0=0,y0=0,x1=w,y1=h,x,y,k;if(r){x0=Math.max(0,r.x);y0=Math.max(0,r.y);x1=Math.min(w,r.x+r.w);y1=Math.min(h,r.y+r.h)}
if(x1<=x0||y1<=y0)return;for(y=y0;y<y1;y++)for(x=x0;x<x1;x++){k=y*w+x;d[4*k+3]=Math.round(S.fa(k)*255)}ox.putImageData(od,0,0,x0,y0,x1-x0,y1-y0)};
S.keepAll=function(){for(var k=0;k<n;k++)A[k]=1;var d=od.data;for(var k2=0;k2<n;k2++){d[4*k2]=px[4*k2];d[4*k2+1]=px[4*k2+1];d[4*k2+2]=px[4*k2+2]}S.flush()};
S.auto=function(o){
var C=centers(),x,y,j,k,Ls=box(Lw,w,h,1),As=box(Ac,w,h,1),Bs=box(Bc,w,h,1),spread=0,Tused;
for(k=0;k<C.length;k++)if(C[k].v>spread)spread=C[k].v;
function gdist(i){var m=1e9;for(var k=0;k<C.length;k++){var dl=Ls[i]-C[k].l,da=As[i]-C[k].a,db=Bs[i]-C[k].b,d=dl*dl+da*da+db*db;if(d<m)m=d}return Math.sqrt(m)}
/* automatic tolerance: wall noise decides the minimum, the color of the middle of the photo (usually the face) decides the maximum */
var cx0=Math.round(w*.42),cx1=Math.round(w*.58),cy0=Math.round(h*.38),cy1=Math.round(h*.58),dc=[],cnt=0;
for(y=cy0;y<cy1;y+=2)for(x=cx0;x<cx1;x+=2){dc.push(gdist(y*w+x))}dc.sort(function(a,b){return a-b});var Dc=dc.length?dc[Math.floor(dc.length*.5)]:99;
var Tauto=clamp(3*spread+6,10,30);if(Dc>=12)Tauto=clamp(Math.min(Tauto,Dc*.6),8,30);
function flood(T){var loc2=Math.pow(Math.max(4,T*.6),2),T2=T*T,bg=new Uint8Array(n),q=new Int32Array(n),qh=0,qt=0,i,x,y;
function gd(i){var m=1e9;for(var k=0;k<C.length;k++){var dl=Ls[i]-C[k].l,da=As[i]-C[k].a,db=Bs[i]-C[k].b,d=dl*dl+da*da+db*db;if(d<m)m=d}return m}
function seed(i){if(!bg[i]&&gd(i)<=T2){bg[i]=1;q[qt++]=i}}
for(x=0;x<w;x++){seed(x);seed((h-1)*w+x)}for(y=0;y<h;y++){seed(y*w);seed(y*w+w-1)}
function nb(i,j){if(bg[j])return;var dl=Ls[i]-Ls[j],da=As[i]-As[j],db=Bs[i]-Bs[j];if(dl*dl+da*da+db*db<=loc2&&gd(j)<=T2){bg[j]=1;q[qt++]=j}}
while(qh<qt){i=q[qh++];x=i%w;if(x>0)nb(i,i-1);if(x<w-1)nb(i,i+1);if(i>=w)nb(i,i-w);if(i<n-w)nb(i,i+w)}
return{bg:bg,frac:qt/n}}
var res;
if(o.tol){Tused=o.tol;res=flood(Tused)}
else{Tused=Tauto;res=flood(Tused);for(k=0;k<3&&res.frac>.82;k++){Tused=Math.max(5,Tused*.65);res=flood(Tused)}if(res.frac<.04){Tused=Math.min(40,Tused*1.5);res=flood(Tused)}}
var bg=res.bg,i;
/* keep only the main subject: drop small leftover specks */
var fg=new Uint8Array(n),lab=new Int32Array(n),sizes=[0],cur=0,big=0;for(i=0;i<n;i++)fg[i]=bg[i]?0:1;
for(i=0;i<n;i++){if(!fg[i]||lab[i])continue;cur++;var cnt=0,qq=[i];lab[i]=cur;while(qq.length){var p=qq.pop();cnt++;var px2=p%w;
if(px2>0&&fg[p-1]&&!lab[p-1]){lab[p-1]=cur;qq.push(p-1)}if(px2<w-1&&fg[p+1]&&!lab[p+1]){lab[p+1]=cur;qq.push(p+1)}if(p>=w&&fg[p-w]&&!lab[p-w]){lab[p-w]=cur;qq.push(p-w)}if(p<n-w&&fg[p+w]&&!lab[p+w]){lab[p+w]=cur;qq.push(p+w)}}
sizes[cur]=cnt;if(cnt>big)big=cnt}
for(i=0;i<n;i++)if(fg[i]&&sizes[lab[i]]<big*.04)fg[i]=0;
var shrink=o.shrink||0;for(k=0;k<shrink;k++)fg=erode(fg,w,h);
var al=new Float32Array(n);for(i=0;i<n;i++)al[i]=fg[i];
if(o.feather>0){var kk=Math.max(1,Math.round(o.feather*.9));al=box(al,w,h,kk);al=box(al,w,h,kk)}
for(i=0;i<n;i++)A[i]=al[i];
/* take edge colors from the nearby solid subject so the old wall color does not stay on hair and shoulders */
var cm=new Float32Array(n),R=new Float32Array(n),G=new Float32Array(n),Bl=new Float32Array(n);
for(i=0;i<n;i++)if(A[i]>=.98){cm[i]=1;R[i]=px[4*i];G[i]=px[4*i+1];Bl[i]=px[4*i+2]}
var sw=box(cm,w,h,4),sr=box(R,w,h,4),sg=box(G,w,h,4),sb=box(Bl,w,h,4),d=od.data;
for(i=0;i<n;i++){var a=A[i],rr=px[4*i],gg=px[4*i+1],bb=px[4*i+2];
if(a>.02&&a<.98&&sw[i]>.05){var fr=1-a;rr=rr*(1-fr)+(sr[i]/sw[i])*fr;gg=gg*(1-fr)+(sg[i]/sw[i])*fr;bb=bb*(1-fr)+(sb[i]/sw[i])*fr}
d[4*i]=rr;d[4*i+1]=gg;d[4*i+2]=bb}
S.flush();return Tused};
S.brush=function(cx,cy,r,mode){var x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(w-1,Math.ceil(cx+r)),y0=Math.max(0,Math.floor(cy-r)),y1=Math.min(h-1,Math.ceil(cy+r)),t=mode==='erase'?-1:1,core=.55,x,y,dx,dy,d,s,v,k;
for(y=y0;y<=y1;y++)for(x=x0;x<=x1;x++){dx=x-cx;dy=y-cy;d=Math.sqrt(dx*dx+dy*dy);if(d>r)continue;s=d<=r*core?1:(r-d)/(r*(1-core));v=Math.round(127*s)*t;k=y*w+x;if(t<0){if(v<man[k])man[k]=v}else if(v>man[k])man[k]=v}
var rc={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};S.flush(rc);return rc};
S.push=function(){hist.push(man.slice());if(hist.length>12)hist.shift()};
S.undo=function(){if(!hist.length)return false;man.set(hist.pop());S.flush();return true};
S.reset=function(){for(var k=0;k<n;k++)man[k]=0;hist=[];S.flush()};
S.bbox=function(){var x0=w,x1=-1,y0=-1,y1=-1,x,y,k,rowN;
for(y=0;y<h;y++){rowN=0;for(x=0;x<w;x++){if(S.fa(y*w+x)>.5){rowN++;if(x<x0)x0=x;if(x>x1)x1=x}}if(rowN>Math.max(2,w*.02)){if(y0<0)y0=y;y1=y}}
return y0<0?null:{x0:x0,x1:x1,y0:y0,y1:y1}};
S.data=function(){return od};
return S}

function sizeOpts(){return '<option value="413x531">35 x 45 mm (UK, EU, Schengen, Australia, many IDs)</option><option value="600x600">2 x 2 inch (US passport and visa)</option><option value="591x827">50 x 70 mm (Canada)</option><option value="390x567">33 x 48 mm (China visa)</option><option value="295x413">25 x 35 mm (small ID size)</option><option value="236x295">20 x 25 mm (stamp size)</option><option value="custom">Custom size...</option>'}
var SW=[['#ffffff','White'],['#e3e6ea','Light grey'],['#bfd9f5','Light blue'],['#4a7fc1','Blue'],['#d62f2f','Red']];
var PAPER={'4x6':[1200,1800,'4 x 6 inch'],'5x7':[1500,2100,'5 x 7 inch'],'a4':[2480,3508,'A4'],'letter':[2550,3300,'Letter']};

/* ---------- Background Remover tool ---------- */
function mountRemove(el){
el.innerHTML='<div class="it-wrap pp"><label class="it-drop"><input type="file" accept="image/*" hidden><b>Select photo</b><span>or drop it here</span></label><div class="pp-msg" hidden></div>'+
'<div class="pp-ed" hidden><div class="pp-grid"><div><div class="it-pl pp-tabs"><button type="button" data-m="erase" class="on">Erase</button><button type="button" data-m="restore">Restore</button><button type="button" data-m="pan">Move and zoom</button></div>'+
'<div class="pp-vw"><div class="pp-cv"><div class="pp-ring"></div></div></div><p class="pp-hint">The background is removed automatically. Use <b>Erase</b> and <b>Restore</b> to fix any part.</p></div>'+
'<div><div class="pp-sec"><h3>Fine tune</h3><label>Brush size<input type="range" name="bs" min="8" max="90" value="34"></label><label>Zoom<input type="range" name="zm" min="100" max="400" value="100"></label>'+
'<label>Tolerance (how much color counts as background)<input type="range" name="tol" min="5" max="60" value="22"></label><label>Edge smoothness<input type="range" name="edge" min="0" max="4" step="0.5" value="1"></label>'+
'<div class="it-bt2"><button type="button" data-a="undo">Undo</button><button type="button" data-a="auto">Remove again</button><button type="button" data-a="reset">Reset edits</button></div></div>'+
'<div class="pp-sec"><h3>Background</h3><div class="pp-sw"></div></div>'+
'<div class="pp-sec"><h3>Download</h3><label>Download as<select name="of"><option value="png">PNG (keeps transparent)</option><option value="webp">WebP (keeps transparent)</option><option value="jpg">JPG (needs a color)</option></select></label><button type="button" class="it-b it-go">Create image</button></div></div></div></div><div class="it-rs" hidden><div class="it-rl"></div></div></div>';
var root=$(el,'.pp'),inp=$(root,'input[type=file]'),dz=$(root,'.it-drop'),msg=$(root,'.pp-msg'),ed=$(root,'.pp-ed'),cvw=$(root,'.pp-cv'),vw=$(root,'.pp-vw'),ring=$(root,'.pp-ring'),rs=$(root,'.it-rs'),rl=$(root,'.it-rl'),go=$(root,'.it-go'),sw=$(root,'.pp-sw');
function R(n){return $(root,'[name='+n+']')}
var st={img:null,seg:null,mode:'erase',bg:null,name:'photo',cv:null,busy:false};
SW.forEach(function(c){var b=document.createElement('button');b.type='button';b.style.background=c[0];b.title=c[1];b.setAttribute('data-c',c[0]);sw.appendChild(b)});
var tr=document.createElement('button');tr.type='button';tr.className='tr on';tr.title='Transparent';tr.setAttribute('data-c','');sw.insertBefore(tr,sw.firstChild);
var cp=document.createElement('input');cp.type='color';cp.value='#ffffff';cp.title='Pick a color';sw.appendChild(cp);
function setBg(c){st.bg=c||null;$$(sw,'button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-c')===(c||''))});cvw.classList.toggle('solid',!!c);cvw.style.backgroundColor=c||'#fff'}
sw.onclick=function(e){var b=e.target.closest?e.target.closest('button'):null;if(b)setBg(b.getAttribute('data-c'))};cp.oninput=function(){setBg(cp.value)};
function fit(){if(!st.cv)return;var z=R('zm').value/100,bw=Math.min(vw.clientWidth||600,st.cv.width);st.cv.style.width=Math.round(bw*z)+'px';st.cv.style.height='auto';st.cv.style.touchAction=st.mode==='pan'?'auto':'none'}
function params(){var e=+R('edge').value;return{tol:+R('tol').value,feather:e,shrink:Math.min(2,Math.round(e/1.5))}}
function runAuto(first){st.busy=true;msg.hidden=false;msg.textContent='Removing background...';return new Promise(function(ok){setTimeout(function(){try{var p=params();if(first)p.tol=0;var T=st.seg.auto(p);if(first)R('tol').value=Math.round(T)}catch(e){msg.textContent='Could not process this image.'}msg.hidden=true;st.busy=false;ok()},30)})}
async function pick(files){var f=[].filter.call(files,function(x){return x.type.indexOf('image/')===0})[0];if(!f)return;rs.hidden=true;ed.hidden=true;msg.hidden=false;msg.textContent='Loading photo...';
try{st.img=await loadImg(f)}catch(e){msg.textContent=e.message;return}
st.name=f.name.replace(/\.[^.]+$/,'');var wc=workCanvas(st.img,1200);st.seg=Seg(wc);if(st.cv&&st.cv.parentNode)st.cv.parentNode.removeChild(st.cv);st.cv=st.seg.canvas;cvw.insertBefore(st.cv,ring);wire();
await runAuto(true);ed.hidden=false;setMode('erase');fit();dz.classList.add('sm');$(dz,'b').textContent='Choose another photo';ed.scrollIntoView&&ed.scrollIntoView({behavior:'smooth'})}
inp.onchange=function(){pick(inp.files);inp.value=''};
['dragover','dragenter'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.add('over')})});['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.remove('over')})});dz.addEventListener('drop',function(v){pick(v.dataTransfer.files)});
function setMode(m){st.mode=m;$$(root,'.pp-tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===m)});if(st.cv)st.cv.style.touchAction=m==='pan'?'auto':'none';ring.style.display='none'}
$(root,'.pp-tabs').onclick=function(e){var b=e.target.closest?e.target.closest('button'):null;if(b)setMode(b.getAttribute('data-m'))};
R('zm').oninput=fit;
R('tol').onchange=R('edge').onchange=function(){if(st.seg&&!st.busy)runAuto()};
$(root,'.it-bt2').onclick=function(e){var a=e.target.getAttribute('data-a');if(!a||!st.seg)return;if(a==='undo')st.seg.undo();else if(a==='reset')st.seg.reset();else if(a==='auto'&&!st.busy)runAuto()};
function rr(p){return R('bs').value/2*p.k}
var rect=null;
function ringAt(p){var d=R('bs').value;ring.style.display='block';ring.style.width=ring.style.height=d+'px';ring.style.left=(p.cx-d/2)+'px';ring.style.top=(p.cy-d/2)+'px'}
function wire(){pointer(st.cv,{on:function(){return st.mode!=='pan'&&!st.busy},
start:function(p){st.seg.push();st.seg.brush(p.x,p.y,rr(p),st.mode);ringAt(p)},
move:function(p,l){stroke(l,p,rr(p),function(x,y){st.seg.brush(x,y,rr(p),st.mode)});ringAt(p)},
hover:function(p){if(st.mode!=='pan')ringAt(p)},end:function(){ring.style.display='none'},leave:function(){ring.style.display='none'}})}
go.onclick=async function(){if(!st.seg||st.busy)return;var lbl=go.textContent;go.disabled=true;go.textContent='Working...';rl.innerHTML='';
try{var of=R('of').value,type=of==='jpg'?'image/jpeg':of==='webp'?'image/webp':'image/png',m=Math.min(1,3200/Math.max(st.img.naturalWidth,st.img.naturalHeight)),fw=Math.round(st.img.naturalWidth*m),fh=Math.round(st.img.naturalHeight*m),
fc=mk(fw,fh),x=fc.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(st.img,0,0,fw,fh);x.globalCompositeOperation='destination-in';x.drawImage(st.seg.canvas,0,0,fw,fh);x.globalCompositeOperation='source-over';
var out=fc,note='',bgc=st.bg;if(type==='image/jpeg'&&!bgc){bgc='#ffffff';note='JPG cannot be transparent, so a white background was used. Choose PNG to keep it transparent.'}
if(bgc){out=mk(fw,fh);var y=out.getContext('2d');y.fillStyle=bgc;y.fillRect(0,0,fw,fh);y.drawImage(fc,0,0)}
var b=await blob(out,type,.93);if(b.type&&b.type!==type){note='Your browser could not save '+of.toUpperCase()+', so the file was saved as '+b.type.split('/')[1].toUpperCase()+'.';type=b.type}
var ext=type==='image/jpeg'?'jpg':type.split('/')[1],card=dlBtn(out,st.name+'-no-bg.'+ext,b,note,null,fw+' x '+fh+' px, '+kb(b.size));
var im=$(card,'img');if(!bgc){im.style.background='#fff';im.style.backgroundImage=CK;im.style.backgroundSize='12px 12px'}
rl.appendChild(card);rs.hidden=false;rs.scrollIntoView&&rs.scrollIntoView({behavior:'smooth'})}
catch(e){rl.innerHTML='<p class="it-err"></p>';$(rl,'p').textContent=e.message||String(e);rs.hidden=false}
go.disabled=false;go.textContent=lbl}}

/* ---------- Passport Photo Maker tool ---------- */
function mountPassport(el){
var sw5=SW.map(function(c){return '<button type="button" style="background:'+c[0]+'" title="'+c[1]+'" data-c="'+c[0]+'"'+(c[0]==='#ffffff'?' class="on"':'')+'></button>'}).join('');
el.innerHTML='<div class="it-wrap pp"><label class="it-drop"><input type="file" accept="image/*" hidden><b>Select your photo</b><span>or drop it here. Use a clear, front-facing photo.</span></label><div class="pp-msg" hidden></div>'+
'<div class="pp-ed" hidden><div class="pp-grid two"><div><div class="it-pl pp-tabs"><button type="button" data-m="move" class="on">Move photo</button><button type="button" data-m="erase">Erase background</button><button type="button" data-m="restore">Restore</button></div>'+
'<div class="pp-vw"><div class="pp-cv fit solid"><canvas></canvas><svg class="pp-guide" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="47" rx="26" ry="36" fill="none" stroke="#fff" stroke-width=".7" stroke-dasharray="3 2" vector-effect="non-scaling-stroke" style="stroke:#fff;filter:drop-shadow(0 0 1px #000)"/><line x1="50" y1="8" x2="50" y2="92" stroke="#fff" stroke-width=".4" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" opacity=".7"/></svg><div class="pp-ring"></div></div></div>'+
'<p class="pp-hint">Drag the photo to move it. The dashed oval is only a guide and is not saved.</p><label class="pp-sec" style="margin-top:10px">Brush size (for Erase and Restore)<input type="range" name="bs" min="8" max="90" value="30"></label></div>'+
'<div><div class="pp-sec"><h3>1. Photo size</h3><label>Size<select name="sz">'+sizeOpts()+'</select></label><div class="pp-row cu" hidden><label>Width<input name="cw" type="number" min="10" value="35"></label><label>Height<input name="ch" type="number" min="10" value="45"></label><label>Unit<select name="cu"><option value="mm">mm</option><option value="px">pixels</option></select></label></div></div>'+
'<div class="pp-sec"><h3>2. Background</h3><div class="pp-sw">'+sw5+'<input type="color" name="bgc" value="#ffffff" title="Pick a color"></div><label class="pp-chk"><input type="checkbox" name="rm" checked> Remove the old background</label><label>Tolerance (how much color counts as background)<input type="range" name="tol" min="5" max="60" value="22"></label><div class="it-bt2"><button type="button" data-a="auto">Remove again</button><button type="button" data-a="undo">Undo</button><button type="button" data-a="reset">Reset edits</button></div></div>'+
'<div class="pp-sec"><h3>3. Position and look</h3><label>Zoom<input type="range" name="zm" min="60" max="250" value="100"></label><label>Brightness<input type="range" name="br" min="-40" max="40" value="0"></label><label>Contrast<input type="range" name="co" min="-40" max="40" value="0"></label><label class="pp-chk"><input type="checkbox" name="au"> Auto enhance (balance light, colors and sharpness)</label><label class="pp-chk"><input type="checkbox" name="gd" checked> Show face guide</label><div class="it-bt2"><button type="button" data-a="pos">Reset position</button></div></div>'+
'<div class="pp-sec"><h3>4. Download</h3><label>Output<select name="ot"><option value="one">Single photo</option><option value="sheet">Print sheet (many copies)</option></select></label>'+
'<div class="pp-row one"><label>Format<select name="of"><option value="jpg">JPG</option><option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label><label>Max file size (KB, optional)<input name="mk" type="number" min="5" placeholder="e.g. 50"></label></div>'+
'<div class="pp-row sheet" hidden><label>Paper<select name="pp"><option value="4x6">4 x 6 inch</option><option value="5x7">5 x 7 inch</option><option value="a4">A4</option><option value="letter">Letter</option></select></label><label>Save as<select name="sf"><option value="jpg">JPG</option><option value="pdf">PDF</option><option value="png">PNG</option></select></label><label>Copies (empty = fit the most)<input name="cp" type="number" min="1" placeholder="Auto"></label><label>Gap (mm)<input name="gp" type="number" min="0" max="20" value="2"></label><label class="pp-chk"><input type="checkbox" name="cl" checked> Thin cut lines</label></div>'+
'<label>Quality (%)<input type="range" name="q" min="50" max="100" value="92"></label><button type="button" class="it-b it-go">Make passport photo</button></div></div></div></div><div class="it-rs" hidden><div class="it-rl"></div></div></div>';
var root=$(el,'.pp'),inp=$(root,'input[type=file]'),dz=$(root,'.it-drop'),msg=$(root,'.pp-msg'),ed=$(root,'.pp-ed'),pv=$(root,'canvas'),pvx=pv.getContext('2d',{willReadFrequently:true}),cvw=$(root,'.pp-cv'),ring=$(root,'.pp-ring'),guide=$(root,'.pp-guide'),rs=$(root,'.it-rs'),rl=$(root,'.it-rl'),go=$(root,'.it-go'),swb=$$(root,'.pp-sw button');
function R(n){return $(root,'[name='+n+']')}
var lastZ=100,st={img:null,seg:null,name:'photo',ow:413,oh:531,bg:'#ffffff',s0:1,ox:0,oy:0,mode:'move',busy:false,adj:null,dirty:true,raf:0,hasRm:true};
function size(){var v=R('sz').value;if(v!=='custom'){var p=v.split('x');return{w:+p[0],h:+p[1]}}var w=+R('cw').value||35,h=+R('ch').value||45;if(R('cu').value==='mm')return{w:Math.round(w/25.4*300),h:Math.round(h/25.4*300)};return{w:Math.round(w),h:Math.round(h)}}
function setSize(){var s=size();s.w=clamp(s.w,40,3000);s.h=clamp(s.h,40,3000);st.ow=pv.width=s.w;st.oh=pv.height=s.h;$(root,'.cu').hidden=R('sz').value!=='custom';if(st.seg)place()}
function place(){var b=st.seg.bbox();if(!b){st.s0=st.ow/st.seg.w;st.ox=0;st.oy=0;draw();return}
var bw=b.x1-b.x0+1,bh=b.y1-b.y0+1,sW=st.ow*.92/bw,sH=st.oh*.9/bh;st.s0=Math.max(sW,sH);R('zm').value=100;lastZ=100;
st.ox=st.ow/2-(b.x0+b.x1)/2*st.s0;st.oy=st.oh*.1-b.y0*st.s0;draw()}
function cur(){return st.s0*R('zm').value/100}
function levels(d,n){var h=new Uint32Array(256),c=0,i,l;for(i=0;i<n;i+=1){if(d[4*i+3]>200){l=Math.round(.299*d[4*i]+.587*d[4*i+1]+.114*d[4*i+2]);h[l]++;c++}}
if(c<50)return{lo:0,hi:255,g:1};var a=0,p1=0,p50=0,p99=255,f1=0,f50=0,f99=0;for(i=0;i<256;i++){a+=h[i];if(!f1&&a>=c*.01){p1=i;f1=1}if(!f50&&a>=c*.5){p50=i;f50=1}if(!f99&&a>=c*.99){p99=i;f99=1}}
var lo=p1,hi=Math.max(p99,lo+40),span=Math.min(1.6,255/(hi-lo));if(span<1.05){lo=0;hi=255}var m=clamp((p50-lo)/(hi-lo),.05,.95),g=clamp(Math.log(.5)/Math.log(m),.8,1.25);return{lo:lo,hi:hi,g:g}}
function adjusted(){if(!st.dirty&&st.adj)return st.adj;var od=st.seg.data(),w=st.seg.w,h=st.seg.h,n=w*h,src=od.data,c=st.adj&&st.adj.width===w?st.adj:mk(w,h),x=c.getContext('2d'),out=x.createImageData(w,h),d=out.data,br=+R('br').value*2.55,co=1+R('co').value/100,au=R('au').checked,lut=new Uint8Array(256),sat=au?1.08:1,i,v;
var lv=au?levels(src,n):{lo:0,hi:255,g:1};
for(i=0;i<256;i++){v=(i-lv.lo)/(lv.hi-lv.lo);v=v<0?0:v>1?1:v;v=Math.pow(v,lv.g)*255;v=(v-128)*co+128+br;lut[i]=v<0?0:v>255?255:v}
for(i=0;i<n;i++){var r=lut[src[4*i]],g=lut[src[4*i+1]],b=lut[src[4*i+2]];if(sat!==1){var gr=.299*r+.587*g+.114*b;r=gr+(r-gr)*sat;g=gr+(g-gr)*sat;b=gr+(b-gr)*sat}
d[4*i]=r;d[4*i+1]=g;d[4*i+2]=b;d[4*i+3]=st.seg.fa(i)*255}
x.putImageData(out,0,0);st.adj=c;st.dirty=false;return c}
function paint(c,w,h,sharp){var x=c.getContext('2d');x.fillStyle=st.bg;x.fillRect(0,0,w,h);if(st.seg){var s=cur(),cx=st.ow/2,cy=st.oh/2;x.imageSmoothingQuality='high';x.drawImage(adjusted(),st.ox,st.oy,st.seg.w*s,st.seg.h*s)}if(sharp&&R('au').checked)sharpen(c,.6)}
function draw(){if(st.raf)return;st.raf=requestAnimationFrame(function(){st.raf=0;paint(pv,st.ow,st.oh,true)})}
function dirty(){st.dirty=true;draw()}
function setMode(m){st.mode=m;$$(root,'.pp-tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===m)});pv.style.touchAction='none';pv.style.cursor=m==='move'?'grab':'crosshair';ring.style.display='none'}
async function runAuto(first){st.busy=true;msg.hidden=false;msg.textContent='Removing background...';await new Promise(function(ok){setTimeout(ok,30)});
try{if(R('rm').checked){var T=st.seg.auto({tol:first?0:+R('tol').value,feather:1,shrink:1});if(first)R('tol').value=Math.round(T)}else st.seg.keepAll()}catch(e){msg.textContent='Could not process this image.'}msg.hidden=true;st.busy=false;st.dirty=true}
async function pick(files){var f=[].filter.call(files,function(x){return x.type.indexOf('image/')===0})[0];if(!f)return;rs.hidden=true;ed.hidden=true;msg.hidden=false;msg.textContent='Loading photo...';
try{st.img=await loadImg(f)}catch(e){msg.textContent=e.message;return}
st.name=f.name.replace(/\.[^.]+$/,'');st.seg=Seg(workCanvas(st.img,900));st.adj=null;setSize();await runAuto(true);place();ed.hidden=false;setMode('move');dz.classList.add('sm');$(dz,'b').textContent='Choose another photo';ed.scrollIntoView&&ed.scrollIntoView({behavior:'smooth'})}
inp.onchange=function(){pick(inp.files);inp.value=''};
['dragover','dragenter'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.add('over')})});['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(v){v.preventDefault();dz.classList.remove('over')})});dz.addEventListener('drop',function(v){pick(v.dataTransfer.files)});
$(root,'.pp-tabs').onclick=function(e){var b=e.target.closest?e.target.closest('button'):null;if(b)setMode(b.getAttribute('data-m'))};
R('sz').onchange=setSize;['cw','ch','cu'].forEach(function(n){R(n).onchange=setSize});
function setBg(c){st.bg=c;swb.forEach(function(b){b.classList.toggle('on',b.getAttribute('data-c')===c)});R('bgc').value=c;draw()}
swb.forEach(function(b){b.onclick=function(){setBg(b.getAttribute('data-c'))}});R('bgc').oninput=function(){setBg(R('bgc').value)};
R('zm').oninput=function(){var z=+R('zm').value,k=z/lastZ,cx=st.ow/2,cy=st.oh/2;st.ox=cx-(cx-st.ox)*k;st.oy=cy-(cy-st.oy)*k;lastZ=z;draw()};
['br','co'].forEach(function(n){R(n).oninput=dirty});R('au').onchange=dirty;R('gd').onchange=function(){guide.style.display=R('gd').checked?'block':'none'};
R('rm').onchange=function(){if(st.seg&&!st.busy)runAuto(true).then(function(){draw()})};R('tol').onchange=function(){if(st.seg&&!st.busy&&R('rm').checked)runAuto().then(draw)};
$$(root,'.it-bt2 button').forEach(function(b){b.onclick=function(){var a=b.getAttribute('data-a');if(!st.seg||st.busy)return;
if(a==='undo'){if(st.seg.undo())dirty()}else if(a==='reset'){st.seg.reset();dirty()}else if(a==='auto'){R('rm').checked=true;runAuto().then(draw)}else if(a==='pos'){lastZ=100;place()}}});
R('ot').onchange=function(){var s=R('ot').value==='sheet';$(root,'.one').hidden=s;$(root,'.sheet').hidden=!s};
function toSeg(p){var s=cur();return{x:(p.x-st.ox)/s,y:(p.y-st.oy)/s,s:s}}
function bsz(p){return R('bs').value/2*p.k}
function ringAt(p){var d=R('bs').value;ring.style.display='block';ring.style.width=ring.style.height=d+'px';ring.style.left=(p.cx-d/2)+'px';ring.style.top=(p.cy-d/2)+'px'}
pointer(pv,{on:function(){return !st.busy&&!!st.seg},
start:function(p){if(st.mode==='move'){pv.style.cursor='grabbing';return}st.seg.push();var q=toSeg(p);st.seg.brush(q.x,q.y,bsz(p)/q.s,st.mode);ringAt(p);dirty()},
move:function(p,l){if(st.mode==='move'){st.ox+=p.x-l.x;st.oy+=p.y-l.y;draw();return}var q=toSeg(p),a=toSeg(l);stroke(a,q,bsz(p)/q.s,function(x,y){st.seg.brush(x,y,bsz(p)/q.s,st.mode)});ringAt(p);dirty()},
hover:function(p){if(st.mode!=='move')ringAt(p)},end:function(){ring.style.display='none';if(st.mode==='move')pv.style.cursor='grab'},leave:function(){ring.style.display='none'}});
/* make the photo */
function sheetLayout(pw,ph,w,h,gap){var mg=35,aw=pw-2*mg,ah=ph-2*mg,cols=Math.floor((aw+gap)/(w+gap)),rows=Math.floor((ah+gap)/(h+gap));if(cols<1||rows<1)return{n:0};return{n:cols*rows,cols:cols,rows:rows,x0:Math.round((pw-(cols*(w+gap)-gap))/2),y0:Math.round((ph-(rows*(h+gap)-gap))/2),pw:pw,ph:ph}}
go.onclick=async function(){if(!st.seg||st.busy)return;var lbl=go.textContent;go.disabled=true;go.textContent='Working...';rl.innerHTML='';
try{var one=mk(st.ow,st.oh);paint(one,st.ow,st.oh,true);var q=R('q').value/100,card,base=st.name+'-passport';
if(R('ot').value==='one'){var of=R('of').value,type=of==='png'?'image/png':of==='webp'?'image/webp':'image/jpeg',maxKB=+R('mk').value||0,enc=await encodeMax(one,type,q,maxKB),b=enc.b,note=enc.note||'';
if(b.type&&b.type!==type){note=(note?note+' ':'')+'Your browser could not save '+of.toUpperCase()+', so the file was saved as '+b.type.split('/')[1].toUpperCase()+'.';type=b.type}
var ext=type==='image/jpeg'?(of==='jpeg'?'jpeg':'jpg'):type.split('/')[1];card=dlBtn(one,base+'.'+ext,b,note,null,st.ow+' x '+st.oh+' px, '+kb(b.size))}
else{var P=PAPER[R('pp').value],gap=Math.round((+R('gp').value||0)/25.4*300),L1=sheetLayout(P[0],P[1],st.ow,st.oh,gap),L2=sheetLayout(P[1],P[0],st.ow,st.oh,gap),L=L2.n>L1.n?L2:L1;
if(!L.n)throw new Error('The photo is bigger than the paper. Choose a bigger paper or a smaller photo size.');
var want=+R('cp').value||L.n,cnt=Math.min(want,L.n),sh=mk(L.pw,L.ph),y=sh.getContext('2d');y.fillStyle='#fff';y.fillRect(0,0,L.pw,L.ph);var k=0,r,c;
for(r=0;r<L.rows&&k<cnt;r++)for(c=0;c<L.cols&&k<cnt;c++){var px=L.x0+c*(st.ow+gap),py=L.y0+r*(st.oh+gap);y.drawImage(one,px,py);if(R('cl').checked){y.strokeStyle='#8a8a8a';y.lineWidth=1;y.strokeRect(px+.5,py+.5,st.ow-1,st.oh-1)}k++}
var sf=R('sf').value,info=cnt+' photos on '+P[2]+(L.pw>L.ph?' (landscape)':'')+'. Print at 100 percent size.',jb=await blob(sh,'image/jpeg',q),pu=URL.createObjectURL(jb);
if(sf==='pdf'){var pdf=mkpdf({w:sh.width,h:sh.height,d:new Uint8Array(await ab(jb)),pw:+(L.pw*72/300).toFixed(2),ph:+(L.ph*72/300).toFixed(2)});card=dlBtn(sh,base+'-sheet.pdf',pdf,info,pu,info)}
else if(sf==='png'){var pb=await blob(sh,'image/png');card=dlBtn(sh,base+'-sheet.png',pb,info,pu,kb(pb.size))}
else card=dlBtn(sh,base+'-sheet.jpg',jb,info,pu,kb(jb.size))}
rl.appendChild(card);rs.hidden=false;rs.scrollIntoView&&rs.scrollIntoView({behavior:'smooth'})}
catch(e){rl.innerHTML='<p class="it-err"></p>';$(rl,'p').textContent=e.message||String(e);rs.hidden=false}
go.disabled=false;go.textContent=lbl};
setSize()}

function boot(id,fn){$$(document,'[data-it-tool="'+id+'"]').forEach(function(el){if(el._it)return;el._it=1;fn(el);el.setAttribute('data-it',id);el.removeAttribute('data-it-tool')})}
boot('photo/passport',mountPassport);boot('photo/remove-bg',mountRemove);
})();
