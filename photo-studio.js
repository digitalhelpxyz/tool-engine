/* ToolsXYZ Photo Studio v2.1
 * Passport Photo Maker (3 steps) and Background Remover (tabbed editor). Runs in the browser; photos are not uploaded to our server.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). Source: https://github.com/digitalhelpxyz/tool-engine
 * AI background removal uses @imgly/background-removal 1.7.0 (AGPL-3.0, https://github.com/imgly/background-removal-js), loaded from jsDelivr when the user clicks "Remove background".
 * Use: <div data-photo-studio="passport"></div> or <div data-photo-studio="background"></div>, then include this file.
 */
(function(){'use strict';
var D=document,PI=Math.PI;
function $(r,s){return r.querySelector(s)}
function $$(r,s){return [].slice.call(r.querySelectorAll(s))}
function cv(w,h){var c=D.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function cl(v,a,b){return v<a?a:v>b?b:v}
function blobOf(c,t,q){return new Promise(function(ok,no){c.toBlob(function(b){b?ok(b):no(new Error('Your browser could not export this format. Try PNG or JPG.'))},t,q)})}
function imgOf(b){return new Promise(function(ok,no){var i=new Image(),u=URL.createObjectURL(b);i.onload=function(){URL.revokeObjectURL(u);ok(i)};i.onerror=function(){URL.revokeObjectURL(u);no(new Error('This image could not be opened. Try a JPG or PNG photo.'))};i.src=u})}
function saveBlob(b,n){var u=URL.createObjectURL(b),a=D.createElement('a');a.href=u;a.download=n;D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},30000)}

/* photo sizes: [label, width mm, height mm] (common reference sizes; always check the official rules) */
var SIZES=[
['35 x 45 mm (UK, EU/Schengen, Australia, many IDs)',35,45],['India: Passport, Visa, OCI (51 x 51 mm / 2 x 2 in)',51,51],['India: PAN card (25 x 35 mm)',25,35],['India: Driving licence and some forms (35 x 45 mm)',35,45],['India: PIO / PCC at some missions (35 x 35 mm)',35,35],
['United States: Passport and Visa (51 x 51 mm)',51,51],['United Kingdom (35 x 45 mm)',35,45],['European Union / Schengen (35 x 45 mm)',35,45],['Canada (50 x 70 mm)',50,70],['Australia (35 x 45 mm)',35,45],['New Zealand (35 x 45 mm)',35,45],['China (33 x 48 mm)',33,48],['Japan (35 x 45 mm)',35,45],['South Korea (35 x 45 mm)',35,45],['Singapore (35 x 45 mm)',35,45],['Malaysia (35 x 50 mm)',35,50],['Philippines (35 x 45 mm)',35,45],['Russia (35 x 45 mm)',35,45],['Brazil (50 x 70 mm)',50,70],['South Africa (35 x 45 mm)',35,45],['Turkey (50 x 60 mm)',50,60],['Saudi Arabia (40 x 60 mm)',40,60],['United Arab Emirates (43 x 55 mm)',43,55],
['Other: 2 x 2 inch (51 x 51 mm)',51,51],['Other: 1.5 x 2 inch (38 x 51 mm)',38,51],['Other: 1 x 1 inch (25 x 25 mm)',25,25],['Other: 30 x 40 mm',30,40],['Other: 40 x 50 mm',40,50],['Other: 40 x 60 mm',40,60],['Other: 40 x 40 mm',40,40],['Other: 35 x 35 mm',35,35],['Other: Stamp size (20 x 25 mm)',20,25]];
var PAPERS={'4x6':['4 x 6 inch',4,6],'5x7':['5 x 7 inch',5,7],'a4':['A4',8.27,11.69],'letter':['Letter',8.5,11]};
var SW=[['#ffffff','White'],['#e9edf2','Light grey'],['#bcd9f6','Light blue'],['#3f7fc8','Blue'],['#d93a3a','Red']];
var SWX=[['#000000','Black'],['#2fa84f','Green'],['#f2c230','Yellow']];
var ASP=[['0','Free'],['1','1 : 1 (square)'],['0.8','4 : 5'],['0.75','3 : 4'],['1.3333','4 : 3'],['1.5','3 : 2'],['1.7778','16 : 9'],['0.5625','9 : 16'],['0.7778','Passport 35 x 45']];

var CSS='.tp{--ink:#172235;--mut:#617087;--line:#dbe2eb;--acc:#176b59;color:var(--ink);margin:12px 0}.tp *{box-sizing:border-box}.tp [hidden]{display:none!important}'+
'.tp-card{border:1px solid var(--line);border-radius:16px;background:#fff;padding:12px;box-shadow:0 6px 22px rgba(18,35,55,.06)}'+
'.tp-steps{display:flex;gap:6px;margin:0 0 10px}.tp-steps span{flex:1;text-align:center;font-size:12px;font-weight:700;padding:7px 2px;border:1px solid var(--line);border-radius:20px;color:var(--mut)}.tp-steps span.on{background:var(--acc);border-color:var(--acc);color:#fff}'+
'.tp-pick{display:flex;flex-direction:column;align-items:center;gap:6px;padding:36px 14px;border:2px dashed #b6c3d3;border-radius:14px;text-align:center;cursor:pointer;background:#f7f9fc}.tp-pick b{font-size:19px}.tp-pick span{font-size:13px;color:var(--mut)}.tp-pick.over{border-color:var(--acc);background:#e7f5ef}'+
'.tp-bar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px}.tp-bar>*{flex:1 1 auto}'+
'.tp-btn{font:inherit;font-size:13px;font-weight:700;padding:9px 10px;min-height:40px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);cursor:pointer;text-align:center}.tp-btn.p{background:var(--acc);border-color:var(--acc);color:#fff}.tp-btn.on{background:#e7f5ef;border-color:#8fcdb6;color:#135c48}.tp-btn:disabled{opacity:.45;cursor:not-allowed}.tp-btn:focus-visible,.tp input:focus-visible,.tp select:focus-visible{outline:2px solid #278c75;outline-offset:2px}'+
'.tp-stage{position:relative;background:#eef2f7;border-radius:12px;padding:8px;min-height:140px}.tp-views{display:flex;gap:8px;justify-content:center;align-items:flex-start}.tp-v{margin:0;flex:1 1 0;min-width:0;text-align:center}.tp-cap{font-size:12px;font-weight:700;color:var(--mut);margin:0 0 4px}'+
'.tp-w{position:relative;display:inline-block;line-height:0;max-width:100%;overflow:hidden;border-radius:6px}.tp-w canvas{display:block;max-width:100%;max-height:56vh;width:auto;height:auto;background-color:#fff;background-image:linear-gradient(45deg,#dfe4ea 25%,transparent 25%),linear-gradient(-45deg,#dfe4ea 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#dfe4ea 75%),linear-gradient(-45deg,transparent 75%,#dfe4ea 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}.tp-brush .tp-w canvas{touch-action:none;cursor:crosshair}'+
'.tp-crop{position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(10,20,35,.5);cursor:move;touch-action:none}.tp-crop i{position:absolute;width:24px;height:24px;background:#fff;border:3px solid var(--acc);border-radius:50%;touch-action:none}.tp-crop i[data-c=nw]{left:-2px;top:-2px;cursor:nwse-resize}.tp-crop i[data-c=ne]{right:-2px;top:-2px;cursor:nesw-resize}.tp-crop i[data-c=sw]{left:-2px;bottom:-2px;cursor:nesw-resize}.tp-crop i[data-c=se]{right:-2px;bottom:-2px;cursor:nwse-resize}.tp-gd{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}'+
'.tp-ring{position:absolute;border:2px solid #fff;box-shadow:0 0 0 1px #000;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%)}'+
'.tp-ld{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;background:rgba(13,25,39,.8);color:#fff;border-radius:12px}.tp-ldc{width:min(100%,300px)}.tp-sp{width:38px;height:38px;border:4px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:tpspin .8s linear infinite;margin:0 auto 10px}@keyframes tpspin{to{transform:rotate(360deg)}}.tp-ldt{font-weight:800;font-size:16px;margin-bottom:5px}.tp-ldm{font-size:12px;line-height:1.5;margin-bottom:10px}.tp-lb{height:7px;border-radius:20px;background:rgba(255,255,255,.25);overflow:hidden}.tp-lb i{display:block;height:100%;width:8%;background:#70e0b4;border-radius:20px;transition:width .25s}'+
'.tp-pn{margin-top:10px}.tp-r{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.tp-r>*{flex:1 1 120px;min-width:0}.tp-f{display:grid;gap:4px;font-size:13px;font-weight:650}.tp-f small{font-weight:400;color:var(--mut)}.tp select,.tp input[type=number]{width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:#fff;color:var(--ink);font:inherit;font-size:14px;min-width:0}.tp input[type=range]{width:100%;accent-color:var(--acc)}.tp input[type=color]{width:100%;height:40px;border:1px solid var(--line);border-radius:8px;padding:3px;background:#fff}'+
'.tp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}.tp-tabs .tp-btn{flex:1 1 auto}.tp-sws{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.tp-sw{width:34px;height:34px;border-radius:50%;border:2px solid #cfd7e2;padding:0;cursor:pointer}.tp-sw.on{outline:3px solid var(--acc);outline-offset:2px}.tp-sw.tr{background:repeating-conic-gradient(#d5dbe3 0 25%,#fff 0 50%) 0 0/12px 12px}'+
'.tp-msg{border-radius:10px;padding:9px 11px;background:#f2f6fa;color:#45556b;font-size:13px;line-height:1.5;margin:10px 0 0}.tp-msg.err{background:#fff0f0;color:#9b2222}.tp-note{font-size:12px;color:var(--mut);line-height:1.55;margin:10px 0 0}.tp-hint{font-size:12px;color:var(--mut);line-height:1.5;margin:4px 0 0}.tp-sheet{margin-top:10px;text-align:center}.tp-sheet canvas{max-width:100%;max-height:320px;border:1px solid var(--line);border-radius:6px}.tp h4{font-size:14px;margin:12px 0 0}';
CSS+='.tp-card{padding:8px}.tp-steps{margin:0 0 6px}.tp-steps span{font-size:11px;padding:6px 2px}.tp-bar{margin:0 0 6px;gap:5px}.tp-bar .tp-btn{min-height:34px;padding:5px 6px;font-size:12px}.tp-stage{padding:6px;min-height:120px}.tp-w canvas{max-height:min(37vh,400px)}'+
'.tp-dock{display:flex;gap:5px;margin:8px 0 0}.tp-d{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 2px;min-height:48px;font-size:11px;line-height:1.15}.tp-d i{font-style:normal;font-size:16px;line-height:1}.tp-d small{display:block;font-size:10px;font-weight:600;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.tp-d.on{background:#e7f5ef;border-color:#8fcdb6;color:#135c48}'+
'.tp-trays{margin-top:6px;max-height:30vh;overflow:auto}.tp-tr{display:grid;gap:6px}.tp-rc{display:flex;gap:6px;align-items:flex-end}.tp-rc>*{flex:1 1 0;min-width:0}.tp-rc .tp-btn{padding:8px 4px;font-size:12px;min-height:38px}.tp-tr .tp-f{font-size:12px}.tp-ck{display:flex;align-items:center;gap:6px;flex-direction:row}.tp-act{display:flex;gap:6px;margin-top:8px}.tp-act .tp-btn{flex:1 1 0}.tp-act .tp-btn.p{flex:2 1 0}.tp-msg{margin:6px 0 0;padding:7px 9px;font-size:12px}'+
'.tpm *{box-sizing:border-box}.tpm{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(10,20,35,.55);padding:14px;font:inherit;color:#172235}.tpm[hidden]{display:none}.tpm-b{background:#fff;border-radius:16px;width:min(100%,420px);max-height:84vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}.tpm-h{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #dbe2eb}.tpm-t{font-size:16px}.tpm-x{border:0;background:#eef2f7;width:32px;height:32px;border-radius:50%;font-size:14px;cursor:pointer;color:#172235}.tpm-body{display:flex;flex-direction:column;min-height:0;padding:10px 14px 14px;overflow:auto}.tpm-body[hidden]{display:none}.tpm-q{width:100%;padding:10px;border:1px solid #dbe2eb;border-radius:9px;font:inherit;font-size:14px;margin-bottom:8px}.tpm-l{overflow:auto;min-height:120px;max-height:40vh;display:flex;flex-direction:column;gap:6px}.tpm-i{text-align:left;padding:11px 12px;border:1px solid #dbe2eb;border-radius:10px;background:#fff;font:inherit;font-size:14px;color:#172235;cursor:pointer}.tpm-i.on{background:#e7f5ef;border-color:#8fcdb6;font-weight:700}.tpm-c{border-top:1px solid #dbe2eb;margin-top:10px;padding-top:10px;display:grid;gap:8px;font-size:13px}.tpm-cr{display:flex;gap:6px}.tpm-cr>*{flex:1 1 0;min-width:0;padding:9px;border:1px solid #dbe2eb;border-radius:9px;font:inherit;font-size:14px}.tpm-e{font-size:12px;color:#9b2222;margin:0}.tpm-s{text-align:center;overflow:auto;max-height:56vh}.tpm-s canvas{max-width:100%;border:1px solid #dbe2eb;border-radius:6px}.tpm-r{display:flex;gap:6px;margin-top:10px}.tpm-r .tp-btn{flex:1 1 0}';

function sw(extra){var a=(extra?[['','Transparent']]:[]).concat(SW,extra?SWX:[]);return '<div class="tp-sws">'+a.map(function(c){return '<button type="button" class="tp-sw'+(c[0]===''?' tr':'')+'" '+(c[0]?'style="background:'+c[0]+'" ':'')+'title="'+c[1]+'" aria-label="'+c[1]+'" data-bg="'+c[0]+'"></button>'}).join('')+'<label class="tp-f" style="width:86px"><input type="color" name="cc" value="#ffffff" aria-label="Custom color"></label></div>'}
function rg(n,l,a,b,s,v){return '<label class="tp-f"><span>'+l+'</span><input type="range" name="'+n+'" min="'+a+'" max="'+b+'" step="'+s+'" value="'+v+'"></label>'}
function bt(a,t,c){return '<button type="button" class="tp-btn'+(c?' '+c:'')+'" data-a="'+a+'">'+t+'</button>'}
function view(k,cap,crop){return '<figure class="tp-v" data-v="'+k+'"><figcaption class="tp-cap">'+cap+'</figcaption><div class="tp-w"><canvas width="4" height="3"></canvas>'+(crop?'<div class="tp-crop" hidden><i data-c="nw"></i><i data-c="ne"></i><i data-c="sw"></i><i data-c="se"></i><svg class="tp-gd" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="46" rx="27" ry="35" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/><line x1="50" y1="6" x2="50" y2="94" stroke="#fff" stroke-width="1" stroke-dasharray="3 4" vector-effect="non-scaling-stroke" opacity=".7"/></svg></div>':'')+'<div class="tp-ring" hidden></div></div></figure>'}
function share(){return '<div class="tp-r">'+bt('share','Share','p')+bt('copy','Copy page link')+bt('wa','WhatsApp')+'</div>'}

function mount(root,mode){
if(root.getAttribute('data-tp'))return;root.setAttribute('data-tp','1');
var P=mode==='passport',MAXD=P?1600:2400;
root.className+=' tp';
function dk(a){return '<div class="tp-dock">'+a.map(function(t){return '<button type="button" class="tp-btn tp-d" data-a="'+t[0]+'"><i>'+t[1]+'</i>'+t[2]+'</button>'}).join('')+'</div>'}
function tr(k,h){return '<div class="tp-tr" data-k="'+k+'" hidden>'+h+'</div>'}
function rc(){return '<div class="tp-rc">'+[].slice.call(arguments).join('')+'</div>'}
var dpiSel='<label class="tp-f">Resolution<select name="dpi"><option value="300">300 dpi (print)</option><option value="200">200 dpi (smaller)</option><option value="600">600 dpi (large)</option></select></label>',
kbIn=function(ph){return '<label class="tp-f">Max KB <small>(optional)</small><input type="number" name="kb" min="5" placeholder="'+ph+'"></label>'};
var pnP=
'<div class="tp-pn" data-p="1">'+dk([['size','&#9645;','Size<small class="tp-sl"></small>'],['tab-rot','&#8635;','Rotate'],['tab-zoom','&#8853;','Zoom'],['fx','&#8651;','Flip']])+'<div class="tp-trays">'+tr('rot',rc(rg('rf','Straighten',-45,45,0.5,0),bt('rl','&#8634; 90'),bt('rr','90 &#8635;')))+tr('zoom',rg('zm','Zoom (or pinch the frame corners)',100,400,1,100))+'</div><div class="tp-act">'+bt('next','Next: Background &rarr;','p')+'</div></div>'+
'<div class="tp-pn" data-p="2" hidden>'+dk([['tab-bgc','&#9724;','Color'],['tab-adj','&#9728;','Adjust'],['tab-brush','&#9998;','Brush']])+'<div class="tp-trays">'+tr('bgc','<div class="tp-f"><span>Background color</span>'+sw(0)+'</div>')+tr('adj',rc(rg('br','Brightness',60,140,1,100),rg('ct','Contrast',60,140,1,100)))+tr('brush',rc(bt('bm-e','Erase','on'),bt('bm-r','Restore'),bt('ai','Remove again'))+rg('bs','Brush size',8,90,1,30))+'</div><div class="tp-act">'+bt('back','&larr; Back')+bt('next','Next: Download &rarr;','p')+'</div></div>'+
'<div class="tp-pn" data-p="3" hidden>'+dk([['tab-dl','&#11015;','Download'],['tab-sheet','&#9638;','Print sheet'],['tab-share','&#8599;','Share']])+'<div class="tp-trays">'+tr('dl',rc(dpiSel,kbIn('e.g. 100'))+rc(bt('dl-jpg','JPG','p'),bt('dl-png','PNG'),bt('dl-pdf','PDF')))+tr('sheet',rc('<label class="tp-f">Paper<select name="paper"><option value="4x6">4 x 6 inch</option><option value="5x7">5 x 7 inch</option><option value="a4">A4</option><option value="letter">Letter</option></select></label>','<label class="tp-f">Copies<input type="number" name="cp" min="1" max="60" placeholder="Auto"></label>')+rc('<label class="tp-f tp-ck"><input type="checkbox" name="cl" checked> Cut lines</label>',bt('sheet','Generate sheet','p')))+tr('share',share())+'</div><div class="tp-act">'+bt('back','&larr; Back to edit')+'</div></div>';
var pnB='<div class="tp-pn" data-p="b">'+dk([['tab-remove','&#10022;','Remove'],['tab-brush','&#9998;','Brush'],['tab-crop','&#9974;','Crop'],['tab-rotate','&#8635;','Rotate'],['tab-adj','&#9728;','Adjust'],['tab-color','&#9724;','Color'],['tab-save','&#11015;','Save']])+'<div class="tp-trays">'+
tr('remove',rc(bt('ai','&#10022; Remove background with AI','p'),bt('cmp','Hold: see original')))+
tr('brush',rc(bt('bm-e','Erase','on'),bt('bm-r','Restore'))+rg('bs','Brush size',8,90,1,30))+
tr('crop',rc('<label class="tp-f">Crop shape<select name="asp">'+ASP.map(function(a){return '<option value="'+a[0]+'">'+a[1]+'</option>'}).join('')+'</select></label>',bt('rcrop','Reset crop')))+
tr('rotate',rg('rf','Straighten',-45,45,0.5,0)+rc(bt('rl','&#8634; 90'),bt('rr','90 &#8635;'),bt('fx','Flip &#8596;'),bt('fy','Flip &#8597;')))+
tr('adj',rc(rg('br','Brightness',50,150,1,100),rg('ct','Contrast',50,150,1,100)))+
tr('color','<div class="tp-f"><span>Background color</span>'+sw(1)+'</div>')+
tr('save',rc('<label class="tp-f">Format<select name="fmt"><option value="png">PNG (transparent)</option><option value="jpg">JPG</option><option value="webp">WebP (transparent)</option></select></label>',kbIn('e.g. 200'))+rc(bt('dl','Download','p'),bt('share','Share'),bt('copy','Copy link'),bt('wa','WhatsApp')))+'</div></div>';
root.innerHTML='<div class="tp-card">'+(P?'<div class="tp-steps"><span data-s="1">1 Photo</span><span data-s="2">2 Background</span><span data-s="3">3 Download</span></div>':'')+
'<label class="tp-pick"><input type="file" accept="image/*" hidden><b>Select your photo</b><span>JPG, PNG or WebP, up to 25 MB. Your photo is not uploaded to our server.</span></label>'+
'<div class="tp-app" hidden><div class="tp-bar">'+bt('undo','&#8630; Undo')+bt('redo','Redo &#8631;')+bt('reset','Reset')+'<label class="tp-btn">Change photo<input type="file" accept="image/*" hidden></label></div>'+
'<div class="tp-stage"><div class="tp-views">'+(P?view('a','Original',1)+view('b','Background removed',0):view('a','',1))+'</div><div class="tp-ld" hidden><div class="tp-ldc"><div class="tp-sp"></div><div class="tp-ldt"></div><div class="tp-ldm"></div><div class="tp-lb"><i></i></div></div></div></div>'+(P?pnP:pnB)+'</div>'+
'<p class="tp-msg" role="status" aria-live="polite">Select a photo to start.</p><p class="tp-note">'+(P?'Photo sizes and background rules differ by country and office. These are common reference sizes, not a guarantee of acceptance. Check the official requirements before you submit or print.':'Automatic removal depends on photo quality and may need a little touch-up with the brush. The AI library and model files are downloaded from their publisher the first time.')+'</p></div>';
var mdl=D.createElement('div');mdl.className='tpm';mdl.hidden=true;
mdl.innerHTML='<div class="tpm-b" role="dialog" aria-modal="true"><div class="tpm-h"><b class="tpm-t"></b><button type="button" class="tpm-x" data-m="x" aria-label="Close">&#10005;</button></div>'+
'<div class="tpm-body" data-m="size"><input type="search" class="tpm-q" placeholder="Search country or size" aria-label="Search sizes"><div class="tpm-l"></div><div class="tpm-c"><b>Custom size</b><div class="tpm-cr"><input type="number" class="tpm-cw" min="5" max="300" step="any" placeholder="Width" value="35" aria-label="Width"><input type="number" class="tpm-ch" min="5" max="300" step="any" placeholder="Height" value="45" aria-label="Height"><select class="tpm-cu" aria-label="Unit"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option></select></div><p class="tpm-e"></p><button type="button" class="tp-btn p" data-m="custom">Use custom size</button></div></div>'+
'<div class="tpm-body" data-m="sheet" hidden><div class="tpm-s"><canvas></canvas></div><div class="tpm-r"><button type="button" class="tp-btn p" data-a="sheet-jpg">JPG</button><button type="button" class="tp-btn" data-a="sheet-pdf">PDF</button><button type="button" class="tp-btn" data-a="print">Print</button></div></div></div>';
D.body.appendChild(mdl);
var msg=$(root,'.tp-msg'),app=$(root,'.tp-app'),pick=$(root,'.tp-pick'),vA=$(root,'[data-v=a]'),vB=$(root,'[data-v=b]'),cvA=$(vA,'canvas'),cvB=vB&&$(vB,'canvas'),cropEl=$(vA,'.tp-crop'),ld=$(root,'.tp-ld');
function R(n){return $(root,'[name='+n+']')}
function say(t,e){msg.textContent=t;msg.className='tp-msg'+(e?' err':'')}
var S={src:null,aiRes:null,cut:null,strokes:[],si:0,rq:0,rf:0,fx:0,fy:0,crop:{x:0,y:0,w:1,h:1},asp:0,br:100,ct:100,bg:P?'#ffffff':'',ai:0,sz:'0',cw:35,ch:45,cu:'mm',step:1,tab:'remove',bm:'e',bs:30,hist:[],hi:-1,cmp:0,cur:null,busy:0,name:'photo',final:null,sheet:null};

/* ---- geometry ---- */
function RD(){var a=(S.rq*90+S.rf)*PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),w=S.src.width,h=S.src.height;return{w:w*c+h*s,h:w*s+h*c}}
function szMM(){if(S.sz==='c'){var k={mm:1,cm:10,'in':25.4}[S.cu]||1;return[S.cw*k,S.ch*k]}var z=SIZES[+S.sz]||SIZES[0];return[z[1],z[2]]}
function fitRect(z){var r=RD(),cx=S.crop.x+S.crop.w/2,cy=S.crop.y+S.crop.h/2,cw,ch;if(!S.asp)return{x:0,y:0,w:1,h:1};if(r.w/r.h>S.asp){ch=r.h;cw=ch*S.asp}else{cw=r.w;ch=cw/S.asp}cw/=z;ch/=z;var w=cw/r.w,h=ch/r.h;return{x:cl(cx-w/2,0,1-w),y:cl(cy-h/2,0,1-h),w:w,h:h}}
function zoomOf(){if(!S.asp)return 1;var r=RD(),fw=r.w/r.h>S.asp?r.h*S.asp:r.w;return Math.max(1,fw/(S.crop.w*r.w))}
function setAsp(a,reset){S.asp=a;if(reset)S.crop={x:0,y:0,w:1,h:1};S.crop=fitRect(1)}
function setRot(fn){var z=zoomOf();fn();S.crop=S.asp?fitRect(z):{x:0,y:0,w:1,h:1}}

/* ---- render ---- */
function adjust(c){var x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height),p=d.data,k=S.ct/100,b=(S.br-100)*1.8,lut=new Uint8ClampedArray(256),i;for(i=0;i<256;i++)lut[i]=(i-128)*k+128+b;for(i=0;i<p.length;i+=4){p[i]=lut[p[i]];p[i+1]=lut[p[i+1]];p[i+2]=lut[p[i+2]]}x.putImageData(d,0,0)}
function compose(w,h,o){var r=RD(),g=o.full?{x:0,y:0,w:1,h:1}:S.crop,s=w/(g.w*r.w),out=cv(w,h),x=out.getContext('2d');if(o.bg){x.fillStyle=o.bg;x.fillRect(0,0,out.width,out.height)}
var adj=o.adj&&(S.br!==100||S.ct!==100),t=adj?cv(w,h):out,tx=t.getContext('2d');tx.save();tx.translate(-g.x*r.w*s+r.w*s/2,-g.y*r.h*s+r.h*s/2);tx.rotate((S.rq*90+S.rf)*PI/180);tx.scale(S.fx?-1:1,S.fy?-1:1);tx.imageSmoothingQuality='high';var L=o.layer;tx.drawImage(L,-L.width*s/2,-L.height*s/2,L.width*s,L.height*s);tx.restore();if(adj){adjust(t);x.drawImage(t,0,0)}return out}
function prev(c,o,n){var r=RD(),g=o.full?{x:0,y:0,w:1,h:1}:S.crop,rw=g.w*r.w,rh=g.h*r.h,av=Math.max(160,root.clientWidth-40)/n,pw=Math.round(Math.min(900,av*Math.min(2,window.devicePixelRatio||1))),ph=Math.round(pw*rh/rw),im=compose(pw,ph,o);c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0)}
function ovl(on){if(!cropEl)return;cropEl.hidden=!on;if(!on)return;var g=S.crop;cropEl.style.left=g.x*100+'%';cropEl.style.top=g.y*100+'%';cropEl.style.width=g.w*100+'%';cropEl.style.height=g.h*100+'%';var gd=$(cropEl,'.tp-gd');if(gd)gd.style.display=P?'block':'none'}
var raf=0;function render(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;draw()})}
function draw(){if(!S.src)return;
if(P){if(S.step===1){prev(cvA,{full:1,layer:S.src,bg:'#ffffff'},1);ovl(1)}
else if(S.step===2){prev(cvA,{layer:S.src,bg:'#ffffff'},2);prev(cvB,{layer:S.cut,bg:S.bg||'#ffffff',adj:1},2);ovl(0)}
else{prev(cvA,{layer:S.cut,bg:S.bg||'#ffffff',adj:1},1);ovl(0)}}
else{var cr=S.tab==='crop';prev(cvA,{full:cr,layer:S.cmp?S.src:S.cut,bg:S.bg,adj:!S.cmp},1);ovl(cr)}
btns()}
function btns(){var u=$(root,'[data-a=undo]'),r=$(root,'[data-a=redo]');u.disabled=S.hi<=0;r.disabled=S.hi>=S.hist.length-1}

