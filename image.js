/* tool-engine image pack v1 (needs core.js) */
(function(){
var U=IT.u,mk=U.mk,blob=U.blob,white=U.white,same=U.same;
function Q(v){return '<label>Quality (%)<input name="q" type="range" min="10" max="100" value="'+v+'"></label>'}
function qv(R){var e=R('[name=q]');return e?e.value/100:.92}
function fmt(d){return '<label>Output<select name="of"><option value=""'+(d.output?'':' selected')+'>Same as original</option><option value="image/jpeg"'+(d.output==='image/jpeg'?' selected':'')+'>JPG</option><option value="image/png"'+(d.output==='image/png'?' selected':'')+'>PNG</option><option value="image/webp"'+(d.output==='image/webp'?' selected':'')+'>WebP</option></select></label>'}
function draw(c,t){var d=mk(c.width,c.height);d.getContext('2d').drawImage(c,0,0);white(d,t);return d}
IT.register('image/compress',{btn:'Compress now',
options:function(d){return '<label>Target size<input name="tk" type="number" min="1" value="'+(d.target||'')+'" placeholder="e.g. 200"></label><label>Unit<select name="tu"><option>KB</option><option>MB</option></select></label>'+Q(70)+'<label>Output<select name="of"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></label>'},
run:async function(c,it,R){var t=R('[name=of]').value,tk=+R('[name=tk]').value*(R('[name=tu]').value==='MB'?1048576:1024),s=1,b;
function dr(s){var d=mk(c.width*s,c.height*s);d.getContext('2d').drawImage(c,0,0,d.width,d.height);white(d,t);return d}
if(!tk)b=await blob(dr(1),t,qv(R));
else{for(var k=0;k<8;k++){var cc=dr(s),lo=.1,hi=.95;
for(var i=0;i<7;i++){var m=(lo+hi)/2;b=await blob(cc,t,m);if(b.size>tk)hi=m;else lo=m}
b=await blob(cc,t,lo);if(b.size<=tk)break;s*=.85}}
return{blob:b,type:t,suffix:'compressed'}}});
IT.register('image/convert',{btn:'Convert now',
options:function(d){return (d.format?'':'<label>Convert to<select name="of"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>')+(d.format==='image/png'?'':Q(90))},
run:async function(c,it,R,D){var t=D.format||R('[name=of]').value;return{blob:await blob(draw(c,t),t,qv(R)),type:t,suffix:'converted'}}});
IT.register('image/edit',{btn:'Download',
options:function(d){return '<div style="width:100%;font-size:13px;color:#5b6778">Use Resize, Crop and Rotate on each image above, then download.</div>'+fmt(d)+Q(90)},
run:async function(c,it,R){var t=R('[name=of]').value||same(it);return{blob:await blob(draw(c,t),t,qv(R)),type:t,suffix:'edited'}}});
IT.register('image/gray',{btn:'Make black and white',
options:function(){return Q(92)},
run:async function(c,it,R){var t=same(it),d=mk(c.width,c.height),x=d.getContext('2d');x.drawImage(c,0,0);
var g=x.getImageData(0,0,d.width,d.height),p=g.data;for(var i=0;i<p.length;i+=4){var v=p[i]*.299+p[i+1]*.587+p[i+2]*.114;p[i]=p[i+1]=p[i+2]=v}
x.putImageData(g,0,0);white(d,t);return{blob:await blob(d,t,qv(R)),type:t,suffix:'bw'}}});
})();
