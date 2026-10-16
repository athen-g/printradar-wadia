import {env} from 'cloudflare:workers';
import {shops} from '@/lib/shops';
import {aggregate,predict,type Reading} from '@/lib/learning';
export async function GET(){try{const now=Date.now();const result=await env.DB!.prepare('SELECT shop, device, crowd, wait, people, service, created FROM reports WHERE created > ? ORDER BY created DESC LIMIT 25000').bind(now-90*86400000).all<Reading & {shop:string}>();return Response.json({shops:shops.map(s=>{const rows=result.results.filter(r=>r.shop===s.id);return {...s,current:aggregate(rows,now),prediction:predict(rows,now)}}),serverTime:now},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Live reports are temporarily unavailable. Please try again.'},{status:503})}}
