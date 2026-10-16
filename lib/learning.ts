export type Reading={created:number;crowd:number;wait:number|null;people:number|null;service:string;device?:string};
export function aggregate(rows:Reading[],now=Date.now()){
 const seen=new Set<string>();const latest=rows.filter(r=>now-r.created>=0&&now-r.created<20*60000).sort((a,b)=>b.created-a.created).filter(r=>{const key=r.device??String(r.created);if(seen.has(key))return false;seen.add(key);return true});
 if(!latest.length)return {crowd:null,wait:null,people:null,service:'unknown',confidence:'No recent reports',count:0,updated:null};
 const sums=[0,0,0];const services:Record<string,number>={};for(const r of latest){const w=1-(now-r.created)/(25*60000);sums[r.crowd]+=w;services[r.service]=(services[r.service]||0)+w}
 const crowd=sums.indexOf(Math.max(...sums));const total=sums.reduce((a,b)=>a+b,0);const median=(key:'wait'|'people')=>{const v=latest.map(r=>r[key]).filter((n):n is number=>n!==null).sort((a,b)=>a-b);return v.length?v[Math.floor(v.length/2)]:null};
 return {crowd,wait:median('wait'),people:median('people'),service:Object.keys(services).sort((a,b)=>services[b]-services[a])[0],confidence:latest.length<2?'Unconfirmed':sums[crowd]/total<0.6?'Mixed reports':'Reports agree',count:latest.length,updated:latest[0].created};
}
// Real-history weighted k-nearest-neighbour regression. A chronological holdout gates display.
export function predict(rows:Reading[],now=Date.now()){
 const buckets=new Map<number,Reading[]>();for(const r of rows){if(r.service!=='working'||r.wait===null)continue;const k=Math.floor(r.created/(30*60000));buckets.set(k,[...(buckets.get(k)||[]),r])}
 const samples=[...buckets.entries()].sort(([a],[b])=>a-b).map(([k,rs])=>({t:k*30*60000,y:rs.reduce((s,r)=>s+r.wait!,0)/rs.length}));
 const days=new Set(samples.map(s=>new Date(s.t).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}))).size;
 if(samples.length<60||days<7)return {ready:false,samples:samples.length,days,message:'Learning from real reports',requirement:'Needs 60 reporting windows across at least 7 days.'};
 const feature=(t:number)=>{const d=new Date(t+330*60000);return {h:d.getUTCHours()+d.getUTCMinutes()/60,w:d.getUTCDay()}};
 const estimate=(train:typeof samples,t:number)=>{const f=feature(t);const n=train.map(s=>{const g=feature(s.t);const dh=Math.min(Math.abs(g.h-f.h),24-Math.abs(g.h-f.h));return {...s,d:dh+(g.w===f.w?0:2)+Math.max(0,t-s.t)/(86400000*30)}}).sort((a,b)=>a.d-b.d).slice(0,8);const weights=n.map(s=>1/(0.25+s.d));return n.reduce((sum,s,i)=>sum+s.y*weights[i],0)/weights.reduce((a,b)=>a+b,0)};
 const split=Math.floor(samples.length*0.8),train=samples.slice(0,split),test=samples.slice(split);const mae=test.reduce((s,r)=>s+Math.abs(r.y-estimate(train,r.t)),0)/test.length;
 if(mae>10)return {ready:false,samples:samples.length,days,message:'Prediction needs more reliable history',requirement:'Held-out error is above 10 minutes.'};
 const minutes=Math.max(0,Math.round(estimate(samples,now+30*60000)));return {ready:true,minutes,crowd:minutes<5?'Quiet':minutes<15?'Moderate':'Busy',mae:Math.round(mae),samples:samples.length,days,message:'Estimated wait in 30 minutes'};
}
