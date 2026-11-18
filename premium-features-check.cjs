// Run the real scripts with a minimal DOM to catch startup/render failures.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners=[];
const nodes=new Map();const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},querySelectorAll:()=>[],querySelector:()=>node('child'),setAttribute(){},removeAttribute(){},addEventListener(){},append(){},focus(){},scrollTop:0,hidden:false});return nodes.get(key)};
const c=vm.createContext({document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>node('dialog'),addEventListener(type,handler,capture){listeners.push({type,handler,capture})},body:{append(){}}},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},ResizeObserver:class{observe(){}disconnect(){}},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},performance:{now:()=>0},matchMedia:()=>({matches:true}),crypto:require('node:crypto').webcrypto,FormData:class{constructor(form){this.data=form.testData||{}}get(k){return this.data[k]??null}has(k){return k in this.data}},console,URL,Blob});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/enhancements.js','utf8'),c);

async function run(code){return vm.runInContext('(async()=>{'+code+'})()',c)}
async function submit(type,data={},mode){
 const event={target:{dataset:{form:type,mode},testData:data},preventDefault(){},stopImmediatePropagation(){this.stopped=true},submitter:{}};
 for(const listener of [...listeners].sort((a,b)=>Number(!!b.capture)-Number(!!a.capture))){
  if(listener.type==='submit'){await listener.handler(event);if(event.stopped)break}
 }
}
async function click(action,id){
 const btn={dataset:{action,id}};
 const e={target:{closest:()=>btn},preventDefault(){},stopImmediatePropagation(){this.stopped=true}};
 for(const listener of [...listeners].sort((a,b)=>Number(!!b.capture)-Number(!!a.capture))){
  if(listener.type==='click'){await listener.handler(e);if(e.stopped)break}
 }
}
(async()=>{
 await run('await enter("u-seeker");await openChat("u-provider")');
 const send=()=>submit('message',{text:'Is this role flexible?'});
 await submit('message',{text:'   '});
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),0,'empty sends do not count');
 vm.runInContext('getChat(route.id).resolved=true',c);await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),0,'closed conversations do not count');
 vm.runInContext('getChat(route.id).resolved=false',c);
 for(let i=0;i<5;i++)await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),5);
 await send();assert.equal(vm.runInContext('getChat(route.id).messages.length',c),5,'sixth company message blocked');
 assert.ok(node('notice').textContent.includes('not been sent'));
 assert.ok(node('screen').innerHTML.includes('0 of 5'));
 vm.runInContext('db.messagingTrials={"u-seeker":3}',c);
 for(let i=0;i<3;i++)await send();
 assert.equal(vm.runInContext('db.messagingTrials[currentUserId]',c),0);
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),8);
 assert.equal(vm.runInContext('sentCompanyMessagesToday(currentUserId)',c),5,'rewards do not reduce tomorrow or free allowance');
 await send();assert.equal(vm.runInContext('getChat(route.id).messages.length',c),8);
 await vm.runInContext('openChat("u-orbit")',c);await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),0,'limit shared across employers');
 vm.runInContext('me().premiumDemo=true',c);
 for(let i=0;i<7;i++)await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),7,'Premium can send beyond five');
 assert.equal(vm.runInContext('sentCompanyMessagesToday(currentUserId)',c),5);
 vm.runInContext('me().premiumDemo=false',c);await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),7,'downgrade preserves daily usage');
 await vm.runInContext('openChat("u-sharer")',c);
 for(let i=0;i<7;i++)await send();
 assert.equal(vm.runInContext('getChat(route.id).messages.length',c),7,'peer messaging unrestricted');
 await run('await enter("u-provider");await openChat("u-seeker")');await send();
 assert.ok(vm.runInContext('getChat(route.id).messages.some(m=>m.sender==="u-provider")',c),'company replies do not require VIP');
 assert.equal(vm.runInContext('companyMessageDay("2026-11-18T15:59:59Z")',c),'2026-11-18');
 assert.equal(vm.runInContext('companyMessageDay("2026-11-18T16:00:00Z")',c),'2026-11-19');
 vm.runInContext('db.chats=[{participants:["u-seeker","u-provider"],messages:[{sender:"u-seeker",created:"2026-11-18T15:59:59Z"},{sender:"u-seeker",created:"2026-11-18T16:00:00Z"}]}]',c);
 assert.equal(vm.runInContext('sentCompanyMessagesToday("u-seeker", "2026-11-18T16:01:00Z")',c),1,'midnight separates days');
 assert.equal(vm.runInContext('sentCompanyMessagesToday("u-sharer", "2026-11-18T16:01:00Z")',c),0,'account isolation');
 await run('await enter("u-seeker");db.messagingTrials={"u-seeker":3};await go("trial-people")');
 assert.equal(vm.runInContext('route.name',c),'company-people');
 assert.ok(!node('screen').innerHTML.includes('Chloe Wong'),'reward contact page lists companies only');
 await click('x-trial-chat','u-provider');
 assert.equal(vm.runInContext('db.messagingTrials[currentUserId]',c),3,'opening a conversation costs no credits');
 await vm.runInContext('go("resume-matching")',c);assert.ok(node('screen').innerHTML.includes('View Premium plans'));
 await submit('x-premium-resume',{resume:'<script>bad</script>',job:'p-harbour'},'matching');
 assert.ok(!node('screen').innerHTML.includes('Suggested version'));
 await vm.runInContext('go("premium")',c);
 assert.ok(node('screen').innerHTML.includes('View Premium details'));
 assert.ok(!node('screen').innerHTML.includes('data-action="x-premium-demo"'));
 await click('x-navigate','premium-plans');
 assert.equal(vm.runInContext('route.name',c),'premium-plans');
 assert.equal(vm.runInContext('me().premiumDemo',c),false,'viewing plans does not activate Premium');
 for(const price of ['59.9','149.9','549.9'])assert.ok(node('screen').innerHTML.includes('HK$'+price));
 await click('x-premium-demo','premium');
 assert.equal(vm.runInContext('route.name',c),'premium');
 assert.equal(vm.runInContext('me().premiumDemo',c),true);
 await vm.runInContext('go("resume-matching")',c);
 await submit('x-premium-resume',{resume:'Worked in retail.\nUsed Figma for onboarding.',job:'p-harbour',values:'<script>values</script>'},'matching');
 assert.ok(node('screen').innerHTML.includes('Suggested version'));
 assert.ok(node('screen').innerHTML.indexOf('Used Figma',node('screen').innerHTML.indexOf('readonly'))<node('screen').innerHTML.indexOf('Worked in retail',node('screen').innerHTML.indexOf('readonly')));
 assert.ok(node('screen').innerHTML.includes('&lt;script&gt;values&lt;/script&gt;'));
 assert.ok(!node('screen').innerHTML.includes('<script>values'));
 assert.ok(node('screen').innerHTML.includes('Job requirements'));
 assert.ok(node('screen').innerHTML.includes('Company context'));
 await vm.runInContext('go("resume-polish")',c);
 await submit('x-premium-resume',{resume:'i   researched users.\n• i made a prototype.'},'polish');
 assert.ok(node('screen').innerHTML.includes('I researched users.\n\n- I made a prototype.'));
 assert.ok(node('screen').innerHTML.includes('No AI service'));
 await run('await enter("u-sharer");me().premiumDemo=true;await go("resume-polish")');
 assert.ok(!node('screen').innerHTML.includes('I researched users'),'resume preview stays private to account');
 await run('await enter("u-provider");await go("resume-matching")');
 assert.equal(vm.runInContext('route.name',c),'internships');
 console.log('Passed: real send handler, daily five, rewards, Premium/downgrade, company/peer/account isolation, Hong Kong midnight, no charge on open, résumé gates/results/escaping.');
})().catch(e=>{console.error(e);process.exitCode=1});