/* ---- history ---- */
function snap(){return JSON.stringify({rq:S.rq,rf:S.rf,fx:S.fx,fy:S.fy,crop:S.crop,asp:S.asp,br:S.br,ct:S.ct,bg:S.bg,ai:S.ai,si:S.si,sz:S.sz,cw:S.cw,ch:S.ch,cu:S.cu})}
function commit(){var s=snap();if(S.hist[S.hi]===s)return;S.hist=S.hist.slice(0,S.hi+1);S.hist.push(s);if(S.hist.length>80)S.hist.shift();S.hi=S.hist.length-1}
function resetHist(){S.hist=[snap()];S.hi=0}
function restore(s){var o=JSON.parse(s),k;for(k in o)S[k]=o[k];rebuild();sync();render()}
function undo(){if(S.hi>0){S.hi--;restore(S.hist[S.hi])}}
function redo(){if(S.hi<S.hist.length-1){S.hi++;restore(S.hist[S.hi])}}
function sync(){var m={rf:S.rf,br:S.br,ct:S.ct,sz:S.sz,cw:S.cw,ch:S.ch,cu:S.cu};$$(root,'[name]').forEach(function(e){var n=e.getAttribute('name');if(n in m)e.value=m[n]});$$(root,'[name=zm]').forEach(function(e){e.value=Math.round(zoomOf()*100)});$$(root,'[name=asp]').forEach(function(e){var best='0',d=1e9;ASP.forEach(function(a){var v=Math.abs(+a[0]-S.asp);if(v<d){d=v;best=a[0]}});e.value=best});
$$(root,'[data-bg]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-bg')===(S.bg||''))});$$(root,'.tp-sl').forEach(function(e){var m=szMM();e.textContent=(Math.round(m[0]*10)/10)+' x '+(Math.round(m[1]*10)/10)+' mm'})}

