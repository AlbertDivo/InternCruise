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
 await run('await enter("u-seeker");ask=async()=>true;');
 assert.ok(!vm.runInContext('deleteContentButton(getPost("p-harbour"),"post")',c),'hide others delete');
 await run('await deleteOwnContent("post||p-harbour")');
 assert.ok(vm.runInContext('getPost("p-harbour")',c),'guard others delete');
 await run('await go("forum-detail",{id:"f-first"})');
 let html=node('screen').innerHTML;
 const jobHtml=vm.runInContext('route={name:"internship",id:"p-harbour"};pages.internship()',c);
 assert.ok(!jobHtml.includes('data-action="x-comment-start"'),'no top Reply in internship comments');
 assert.ok(jobHtml.includes('data-action="x-reply-to"'),'keep Reply inside comment cards');
 await run('await go("forum-detail",{id:"f-first"})');
 assert.ok(html.includes('delete-content'));
 assert.ok(html.includes('<form class="comment-composer" hidden data-form="x-comment"'));assert.ok(html.includes('x-comment-start'));
 assert.ok(!html.includes('<summary>Reply</summary>'));assert.ok(!html.includes('<details class="comment-composer"'));
 await run('getForum("f-first").replies.push({id:"own",owner:"u-seeker",text:"Mine",parent:null,likes:[],views:0,created:timestamp()},{id:"child",owner:"u-sharer",text:"Keep me",parent:"own",likes:[],views:0,created:timestamp()});db.favorites={"u-seeker":["forum-reply:own"]};');
 await run('await deleteOwnContent("forum-reply|f-first|own")');
 assert.ok(!vm.runInContext('getForum("f-first").replies.some(r=>r.id==="own")',c));
 assert.equal(vm.runInContext('getForum("f-first").replies.find(r=>r.id==="child").parent',c),null,'keep child replies visible');
 assert.equal(vm.runInContext('db.favorites["u-seeker"].length',c),0);
 await run('ask=async()=>false;await deleteOwnContent("forum||f-first")');
 assert.ok(vm.runInContext('getForum("f-first")',c),'cancel preserves post');
 await run('ask=async()=>true;await deleteOwnContent("forum||f-first")');
 assert.ok(!vm.runInContext('getForum("f-first")',c));
 assert.equal(vm.runInContext('route.name',c),'forum');
 await run('getPost("p-harbour").questions=[{id:"q-own",owner:"u-seeker",text:"Question",likes:[],replies:[{id:"answer",owner:"u-sharer",text:"Answer"}]}];await go("post",{id:"p-experience"});await deleteOwnContent("question|p-harbour|q-own")');
 assert.equal(vm.runInContext('getPost("p-harbour").questions[0].text',c),'Comment deleted.');
 assert.equal(vm.runInContext('getPost("p-harbour").questions[0].replies.length',c),1);
 assert.ok(vm.runInContext('questionMarkup(getPost("p-harbour").questions[0],getPost("p-harbour"))',c).includes('Deleted comment'));
 await run('getPost("p-harbour").reviews.push({id:"own-review",owner:"u-seeker",text:"Mine",likes:[],parent:null});await deleteOwnContent("review|p-harbour|own-review")');
 assert.ok(!vm.runInContext('getPost("p-harbour").reviews.some(r=>r.id==="own-review")',c));
 await run('await enter("u-provider");db.saved={"u-seeker":["p-harbour"]};db.comparisons={"u-seeker":["p-harbour"]};await deleteOwnContent("post||p-harbour")');
 assert.ok(!vm.runInContext('getPost("p-harbour")',c));
 assert.equal(vm.runInContext('db.saved["u-seeker"].length+db.comparisons["u-seeker"].length',c),0);
 console.log('Passed: ownership guards, cancel/delete, post deletion, nested replies preserved, favorites/compare cleanup and collapsed comment forms.');
})().catch(e=>{console.error(e);process.exitCode=1});
