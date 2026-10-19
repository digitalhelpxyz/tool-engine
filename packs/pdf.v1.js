/* tool-engine PDF pack v1 (needs files.js). Uses pdf-lib and pdf.js from a CDN, loaded only when needed. */
(function(){
var IT=window.IT;if(!IT||!IT.file)return;
var PDF='.pdf,application/pdf';
function L(){return IT.script('pdf-lib@1.17.1/dist/pdf-lib.min.js',function(){return window.PDFLib})}
function J(){return IT.script('pdfjs-dist@3.11.174/build/pdf.min.js',function(){return window.pdfjsLib}).then(function(){pdfjsLib.GlobalWorkerOptions.workerSrc=IT.host+'pdfjs-dist@3.11.174/build/pdf.worker.min.js'})}
function kb(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':Math.round(n/1024)+' KB'}
function base(f){return f.name.replace(/\.[^.]+$/,'')}
async function doc(f,keep){await L();var b=await f.arrayBuffer();
try{return await PDFLib.PDFDocument.load(b,{updateMetadata:!!keep})}catch(e){throw new Error('Could not open '+f.name+'. The file may be damaged or password protected.')}}
async function save(d,o){return new Blob([await d.save(o||{})],{type:'application/pdf'})}
async function sub(src,idx){var o=await PDFLib.PDFDocument.create(),pg=await o.copyPages(src,idx);pg.forEach(function(p){o.addPage(p)});return o}
async function pinfo(f){var d=await doc(f),n=d.getPageCount();return{text:n+' page'+(n>1?'s':''),meta:{n:n,title:d.getTitle()||'',author:d.getAuthor()||'',subject:d.getSubject()||'',keywords:d.getKeywords()||'',creator:d.getCreator()||''}}}
function T(id,c){c.accept=PDF;c.pick=c.pick||'Select PDF file';if(!c.info)c.info=pinfo;IT.file(id,c)}
function nth(fs){if(!fs[0].meta)throw new Error('Still reading the PDF, please wait a moment.');return fs[0].meta.n}
function val(R,n){var e=R('[name='+n+']');return e?e.value.trim():''}
T('pdf/merge',{pick:'Select PDF files',multi:true,order:true,btn:'Merge PDF',
run:async function(fs,R,D,P){if(fs.length<2)throw new Error('Select at least 2 PDF files. Use the arrows to change the order.');
await L();var out=await PDFLib.PDFDocument.create();
for(var i=0;i<fs.length;i++){P('Merging '+(i+1)+'/'+fs.length);var d=await doc(fs[i].file),pg=await out.copyPages(d,d.getPageIndices());pg.forEach(function(p){out.addPage(p)})}
return[{blob:await save(out),name:'merged.pdf'}]}});
T('pdf/split',{btn:'Split PDF',
options:function(){return '<label>Split by<select name="m"><option value="r">Page ranges</option><option value="n">Every N pages</option><option value="e">Every page</option></select></label><label>Ranges, or N<input name="v" placeholder="1-3,4-6  or  2"></label>'},
run:async function(fs,R,D,P){var n=nth(fs),m=val(R,'m'),v=val(R,'v'),ch=[],i;
if(m==='e'){for(i=0;i<n;i++)ch.push([i])}
else if(m==='n'){var k=parseInt(v,10);if(!(k>0))throw new Error('Enter how many pages per file, for example 2.');for(i=0;i<n;i+=k){var a=[];for(var j=i;j<Math.min(n,i+k);j++)a.push(j);ch.push(a)}}
else{if(!v)throw new Error('Enter page ranges, for example 1-3,4-6.');v.split(',').forEach(function(p){var x=IT.pages(p,n);if(x.length)ch.push(x)})}
if(!ch.length)throw new Error('No valid pages found.');var src=await doc(fs[0].file),res=[];
for(i=0;i<ch.length;i++){P('Creating file '+(i+1)+'/'+ch.length);res.push({blob:await save(await sub(src,ch[i])),name:base(fs[0].file)+'-part'+(i+1)+'.pdf'})}return res}});
T('pdf/remove-pages',{btn:'Remove pages',
options:function(){return '<label>Pages to remove<input name="v" placeholder="e.g. 2,4-6"></label>'},
run:async function(fs,R){var n=nth(fs),rm=IT.pages(val(R,'v'),n);if(!rm.length)throw new Error('Enter the pages to remove, for example 2,4-6.');
var set={};rm.forEach(function(x){set[x]=1});var keep=[];for(var i=0;i<n;i++)if(!set[i])keep.push(i);
if(!keep.length)throw new Error('You cannot remove all pages.');return[{blob:await save(await sub(await doc(fs[0].file),keep)),name:base(fs[0].file)+'-removed.pdf'}]}});
T('pdf/extract-pages',{btn:'Extract pages',
options:function(){return '<label>Pages to extract<input name="v" placeholder="e.g. 1-3,7"></label>'},
run:async function(fs,R){var n=nth(fs),ix=IT.pages(val(R,'v'),n);if(!ix.length)throw new Error('Enter the pages to extract, for example 1-3,7.');
return[{blob:await save(await sub(await doc(fs[0].file),ix)),name:base(fs[0].file)+'-extracted.pdf'}]}});
T('pdf/rotate',{btn:'Rotate PDF',
options:function(){return '<label>Rotate by<select name="a"><option value="90">90\u00b0 right</option><option value="180">180\u00b0</option><option value="270">90\u00b0 left</option></select></label><label>Pages (empty = all)<input name="v" placeholder="e.g. 2,5-7"></label>'},
run:async function(fs,R){var n=nth(fs),d=await doc(fs[0].file),a=+val(R,'a'),v=val(R,'v'),ix=v?IT.pages(v,n):d.getPageIndices();if(!ix.length)throw new Error('No valid pages found.');
var pgs=d.getPages();ix.forEach(function(i){var p=pgs[i];p.setRotation(PDFLib.degrees((p.getRotation().angle+a)%360))});
return[{blob:await save(d),name:base(fs[0].file)+'-rotated.pdf'}]}});
T('pdf/rearrange',{btn:'Rearrange pages',
options:function(){return '<label>Mode<select name="m"><option value="c">Custom order</option><option value="r">Reverse all pages</option></select></label><label>New order<input name="v" placeholder="e.g. 3,1,2 (unlisted pages go last)"></label>'},
run:async function(fs,R){var n=nth(fs),ix=[],i;if(val(R,'m')==='r'){for(i=n-1;i>=0;i--)ix.push(i)}
else{var c=IT.pages(val(R,'v'),n);if(!c.length)throw new Error('Enter the new order, for example 3,1,2.');var seen={};c.forEach(function(x){if(!seen[x]){seen[x]=1;ix.push(x)}});for(i=0;i<n;i++)if(!seen[i])ix.push(i)}
return[{blob:await save(await sub(await doc(fs[0].file),ix)),name:base(fs[0].file)+'-rearranged.pdf'}]}});
T('pdf/page-numbers',{btn:'Add page numbers',
options:function(){return '<label>Position<select name="p"><option value="bc">Bottom center</option><option value="br">Bottom right</option><option value="bl">Bottom left</option><option value="tc">Top center</option><option value="tr">Top right</option><option value="tl">Top left</option></select></label><label>Format<select name="f"><option value="1">1</option><option value="p">Page 1</option><option value="o">Page 1 of N</option><option value="s">1 / N</option></select></label><label>Start from<input name="s" type="number" value="1" min="0"></label><label>Font size<input name="z" type="number" value="11" min="6" max="40"></label>'},
run:async function(fs,R){var d=await doc(fs[0].file),f=await d.embedFont(PDFLib.StandardFonts.Helvetica),pos=val(R,'p'),fm=val(R,'f'),s=parseInt(val(R,'s'),10),z=+val(R,'z')||11,pgs=d.getPages(),N=pgs.length;if(isNaN(s))s=1;
pgs.forEach(function(p,i){var num=s+i,t=fm==='p'?'Page '+num:fm==='o'?'Page '+num+' of '+(N+s-1):fm==='s'?num+' / '+(N+s-1):String(num),sz=p.getSize(),w=f.widthOfTextAtSize(t,z),m=24,x=pos[1]==='l'?m:pos[1]==='r'?sz.width-w-m:(sz.width-w)/2,y=pos[0]==='b'?m:sz.height-m-z;
p.drawText(t,{x:x,y:y,size:z,font:f,color:PDFLib.rgb(.2,.2,.2)})});
return[{blob:await save(d),name:base(fs[0].file)+'-numbered.pdf'}]}});
T('pdf/watermark',{btn:'Add watermark',
options:function(){return '<label>Watermark text<input name="t" value="CONFIDENTIAL"></label><label>Style<select name="s"><option value="d">Diagonal</option><option value="h">Horizontal</option></select></label><label>Size<input name="z" type="number" value="60" min="10" max="200"></label><label>Opacity (%)<input name="o" type="number" value="25" min="5" max="100"></label><label>Color<select name="c"><option value="g">Gray</option><option value="r">Red</option><option value="b">Blue</option><option value="k">Black</option></select></label>'},
run:async function(fs,R){var t=val(R,'t');if(!t)throw new Error('Enter the watermark text.');var d=await doc(fs[0].file),f=await d.embedFont(PDFLib.StandardFonts.HelveticaBold),z=+val(R,'z')||60,o=(+val(R,'o')||25)/100,dg=val(R,'s')==='d',cl={g:[.5,.5,.5],r:[.85,.1,.1],b:[.1,.3,.85],k:[0,0,0]}[val(R,'c')],a=dg?Math.PI/4:0,tw,th=z*.7;
try{tw=f.widthOfTextAtSize(t,z)}catch(e){throw new Error('Please use English letters and numbers for the watermark text.')}
d.getPages().forEach(function(p){var s=p.getSize(),cx=s.width/2,cy=s.height/2;p.drawText(t,{x:cx-(tw/2)*Math.cos(a)+(th/2)*Math.sin(a),y:cy-(tw/2)*Math.sin(a)-(th/2)*Math.cos(a),size:z,font:f,color:PDFLib.rgb(cl[0],cl[1],cl[2]),opacity:o,rotate:PDFLib.degrees(a*180/Math.PI)})});
return[{blob:await save(d),name:base(fs[0].file)+'-watermarked.pdf'}]}});
T('pdf/crop',{btn:'Crop PDF',
options:function(){return '<label>Top (mm)<input name="t" type="number" value="10" min="0"></label><label>Bottom (mm)<input name="b" type="number" value="10" min="0"></label><label>Left (mm)<input name="l" type="number" value="10" min="0"></label><label>Right (mm)<input name="r" type="number" value="10" min="0"></label>'},
run:async function(fs,R){var d=await doc(fs[0].file),k=72/25.4,t=(+val(R,'t')||0)*k,b=(+val(R,'b')||0)*k,l=(+val(R,'l')||0)*k,r=(+val(R,'r')||0)*k;
d.getPages().forEach(function(p){var m=p.getMediaBox(),w=m.width-l-r,h=m.height-t-b;if(w<=10||h<=10)throw new Error('The margins are too large for this page size.');p.setCropBox(m.x+l,m.y+b,w,h)});
return[{blob:await save(d),name:base(fs[0].file)+'-cropped.pdf',note:'Pages are cropped to the new size. Most PDF viewers show the cropped view.'}]}});
T('pdf/edit-info',{btn:'Save document info',
options:function(){return '<label>Title<input name="t"></label><label>Author<input name="a"></label><label>Subject<input name="s"></label><label>Keywords (comma separated)<input name="k"></label><label>Creator<input name="c"></label>'},
fill:function(R,m){function s(n,v){var e=R('[name='+n+']');if(e)e.value=v}s('t',m.title);s('a',m.author);s('s',m.subject);s('k',m.keywords);s('c',m.creator)},
run:async function(fs,R){var d=await doc(fs[0].file,1);d.setTitle(val(R,'t'));d.setAuthor(val(R,'a'));d.setSubject(val(R,'s'));d.setKeywords(val(R,'k').split(',').map(function(x){return x.trim()}).filter(Boolean));d.setCreator(val(R,'c'));
return[{blob:await save(d),name:base(fs[0].file)+'-info.pdf'}]}});
T('pdf/remove-metadata',{btn:'Remove metadata',
options:function(){return '<div class="ffs" style="width:100%">Removes title, author, subject, keywords, creator, producer, dates and XMP data.</div>'},
run:async function(fs){var d=await doc(fs[0].file),I=d.context.lookup(d.context.trailerInfo.Info);
['Title','Author','Subject','Keywords','Creator','Producer','CreationDate','ModDate'].forEach(function(k){if(I&&I.delete)I.delete(PDFLib.PDFName.of(k))});
try{d.catalog.delete(PDFLib.PDFName.of('Metadata'))}catch(e){}
return[{blob:await save(d),name:base(fs[0].file)+'-clean.pdf'}]}});
async function render(file,idx,scale,type,q,P,cb){await J();var pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
for(var k=0;k<idx.length;k++){P('Page '+(k+1)+'/'+idx.length);var pg=await pdf.getPage(idx[k]+1),vp=pg.getViewport({scale:scale}),c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:x,viewport:vp}).promise;
var b=await new Promise(function(r){c.toBlob(r,type,q)});await cb(b,idx[k],pg.getViewport({scale:1}))}
return pdf.numPages}
T('pdf/compress',{btn:'Compress PDF',
options:function(){return '<label>Mode<select name="m"><option value="s">Strong (pages become images)</option><option value="l">Light (keeps text)</option></select></label><label>Quality (%)<input name="q" type="range" min="30" max="90" value="60"></label><label>Resolution<select name="d"><option value="96">Small (96 dpi)</option><option value="130" selected>Balanced (130 dpi)</option><option value="170">Sharper (170 dpi)</option></select></label>'},
run:async function(fs,R,D,P){var f=fs[0].file,res;
if(val(R,'m')==='l'){var d=await doc(f);var I=d.context.lookup(d.context.trailerInfo.Info);['Producer','Creator'].forEach(function(k){if(I&&I.delete)I.delete(PDFLib.PDFName.of(k))});res=await save(d,{useObjectStreams:true})}
else{await L();var out=await PDFLib.PDFDocument.create(),n=nth(fs),ix=[];for(var i=0;i<n;i++)ix.push(i);
await render(f,ix,(+val(R,'d')||130)/72,'image/jpeg',(+val(R,'q')||60)/100,P,async function(b,i,sz){var im=await out.embedJpg(new Uint8Array(await b.arrayBuffer())),p=out.addPage([sz.width,sz.height]);p.drawImage(im,{x:0,y:0,width:sz.width,height:sz.height})});
res=await save(out)}
var note=res.size>=f.size?'The new file is not smaller. Try Strong mode with a lower quality or resolution.':'Size: '+kb(f.size)+' to '+kb(res.size)+(val(R,'m')==='s'?'. Text in Strong mode becomes part of the page image.':'');
return[{blob:res,name:base(f)+'-compressed.pdf',note:note}]}});
function img(id,type,ext,label){T(id,{btn:'Convert to '+label,
options:function(){return '<label>Quality<select name="d"><option value="100">Normal (100 dpi)</option><option value="150" selected>Good (150 dpi)</option><option value="220">High (220 dpi)</option></select></label><label>Pages (empty = all)<input name="v" placeholder="e.g. 1-3"></label>'+(ext==='jpg'?'<label>JPG quality (%)<input name="q" type="range" min="50" max="100" value="90"></label>':'')},
run:async function(fs,R,D,P){var n=nth(fs),v=val(R,'v'),ix=v?IT.pages(v,n):[],i;if(!v)for(i=0;i<n;i++)ix.push(i);if(!ix.length)throw new Error('No valid pages found.');
var res=[],b0=base(fs[0].file);await render(fs[0].file,ix,(+val(R,'d')||150)/72,type,(+val(R,'q')||90)/100,P,function(b,i){res.push({blob:b,name:b0+'-page-'+(i+1)+'.'+ext})});return res}})}
img('pdf/to-jpg','image/jpeg','jpg','JPG');img('pdf/to-png','image/png','png','PNG');
T('pdf/to-text',{btn:'Extract text',
options:function(){return '<label>Pages (empty = all)<input name="v" placeholder="e.g. 1-5"></label>'},
run:async function(fs,R,D,P){await J();var n=nth(fs),v=val(R,'v'),ix=v?IT.pages(v,n):[],i;if(!v)for(i=0;i<n;i++)ix.push(i);
var pdf=await pdfjsLib.getDocument({data:await fs[0].file.arrayBuffer()}).promise,txt='';
for(i=0;i<ix.length;i++){P('Page '+(i+1)+'/'+ix.length);var tc=await(await pdf.getPage(ix[i]+1)).getTextContent(),s='';tc.items.forEach(function(t){s+=t.str+(t.hasEOL?'\n':' ')});txt+=s.trim()+'\n\n'}
if(!txt.trim())throw new Error('No selectable text found. This PDF may be a scan (image only).');
return[{blob:new Blob([txt],{type:'text/plain'}),name:base(fs[0].file)+'.txt'}]}});
})();