/* ---- brush layer ---- */
function seg(c,st,i){var p=st.p,x=c.getContext('2d'),x1=p[2*i],y1=p[2*i+1],x0=i?p[2*i-2]:x1,y0=i?p[2*i-1]:y1,s=st.s;
if(st.m==='e'){x.save();x.globalCompositeOperation='destination-out';x.lineCap=x.lineJoin='round';x.lineWidth=s;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();x.restore()}
else{var d=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(d/(s/4))),k;for(k=1;k<=n;k++){x.save();x.beginPath();x.arc(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,s/2,0,PI*2);x.clip();x.drawImage(S.src,0,0);x.restore()}}}
function rebuild(){if(!S.src)return;var b=S.ai&&S.aiRes?S.aiRes:S.src,c=cv(b.width,b.height),j,i;c.getContext('2d').drawImage(b,0,0);S.cut=c;for(j=0;j<S.si;j++){var st=S.strokes[j];for(i=0;i<st.p.length/2;i++)seg(c,st,i)}}
function isBrush(){return P?(S.step===2&&S.tab==='brush'):S.tab==='brush'}
function brushCv(){return isBrush()?(P?cvB:cvA):null}
function toSrc(c,e){var r=c.getBoundingClientRect(),u=(e.clientX-r.left)/r.width,v=(e.clientY-r.top)/r.height,d=RD(),X=(S.crop.x+u*S.crop.w)*d.w-d.w/2,Y=(S.crop.y+v*S.crop.h)*d.h-d.h/2,a=(S.rq*90+S.rf)*PI/180,cs=Math.cos(a),sn=Math.sin(a),x=X*cs+Y*sn,y=-X*sn+Y*cs;if(S.fx)x=-x;if(S.fy)y=-y;return[x+S.src.width/2,y+S.src.height/2,d.w*S.crop.w/r.width]}
function ring(c,e,on){var w=c.parentNode,rg0=$(w,'.tp-ring');if(!on){rg0.hidden=true;return}var r=w.getBoundingClientRect();rg0.hidden=false;rg0.style.width=rg0.style.height=S.bs+'px';rg0.style.left=(e.clientX-r.left)+'px';rg0.style.top=(e.clientY-r.top)+'px'}
[cvA,cvB].forEach(function(c){if(!c)return;
c.addEventListener('pointerdown',function(e){if(brushCv()!==c||S.busy)return;var p=toSrc(c,e);S.strokes.length=S.si;var st={m:S.bm,s:Math.max(1,S.bs*p[2]),p:[p[0],p[1]]};S.strokes.push(st);S.si++;S.cur=st;seg(S.cut,st,0);c.setPointerCapture(e.pointerId);ring(c,e,1);render();e.preventDefault()});
c.addEventListener('pointermove',function(e){if(brushCv()!==c)return;ring(c,e,1);if(!S.cur)return;var p=toSrc(c,e);S.cur.p.push(p[0],p[1]);seg(S.cut,S.cur,S.cur.p.length/2-1);render()});
function end(e){ring(c,e,0);if(S.cur){S.cur=null;commit();render()}}
c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);c.addEventListener('pointerleave',function(e){if(!S.cur)ring(c,e,0)})});

