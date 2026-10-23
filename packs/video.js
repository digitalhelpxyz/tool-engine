/* tool-engine video pack v1 (needs files.js). Uses ffmpeg.wasm from a CDN, loaded only when a video tool is used. */
(function(){
var IT=window.IT;if(!IT||!IT.file)return;
var VID='video/*,.mkv,.avi,.mov,.mp4,.webm,.3gp';
var FF=null;
function val(R,n){var e=R('[name='+n+']');return e?e.value.trim():''}
function base(f){return f.name.replace(/\.[^.]+$/,'')}
function ext(f){return (f.name.split('.').pop()||'mp4').toLowerCase().replace(/[^a-z0-9]/g,'')||'mp4'}
function fmt(s){s=Math.round(s);var m=Math.floor(s/60),x=s%60;return m+':'+(x<10?'0':'')+x}
async function engine(P){if(FF)return FF;
P('Loading video engine (about 30 MB, first time only)...');
await IT.script('@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js',function(){return window.FFmpegWASM});
await IT.script('@ffmpeg/util@0.12.1/dist/umd/index.js',function(){return window.FFmpegUtil});
var U=FFmpegUtil,hosts=[IT.host].concat((IT.hosts||[]).filter(function(h){return h!==IT.host})),err=null;
for(var i=0;i<hosts.length;i++){var H=hosts[i],f=new FFmpegWASM.FFmpeg(),core=H+'@ffmpeg/core@0.12.6/dist/esm/';
try{
/* the ESM core is required: ffmpeg runs in a module worker that imports it */
await f.load({coreURL:await U.toBlobURL(core+'ffmpeg-core.js','text/javascript'),wasmURL:await U.toBlobURL(core+'ffmpeg-core.wasm','application/wasm'),classWorkerURL:await U.toBlobURL(H+'@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js','text/javascript')});
return FF=f}catch(e){err=e;try{f.terminate()}catch(x){}P('Retrying with another server...')}}
throw new Error('The video engine could not start ('+((err&&err.message)||err)+'). Please try again on Wi-Fi, using the latest Chrome.')}
/* run one ffmpeg command: pre (before -i), args (after -i), output file name and mime */
async function run(file,pre,args,out,mime,P,label){
if(file.size>700*1048576)throw new Error('This video is very large. Please use a smaller file (under 700 MB).');
var ff=await engine(P),inn='in.'+ext(file),h=function(e){P(label+' '+Math.max(0,Math.min(100,Math.round((e.progress||0)*100)))+'%')};
await ff.writeFile(inn,await FFmpegUtil.fetchFile(file));ff.on('progress',h);P(label+' 0%');var code;
try{code=await ff.exec(pre.concat(['-i',inn],args,[out]))}finally{ff.off('progress',h)}
if(code!==0){try{await ff.deleteFile(inn)}catch(e){}throw new Error('This video could not be processed. Try a different file or format.')}
var data=await ff.readFile(out);try{await ff.deleteFile(inn);await ff.deleteFile(out)}catch(e){}
return new Blob([data.buffer],{type:mime})}
async function vinfo(f){return new Promise(function(ok){var v=document.createElement('video'),u=URL.createObjectURL(f),done=false;
function end(t,m){if(done)return;done=true;URL.revokeObjectURL(u);ok({text:t,meta:m||{}})}
v.preload='metadata';v.onloadedmetadata=function(){end(fmt(v.duration)+' - '+v.videoWidth+'x'+v.videoHeight,{dur:v.duration,w:v.videoWidth,h:v.videoHeight})};
v.onerror=function(){end('Preview not available, the tool can still try this file',{})};setTimeout(function(){end('',{})},8000);v.src=u})}
function V(id,c){c.accept=VID;c.pick=c.pick||'Select video file';if(!c.info)c.info=vinfo;IT.file(id,c)}
var H264=['-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p'];
V('video/compress',{btn:'Compress video',
options:function(){return '<label>Quality<select name="q"><option value="26">High quality, bigger file</option><option value="29" selected>Balanced</option><option value="33">Smallest file</option></select></label><label>Resolution<select name="s"><option value="">Keep original</option><option value="720">720p</option><option value="480">480p</option><option value="360">360p</option></select></label>'},
run:async function(fs,R,D,P){var f=fs[0].file,s=val(R,'s'),a=H264.concat(['-crf',val(R,'q')||'29']);
if(s)a=a.concat(['-vf',"scale=-2:'min("+s+",ih)'"]);a=a.concat(['-c:a','aac','-b:a','96k','-movflags','+faststart']);
var b=await run(f,[],a,'out.mp4','video/mp4',P,'Compressing'),n=b.size>=f.size?'The new file is not smaller. Try a lower resolution or the Smallest file option.':'Size: '+Math.round(f.size/1024/1024*10)/10+' MB to '+Math.round(b.size/1024/1024*10)/10+' MB';
return[{blob:b,name:base(f)+'-compressed.mp4',note:n}]}});
V('video/trim',{btn:'Trim video',
options:function(){return '<label>Start (mm:ss or seconds)<input name="a" value="0"></label><label>End (mm:ss or seconds)<input name="b" placeholder="e.g. 0:30"></label><label>Mode<select name="m"><option value="c">Fast (no re-encode)</option><option value="e">Precise (re-encode, slower)</option></select></label>'},
fill:function(R,m){var e=R('[name=b]');if(e&&m.dur)e.value=fmt(m.dur)},
run:async function(fs,R,D,P){var f=fs[0].file,a=IT.secs(val(R,'a')),b=IT.secs(val(R,'b'));if(!(b>a))throw new Error('The end time must be after the start time.');
var d=String(b-a),pre=['-ss',String(a)],pr=val(R,'m')==='e',args=['-t',d].concat(pr?H264.concat(['-crf','23','-c:a','aac']):['-c','copy','-avoid_negative_ts','make_zero']),e=pr?'mp4':ext(f);
var bl=await run(f,pre,args,'out.'+e,pr||e==='mp4'?'video/mp4':'video/'+e,P,'Trimming');return[{blob:bl,name:base(f)+'-trimmed.'+e}]}});
V('video/to-mp3',{btn:'Convert to MP3',
options:function(){return '<label>Audio quality<select name="k"><option value="128k">Good (128 kbps)</option><option value="192k" selected>High (192 kbps)</option><option value="320k">Best (320 kbps)</option></select></label>'},
run:async function(fs,R,D,P){var f=fs[0].file,b=await run(f,[],['-vn','-c:a','libmp3lame','-b:a',val(R,'k')||'192k'],'out.mp3','audio/mpeg',P,'Extracting audio');return[{blob:b,name:base(f)+'.mp3'}]}});
V('video/to-mp4',{btn:'Convert to MP4',
options:function(){return '<div class="ffs" style="width:100%">Converts MOV, AVI, MKV, WebM and other videos to MP4 (H.264 and AAC), which plays on almost every phone and TV.</div>'},
run:async function(fs,R,D,P){var f=fs[0].file,b=await run(f,[],H264.concat(['-crf','24','-c:a','aac','-b:a','128k','-movflags','+faststart']),'out.mp4','video/mp4',P,'Converting');return[{blob:b,name:base(f)+'.mp4'}]}});
V('video/to-gif',{btn:'Make GIF',
options:function(){return '<label>Start (seconds)<input name="a" value="0"></label><label>Length (seconds, max 15)<input name="d" type="number" value="5" min="1" max="15"></label><label>Frames per second<select name="r"><option value="8">8 (smaller)</option><option value="12" selected>12</option><option value="15">15 (smoother)</option></select></label><label>Width<select name="w"><option value="320">320 px</option><option value="480" selected>480 px</option><option value="640">640 px</option></select></label>'},
run:async function(fs,R,D,P){var f=fs[0].file,a=IT.secs(val(R,'a')),d=Math.min(15,Math.max(1,+val(R,'d')||5)),r=val(R,'r')||'12',w=val(R,'w')||'480';
var vf='fps='+r+',scale='+w+':-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse';
var b=await run(f,['-ss',String(a)],['-t',String(d),'-vf',vf,'-loop','0'],'out.gif','image/gif',P,'Making GIF');return[{blob:b,name:base(f)+'.gif'}]}});
V('video/mute',{btn:'Remove audio',
options:function(){return '<div class="ffs" style="width:100%">Removes the sound and keeps the video as it is. No quality loss and very fast.</div>'},
run:async function(fs,R,D,P){var f=fs[0].file,e=ext(f);var b=await run(f,[],['-c','copy','-an'],'out.'+e,e==='mp4'?'video/mp4':'video/'+e,P,'Removing audio');return[{blob:b,name:base(f)+'-muted.'+e}]}});
V('video/rotate',{btn:'Apply',
options:function(){return '<label>Action<select name="t"><option value="transpose=1">Rotate 90\u00b0 right</option><option value="transpose=2">Rotate 90\u00b0 left</option><option value="transpose=1,transpose=1">Rotate 180\u00b0</option><option value="hflip">Flip horizontal</option><option value="vflip">Flip vertical</option></select></label>'},
run:async function(fs,R,D,P){var f=fs[0].file,b=await run(f,[],['-vf',val(R,'t')||'transpose=1'].concat(H264,['-crf','24','-c:a','copy','-movflags','+faststart']),'out.mp4','video/mp4',P,'Processing');return[{blob:b,name:base(f)+'-rotated.mp4'}]}});
})();
