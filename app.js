const key = 'interncruise-classroom-demo';
const initial = {
  description: 'Help our product team design onboarding screens, run usability tests and present your findings. Open to university students.',
  pending: null,
  status: 'Live on InternCruise',
  messages: [],
  resolved: false,
  threads: [],
  postThreads: {},
  publishedPosts: [],
  conversations: [],
  forumAliases: {},
};
const $ = (id) => document.getElementById(id);
// shortcut: browser-only demo data, add a backend if separate devices must share updates.
let state = initial;
try {
  state = { ...initial, ...JSON.parse(localStorage.getItem(key)) };
} catch {
  // The demo still works in memory when browser storage is unavailable.
}
function save(changes) {
  state = { ...state, ...changes };
  try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}
function chatBubble(text, mine) {
  const bubble = document.createElement('p');
  bubble.className = 'chat-bubble ' + (mine ? 'outgoing' : 'incoming');
  bubble.textContent = text;
  bubble.setAttribute('aria-label', (mine ? 'You: ' : 'Received: ') + text);
  return bubble;
}
function renderMessages(id) {
  const box = $(id);
  box.replaceChildren();
  if (!state.messages.length) box.textContent = 'No messages yet.';
  for (const { sender, message } of state.messages) {
    box.append(chatBubble(message, sender === (id === 'employerMessages' ? 'Harbour Studio' : 'Applicant')));
  }
  if (state.resolved) {
    const note = document.createElement('p');
    note.textContent = 'Inquiry resolved.';
    box.append(note);
  }
}
// shortcut: demo credentials live in memory; use server-side authentication for real accounts.
const accounts = new Map([['demo', 'cruise']]);
const entryViews = ['welcome', 'account', 'login', 'signup', 'verify'];
let loginName = '';
let identity = '';
let role = 'seeker';
let currentView = 'welcome';

const posts = [
  { id: 'harbour-experience', school: 'HKU', type: 'experience', company: 'Harbour Studio', job: 'Product Design Intern', title: 'What my first design internship was really like', author: 'Chloe · Former intern', body: 'I started with onboarding screens and joined weekly design critiques. My mentor gave feedback every Friday, and by week six I presented a usability study to the team.', cover: '✦', theme: 'mint' },
  { id: 'orbit-experience', school: 'HKUST', type: 'experience', company: 'Orbit Analytics', job: 'Data Analyst Intern', title: 'From messy spreadsheets to my first dashboard', author: 'Adrian · Former intern', body: 'My first two weeks were mostly data cleaning and learning SQL. Later I built a dashboard with a teammate and presented it at our weekly meeting.', cover: '▥', theme: 'blue' },
  { id: 'daybreak-experience', school: 'HKU', type: 'experience', company: 'Daybreak Creative', job: 'Content Marketing Intern', title: 'A week on a small creative team', author: 'Maya · Former intern', body: 'I drafted social captions, helped with a shoot and reviewed campaign results. The team was small, so I got to see how ideas went from a brief to a published post.', cover: '✺', theme: 'peach' },
  { id: 'atlas-experience', school: 'CUHK', type: 'experience', company: 'Atlas Mobility', job: 'Operations Intern', title: 'What I learned on the operations desk', author: 'Ryan · Former intern', body: 'I tracked delivery issues and helped map out a weekly reporting process. Talking to colleagues across teams was a big part of the work.', cover: '↗', theme: 'lilac' },
  { id: 'harbour-official', duration: 6, type: 'official', company: 'Harbour Studio', job: 'Product Design Intern', title: 'Join our product design team this summer', author: 'Harbour Studio · Official', body: '', cover: '✦', theme: 'mint' },
  { id: 'orbit-official', duration: 12, type: 'official', company: 'Orbit Analytics', job: 'Data Analyst Intern', title: 'Turn business data into answers', author: 'Orbit Analytics · Official', body: 'Help clean datasets, write SQL queries and build a dashboard. Twelve-week internship in Hong Kong with weekly team reviews.', cover: '▥', theme: 'blue' },
  { id: 'daybreak-official', duration: 6, type: 'official', company: 'Daybreak Creative', job: 'Content Marketing Intern', title: 'Help us bring the next campaign to life', author: 'Daybreak Creative · Official', body: 'Work with our creative team on social content, campaign planning and basic performance reporting. Six-week internship in Hong Kong.', cover: '✺', theme: 'peach' },
  { id: 'atlas-official', duration: 12, type: 'official', company: 'Atlas Mobility', job: 'Operations Intern', title: 'Get hands-on with city logistics', author: 'Atlas Mobility · Official', body: 'Support day-to-day logistics, track service issues and help prepare weekly operations reports. Twelve-week internship in Hong Kong.', cover: '↗', theme: 'lilac' },
];
let feed = 'experience';
let activePost = posts[0];

