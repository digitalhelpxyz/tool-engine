/* tool-engine poultry pack v2: Poultry Profit Calculator and FCR Calculator. Needs form.js (IT.form). */
(function(){
var IT=window.IT;if(!IT||!IT.form)return;
var $=function(r,s){return r.querySelector(s)},esc=IT.esc,copy=IT.copy,num=IT.num,nf=IT.nf;
var css='.pt-h{font-size:16px;margin:18px 0 0}.pt .ct-in{margin:8px 0}.pt .ct-in label{flex:1 1 170px}.pt .ct-in label small{font-weight:400;color:var(--muted,#5b6778)}'+
'.pt .row2{display:flex;gap:6px}.pt .row2 input{flex:1 1 58%;min-width:0}.pt .row2 select{flex:1 1 38%;min-width:0}'+
'.pt.layer .pt-meat{display:none}.pt:not(.layer) .pt-egg{display:none}'+
'.pt-more{border:1px solid var(--line,#d9dfe7);border-radius:12px;padding:10px 12px;margin:10px 0}.pt-more summary{cursor:pointer;font-weight:700}'+
'.pt-res{border-radius:14px;padding:16px;text-align:center;margin-top:14px;border:2px solid}.pt-res.good{border-color:#1a8f55;background:rgba(26,143,85,.08)}.pt-res.bad{border-color:#d62f2f;background:rgba(214,47,47,.08)}.pt-res.mid{border-color:#d98a00;background:rgba(217,138,0,.09)}.pt-res.mid b{color:#b36f00}html.dark .pt-res.mid b{color:#ffc15e}.pt-res span{display:block;font-weight:700}.pt-res b{display:block;font-size:32px;line-height:1.2;overflow-wrap:anywhere}.pt-res.good b{color:#1a8f55}.pt-res.bad b{color:#d62f2f}.pt-res small{display:block;margin-top:4px;color:var(--muted,#5b6778)}'+
'html.dark .pt-res.good b{color:#4cd08a}html.dark .pt-res.bad b{color:#ff7b7b}'+
'.pt-leg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;margin:6px 0}.pt-leg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}'+
'.pt-w{margin:0;padding-left:20px;line-height:1.7}.pt-w li{margin-bottom:4px;overflow-wrap:anywhere}.pt-tip{margin:6px 0 0;padding-left:20px;line-height:1.6}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var CUR={INR:['\u20b9','en-IN'],PKR:['Rs ','en-IN'],BDT:['\u09f3','en-IN'],NPR:['Rs ','en-IN'],LKR:['Rs ','en-IN'],USD:['$','en-US'],EUR:['\u20ac','en-US'],GBP:['\u00a3','en-US'],NGN:['\u20a6','en-US'],KES:['KSh ','en-US'],AED:['AED ','en-US']};
var COL=['#0b6e5f','#e6a23c','#4a7fc1','#d62f2f','#8a6fd1','#7a8696','#c9a227'];
function g(R,n){var v=R('[name='+n+']').value;return v===''?NaN:num(v)}
function z(x){return isNaN(x)?0:x}
function sel(name,opts){return '<select name="'+name+'">'+opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')+'</select>'}
function inp(name,ph){return '<input name="'+name+'" type="number" min="0" step="any" inputmode="decimal" placeholder="'+ph+'">'}
var HTML='<div class="pt"><h3 class="pt-h">1. Flock details</h3><div class="ct-in"><label>Poultry type'+sel('type',[['broiler','Broiler (meat chicken)'],['layer','Layer (eggs)'],['desi','Desi / country chicken'],['turkey','Turkey'],['duck','Duck'],['quail','Quail'],['other','Other meat birds']])+'</label><label>Currency'+sel('cur',[['INR','INR \u20b9'],['PKR','PKR Rs'],['BDT','BDT \u09f3'],['NPR','NPR Rs'],['LKR','LKR Rs'],['USD','USD $'],['EUR','EUR \u20ac'],['GBP','GBP \u00a3'],['NGN','NGN \u20a6'],['KES','KES KSh'],['AED','AED']])+'</label></div>'+
'<div class="ct-in"><label>Number of birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died <small>(optional)</small>'+inp('died','e.g. 30')+'</label><label>Cycle / period (days) *'+inp('days','e.g. 42')+'</label></div>'+
'<h3 class="pt-h">2. Selling</h3>'+
'<div class="ct-in pt-meat"><label>Average selling weight per bird *<span class="row2">'+inp('w','e.g. 2.2')+sel('wu',[['kg','kg'],['g','grams']])+'</span></label><label>Selling price *<span class="row2">'+inp('p','e.g. 105')+sel('pu',[['kg','per kg'],['bird','per bird']])+'</span></label></div>'+
'<div class="ct-in pt-egg"><label>Egg production (hen-day %) *'+inp('prod','e.g. 85')+'</label><label>Total eggs produced <small>(optional, used instead of %)</small>'+inp('eggs','e.g. 150000')+'</label></div>'+
'<div class="ct-in pt-egg"><label>Egg price *<span class="row2">'+inp('ep','e.g. 6')+sel('epu',[['egg','per egg'],['dozen','per dozen'],['100','per 100 eggs'],['tray','per tray (30)']])+'</span></label><label>Price of old hens sold <small>(per bird, optional)</small>'+inp('cull','e.g. 150')+'</label></div>'+
'<h3 class="pt-h">3. Costs <small style="font-weight:400">(total for the whole batch)</small></h3>'+
'<div class="ct-in"><label>Feed cost *'+inp('feed','e.g. 165000')+'</label><label>Chick / bird purchase cost *'+inp('chick','e.g. 40000')+'</label><label>Medicine and vaccines'+inp('med','e.g. 12000')+'</label></div>'+
'<details class="pt-more"><summary>More costs (optional)</summary><div class="ct-in"><label>Labour'+inp('lab','e.g. 9000')+'</label><label>Electricity, gas and fuel'+inp('elec','e.g. 6000')+'</label><label>Litter / bedding (bhusa)'+inp('lit','e.g. 3000')+'</label></div><div class="ct-in"><label>Transport, rent and other'+inp('oth','e.g. 5000')+'</label><label>Feed used in kg <small>(for FCR)</small>'+inp('fk','e.g. 3800')+'</label></div></details>'+
'<div class="ct-btns"><button type="button" class="p" data-a="go">Calculate Profit</button><button type="button" data-a="reset">Reset</button><button type="button" data-a="copy">Copy result</button></div></div>';

IT.form('poultry/profit',{html:HTML,
init:function(R,out,root,up){root.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
if(a==='reset'){$$(root,'input').forEach(function(i){i.value=''});up()}
else if(a==='go'){up();var o=$(root,'.ct-out');if(o&&o.scrollIntoView)o.scrollIntoView({behavior:'smooth',block:'start'})}
else if(a==='copy'){var t=root._txt||'';if(t)copy(t,e.target)}});
function $$(r,s){return [].slice.call(r.querySelectorAll(s))}},
update:function(R,out,root){
var layer=R('[name=type]').value==='layer',type=R('[name=type]').value,cu=CUR[R('[name=cur]').value]||CUR.INR,pt=R('.pt');pt.classList.toggle('layer',layer);root._txt='';
function m(x){return (x<0?'-':'')+cu[0]+nf(Math.abs(x),Math.abs(x)>=1000?0:2,cu[1])}function pc(x){return nf(x,1,'en-US')+'%'}
var n=g(R,'n'),died=z(g(R,'died')),days=g(R,'days'),feed=g(R,'feed'),chick=g(R,'chick'),med=z(g(R,'med')),lab=z(g(R,'lab')),elec=z(g(R,'elec')),lit=z(g(R,'lit')),oth=z(g(R,'oth')),fk=g(R,'fk');
var miss=[];if(!(n>0))miss.push('number of birds');if(!(days>0))miss.push('cycle days');
var w=g(R,'w'),p=g(R,'p'),prod=g(R,'prod'),eggsIn=g(R,'eggs'),ep=g(R,'ep'),cull=z(g(R,'cull'));
if(layer){if(!(prod>0)&&!(eggsIn>0))miss.push('egg production % or total eggs');if(!(ep>0))miss.push('egg price')}else{if(!(w>0))miss.push('average weight');if(!(p>0))miss.push('selling price')}
if(isNaN(feed))miss.push('feed cost');if(isNaN(chick))miss.push('chick / bird cost');
if(miss.length){out.innerHTML='<div class="ct-box"><b>Fill the fields marked * to see your profit</b>Still needed: '+esc(miss.join(', '))+'.</div>';return}
if(died>n)throw new Error('Birds died cannot be more than birds placed.');
var costs=[['Feed',feed],['Chicks / birds',chick],['Medicine and vaccines',med],['Labour',lab],['Electricity, gas and fuel',elec],['Litter / bedding',lit],['Transport, rent and other',oth]],total=0;costs.forEach(function(c){total+=c[1]});
var sold=n-died,mort=died/n*100,rev,steps=[],lines=[];
steps.push('Birds sold = '+nf(n,0)+' placed - '+nf(died,0)+' died = <b>'+nf(sold,0)+'</b> (mortality '+pc(mort)+')');
var unitName,unitCost,unitProfit,beKg,beBird,liveKg=NaN,eggs=NaN,beEgg=NaN,cullRev=0,fcr=NaN;
if(!layer){var wk=R('[name=wu]').value==='g'?w/1000:w;liveKg=sold*wk;
if(R('[name=pu]').value==='kg'){rev=liveKg*p;steps.push('Total live weight = '+nf(sold,0)+' birds x '+nf(wk,3,'en-US')+' kg = <b>'+nf(liveKg,1)+' kg</b>');steps.push('Revenue = '+nf(liveKg,1)+' kg x '+m(p)+' per kg = <b>'+m(rev)+'</b>')}
else{rev=sold*p;steps.push('Total live weight = '+nf(sold,0)+' birds x '+nf(wk,3,'en-US')+' kg = <b>'+nf(liveKg,1)+' kg</b>');steps.push('Revenue = '+nf(sold,0)+' birds x '+m(p)+' per bird = <b>'+m(rev)+'</b>')}
if(fk>0)fcr=fk/liveKg}
else{var hens=n-died/2;eggs=eggsIn>0?eggsIn:hens*days*prod/100;var pe={egg:ep,dozen:ep/12,'100':ep/100,tray:ep/30}[R('[name=epu]').value];var eggRev=eggs*pe;cullRev=sold*cull;rev=eggRev+cullRev;
if(eggsIn>0)steps.push('Eggs = <b>'+nf(eggs,0)+'</b> (entered by you)');else steps.push('Average hens = '+nf(n,0)+' - '+nf(died,0)+' / 2 = '+nf(hens,1)+'; Eggs = '+nf(hens,1)+' x '+nf(days,0)+' days x '+nf(prod,1)+'% = <b>'+nf(eggs,0)+'</b>');
steps.push('Egg income = '+nf(eggs,0)+' eggs x '+m(pe)+' per egg = <b>'+m(eggRev)+'</b>');if(cullRev>0)steps.push('Old hens income = '+nf(sold,0)+' x '+m(cull)+' = <b>'+m(cullRev)+'</b>');steps.push('Revenue = <b>'+m(rev)+'</b>')}
steps.push('Total cost = '+costs.filter(function(c){return c[1]>0}).map(function(c){return m(c[1])}).join(' + ')+' = <b>'+m(total)+'</b>');
var profit=rev-total,margin=rev>0?profit/rev*100:NaN,roi=total>0?profit/total*100:NaN,good=profit>=0;
steps.push('Net '+(good?'profit':'loss')+' = '+m(rev)+' - '+m(total)+' = <b>'+m(profit)+'</b>');
var stats=[],S=IT.stat;stats.push(S('Total revenue',m(rev)));stats.push(S('Total cost',m(total)));stats.push(S('Profit margin',isNaN(margin)?'-':pc(margin)));stats.push(S('Return on investment (ROI)',isNaN(roi)?'-':pc(roi)));
stats.push(S('Mortality',pc(mort)));
if(!layer){stats.push(S('Cost per bird sold',m(total/sold)));stats.push(S('Profit per bird sold',m(profit/sold)));stats.push(S('Cost per kg live weight',m(total/liveKg)));stats.push(S('Profit per kg',m(profit/liveKg)));if(!isNaN(fcr))stats.push(S('FCR',nf(fcr,2,'en-US')));if(days>0)stats.push(S('Profit per bird per day',m(profit/sold/days)))}
else{stats.push(S('Total eggs',nf(eggs,0)));stats.push(S('Eggs per hen',nf(eggs/n,1,'en-US')));stats.push(S('Cost per egg',m((total-cullRev)/eggs)));stats.push(S('Profit per hen',m(profit/n)))}
var be;if(!layer){be='To break even you must sell at <strong>'+m(total/liveKg)+' per kg</strong> live weight, or <strong>'+m(total/sold)+' per bird</strong>. Anything above this is profit.'}
else{var bpe=(total-cullRev)/eggs;be='To break even your eggs must sell at <strong>'+m(bpe)+' per egg</strong> (<strong>'+m(bpe*12)+' per dozen</strong>, <strong>'+m(bpe*100)+' per 100</strong>)'+(cullRev>0?', after counting the income from old hens':'')+'.'}
var bar='<div class="ct-bar">'+costs.map(function(c,i){return c[1]>0?'<i style="width:'+(c[1]/total*100)+'%;background:'+COL[i]+'" title="'+esc(c[0])+'"></i>':''}).join('')+'</div><div class="pt-leg">'+costs.map(function(c,i){return c[1]>0?'<span><i style="background:'+COL[i]+'"></i>'+esc(c[0])+' '+pc(c[1]/total*100)+'</span>':''}).join('')+'</div>';
var tbl='<table><tr><th>Cost item</th><th>Amount</th><th>Share</th></tr>'+costs.filter(function(c){return c[1]>0}).map(function(c){return '<tr><td>'+esc(c[0])+'</td><td>'+m(c[1])+'</td><td>'+pc(c[1]/total*100)+'</td></tr>'}).join('')+'<tr><td><b>Total</b></td><td><b>'+m(total)+'</b></td><td>100%</td></tr></table>';
var tips=[],fs=feed/total*100;
tips.push('Feed is '+pc(fs)+' of your total cost'+(fs>=65?', which is normal for poultry. Even a small improvement in FCR or feed price changes your profit a lot.':'.'));
if(!layer&&!isNaN(fcr)&&type==='broiler')tips.push('Your FCR is '+nf(fcr,2,'en-US')+'. For broilers sold at about 5 to 6 weeks, a figure around 1.6 to 1.8 is usually seen as good. It depends on breed, age and sale weight.');
if(!layer&&isNaN(fcr))tips.push('Add "Feed used in kg" under More costs to see your FCR.');
if(type==='broiler'&&mort>5)tips.push('Mortality is '+pc(mort)+'. For broilers, staying under about 5% is a common target, so check what caused the losses.');
if(good&&margin<5)tips.push('Your margin is thin. A small drop in selling price can turn this batch into a loss.');
if(!good)tips.push('This batch is making a loss. Compare your break-even rate with the rate you actually got.');
out.innerHTML='<div class="pt-res '+(good?'good':'bad')+'"><span>Net '+(good?'profit':'loss')+'</span><b>'+m(Math.abs(profit))+'</b><small>'+(layer?m(profit/n)+' per hen placed':m(profit/sold)+' per bird sold')+(isNaN(margin)?'':', margin '+pc(margin))+'</small></div>'+
'<div class="ct-grid">'+stats.join('')+'</div><div class="ct-box"><b>Break-even price</b>'+be+'</div>'+
'<div class="ct-box"><b>Where your money went</b>'+bar+tbl+'</div>'+
'<div class="ct-box"><b>How we calculated it</b><ol class="pt-w">'+steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></div>'+
'<div class="ct-box"><b>What this means</b><ul class="pt-tip">'+tips.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul></div>'+
'<p class="ct-note">This is an estimate based on the numbers you entered. Use your own farm records for exact accounts. It does not include taxes, interest or the value of your own time unless you add them as costs.</p>';
var plain=function(s){return s.replace(/<[^>]+>/g,'')};
root._txt='Poultry profit calculation\n'+steps.map(function(s){return plain(s)}).join('\n')+'\nProfit margin: '+(isNaN(margin)?'-':pc(margin))+'\nROI: '+(isNaN(roi)?'-':pc(roi))+'\n'+plain(be)+'\nCalculated at toolsxyz.in'}});
/* ---------- FCR Calculator ---------- */
var FU={kg:1,b50:50,b25:25,q:100,t:1000};
var FH='<div class="pt fcr"><h3 class="pt-h">1. Feed given</h3><div class="ct-in"><label>Total feed given to the birds *<span class="row2">'+inp('feed','e.g. 3800')+sel('fu',[['kg','kg'],['b50','bags (50 kg)'],['b25','bags (25 kg)'],['q','quintal (100 kg)'],['t','tonne']])+'</span></label><label>Feed price per kg <small>(optional, shows feed cost)</small>'+inp('fp','e.g. 40')+'</label></div>'+
'<h3 class="pt-h">2. Birds and weight</h3><div class="ct-in"><label>Number of birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died <small>(optional)</small>'+inp('died','e.g. 40')+'</label><label>Age / days of the cycle <small>(optional)</small>'+inp('days','e.g. 42')+'</label></div>'+
'<div class="ct-in"><label>Average weight per bird *<span class="row2">'+inp('w','e.g. 2.2')+sel('wu',[['kg','kg'],['g','grams']])+'</span></label><label>Total live weight sold, kg <small>(optional, used instead of average weight)</small>'+inp('tw','e.g. 2112')+'</label><label>Chick weight at start, grams <small>(optional)</small>'+inp('cw','e.g. 40')+'</label></div>'+
'<div class="ct-btns"><button type="button" class="p" data-a="go">Calculate FCR</button><button type="button" data-a="reset">Reset</button><button type="button" data-a="copy">Copy result</button></div></div>';
IT.form('poultry/fcr',{html:FH,
init:function(R,out,root,up){root.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
if(a==='reset'){[].slice.call(root.querySelectorAll('input')).forEach(function(i){i.value=''});up()}
else if(a==='go'){up();var o=$(root,'.ct-out');if(o&&o.scrollIntoView)o.scrollIntoView({behavior:'smooth',block:'start'})}
else if(a==='copy'){var t=root._txt||'';if(t)copy(t,e.target)}})},
update:function(R,out,root){root._txt='';var f=function(x,d){return nf(x,d==null?2:d,'en-US')},fx=function(x){return x.toFixed(2)};
var feedIn=g(R,'feed'),fu=FU[R('[name=fu]').value]||1,n=g(R,'n'),died=z(g(R,'died')),days=g(R,'days'),w=g(R,'w'),tw=g(R,'tw'),cw=g(R,'cw'),fp=g(R,'fp');
var miss=[];if(!(feedIn>0))miss.push('total feed');if(!(n>0))miss.push('number of birds');if(!(w>0)&&!(tw>0))miss.push('average weight or total live weight');
if(miss.length){out.innerHTML='<div class="ct-box"><b>Fill the fields marked * to see your FCR</b>Still needed: '+esc(miss.join(', '))+'.</div>';return}
if(died>n)throw new Error('Birds died cannot be more than birds placed.');
var sold=n-died;if(sold<=0)throw new Error('No birds are left to weigh. Check the number of birds died.');
var feedKg=feedIn*fu,wk=R('[name=wu]').value==='g'?w/1000:w,liveKg=tw>0?tw:sold*wk,avgW=liveKg/sold;
if(!(liveKg>0))throw new Error('Total live weight must be more than zero.');
var fcr=feedKg/liveKg,steps=[],stats=[],S=IT.stat;
steps.push('Feed = '+f(feedIn,2)+' x '+f(fu,0)+' kg = <b>'+f(feedKg,1)+' kg</b>');
if(tw>0)steps.push('Total live weight = <b>'+f(liveKg,1)+' kg</b> (entered by you)');else steps.push('Total live weight = '+f(sold,0)+' birds x '+f(wk,3)+' kg = <b>'+f(liveKg,1)+' kg</b>');
steps.push('FCR = '+f(feedKg,1)+' kg feed / '+f(liveKg,1)+' kg live weight = <b>'+fx(fcr)+'</b>');
var band,cls,msg;if(fcr<1.6){band='Excellent';cls='good';msg='Your birds turned feed into weight very efficiently.'}else if(fcr<=1.8){band='Good';cls='good';msg='This is a good result for broilers sold at around 5 to 6 weeks.'}else if(fcr<=2){band='Average';cls='mid';msg='There is room to improve. Check feed wastage, water, shed temperature and bird health.'}else{band='High';cls='bad';msg='Your birds needed a lot of feed for each kg of weight. Check feed wastage, feed quality, disease and shed conditions.'}
stats.push(S('Total live weight',f(liveKg,1)+' kg'));stats.push(S('Average weight per bird',f(avgW,2)+' kg'));stats.push(S('Feed per bird sold',f(feedKg/sold,2)+' kg'));stats.push(S('Mortality',f(died/n*100,1)+'%'));
if(cw>0){var gain=liveKg-n*cw/1000;if(gain>0){stats.push(S('FCR on weight gain',fx(feedKg/gain)));steps.push('FCR on weight gain = '+f(feedKg,1)+' / ('+f(liveKg,1)+' - '+f(n,0)+' x '+f(cw/1000,3)+' kg chicks) = <b>'+fx(feedKg/gain)+'</b>')}}
if(days>0){stats.push(S('Weight gain per day',f(avgW*1000/days,1)+' g'));stats.push(S('Feed per bird per day',f(feedKg*1000/(n*days),1)+' g'))}
if(fp>0){var fc=feedKg*fp;stats.push(S('Feed cost',cu0(fc)));stats.push(S('Feed cost per kg of meat',cu0(fc/liveKg)));stats.push(S('Feed cost per bird sold',cu0(fc/sold)));steps.push('Feed cost = '+f(feedKg,1)+' kg x '+f(fp,2)+' = <b>'+cu0(fc)+'</b>; per kg of meat = '+cu0(fc)+' / '+f(liveKg,1)+' kg = <b>'+cu0(fc/liveKg)+'</b>')}
function cu0(x){return (x<0?'-':'')+nf(Math.abs(x),Math.abs(x)>=1000?0:2,'en-IN')}
var wi='<table><tr><th>If your FCR improved by</th><th>Feed saved</th>'+(fp>0?'<th>Money saved</th>':'')+'</tr>'+[.05,.1,.15].map(function(d){var sv=d*liveKg;return '<tr><td>'+d.toFixed(2)+' (to '+fx(Math.max(fcr-d,0))+')</td><td>'+f(sv,0)+' kg</td>'+(fp>0?'<td>'+cu0(sv*fp)+'</td>':'')+'</tr>'}).join('')+'</table>';
out.innerHTML='<div class="pt-res '+cls+'"><span>Your FCR</span><b>'+fx(fcr)+'</b><small>'+band+'. '+msg+'</small></div><div class="ct-grid">'+stats.join('')+'</div>'+
'<div class="ct-box"><b>How much a better FCR would save</b>'+wi+'</div>'+
'<div class="ct-box"><b>How we calculated it</b><ol class="pt-w">'+steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></div>'+
'<div class="ct-box"><b>What this means</b><ul class="pt-tip"><li>FCR is the kilograms of feed your birds ate for each kilogram of weight they put on. A lower number is better.</li><li>The ranges used here (under 1.6 excellent, 1.6 to 1.8 good, 1.8 to 2.0 average, above 2.0 high) are a general guide for broilers sold at 5 to 6 weeks. Heavier or older birds naturally have a higher FCR, and every breed has its own target.</li><li>The feed you enter includes feed eaten by birds that later died, so high mortality raises your FCR.</li></ul></div>'+
'<p class="ct-note">This is an estimate based on the numbers you enter. For the exact target of your breed, check the performance guide from your chick supplier.</p>';
root._txt='FCR calculation\n'+steps.map(function(s){return s.replace(/<[^>]+>/g,'')}).join('\n')+'\nRating: '+band+'\nCalculated at toolsxyz.in'}});
})();
