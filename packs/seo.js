/* tool-engine SEO pack v1: SEO tools that run in the browser. Needs common.js (IT.form). */
(function(){
var IT=window.IT;if(!IT||!IT.form)return;
var $=function(r,s){return r.querySelector(s)};
function at(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function v(R,n){var e=R('[name='+n+']');return e?(e.type==='checkbox'?e.checked:e.value.trim()):''}
function inp(l,n,ph,t){return '<label>'+l+'<input name="'+n+'"'+(t?' type="'+t+'"':'')+(ph?' placeholder="'+ph+'"':'')+'></label>'}
function sel(l,n,o){return '<label>'+l+'<select name="'+n+'">'+o.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('')+'</select></label>'}
function ta(l,n,ph,h){return '<label style="flex:1 1 100%">'+l+'<textarea name="'+n+'" placeholder="'+(ph||'')+'" style="min-height:'+(h||90)+'px"></textarea></label>'}
function codeOut(out,code,fname,mime,hint){
out.innerHTML='<div class="ct-box"><b>Result</b><textarea readonly style="min-height:200px;font:13px/1.5 ui-monospace,Consolas,monospace"></textarea><div class="ct-btns"><button type="button" class="p" data-a="c">Copy</button>'+(fname?'<button type="button" data-a="d">Download '+fname+'</button>':'')+'</div>'+(hint?'<div class="ct-note"></div>':'')+'</div>';
$(out,'textarea').value=code;if(hint)$(out,'.ct-note').textContent=hint;
$(out,'[data-a=c]').onclick=function(){IT.copy(code,this)};var d=$(out,'[data-a=d]');
if(d)d.onclick=function(){var l=document.createElement('a');l.href=URL.createObjectURL(new Blob([code],{type:mime||'text/plain'}));l.download=fname;document.body.appendChild(l);l.click();l.remove()}}
function need(t,m){if(!t)throw new Error(m)}
/* 1 Meta tags */
IT.form('seo/meta-tags',{
html:'<div class="ct-in">'+inp('Page title','t','e.g. Free Image Compressor Online')+inp('Author','a','')+'</div><div class="ct-in">'+ta('Meta description','d','Describe the page in about 150 characters',70)+'</div><div class="ct-in">'+inp('Keywords (comma separated, optional)','k','')+inp('Canonical URL (optional)','c','https://www.example.com/page.html')+sel('Robots','r',[['index, follow','index, follow'],['noindex, follow','noindex, follow'],['index, nofollow','index, nofollow'],['noindex, nofollow','noindex, nofollow']])+inp('Theme color (optional)','tc','#0b6e5f')+'</div><div class="ct-in"><label class="ck"><input type="checkbox" name="vp" checked> Add viewport tag (mobile friendly)</label></div>',
update:function(R,out){var t=v(R,'t'),d=v(R,'d');need(t,'Enter the page title to create the tags.');
var L=['<meta charset="UTF-8">'];if(v(R,'vp'))L.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
L.push('<title>'+at(t)+'</title>');if(d)L.push('<meta name="description" content="'+at(d)+'">');if(v(R,'k'))L.push('<meta name="keywords" content="'+at(v(R,'k'))+'">');if(v(R,'a'))L.push('<meta name="author" content="'+at(v(R,'a'))+'">');
L.push('<meta name="robots" content="'+v(R,'r')+'">');if(v(R,'c'))L.push('<link rel="canonical" href="'+at(v(R,'c'))+'">');if(v(R,'tc'))L.push('<meta name="theme-color" content="'+at(v(R,'tc'))+'">');
codeOut(out,L.join('\n'),'','','Title: '+t.length+' characters (aim for 60 or less). Description: '+d.length+' characters (aim for 120 to 160). Paste these tags inside the <head> of your page.')}});
/* 2 Open Graph */
IT.form('seo/open-graph',{
html:'<div class="ct-in">'+inp('Page URL','u','https://www.example.com/page.html')+inp('Title','t','')+inp('Image URL (1200 x 630 px is best)','i','https://www.example.com/image.jpg')+inp('Site name','s','')+'</div><div class="ct-in">'+ta('Description','d','',70)+'</div><div class="ct-in">'+sel('Type','y',[['website','Website'],['article','Article']])+sel('Twitter / X card','c',[['summary_large_image','Large image'],['summary','Small summary']])+inp('Twitter / X @username (optional)','h','@yourname')+'</div>',
update:function(R,out){var t=v(R,'t');need(t,'Enter the title to create the tags.');var L=[],P=function(p,x){if(x)L.push('<meta property="'+p+'" content="'+at(x)+'">')},N=function(p,x){if(x)L.push('<meta name="'+p+'" content="'+at(x)+'">')};
P('og:type',v(R,'y'));P('og:title',t);P('og:description',v(R,'d'));P('og:url',v(R,'u'));P('og:image',v(R,'i'));P('og:site_name',v(R,'s'));
N('twitter:card',v(R,'c'));N('twitter:title',t);N('twitter:description',v(R,'d'));N('twitter:image',v(R,'i'));N('twitter:site',v(R,'h'));
codeOut(out,L.join('\n'),'','','Paste these tags inside the <head> of your page. Social sites may keep an old preview for a while, so use their share debugger after you publish.')}});
/* 3 robots.txt */
IT.form('seo/robots',{
html:'<div class="ct-in">'+sel('Default for all crawlers','m',[['a','Allow everything'],['d','Block everything']])+inp('Crawl delay in seconds (optional)','cd','','number')+'</div><div class="ct-in">'+ta('Paths to block (one per line)','dis','/search\n/admin/',80)+ta('Paths to allow (one per line, optional)','al','',60)+ta('Sitemap URLs (one per line)','sm','https://www.example.com/sitemap.xml',60)+'</div><div class="ct-in"><label class="ck"><input type="checkbox" name="ai"> Also block AI training crawlers (GPTBot, CCBot, Google-Extended, ClaudeBot, PerplexityBot)</label></div>',
update:function(R,out){var P=function(s){return s.split('\n').map(function(x){return x.trim()}).filter(Boolean)},L=['User-agent: *'];
if(v(R,'m')==='d')L.push('Disallow: /');else{var d=P(R('[name=dis]').value);if(!d.length)L.push('Disallow:');d.forEach(function(x){L.push('Disallow: '+(x.charAt(0)==='/'?x:'/'+x))});P(R('[name=al]').value).forEach(function(x){L.push('Allow: '+(x.charAt(0)==='/'?x:'/'+x))})}
if(v(R,'cd'))L.push('Crawl-delay: '+parseInt(v(R,'cd'),10));
if(v(R,'ai'))['GPTBot','CCBot','Google-Extended','ClaudeBot','PerplexityBot'].forEach(function(b){L.push('','User-agent: '+b,'Disallow: /')});
var s=P(R('[name=sm]').value);if(s.length){L.push('');s.forEach(function(x){L.push('Sitemap: '+x)})}
codeOut(out,L.join('\n')+'\n','robots.txt','text/plain','Upload this file to the root of your site (for example example.com/robots.txt). On Blogger, paste the text in Settings > Crawlers and indexing > Custom robots.txt. Be careful: a wrong rule can hide your pages from Google.')}});
/* 4 Sitemap */
function xe(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
IT.form('seo/sitemap',{
html:'<div class="ct-in">'+ta('Page URLs (one per line)','u','https://www.example.com/\nhttps://www.example.com/about.html',140)+'</div><div class="ct-in">'+sel('Change frequency','f',[['','Do not include'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['yearly','Yearly']])+sel('Priority','p',[['','Do not include'],['1.0','1.0 (highest)'],['0.8','0.8'],['0.5','0.5']])+'<label class="ck"><input type="checkbox" name="lm" checked> Add today as last modified date</label></div>',
update:function(R,out){var u=R('[name=u]').value.split('\n').map(function(x){return x.trim()}).filter(Boolean);need(u.length,'Paste your page URLs, one per line.');
var bad=u.filter(function(x){return !/^https?:\/\/\S+$/i.test(x)});if(bad.length)throw new Error('Each line must be a full URL starting with http:// or https://. Check: '+bad[0]);if(u.length>50000)throw new Error('A sitemap can hold up to 50,000 URLs.');
var d=new Date().toISOString().slice(0,10),L=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
u.forEach(function(x){L.push('  <url>','    <loc>'+xe(x)+'</loc>');if(v(R,'lm'))L.push('    <lastmod>'+d+'</lastmod>');if(v(R,'f'))L.push('    <changefreq>'+v(R,'f')+'</changefreq>');if(v(R,'p'))L.push('    <priority>'+v(R,'p')+'</priority>');L.push('  </url>')});L.push('</urlset>');
codeOut(out,L.join('\n')+'\n','sitemap.xml','application/xml',u.length+' URL'+(u.length>1?'s':'')+'. Upload sitemap.xml to your site and submit its address in Google Search Console.')}});
/* 5 Snippet preview */
IT.form('seo/snippet',{
html:'<div class="ct-in">'+inp('Page title','t','Your page title')+inp('Page address','u','https://www.example.com/page')+'</div><div class="ct-in">'+ta('Meta description','d','Your description',70)+'</div><div class="ct-in">'+sel('Device','dv',[['d','Desktop'],['m','Mobile']])+'</div>',
update:function(R,out){var t=v(R,'t'),d=v(R,'d'),u=v(R,'u'),mob=v(R,'dv')==='m',tl=mob?58:60,dl=mob?120:160,w=null;
try{var cx=document.createElement('canvas').getContext('2d');cx.font='20px Arial';var m=cx.measureText(t);if(m&&m.width)w=Math.round(m.width)}catch(e){}
var host=u.replace(/^https?:\/\//,'').split('/')[0]||'www.example.com',path=u.replace(/^https?:\/\/[^\/]*/,'').replace(/\//g,' \u203A ').replace(/\.html?$/,'').trim();
var tt=t||'Your page title',dd=d||'Your meta description will appear here.',ct=tt.length>tl?tt.slice(0,tl-1).trim()+'\u2026':tt,cd=dd.length>dl?dd.slice(0,dl-1).trim()+'\u2026':dd;
out.innerHTML='<div class="ct-box" style="background:#fff;color:#202124;max-width:'+(mob?'380':'640')+'px;font-family:Arial,sans-serif"><div style="font-size:12px;color:#202124;margin-bottom:2px"></div><div style="font-size:20px;line-height:1.3;color:#1a0dab"></div><div style="font-size:14px;line-height:1.58;color:#4d5156;margin-top:2px"></div></div>'+
'<div class="ct-grid">'+IT.stat('Title length',t.length+' / '+tl)+IT.stat('Description length',d.length+' / '+dl)+(w?IT.stat('Title width (about)',w+' px of 600'):'')+'</div><div class="ct-note">This is an estimate. Google decides the real title and description, and cuts them by pixel width.</div>';
var b=out.querySelectorAll('.ct-box div');b[0].textContent=host+(path?' '+path:'');b[1].textContent=ct;b[2].textContent=cd}});
/* 6 Schema */
IT.form('seo/schema',{
html:'<div class="ct-in">'+sel('Schema type','ty',[['f','FAQ page'],['a','Article'],['l','Local business']])+'</div>'+
'<div data-p="f"><div class="ct-in">'+ta('Questions and answers: first line is the question, the next lines are the answer. Leave a blank line between pairs.','qa','What is your return policy?\nYou can return items within 7 days.\n\nDo you ship across India?\nYes, we ship everywhere in India.',170)+'</div></div>'+
'<div data-p="a" hidden><div class="ct-in">'+inp('Headline','ah','')+inp('Author name','aa','')+inp('Publisher name','ap','')+inp('Date published','ad','','date')+inp('Image URL','ai','')+inp('Page URL','au','')+'</div></div>'+
'<div data-p="l" hidden><div class="ct-in">'+inp('Business name','ln','')+inp('Phone','lp','+91 98765 43210')+inp('Website','lw','')+inp('Image URL','li','')+inp('Street address','ls','')+inp('City','lc','')+inp('State','lr','')+inp('PIN / ZIP code','lz','')+inp('Country code','lk','IN')+inp('Price range (optional)','lq','$$')+'</div></div>',
update:function(R,out,root){var ty=v(R,'ty');[].slice.call(root.querySelectorAll('[data-p]')).forEach(function(d){d.hidden=d.getAttribute('data-p')!==ty});var o;
if(ty==='f'){var bl=R('[name=qa]').value.replace(/\r/g,'').split(/\n\s*\n/).map(function(b){return b.trim().split('\n').map(function(x){return x.trim()}).filter(Boolean)}).filter(function(b){return b.length>1});need(bl.length,'Add at least one question with an answer.');
o={'@context':'https://schema.org','@type':'FAQPage',mainEntity:bl.map(function(b){return{'@type':'Question',name:b[0],acceptedAnswer:{'@type':'Answer',text:b.slice(1).join(' ')}}})}}
else if(ty==='a'){need(v(R,'ah'),'Enter the article headline.');o={'@context':'https://schema.org','@type':'Article',headline:v(R,'ah')};if(v(R,'aa'))o.author={'@type':'Person',name:v(R,'aa')};if(v(R,'ap'))o.publisher={'@type':'Organization',name:v(R,'ap')};if(v(R,'ad'))o.datePublished=v(R,'ad');if(v(R,'ai'))o.image=v(R,'ai');if(v(R,'au'))o.mainEntityOfPage=v(R,'au')}
else{need(v(R,'ln'),'Enter the business name.');o={'@context':'https://schema.org','@type':'LocalBusiness',name:v(R,'ln')};if(v(R,'lp'))o.telephone=v(R,'lp');if(v(R,'lw'))o.url=v(R,'lw');if(v(R,'li'))o.image=v(R,'li');if(v(R,'lq'))o.priceRange=v(R,'lq');
if(v(R,'ls')||v(R,'lc'))o.address={'@type':'PostalAddress',streetAddress:v(R,'ls'),addressLocality:v(R,'lc'),addressRegion:v(R,'lr'),postalCode:v(R,'lz'),addressCountry:v(R,'lk')}}
codeOut(out,'<script type="application/ld+json">\n'+JSON.stringify(o,null,2).replace(/<\//g,'<\\/')+'\n</script>','','','Paste this code in the <head> or <body> of the page it describes. Test it with the Google Rich Results Test. Structured data does not guarantee rich results.')}});
/* 7 UTM */
IT.form('seo/utm',{
html:'<div class="ct-in">'+inp('Website URL','u','https://www.example.com/page')+'</div><div class="ct-in">'+inp('Campaign source (required)','s','facebook, newsletter')+inp('Campaign medium (required)','m','social, email, cpc')+inp('Campaign name (required)','n','diwali_sale')+inp('Campaign term (optional)','t','')+inp('Campaign content (optional)','c','')+'</div>',
update:function(R,out){var x=v(R,'u');need(x,'Enter the website URL.');var u;try{u=new URL(/^https?:\/\//i.test(x)?x:'https://'+x)}catch(e){throw new Error('This is not a valid URL.')}
need(v(R,'s')&&v(R,'m')&&v(R,'n'),'Source, medium and campaign name are required.');
[['s','utm_source'],['m','utm_medium'],['n','utm_campaign'],['t','utm_term'],['c','utm_content']].forEach(function(p){if(v(R,p[0]))u.searchParams.set(p[1],v(R,p[0]))});
codeOut(out,u.toString(),'','','Tip: use lowercase names and keep them the same every time, because Google Analytics treats Facebook and facebook as different sources.')}});
/* 8 Slug */
var SW='a an the and or of to in on at for with is are was were be by as it its this that from'.split(' ');
IT.form('seo/slug',{
html:'<div class="ct-in">'+ta('Title or text','x','e.g. How to Compress a Photo to 50KB for Forms',80)+'</div><div class="ct-in">'+sel('Separator','sp',[['-','Hyphen (-)'],['_','Underscore (_)']])+inp('Maximum length (0 = no limit)','ml','','number')+'<label class="ck"><input type="checkbox" name="sw"> Remove small words (a, the, of...)</label></div>',
update:function(R,out){var s=R('[name=x]').value;need(s.trim(),'Type a title to make a URL slug.');var sp=v(R,'sp');
s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ');var w=s.split(/[^a-z0-9]+/).filter(Boolean);if(v(R,'sw'))w=w.filter(function(x){return SW.indexOf(x)<0});
var r=w.join(sp),ml=parseInt(v(R,'ml'),10);if(ml>0&&r.length>ml){r=r.slice(0,ml);var i=r.lastIndexOf(sp);if(i>ml*0.5)r=r.slice(0,i)}
need(r,'Nothing left to make a slug from. Hindi and other non-English letters are removed, so please write the title in English.');
out.innerHTML='<div class="ct-box"><b>URL slug</b><div class="ct-pw" data-s></div><div class="ct-btns"><button type="button" class="p" data-a="c">Copy</button></div><div class="ct-note">'+r.length+' characters, '+w.length+' words. Short slugs with the main keyword work best.</div></div>';
$(out,'[data-s]').textContent=r;$(out,'[data-a=c]').onclick=function(){IT.copy(r,this)}}});
/* 9 Keyword density */
var KW='the and for are but not you all any can had her was one our out has have this that with from they will your what when who how why which their there been were would could should about into than then them these those also just more some such only over very'.split(' ');
IT.form('seo/keyword-density',{
html:'<div class="ct-in">'+ta('Paste your article or page text','x','',170)+'</div><div class="ct-in">'+inp('Minimum word length','n','','number')+'<label class="ck"><input type="checkbox" name="sw" checked> Ignore common words (the, and, for...)</label></div>',
init:function(R){R('[name=n]').value=3},
update:function(R,out){var t=R('[name=x]').value.toLowerCase();var w=t.match(/[\p{L}\p{N}']+/gu)||[];need(w.length,'Paste some text to check the keyword density.');var mn=parseInt(v(R,'n'),10)||1,sw=v(R,'sw'),tot=w.length;
function tab(n,title){var c={};for(var i=0;i+n<=w.length;i++){var g=w.slice(i,i+n);if(g.some(function(x){return x.length<mn}))continue;if(sw&&(n===1?KW.indexOf(g[0])>-1:(KW.indexOf(g[0])>-1||KW.indexOf(g[n-1])>-1)))continue;var k=g.join(' ');c[k]=(c[k]||0)+1}
var a=Object.keys(c).map(function(k){return[k,c[k]]}).filter(function(x){return n===1||x[1]>1}).sort(function(x,y){return y[1]-x[1]}).slice(0,10);
return '<div class="ct-box"><b>'+title+'</b>'+(a.length?'<table><tr><th>Keyword</th><th>Count</th><th>Density</th></tr>'+a.map(function(x){return '<tr><td>'+IT.esc(x[0])+'</td><td>'+x[1]+'</td><td>'+(x[1]/tot*100).toFixed(2)+'%</td></tr>'}).join('')+'</table>':'<span class="ct-note">Nothing repeats enough to show here.</span>')+'</div>'}
out.innerHTML='<div class="ct-grid">'+IT.stat('Total words',IT.nf(tot,0))+'</div>'+tab(1,'Single words')+tab(2,'Two word phrases')+tab(3,'Three word phrases')+'<div class="ct-note">Write for people first. A natural density is fine, and there is no magic percentage that ranks a page.</div>'}});
/* 10 DNS lookup */
function doh(n,t){var q='name='+encodeURIComponent(n)+'&type='+t;return fetch('https://cloudflare-dns.com/dns-query?'+q,{headers:{accept:'application/dns-json'}}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return fetch('https://dns.google/resolve?'+q).then(function(r){return r.json()})})}
var TY={1:'A',2:'NS',5:'CNAME',15:'MX',16:'TXT',28:'AAAA'};
IT.form('seo/dns',{
html:'<div class="ct-in">'+inp('Domain name','d','example.com')+sel('Record type','t',[['A','A (IPv4 address)'],['AAAA','AAAA (IPv6 address)'],['CNAME','CNAME'],['MX','MX (mail)'],['TXT','TXT'],['NS','NS (name servers)']])+'</div><div class="ct-btns"><button type="button" class="p" data-a="go">Look up</button></div>',
init:function(R,out,root,up){root.addEventListener('click',function(e){if(e.target.getAttribute('data-a')==='go')go(R,out)});R('[name=d]').addEventListener('keydown',function(e){if(e.key==='Enter')go(R,out)})},
update:function(){}});
function go(R,out){var d=v(R,'d').replace(/^https?:\/\//i,'').split('/')[0].toLowerCase();if(!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)){out.innerHTML='<p class="it-err">Enter a valid domain name, for example example.com</p>';return}
out.innerHTML='<p class="ct-note">Looking up...</p>';
doh(d,v(R,'t')).then(function(j){var a=j.Answer||[];if(j.Status===3){out.innerHTML='<p class="it-err">This domain was not found (NXDOMAIN).</p>';return}
if(!a.length){out.innerHTML='<p class="ct-note">No '+v(R,'t')+' records found for this domain.</p>';return}
out.innerHTML='<div class="ct-box" style="overflow-x:auto"><table><tr><th>Name</th><th>Type</th><th>TTL</th><th>Value</th></tr>'+a.map(function(x){return '<tr><td>'+IT.esc(x.name)+'</td><td>'+(TY[x.type]||x.type)+'</td><td>'+x.TTL+'</td><td style="text-align:left;overflow-wrap:anywhere">'+IT.esc(String(x.data))+'</td></tr>'}).join('')+'</table></div><div class="ct-note">Records can take hours to spread after you change them.</div>'}).catch(function(){out.innerHTML='<p class="it-err">The lookup failed. Please check your internet connection and try again.</p>'})}
})();
