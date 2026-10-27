/* tool-engine poultry pack v3: Poultry Profit, FCR, Mortality, Break-even, EPEF, Feed and Egg Cost calculators. Needs form.js (IT.form). */
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
/* ---------- Batch 2: Mortality, Break-even, EPEF, Feed, Egg cost ---------- */
var CO=[['INR','INR \u20b9'],['PKR','PKR Rs'],['BDT','BDT \u09f3'],['NPR','NPR Rs'],['LKR','LKR Rs'],['USD','USD $'],['EUR','EUR \u20ac'],['GBP','GBP \u00a3'],['NGN','NGN \u20a6'],['KES','KES KSh'],['AED','AED']];
function curSel(){return '<label>Currency'+sel('cur',CO)+'</label>'}
function mfn(R){var cu=CUR[R('[name=cur]').value]||CUR.INR;return function(x){return (x<0?'-':'')+cu[0]+nf(Math.abs(x),Math.abs(x)>=1000?0:2,cu[1])}}
function F(x,d){return nf(x,d==null?2:d,'en-US')}
function plain(s){return s.replace(/<[^>]+>/g,'')}
function btns(go){return '<div class="ct-btns"><button type="button" class="p" data-a="go">'+go+'</button><button type="button" data-a="reset">Reset</button><button type="button" data-a="copy">Copy result</button></div>'}
function initBtns(R,out,root,up){root.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
if(a==='reset'){[].slice.call(root.querySelectorAll('input')).forEach(function(i){i.value=''});up()}
else if(a==='go'){up();var o=$(root,'.ct-out');if(o&&o.scrollIntoView)o.scrollIntoView({behavior:'smooth',block:'start'})}
else if(a==='copy'){var t=root._txt||'';if(t)copy(t,e.target)}})}
function need(out,title,miss){out.innerHTML='<div class="ct-box"><b>'+title+'</b>Still needed: '+esc(miss.join(', '))+'.</div>'}
function steps(a){return '<div class="ct-box"><b>How we calculated it</b><ol class="pt-w">'+a.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></div>'}
function tips(a){return '<div class="ct-box"><b>What this means</b><ul class="pt-tip">'+a.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul></div>'}
var NOTE='<p class="ct-note">This is an estimate based on the numbers you enter. Use your own farm records for exact accounts.</p>';
function hero(cls,label,big,small){return '<div class="pt-res '+cls+'"><span>'+label+'</span><b>'+big+'</b><small>'+small+'</small></div>'}

/* 1. Mortality */
IT.form('poultry/mortality',{html:'<div class="pt"><h3 class="pt-h">1. Birds</h3><div class="ct-in"><label>Poultry type'+sel('type',[['broiler','Broiler (meat chicken)'],['layer','Layer (eggs)'],['other','Other birds']])+'</label>'+curSel()+'</div>'+
'<div class="ct-in"><label>Number of birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died *'+inp('died','e.g. 40')+'</label><label>Died in the first 7 days <small>(optional)</small>'+inp('w1','e.g. 15')+'</label></div>'+
'<h3 class="pt-h">2. Money lost <small style="font-weight:400">(optional)</small></h3><div class="ct-in"><label>Price paid per chick / bird'+inp('cp','e.g. 40')+'</label><label>Selling value of one bird'+inp('sv','e.g. 230')+'</label></div>'+btns('Calculate Mortality')+'</div>',
init:initBtns,
update:function(R,out,root){root._txt='';var m=mfn(R),n=g(R,'n'),died=g(R,'died'),w1=g(R,'w1'),cp=g(R,'cp'),sv=g(R,'sv'),type=R('[name=type]').value,miss=[];
if(!(n>0))miss.push('number of birds placed');if(isNaN(died))miss.push('birds died (enter 0 if none)');if(miss.length){need(out,'Fill the fields marked * to see your mortality',miss);return}
if(died<0||died>n)throw new Error('Birds died must be between 0 and the birds placed.');
var mort=died/n*100,liv=100-mort,alive=n-died,cls,band,msg;
if(type==='broiler'){if(mort<3){band='Very good';cls='good';msg='Very few birds were lost.'}else if(mort<=5){band='Good';cls='good';msg='This is within the range many broiler farms aim for.'}else if(mort<=8){band='High';cls='mid';msg='Check brooding, ventilation, water, feed and vaccination records to find the cause.'}else{band='Very high';cls='bad';msg='A lot of birds were lost. Find the cause before the next batch.'}}
else{band='';cls=mort<=5?'good':mort<=10?'mid':'bad';msg='Targets depend on the type of bird and how long the flock was kept.'}
var st=[IT.stat('Livability',F(liv,1)+'%'),IT.stat('Birds alive',F(alive,0)),IT.stat('Birds died',F(died,0))],stp=[],S=IT.stat;
stp.push('Mortality = '+F(died,0)+' died / '+F(n,0)+' placed x 100 = <b>'+F(mort,2)+'%</b>');stp.push('Livability = 100% - '+F(mort,2)+'% = <b>'+F(liv,2)+'%</b>');
if(w1>=0){st.push(S('First-week mortality',F(w1/n*100,2)+'%'));stp.push('First-week mortality = '+F(w1,0)+' / '+F(n,0)+' x 100 = <b>'+F(w1/n*100,2)+'%</b>')}
if(cp>0){st.push(S('Spent on chicks that died',m(died*cp)));stp.push('Chick cost lost = '+F(died,0)+' x '+m(cp)+' = <b>'+m(died*cp)+'</b>')}
if(sv>0){st.push(S('Sale income lost',m(died*sv)));stp.push('Sale income lost = '+F(died,0)+' x '+m(sv)+' = <b>'+m(died*sv)+'</b>')}
var wi='<table><tr><th>If mortality was lower by</th><th>Birds saved</th>'+(sv>0?'<th>Extra income</th>':'')+'</tr>'+[1,2,3].map(function(d){var b=Math.min(n*d/100,died);return '<tr><td>'+d+' point'+(d>1?'s':'')+' (to '+F(Math.max(mort-d,0),1)+'%)</td><td>'+F(b,0)+'</td>'+(sv>0?'<td>'+m(b*sv)+'</td>':'')+'</tr>'}).join('')+'</table>';
var tp=['Mortality is the share of birds that died. Livability is the share that lived, so the two always add up to 100%.','Dead birds also ate feed before they died, so the real loss is more than the chick cost alone.'];
if(w1>=0&&w1/n*100>1)tp.push('Deaths in the first week are '+F(w1/n*100,1)+'% of the flock. High early mortality usually points to chick quality or brooding problems.');
out.innerHTML=hero(cls,'Mortality',F(mort,2)+'%',(band?band+'. ':'')+msg)+'<div class="ct-grid">'+st.join('')+'</div><div class="ct-box"><b>What a lower mortality would give you</b>'+wi+'</div>'+steps(stp)+tips(tp)+NOTE;
root._txt='Mortality calculation\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}});

/* 2. Break-even rate */
IT.form('poultry/breakeven',{html:'<div class="pt"><h3 class="pt-h">1. Flock</h3><div class="ct-in"><label>What do you sell?'+sel('type',[['meat','Meat birds (broiler, desi, turkey, duck, quail)'],['layer','Eggs (layer)']])+'</label>'+curSel()+'</div>'+
'<div class="ct-in"><label>Number of birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died <small>(optional)</small>'+inp('died','e.g. 40')+'</label></div>'+
'<div class="ct-in pt-meat"><label>Average selling weight per bird *<span class="row2">'+inp('w','e.g. 2.2')+sel('wu',[['kg','kg'],['g','grams']])+'</span></label></div>'+
'<div class="ct-in pt-egg"><label>Total eggs produced *'+inp('eggs','e.g. 37800')+'</label><label>Income from old hens <small>(optional, total)</small>'+inp('cull','e.g. 40000')+'</label></div>'+
'<h3 class="pt-h">2. Total costs of the batch</h3><div class="ct-in"><label>Feed cost *'+inp('feed','e.g. 152000')+'</label><label>Chick / bird cost *'+inp('chick','e.g. 40000')+'</label></div><div class="ct-in"><label>Medicine and vaccines'+inp('med','e.g. 12000')+'</label><label>Labour, power and all other costs'+inp('oth','e.g. 23000')+'</label></div>'+
'<h3 class="pt-h">3. Extra <small style="font-weight:400">(optional)</small></h3><div class="ct-in"><label>Profit you want on your cost (%)'+inp('tp','e.g. 10')+'</label><label>Rate you actually sold at<span class="row2">'+inp('ar','e.g. 105')+sel('au',[['kg','per kg'],['bird','per bird'],['egg','per egg'],['dozen','per dozen']])+'</span></label></div>'+btns('Find Break-even Rate')+'</div>',
init:initBtns,
update:function(R,out,root){root._txt='';var layer=R('[name=type]').value==='layer';R('.pt').classList.toggle('layer',layer);var m=mfn(R),n=g(R,'n'),died=z(g(R,'died')),feed=g(R,'feed'),chick=g(R,'chick'),med=z(g(R,'med')),oth=z(g(R,'oth')),tp=g(R,'tp'),ar=g(R,'ar'),au=R('[name=au]').value,miss=[];
var w=g(R,'w'),eggs=g(R,'eggs'),cull=z(g(R,'cull'));if(!(n>0))miss.push('number of birds');if(layer){if(!(eggs>0))miss.push('total eggs')}else if(!(w>0))miss.push('average weight');if(isNaN(feed))miss.push('feed cost');if(isNaN(chick))miss.push('chick cost');
if(miss.length){need(out,'Fill the fields marked * to see your break-even rate',miss);return}if(died>n)throw new Error('Birds died cannot be more than birds placed.');
var total=feed+chick+med+oth,sold=n-died,stp=[],S=IT.stat,st=[S('Total cost',m(total))],hr,rows,beBase,units;
stp.push('Total cost = '+m(feed)+' + '+m(chick)+(med?' + '+m(med):'')+(oth?' + '+m(oth):'')+' = <b>'+m(total)+'</b>');
if(!layer){var wk=R('[name=wu]').value==='g'?w/1000:w,live=sold*wk,bk=total/live,bb=total/sold;stp.push('Birds sold = '+F(n,0)+' - '+F(died,0)+' = '+F(sold,0)+'; live weight = '+F(sold,0)+' x '+F(wk,3)+' kg = <b>'+F(live,1)+' kg</b>');stp.push('Break-even per kg = '+m(total)+' / '+F(live,1)+' kg = <b>'+m(bk)+'</b>');stp.push('Break-even per bird = '+m(total)+' / '+F(sold,0)+' birds = <b>'+m(bb)+'</b>');
hr=hero('good','Break-even rate',m(bk)+' per kg','or '+m(bb)+' per bird. Selling below this means a loss.');st.push(S('Per bird sold',m(bb)),S('Live weight',F(live,1)+' kg'));beBase=bk;units='per kg';
if(tp>0){st.push(S('Rate for '+F(tp,1)+'% profit',m(bk*(1+tp/100))+' per kg'));stp.push('Rate for '+F(tp,1)+'% profit = '+m(bk)+' x (1 + '+F(tp,1)+'/100) = <b>'+m(bk*(1+tp/100))+' per kg</b>')}
if(ar>0){var ab=au==='bird'?bb:bk,ak=au==='bird'?'per bird':'per kg';if(au==='kg'||au==='bird'){var d=ar-ab;st.push(S('Your rate vs break-even',(d>=0?'+':'')+m(d)+' '+ak));hr=hero(d>=0?'good':'bad','Break-even rate',m(bk)+' per kg','or '+m(bb)+' per bird. You sold at '+m(ar)+' '+ak+', which is '+m(Math.abs(d))+' '+(d>=0?'above':'below')+' your break-even.')}}
rows=[-10,0,10,20,30].map(function(p){var r=bk*(1+p/100);return '<tr><td>'+m(r)+' per kg'+(p===0?' (break-even)':' ('+(p>0?'+':'')+p+'%)')+'</td><td>'+m(r*live-total)+'</td></tr>'}).join('')}
else{var be=(total-cull)/eggs;stp.push('Break-even per egg = ('+m(total)+(cull?' - '+m(cull)+' old hens':'')+') / '+F(eggs,0)+' eggs = <b>'+m(be)+'</b>');
hr=hero('good','Break-even rate',m(be)+' per egg',m(be*12)+' per dozen, '+m(be*100)+' per 100 eggs, '+m(be*30)+' per tray of 30.');st.push(S('Per dozen',m(be*12)),S('Per 100 eggs',m(be*100)),S('Eggs per bird placed',F(eggs/n,1)));beBase=be;
if(tp>0){st.push(S('Rate for '+F(tp,1)+'% profit',m(be*(1+tp/100))+' per egg'));stp.push('Rate for '+F(tp,1)+'% profit = '+m(be)+' x (1 + '+F(tp,1)+'/100) = <b>'+m(be*(1+tp/100))+' per egg</b>')}
if(ar>0){var pe={kg:NaN,bird:NaN,egg:ar,dozen:ar/12}[au];if(!isNaN(pe)){var d2=pe-be;st.push(S('Your rate vs break-even',(d2>=0?'+':'')+m(d2)+' per egg'));hr=hero(d2>=0?'good':'bad','Break-even rate',m(be)+' per egg',m(be*12)+' per dozen. You sold at '+m(pe)+' per egg, which is '+m(Math.abs(d2))+' '+(d2>=0?'above':'below')+' your break-even.')}}
rows=[-10,0,10,20,30].map(function(p){var r=be*(1+p/100);return '<tr><td>'+m(r)+' per egg'+(p===0?' (break-even)':' ('+(p>0?'+':'')+p+'%)')+'</td><td>'+m(r*eggs+cull-total)+'</td></tr>'}).join('')}
var sens='<div class="ct-box"><b>What different selling rates would give you</b><table><tr><th>Selling rate</th><th>Profit or loss</th></tr>'+rows+'</table></div>';
out.innerHTML=hr+'<div class="ct-grid">'+st.join('')+'</div>'+sens+steps(stp)+tips(['The break-even rate is your total cost divided by what you have to sell. It is the lowest rate at which you do not lose money.','Check it before you agree a rate with a trader. If the market rate is below your break-even, you will make a loss on that batch.','Include every cost for the batch, including labour and power, or your break-even will look lower than it really is.'])+NOTE;
root._txt='Break-even rate\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}});

/* 3. EPEF */
function epefOf(liv,w,age,fcr){return liv*w*100/(age*fcr)}
IT.form('poultry/epef',{html:'<div class="pt"><h3 class="pt-h">1. Batch details</h3><div class="ct-in"><label>Number of birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died <small>(optional)</small>'+inp('died','e.g. 40')+'</label><label>Age at sale (days) *'+inp('age','e.g. 42')+'</label></div>'+
'<div class="ct-in"><label>Average weight per bird *<span class="row2">'+inp('w','e.g. 2.2')+sel('wu',[['kg','kg'],['g','grams']])+'</span></label><label>FCR <small>(or enter feed used below)</small>'+inp('fcr','e.g. 1.8')+'</label><label>Total feed used, kg <small>(if you do not know FCR)</small>'+inp('fk','e.g. 3800')+'</label></div>'+btns('Calculate EPEF')+'</div>',
init:initBtns,
update:function(R,out,root){root._txt='';var n=g(R,'n'),died=z(g(R,'died')),age=g(R,'age'),w=g(R,'w'),fcr=g(R,'fcr'),fk=g(R,'fk'),miss=[];
if(!(n>0))miss.push('number of birds');if(!(age>0))miss.push('age at sale');if(!(w>0))miss.push('average weight');if(!(fcr>0)&&!(fk>0))miss.push('FCR or total feed used');if(miss.length){need(out,'Fill the fields marked * to see your EPEF',miss);return}
if(died>=n)throw new Error('Birds died must be less than birds placed.');var wk=R('[name=wu]').value==='g'?w/1000:w,sold=n-died,liv=sold/n*100,stp=[],usedFcr=fcr;
if(!(fcr>0)){usedFcr=fk/(sold*wk);stp.push('FCR = '+F(fk,0)+' kg feed / ('+F(sold,0)+' birds x '+F(wk,3)+' kg) = <b>'+F(usedFcr,2)+'</b>')}
var e=epefOf(liv,wk,age,usedFcr),band,cls;if(e<250){band='Needs improvement';cls='bad'}else if(e<300){band='Average';cls='mid'}else if(e<350){band='Good';cls='good'}else{band='Excellent';cls='good'}
stp.unshift('Livability = ('+F(n,0)+' - '+F(died,0)+') / '+F(n,0)+' x 100 = <b>'+F(liv,2)+'%</b>');stp.push('EPEF = (livability % x weight kg x 100) / (age days x FCR) = ('+F(liv,2)+' x '+F(wk,3)+' x 100) / ('+F(age,0)+' x '+F(usedFcr,2)+') = <b>'+F(e,0)+'</b>');
var S=IT.stat,st=[S('Livability',F(liv,1)+'%'),S('FCR',F(usedFcr,2)),S('Average weight',F(wk,2)+' kg'),S('Daily gain',F(wk*1000/age,1)+' g per day')];
var wi='<table><tr><th>If you improved</th><th>New EPEF</th></tr><tr><td>FCR by 0.1 (to '+F(Math.max(usedFcr-.1,.5),2)+')</td><td>'+F(epefOf(liv,wk,age,Math.max(usedFcr-.1,.5)),0)+'</td></tr><tr><td>Livability by 1 point (to '+F(Math.min(liv+1,100),1)+'%)</td><td>'+F(epefOf(Math.min(liv+1,100),wk,age,usedFcr),0)+'</td></tr><tr><td>Weight by 100 g (to '+F(wk+.1,2)+' kg)</td><td>'+F(epefOf(liv,wk+.1,age,usedFcr),0)+'</td></tr><tr><td>Age by 2 days faster (to '+F(age-2,0)+' days)</td><td>'+F(epefOf(liv,wk,Math.max(age-2,1),usedFcr),0)+'</td></tr></table>';
out.innerHTML=hero(cls,'Your EPEF',F(e,0),band+'. Higher is better.')+'<div class="ct-grid">'+st.join('')+'</div><div class="ct-box"><b>What would raise your score</b>'+wi+'</div>'+steps(stp)+tips(['EPEF (European Production Efficiency Factor) is one score that combines livability, weight, age and FCR, so you can compare batches.','The bands used here (under 250 needs improvement, 250 to 300 average, 300 to 350 good, above 350 excellent) are only a general guide for broilers. Targets change with breed, age and sale weight.','Compare EPEF only between batches sold at a similar age and weight. Use the guide from your chick supplier for your breed target.'])+NOTE;
root._txt='EPEF calculation\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}});

/* 4. Feed consumption and cost */
IT.form('poultry/feed',{html:'<div class="pt fd-check"><h3 class="pt-h">What do you want to do?</h3><div class="ct-in"><label>Mode'+sel('mode',[['check','Check feed already used and its cost'],['plan','Plan the feed I need to buy']])+'</label>'+curSel()+'</div>'+
'<div class="fd-c"><h3 class="pt-h">Feed used</h3><div class="ct-in"><label>Total feed used *<span class="row2">'+inp('feed','e.g. 76')+sel('fu',[['kg','kg'],['b50','bags (50 kg)'],['b25','bags (25 kg)'],['q','quintal (100 kg)'],['t','tonne']])+'</span></label><label>Average feed price per kg *'+inp('fp','e.g. 40')+'</label></div>'+
'<div class="ct-in"><label>Birds placed *'+inp('n','e.g. 1000')+'</label><label>Birds died <small>(optional)</small>'+inp('died','e.g. 40')+'</label><label>Days of the cycle <small>(optional)</small>'+inp('days','e.g. 42')+'</label></div><div class="ct-in"><label>Average weight per bird <small>(optional, for feed cost per kg of meat)</small><span class="row2">'+inp('w','e.g. 2.2')+sel('wu',[['kg','kg'],['g','grams']])+'</span></label></div></div>'+
'<div class="fd-p"><h3 class="pt-h">Feed plan <small style="font-weight:400">(use your own feed schedule)</small></h3><div class="ct-in"><label>Birds to place *'+inp('pn','e.g. 1000')+'</label><label>Bag weight'+sel('bw',[['50','50 kg'],['25','25 kg'],['40','40 kg']])+'</label></div>'+
'<div class="ct-in"><label>Starter: feed per bird (kg)'+inp('s1','e.g. 0.8')+'</label><label>Starter price per kg'+inp('p1','e.g. 48')+'</label></div><div class="ct-in"><label>Grower: feed per bird (kg)'+inp('s2','e.g. 1.5')+'</label><label>Grower price per kg'+inp('p2','e.g. 44')+'</label></div><div class="ct-in"><label>Finisher: feed per bird (kg)'+inp('s3','e.g. 1.6')+'</label><label>Finisher price per kg'+inp('p3','e.g. 42')+'</label></div></div>'+btns('Calculate Feed')+'</div>',
init:initBtns,
update:function(R,out,root){root._txt='';var m=mfn(R),mode=R('[name=mode]').value,pt=R('.pt');pt.classList.toggle('fd-plan-on',mode==='plan');[].forEach.call(root.querySelectorAll('.fd-c'),function(e){e.style.display=mode==='plan'?'none':''});[].forEach.call(root.querySelectorAll('.fd-p'),function(e){e.style.display=mode==='plan'?'':'none'});var S=IT.stat,stp=[],st=[];
if(mode==='check'){var feedIn=g(R,'feed'),fu=FU[R('[name=fu]').value]||1,fp=g(R,'fp'),n=g(R,'n'),died=z(g(R,'died')),days=g(R,'days'),w=g(R,'w'),miss=[];if(!(feedIn>0))miss.push('total feed');if(!(fp>0))miss.push('feed price per kg');if(!(n>0))miss.push('birds placed');if(miss.length){need(out,'Fill the fields marked * to see your feed cost',miss);return}
if(died>=n)throw new Error('Birds died must be less than birds placed.');var kg=feedIn*fu,cost=kg*fp,sold=n-died;stp.push('Feed = '+F(feedIn,2)+' x '+F(fu,0)+' kg = <b>'+F(kg,1)+' kg</b> ('+F(kg/50,1)+' bags of 50 kg)');stp.push('Feed cost = '+F(kg,1)+' kg x '+m(fp)+' = <b>'+m(cost)+'</b>');stp.push('Feed per bird placed = '+F(kg,1)+' / '+F(n,0)+' = <b>'+F(kg/n,2)+' kg</b>; cost per bird placed = <b>'+m(cost/n)+'</b>');
st.push(S('Total feed',F(kg,0)+' kg'),S('Bags of 50 kg',F(kg/50,1)),S('Feed per bird',F(kg/n,2)+' kg'),S('Feed cost per bird',m(cost/n)));if(days>0){st.push(S('Feed per bird per day',F(kg*1000/(n*days),1)+' g'),S('Feed cost per day',m(cost/days)))}
if(w>0){var wk=R('[name=wu]').value==='g'?w/1000:w,live=sold*wk;st.push(S('FCR',F(kg/live,2)),S('Feed cost per kg of meat',m(cost/live)));stp.push('Live weight = '+F(sold,0)+' x '+F(wk,3)+' kg = '+F(live,1)+' kg; FCR = '+F(kg,1)+' / '+F(live,1)+' = <b>'+F(kg/live,2)+'</b>; feed cost per kg of meat = <b>'+m(cost/live)+'</b>')}
out.innerHTML=hero('good','Total feed cost',m(cost),F(kg,0)+' kg of feed, '+m(cost/n)+' per bird placed.')+'<div class="ct-grid">'+st.join('')+'</div>'+steps(stp)+tips(['Feed is usually the largest cost in a poultry batch, so even a small saving on price or wastage adds up.','Add your average weight to see your FCR and the feed cost for each kg of meat.'])+NOTE;root._txt='Feed cost\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}
else{var pn=g(R,'pn'),bw=+R('[name=bw]').value,miss2=[];if(!(pn>0))miss2.push('birds to place');var rows=[],tk=0,tc=0;[['Starter','s1','p1'],['Grower','s2','p2'],['Finisher','s3','p3']].forEach(function(r){var s=z(g(R,r[1])),p=z(g(R,r[2]));if(s>0){var k=s*pn,c=k*p;tk+=k;tc+=c;rows.push([r[0],k,k/bw,c]);stp.push(r[0]+' = '+F(pn,0)+' birds x '+F(s,2)+' kg = <b>'+F(k,0)+' kg</b> ('+F(k/bw,1)+' bags)'+(p>0?'; cost = '+F(k,0)+' x '+m(p)+' = <b>'+m(c)+'</b>':''))}});
if(!rows.length)miss2.push('feed per bird for at least one stage');if(miss2.length){need(out,'Fill the fields marked * to see your feed plan',miss2);return}
var tbl='<table><tr><th>Stage</th><th>Feed</th><th>Bags</th><th>Cost</th></tr>'+rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+F(r[1],0)+' kg</td><td>'+F(Math.ceil(r[2]),0)+'</td><td>'+m(r[3])+'</td></tr>'}).join('')+'<tr><td><b>Total</b></td><td><b>'+F(tk,0)+' kg</b></td><td><b>'+F(Math.ceil(tk/bw),0)+'</b></td><td><b>'+m(tc)+'</b></td></tr></table>';
st.push(S('Total feed',F(tk,0)+' kg'),S('Bags to buy',F(Math.ceil(tk/bw),0)),S('Feed per bird',F(tk/pn,2)+' kg'),S('Feed cost per bird',m(tc/pn)));stp.push('Total = <b>'+F(tk,0)+' kg</b>, <b>'+F(Math.ceil(tk/bw),0)+' bags</b> of '+bw+' kg, <b>'+m(tc)+'</b>');
out.innerHTML=hero('good','Feed to buy',F(Math.ceil(tk/bw),0)+' bags',F(tk,0)+' kg in total, costing '+m(tc)+'.')+'<div class="ct-grid">'+st.join('')+'</div><div class="ct-box"><b>Stage-wise plan</b>'+tbl+'</div>'+steps(stp)+tips(['The feed per bird for each stage is your own number. Use the feed schedule from your feed company or chick supplier for your breed.','Bags are rounded up to full bags. The plan uses birds placed, so if some birds die you will use a little less feed.'])+NOTE;root._txt='Feed plan\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}}});

/* 5. Egg production cost and hen-day % */
IT.form('poultry/eggcost',{html:'<div class="pt"><h3 class="pt-h">1. Flock</h3><div class="ct-in"><label>Hens in the shed *'+inp('n','e.g. 500')+'</label><label>Hens died <small>(optional)</small>'+inp('died','e.g. 10')+'</label><label>Days to calculate *'+inp('days','e.g. 30')+'</label>'+curSel()+'</div>'+
'<div class="ct-in"><label>Total eggs collected <small>(or enter hen-day %)</small>'+inp('eggs','e.g. 12750')+'</label><label>Hen-day production % <small>(if you do not know total eggs)</small>'+inp('prod','e.g. 85')+'</label></div>'+
'<h3 class="pt-h">2. Costs for these days</h3><div class="ct-in"><label>Feed cost *'+inp('feed','e.g. 60000')+'</label><label>Medicine and vaccines'+inp('med','e.g. 2000')+'</label><label>Labour, power and other costs'+inp('oth','e.g. 8000')+'</label></div><div class="ct-in"><label>Feed used in kg <small>(optional, for feed per dozen)</small>'+inp('fk','e.g. 1700')+'</label></div>'+
'<h3 class="pt-h">3. Selling <small style="font-weight:400">(optional)</small></h3><div class="ct-in"><label>Egg price<span class="row2">'+inp('ep','e.g. 6')+sel('epu',[['egg','per egg'],['dozen','per dozen'],['100','per 100 eggs'],['tray','per tray (30)']])+'</span></label></div>'+btns('Calculate Egg Cost')+'</div>',
init:initBtns,
update:function(R,out,root){root._txt='';var m=mfn(R),n=g(R,'n'),died=z(g(R,'died')),days=g(R,'days'),eggsIn=g(R,'eggs'),prod=g(R,'prod'),feed=g(R,'feed'),med=z(g(R,'med')),oth=z(g(R,'oth')),fk=g(R,'fk'),ep=g(R,'ep'),miss=[];
if(!(n>0))miss.push('hens in the shed');if(!(days>0))miss.push('days');if(!(eggsIn>0)&&!(prod>0))miss.push('total eggs or hen-day %');if(isNaN(feed))miss.push('feed cost');if(miss.length){need(out,'Fill the fields marked * to see your egg cost',miss);return}
if(died>=n)throw new Error('Hens died must be less than the hens in the shed.');var hens=n-died/2,eggs=eggsIn>0?eggsIn:hens*days*prod/100,hd=eggs/(hens*days)*100,total=feed+med+oth,cpe=total/eggs,S=IT.stat,stp=[],st=[];
stp.push('Average hens = '+F(n,0)+' - '+F(died,0)+' / 2 = <b>'+F(hens,1)+'</b>');if(eggsIn>0)stp.push('Eggs = <b>'+F(eggs,0)+'</b> (entered by you)');else stp.push('Eggs = '+F(hens,1)+' hens x '+F(days,0)+' days x '+F(prod,1)+'% = <b>'+F(eggs,0)+'</b>');
stp.push('Hen-day production = '+F(eggs,0)+' / ('+F(hens,1)+' x '+F(days,0)+') x 100 = <b>'+F(hd,1)+'%</b>');stp.push('Total cost = '+m(feed)+(med?' + '+m(med):'')+(oth?' + '+m(oth):'')+' = <b>'+m(total)+'</b>');stp.push('Cost per egg = '+m(total)+' / '+F(eggs,0)+' = <b>'+m(cpe)+'</b>; per dozen = <b>'+m(cpe*12)+'</b>');
st.push(S('Total eggs',F(eggs,0)),S('Eggs per hen',F(eggs/hens,1)),S('Cost per dozen',m(cpe*12)),S('Cost per 100 eggs',m(cpe*100)),S('Cost per tray (30)',m(cpe*30)),S('Feed cost per egg',m(feed/eggs)));
if(fk>0){st.push(S('Feed per dozen',F(fk/eggs*12,2)+' kg'),S('Feed per egg',F(fk*1000/eggs,1)+' g'));stp.push('Feed per dozen = '+F(fk,0)+' kg / '+F(eggs,0)+' x 12 = <b>'+F(fk/eggs*12,2)+' kg</b>')}
var hr=hero('good','Cost to produce one dozen eggs',m(cpe*12),'Hen-day production '+F(hd,1)+'%, '+m(cpe)+' per egg.');
if(ep>0){var pe={egg:ep,dozen:ep/12,'100':ep/100,tray:ep/30}[R('[name=epu]').value],rev=eggs*pe,pr=rev-total;st.push(S('Egg income',m(rev)),S('Profit or loss',m(pr)),S('Profit per dozen',m(pr/eggs*12)));stp.push('Egg income = '+F(eggs,0)+' x '+m(pe)+' = <b>'+m(rev)+'</b>; profit = '+m(rev)+' - '+m(total)+' = <b>'+m(pr)+'</b>');hr=hero(pr>=0?'good':'bad','Net '+(pr>=0?'profit':'loss')+' on eggs',m(Math.abs(pr)),'Cost per dozen '+m(cpe*12)+', income per dozen '+m(pe*12)+'. Hen-day production '+F(hd,1)+'%.')}
out.innerHTML=hr+'<div class="ct-grid">'+st.join('')+'</div>'+steps(stp)+tips(['Hen-day production is the share of hens that laid an egg on an average day. It usually rises after the hens start laying, peaks, and then slowly falls as the hens get older.','Feed is normally the biggest part of egg cost, so check feed per dozen over time to see if feed is being wasted.','This calculator does not include the cost of growing the pullets or the income from old hens. Add them to costs or income yourself if you want them counted.'])+NOTE;
root._txt='Egg production cost\n'+stp.map(plain).join('\n')+'\nCalculated at toolsxyz.in'}});
})();
