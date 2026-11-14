"use strict";

/* ---------------------------------------------------------
   InternCruise classroom prototype
   - Browser-only fictional data
   - Public demo password: cruise
   - No real authentication, verification or moderation
   --------------------------------------------------------- */

const STORAGE_KEY = "interncruise-demo-v2";
const VERSION = 2;
const $ = (id) => document.getElementById(id);

// Escape all data inserted into HTML templates.
const esc = (value = "") => String(value ?? "").replace(
  /[&<>"']/g,
  (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]
);

const uid = () => (
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const timestamp = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));

function seed() {
  const users = [
    {
      id: "u-seeker", username: "demo", name: "Jamie Chan",
      kind: "participant", identity: "Student", verified: true,
      org: "HKU", major: "Business", location: "Hong Kong",
      headline: "Looking for a meaningful first internship",
      bio: "Interested in product, marketing and learning from other students.",
      interests: "Product design, Marketing", alias: "Anonymous 101"
    },
    {
      id: "u-sharer", username: "chloe", name: "Chloe Wong",
      kind: "participant", identity: "Alumni", verified: true,
      org: "HKU", major: "Business", location: "Hong Kong",
      headline: "Former design intern · Happy to answer questions",
      bio: "I recently completed a product design internship at Harbour Studio.",
      interests: "UX research, Design", alias: "Anonymous 102"
    },
    {
      id: "u-provider", username: "provider", name: "Alex Lee",
      kind: "provider", identity: "Company employee", verified: true,
      org: "Harbour Studio", major: "People & Talent",
      location: "Hong Kong",
      headline: "Helping early-career designers find their starting point",
      bio: "We are a small product studio building useful digital experiences.",
      interests: "Product design, Mentorship", alias: "Anonymous 103"
    },
    {
      id: "u-orbit", username: "orbit", name: "Morgan Lau",
      kind: "provider", identity: "Company employee", verified: true,
      org: "Orbit Analytics", major: "Recruitment",
      location: "Hong Kong", headline: "Data internships with real projects",
      bio: "Our interns work alongside analysts and engineers.",
      interests: "SQL, Analytics", alias: "Anonymous 104"
    }
  ];

  const official = (id, owner, data) => ({
    id, owner, type: "official", anonymous: false,
    live: data, draft: null, review: "live", access: "none",
    reason: "", closed: false, likes: [], questions: [],
    created: timestamp()
  });

  return {
    version: VERSION,
    users,
    posts: [
      official("p-harbour", "u-provider", {
        title: "Join our product design team this summer",
        company: "Harbour Studio",
        job: "Product Design Intern",
        duration: 6,
        location: "Hong Kong",
        pay: "HK$70/hour · Sample figure",
        deadline: "",
        body: "Help our product team design onboarding screens, run usability tests and present your findings.",
        requirements: "University student; curiosity about design; a small portfolio is welcome."
      }),
      official("p-orbit", "u-orbit", {
        title: "Turn business data into answers",
        company: "Orbit Analytics",
        job: "Data Analyst Intern",
        duration: 12,
        location: "Hong Kong",
        pay: "HK$75/hour · Sample figure",
        deadline: "",
        body: "Clean datasets, write SQL queries and build a dashboard with support from the analytics team.",
        requirements: "Basic spreadsheet skills. Introductory SQL is helpful."
      }),
      {
        id: "p-experience", owner: "u-sharer", type: "experience",
        source: "p-harbour", anonymous: false, certificate: true,
        live: {
          title: "What my first design internship was really like",
          company: "Harbour Studio",
          job: "Product Design Intern",
          duration: 6,
          body: "I worked on onboarding screens and joined weekly critiques. My mentor gave feedback every Friday, and I presented a usability study in week six.",
          school: "HKU", major: "Business",
          ratings: { learning: 5, mentorship: 5, workload: 4 },
          treatment: { paid: "Yes", transport: "No", overtime: "No" }
        },
        likes: ["u-seeker"], questions: [], created: timestamp()
      }
    ],
    forums: [
      {
        id: "f-study", owner: "u-sharer", anonymous: true,
        title: "Where do you study when the library is full?",
        body: "Looking for somewhere quiet around campus after 6 pm.",
        likes: [], replies: [], created: timestamp()
      },
      {
        id: "f-first", owner: "u-seeker", anonymous: false,
        title: "How should I prepare for my first internship?",
        body: "What do you wish you had known before your first day?",
        likes: [], replies: [
          {
            id: "r-first", owner: "u-sharer", anonymous: false,
            text: "Ask your mentor what the first week will look like. It helped me feel much more prepared.",
            created: timestamp()
          }
        ],
        created: timestamp()
      }
    ],
    chats: [],
    notifications: [],
    saved: {}
  };
}

let db = seed();

try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (
    stored?.version === VERSION &&
    ["users", "posts", "forums", "chats", "notifications"]
      .every((key) => Array.isArray(stored[key])) &&
    stored.saved && typeof stored.saved === "object"
  ) {
    db = stored;
  }
} catch {
  // Start with sample data when storage is blocked or malformed.
}

let currentUserId = null;
let route = { name: "welcome" };
let navigation = [];
let dirty = false;
let noticeTimer;

const filters = {
  type: "experience",
  query: "",
  company: "",
  duration: "",
  sameSchool: false,
  sameMajor: false
};

const me = () => db.users.find((user) => user.id === currentUserId);
const getUser = (id) => db.users.find((user) => user.id === id);
const getPost = (id) => db.posts.find((post) => post.id === id);
const getForum = (id) => db.forums.find((post) => post.id === id);
const getChat = (id) => db.chats.find((chat) => chat.id === id);
const provider = () => me()?.kind === "provider";

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    $("storageWarning").textContent = "";
  } catch {
    $("storageWarning").textContent =
      "Browser storage is unavailable or full. Changes work in this tab but may be lost after refreshing.";
  }
}

function tell(message) {
  clearTimeout(noticeTimer);
  $("notice").textContent = message;
  $("notice").hidden = !message;
  if (message) {
    noticeTimer = setTimeout(() => {
      $("notice").hidden = true;
    }, 7000);
  }
}

function ask(message, label = "Continue") {
  const dialog = $("confirmDialog");
  $("confirmText").textContent = message;
  $("confirmButton").textContent = label;
  dialog.returnValue = "cancel";
  return new Promise((resolve) => {
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "confirm"),
      { once: true }
    );
    dialog.showModal();
  });
}

async function mayLeave() {
  return !dirty || await ask(
    "You have unsaved changes on this page. Leave without saving?",
    "Leave page"
  );
}

async function go(name, data = {}, root = false) {
  if (!await mayLeave()) return;
  if (root) {
    navigation = [];
  } else {
    navigation.push({ ...route, scroll: $("screen").scrollTop });
  }
  route = { name, ...data };
  dirty = false;
  render();
}

async function back() {
  if (!await mayLeave()) return;
  route = navigation.pop() ?? { name: me() ? "home" : "welcome" };
  dirty = false;
  render();
  $("screen").scrollTop = route.scroll ?? 0;
}

async function enter(id = null) {
  if (!await mayLeave()) return;
  currentUserId = id;
  navigation = [];
  dirty = false;
  route = { name: id ? "home" : "account" };
  render();
}

function notify(to, text, target) {
  if (!to || to === currentUserId) return;
  db.notifications.unshift({
    id: uid(), to, text, target, read: false, created: timestamp()
  });
}