function postCard(post, detail = false) {
  const card = document.createElement(detail ? 'article' : 'button');
  card.className = 'feed-card';
  const cover = document.createElement('div');
  cover.className = 'feed-cover ' + post.theme;
  cover.setAttribute('aria-hidden', 'true');
  cover.textContent = post.cover;
  const content = document.createElement('div');
  content.className = 'feed-copy';
  const title = document.createElement(detail ? 'h1' : 'h2');
  title.textContent = post.title;
  const job = document.createElement('p');
  job.className = 'feed-job';
  job.textContent = post.company + ' · ' + post.job;
  const author = document.createElement(detail ? 'button' : 'p');
  author.className = detail ? 'author-link' : 'muted';
  if (detail) author.addEventListener('click', () => show('authorProfile'));
  author.textContent = [post.author, post.school].filter(Boolean).join(' · ');
  content.append(title, job, author);
  if (detail) {
    const body = document.createElement('p');
    body.textContent = post.id === 'harbour-official' ? state.description : post.body;
    if (post.duration) {
      const duration = document.createElement('p');
      duration.className = 'muted';
      duration.textContent = post.duration + ' weeks';
      content.append(duration);
    }
    content.append(body);
  } else {
    card.addEventListener('click', () => {
      activePost = post;
      $('postQuestion').reset();
      show('post');
    });
  }
  card.append(cover, content);
  return card;
}
function renderFeed() {
  document.querySelectorAll('[data-feed]').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.feed === feed);
  });
  const allPosts = [...state.publishedPosts, ...posts];
  const experience = feed === 'experience';
  $('schoolFilterRow').hidden = !experience;
  $('durationFilterRow').hidden = experience;
  for (const [id, field, label] of [
    ['jobFilter', 'job', 'All jobs'],
    ['companyFilter', 'company', 'All companies'],
    ['durationFilter', 'duration', 'Any duration'],
  ]) {
    const select = $(id);
    const previous = select.value;
    const values = [...new Set(allPosts.filter((post) => post.type === feed && post[field]).map((post) => String(post[field])))].sort();
    select.replaceChildren(new Option(label, ''), ...values.map((value) => new Option(field === 'duration' ? value + ' weeks' : value, value)));
    select.value = values.includes(previous) ? previous : '';
  }
  const query = $('feedSearch').value.trim().toLowerCase();
  const school = $('sameSchool').checked;
  const job = $('jobFilter').value;
  const company = $('companyFilter').value;
  const duration = $('durationFilter').value;
  const count = Number(experience ? school : Boolean(duration)) + Number(Boolean(job)) + Number(Boolean(company));
  $('filterCount').textContent = count ? '(' + count + ')' : '';
  const matches = allPosts.filter((post) =>
    post.type === feed &&
    (!query || [post.company, post.job].some((value) => value.toLowerCase().includes(query))) &&
    (!job || post.job === job) && (!company || post.company === company) &&
    (experience ? !school || post.school === 'HKU' : !duration || String(post.duration) === duration)
  );
  $('feedGrid').replaceChildren(...matches.map((post) => postCard(post)));
  $('feedEmpty').hidden = matches.length > 0;
}
function savePostThreads(threads) {
  save({ postThreads: { ...state.postThreads, [activePost.id]: threads } });
}
function renderPost() {
  $('postContent').replaceChildren(postCard(activePost, true));
  $('postContext').textContent = activePost.company + ' · ' + activePost.job;
  renderThreads('postThreads', state.postThreads[activePost.id] ?? [], savePostThreads, renderPost);
}
function account() {
  if (role === 'employer') return { id: 'company:Harbour Studio', name: 'Harbour Studio' };
  const name = identity && loginName !== 'demo' ? loginName : 'Demo applicant';
  return { id: 'seeker:' + name, name };
}
function postAuthor(post) {
  if (post.type === 'official') return { id: 'company:' + post.company, name: post.company };
  const name = post.author.split(' · ')[0];
  if (post.authorId) return { id: post.authorId, name };
  if (post.author === 'Internship seeker') return { id: 'seeker:Demo applicant', name: 'Demo applicant' };
  return { id: 'sample:' + name, name };
}
let recipient;
let chatSender;