/* ---- crop frame ---- */
var drag=null;
if(cropEl){cropEl.addEventListener('pointerdown',function(e){var h=e.target.getAttribute&&e.target.getAttribute('data-c'),w=cropEl.parentNode.getBoundingClientRect();drag={m:h||'move',x:e.clientX,y:e.clientY,r:{x:S.crop.x,y:S.crop.y,w:S.crop.w,h:S.crop.h},b:w};cropEl.setPointerCapture(e.pointerId);e.preventDefault()});
cropEl.addEventListener('pointermove',function(e){if(!drag)return;var dx=(e.clientX-drag.x)/drag.b.width,dy=(e.clientY-drag.y)/drag.b.height,r=drag.r,d=RD();
if(drag.m==='move'){S.crop={x:cl(r.x+dx,0,1-r.w),y:cl(r.y+dy,0,1-r.h),w:r.w,h:r.h}}
else{var west=drag.m.indexOf('w')>-1,north=drag.m.indexOf('n')>-1,ax=west?r.x+r.w:r.x,ay=north?r.y+r.h:r.y,px=cl((west?r.x:r.x+r.w)+dx,0,1),py=cl((north?r.y:r.y+r.h)+dy,0,1),w=Math.max(.05,Math.abs(px-ax)),h=Math.max(.05,Math.abs(py-ay));
if(S.asp){h=w*d.w/(d.h*S.asp);var hm=north?ay:1-ay,wm=west?ax:1-ax;if(h>hm){h=hm;w=h*d.h*S.asp/d.w}if(w>wm){w=wm;h=w*d.w/(d.h*S.asp)}}
S.crop={x:west?ax-w:ax,y:north?ay-h:ay,w:w,h:h}}
var zm=R('zm');if(zm)zm.value=Math.round(zoomOf()*100);render()});
function ce(){if(drag){drag=null;commit();render()}}cropEl.addEventListener('pointerup',ce);cropEl.addEventListener('pointercancel',ce)}