function actor(owner, anonymous = false) {
  return anonymous ? `anon:${owner}` : owner;
}

function actorOwner(id) {
  return id.startsWith("anon:") ? id.slice(5) : id;
}

function actorName(id) {
  const user = getUser(actorOwner(id));
  if (!user) return "Demo user";
  return id.startsWith("anon:")
    ? user.alias
    : user.kind === "provider" ? user.org : user.name;
}

function authorName(item) {
  return actorName(actor(item.owner, item.anonymous));
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((word) => word[0]).join("").toUpperCase();
}

function dateLabel(value) {
  return new Date(value).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function button(label, action, id = "", classes = "secondary", extra = "") {
  return `<button type="button" class="${esc(classes)}"
    data-action="${esc(action)}" data-id="${esc(id)}" ${extra}>${esc(label)}</button>`;
}

function field(label, name, value = "", type = "text", required = true, extra = "") {
  return `<label>${esc(label)}
    <input name="${esc(name)}" type="${esc(type)}"
      value="${esc(value)}" ${required ? "required" : ""}
      ${type === "text" ? 'maxlength="160"' : ""} ${extra}>
  </label>`;
}

function area(label, name, value = "", required = true, max = 4000) {
  return `<label>${esc(label)}
    <textarea name="${esc(name)}" rows="4" maxlength="${max}"
      ${required ? "required" : ""}>${esc(value)}</textarea>
  </label>`;
}

function selectField(label, name, values, selected = "") {
  return `<label>${esc(label)}<select name="${esc(name)}">
    ${values.map((item) => {
      const [value, text] = Array.isArray(item) ? item : [item, item];
      return `<option value="${esc(value)}"
        ${String(value) === String(selected) ? "selected" : ""}>${esc(text)}</option>`;
    }).join("")}
  </select></label>`;
}

function checkbox(label, name, checked = false) {
  return `<label class="check"><input type="checkbox" name="${esc(name)}"
    ${checked ? "checked" : ""}>${esc(label)}</label>`;
}

function heading(title, subtitle = "", withBack = true) {
  return `${withBack ? button("← Back", "back", "", "link-button back") : ""}
    <div class="page-heading">
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ""}
    </div>`;
}

function authorButton(item) {
  return button(
    authorName(item), "author", actor(item.owner, item.anonymous), "link-button small"
  );
}

function postCard(post) {
  const data = post.live;
  const matching = post.type === "experience" && !post.anonymous &&
    (data.school === me()?.org || data.major === me()?.major);
  return `<button type="button" class="feed-card"
    data-action="post" data-id="${esc(post.id)}">
    <div class="feed-cover ${esc(post.type)}" aria-hidden="true">
      ${post.type === "official" ? "✦" : "↗"}
    </div>
    <div class="feed-copy">
      <h2>${esc(data.title)}</h2>
      <p>${esc(data.company)} · ${esc(data.job)}</p>
      <p>${esc(data.duration)} weeks</p>
      <p>${esc(authorName(post))}</p>
      ${matching ? '<span class="badge">School / major match</span>' : ""}
      ${post.type === "experience" && post.likes.length >= 3
        ? '<span class="badge">Helpful · 3+ likes</span>' : ""}
      ${post.closed ? '<span class="badge">Applications closed</span>' : ""}
    </div>
  </button>`;
}

function postGrid(posts) {
  return posts.length
    ? `<div class="feed-grid">${posts.map(postCard).join("")}</div>`
    : '<p class="empty">Nothing here yet.</p>';
}

function forumCard(post) {
  return `<article class="card">
    <h2>${esc(post.title)}</h2>
    <p class="preserve">${esc(post.body.slice(0, 180))}${post.body.length > 180 ? "…" : ""}</p>
    <p class="muted">${esc(authorName(post))} · ${post.replies.length} replies</p>
    ${button("Open discussion →", "forum-detail", post.id)}
  </article>`;
}

/* ---------------------- Authentication ---------------------- */

function welcomePage() {
  return `${heading("Know where you’re headed.", "", false)}
    <p>Discover roles, hear from past interns, and get answers before you apply.</p>
    <div class="hero-art" aria-hidden="true">✦</div>
    ${button("Get started →", "account", "", "wide")}
    <p class="muted">A classroom simulation. Please use fictional details only.</p>`;
}

function accountPage() {
  return `${heading("Get started", "Do you already have an account?")}
    <div class="stack">
      ${button("Yes, log in", "login", "", "wide")}
      ${button("No, sign up", "signup", "", "secondary wide")}
    </div>
    <div class="card">
      <h2>Try a sample account</h2>
      <p class="muted">
        Seeker: <b>demo</b><br>
        Experience sharer: <b>chloe</b><br>
        Provider: <b>provider</b>
      </p>
      <p>Public demo password: <b>cruise</b></p>
    </div>`;
}

function loginPage() {
  return `${heading("Log in", "Simulated access—not secure authentication.")}
    <form data-form="login">
      ${field("Username, fictional email or phone", "username", route.username ?? "")}
      ${field("Demo password", "password", "", "password", true, 'autocomplete="off"')}
      <p class="muted">Use <b>cruise</b> for every demo account.</p>
      <button class="wide">Log in</button>
    </form>
    <p>${button("Create an account", "signup", "", "link-button")}</p>`;
}

function signupPage() {
  return `${heading("Create account", "Choose your identity now; verification follows login.")}
    <form data-form="signup" data-dirty>
      ${field("Username, fictional email or phone", "username")}
      ${field("Display name", "name")}
      ${selectField("Identity / verification route", "identity", [
        "Student", "Alumni", "Company employee"
      ], "Student")}
      ${field("School or company name", "org")}
      ${field("Demo password", "password", "", "password", true, 'autocomplete="off"')}
      <p class="muted">
        Enter <b>cruise</b>. This public demo password is shared by every account.
        No passwords or real documents are stored.
      </p>
      <button class="wide">Create account</button>
    </form>`;
}

function verifyPage() {
  const user = me();
  return `${heading("Verify your identity", "Sample verification only—do not upload real ID.")}
    <div class="card">
      <strong>${esc(user.name)}</strong>
      <p>${esc(user.identity)} · ${esc(user.org)}</p>
    </div>
    <form data-form="verify">
      ${selectField("Proof to simulate", "proof", [
        ["invalid", "Invalid sample document"],
        ["valid", user.kind === "provider"
          ? "Valid sample company-employee proof"
          : "Valid sample student / alumni proof"]
      ], "invalid")}
      <button class="wide">Submit sample proof</button>
    </form>
    <p class="muted">
      A valid sample marks this demo profile as verified.
      In a real service, this decision belongs to a secure verification process.
    </p>`;
}

/* ---------------------- Feed and posting ---------------------- */

function homePage() {
  const companies = [...new Set(
    db.posts.filter((post) => post.live && post.type === filters.type)
      .map((post) => post.live.company)
  )].sort();

  const query = filters.query.toLowerCase();
  const matches = db.posts.filter((post) => {
    const data = post.live;
    if (!data || post.type !== filters.type) return false;
    if (query && ![data.title, data.company, data.job]
      .some((text) => text.toLowerCase().includes(query))) return false;
    if (filters.company && data.company !== filters.company) return false;
    if (filters.duration && data.duration > Number(filters.duration)) return false;
    if (post.type === "experience") {
      if (filters.sameSchool && (post.anonymous || data.school !== me().org)) return false;
      if (filters.sameMajor && (post.anonymous || data.major !== me().major || !me().major)) return false;
    }
    return true;
  });

  return `${heading("Your next starting point", "", false)}
    <div class="row between">
      <p class="muted">Learn from people. Explore opportunities.</p>
      ${button("＋ Post", "create")}
    </div>
    <div class="feed-tabs">
      ${button("Experience Share", "feed", "experience", "", `aria-pressed="${filters.type === "experience"}"`)}
      ${button("Official Posts", "feed", "official", "", `aria-pressed="${filters.type === "official"}"`)}
    </div>
    <form data-form="filters">
      ${field("Search company, role or title", "query", filters.query, "text", false)}
      <details ${filters.company || filters.duration || filters.sameSchool || filters.sameMajor ? "open" : ""}>
        <summary>Filters</summary>
        ${selectField("Company", "company", [["", "All companies"], ...companies], filters.company)}
        ${selectField("Maximum duration", "duration", [
          ["", "Any duration"], ["6", "Up to 6 weeks"],
          ["12", "Up to 12 weeks"], ["26", "Up to 26 weeks"]
        ], filters.duration)}
        ${filters.type === "experience" ? `
          ${checkbox(`Same school (${me().org})`, "sameSchool", filters.sameSchool)}
          ${checkbox("Same major / field", "sameMajor", filters.sameMajor)}
          <p class="muted">Anonymous experiences are excluded from school/major matching.</p>
        ` : ""}
      </details>
      <div class="row">
        <button>Apply search & filters</button>
        ${button("Clear all", "clear-filters")}
      </div>
    </form>
    <p class="muted">${matches.length} result${matches.length === 1 ? "" : "s"}</p>
    ${postGrid(matches)}`;
}

function createPage() {
  return `${heading("Create a post", "Choose where your post belongs.")}
    <div class="stack">
      ${provider()
        ? button("Publish an internship listing", "new-listing", "", "wide")
        : button("Share verified internship experience", "proof", "", "wide")}
      ${button("Post to the community forum", "forum-compose", "", "secondary wide")}
    </div>
    <p class="muted">
      ${provider()
        ? "Listings require a simulated platform review before appearing in Official Posts."
        : "Students and alumni can both be experience sharers. A sample internship certificate is required."}
    </p>`;
}

function proofPage() {
  const listings = db.posts.filter((post) => post.type === "official" && post.live);
  return `${heading("Verify internship experience")}
    <form data-form="proof">
      ${selectField("Which internship?", "source",
        listings.map((post) => [post.id, `${post.live.company} · ${post.live.job}`]),
        route.source ?? listings[0]?.id)}
      ${selectField("Internship certificate", "proof", [
        ["invalid", "Invalid sample certificate"],
        ["valid", "Valid sample certificate"]
      ], "invalid")}
      <p class="muted">This simulates certificate checking. No files are uploaded.</p>
      <button class="wide">Verify & continue</button>
    </form>`;
}

function experiencePage() {
  const source = getPost(route.source);
  if (!source?.live || !route.proofPassed) return missingPage();

  const ratings = [0, 1, 2, 3, 4, 5].map((value) => [value, `${value} / 5`]);
  return `${heading("Share your experience", `${source.live.company} · ${source.live.job}`)}
    <p class="badge">Sample internship certificate verified</p>
    <form data-form="experience" data-dirty>
      ${field("Post title", "title")}
      ${field("Internship duration (weeks)", "duration", source.live.duration, "number", true, 'min="1" max="104" step="1"')}
      <fieldset>
        <legend>Work-related ratings</legend>
        ${selectField("Learning opportunities", "learning", ratings, 4)}
        ${selectField("Mentorship", "mentorship", ratings, 4)}
        ${selectField("Manageability of workload", "workload", ratings, 4)}
      </fieldset>
      <fieldset>
        <legend>Treatment / arrangements</legend>
        ${selectField("Was the internship paid?", "paid", ["Yes", "No"], "Yes")}
        ${selectField("Transport / accommodation support?", "transport", ["Yes", "No"], "No")}
        ${selectField("Was overtime expected?", "overtime", ["Yes", "No"], "No")}
      </fieldset>
      ${area("Experience comment (optional)", "body", "", false)}
      ${checkbox("Post anonymously", "anonymous")}
      <p class="muted">
        Anonymous posts remain visible, but are not matched by school or major.
        Anonymity here is only a UI simulation.
      </p>
      <details>
        <summary>Classroom moderation scenario</summary>
        ${selectField("Simulated community-guideline result", "moderation",
          [["pass", "Pass"], ["fail", "Fail—show a rejection notice"]], "pass")}
      </details>
      <button class="wide">Publish experience</button>
    </form>`;
}

function ratingPanel(post) {
  const data = post.live;
  if (!data.ratings) return "";
  return `<section class="card">
    <h2>Verified experience ratings</h2>
    <dl class="meta">
      <dt>Learning</dt><dd>${data.ratings.learning}/5</dd>
      <dt>Mentorship</dt><dd>${data.ratings.mentorship}/5</dd>
      <dt>Workload</dt><dd>${data.ratings.workload}/5 manageable</dd>
      <dt>Paid</dt><dd>${esc(data.treatment.paid)}</dd>
      <dt>Support</dt><dd>${esc(data.treatment.transport)}</dd>
      <dt>Overtime</dt><dd>${esc(data.treatment.overtime)}</dd>
    </dl>
    <p class="muted">Sample certificate verification—not a real authenticity check.</p>
  </section>`;
}

function replyMarkup(reply) {
  return `<div class="reply">
    ${authorButton(reply)}
    <p class="preserve">${esc(reply.text)}</p>
    <small class="muted">${esc(dateLabel(reply.created))}</small>
  </div>`;
}

function questionMarkup(question, post) {
  return `<article class="card">
    ${authorButton(question)}
    <h3 class="preserve">${esc(question.text)}</h3>
    <span class="badge">${question.resolved ? "Resolved" : "Open question"}</span>
    <div class="thread">${question.replies.map(replyMarkup).join("")}</div>
    ${question.owner === currentUserId
      ? button(question.resolved ? "Reopen question" : "Mark resolved",
        "resolve-question", question.id) : ""}
    ${!question.resolved ? `
      <form data-form="question-reply" data-id="${esc(question.id)}" data-dirty>
        ${area("Reply / follow-up", "text", "", true, 2000)}
        ${checkbox("Reply anonymously", "anonymous")}
        <button>Post reply</button>
      </form>
    ` : '<p class="muted">The question owner can reopen this discussion.</p>'}
  </article>`;
}

function postPage() {
  const post = getPost(route.id);
  if (!post?.live) return missingPage();
  const data = post.live;
  const saved = (db.saved[currentUserId] ?? []).includes(post.id);
  const liked = post.likes.includes(currentUserId);
  const experiences = db.posts.filter((item) =>
    item.type === "experience" && item.live && item.source === post.id
  );

  return `${heading(data.title)}
    ${authorButton(post)}
    <p class="muted">${esc(data.company)} · ${esc(data.job)}</p>
    <span class="badge">${post.type === "official" ? "Official listing" : "Verified experience · Demo"}</span>
    ${post.closed ? '<span class="badge">Applications closed</span>' : ""}
    <dl class="meta">
      <dt>Duration</dt><dd>${esc(data.duration)} weeks</dd>
      ${post.type === "official" ? `
        <dt>Location</dt><dd>${esc(data.location)}</dd>
        <dt>Pay</dt><dd>${esc(data.pay || "Not specified")}</dd>
        <dt>Deadline</dt><dd>${esc(data.deadline || "Not specified")}</dd>
      ` : ""}
    </dl>
    <p class="preserve">${esc(data.body || "Ratings-only experience share.")}</p>
    ${data.requirements ? `<h2>Requirements</h2><p class="preserve">${esc(data.requirements)}</p>` : ""}
    ${ratingPanel(post)}
    <div class="row">
      ${button(saved ? "✓ Saved" : "Save", "save-post", post.id)}
      ${button(`${liked ? "♥" : "♡"} Helpful (${post.likes.length})`, "like-post", post.id)}
      ${post.owner !== currentUserId
        ? button(post.type === "official" ? "Private inquiry" : "Message author",
          "post-message", post.id) : ""}
    </div>

    ${post.type === "official" ? `
      <section class="card">
        <h2>Internship experiences</h2>
        ${provider() ? "" : button("Write a verified review", "proof", post.id)}
        <p class="muted">${experiences.length} experience share(s) for this listing.</p>
        ${postGrid(experiences)}
      </section>
    ` : ""}

    <h2>Comments & Q&A</h2>
    <p class="muted">Ask a question. The author receives an in-app demo notification.</p>
    <form data-form="question" data-dirty>
      ${area("Your question", "text", "", true, 2000)}
      ${checkbox("Ask anonymously", "anonymous")}
      <button>Post question</button>
    </form>
    ${post.questions.length
      ? post.questions.map((question) => questionMarkup(question, post)).join("")
      : '<p class="empty">No questions yet.</p>'}`;
}

/* ---------------------- Forum ---------------------- */

function forumPage() {
  return `${heading("Forum", "Campus life, internships, and everything in between.", false)}
    ${button("＋ New forum post", "forum-compose", "", "wide")}
    ${db.forums.map(forumCard).join("")}`;
}

function forumComposePage() {
  return `${heading("New forum post")}
    <form data-form="forum-compose" data-dirty>
      ${field("Title", "title")}
      ${area("What’s on your mind?", "body")}
      ${checkbox("Post anonymously", "anonymous")}
      <details>
        <summary>Classroom moderation scenario</summary>
        ${selectField("Simulated guideline result", "moderation",
          [["pass", "Pass"], ["fail", "Fail"]], "pass")}
      </details>
      <button class="wide">Publish post</button>
    </form>`;
}

function forumDetailPage() {
  const post = getForum(route.id);
  if (!post) return missingPage();
  return `${heading(post.title)}
    ${authorButton(post)}
    <p class="preserve">${esc(post.body)}</p>
    ${button(`${post.likes.includes(currentUserId) ? "♥" : "♡"} ${post.likes.length} likes`,
      "like-forum", post.id)}
    <h2>Replies (${post.replies.length})</h2>
    ${post.replies.map(replyMarkup).join("")}
    <form data-form="forum-reply" data-dirty>
      ${area("Leave a comment", "text", "", true, 2000)}
      ${checkbox("Comment anonymously", "anonymous")}
      <button>Post comment</button>
    </form>`;
}

/* ---------------------- Profiles ---------------------- */

function profilePage() {
  const personActor = route.actor ?? currentUserId;
  const user = getUser(actorOwner(personActor));
  if (!user) return missingPage();
  const anonymous = personActor.startsWith("anon:");
  const own = !anonymous && user.id === currentUserId;

  const posts = db.posts.filter((post) =>
    post.live && actor(post.owner, post.anonymous) === personActor
  );
  const forums = db.forums.filter((post) =>
    actor(post.owner, post.anonymous) === personActor
  );
  const name = actorName(personActor);

  return `${own ? "" : button("← Back", "back", "", "link-button")}
    <section class="card">
      <div class="profile-top">
        <div class="avatar" aria-hidden="true">${esc(initials(name))}</div>
        <div>
          <h1>${esc(name)}</h1>
          <span class="badge">${anonymous
            ? "Anonymous community profile"
            : `${esc(user.identity)} · ${user.verified ? "Demo verified" : "Unverified"}`}</span>
        </div>
      </div>

      ${anonymous ? `
        <p class="muted">
          Personal details are hidden in this interface.
          This classroom demo is not a secure anonymity system.
        </p>
      ` : `
        <p><strong>${esc(user.headline || "Welcome to my profile")}</strong></p>
        <dl class="meta">
          <dt>${user.kind === "provider" ? "Contact" : "Name"}</dt><dd>${esc(user.name)}</dd>
          <dt>${user.kind === "provider" ? "Company" : "School"}</dt><dd>${esc(user.org)}</dd>
          <dt>${user.kind === "provider" ? "Department" : "Major"}</dt><dd>${esc(user.major || "Not added")}</dd>
          <dt>Location</dt><dd>${esc(user.location || "Not added")}</dd>
          <dt>Interests</dt><dd>${esc(user.interests || "Not added")}</dd>
        </dl>
        <h2>About</h2>
        <p class="preserve">${esc(user.bio || "No bio yet.")}</p>
      `}

      <div class="stats">
        <div><strong>${posts.length}</strong>Posts</div>
        <div><strong>${forums.length}</strong>Discussions</div>
        <div><strong>${posts.reduce((sum, post) => sum + post.likes.length, 0)}</strong>Helpful likes</div>
      </div>

      ${own
        ? button("Edit profile", "edit-profile", "", "wide")
        : actorOwner(personActor) !== currentUserId
          ? button("Message", "message-actor", personActor, "wide")
          : '<p class="muted">This is your anonymous profile.</p>'}
    </section>

    ${own ? `
      <section class="card stack">
        ${provider()
          ? button("Edit Internship Information →", "workspace", "", "wide") : ""}
        ${button("Saved posts", "saved", "", "secondary wide")}
        ${button("My anonymous posts", "author", actor(currentUserId, true), "secondary wide")}
        ${button("Notifications", "notifications", "", "secondary wide")}
        ${button("Log out", "logout", "", "secondary wide")}
      </section>
    ` : ""}

    <h2>${anonymous ? "Anonymous posts" : "Published posts"}</h2>
    ${postGrid(posts)}
    <h2>Forum discussions</h2>
    ${forums.length ? forums.map(forumCard).join("") : '<p class="empty">No discussions yet.</p>'}`;
}

function editProfilePage() {
  const user = me();
  return `${heading("Edit profile")}
    <form data-form="edit-profile" data-dirty>
      ${field("Display / contact name", "name", user.name)}
      ${field("Headline", "headline", user.headline, "text", false)}
      ${field(user.kind === "provider" ? "Verified company" : "School",
        "org", user.org, "text", true, 'readonly')}
      <p class="muted">Institution changes would require re-verification in a real app.</p>
      ${field(user.kind === "provider" ? "Department" : "Major", "major", user.major, "text", false)}
      ${field("Location", "location", user.location, "text", false)}
      ${field("Interests / skills", "interests", user.interests, "text", false)}
      ${area("Bio", "bio", user.bio, false, 1200)}
      <button class="wide">Save profile</button>
    </form>`;
}

/* ---------------------- Employer listings ---------------------- */

function workspacePage() {
  if (!provider()) return deniedPage();
  const listings = db.posts.filter((post) =>
    post.type === "official" && post.owner === currentUserId
  );
  const chats = db.chats.filter((chat) =>
    chat.context.startsWith("listing:") &&
    chat.participants.some((person) => actorOwner(person) === currentUserId)
  );

  return `${heading("Edit Internship Information", me().org)}
    ${button("＋ Create internship listing", "new-listing", "", "wide")}
    <p class="muted">
      Platform approvals are available only through the classroom simulator outside the phone.
    </p>

    ${listings.map((post) => {
      const data = post.draft ?? post.live;
      return `<article class="card">
        <h2>${esc(data.title || "Untitled draft")}</h2>
        <p>${esc(data.job)}</p>
        <p class="badge">${esc(post.review)}</p>
        <p class="muted">
          ${post.live ? "Published version remains visible." : "Not publicly visible yet."}
          ${post.closed ? " Applications closed." : ""}
        </p>
        ${post.reason ? `<p class="warning">${esc(post.reason)}</p>` : ""}
        <div class="stack">
          ${post.live ? button("View live listing", "post", post.id) : ""}
          ${post.review === "pending"
            ? '<p class="muted">Awaiting platform review.</p>'
            : !post.live || post.access === "approved"
              ? button(post.draft ? "Continue editing draft" : "Edit internship information",
                "edit-listing", post.id)
              : post.access === "requested"
                ? '<p class="muted">Edit-access request is pending.</p>'
                : button("Request edit access", "request-edit", post.id)}
          ${post.draft && post.review !== "pending" &&
            (!post.live || post.access === "approved")
            ? button("Submit draft for review", "submit-listing", post.id) : ""}
          ${post.live ? button(
            post.closed ? "Reopen applications" : "Close applications",
            "toggle-listing", post.id
          ) : ""}
        </div>
      </article>`;
    }).join("") || '<p class="empty">No listings yet.</p>'}

    <h2>Private internship inquiries</h2>
    ${chats.length
      ? chats.map(chatRow).join("")
      : '<p class="empty">No inquiries yet. Send one from a participant account.</p>'}`;
}

function listingPage() {
  if (!provider()) return deniedPage();
  const post = route.id ? getPost(route.id) : null;
  if (post && (
    post.owner !== currentUserId ||
    post.review === "pending" ||
    (post.live && post.access !== "approved")
  )) return deniedPage();

  const data = post?.draft ?? post?.live ?? {
    title: "", company: me().org, job: "", duration: 6,
    location: "Hong Kong", pay: "", deadline: "", body: "", requirements: ""
  };

  return `${heading(post ? "Edit internship" : "New internship listing")}
    <form data-form="listing" data-id="${esc(post?.id ?? "")}" data-dirty>
      ${field("Company", "company", me().org, "text", true, "readonly")}
      ${field("Listing title", "title", data.title)}
      ${field("Job title", "job", data.job)}
      ${field("Duration (weeks)", "duration", data.duration, "number", true, 'min="1" max="104" step="1"')}
      ${field("Location / working arrangement", "location", data.location)}
      ${field("Pay / allowance", "pay", data.pay, "text", false)}
      ${field("Application deadline", "deadline", data.deadline, "date", false)}
      ${area("Job description", "body", data.body)}
      ${area("Requirements", "requirements", data.requirements, false)}
      <div class="row">
        <button name="decision" value="draft" class="secondary">Save draft</button>
        <button name="decision" value="submit">Submit for review</button>
      </div>
    </form>`;
}

function simulatorPage() {
  const access = db.posts.filter((post) =>
    post.type === "official" && post.access === "requested"
  );
  const pending = db.posts.filter((post) =>
    post.type === "official" && post.review === "pending"
  );

  return `${heading("Platform review simulator")}
    <div class="simulator-banner">
      <strong>Presenter-only demo screen</strong>
      <p>
        These buttons simulate the platform’s decision.
        Employers must not have these permissions in a real system.
      </p>
    </div>

    <h2>Edit-access requests</h2>
    ${access.map((post) => `
      <article class="card">
        <h3>${esc(post.live.title)}</h3>
        <p>${esc(getUser(post.owner)?.org)}</p>
        <div class="row">
          ${button("Approve edit access", "access-approve", post.id)}
          ${button("Reject request", "access-reject", post.id, "danger")}
        </div>
      </article>
    `).join("") || '<p class="empty">No edit-access requests.</p>'}

    <h2>Listing submissions</h2>
    ${pending.map((post) => `
      <article class="card">
        <h3>${esc(post.draft.title)}</h3>
        ${post.live ? `
          <details>
            <summary>Currently published version</summary>
            ${listingPreview(post.live)}
          </details>
        ` : '<p class="muted">New listing—not published yet.</p>'}
        <h3>Submitted version</h3>
        ${listingPreview(post.draft)}
        <form data-form="review-decision" data-id="${esc(post.id)}">
          ${area("Reason / reviewer feedback (used if rejected)", "reason",
            "Please clarify the internship responsibilities.", false, 1000)}
          <div class="row">
            <button name="decision" value="approve">Approve & publish</button>
            <button name="decision" value="reject" class="danger">Reject update</button>
          </div>
        </form>
      </article>
    `).join("") || '<p class="empty">No submissions awaiting review.</p>'}`;
}

function listingPreview(data) {
  return `<dl class="meta">
    <dt>Title</dt><dd>${esc(data.title)}</dd>
    <dt>Role</dt><dd>${esc(data.job)}</dd>
    <dt>Company</dt><dd>${esc(data.company)}</dd>
    <dt>Duration</dt><dd>${esc(data.duration)} weeks</dd>
    <dt>Location</dt><dd>${esc(data.location)}</dd>
    <dt>Pay</dt><dd>${esc(data.pay || "Not specified")}</dd>
    <dt>Deadline</dt><dd>${esc(data.deadline || "Not specified")}</dd>
  </dl>
  <p class="preserve">${esc(data.body)}</p>
  <p class="preserve">${esc(data.requirements)}</p>`;
}

/* ---------------------- Private messages ---------------------- */

async function openChat(other, context = "direct", label = "Direct message", sender = currentUserId) {
  if (!me() || actorOwner(other) === currentUserId) return;
  if (!await mayLeave()) return;

  let chat = db.chats.find((item) =>
    item.context === context &&
    item.participants.includes(sender) &&
    item.participants.includes(other)
  );

  if (!chat) {
    chat = {
      id: uid(), participants: [sender, other], context, label,
      resolved: false, messages: [], created: timestamp()
    };
    db.chats.unshift(chat);
    persist();
  }

  dirty = false;
  await go("chat", { id: chat.id });
}

function myChatActor(chat) {
  return chat.participants.find((person) => actorOwner(person) === currentUserId);
}

function chatRow(chat) {
  const mine = myChatActor(chat);
  const other = chat.participants.find((person) => person !== mine);
  const last = chat.messages.at(-1);

  return `<article class="card">
    <div class="row">
      <div class="avatar" aria-hidden="true">${esc(initials(actorName(other)))}</div>
      <div class="grow">
        <h2>${esc(actorName(other))}</h2>
        <p class="muted">${esc(chat.label)}${chat.resolved ? " · Resolved" : ""}</p>
      </div>
    </div>
    <p class="preserve">${esc(last?.text.slice(0, 100) || "No messages yet.")}</p>
    ${button("Open conversation", "chat", chat.id)}
  </article>`;
}

function messagesPage() {
  const chats = db.chats.filter((chat) => myChatActor(chat));
  return `${heading("Messages", "Private conversations in this browser simulation.", false)}
    ${chats.length ? chats.map(chatRow).join("")
      : '<p class="empty">No conversations yet. Open a post or author profile to send a message.</p>'}`;
}

function chatPage() {
  const chat = getChat(route.id);
  const mine = chat && myChatActor(chat);
  if (!mine) return deniedPage();
  const other = chat.participants.find((person) => person !== mine);

  return `${heading(actorName(other), chat.label)}
    ${mine.startsWith("anon:")
      ? `<p class="badge">Sending as ${esc(actorName(mine))}</p>` : ""}
    <p class="muted">
      Switch classroom accounts to demonstrate replies.
      Messages are not sent to a real person.
    </p>
    <div class="row">
      <span class="badge">${chat.resolved ? "Resolved" : "Open conversation"}</span>
      ${button(chat.resolved ? "Reopen conversation" : "Mark as resolved",
        "resolve-chat", chat.id)}
    </div>

    <div id="chatStream" class="chat-stream" role="log" aria-label="Conversation">
      ${chat.messages.length ? chat.messages.map((message) => `
        <div class="chat-bubble ${message.sender === mine ? "mine" : ""}">
          <small>${esc(actorName(message.sender))}</small>
          <p>${esc(message.text)}</p>
          <small>${esc(dateLabel(message.created))}</small>
        </div>
      `).join("") : '<p class="muted">Start a conversation.</p>'}
    </div>

    ${chat.resolved
      ? '<p class="muted">Reopen the conversation to ask a follow-up question.</p>'
      : `<form data-form="message" class="chat-composer" data-dirty>
          ${area("Your message", "text", "", true, 2000)}
          <button class="wide">Send message</button>
        </form>`}`;
}

function notificationsPage() {
  const notices = db.notifications.filter((item) => item.to === currentUserId);
  return `${heading("Notifications", "In-app demo updates only.")}
    ${button("Mark all as read", "read-all")}
    ${notices.map((item) => `
      <article class="card ${item.read ? "" : "unread"}">
        <p>${esc(item.text)}</p>
        <p class="muted">${esc(dateLabel(item.created))}</p>
        ${button("Open", "notification", item.id)}
      </article>
    `).join("") || '<p class="empty">You’re all caught up.</p>'}`;
}

/* ---------------------- Rendering and navigation ---------------------- */

function missingPage() {
  return `${heading("Content unavailable")}
    <p>This item is missing or has not been published.</p>`;
}

function deniedPage() {
  return `${heading("Not available for this account")}
    <p>Use the appropriate classroom account and follow the approval steps first.</p>`;
}

const pages = {
  welcome: welcomePage,
  account: accountPage,
  login: loginPage,
  signup: signupPage,
  verify: verifyPage,
  home: homePage,
  create: createPage,
  proof: proofPage,
  experience: experiencePage,
  post: postPage,
  forum: forumPage,
  "forum-compose": forumComposePage,
  "forum-detail": forumDetailPage,
  profile: profilePage,
  "edit-profile": editProfilePage,
  workspace: workspacePage,
  listing: listingPage,
  simulator: simulatorPage,
  messages: messagesPage,
  chat: chatPage,
  notifications: notificationsPage,
  saved: () => `${heading("Saved posts")}
    ${postGrid(db.posts.filter((post) =>
      post.live && (db.saved[currentUserId] ?? []).includes(post.id)
    ))}`
};

function render() {
  const publicPages = ["welcome", "account", "login", "signup", "simulator"];

  if (!me() && !publicPages.includes(route.name)) {
    route = { name: "account" };
  }

  if (me() && !me().verified && ![
    ...publicPages, "verify"
  ].includes(route.name)) {
    route = { name: "verify" };
  }

  const authenticated = Boolean(me()?.verified);
  const entering = ["welcome", "account", "login", "signup", "verify"].includes(route.name);

  $("appMenu").hidden = !authenticated || entering;
  $("notificationButton").hidden = !authenticated || entering;
  $("roleBadge").textContent = route.name === "simulator"
    ? "SIMULATOR"
    : !authenticated || entering ? "DEMO" : provider() ? "PROVIDER" : "PARTICIPANT";

  const unread = db.notifications.filter((item) =>
    item.to === currentUserId && !item.read
  ).length;

  $("notificationCount").textContent = unread;
  $("notificationButton").setAttribute("aria-label", `${unread} unread notifications`);

  const tab = route.name.startsWith("forum")
    ? "forum"
    : ["messages", "chat"].includes(route.name)
      ? "messages"
      : ["profile", "edit-profile", "saved", "workspace", "listing"].includes(route.name)
        ? "profile" : "home";

  document.querySelectorAll('[data-action="tab"]').forEach((element) => {
    if (element.dataset.id === tab) element.setAttribute("aria-current", "page");
    else element.removeAttribute("aria-current");
  });

  document.querySelectorAll('aside [data-action="demo"]').forEach((element) => {
    element.setAttribute("aria-pressed", element.dataset.id === currentUserId);
  });
  document.querySelector('aside [data-action="entry"]')
    .setAttribute("aria-pressed", !currentUserId);

  $("screen").innerHTML = (pages[route.name] ?? missingPage)();
  $("screen").scrollTop = 0;
  $("screen").focus({ preventScroll: true });
}

function validListing(data) {
  return Boolean(
    data.title && data.job && data.company && data.location && data.body &&
    Number.isInteger(data.duration) && data.duration >= 1 && data.duration <= 104
  );
}

function queueListing(post) {
  if (!post.draft || !validListing(post.draft)) {
    tell("Complete the required listing fields before submitting.");
    return false;
  }
  post.review = "pending";
  post.reason = "";
  return true;
}

/* ---------------------- Click actions ---------------------- */

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "back") return back();
  if (action === "entry") return enter();
  if (action === "demo") return enter(id);
  if (action === "simulator") return go("simulator");

  if (action === "reset") {
    if (!await ask(
      "Clear all version-2 demo accounts, posts, drafts, conversations and activity, then restore the sample data?",
      "Reset demo"
    )) return;

    db = seed();
    currentUserId = null;
    navigation = [];
    route = { name: "welcome" };
    dirty = false;
    Object.assign(filters, {
      type: "experience", query: "", company: "", duration: "",
      sameSchool: false, sameMajor: false
    });
    persist();
    render();
    tell("Demo reset.");
    return;
  }

  if (action === "logout") {
    if (!await mayLeave()) return;
    dirty = false;
    currentUserId = null;
    navigation = [];
    route = { name: "welcome" };
    render();
    return;
  }

  const publicDestinations = {
    account: "account", login: "login", signup: "signup"
  };

  if (publicDestinations[action]) {
    return go(publicDestinations[action]);
  }

  // The simulator is a deliberate classroom-only permission bypass.
  if (["access-approve", "access-reject"].includes(action)) {
    if (route.name !== "simulator") return;
    const post = getPost(id);
    if (!post || post.access !== "requested") return;
    const approved = action === "access-approve";
    post.access = approved ? "approved" : "none";
    post.reason = approved ? "" : "Edit-access request rejected. You can request access again.";
    notify(post.owner,
      approved ? "Edit access approved." : "Edit-access request rejected.",
      { name: "workspace" });
    persist();
    render();
    tell(approved ? "Edit access approved by the simulated platform." : "Edit-access request rejected.");
    return;
  }

  if (!me()?.verified) return go("account");

  const destinations = {
    create: "create",
    "forum-compose": "forum-compose",
    "edit-profile": "edit-profile",
    workspace: "workspace",
    notifications: "notifications",
    saved: "saved"
  };

  if (destinations[action]) return go(destinations[action]);
  if (action === "tab") return go(id, {}, true);
  if (action === "post") return go("post", { id });
  if (action === "forum-detail") return go("forum-detail", { id });
  if (action === "author") return go("profile", { actor: id });
  if (action === "chat") return go("chat", { id });

  if (action === "feed" || action === "clear-filters") {
    Object.assign(filters, {
      type: action === "feed" ? id : filters.type,
      query: "", company: "", duration: "",
      sameSchool: false, sameMajor: false
    });
    render();
    return;
  }

  if (action === "proof") {
    if (provider()) return tell("Verified experience reviews are for participant accounts.");
    return go("proof", { source: id || undefined });
  }

  if (action === "new-listing") {
    if (!provider()) return;
    return go("listing");
  }

  if (action === "edit-listing") {
    if (!provider()) return;
    return go("listing", { id });
  }

  if (action === "request-edit") {
    const post = getPost(id);
    if (!post || post.owner !== currentUserId || !provider() ||
        !post.live || post.review === "pending") return;
    post.access = "requested";
    post.reason = "";
    persist();
    render();
    tell("Request sent. Use the Platform review simulator outside the phone.");
    return;
  }

  if (action === "submit-listing") {
    const post = getPost(id);
    if (!post || post.owner !== currentUserId || !provider() ||
        post.review === "pending" ||
        (post.live && post.access !== "approved")) return;
    if (!queueListing(post)) return;
    persist();
    render();
    tell("Submitted. Use the classroom platform simulator to approve or reject.");
    return;
  }

  if (action === "toggle-listing") {
    const post = getPost(id);
    if (!post?.live || post.owner !== currentUserId || !provider()) return;
    if (!await ask(
      post.closed ? "Reopen applications for this listing?" : "Mark this listing as closed to applications?",
      post.closed ? "Reopen" : "Close applications"
    )) return;
    post.closed = !post.closed;
    persist();
    render();
    return;
  }

  if (action === "save-post") {
    const saved = db.saved[currentUserId] ?? [];
    db.saved[currentUserId] = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    persist();
    // Do not rebuild a page containing an unfinished question.
    target.textContent = db.saved[currentUserId].includes(id) ? "✓ Saved" : "Save";
    return;
  }

  if (action === "like-post" || action === "like-forum") {
    const item = action === "like-post" ? getPost(id) : getForum(id);
    if (!item) return;
    item.likes = item.likes.includes(currentUserId)
      ? item.likes.filter((value) => value !== currentUserId)
      : [...item.likes, currentUserId];
    persist();
    target.textContent = action === "like-post"
      ? `${item.likes.includes(currentUserId) ? "♥" : "♡"} Helpful (${item.likes.length})`
      : `${item.likes.includes(currentUserId) ? "♥" : "♡"} ${item.likes.length} likes`;
    return;
  }

  if (action === "post-message") {
    const post = getPost(id);
    if (!post?.live) return;
    return openChat(
      actor(post.owner, post.anonymous),
      post.type === "official" ? `listing:${post.id}` : `post:${post.id}`,
      `${post.live.company} · ${post.live.job}`
    );
  }

  if (action === "message-actor") {
    let sender = currentUserId;
    if (id.startsWith("anon:")) {
      const useAlias = await ask(
        "Send using your anonymous demo alias? Cancel sends using your public profile.",
        "Use anonymous alias"
      );
      if (useAlias) sender = actor(currentUserId, true);
    }
    return openChat(id, "direct", "Direct message", sender);
  }

  if (action === "resolve-chat") {
    const chat = getChat(id);
    if (!chat || !myChatActor(chat)) return;
    if (!await mayLeave()) return;
    chat.resolved = !chat.resolved;
    for (const participant of chat.participants) {
      notify(actorOwner(participant),
        chat.resolved ? "A conversation was marked resolved." : "A conversation was reopened.",
        { name: "chat", id });
    }
    dirty = false;
    persist();
    render();
    return;
  }

  if (action === "resolve-question") {
    const post = getPost(route.id);
    const question = post?.questions.find((item) => item.id === id);
    if (!question || question.owner !== currentUserId) return;
    if (!await mayLeave()) return;
    question.resolved = !question.resolved;
    dirty = false;
    persist();
    render();
    return;
  }

  if (action === "read-all") {
    db.notifications.forEach((item) => {
      if (item.to === currentUserId) item.read = true;
    });
    persist();
    render();
    return;
  }

  if (action === "notification") {
    const item = db.notifications.find((notice) =>
      notice.id === id && notice.to === currentUserId
    );
    if (!item) return;
    item.read = true;
    persist();
    return go(item.target.name, item.target);
  }
});

