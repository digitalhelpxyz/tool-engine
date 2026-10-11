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