/* ---- AI ---- */
function aiRemove(b,cb){if(window.TXPS_AI)return window.TXPS_AI(b,cb);
if(!aiRemove.p)aiRemove.p=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm').catch(function(e){aiRemove.p=null;throw e});
return aiRemove.p.then(function(m){var f=m.default||m.removeBackground;if(typeof f!=='function')throw new Error('Background-removal engine could not start.');return f(b,{model:'isnet_fp16',output:{format:'image/png',quality:1,type:'foreground'},progress:function(k,c,t){cb&&cb(k,c,t)}})})}
function showLd(t,m,p){ld.hidden=false;$(ld,'.tp-ldt').textContent=t;$(ld,'.tp-ldm').textContent=m||'';$(ld,'.tp-lb i').style.width=cl(p||8,4,100)+'%'}
async function runAI(){if(S.busy||!S.src)return;S.busy=1;showLd('Removing background...','Loading the AI engine. The first time, AI files are downloaded once. Keep this tab open.',8);var t0=Date.now(),tm=setInterval(function(){var el=(Date.now()-t0)/1000;$(ld,'.tp-lb i').style.width=Math.min(88,10+el*1.6)+'%';if(el>20)$(ld,'.tp-ldm').textContent='Still working. Large photos and the first run can take longer.'},700);
try{var inp=await blobOf(S.src,'image/png',1),out=await aiRemove(inp,function(k,c,t){if(typeof c==='number'&&t>0){$(ld,'.tp-ldm').textContent=String(k||'Processing')+' ('+c+'/'+t+')'}}),im=await imgOf(out),r=cv(S.src.width,S.src.height);r.getContext('2d').drawImage(im,0,0,r.width,r.height);S.aiRes=r;S.ai=1;rebuild();commit();say('Background removed. Use the brush to touch up the edges if needed.')}
catch(e){say('AI background removal could not run. Check your connection and try again. ('+(e&&e.message||e)+')',1)}
finally{clearInterval(tm);ld.hidden=true;S.busy=0;render()}}

