// Run the real scripts with a minimal DOM to catch startup/render failures.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners=[];
const nodes=new Map();const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},querySelectorAll:()=>[],querySelector:()=>node('child'),setAttribute(){},removeAttribute(){},addEventListener(){},append(){},focus(){},scrollTop:0,hidden:false});return nodes.get(key)};
const c=vm.createContext({document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>node('dialog'),addEventListener(type,handler,capture){if(type==='click' && capture)listeners.push(handler)},body:{append(){}}},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},ResizeObserver:class{observe(){}disconnect(){}},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},performance:{now:()=>0},matchMedia:()=>({matches:true}),crypto:require('node:crypto').webcrypto,console,URL,Blob});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/enhancements.js','utf8'),c);
(async()=>{
 await vm.runInContext('enter("u-provider")',c);
 assert.equal(vm.runInContext('route.name',c),'internships');
 assert.ok(node('screen').innerHTML.includes('Manage company internships'));
 assert.ok(!node('screen').innerHTML.includes('Orbit Analytics'));
 assert.equal((node('appMenu').innerHTML.match(/data-action="tab"/g)||[]).length,4);
 await vm.runInContext('go("profile")',c);assert.ok(node('screen').innerHTML.includes('Inquiries'));assert.ok(node('screen').innerHTML.includes('me-content'));assert.ok(!node('screen').innerHTML.includes('Premium'));
 await vm.runInContext('enter("u-seeker")',c);assert.equal(vm.runInContext('route.name',c),'home');assert.ok(node('screen').innerHTML.includes('student-home-grid'));
 await vm.runInContext('go("profile")',c);assert.ok(node('screen').innerHTML.includes('Premium Features'));assert.ok(node('screen').innerHTML.includes('Favorites'));
 await vm.runInContext('go("premium")',c);
 assert.ok(node('screen').innerHTML.includes('AI résumé matching'));
 assert.ok(node('screen').innerHTML.includes('Résumé polishing'));
 assert.ok(!node('screen').innerHTML.includes('Compare opportunities'));
 vm.runInContext('currentUserId="u-provider"',c);
 const verification=vm.runInContext('verifyPage()',c);
 assert.ok(verification.includes('Harbour Studio'));
 assert.ok(!verification.includes('Alex Lee'),'Company verification identifies the company, not the contact person');
 assert.ok(!verification.includes('company-employee'));
 console.log('Passed: actual-script startup, company default Manage and Me, four-tab navigation, student Home/Me regression.');
})().catch(e=>{console.error(e);process.exitCode=1});