function ownsIdentity(person) {
  return (person.ownerId ?? person.id) === account().id;
}
function anonymousIdentity() {
  const ownerId = account().id;
  const existing = state.forumAliases[ownerId];
  if (existing) return existing;
  const number = Object.keys(state.forumAliases).length + 101;
  const alias = { id: 'anon:' + number, name: 'Anonymous ' + number, ownerId };
  save({ forumAliases: { ...state.forumAliases, [ownerId]: alias } });
  return alias;
}
function renderAuthorProfile() {
  const author = postAuthor(activePost);
  const authored = [...state.publishedPosts, ...posts].filter((post) => postAuthor(post).id === author.id);
  $('authorName').textContent = author.name;
  $('authorPostCount').textContent = authored.length + (authored.length === 1 ? ' post' : ' posts');
  $('messageAuthor').hidden = author.id === account().id;
  $('authorPosts').replaceChildren(...authored.map((post) => postCard(post)));
}
function conversationWith(person) {
  const me = chatSender;
  return state.conversations.find(({ participants }) =>
    participants.some(({ id }) => id === me.id) && participants.some(({ id }) => id === person.id)
  );
}
function renderConversation() {
  $('conversationName').textContent = recipient.name;
  $('chatAlias').hidden = !chatSender.ownerId;
  $('chatAlias').textContent = chatSender.ownerId ? 'Sending as ' + chatSender.name : '';
  const messages = conversationWith(recipient)?.messages ?? [];
  const box = $('conversationMessages');
  box.replaceChildren();
  if (!messages.length) box.textContent = 'Start a conversation.';
  for (const message of messages) {
    box.append(chatBubble(message.text, message.sender === chatSender.id));
  }
  box.scrollTop = box.scrollHeight;
}
function conversationRow(person, lastMessage, open, label = person.name) {
  const button = document.createElement('button');
  button.className = 'conversation-link';
  const avatar = document.createElement('span');
  avatar.className = 'conversation-avatar';
  avatar.textContent = person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  avatar.setAttribute('aria-hidden', 'true');
  const copy = document.createElement('span');
  const name = document.createElement('strong');
  name.textContent = label;
  const preview = document.createElement('small');
  preview.textContent = lastMessage;
  copy.append(name, preview);
  button.append(avatar, copy);
  button.addEventListener('click', open);
  return button;
}
function renderConversationList() {
  const me = account();
  const list = $('conversationList');
  const people = new Set();
  list.replaceChildren();
  for (const thread of state.conversations) {
    const sender = thread.participants.find(ownsIdentity);
    if (!sender) continue;
    const other = thread.participants.find(({ id }) => id !== sender.id);
    people.add(other.id);
    list.append(conversationRow(other, thread.messages.at(-1).text, () => openConversation(other, sender)));
  }
  const lastInquiry = state.messages.at(-1);
  const employer = me.id === 'company:Harbour Studio';
  if (lastInquiry && (employer || me.id === 'seeker:Demo applicant')) {
    const other = employer ? { id: 'seeker:Demo applicant', name: 'Demo applicant' }
      : { id: 'company:Harbour Studio', name: 'Harbour Studio' };
    people.add(other.id);
    list.append(conversationRow(other, lastInquiry.message, () => show(employer ? 'inbox' : 'chat'), other.name + ' · Job inquiry'));
  }
  $('conversationCount').textContent = '(' + people.size + ')';
  if (!people.size) list.textContent = 'No conversations yet.';
}
function openConversation(person, sender = account()) {
  if (ownsIdentity(person)) return;
  recipient = person;
  chatSender = sender;
  $('directMessageForm').reset();
  show('conversation');
}
function forumAuthor() {
  return role === 'employer' ? 'Harbour Studio · Provider' : 'Internship seeker';
}
const sampleForumPosts = [
  { title: 'Where do you go to study when the library is full?', body: 'I’m looking for somewhere quiet around campus after 6 pm.', author: { id: 'anon:31', name: 'Anonymous 31' }, replies: [
    { author: 'Chloe', message: 'The study spaces near Centennial Campus are usually quieter in the evening.' },
    { author: 'Anonymous 31', message: 'Thanks, I’ll check there after class!' },
  ] },
  { title: 'Anyone else nervous about their first internship?', body: 'I start next month and keep wondering what I should do to prepare.', author: { id: 'sample:Maya', name: 'Maya' }, replies: [
    { author: 'Ryan', message: 'Ask your mentor what the first week will look like. That helped me a lot.' },
  ] },
  { title: 'Looking for a weekend hiking buddy', body: 'Thinking of trying Dragon’s Back this Saturday. Beginners welcome!', author: { id: 'anon:42', name: 'Anonymous 42' }, replies: [
    { author: 'Adrian', message: 'I’m interested if you’re going in the morning.' },
  ] },
];
if (!state.forumPosts) state = { ...state, forumPosts: forumPosts() };
let activeForumPost;
function forumPosts() {
  return state.forumPosts ?? [
    ...state.threads.map((thread, index) => ({
      title: thread.question, body: '', author: { id: 'legacy-forum:' + index, name: thread.author }, replies: thread.replies,
    })),
    ...sampleForumPosts,
  ];
}
function renderForumList(id, posts) {
  const list = $(id);
  list.replaceChildren();
  for (const post of posts) {
    const button = document.createElement('button');
    button.className = 'card forum-preview';
    const title = document.createElement('strong');
    title.textContent = post.title;
    const preview = document.createElement('p');
    preview.textContent = post.body;
    const meta = document.createElement('small');
    meta.className = 'muted';
    meta.textContent = post.author.name + ' · ' + post.replies.length + ' comments';
    button.append(title, preview, meta);
    button.addEventListener('click', () => {
      activeForumPost = post;
      $('forumComment').reset();
      show('forumDetail');
    });
    list.append(button);
  }
}
function renderForumDetail() {
  const post = activeForumPost;
  $('forumTitle').textContent = post.title;
  $('forumPoster').textContent = post.author.name;
  $('forumBody').textContent = post.body;
  $('forumComment').elements.anonymous.checked = Boolean(post.author.ownerId && ownsIdentity(post.author));
  $('forumCommentCount').textContent = 'Comments (' + post.replies.length + ')';
  const comments = $('forumComments');
  comments.replaceChildren();
  for (const reply of post.replies) {
    const row = document.createElement('p');
    row.className = 'message';
    row.textContent = reply.author + '\n' + reply.message;
    comments.append(row);
  }
}
function renderForumProfile() {
  const author = activeForumPost.author;
  const posts = forumPosts().filter((post) => post.author.id === author.id);
  $('forumProfileName').textContent = author.name;
  $('forumProfileCount').textContent = posts.length + (posts.length === 1 ? ' forum post' : ' forum posts');
  $('forumContact').hidden = ownsIdentity(author);
  renderForumList('forumProfilePosts', posts);
}
function renderThreads(containerId, questions, saveThreads, render) {
  const container = $(containerId);
  container.replaceChildren();
  if (!questions.length) container.textContent = 'No questions yet.';
  for (const [index, thread] of questions.entries()) {
    const card = document.createElement('article');
    card.className = 'card forum-thread';
    const question = document.createElement('h2');
    question.textContent = thread.question;
    card.append(question);
    const author = document.createElement('p');
    author.className = 'muted';
    author.textContent = thread.author;
    card.append(author);
    for (const reply of thread.replies) {
      const row = document.createElement('p');
      row.className = 'message';
      row.textContent = reply.author + '\n' + reply.message;
      card.append(row);
    }
    const form = document.createElement('form');
    form.innerHTML = '<label>Reply<textarea name="message" rows="2" required></textarea></label><button>Post reply</button>';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.elements.message.value.trim();
      if (!message) return;
      const threads = questions.slice();
      threads[index] = { ...thread, replies: [...thread.replies, { author: forumAuthor(), message }] };
      saveThreads(threads);
      render();
    });
    card.append(form);
    container.append(card);
  }
}
function show(view) {
  document.querySelectorAll('main > section').forEach((page) => {
    page.hidden = page.id !== view;
  });
  currentView = view;
  if (view !== 'conversation') $('chatKeyboard').hidden = true;
  const entering = entryViews.includes(view);
  const employerView = role === 'employer';
  $('roleBadge').textContent = entering ? 'DEMO' : employerView ? 'EMPLOYER' : 'SEEKER';
  $('appMenu').hidden = entering;
  const tab = ['chat', 'inbox', 'messages', 'conversation'].includes(view) ? 'messages' : view.startsWith('forum') ? 'forum' : view === 'profile' ? view : 'home';
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.tab === tab);
  });
  if (view === 'forum') renderForumList('forumThreads', forumPosts());
  if (view === 'forumDetail') renderForumDetail();
  if (view === 'forumProfile') renderForumProfile();
  if (view === 'home') renderFeed();
  if (view === 'post') renderPost();
  if (view === 'authorProfile') renderAuthorProfile();
  if (view === 'messages') renderConversationList();
  if (view === 'conversation') renderConversation();
  if (view === 'compose') {
    const form = $('composeForm');
    form.reset();
    form.elements.company.readOnly = employerView;
    $('postDurationRow').hidden = !employerView;
    form.elements.duration.disabled = !employerView;
    form.elements.duration.required = employerView;
    form.elements.company.value = employerView ? 'Harbour Studio' : '';
    $('postDestination').textContent = employerView
      ? 'Publishing to Official Posts as Harbour Studio.'
      : 'Publishing to Experience Share as an internship seeker.';
    $('composeNote').textContent = '';
  }
  if (view === 'profile') {
    $('profileWorkspace').hidden = !employerView;
    $('profileName').textContent = identity ? loginName : employerView ? 'Harbour Studio' : 'Demo applicant';
    $('profileIdentity').textContent = identity ? 'Verified identity · ' + identity : 'Classroom demo account';
  }
  document.querySelectorAll('aside [data-view]').forEach((button) => {
    const selected = button.dataset.role
      ? !entering && button.dataset.role === role
      : button.dataset.view === 'account' ? entering : button.dataset.view === view;
    button.setAttribute('aria-pressed', selected);
  });
  document.querySelector('main').scrollTop = 0;
  $('status').textContent = state.status;
  $('pendingText').textContent = state.pending;
  $('reviewActions').hidden = state.pending === null;
  $('editButton').disabled = state.pending !== null;
  if (view === 'edit') $('draft').value = state.description;
  const lastMessage = state.messages.at(-1);
  $('inboxStatus').textContent = !lastMessage ? 'No inquiries yet' : state.resolved ? 'Inquiry resolved' : lastMessage.sender === 'Applicant' ? 'New applicant question' : 'Reply sent';
  renderMessages('seekerMessages');
  renderMessages('employerMessages');
  $('replyForm').hidden = state.resolved || !lastMessage;
  $('questionForm').hidden = state.resolved;
  $('resolve').hidden = lastMessage?.sender !== 'Harbour Studio';
}
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.closest('aside')) {
      const nextRole = button.dataset.role;
      if (nextRole) {
        if (role !== nextRole || entryViews.includes(currentView)) identity = '';
        role = nextRole;
        if (button.dataset.role && currentView === 'forum') {
          show('forum');
          return;
        }
      }
      if (button.dataset.view === 'account') {
        identity = '';
        $('loginNote').textContent = '';
        $('signupNote').textContent = '';
      }
    }
    if (button.dataset.view === 'employer') role = 'employer';
    show(button.dataset.view === 'edit' && state.pending !== null ? 'employer' : button.dataset.view);
  });
});
document.querySelectorAll('[data-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    show(tab);
  });
});
$('signupForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const { account, password } = event.target.elements;
  const name = account.value.trim();
  if (!name) return;
  if (accounts.has(name)) {
    $('signupNote').textContent = 'This account already exists. Go back and log in.';
    return;
  }
  accounts.set(name, password.value);
  event.target.reset();
  $('signupNote').textContent = '';
  $('loginForm').elements.account.value = name;
  $('loginForm').elements.password.value = '';
  $('loginNote').textContent = 'Account created. Log in to continue.';
  show('login');
});
$('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const { account, password } = event.target.elements;
  const name = account.value.trim();
  if (accounts.get(name) !== password.value) {
    $('loginNote').textContent = 'Log in failed. Check your details and try again.';
    return;
  }
  loginName = name;
  password.value = '';
  $('loginNote').textContent = '';
  $('verifyNote').textContent = '';
  show('verify');
});
$('verifyForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = event.target.elements;
  if (fields.proof.value !== 'valid') {
    $('verifyNote').textContent = 'Proof could not be verified. Select another document.';
    return;
  }
  identity = fields.identity.value;
  role = identity === 'Company employee' ? 'employer' : 'seeker';
  $('verifyNote').textContent = '';
  show('profile');
});
$('forumPost').addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = event.target.elements;
  const title = fields.title.value.trim();
  const body = fields.message.value.trim();
  if (!title || !body) return;
  const author = fields.anonymous.checked ? anonymousIdentity() : account();
  save({ forumPosts: [{ title, body, author, replies: [] }, ...forumPosts()] });
  event.target.reset();
  show('forum');
});
$('forumComment').addEventListener('submit', (event) => {
  event.preventDefault();
  const message = event.target.elements.message.value.trim();
  if (!message) return;
  const author = event.target.elements.anonymous.checked ? anonymousIdentity() : account();
  const updated = { ...activeForumPost, replies: [...activeForumPost.replies, { author: author.name, message }] };
  const posts = forumPosts().slice();
  const index = posts.indexOf(activeForumPost);
  posts[index] = updated;
  save({ forumPosts: posts });
  activeForumPost = updated;
  event.target.reset();
  renderForumDetail();
});
$('forumPoster').addEventListener('click', () => {
  $('anonymousMessage').checked = activeForumPost.author.id.startsWith('anon:');
  show('forumProfile');
});
$('messageForumAuthor').addEventListener('click', () => {
  const sender = $('anonymousMessage').checked ? anonymousIdentity() : account();
  openConversation(activeForumPost.author, sender);
});
document.querySelectorAll('[data-feed]').forEach((button) => {
  button.addEventListener('click', () => {
    if (feed !== button.dataset.feed) clearFeedFilters();
    feed = button.dataset.feed;
    renderFeed();
  });
});
$('feedSearch').addEventListener('input', renderFeed);
for (const id of ['sameSchool', 'jobFilter', 'companyFilter', 'durationFilter']) {
  $(id).addEventListener('change', renderFeed);
}
function clearFeedFilters() {
  $('sameSchool').checked = false;
  $('jobFilter').value = '';
  $('companyFilter').value = '';
  $('durationFilter').value = '';
}
$('clearFeedFilters').addEventListener('click', () => {
  clearFeedFilters();
  renderFeed();
});
$('composeForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = event.target.elements;
  const official = role === 'employer';
  const company = official ? 'Harbour Studio' : fields.company.value.trim();
  const job = fields.job.value.trim();
  const title = fields.title.value.trim();
  const body = fields.body.value.trim();
  const duration = Number(fields.duration.value);
  if (!company || !job || !title || !body) {
    $('composeNote').textContent = 'Complete all four fields before publishing.';
    return;
  }
  if (official && (!Number.isInteger(duration) || duration < 1 || duration > 104)) {
    $('composeNote').textContent = 'Enter an internship duration from 1 to 104 weeks.';
    return;
  }
  const type = official ? 'official' : 'experience';
  const post = {
    id: 'published-' + (state.publishedPosts.length + 1),
    type, company, job, title, body,
    author: official ? company + ' · Official' : account().name + ' · Internship seeker',
    authorId: account().id,
    duration: official ? duration : null,
    school: official ? '' : 'HKU',
    cover: official ? '✦' : '↗',
    theme: official ? 'blue' : 'mint',
  };
  save({ publishedPosts: [post, ...state.publishedPosts] });
  $('feedSearch').value = '';
  clearFeedFilters();
  feed = type;
  show('home');
});
$('messageAuthor').addEventListener('click', () => openConversation(postAuthor(activePost)));
const messageInput = $('directMessageInput');
const chatKeyboard = $('chatKeyboard');
const desktopPreview = window.matchMedia('(pointer: fine)');
messageInput.addEventListener('focus', () => {
  if (desktopPreview.matches) chatKeyboard.hidden = false;
  const log = $('conversationMessages');
  log.scrollTop = log.scrollHeight;
});
messageInput.addEventListener('blur', (event) => {
  if (!chatKeyboard.contains(event.relatedTarget)) chatKeyboard.hidden = true;
});
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') messageInput.blur();
});
chatKeyboard.addEventListener('focusout', (event) => {
  if (event.relatedTarget !== messageInput && !chatKeyboard.contains(event.relatedTarget)) {
    chatKeyboard.hidden = true;
  }
});
for (const keys of ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', ['space', '⌫', 'Done']]) {
  const row = document.createElement('div');
  for (const key of keys) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = key;
    if (key === '⌫') button.setAttribute('aria-label', 'Backspace');
    button.addEventListener('pointerdown', (event) => event.preventDefault());
    button.addEventListener('click', () => {
      if (key === 'Done') {
        messageInput.blur();
        chatKeyboard.hidden = true;
        return;
      }
      const start = messageInput.selectionStart;
      const end = messageInput.selectionEnd;
      if (key === '⌫') {
        messageInput.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
      } else if (messageInput.value.length - (end - start) < messageInput.maxLength) {
        messageInput.setRangeText(key === 'space' ? ' ' : key, start, end, 'end');
      }
      messageInput.focus();
    });
    row.append(button);
  }
  chatKeyboard.append(row);
}
$('directMessageForm').querySelector('button').addEventListener('mousedown', (event) => event.preventDefault());
$('directMessageForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = event.target.elements.message.value.trim();
  const me = chatSender;
  if (!text || ownsIdentity(recipient)) return;
  const previous = conversationWith(recipient);
  const updated = {
    participants: previous?.participants ?? [me, recipient],
    messages: [...(previous?.messages ?? []), { sender: me.id, text }],
  };
  save({ conversations: [updated, ...state.conversations.filter((thread) => thread !== previous)] });
  event.target.reset();
  renderConversation();
});
$('postQuestion').addEventListener('submit', (event) => {
  event.preventDefault();
  const question = event.target.elements.message.value.trim();
  if (!question) return;
  const threads = state.postThreads[activePost.id] ?? [];
  savePostThreads([...threads, { question, author: forumAuthor(), replies: [] }]);
  event.target.reset();
  renderPost();
});
$('updateForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const pending = $('draft').value.trim();
  if (!pending) return;
  save({ pending, status: 'Awaiting platform review' });
  show('employer');
});
$('approve').addEventListener('click', () => {
  save({ description: state.pending, pending: null, status: 'Update approved and published' });
  show('employer');
});
$('reject').addEventListener('click', () => {
  save({ pending: null, status: 'Update rejected. Request to edit again to resubmit.' });
  show('employer');
});
for (const [id, sender, view] of [
  ['questionForm', 'Applicant', 'chat'],
  ['replyForm', 'Harbour Studio', 'inbox'],
]) {
  $(id).addEventListener('submit', (event) => {
    event.preventDefault();
    const field = event.target.querySelector('textarea');
    const message = field.value.trim();
    if (!message) return;
    save({ messages: [...state.messages, { sender, message }] });
    field.value = '';
    show(view);
  });
}
$('resolve').addEventListener('click', () => {
  save({ resolved: true });
  show('chat');
});
$('resetDemo').addEventListener('click', () => {
  $('resetError').textContent = '';
  $('resetDialog').showModal();
});
$('confirmReset').addEventListener('click', () => {
  try {
    localStorage.removeItem(key);
  } catch {
    $('resetError').textContent = 'The browser did not allow the demo data to be cleared.';
    return;
  }
  window.location.reload();
});
show('welcome');