/* ---- load photo ---- */
async function load(f){if(!f)return;if(!/^image\//.test(f.type))return say('Please choose a JPG, PNG or WebP image.',1);if(f.size>25*1024*1024)return say('Please choose an image smaller than 25 MB.',1);
try{say('Loading photo...');var im=await imgOf(f),nw=im.naturalWidth||im.width,nh=im.naturalHeight||im.height,m=Math.min(1,MAXD/Math.max(nw,nh));
S.src=cv(nw*m,nh*m);S.src.getContext('2d').drawImage(im,0,0,S.src.width,S.src.height);S.aiRes=null;S.strokes=[];S.si=0;S.rq=0;S.rf=0;S.fx=0;S.fy=0;S.br=100;S.ct=100;S.bg=P?'#ffffff':'';S.ai=0;S.crop={x:0,y:0,w:1,h:1};S.final=null;S.sheet=null;S.name=(f.name||'photo').replace(/\.[^.]+$/,'')||'photo';
if(P){S.sz='0';S.step=1;var z=szMM();S.asp=z[0]/z[1];S.crop=fitRect(1)}else{S.asp=0;S.tab='remove'}
rebuild();pick.hidden=true;app.hidden=false;if(P)go(1);else setTab('remove');resetHist();sync();render();say(P?'Photo loaded. Choose the size, then place the face inside the frame.':'Photo loaded. Click "Remove background with AI".')}
catch(e){say(e.message||String(e),1)}}
$$(root,'input[type=file]').forEach(function(i){i.addEventListener('change',function(){load(i.files&&i.files[0]);i.value=''})});
['dragover','dragenter'].forEach(function(n){pick.addEventListener(n,function(e){e.preventDefault();pick.classList.add('over')})});['dragleave','drop'].forEach(function(n){pick.addEventListener(n,function(e){e.preventDefault();pick.classList.remove('over')})});pick.addEventListener('drop',function(e){load(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0])});

/* ---- steps / tabs / popups ---- */
function setTab(k){S.tab=k;var pn=$(root,'.tp-pn:not([hidden])');if(!pn)return;$$(pn,'.tp-tr').forEach(function(t){t.hidden=t.getAttribute('data-k')!==k});$$(pn,'[data-a^=tab-]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-a')==='tab-'+k)});root.classList.toggle('tp-brush',isBrush());render()}
function go(n){S.step=n;$$(root,'.tp-steps span').forEach(function(s){s.classList.toggle('on',+s.getAttribute('data-s')===n)});$$(root,'.tp-pn').forEach(function(p){p.hidden=p.getAttribute('data-p')!==String(n)});vB.hidden=n!==2;$(vA,'.tp-cap').textContent=n===1?'Drag the frame over your face':n===2?'Original':'Final photo';resetHist();setTab({1:'rot',2:'bgc',3:'dl'}[n])}
function setBm(m){S.bm=m;$$(root,'[data-a=bm-e]').forEach(function(b){b.classList.toggle('on',m==='e')});$$(root,'[data-a=bm-r]').forEach(function(b){b.classList.toggle('on',m==='r')})}
function openM(n){mdl.hidden=false;$$(mdl,'.tpm-body').forEach(function(b){b.hidden=b.getAttribute('data-m')!==n});$(mdl,'.tpm-t').textContent=n==='size'?'Choose photo size':'Print sheet';if(n==='size'){$(mdl,'.tpm-q').value='';$(mdl,'.tpm-e').textContent='';fillSizes('')}}
function closeM(){mdl.hidden=true}
function fillSizes(q){q=q.toLowerCase().trim();var h='';SIZES.forEach(function(z,i){if(q&&z[0].toLowerCase().indexOf(q)<0)return;h+='<button type="button" class="tpm-i'+(S.sz===String(i)?' on':'')+'" data-sz="'+i+'">'+z[0]+'</button>'});$(mdl,'.tpm-l').innerHTML=h||'<p class="tpm-e">No size found. Use the custom size below.</p>'}
function afterSize(){var m=szMM();setAsp(m[0]/m[1],1);commit();closeM();sync();render()}
mdl.addEventListener('click',function(e){var t=e.target;if(t===mdl||(t.getAttribute&&t.getAttribute('data-m')==='x')){closeM();return}var si=t.closest&&t.closest('[data-sz]');if(si){S.sz=String(si.getAttribute('data-sz'));afterSize();return}
if(t.getAttribute&&t.getAttribute('data-m')==='custom'){var w=+$(mdl,'.tpm-cw').value,h=+$(mdl,'.tpm-ch').value;if(!(w>=5&&h>=5)){$(mdl,'.tpm-e').textContent='Enter a width and height of at least 5.';return}S.sz='c';S.cw=w;S.ch=h;S.cu=$(mdl,'.tpm-cu').value;afterSize();return}
var ab=t.closest&&t.closest('[data-a]');if(ab)act(ab.getAttribute('data-a'))});
mdl.addEventListener('input',function(e){if(e.target.classList&&e.target.classList.contains('tpm-q'))fillSizes(e.target.value)});
D.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mdl.hidden)closeM()});

