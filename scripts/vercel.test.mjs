import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import checker from '../api/check-source.js';
import domains from '../api/supported-domains.js';

test('Vercel output contains the app and all referenced local scripts/styles',async()=>{
  const html=await readFile('public/index.html','utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#:]+)"/g))await access('public/'+match[1]);
  const config=JSON.parse(await readFile('vercel.json','utf8'));
  assert.equal(config.outputDirectory,'public');
});
test('Vercel checker fails closed and ignores forged Sites identity',async()=>{
  const previous=process.env.SOURCE_CHECK_TOKEN;
  const req=key=>new Request('https://study.vercel.app/api/check-source',{method:'POST',headers:{'oai-authenticated-user-id':'forged',...(key?{authorization:'Bearer '+key}:{})},body:JSON.stringify({url:'http://localhost/'})});
  try{
    delete process.env.SOURCE_CHECK_TOKEN;
    assert.equal((await checker.fetch(req())).status,503);
    process.env.SOURCE_CHECK_TOKEN='test-only-access-key';
    assert.equal((await checker.fetch(req())).status,401);
    assert.equal((await checker.fetch(req('wrong'))).status,401);
    const accepted=await checker.fetch(req('test-only-access-key'));
    assert.equal(accepted.status,400);
    assert.match((await accepted.json()).error,/HTTPS/);
    const cross=new Request('https://study.vercel.app/api/check-source',{method:'POST',headers:{authorization:'Bearer test-only-access-key',origin:'https://other.example'},body:'{}'});
    assert.equal((await checker.fetch(cross)).status,403);
  }finally{if(previous===undefined)delete process.env.SOURCE_CHECK_TOKEN;else process.env.SOURCE_CHECK_TOKEN=previous}
});
test('Vercel exposes the shared supported-domain list',async()=>{
  const result=await domains.fetch(new Request('https://study.vercel.app/api/supported-domains'));
  assert.equal(result.status,200);assert.ok((await result.json()).domains.includes('aps-india.de'));
});
