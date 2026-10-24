/* tool-engine image pack v2: all image tools, every tool can download as JPG, JPEG, PNG or WebP. Needs the template core (window.IT). */
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
/* ---- passport photo maker ---- */
IT.register('image/passport',{btn:'Make passport photo',
options:function(d){return '<label>Photo size<select name="sz"><option value="413x531">35x45 mm (India, UK, EU)</option><option value="600x600">2x2 inch (US)</option></select></label><label>Background<input name="bg" type="color" value="#ffffff"></label><label>Face position<select name="fp"><option value="c">Center</option><option value="t">Higher (keep head)</option></select></label><label>Output<select name="ot"><option value="one">Single photo</option><option value="sheet">Print sheet 4x6 inch</option></select></label>'+FMT(d,'jpg',['jpg','jpeg','png','webp'])+Q(95)},
run:async function(c,it,R){var p=val(R,'sz').split('x'),w=+p[0],h=+p[1],d=mk(w,h),x=d.getContext('2d'),W=c.width,H=c.height;x.fillStyle=val(R,'bg');x.fillRect(0,0,w,h);
var s=Math.max(w/W,h/H),dw=W*s,dh=H*s;x.drawImage(c,(w-dw)/2,val(R,'fp')==='t'?0:(h-dh)/2,dw,dh);var out=d,note='';
if(val(R,'ot')==='sheet'){var g=12,SW=1200,SH=1800,cols=Math.floor((SW+g)/(w+g)),rows=Math.floor((SH+g)/(h+g)),sh=mk(SW,SH),y=sh.getContext('2d');y.fillStyle='#fff';y.fillRect(0,0,SW,SH);var ox=(SW-(cols*(w+g)-g))/2,oy=(SH-(rows*(h+g)-g))/2;for(var r=0;r<rows;r++)for(var k=0;k<cols;k++)y.drawImage(d,ox+k*(w+g),oy+r*(h+g));out=sh;note=cols*rows+' photos on a 4x6 inch sheet. Print at 100 percent size.'}
var r2=await enc(out,FM[val(R,'of')||'jpg'],R,'passport');if(note&&!r2.note)r2.note=note;return r2}});
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