/* ---- output ---- */
function outDims(){if(P){var m=szMM(),d=+R('dpi').value||300;return[Math.round(m[0]/25.4*d),Math.round(m[1]/25.4*d)]}var r=RD(),w=Math.round(S.crop.w*r.w),h=Math.round(S.crop.h*r.h),k=Math.min(1,4000/Math.max(w,h));return[Math.round(w*k),Math.round(h*k)]}
function makeFinal(){var d=outDims();S.final=compose(d[0],d[1],{layer:S.cut,bg:S.bg||(P?'#ffffff':''),adj:1});return S.final}
async function encode(c,type,kb){var q=.92,b=await blobOf(c,type,q);if(kb&&type!=='image/png'){var lim=kb*1024,w=c.width,h=c.height,t=c,n=0;while(b.size>lim&&n<24){if(q>.35){q-=.07}else{w=Math.round(w*.9);h=Math.round(h*.9);t=cv(w,h);t.getContext('2d').drawImage(c,0,0,w,h)}b=await blobOf(t,type,q);n++}}return b}
function flat(c){var o=cv(c.width,c.height),x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(c,0,0);return o}
function kbv(){var e=R('kb'),v=e?+e.value:0;return v>0?v:0}
function pdfOf(jpeg,w,h,pw,ph){return new Promise(function(ok,no){var fr=new FileReader();fr.onload=function(){try{var u=new Uint8Array(fr.result),parts=[],off=0,ofs=[];function add(s){var a=typeof s==='string'?new TextEncoder().encode(s):s;parts.push(a);off+=a.length}function obj(i,s){ofs[i]=off;add(i+' 0 obj\n'+s+'\nendobj\n')}
add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Count 1/Kids[3 0 R]>>');var sc=Math.min(pw/w,ph/h),dw=w*sc,dh=h*sc,cs='q '+dw.toFixed(3)+' 0 0 '+dh.toFixed(3)+' '+((pw-dw)/2).toFixed(3)+' '+((ph-dh)/2).toFixed(3)+' cm /Im0 Do Q';
obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+pw+' '+ph+']/Resources<</XObject<</Im0 5 0 R>>>>/Contents 4 0 R>>');obj(4,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');ofs[5]=off;add('5 0 obj\n<</Type/XObject/Subtype/Image/Width '+w+'/Height '+h+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+u.length+'>>\nstream\n');add(u);add('\nendstream\nendobj\n');
var xr=off,s='xref\n0 6\n0000000000 65535 f \n',i;for(i=1;i<=5;i++)s+=('0000000000'+ofs[i]).slice(-10)+' 00000 n \n';add(s+'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');ok(new Blob(parts,{type:'application/pdf'}))}catch(e){no(e)}};fr.onerror=no;fr.readAsArrayBuffer(jpeg)})}
function makeSheet(){var one=S.final||makeFinal(),pp=PAPERS[R('paper').value]||PAPERS['4x6'],dpi=+R('dpi').value||300,g=Math.round(dpi/15),best=null,o;
[0,1].forEach(function(r){var W=Math.round((r?pp[2]:pp[1])*dpi),H=Math.round((r?pp[1]:pp[2])*dpi),cols=Math.max(0,Math.floor((W+g)/(one.width+g))),rows=Math.max(0,Math.floor((H+g)/(one.height+g)));if(!best||cols*rows>best.cols*best.rows)best={W:W,H:H,cols:cols,rows:rows,land:r}});
if(best.cols*best.rows<1)throw new Error('This photo size does not fit on that paper. Choose a bigger paper size.');
var want=+R('cp').value,n=Math.min(best.cols*best.rows,want>0?want:1e9),sh=cv(best.W,best.H),x=sh.getContext('2d'),ow=best.cols*(one.width+g)-g,oh=Math.ceil(n/best.cols)*(one.height+g)-g,ox=(best.W-ow)/2,oy=(best.H-oh)/2,i;
x.fillStyle='#fff';x.fillRect(0,0,best.W,best.H);for(i=0;i<n;i++){var cx=ox+(i%best.cols)*(one.width+g),cy=oy+Math.floor(i/best.cols)*(one.height+g);x.drawImage(one,cx,cy);if(R('cl').checked){x.strokeStyle='#9aa5b4';x.lineWidth=1;x.strokeRect(cx-.5,cy-.5,one.width+1,one.height+1)}}
S.sheet={c:sh,n:n,pw:best.W/dpi,ph:best.H/dpi};return S.sheet}
function pageUrl(){return location.href.split('#')[0]}
async function doShare(){try{var c,type,name;if(P){c=S.final||makeFinal();type='image/jpeg';c=flat(c);name='passport-photo.jpg'}else{c=makeFinal();var f=R('fmt').value;type=f==='jpg'?'image/jpeg':f==='webp'?'image/webp':'image/png';if(type==='image/jpeg')c=flat(c);name=S.name+'-no-bg.'+(f==='jpg'?'jpg':f)}
var b=await encode(c,type,kbv()),file=new File([b],name,{type:b.type||type}),url=pageUrl(),text=(P?'Passport size photo made with Tools Xyz: ':'Background removed with Tools Xyz: ')+url;
if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:D.title,text:text,url:url});else if(navigator.share)await navigator.share({title:D.title,text:text,url:url});else{await copyLink();return}}catch(e){if(e&&e.name!=='AbortError')say(e.message||'Sharing is not available. Use Copy page link instead.',1)}}
async function copyLink(){var u=pageUrl();try{await navigator.clipboard.writeText(u);say('Page link copied: '+u)}catch(e){say('Copy this link: '+u)}}
function printSheet(){if(!S.sheet){say('Generate the print sheet first.',1);return}var url=S.sheet.c.toDataURL('image/jpeg',.95),w=S.sheet.pw+'in',h=S.sheet.ph+'in',win=window.open('','_blank');if(!win){say('Your browser blocked the print window. Allow pop-ups and try again.',1);return}win.document.write('<!doctype html><title>Print</title><style>@page{size:'+w+' '+h+';margin:0}html,body{margin:0;width:'+w+';height:'+h+'}img{display:block;width:100%;height:100%}</style><img src="'+url+'" onload="setTimeout(function(){print()},250)">');win.document.close()}

