/* tool-engine common pack v1: text tools and calculators (word counter, case converter, password, QR, percentage, age, EMI, GST). Needs form.js. */
(function(){
var IT=window.IT;if(!IT||!IT.form)return;
var $=function(r,s){return r.querySelector(s)},esc=IT.esc,copy=IT.copy,num=IT.num,nf=IT.nf,stat=IT.stat;
/* ---------- Word counter ---------- */
var STOP='the and for are but not you all any can had her was one our out has have this that with from they will your what when who how why which their there been were would could should about into than then them these those also just more some such only over very'.split(' ');
IT.form('common/word-counter',{
html:'<textarea placeholder="Type or paste your text here..." spellcheck="false"></textarea><div class="ct-btns"><button type="button" data-a="clr">Clear text</button></div>',
init:function(R,o,root,up){root.addEventListener('click',function(e){if(e.target.getAttribute('data-a')==='clr'){R('textarea').value='';up()}})},
update:function(R,out){var t=R('textarea').value,w=(t.trim().match(/\S+/g)||[]).length,c=Array.from(t).length,cn=Array.from(t.replace(/\s/g,'')).length,
se=(t.match(/[^.!?\u0964\n]+[.!?\u0964]*/g)||[]).filter(function(x){return /[\p{L}\p{N}]/u.test(x)}).length,pa=t.split(/\n\s*\n/).filter(function(x){return x.trim()}).length;
var rt=w?Math.max(1,Math.ceil(w/200)):0,sp=w?Math.max(1,Math.ceil(w/130)):0,cnt={},ks=[];
(t.toLowerCase().match(/[\p{L}\p{N}']+/gu)||[]).forEach(function(x){if(x.length>2&&STOP.indexOf(x)<0)cnt[x]=(cnt[x]||0)+1});
Object.keys(cnt).forEach(function(k){if(cnt[k]>1)ks.push([k,cnt[k]])});ks.sort(function(a,b){return b[1]-a[1]});ks=ks.slice(0,8);
out.innerHTML='<div class="ct-grid">'+stat('Words',nf(w,0))+stat('Characters',nf(c,0))+stat('Characters (no spaces)',nf(cn,0))+stat('Sentences',nf(se,0))+stat('Paragraphs',nf(pa,0))+stat('Reading time',rt+' min')+stat('Speaking time',sp+' min')+'</div>'+
(ks.length?'<div class="ct-box"><b>Top keywords</b><table><tr><th>Word</th><th>Count</th><th>Density</th></tr>'+ks.map(function(k){return '<tr><td>'+esc(k[0])+'</td><td>'+k[1]+'</td><td>'+(k[1]/w*100).toFixed(1)+'%</td></tr>'}).join('')+'</table></div>':'')}});
/* ---------- Case converter ---------- */
function wordsOf(s){return s.match(/[\p{L}\p{N}]+/gu)||[]}
function cap(x){return x.charAt(0).toUpperCase()+x.slice(1)}
var CASES={upper:function(s){return s.toUpperCase()},lower:function(s){return s.toLowerCase()},
title:function(s){return s.toLowerCase().replace(/(^|[\s\-_("'\[{])(\p{L})/gu,function(m,a,b){return a+b.toUpperCase()})},
sentence:function(s){return s.toLowerCase().replace(/(^\s*|[.!?\u0964]\s+)(\p{L})/gu,function(m,a,b){return a+b.toUpperCase()})},
camel:function(s){return wordsOf(s).map(function(w,i){w=w.toLowerCase();return i?cap(w):w}).join('')},
pascal:function(s){return wordsOf(s).map(function(w){return cap(w.toLowerCase())}).join('')},
snake:function(s){return wordsOf(s).map(function(w){return w.toLowerCase()}).join('_')},
kebab:function(s){return wordsOf(s).map(function(w){return w.toLowerCase()}).join('-')},
alt:function(s){var i=0;return Array.from(s).map(function(ch){if(!/\p{L}/u.test(ch))return ch;return (i++%2)?ch.toUpperCase():ch.toLowerCase()}).join('')},
invert:function(s){return Array.from(s).map(function(ch){return ch===ch.toUpperCase()?ch.toLowerCase():ch.toUpperCase()}).join('')}};
IT.form('common/case-converter',{
html:'<textarea class="in" placeholder="Type or paste your text here..." spellcheck="false"></textarea><div class="ct-btns"><button type="button" data-c="upper">UPPERCASE</button><button type="button" data-c="lower">lowercase</button><button type="button" data-c="title">Title Case</button><button type="button" data-c="sentence">Sentence case</button><button type="button" data-c="camel">camelCase</button><button type="button" data-c="pascal">PascalCase</button><button type="button" data-c="snake">snake_case</button><button type="button" data-c="kebab">kebab-case</button><button type="button" data-c="alt">aLtErNaTe</button><button type="button" data-c="invert">iNVERT</button></div><textarea class="res" readonly placeholder="Result appears here"></textarea><div class="ct-btns"><button type="button" class="p" data-a="copy">Copy result</button><button type="button" data-a="dl">Download .txt</button></div>',
init:function(R,o,root,up){var mode='';root.addEventListener('click',function(e){var c=e.target.getAttribute('data-c'),a=e.target.getAttribute('data-a');
if(c){mode=c;R('.res').value=CASES[c](R('.in').value)}
if(a==='copy')copy(R('.res').value,e.target);
if(a==='dl'){var b=new Blob([R('.res').value],{type:'text/plain'}),l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='converted-text.txt';document.body.appendChild(l);l.click();l.remove()}});
R('.in').addEventListener('input',function(){if(mode)R('.res').value=CASES[mode](R('.in').value)})},
update:function(){}});
/* ---------- Password generator ---------- */
function rnd(n){var a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
IT.form('common/password-generator',{
html:'<div class="ct-pw" data-pw>-</div><div class="ct-btns"><button type="button" class="p" data-a="gen">Generate new</button><button type="button" data-a="copy">Copy</button></div><div class="ct-bar"><i data-s style="width:0;background:#b42318"></i></div><div class="ct-note" data-st></div>'+
'<div class="ct-in"><label>Length: <b data-len>16</b><input type="range" name="len" min="6" max="64" value="16"></label></div><div class="ct-in"><label class="ck"><input type="checkbox" name="u" checked> Uppercase (A-Z)</label><label class="ck"><input type="checkbox" name="l" checked> Lowercase (a-z)</label><label class="ck"><input type="checkbox" name="n" checked> Numbers (0-9)</label><label class="ck"><input type="checkbox" name="s" checked> Symbols (!@#$)</label><label class="ck"><input type="checkbox" name="x" checked> Avoid look-alike characters</label></div>',
init:function(R,o,root,up){root.addEventListener('click',function(e){var a=e.target.getAttribute('data-a');if(a==='gen')up();if(a==='copy')copy($(root,'[data-pw]').textContent,e.target)})},
update:function(R,out,root){var len=+R('[name=len]').value;$(root,'[data-len]').textContent=len;var sets=[],x=R('[name=x]').checked;
function add(on,s){if(on){if(x)s=s.replace(/[O0oIl1|]/g,'');sets.push(s)}}
add(R('[name=u]').checked,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');add(R('[name=l]').checked,'abcdefghijklmnopqrstuvwxyz');add(R('[name=n]').checked,'0123456789');add(R('[name=s]').checked,'!@#$%^&*()-_=+[]{};:,.?');
if(!sets.length)throw new Error('Select at least one type of character.');var all=sets.join(''),p=[],i;
sets.forEach(function(s){p.push(s.charAt(rnd(s.length)))});while(p.length<len)p.push(all.charAt(rnd(all.length)));p=p.slice(0,len);
for(i=p.length-1;i>0;i--){var j=rnd(i+1),t=p[i];p[i]=p[j];p[j]=t}
$(root,'[data-pw]').textContent=p.join('');var bits=len*Math.log2(all.length),lv=bits<40?['Weak','#b42318',25]:bits<60?['Fair','#d97706',50]:bits<80?['Strong','#0b6e5f',75]:['Very strong','#047857',100],b=$(root,'[data-s]');
b.style.width=lv[2]+'%';b.style.background=lv[1];$(root,'[data-st]').textContent='Strength: '+lv[0]+' (about '+Math.round(bits)+' bits). Passwords are created in your browser and never sent anywhere.';out.innerHTML=''}});
/* ---------- QR code generator ---------- */
function qrData(R){var t=R('[name=t]').value;
if(t==='w'){var e=function(s){return s.replace(/([\\;,:"])/g,'\\$1')},ty=R('[name=wt]').value;if(!R('[name=ws]').value.trim())throw new Error('Enter the Wi-Fi network name.');return 'WIFI:T:'+ty+';S:'+e(R('[name=ws]').value)+';'+(ty==='nopass'?'':'P:'+e(R('[name=wp]').value)+';')+';'}
if(t==='p'){var n=R('[name=pn]').value.replace(/\D/g,'');if(!n)throw new Error('Enter the phone number with country code.');return 'https://wa.me/'+n+(R('[name=pm]').value?'?text='+encodeURIComponent(R('[name=pm]').value):'')}
if(t==='e'){var a=R('[name=ea]').value.trim();if(!a)throw new Error('Enter the email address.');var q=[];if(R('[name=es]').value)q.push('subject='+encodeURIComponent(R('[name=es]').value));if(R('[name=eb]').value)q.push('body='+encodeURIComponent(R('[name=eb]').value));return 'mailto:'+a+(q.length?'?'+q.join('&'):'')}
var x=R('[name=x]').value.trim();if(!x)throw new Error('Type a link or some text to make a QR code.');return x}
var QU=null;
IT.form('common/qr-code',{
html:'<div class="ct-in"><label>Type<select name="t"><option value="x">Text or link</option><option value="w">Wi-Fi</option><option value="p">WhatsApp</option><option value="e">Email</option></select></label><label>Error correction<select name="l"><option value="M">Medium</option><option value="L">Low</option><option value="Q">Quartile</option><option value="H">High</option></select></label><label>Size<select name="z"><option value="256">256 px</option><option value="512" selected>512 px</option><option value="1024">1024 px</option></select></label><label>Color<input type="color" name="fg" value="#000000"></label><label>Background<input type="color" name="bg" value="#ffffff"></label></div>'+
'<div data-p="x"><textarea name="x" placeholder="https://example.com" style="min-height:90px"></textarea></div>'+
'<div data-p="w" hidden><div class="ct-in"><label>Network name (SSID)<input name="ws"></label><label>Password<input name="wp"></label><label>Security<select name="wt"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></label></div></div>'+
'<div data-p="p" hidden><div class="ct-in"><label>Phone number with country code<input name="pn" placeholder="919876543210" inputmode="numeric"></label><label>Message (optional)<input name="pm"></label></div></div>'+
'<div data-p="e" hidden><div class="ct-in"><label>Email address<input name="ea" type="email"></label><label>Subject<input name="es"></label><label>Message<input name="eb"></label></div></div>',
update:async function(R,out,root){var t=R('[name=t]').value;[].slice.call(root.querySelectorAll('[data-p]')).forEach(function(d){d.hidden=d.getAttribute('data-p')!==t});
var data=qrData(R);await IT.script('qrcode-generator@1.4.4/qrcode.js',function(){return window.qrcode});
if(qrcode.stringToBytesFuncs&&qrcode.stringToBytesFuncs['UTF-8'])qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];
var q,N;try{q=qrcode(0,R('[name=l]').value);q.addData(data);q.make()}catch(e){throw new Error('This text is too long for a QR code. Please shorten it.')}
N=q.getModuleCount();var m=4,tot=N+2*m,px=+R('[name=z]').value,sc=Math.max(1,Math.floor(px/tot)),size=tot*sc,fg=R('[name=fg]').value,bg=R('[name=bg]').value,c=document.createElement('canvas');c.width=c.height=size;
var x=c.getContext('2d'),path='';x.fillStyle=bg;x.fillRect(0,0,size,size);x.fillStyle=fg;
for(var r=0;r<N;r++)for(var k=0;k<N;k++)if(q.isDark(r,k)){x.fillRect((k+m)*sc,(r+m)*sc,sc,sc);path+='M'+(k+m)+' '+(r+m)+'h1v1h-1z'}
var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+tot+' '+tot+'" width="'+px+'" height="'+px+'" shape-rendering="crispEdges"><rect width="'+tot+'" height="'+tot+'" fill="'+bg+'"/><path d="'+path+'" fill="'+fg+'"/></svg>';
out.innerHTML='<div style="text-align:center;margin-top:12px"></div><div class="ct-btns" style="justify-content:center"><a class="it-b" data-png>Download PNG</a><a class="it-b alt" data-svg>Download SVG</a></div><div class="ct-note" style="text-align:center">Test the code with your phone camera before you print or share it.</div>';
$(out,'div').appendChild(c);var s=$(out,'[data-svg]');s.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));s.download='qr-code.svg';
var pn=$(out,'[data-png]');pn.download='qr-code.png';if(c.toBlob)c.toBlob(function(b){if(b)pn.href=URL.createObjectURL(b)})}});
/* ---------- Percentage calculator ---------- */
var PC=[['What is X% of Y?','X (%)','Y',function(x,y){return x*y/100}],['X is what percent of Y?','X','Y',function(x,y){return y?x/y*100:NaN},'%'],['Percentage change from X to Y','X (old value)','Y (new value)',function(x,y){return x?(y-x)/x*100:NaN},'%'],['Increase X by Y%','X','Y (%)',function(x,y){return x*(1+y/100)}],['Decrease X by Y%','X','Y (%)',function(x,y){return x*(1-y/100)}]];
IT.form('common/percentage',{
html:PC.map(function(p,i){return '<div class="ct-box" data-k="'+i+'"><b>'+p[0]+'</b><div class="ct-in"><label>'+p[1]+'<input type="number" step="any" inputmode="decimal"></label><label>'+p[2]+'<input type="number" step="any" inputmode="decimal"></label></div><div class="ct-big" data-r>-</div></div>'}).join(''),
update:function(R,out,root){[].slice.call(root.querySelectorAll('.ct-box')).forEach(function(b){var p=PC[+b.getAttribute('data-k')],i=b.querySelectorAll('input'),x=num(i[0].value),y=num(i[1].value),r=$(b,'[data-r]');
if(isNaN(x)||isNaN(y)){r.textContent='-';return}var v=p[3](x,y);r.textContent=isFinite(v)?nf(v,4)+(p[4]||''):'Cannot divide by zero'})}});
/* ---------- Age calculator ---------- */
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function pd(s){var p=s.split('-').map(Number);return p.length===3&&p[0]?new Date(p[0],p[1]-1,p[2]):null}
IT.form('common/age',{
html:'<div class="ct-in"><label>Date of birth<input type="date" name="b"></label><label>Age on (default today)<input type="date" name="a"></label></div>',
init:function(R){R('[name=a]').value=iso(new Date());R('[name=b]').max=iso(new Date())},
update:function(R,out){var b=pd(R('[name=b]').value),a=pd(R('[name=a]').value)||new Date();if(!b){out.innerHTML='<p class="ct-note">Choose your date of birth to see your exact age.</p>';return}
if(b>a)throw new Error('The date of birth must be before the "Age on" date.');
var y=a.getFullYear()-b.getFullYear(),m=a.getMonth()-b.getMonth(),d=a.getDate()-b.getDate();if(d<0){m--;d+=new Date(a.getFullYear(),a.getMonth(),0).getDate()}if(m<0){y--;m+=12}
var days=Math.floor((a-b)/864e5),nb=new Date(a.getFullYear(),b.getMonth(),b.getDate());if(nb<a)nb=new Date(a.getFullYear()+1,b.getMonth(),b.getDate());var nd=Math.round((nb-new Date(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);
out.innerHTML='<div class="ct-box"><b>Your age</b><div class="ct-big">'+y+' years, '+m+' months, '+d+' days</div></div><div class="ct-grid">'+stat('Total months',nf(y*12+m,0))+stat('Total weeks',nf(Math.floor(days/7),0))+stat('Total days',nf(days,0))+stat('Total hours',nf(days*24,0))+'</div>'+
'<div class="ct-box"><b>Next birthday</b>'+(nd===0?'Today is your birthday!':'In '+nd+' days, on '+nb.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))+'<br>You were born on a '+b.toLocaleDateString('en-GB',{weekday:'long'})+'.</div>'}});
/* ---------- EMI calculator ---------- */
IT.form('common/emi',{
html:'<div class="ct-in"><label>Loan amount<input type="number" name="p" value="500000" min="0" step="any" inputmode="decimal"></label><label>Interest rate (% per year)<input type="number" name="r" value="9" min="0" step="any" inputmode="decimal"></label><label>Loan tenure<input type="number" name="n" value="5" min="1" step="any" inputmode="decimal"></label><label>Tenure in<select name="u"><option value="y">Years</option><option value="m">Months</option></select></label><label>Currency<select name="c"><option value="\u20B9">\u20B9 Rupee</option><option value="$">$ Dollar</option><option value="\u20AC">\u20AC Euro</option><option value="\u00A3">\u00A3 Pound</option></select></label></div>',
update:function(R,out){var P=num(R('[name=p]').value),rate=num(R('[name=r]').value),n=num(R('[name=n]').value),cu=R('[name=c]').value;
if(!(P>0)||isNaN(rate)||rate<0||!(n>0)){out.innerHTML='<p class="ct-note">Enter the loan amount, interest rate and tenure.</p>';return}
var N=Math.round(R('[name=u]').value==='y'?n*12:n);if(N<1||N>600)throw new Error('Tenure must be between 1 month and 50 years.');var r=rate/1200,emi=r?P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1):P/N,tot=emi*N,ti=tot-P,loc=cu==='\u20B9'?'en-IN':'en-US',f=function(v){return cu+v.toLocaleString(loc,{maximumFractionDigits:0})};
var bal=P,rows=[],yp=0,yi=0;for(var i=1;i<=N;i++){var it=bal*r,pr=emi-it;bal=Math.max(0,bal-pr);yp+=pr;yi+=it;if(i%12===0||i===N){rows.push([Math.ceil(i/12),yp,yi,bal]);yp=0;yi=0}}
var pp=P/tot*100;
out.innerHTML='<div class="ct-box"><b>Monthly EMI</b><div class="ct-big">'+f(emi)+'</div></div><div class="ct-grid">'+stat('Principal',f(P))+stat('Total interest',f(ti))+stat('Total payment',f(tot))+'</div><div class="ct-bar"><i style="width:'+pp.toFixed(1)+'%;background:#0b6e5f"></i><i style="width:'+(100-pp).toFixed(1)+'%;background:#f2b84b"></i></div><div class="ct-note">Green: principal '+pp.toFixed(0)+'%. Yellow: interest '+(100-pp).toFixed(0)+'%.</div>'+
'<div class="ct-box"><b>Year by year</b><div style="overflow-x:auto"><table><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Balance</th></tr>'+rows.map(function(x){return '<tr><td>'+x[0]+'</td><td>'+f(x[1])+'</td><td>'+f(x[2])+'</td><td>'+f(x[3])+'</td></tr>'}).join('')+'</table></div></div><div class="ct-note">This is an estimate for a fixed rate reducing balance loan. Your bank may add fees, so check the offer letter.</div>'}});
/* ---------- GST calculator ---------- */
IT.form('common/gst',{
html:'<div class="ct-in"><label>Amount (\u20B9)<input type="number" name="a" value="1000" min="0" step="any" inputmode="decimal"></label><label>GST rate<select name="g"><option value="0">0%</option><option value="0.25">0.25%</option><option value="3">3%</option><option value="5">5%</option><option value="18" selected>18%</option><option value="40">40%</option><option value="c">Other rate...</option></select></label><label data-cu hidden>Custom rate (%)<input type="number" name="cr" step="any" inputmode="decimal"></label><label>Calculation<select name="m"><option value="e">Add GST (amount without GST)</option><option value="i">Remove GST (amount includes GST)</option></select></label><label>Supply<select name="s"><option value="i">Within the state (CGST + SGST)</option><option value="o">Between states (IGST)</option></select></label></div>',
update:function(R,out,root){var a=num(R('[name=a]').value),g=R('[name=g]').value;$(root,'[data-cu]').hidden=g!=='c';var rt=g==='c'?num(R('[name=cr]').value):+g;
if(isNaN(a)||a<0||isNaN(rt)||rt<0){out.innerHTML='<p class="ct-note">Enter the amount and the GST rate.</p>';return}
var net,gst,tot;if(R('[name=m]').value==='e'){net=a;gst=a*rt/100;tot=a+gst}else{tot=a;net=a/(1+rt/100);gst=a-net}
var f=function(v){return '\u20B9'+v.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})},split=R('[name=s]').value==='i';
out.innerHTML='<div class="ct-grid">'+stat('Amount without GST',f(net))+stat('GST amount ('+rt+'%)',f(gst))+stat('Total with GST',f(tot))+'</div><div class="ct-box"><b>Tax split</b>'+(split?'CGST ('+rt/2+'%): '+f(gst/2)+'<br>SGST ('+rt/2+'%): '+f(gst/2):'IGST ('+rt+'%): '+f(gst))+'</div><div class="ct-note">GST rates are set by the government and can change. Since 22 September 2025 the main rates are 5%, 18% and 40%, plus 0.25% and 3% for some goods. Check the official rate for your item or service before you issue an invoice.</div>'}});
})();
