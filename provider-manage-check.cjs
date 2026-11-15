const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ext=fs.readFileSync(__dirname+'/enhancements.js','utf8'),app=fs.readFileSync(__dirname+'/app.js','utf8');
const live={title:'PROMOTIONAL TITLE',job:'Designer',location:'HK',duration:6,pay:'HK$12,000/month'};
const own={id:'own',owner:'company',type:'official',live:{...live},access:'none',review:'live',closed:false};
const pending={...own,id:'pending',review:'pending',draft:{...live,job:'Pending role'}};
const draft={...own,id:'draft',live:null,draft:{...live,job:'Draft role'},review:'draft'};
const closed={...own,id:'closed',closed:true};
const other={...own,id:'other',owner:'other-company',live:{...live,job:'OTHER COMPANY'}};
const c=vm.createContext({pages:{internships:()=> 'STUDENT'},provider:()=>true,currentUserId:'company',me:()=>({org:'Company'}),db:{posts:[own,pending,draft,closed,other],chats:[]},prepareJob:p=>p,clone:structuredClone,matchesJob:()=>true,esc:String,heading:s=>s,jobQuery:'',field:()=>'<input/>',icon:()=>'',xb:(l,a,id)=>`<button data-action="x-${a}" data-id="${id}">${l}</button>`,button:(l,a,id)=>`<button data-action="${a}" data-id="${id}">${l}</button>`,deniedPage:()=> 'DENIED',actorOwner:x=>x,chatRow:()=>''});
vm.runInContext(ext.slice(ext.indexOf('  function companyListingState'),ext.indexOf('  function filterSuggestions')),c);
let html=c.pages.manage();assert.ok(html.includes('Manage company internships'));for(const name of ['Open','Closed','Pending','Drafts'])assert.ok(html.includes(name));assert.ok(!html.includes('OTHER COMPANY'));assert.ok(!html.includes('PROMOTIONAL TITLE'));assert.ok(!html.includes('Request edit access'));assert.ok(!html.includes('Compare'));assert.ok(!html.includes('Wishlist'));assert.ok(html.includes('edit-listing'));assert.ok(html.includes('Awaiting platform approval'));
// Owners can edit without a prior grant; pending edits and other owners remain blocked.
Object.assign(c,{route:{id:'own'},getPost:id=>c.db.posts.find(p=>p.id===id),selectField:()=>'',area:()=>'',field:()=>'',missingPage:()=> 'MISSING'});
vm.runInContext(app.slice(app.indexOf('function listingPage()'),app.indexOf('function simulatorPage()')),c);
assert.ok(vm.runInContext('listingPage()',c).includes('Edit internship'));
c.route.id='pending';assert.equal(vm.runInContext('listingPage()',c),'DENIED');c.route.id='other';assert.equal(vm.runInContext('listingPage()',c),'DENIED');
// Submissions queue a draft and leave the live object intact.
Object.assign(c,{validListing:()=>true,tell:()=>{}});vm.runInContext(app.slice(app.indexOf('function queueListing('),app.indexOf('/* ---------------------- Click actions')),c);
own.draft={...live,job:'Edited job'};c.post=own;assert.equal(vm.runInContext('queueListing(post)',c),true);assert.equal(own.review,'pending');assert.equal(own.live.job,'Designer');
// Company navigation exposes exactly four tabs without Home.
c.provider=()=>true;c.$=()=>c.menu||(c.menu={});
vm.runInContext(ext.slice(ext.indexOf('  function renderMainNavigation'),ext.indexOf('  function redrawPreservingInputs')),c);vm.runInContext('renderMainNavigation()',c);assert.equal((c.menu.innerHTML.match(/data-action="tab"/g)||[]).length,4);assert.ok(c.menu.innerHTML.includes('Manage'));assert.ok(!c.menu.innerHTML.includes('Home'));
console.log('Passed: own-company scope, four status groups, no edit-access prerequisite, pending/foreign-owner guards, queued updates retain live content, four-tab navigation.');
// Provider filters omit employer/AI; participants keep both.
Object.assign(c,{showModal:(title,html)=>{c.modalHtml=html},FILTER_NAMES:{employer:'Employer',position:'Position'},draftFilters:{employer:[],position:[],minPay:0,maxPay:100000,rating:''},filterSuggestions:()=>[],filterTags:()=>'',DURATION_OPTIONS:[],selectField:()=>''});
vm.runInContext(ext.slice(ext.indexOf('  function filterDialog()'),ext.indexOf('  let comparisonBase')),c);
vm.runInContext('filterDialog()',c);assert.ok(!c.modalHtml.includes('filter-employer'));assert.ok(!c.modalHtml.includes('Apply AI-recommended'));assert.ok(c.modalHtml.includes('filter-position'));assert.ok(c.modalHtml.includes('Clear all'));
c.provider=()=>false;vm.runInContext('filterDialog()',c);assert.ok(c.modalHtml.includes('filter-employer'));assert.ok(c.modalHtml.includes('Apply AI-recommended'));
// Private company profile keeps one inquiries entry plus the shared activity section.
c.provider=()=>true;
const company={id:'company',kind:'provider',org:'Studio',firstName:'Alex',lastName:'Lee'};
Object.assign(c,{route:{},getUser:()=>company,actorOwner:id=>id,actor:id=>id,helpfulItems:()=>[],fullName:()=> 'Alex Lee',avatar:()=>'',profileActivity:()=> 'PRIVATE ACTIVITY',renderStudentMe:()=>'',postGrid:()=> 'PUBLIC POSTS',missingPage:()=>'',db:{...c.db,forums:[]}});
vm.runInContext(ext.slice(ext.indexOf('  pages.profile ='),ext.indexOf('  pages["edit-profile"]')),c);
html=c.pages.profile();assert.ok(html.includes('Company · Demo verified'));assert.ok(html.includes('Settings'));assert.ok(html.includes('PRIVATE ACTIVITY'));assert.ok(html.includes('Inquiries'));assert.ok(!html.includes('Internship inquiries'));assert.ok(!html.includes('Published internships'));assert.ok(!html.includes('Favorites'));assert.ok(!html.includes('Premium'));
c.route={actor:'other-company'};c.currentUserId='visitor';html=c.pages.profile();assert.ok(!html.includes('PRIVATE ACTIVITY'));assert.ok(!html.includes('Settings'));assert.ok(html.includes('Message company'));
// Reject retains the draft and published version; later approval promotes only the draft.
const decisionStart=app.indexOf('  if (type === "review-decision")');
const decisionCode=app.slice(decisionStart,app.indexOf('  if (!me()?.verified)',decisionStart));
Object.assign(c,{type:'review-decision',route:{name:'simulator'},form:{dataset:{id:'own'}},decision:'reject',text:()=> 'Revise details',notify:()=>{},persist:()=>{},render:()=>{},dirty:false});
vm.runInContext('(function(){'+decisionCode+'})()',c);assert.equal(own.review,'rejected');assert.equal(own.live.job,'Designer');assert.equal(own.draft.job,'Edited job');
assert.equal(vm.runInContext('queueListing(post)',c),true);c.decision='approve';vm.runInContext('(function(){'+decisionCode+'})()',c);assert.equal(own.live.job,'Edited job');assert.equal(own.draft,null);
console.log('Passed: company-only filters, student filters retained, private/public company Me, reject/resubmit/approve publication lifecycle.');
