(()=>{"use strict";
const D=window.PQRSDF_DATA,$=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat("es-CO").format(n||0),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if(!D){document.body.innerHTML="<h2>No se cargaron los datos. Ejecuta py actualizar_pqrsdf.py.</h2>";return;}
const all=D.detail||[],registered=D.registeredDetail||[],assigned=D.assignedDetail||[],meta=D.metadata;
$("updated").textContent=meta.generatedAt||"—";$("period").textContent=`${meta.dateFrom} a ${meta.dateTo} · ${fmt(meta.uniqueCases)} casos únicos`;$("totalCases").textContent=fmt(meta.uniqueCases);
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id==="view-"+b.dataset.view));}));
function drawDaily(id,items){let max=Math.max(1,...items.map(x=>x.casos));$(id).innerHTML=items.map(x=>`<div class="day" title="${x.fechaIngreso}: ${fmt(x.casos)} casos"><span class="value">${fmt(x.casos)}</span><div class="stick" style="height:${Math.max(2,x.casos/max*100)}%"></div><span class="date">${x.fechaIngreso.slice(5)}</span></div>`).join("")||"<p class='muted'>Sin datos</p>";}
function drawBars(id,items,limit=50){let a=items.slice(0,limit),max=Math.max(1,...a.map(x=>x.casos));$(id).innerHTML=a.map(x=>`<div class="bar" title="${esc(x.regional||x.categoria)}: ${fmt(x.casos)}"><label>${esc(x.regional||x.categoria)}</label><div class="track"><div class="fill" style="width:${Math.max(1,x.casos/max*100)}%"></div></div><b>${fmt(x.casos)}</b></div>`).join("")||"<p class='muted'>Sin datos</p>";}
function makeDailyTable(items){$("dailyTable").innerHTML="<table><thead><tr><th>Fecha de ingreso</th><th>Casos ingresados</th></tr></thead><tbody>"+items.map(x=>`<tr><td>${x.fechaIngreso}</td><td>${fmt(x.casos)}</td></tr>`).join("")+"</tbody></table>";}
function renderDailySummary(items){
 const total=items.reduce((s,x)=>s+x.casos,0);
 const maxItem=items.length?items.reduce((a,b)=>b.casos>a.casos?b:a):null;
 const minItem=items.length?items.reduce((a,b)=>b.casos<a.casos?b:a):null;
 $("dailyMax").textContent=maxItem?fmt(maxItem.casos):"—";
 $("dailyMaxDate").textContent=maxItem?maxItem.fechaIngreso:"Sin datos";
 $("dailyMin").textContent=minItem?fmt(minItem.casos):"—";
 $("dailyMinDate").textContent=minItem?minItem.fechaIngreso:"Sin datos";
 $("dailyTotal").textContent=fmt(total);
 $("dailyAverage").textContent=items.length?fmt(Math.round(total/items.length*10)/10):"—";
}
function filterDaily(){let f=$("dailyFrom").value,t=$("dailyTo").value,items=D.dailyAll.filter(x=>(!f||x.fechaIngreso>=f)&&(!t||x.fechaIngreso<=t));drawDaily("dailyChart",items);makeDailyTable(items);renderDailySummary(items);}
drawDaily("dailyChart",D.dailyAll);makeDailyTable(D.dailyAll);renderDailySummary(D.dailyAll);$("dailyFrom").addEventListener("change",filterDaily);$("dailyTo").addEventListener("change",filterDaily);$("clearDaily").addEventListener("click",()=>{$("dailyFrom").value="";$("dailyTo").value="";filterDaily();});
$("registeredTotal").textContent=fmt(registered.length);let avg=registered.length?registered.reduce((a,x)=>a+x.diasHabiles,0)/registered.length:0,mx=registered.length?Math.max(...registered.map(x=>x.diasHabiles)):0;$("registeredAvg").textContent=avg.toFixed(1).replace(".",",");$("registeredMax").textContent=fmt(mx);$("registeredOver5").textContent=fmt(registered.filter(x=>x.diasHabiles>5).length);
drawDaily("registeredDailyChart",D.registeredDaily);
function renderAgeSummary(){
 const counts=new Map();
 registered.forEach(x=>counts.set(x.diasHabiles,(counts.get(x.diasHabiles)||0)+1));
 const ages=[...counts.keys()].sort((a,b)=>b-a);
 $("ageSummary").innerHTML=ages.map(age=>`<button type="button" class="age-card" data-age="${age}" aria-pressed="${$("minDays").value===String(age)}"><span>${age} ${age===1?"día hábil":"días hábiles"}</span><strong>${fmt(counts.get(age))}</strong><small>${registered.length?(counts.get(age)/registered.length*100).toFixed(1).replace(".",","):"0,0"}% de registrados</small></button>`).join("")||"<p class='muted'>Sin casos registrados</p>";
 $("ageSummary").querySelectorAll(".age-card").forEach(btn=>btn.addEventListener("click",()=>{$("minDays").value=btn.dataset.age;renderRegistered();renderAgeSummary();}));
}
function renderRegistered(){let q=$("registeredSearch").value.trim().toLowerCase(),exact=$("minDays").value;let a=registered.filter(x=>(!q||x.caso.toLowerCase().includes(q))&&(exact===""||x.diasHabiles===Number(exact))).sort((x,y)=>y.diasHabiles-x.diasHabiles);$("registeredCount").textContent=`${fmt(a.length)} casos`;$("registeredRows").innerHTML=a.map(x=>`<tr><td>${esc(x.caso)}</td><td>${esc(x.fechaIngreso)}</td><td>${fmt(x.diasHabiles)}</td><td>${esc(x.grupo)}</td><td>${esc(x.responsable)}</td><td>${esc(x.categoria)}</td></tr>`).join("")||"<tr><td colspan='6'>Sin registros</td></tr>";}
$("registeredSearch").addEventListener("input",renderRegistered);$("minDays").addEventListener("input",()=>{renderRegistered();renderAgeSummary();});renderRegistered();renderAgeSummary();
$("assignedTotal").textContent=fmt(assigned.length);
let top=D.regionalAssigned[0],topCat=D.categoryAssigned[0];
$("topRegional").textContent=top?.regional||"Sin datos";$("topRegionalCount").textContent=fmt(top?.casos||0);
$("topRegionalShare").textContent=assigned.length&&top?((top.casos/assigned.length)*100).toFixed(1).replace(".",",")+"%":"—";
$("topCategory").textContent=topCat?.categoria||"Sin datos";$("topCategoryCount").textContent=fmt(topCat?.casos||0);
$("topCategoryShare").textContent=assigned.length&&topCat?((topCat.casos/assigned.length)*100).toFixed(1).replace(".",",")+"%":"—";
drawBars("regionalChart",D.regionalAssigned,50);drawBars("categoryChart",D.categoryAssigned,50);
function fillSelect(id,values){$(id).innerHTML='<option value="">Todas</option>'+[...new Set(values)].sort((a,b)=>a.localeCompare(b,"es")).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");}
fillSelect("regionalFilter",assigned.map(x=>x.grupo));fillSelect("categoryFilter",assigned.map(x=>x.categoria));
function renderAssigned(){let g=$("regionalFilter").value,c=$("categoryFilter").value,a=assigned.filter(x=>(!g||x.grupo===g)&&(!c||x.categoria===c));$("assignedCount").textContent=`${fmt(a.length)} casos`;$("assignedRows").innerHTML=a.map(x=>`<tr><td>${esc(x.caso)}</td><td>${esc(x.fechaIngreso)}</td><td>${esc(x.grupo)}</td><td>${esc(x.categoria)}</td><td>${esc(x.responsable)}</td></tr>`).join("")||"<tr><td colspan='5'>Sin registros</td></tr>";}
$("regionalFilter").addEventListener("change",renderAssigned);$("categoryFilter").addEventListener("change",renderAssigned);renderAssigned();
$("download").addEventListener("click",()=>{let cols=["caso","estado","fechaIngreso","diasHabiles","grupo","responsable","categoria","servicio"],head=["Caso","Estado","Fecha de ingreso","Días hábiles","Grupo responsable","Responsable","Categoría","Servicio"];let csv=[head.join(";"),...all.map(r=>cols.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(";"))].join("\r\n");let blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="casos_aranda_unicos.csv";a.click();URL.revokeObjectURL(url);});
})();