/* ---------------------- Form handling ---------------------- */

document.addEventListener("input", (event) => {
  if (event.target.closest("form[data-dirty]")) dirty = true;
});

document.addEventListener("change", (event) => {
  if (event.target.closest("form[data-dirty]")) dirty = true;
});

window.addEventListener("beforeunload", (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  const type = form.dataset.form;
  if (!type) return; // Leave the native confirmation dialog alone.
  event.preventDefault();

  const data = new FormData(form);
  const text = (key) => String(data.get(key) ?? "").trim();
  const checked = (key) => data.has(key);
  const decision = event.submitter?.value;
  const fail = (message) => tell(message);

  if (type === "login") {
    const user = db.users.find((person) =>
      person.username.toLowerCase() === text("username").toLowerCase()
    );
    if (!user || text("password") !== "cruise") {
      return fail("Log in failed. Check the username and use the demo password: cruise.");
    }
    currentUserId = user.id;
    navigation = [];
    dirty = false;
    route = { name: user.verified ? "home" : "verify" };
    form.reset();
    render();
    return;
  }

  if (type === "signup") {
    const username = text("username");
    if (!username || !text("name") || !text("org")) {
      return fail("Complete the username, name and school/company fields.");
    }
    if (text("password") !== "cruise") {
      return fail("This simulation uses the public password cruise for every account.");
    }
    if (db.users.some((user) =>
      user.username.toLowerCase() === username.toLowerCase()
    )) return fail("That account already exists. Go back and log in.");

    const identity = text("identity");
    db.users.push({
      id: uid(), username, name: text("name"), identity,
      kind: identity === "Company employee" ? "provider" : "participant",
      verified: false, org: text("org"), major: "", location: "",
      headline: "", bio: "", interests: "",
      alias: `Anonymous ${101 + db.users.length}`
    });
    persist();
    dirty = false;
    form.reset();
    await go("login", { username }, true);
    tell("Account created. Log in to continue to sample identity verification.");
    return;
  }

  if (type === "verify") {
    if (!me()) return;
    if (text("proof") !== "valid") {
      return fail("Verification failed. Select a valid sample document and try again.");
    }
    me().verified = true;
    persist();
    dirty = false;
    await go("profile", {}, true);
    tell("Sample identity verification passed.");
    return;
  }

  if (type === "review-decision") {
    if (route.name !== "simulator") return;
    const post = getPost(form.dataset.id);
    if (!post?.draft || post.review !== "pending") return;

    if (decision === "approve") {
      post.live = clone(post.draft);
      post.draft = null;
      post.review = "live";
      post.access = "none";
      post.reason = "";
      notify(post.owner, "Your internship listing was approved and published.",
        { name: "workspace" });
    } else if (decision === "reject") {
      post.review = "rejected";
      post.access = post.live ? "none" : "approved";
      post.reason = text("reason") || "Please revise and resubmit.";
      notify(post.owner, `Listing update rejected: ${post.reason}`,
        { name: "workspace" });
    } else return;

    persist();
    dirty = false;
    render();
    tell(decision === "approve"
      ? "Published. The updated version is now visible in Official Posts."
      : "Rejected. The submitted draft is retained; the published version is unchanged.");
    return;
  }

  if (!me()?.verified) return fail("Choose or verify a demo account first.");

  if (type === "filters") {
    Object.assign(filters, {
      query: text("query"), company: text("company"),
      duration: text("duration"),
      sameSchool: checked("sameSchool"), sameMajor: checked("sameMajor")
    });
    render();
    return;
  }

  if (type === "edit-profile") {
    if (!text("name")) return fail("Add a display name.");
    Object.assign(me(), {
      name: text("name"), headline: text("headline"),
      major: text("major"), location: text("location"),
      interests: text("interests"), bio: text("bio")
    });
    persist();
    dirty = false;
    await back();
    tell("Profile updated.");
    return;
  }

  if (type === "proof") {
    if (provider()) return;
    if (text("proof") !== "valid") {
      return fail("Certificate verification failed. Choose a valid sample and retry.");
    }
    const source = getPost(text("source"));
    if (!source?.live || source.type !== "official") {
      return fail("Select a published internship.");
    }
    me().experiences ??= [];

   let experience = me().experiences.find(item => item.source === source.id);

   const verifiedDetails = {
     source: source.id,
     verified: true,
     position: source.live.job,
     employer: source.live.company,
     time: `Sample internship · ${source.live.duration} weeks`,
     description: "Sample verified internship experience. You can edit these details in the profile page."
   };

   if (experience) {
     Object.assign(experience, verifiedDetails);
   } else {
     me().experiences.push({
       id: uid(),
       ...verifiedDetails
     });
   }

   persist();
   dirty = false;
   return go("experience", { source: source.id, proofPassed: true });
  }

  if (type === "experience") {
    if (provider() || !route.proofPassed) return;
    const source = getPost(route.source);
    const duration = Number(text("duration"));
    if (!source?.live || !text("title") ||
        !Number.isInteger(duration) || duration < 1 || duration > 104) {
      return fail("Add a title and a duration from 1 to 104 weeks.");
    }
    if (text("moderation") === "fail") {
      return fail("Simulated moderation rejection: the post was not published. Revise it and switch the classroom result to Pass.");
    }

    const post = {
      id: uid(), type: "experience", source: source.id,
      owner: currentUserId, anonymous: checked("anonymous"),
      certificate: true, likes: [], questions: [], created: timestamp(),
      live: {
        title: text("title"), company: source.live.company,
        job: source.live.job, duration, body: text("body"),
        school: me().org, major: me().major,
        ratings: {
          learning: Number(text("learning")),
          mentorship: Number(text("mentorship")),
          workload: Number(text("workload"))
        },
        treatment: {
          paid: text("paid"), transport: text("transport"),
          overtime: text("overtime")
        }
      }
    };
    db.posts.unshift(post);
    persist();
    dirty = false;
    filters.type = "experience";
    await go("post", { id: post.id }, true);
    tell("Experience published. Certificate and moderation checks were simulated.");
    return;
  }

  if (type === "question") {
    const post = getPost(route.id);
    if (!post?.live || !text("text")) return fail("Write a question first.");
    post.questions.push({
      id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
      text: text("text"), replies: [], resolved: false, created: timestamp()
    });
    notify(post.owner, "Someone asked a question under your post.",
      { name: "post", id: post.id });
    persist();
    dirty = false;
    render();
    tell("Question posted.");
    return;
  }

  if (type === "question-reply") {
    const post = getPost(route.id);
    const question = post?.questions.find((item) => item.id === form.dataset.id);
    if (!question || question.resolved || !text("text")) {
      return fail("Write a reply to an open question.");
    }
    question.replies.push({
      id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
      text: text("text"), created: timestamp()
    });
    for (const owner of new Set([question.owner, post.owner])) {
      notify(owner, "A question received a new reply.", { name: "post", id: post.id });
    }
    persist();
    dirty = false;
    render();
    tell("Reply posted.");
    return;
  }

  if (type === "forum-compose") {
    if (!text("title") || !text("body")) return fail("Add a title and post content.");
    if (text("moderation") === "fail") {
      return fail("Simulated moderation rejection. Your draft remains here so you can revise it.");
    }
    const post = {
      id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
      title: text("title"), body: text("body"), likes: [],
      replies: [], created: timestamp()
    };
    db.forums.unshift(post);
    persist();
    dirty = false;
    await go("forum-detail", { id: post.id }, true);
    tell("Forum post published.");
    return;
  }

  if (type === "forum-reply") {
    const post = getForum(route.id);
    if (!post || !text("text")) return fail("Write a comment first.");
    post.replies.push({
      id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
      text: text("text"), created: timestamp()
    });
    notify(post.owner, "Your forum post received a reply.",
      { name: "forum-detail", id: post.id });
    persist();
    dirty = false;
    render();
    tell("Comment posted.");
    return;
  }

  if (type === "listing") {
    if (!provider()) return;
    let post = form.dataset.id ? getPost(form.dataset.id) : null;
    if (post && (
      post.owner !== currentUserId || post.review === "pending" ||
      (post.live && post.access !== "approved")
    )) return fail("Edit access is not available.");

    const draft = {
      title: text("title"), company: me().org, job: text("job"),
      duration: Number(text("duration")), location: text("location"),
      pay: text("pay"), deadline: text("deadline"),
      body: text("body"), requirements: text("requirements")
    };

    if (!validListing(draft)) {
      return fail("Complete the required fields and enter a duration from 1 to 104 weeks.");
    }

    if (!post) {
      post = {
        id: uid(), type: "official", owner: currentUserId,
        anonymous: false, live: null, draft: null,
        review: "draft", access: "approved", reason: "",
        closed: false, likes: [], questions: [], created: timestamp()
      };
      db.posts.unshift(post);
    }

    post.draft = draft;
    post.review = "draft";
    post.reason = "";

    if (decision === "submit") queueListing(post);

    persist();
    dirty = false;
    await go("workspace", {}, true);
    tell(decision === "submit"
      ? "Submitted for platform review. Use the simulator outside the phone."
      : "Draft saved. It is not public until approved.");
    return;
  }

  if (type === "message") {
    const chat = getChat(route.id);
    const sender = chat && myChatActor(chat);
    if (!sender || chat.resolved || !text("text")) {
      return fail("Write a message in an open conversation.");
    }
    chat.messages.push({
      id: uid(), sender, text: text("text"), created: timestamp()
    });

    const other = chat.participants.find((person) => person !== sender);
    notify(actorOwner(other), `New message from ${actorName(sender)}.`,
      { name: "chat", id: chat.id });

    // Move recently active conversations to the top.
    db.chats = [chat, ...db.chats.filter((item) => item.id !== chat.id)];

    persist();
    dirty = false;
    render();
    $("screen").scrollTop = $("screen").scrollHeight;
    return;
  }
});

render();