/* ---- clicks ---- */
async function act(a){if(!S.src)return;
try{
if(a==='undo')undo();else if(a==='redo')redo();
else if(a==='reset'){var s0=S.hist[0];if(s0){var o=JSON.parse(s0),k;for(k in o)S[k]=o[k];S.si=0;S.ai=0;rebuild();sync();commit();render();say('Edits reset.')}}
else if(a==='rl'||a==='rr'){setRot(function(){S.rq=(S.rq+(a==='rl'?3:1))%4});commit();render()}
else if(a==='fx'||a==='fy'){S[a]=S[a]?0:1;commit();render()}
else if(a==='rcrop'){S.asp=0;S.crop={x:0,y:0,w:1,h:1};sync();commit();render()}
else if(a==='ai')await runAI();
else if(a==='bm-e')setBm('e');else if(a==='bm-r')setBm('r');
else if(a.indexOf('tab-')===0)setTab(a.slice(4));
else if(a==='size')openM('size');
else if(a==='next'){if(S.step===1){go(2);if(!S.ai)await runAI()}else if(S.step===2){makeFinal();go(3);prev(cvA,{layer:S.final},1);say('Your photo is ready. Download it, make a print sheet or share it.')}}
else if(a==='back'){go(S.step-1);say(S.step===1?'Place the face inside the frame.':'Touch up the background and colors.')}
else if(a==='dl'){var f=R('fmt').value,type=f==='jpg'?'image/jpeg':f==='webp'?'image/webp':'image/png',c=makeFinal();if(type==='image/jpeg')c=flat(c);var b=await encode(c,type,kbv());saveBlob(b,S.name+'-no-bg.'+(f==='jpg'?'jpg':f));say('Downloaded '+(f==='jpg'?'JPG':f.toUpperCase())+' ('+Math.round(b.size/1024)+' KB).')}
else if(a==='dl-jpg'||a==='dl-png'){var c2=makeFinal(),isj=a==='dl-jpg',b2=await encode(isj?flat(c2):c2,isj?'image/jpeg':'image/png',isj?kbv():0);saveBlob(b2,'passport-photo.'+(isj?'jpg':'png'));say('Downloaded ('+c2.width+' x '+c2.height+' px, '+Math.round(b2.size/1024)+' KB).')}
else if(a==='dl-pdf'){var c3=makeFinal(),m=szMM(),jb=await blobOf(flat(c3),'image/jpeg',.95),pb=await pdfOf(jb,c3.width,c3.height,Math.round(m[0]/25.4*72),Math.round(m[1]/25.4*72));saveBlob(pb,'passport-photo.pdf')}
else if(a==='sheet'){var sh=makeSheet(),cc=$(mdl,'.tpm-s canvas');cc.width=Math.min(900,sh.c.width);cc.height=Math.round(cc.width*sh.c.height/sh.c.width);cc.getContext('2d').drawImage(sh.c,0,0,cc.width,cc.height);openM('sheet');say(sh.n+' photos on a '+(PAPERS[R('paper').value]||PAPERS['4x6'])[0]+' sheet.')}
else if(a==='sheet-jpg'){if(!S.sheet)makeSheet();saveBlob(await blobOf(flat(S.sheet.c),'image/jpeg',.95),'passport-photo-sheet.jpg')}
else if(a==='sheet-pdf'){if(!S.sheet)makeSheet();var sj=await blobOf(flat(S.sheet.c),'image/jpeg',.95);saveBlob(await pdfOf(sj,S.sheet.c.width,S.sheet.c.height,Math.round(S.sheet.pw*72),Math.round(S.sheet.ph*72)),'passport-photo-sheet.pdf')}
else if(a==='print')printSheet();
else if(a==='share')await doShare();else if(a==='copy')await copyLink();
else if(a==='wa'){var u=pageUrl();window.open('https://wa.me/?text='+encodeURIComponent((P?'Passport size photo maker: ':'Free background remover: ')+u),'_blank')}
}catch(err){say(err.message||String(err),1)}}
root.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a],[data-bg]');if(!b)return;if(b.hasAttribute('data-bg')){if(!S.src)return;S.bg=b.getAttribute('data-bg');sync();commit();render();return}act(b.getAttribute('data-a'))});
var cb=$(root,'[data-a=cmp]');if(cb){['pointerdown'].forEach(function(n){cb.addEventListener(n,function(){S.cmp=1;render()})});['pointerup','pointerleave','pointercancel'].forEach(function(n){cb.addEventListener(n,function(){if(S.cmp){S.cmp=0;render()}})})}

/* ---- inputs ---- */
root.addEventListener('input',function(e){var t=e.target,n=t.getAttribute&&t.getAttribute('name');if(!n||!S.src)return;var v=+t.value;
if(n==='rf'){setRot(function(){S.rf=v});$$(root,'[name=rf]').forEach(function(x){if(x!==t)x.value=v});render()}
else if(n==='zm'){S.crop=fitRect(v/100);render()}
else if(n==='br'||n==='ct'){S[n]=v;$$(root,'[name='+n+']').forEach(function(x){if(x!==t)x.value=v});render()}
else if(n==='bs'){S.bs=v;$$(root,'[name=bs]').forEach(function(x){if(x!==t)x.value=v})}
else if(n==='cc'){S.bg=t.value;$$(root,'[data-bg]').forEach(function(b){b.classList.remove('on')});render()}});
root.addEventListener('change',function(e){var t=e.target,n=t.getAttribute&&t.getAttribute('name');if(!n||!S.src)return;
if(n==='asp'){setAsp(+t.value,1);commit();render()}
else if(n==='rf'||n==='zm'||n==='br'||n==='ct'||n==='cc')commit();
else if(n==='dpi'||n==='paper'||n==='cp'||n==='cl'){S.final=null;S.sheet=null;var sc=$(root,'.tp-sheet');if(sc)sc.hidden=true}});
window.addEventListener('resize',function(){if(S.src)render()});
if(!P)setBm('e');
}

function boot(){if(!D.getElementById('tp-style')){var st=D.createElement('style');st.id='tp-style';st.textContent=CSS;D.head.appendChild(st)}$$(D,'[data-photo-studio]').forEach(function(el){mount(el,el.getAttribute('data-photo-studio'))})}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
