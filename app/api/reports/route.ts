import {z} from 'zod';
import {env} from 'cloudflare:workers';
import {shops} from '@/lib/shops';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 try{const b=z.object({shop:z.string(),device:z.string(),crowd:z.number().int().min(0).max(2),service:z.enum(['working','closed','unavailable']),wait:z.number().int().min(0).max(180).nullable(),people:z.number().int().min(0).max(200).nullable()}).parse(await request.json());if(!shops.some(s=>s.id===b.shop)||!/^[-a-zA-Z0-9]{20,80}$/.test(b.device??'')||![0,1,2].includes(b.crowd)||!['working','closed','unavailable'].includes(b.service)||!(['wait','people'] as const).every(k=>b[k]===null||(Number.isInteger(b[k])&&b[k]>=0&&b[k]<=(k==='wait'?180:200))))return Response.json({error:'Please check your report fields.'},{status:400});
 const now=Date.now();const prev=await env.DB!.prepare('SELECT created FROM reports WHERE device=? AND shop=? ORDER BY created DESC LIMIT 1').bind(b.device,b.shop).first<{created:number}>();if(prev&&now-prev.created<300000)return Response.json({error:'You can update this shop again five minutes after your last report.'},{status:429});
 const rate=await env.DB!.prepare('SELECT count(*) AS n FROM reports WHERE device=? AND created>?').bind(b.device,now-3600000).first<{n:number}>();if((rate?.n??0)>=20)return Response.json({error:'Hourly report limit reached. Please try later.'},{status:429});
 await env.DB!.prepare('INSERT INTO reports (id,shop,device,crowd,wait,people,service,created,slot) VALUES (?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),b.shop,b.device,b.crowd,b.wait,b.people,b.service,now,Math.floor(now/300000)).run();return Response.json({ok:true},{status:201});
 }catch(e){if(e instanceof z.ZodError)return Response.json({error:'Please check your report fields.'},{status:400});return Response.json({error:'Could not save your report. Please try again.'},{status:503})}
}


