import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';const id='integration-'+crypto.randomUUID();
async function post(path,b){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(b)});return {status:r.status,body:await r.json()}}
const first=await fetch(base+'/api/shops');assert.equal(first.status,200);const shops=await first.json();assert.equal(shops.shops.length,10);
const report={shop:'anish',device:id,crowd:1,wait:12,people:5,service:'working'};
assert.equal((await post('/api/reports',report)).status,201);
assert.equal((await post('/api/reports',report)).status,429);
assert.equal((await post('/api/reports',{...report,device:id+'x',wait:-1})).status,400);
const current=(await (await fetch(base+'/api/shops')).json()).shops.find(s=>s.id==='anish').current;assert.equal(current.wait,12);assert.equal(current.confidence,'Unconfirmed');assert.equal(current.count,1);
assert.equal((await post('/api/suggestions',{device:id,name:'TEST ONLY SHOP',area:'Inside CP',details:'Integration test suggestion; local preview only.',lat:18.5342,lng:73.8798})).status,201);
assert.equal((await post('/api/suggestions',{device:id+'y',name:'Outside radius',area:'Nearby',details:'Out of radius must be rejected',lat:19,lng:74})).status,400);
console.log('PASS: catalogue, saved report, aggregate, cooldown, invalid report, saved suggestion, 1 km boundary. Local test device:',id);
