import {timingSafeEqual} from 'node:crypto';
import worker from '../worker/index.js';

export default {async fetch(request){
  const reply=(error,status)=>Response.json({ok:false,error},{status,headers:{'cache-control':'no-store'}});
  const secret=process.env.SOURCE_CHECK_TOKEN;
  if(!secret)return reply('Source checking needs SOURCE_CHECK_TOKEN in Vercel environment settings. The dashboard and manual source links remain available.',503);
  const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  const a=Buffer.from(secret),b=Buffer.from(supplied);
  if(a.length!==b.length||!timingSafeEqual(a,b))return reply('Enter your source-check access key to use this Vercel deployment.',401);
  const headers=new Headers(request.headers);
  // Never trust an identity header supplied by a public client.
  headers.set('oai-authenticated-user-id','vercel-owner');
  const url=new URL(request.url);url.pathname='/api/check-source';
  return worker.fetch(new Request(url,{method:request.method,headers,...(!['GET','HEAD'].includes(request.method)?{body:await request.text()}:{})}));
}};
