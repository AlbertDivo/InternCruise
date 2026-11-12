"use strict";

{
  /* This file extends the previous InternCruise app.js.
     All credentials, documents, AI results and moderation are simulations. */

  const ICONS = {
    ship: `<path d="M3 13l3 6h12l3-6-9-3-9 3Z"/>
      <path d="M7 11V6h10v5M10 6V3h4v3M2 22q2-2 4 0t4 0t4 0t4 0t4 0"/>
      <path d="M12 10v8M9 8h1m4 0h1"/>`,
    me: `<circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="9" r="3"/>
      <path d="M5.5 19c.8-5 12.2-5 13 0"/>`,
    mail: `<rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="m3 6 9 7 9-7"/>`,
    posts: `<path d="M4 3h11v18H4zM7 7h5M7 11h4M7 15h3"/>
      <path d="m12 18 9-14 1 6-7 7-3 1Zm0 0-1 3"/>`,
    jobs: `<rect x="2" y="6" width="17" height="13" rx="2"/>
      <path d="M7 6V3h7v3M2 11h16"/>
      <path d="m13 18 5-3 5 3-5 3-5-3Zm3 2v2h4v-2M23 18v4"/>`,
    forum: `<path d="M3 3h14v10H9l-5 4v-4H3z"/>
      <path d="M17 7h4v12h-4l-4 3v-3H9v-3"/>`,
    home: `<path d="m2 11 10-9 10 9M5 9v12h14V9M9 21v-8h6v8"/>`,
    star: `<path d="m12 2 3 6.5 7 .9-5 5 1.2 7L12 18l-6.2 3.4L7 14.4l-5-5 7-.9Z"/>`,
    warning: `<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/>`,
    filter: `<path d="M2 4h20l-8 9v7l-4 2v-9Z"/>`,
    pen: `<path d="m4 16 12-12 4 4L8 20H4v-4ZM14 6l4 4"/>`,
    pin: `<path d="M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13Z"/>
      <circle cx="12" cy="9" r="2.5"/>`,
    computer: `<rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>`,
    calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M7 2v6M17 2v6M3 10h18"/>`,
    clock: `<circle cx="12" cy="13" r="9"/><path d="M12 8v5l3 2M9 1h6"/>`
  };

  function icon(name) {
    return `<svg class="ic-icon" viewBox="0 0 24 24" aria-hidden="true">
      ${ICONS[name] || ICONS.ship}
    </svg>`;
  }

  function xb(label, action, id = "", classes = "secondary", extra = "") {
    return `<button type="button" class="${esc(classes)}"
      data-action="x-${esc(action)}" data-id="${esc(id)}" ${extra}>${label}</button>`;
  }

  function selfNotice(text, target = { name: "inbox" }) {
    db.notifications.unshift({
      id: uid(), to: currentUserId, text, target,
      read: false, created: timestamp()
    });
  }

  function list(value) {
    return Array.isArray(value) ? value :
      String(value || "").split(",").map(v => v.trim()).filter(Boolean);
  }

  const TREATMENTS = [
    "Transport subsidy",
    "Accommodation support",
    "Two-day weekend",
    "Mentorship"
  ];

  const ASPECTS = ["Working environment", "Mentorship", "Learning opportunities"];

  function migrate() {
    db.favorites ??= {};
    db.wishlists ??= {};
    db.comparisons ??= {};
    db.reports ??= [];

    for (const user of db.users) {
      const parts = user.name.split(/\s+/);
      user.firstName ??= parts.shift() || "";
      user.lastName ??= parts.join(" ");
      user.preferredName ??= "";
      user.degree ??= "Undergraduate";
      user.year ??= "3";
      user.graduation ??= "2027";
      user.skills = list(user.skills || (
        user.id === "u-sharer" ? ["UX research", "Figma", "Communication"] :
        ["Communication", "Excel", "Teamwork"]
      ));
      user.interests = list(user.interests);
      user.strengths ??= ["Communication", "Structured thinking"];
      user.experiences ??= [];
    }

    for (const post of db.posts) {
      if (post.type !== "official" || !post.live) continue;
      prepareJob(post);
    }

    if (!db.expandedSamples) {
      db.expandedSamples = true;

      const extraUsers = [
        {
          id: "u-maya", username: "maya", name: "Maya Ng",
          kind: "participant", identity: "Alumni", verified: true,
          org: "HKU", major: "Business", location: "Hong Kong",
          headline: "Marketing graduate · Former creative intern",
          bio: "Happy to share what I learned during my internship.",
          interests: ["Marketing", "Writing"], alias: "Anonymous 105"
        },
        {
          id: "u-ryan", username: "ryan", name: "Ryan Ho",
          kind: "participant", identity: "Student", verified: true,
          org: "CUHK", major: "Computer Science", location: "Hong Kong",
          headline: "Student interested in data and software",
          bio: "Learning through projects and internships.",
          interests: ["Analytics", "Programming"], alias: "Anonymous 106"
        }
      ];

      for (const user of extraUsers) {
        if (!getUser(user.id)) db.users.push(user);
      }

      const examples = [
        {
          id: "fx-portfolio", owner: "u-sharer",
          title: "What should a first internship portfolio contain?",
          body: "Which university projects are worth including when I have no professional work?",
          tags: ["internship", "portfolio", "design"],
          likes: 18, views: 146, favorites: 11, resolved: true,
          replies: [
            ["u-maya", "Explain the problem, your decisions and what changed. Two well-explained projects can be enough.", null, false, 12],
            ["u-seeker", "Would a group project be suitable?", 0, false, 4],
            ["u-maya", "Yes—be clear about your own contribution.", 1, false, 9],
            ["u-sharer", "Include sketches and iterations, not just polished screenshots.", null, false, 8]
          ]
        },
        {
          id: "fx-sql", owner: "u-ryan",
          title: "How much SQL do data internships expect?",
          body: "Are joins and basic aggregation enough for an introductory analytics role?",
          tags: ["internship", "sql", "data"],
          likes: 13, views: 113, favorites: 7, resolved: false,
          replies: [
            ["u-sharer", "Check the description, but a small project showing joins, grouping and clear explanations is useful.", null, false, 7],
            ["u-ryan", "Thanks. I will add a short dashboard project too.", 0, false, 3]
          ]
        },
        {
          id: "fx-campus", owner: "u-maya",
          title: "Quiet places to prepare for interviews",
          body: "Any suggestions around campus for practising online interviews?",
          tags: ["campus", "interview", "internship"],
          likes: 9, views: 82, favorites: 6, resolved: true,
          replies: [
            ["u-seeker", "Try booking a small discussion room ahead of time.", null, false, 6],
            ["u-maya", "Good idea—remember to test the Wi-Fi and microphone.", 0, false, 4]
          ]
        },
        {
          id: "fx-anonymous", owner: "u-sharer", anonymous: true,
          title: "Questions I wish I had asked before accepting an internship",
          body: "Ask about supervision, expected working hours and what a successful internship looks like.",
          tags: ["internship", "mentorship", "interview"],
          likes: 25, views: 208, favorites: 16, resolved: false,
          replies: [
            ["u-maya", "Also ask how feedback is given and how often you can meet your supervisor.", null, true, 11],
            ["u-seeker", "Is it acceptable to ask about overtime in an interview?", 0, false, 5],
            ["u-maya", "Yes. Ask politely about the team's normal working arrangements.", 1, true, 10]
          ]
        }
      ];

      for (const example of examples) {
        const replyIds = example.replies.map(() => uid());
        db.forums.push({
          id: example.id, owner: example.owner,
          anonymous: Boolean(example.anonymous),
          title: example.title, body: example.body,
          tags: example.tags, resolved: example.resolved,
          likes: [], sampleLikes: example.likes,
          views: example.views, sampleFavorites: example.favorites,
          created: timestamp(),
          replies: example.replies.map((r, index) => ({
            id: replyIds[index], owner: r[0], text: r[1],
            parent: r[2] === null ? null : replyIds[r[2]],
            anonymous: r[3], likes: [], sampleLikes: r[4],
            views: 14 + index * 3, sampleFavorites: index + 1,
            created: timestamp()
          }))
        });
      }

      const source = getPost("p-harbour");
      if (source) {
        source.reviews.push(
          {
            id: uid(), owner: "u-sharer", anonymous: false,
            text: "Weekly feedback made it much easier to improve. I also had time to present my final project.",
            parent: null, likes: [], sampleLikes: 14, views: 81,
            sampleFavorites: 8,
            ratings: {
              "Working environment": 4,
              "Mentorship": 5,
              "Learning opportunities": 5
            },
            treatment: {
              "Transport subsidy": "No",
              "Accommodation support": "No",
              "Two-day weekend": "Yes",
              "Mentorship": "Yes"
            },
            created: timestamp()
          }
        );

        const root = source.reviews[0];
        source.reviews.push(
          {
            id: uid(), owner: "u-seeker", anonymous: false,
            text: "Did you work on a real product or a practice project?",
            parent: root.id, likes: [], sampleLikes: 3,
            views: 22, sampleFavorites: 1, created: timestamp()
          }
        );
        source.reviews.push({
          id: uid(), owner: "u-sharer", anonymous: false,
          text: "A real product, with my mentor reviewing the work before it went further.",
          parent: source.reviews[1].id, likes: [], sampleLikes: 6,
          views: 19, sampleFavorites: 2, created: timestamp()
        });

        const sharer = getUser("u-sharer");
        sharer.experiences.push({
          id: uid(), source: source.id, verified: true,
          position: source.live.job, employer: source.live.company,
          time: "June–July 2026",
          description: "Supported onboarding design and usability testing."
        });
      }
    }

    for (const user of db.users) {
      user.firstName ??= user.name.split(" ")[0];
      user.lastName ??= user.name.split(" ").slice(1).join(" ");
      user.preferredName ??= "";
      user.degree ??= "Undergraduate";
      user.year ??= "3";
      user.graduation ??= "2027";
      user.skills = list(user.skills || ["Communication", "Excel"]);
      user.interests = list(user.interests);
      user.strengths ??= ["Communication", "Structured thinking"];
      user.experiences ??= [];
    }

    for (const forum of db.forums) {
      forum.tags ??= suggestTags(forum.title + " " + forum.body);
      forum.views ??= 0;
      forum.resolved ??= false;
      forum.replies ??= [];
      prepareItems(forum.replies);
    }
  }

  function prepareItems(items) {
    for (const item of items) {
      item.likes ??= [];
      item.views ??= 0;
      item.parent ??= null;
    }
  }

  function prepareJob(post) {
    post.jobMeta ??= {
      arrangement: post.id === "p-orbit" ? "Hybrid" : "Offline",
      payMin: post.id === "p-orbit" ? 75 : 70,
      payMax: post.id === "p-orbit" ? 90 : 85,
      payUnit: "HKD/hour",
      fields: post.id === "p-orbit" ? ["Data Science", "Computer Science"] : ["Business", "Design"],
      skills: post.id === "p-orbit" ? ["SQL", "Excel"] : ["Communication", "Figma"],
      graduation: ["2026", "2027", "2028"],
      benefits: ["Practical project experience", "Regular feedback", "Professional communication"],
      treatments: {
        "Transport subsidy": "No",
        "Accommodation support": "No",
        "Two-day weekend": "Yes",
        "Mentorship": "Yes"
      },
      other: ["Summer", "Entry level"],
      histogram: {
        "Working environment": [1, 1, 2, 5, 12, 9],
        "Mentorship": [0, 1, 1, 3, 10, 15],
        "Learning opportunities": [0, 0, 2, 4, 9, 15]
      },
      votes: {
        "Transport subsidy": [3, 27],
        "Accommodation support": [1, 29],
        "Two-day weekend": [27, 3],
        "Mentorship": [29, 1]
      }
    };
    post.reviews ??= [];
    prepareItems(post.reviews);
    return post;
  }

  const favoriteKey = (kind, id) => `${kind}:${id}`;
  const myFavorites = () => db.favorites[currentUserId] ?? [];
  const isFavorite = (kind, id) => myFavorites().includes(favoriteKey(kind, id));

  function favoriteCount(kind, item) {
    const key = favoriteKey(kind, item.id);
    return (item.sampleFavorites || 0) +
      Object.values(db.favorites).filter(values => values.includes(key)).length;
  }

  const likesOf = item => (item.sampleLikes || 0) + (item.likes?.length || 0);

  function helpful(item) {
    return likesOf(item) >= 5;
  }

  function helpfulMark(item) {
    return helpful(item)
      ? `<span class="ic-helpful" title="Helpful: at least 5 likes in this demo"
          aria-label="Marked helpful">${icon("ship")}</span>` : "";
  }

  function engagement(item, kind) {
    return likesOf(item) * 3 + favoriteCount(kind, item) * 4 + (item.views || 0);
  }

  function rank(items, kind) {
    return [...items].sort((a, b) =>
      engagement(b, kind) - engagement(a, kind) ||
      String(b.created).localeCompare(String(a.created))
    );
  }

  function relatedPerson(owner, anonymous) {
    if (anonymous || owner === currentUserId) return false;
    const user = getUser(owner);
    if (!user || !me()) return false;
    return (
      user.identity === "Alumni" && user.org === me().org
    ) || (
      Boolean(user.major && me().major) && user.major === me().major
    );
  }

  function relatedForum(post) {
    return relatedPerson(post.owner, post.anonymous) ||
      post.replies.some(reply => relatedPerson(reply.owner, reply.anonymous));
  }

  function relatedComment(item) {
    return relatedPerson(item.owner, item.anonymous);
  }

  function avatar(user, className = "") {
    const name = user?.kind === "provider" ? user.org : user?.name || "Company";
    return user?.photo
      ? `<img class="ic-avatar ${className}" src="${esc(user.photo)}" alt="${esc(name)} profile picture">`
      : `<span class="ic-avatar ic-avatar-initials ${className}"
          aria-label="${esc(name)}">${esc(initials(name))}</span>`;
  }

  // All employers in this fictional sample are registered.
  // Real unregistered-company logos would need licensed image URLs.

  const originalRender = render;

  render = function () {
    migrate();
    originalRender();

    const tab = route.name.startsWith("forum") || route.name === "hashtag"
      ? "forum"
      : ["internships", "comparisons", "internship", "review", "internship-proof"].includes(route.name)
        ? "internships"
        : ["posts", "create", "experience", "post"].includes(route.name)
          ? "posts"
          : ["profile", "edit-profile", "favorites", "profile-item", "resume", "workspace", "listing"].includes(route.name)
            ? "profile" : "home";

    document.querySelectorAll('#appMenu [data-action="tab"]').forEach(element => {
      if (element.dataset.id === tab) element.setAttribute("aria-current", "page");
      else element.removeAttribute("aria-current");
    });

    $("notificationButton").dataset.action = "x-inbox";
    $("notificationButton").innerHTML = `${icon("mail")}<span id="notificationCount">${
      db.notifications.filter(n => n.to === currentUserId && !n.read).length
    }</span>`;

    document.querySelectorAll(".hero-art").forEach(el => {
      el.innerHTML = icon("ship");
    });
  };

  document.querySelector(".brand").innerHTML = `${icon("ship")} InternCruise`;
  document.querySelector(".app-header strong").innerHTML = `${icon("ship")} InternCruise`;

  $("appMenu").innerHTML = [
    ["posts", "Posts", "posts"],
    ["forum", "Forum", "forum"],
    ["home", "Home", "home"],
    ["internships", "Internships", "jobs"],
    ["profile", "Me", "me"]
  ].map(([id, label, image]) => `
    <button type="button" data-action="tab" data-id="${id}">
      ${icon(image)}${label}
    </button>
  `).join("");

  function redrawPreservingInputs() {
    const screen = $("screen");
    const scroll = screen.scrollTop;
    const oldDirty = dirty;
    const controls = [...screen.querySelectorAll("input, textarea, select")].map(el => ({
      name: el.name, form: el.form?.dataset.form,
      value: el.value, checked: el.checked, type: el.type
    }));
    render();
    for (const saved of controls) {
      const el = [...screen.querySelectorAll("input, textarea, select")].find(candidate =>
        candidate.name === saved.name && candidate.form?.dataset.form === saved.form
      );
      if (!el || saved.type === "file") continue;
      el.value = saved.value;
      el.checked = saved.checked;
    }
    dirty = oldDirty;
    screen.scrollTop = scroll;
  }

  const modal = document.createElement("dialog");
  modal.id = "expandedDialog";
  document.body.append(modal);

  function showModal(title, content, className = "") {
    modal.className = className;
    modal.setAttribute("aria-label", title);
    modal.innerHTML = `<div class="${className ? "" : "stack"}">
      ${className ? "" : `<div class="row between"><h2>${esc(title)}</h2>
        ${xb("×", "close-modal", "", "secondary", 'aria-label="Close dialog"')}</div>`}
      ${content}
    </div>`;
    if (!modal.open) modal.showModal();
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  pages.home = () => `${heading("Your next starting point", "", false)}
    <div class="hero-art">${icon("ship")}</div>
    <p>Explore opportunities, learn from other students and build your next step.</p>
    <section class="card">
      <h2>Internship information list</h2>
      <p>Browse opportunities, compare roles and keep a wishlist.</p>
      ${xb("Explore internships →", "navigate", "internships", "wide")}
    </section>
    <section class="card">
      <h2>Your community</h2>
      <p>Find experiences in Posts, or ask a question in Forum.</p>
      <div class="row">
        ${xb("Explore posts", "navigate", "posts")}
        ${xb("Visit Forum", "navigate", "forum")}
      </div>
    </section>`;

  // Preserve the previous feed, but move it to Posts.
  pages.posts = homePage;

  const oldMessagesPage = messagesPage;
  const oldNotificationsPage = notificationsPage;

  function inboxTabs() {
    return `<div class="row">
      ${xb("Messages", "navigate", "inbox")}
      ${xb("Notifications", "navigate", "updates")}
      ${xb("＋ Start chat", "navigate", "people")}
    </div>`;
  }

  pages.inbox = () => `${heading("Inbox")}${inboxTabs()}${oldMessagesPage()}`;
  pages.messages = pages.inbox;
  pages.updates = () => `${inboxTabs()}${oldNotificationsPage()}`;
  pages.notifications = pages.updates;

  pages.people = () => `${heading("Start a chat")}
    <p class="muted">Choose a demo user. Messages stay in this browser.</p>
    ${db.users.filter(user => user.verified && user.id !== currentUserId).map(user => `
      <article class="card">
        <div class="row">${avatar(user)}
          <div><strong>${esc(actorName(user.id))}</strong>
          <p class="muted">${esc(user.org)}</p></div>
        </div>
        ${xb("Message", "start-chat", user.id)}
      </article>
    `).join("")}`;
  let forumQuery = "";
  let replyingTo = null;
  let selectedTags = [];

  function suggestTags(text) {
    const lower = text.toLowerCase();
    const rules = [
      ["internship", /intern|work|career|job/],
      ["interview", /interview|prepare|question/],
      ["portfolio", /portfolio|project/],
      ["design", /design|ux|figma/],
      ["data", /data|analytic|dashboard/],
      ["sql", /sql|database/],
      ["campus", /campus|study|library|university/],
      ["mentorship", /mentor|feedback|supervis/],
      ["marketing", /market|content|campaign/]
    ];
    const tags = rules.filter(([, pattern]) => pattern.test(lower)).map(([tag]) => tag);
    return (tags.length ? tags : ["community", "advice"]).slice(0, 5);
  }

  function parseTags(value) {
    return [...new Set(String(value).toLowerCase()
      .split(/[\s,#]+/u).map(t => t.replace(/[^\p{L}\p{N}_-]/gu, ""))
      .filter(Boolean))].slice(0, 10);
  }

  function tagsMarkup(tags) {
    return (tags || []).map(tag => xb(`#${esc(tag)}`, "tag", tag, "ic-chip")).join("");
  }

  function statusMarkup(resolved) {
    return resolved
      ? '<span class="ic-resolved">ⓥ Resolved</span>'.replace("ⓥ", "☑")
      : '<span class="ic-unresolved">◌ Unresolved</span>';
  }

  function engagementActions(item, kind, parent = "") {
    return `<div class="ic-actions">
      ${xb(`${item.likes?.includes(currentUserId) ? "♥" : "♡"} ${likesOf(item)}`,
        "like", `${kind}|${parent}|${item.id}`)}
      <span class="muted">◉ ${item.views || 0}</span>
      ${xb(`${isFavorite(kind, item.id) ? "★" : "☆"} ${favoriteCount(kind, item)}`,
        "favorite", `${kind}|${parent}|${item.id}`, "secondary",
        `aria-label="Favorite" aria-pressed="${isFavorite(kind, item.id)}"`)}
      ${xb(`${icon("warning")} Report`, "report", `${kind}|${parent}|${item.id}`)}
    </div>`;
  }

  function expandedForumCard(post) {
    return `<article class="card">
      <h2>${helpfulMark(post)}${esc(post.title)}</h2>
      <p class="preserve">${esc(post.body.slice(0, 180))}${post.body.length > 180 ? "…" : ""}</p>
      ${statusMarkup(post.resolved)}
      <p class="muted">${esc(authorName(post))}</p>
      <div class="ic-meta">
        <span>${post.replies.length} replies</span>
        <span>${likesOf(post)} Likes</span>
        <span>${post.views || 0} Views</span>
        <span>${favoriteCount("forum", post)} Favorites</span>
      </div>
      <div>${tagsMarkup(post.tags)}</div>
      ${engagementActions(post, "forum")}
      ${xb("Open discussion →", "forum-open", post.id)}
    </article>`;
  }

  function forumResults(posts) {
    const ordered = rank(posts, "forum");
    const recommended = ordered.filter(relatedForum);
    const others = ordered.filter(post => !relatedForum(post));

    return `<section class="ic-recommendation">
      <h2>Recommended for you</h2>
      <p class="ic-subtle">
        Posted or answered publicly by your school’s alumni or people in your major.
        Anonymous identities are not used for matching.
      </p>
      ${recommended.length ? recommended.map(expandedForumCard).join("")
        : '<p class="muted">No matching recommendations yet.</p>'}
    </section>
    <h2>All other discussions</h2>
    ${others.length ? others.map(expandedForumCard).join("")
      : '<p class="muted">No other matching discussions.</p>'}
    <p class="ic-subtle">
      Within each section: score = 3 × likes + 4 × favorites + views.
      Seeded counts are fictional demonstration data.
    </p>`;
  }

  pages.forum = () => {
    const q = forumQuery.trim().toLowerCase();
    const matched = db.forums.filter(post => !q || (
      q.startsWith("#")
        ? (post.tags || []).some(tag => tag.includes(q.slice(1)))
        : `${post.title} ${post.body} ${(post.tags || []).join(" ")}`
          .toLowerCase().includes(q)
    ));

    return `${heading("Forum", "Ask, share and learn together.", false)}
      <form data-form="x-forum-search">
        ${field("Search discussions or #hashtags", "query", forumQuery, "text", false)}
        <button>Search</button>
        ${xb("Clear", "forum-clear")}
      </form>
      <p>${xb("＋ New forum post", "forum-compose", "", "wide")}</p>
      ${forumResults(matched)}`;
  };

  pages.hashtag = () => `${heading(`#${route.tag}`, "Discussions under this hashtag")}
    ${forumResults(db.forums.filter(post => (post.tags || []).includes(route.tag)))}`;

  pages["forum-compose"] = () => `${heading("New forum post")}
    <form data-form="x-forum-compose" data-dirty>
      ${field("Subject", "title")}
      ${area("Enter your inquiry.", "body")}
      <h2>Hashtag</h2>
      <p class="muted">Suggested from your subject and inquiry. Tap to select.</p>
      <div id="tagSuggestions"></div>
      <div id="chosenTags"></div>
      ${field("Add your own hashtags", "tags", "", "text", false,
        'placeholder="e.g. #internship #interview"')}
      ${checkbox("Post anonymously", "anonymous")}
      <button class="wide">Publish post</button>
    </form>`;

  function findItem(reference) {
    const [kind, parent, id] = reference.split("|");
    let item;
    if (kind === "forum") item = getForum(id);
    if (kind === "forum-reply") item = getForum(parent)?.replies.find(r => r.id === id);
    if (kind === "review") item = getPost(parent)?.reviews.find(r => r.id === id);
    return { kind, parent, id, item };
  }

  function threadMarkup(items, kind, parent, parentId = null, depth = 0) {
    let siblings = items.filter(item => (item.parent || null) === parentId);
    siblings = rank(siblings, kind);

    if (parentId === null && kind === "review") {
      siblings.sort((a, b) => Number(relatedComment(b)) - Number(relatedComment(a)));
    }

    return siblings.map(item => `
      <div class="${depth ? "ic-thread" : ""}">
        <article class="ic-reply" tabindex="0" role="button"
          aria-label="Reply to ${esc(authorName(item))}"
          data-reply-ref="${esc(`${kind}|${parent}|${item.id}`)}">
          ${authorButton(item)}
          ${parentId === null && kind === "review" && relatedComment(item)
            ? '<p class="badge">Recommended: school / major connection</p>' : ""}
          <p class="preserve">${helpfulMark(item)}${esc(item.text || "Ratings-only review.")}</p>
          <small class="muted">${esc(dateLabel(item.created))}</small>
          ${engagementActions(item, kind, parent)}
          ${xb("Reply", "reply-to", `${kind}|${parent}|${item.id}`)}
        </article>
        ${depth < 20
          ? threadMarkup(items, kind, parent, item.id, depth + 1)
          : ""}
      </div>
    `).join("");
  }

  function commentComposer(kind, parent) {
    const selected = replyingTo && findItem(replyingTo);
    const matches = selected && selected.kind === kind && selected.parent === parent;
    const label = matches
      ? `Reply to ${authorName(selected.item)}’s comment`
      : "Leave a comment";

    return `<form data-form="x-comment" data-kind="${esc(kind)}"
      data-parent="${esc(parent)}" data-dirty>
      <label id="commentLabel">${esc(label)}
        <textarea class="ic-one-line" name="text" rows="1"
          maxlength="2000" required></textarea>
      </label>
      ${checkbox("Comment anonymously", "anonymous")}
      <div class="row">
        <button>Post comment</button>
        ${xb("Cancel reply", "cancel-reply")}
      </div>
    </form>`;
  }

  pages["forum-detail"] = () => {
    const post = getForum(route.id);
    if (!post) return missingPage();
    return `${heading(post.title)}
      ${authorButton(post)}
      <p class="preserve">${helpfulMark(post)}${esc(post.body)}</p>
      <p>${statusMarkup(post.resolved)}</p>
      ${post.owner === currentUserId
        ? xb(post.resolved ? "Mark unresolved" : "Mark resolved", "forum-resolve", post.id) : ""}
      <div>${tagsMarkup(post.tags)}</div>
      ${engagementActions(post, "forum")}
      <h2>Replies (${post.replies.length})</h2>
      ${threadMarkup(post.replies, "forum-reply", post.id)}
      ${commentComposer("forum-reply", post.id)}`;
  };

  pages.favorites = () => {
    const forums = db.forums.filter(post => isFavorite("forum", post.id));
    const comments = [];

    for (const forum of db.forums) {
      for (const reply of forum.replies) {
        if (isFavorite("forum-reply", reply.id)) {
          comments.push({ item: reply, title: forum.title, kind: "forum", source: forum.id });
        }
      }
    }

    for (const post of db.posts) {
      for (const reply of post.reviews || []) {
        if (isFavorite("review", reply.id)) {
          comments.push({ item: reply, title: post.live?.job || "Internship", kind: "job", source: post.id });
        }
      }
    }

    return `${heading("Favorites")}
      <h2>Forum posts (${forums.length})</h2>
      ${forums.map(expandedForumCard).join("") || '<p class="muted">No favorite forum posts yet.</p>'}
      <h2>Comments (${comments.length})</h2>
      ${comments.map(({ item, title, kind, source }) => `
        <article class="card">
          <p class="muted">${esc(title)} · ${esc(authorName(item))}</p>
          <p class="preserve">${esc(item.text)}</p>
          ${xb("Open discussion", kind === "forum" ? "forum-open" : "job-open", source)}
        </article>
      `).join("") || '<p class="muted">No favorite comments yet.</p>'}`;
  };

  function reportDialog(reference) {
    showModal("Report content", `
      <form data-form="x-report" data-reference="${esc(reference)}">
        ${selectField("Reason", "reason", [
          ["", "Choose a reason"],
          "Harassment or abusive language",
          "Spam or advertising",
          "Misleading information",
          "Privacy concern",
          "Other"
        ])}
        ${area("Additional explanation", "details", "", false, 1200)}
        <p class="muted">
          Classroom simulation: reports are stored locally.
          No real moderation team receives them.
        </p>
        <button class="wide">Submit report</button>
      </form>`);
  }
  function fullName(user) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() +
      (user.preferredName ? ` (${user.preferredName})` : "");
  }

  function profileListSection(user, type, editable = false) {
    const title = type === "skills" ? "Skills" :
      type === "interests" ? "Interests" : "Previous internship experiences";
    const items = user[type] || [];

    return `<section class="ic-list-section">
      <div class="row between">
        <h2>${title}</h2>
        ${editable ? `<div class="row">
          ${xb("+", type === "experiences" ? "proof-add" : "profile-add", type,
            "secondary", `aria-label="Add ${esc(title)}"`)}
          ${xb(icon("pen"), "profile-list-edit", type,
            "secondary", `aria-label="Edit ${esc(title)}"`)}
        </div>` : ""}
      </div>
      <ul class="ic-profile-list">
        ${items.map((item, index) => `<li>
          ${type === "experiences"
            ? `<strong>${esc(item.position)}</strong><br>
                ${esc(item.employer)} · ${esc(item.time)}
                <p class="preserve">${esc(item.description)}</p>
                <span class="badge">${item.verified ? "Demo proof verified" : "Proof required"}</span>`
            : esc(item)}
          ${editable ? `<div>${xb("Edit", "profile-item-edit", `${type}|${index}`,
            "link-button small")}</div>` : ""}
        </li>`).join("") || '<li class="muted">Nothing added yet.</li>'}
      </ul>
    </section>`;
  }

  function helpfulItems(user, anonymousOnly = false) {
    const result = [];
    const allowed = item => item.owner === user.id &&
      Boolean(item.anonymous) === anonymousOnly && helpful(item);

    for (const post of db.posts) {
      if (post.live && allowed(post)) {
        result.push({
          item: post, text: post.live.title,
          action: post.type === "official" ? "job-open" : "legacy-post", source: post.id
        });
      }
      for (const review of post.reviews || []) {
        if (allowed(review)) result.push({
          item: review, text: review.text || "Ratings-only review",
          action: "job-open", source: post.id
        });
      }
    }

    for (const forum of db.forums) {
      if (allowed(forum)) result.push({
        item: forum, text: forum.title, action: "forum-open", source: forum.id
      });
      for (const reply of forum.replies) {
        if (allowed(reply)) result.push({
          item: reply, text: reply.text, action: "forum-open", source: forum.id
        });
      }
    }

    return result.sort((a, b) => likesOf(b.item) - likesOf(a.item));
  }

  pages.profile = () => {
    const person = route.actor || currentUserId;
    const user = getUser(actorOwner(person));
    if (!user) return missingPage();

    const anonymous = person.startsWith("anon:");
    const own = !anonymous && user.id === currentUserId;
    const authored = db.posts.filter(post =>
      post.live && actor(post.owner, post.anonymous) === person
    );
    const discussions = db.forums.filter(post =>
      actor(post.owner, post.anonymous) === person
    );
    const marked = helpfulItems(user, anonymous);
    const title = anonymous ? user.alias :
      user.kind === "provider" ? user.org : fullName(user);

    return `${own ? "" : button("← Back", "back", "", "link-button")}
      <section class="card">
        <div class="profile-top">
          ${anonymous ? `<span class="ic-avatar ic-avatar-initials">${icon("me")}</span>` : avatar(user)}
          <div><h1>${esc(title)}</h1>
            <span class="badge">${anonymous ? "Anonymous profile" : `${esc(user.identity)} · Demo verified`}</span>
          </div>
        </div>
        ${anonymous ? '<p class="muted">Personal information is hidden in this demo view.</p>' : `
          <p><strong>${esc(user.headline || "")}</strong></p>
          <dl class="meta">
            <dt>${user.kind === "provider" ? "Company" : "School"}</dt><dd>${esc(user.org)}</dd>
            <dt>${user.kind === "provider" ? "Department" : "Major"}</dt><dd>${esc(user.major || "Not added")}</dd>
            ${user.kind === "participant" ? `
              <dt>Study</dt><dd>${esc(user.degree)} · Year ${esc(user.year)}</dd>
              <dt>Graduation</dt><dd>${esc(user.graduation || "Not added")}</dd>
            ` : ""}
            <dt>Location</dt><dd>${esc(user.location || "Not added")}</dd>
          </dl>
          ${profileListSection(user, "skills")}
          ${profileListSection(user, "interests")}
          ${profileListSection(user, "experiences")}
          <h2>About</h2><p class="preserve">${esc(user.bio || "No bio yet.")}</p>
        `}
        <div class="stats ic-profile-stats">
          ${xb(`<strong>${authored.length}</strong>Posts`, "scroll-section", "publishedSection")}
          ${xb(`<strong>${discussions.length}</strong>Discussions`, "scroll-section", "discussionSection")}
          ${xb(`<strong>${marked.length}</strong>Helpful publishes`, "scroll-section", "helpfulSection")}
        </div>
        ${own ? button("Edit profile", "edit-profile", "", "wide")
          : actorOwner(person) !== currentUserId
            ? button("Message", "message-actor", person, "wide") : ""}
      </section>

      ${own ? `<section class="card stack">
        ${provider() ? button("Edit Internship Information →", "workspace", "", "wide") : ""}
        ${xb("Favorites", "navigate", "favorites", "secondary wide")}
        ${xb("Upload résumé", "navigate", "resume", "secondary wide")}
        ${button("My anonymous posts", "author", actor(currentUserId, true), "secondary wide")}
        ${button("Log out", "logout", "", "secondary wide")}
      </section>` : ""}

      <h2 id="publishedSection">Published posts</h2>
      ${postGrid(authored)}
      <h2 id="discussionSection">Forum discussions</h2>
      ${discussions.map(expandedForumCard).join("") || '<p class="muted">No discussions yet.</p>'}
      <h2 id="helpfulSection">Most liked comments and forum posts</h2>
      <p class="ic-subtle">Helpful = at least 5 likes in this demonstration.</p>
      ${marked.map(({ item, text, action, source }) => `
        <article class="card">
          <p>${helpfulMark(item)}${esc(text)}</p>
          <p class="muted">${likesOf(item)} likes</p>
          ${xb("Open", action, source)}
        </article>
      `).join("") || '<p class="muted">No helpful publishes yet.</p>'}`;
  };

  pages["edit-profile"] = () => {
    const user = me();
    return `${heading("Edit profile")}
      <div class="ic-avatar-wrap">${avatar(user)}<span class="ic-pen">${icon("pen")}</span></div>
      <label>Change profile picture
        <input id="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp">
      </label>
      <p class="muted">Stored only in this browser. Choose a non-sensitive sample image.</p>
      <form data-form="x-profile" data-dirty>
        ${field("First Name", "firstName", user.firstName)}
        ${field("Last Name", "lastName", user.lastName, "text", false)}
        ${field("Additional/Preferred Name", "preferredName", user.preferredName, "text", false)}
        ${field("Headline", "headline", user.headline, "text", false)}
        ${field(user.kind === "provider" ? "Company" : "School", "org", user.org)}
        ${field(user.kind === "provider" ? "Department" : "Major", "major", user.major, "text", false)}
        ${user.kind === "participant" ? `
          ${selectField("Undergraduate / Postgraduate", "degree", ["Undergraduate", "Postgraduate"], user.degree)}
          ${field("Current year", "year", user.year, "number", true, 'min="1" max="10"')}
          ${field("Year of Graduation", "graduation", user.graduation, "number", false, 'min="1950" max="2100"')}
        ` : ""}
        ${field("Location", "location", user.location, "text", false)}
        ${area("About", "bio", user.bio, false, 1200)}
        <button class="wide">Save profile</button>
      </form>
      <p class="muted">Save the fields above before opening a separate list editor.</p>
      ${profileListSection(user, "skills", true)}
      ${profileListSection(user, "interests", true)}
      ${profileListSection(user, "experiences", true)}`;
  };

  pages["profile-item"] = () => {
    const type = route.type;
    if (!["skills", "interests", "experiences"].includes(type)) return missingPage();
    const index = route.index;
    const item = index === undefined ? null : me()[type][index];

    if (type === "experiences" && !item) return missingPage();

    return `${heading(type === "skills" ? "Skill" : type === "interests" ? "Interest" : "Internship experience")}
      <form data-form="x-profile-item" data-dirty>
        ${type === "experiences" ? `
          ${field("Position", "position", item.position)}
          ${field("Employer", "employer", item.employer)}
          ${field("Time", "time", item.time)}
          ${area("Description", "description", item.description, false)}
          <p class="muted">These editable details are linked to sample-verified proof.</p>
        ` : field(type === "skills" ? "Skill" : "Interest", "value", item || "")}
        <button class="wide">Save</button>
      </form>`;
  };

  pages.verify = () => {
    const user = me();
    const company = user.kind === "provider";
    return `${heading("Verify your identity", "Sample documents only—no real identity documents are uploaded.")}
      <p>${esc(user.identity)} · ${esc(user.org)}</p>
      <form data-form="x-identity">
        ${selectField("Proof to simulate", "proof", [
          ["invalid", "Invalid sample document"],
          ["valid", "Valid sample document"]
        ], "invalid")}
        <div class="stack">
          ${company ? `
            <button name="method" value="employee">Submit valid company employee proof</button>
            <button name="method" value="other">Submit other identity verification documents</button>
          ` : `
            <button name="method" value="id">Submit valid student ID</button>
            <button name="method" value="offer">Submit valid offer letter</button>
            <button name="method" value="certificate">Submit valid testimonial / certificate of enrollment</button>
            <button name="method" value="other">Submit other identity verification documents</button>
          `}
        </div>
        <p class="muted">Our staff will verify the validity of your documents.</p>
        <p class="muted">
          The App will automatically identify your school, major,
          undergraduate/postgraduate status, current year, year of graduation,
          and location. You can always edit them at your “Me” page after verification.
        </p>
        <br>
        <p class="muted">
          A valid sample marks this demo profile as verified.
          In a real service, this decision belongs to a secure verification process.
        </p>
        <p class="ic-subtle">
          Demo: the selector determines success or failure for every button.
          “Other documents” simulates staff approval; no real staff review occurs.
        </p>
      </form>`;
  };

  pages.resume = () => `${heading("Upload résumé")}
    <form data-form="x-resume">
      <input id="resumeFile" name="resume" type="file"
        accept=".pdf,.docx" required aria-label="Choose a PDF or DOCX résumé">
      <p><label for="resumeFile" class="muted">Choose a .docx or .pdf file, then:</label></p>
      <button class="wide">Upload résumé</button>
      <p class="muted">
        The App will automatically identify your skills and interests and past
        internship experiences, but you will have to verify those experiences
        in the “Edit profile” page. You can always manually edit your information.
      </p>
      <p class="muted">
        The App will also recommend you with AI possibly suitable internships
        in the “Internship information list” section at the “Home” page.
        Check it out!
      </p>
      <p class="warning">
        Classroom simulation: the file is not uploaded or parsed.
        Continuing applies labelled sample résumé information.
        Do not choose a real résumé containing sensitive information.
      </p>
    </form>`;

  pages["internship-proof"] = () => {
    const jobs = allJobs();
    return `${heading("Upload Internship Proof")}
      <form data-form="x-internship-proof">
        ${selectField("Internship", "source",
          jobs.map(post => [post.id, `${post.live.company} · ${post.live.job}`]),
          route.source || jobs[0]?.id)}
        ${selectField("Proof to simulate", "proof", [
          ["invalid", "Invalid sample document"], ["valid", "Valid sample document"]
        ], "invalid")}
        <div class="stack">
          <button name="method" value="certificate">Submit internship certificate</button>
          <button name="method" value="other">Submit other documents</button>
        </div>
        <p class="muted">Our staff will verify the validity of your documents.</p>
        <p class="muted">
          The App will automatically confirm your position, employer, time,
          and AI generate a description for you. You can always edit them at “Me” after verification.
        </p>
        <p class="muted">
          After verification, you will be able to share your experiences in this
          internship under its description page. You can also submit your proof
          there; it will be automatically updated in “Me”.
        </p>
        <p class="muted">
          After verification, the App will automatically add this internship to your profile.
          You can always edit them at “Me”.
        </p>
        <p class="warning">
          Verification and extraction are simulated. No documents are uploaded.
          A notification records the sample decision.
        </p>
      </form>`;
  };

  // Existing proof entry points use the same profile-linked proof flow.
  const originalExperienceProofPage = proofPage;

// The original Posts → verified experience workflow remains available.
// Its successful proof step is additionally linked to the user's Me profile.
  pages.proof = originalExperienceProofPage;
  const FILTER_NAMES = {
    employer: "Employer",
    position: "Position",
    location: "Location",
    arrangement: "Work arrangement",
    duration: "Duration",
    field: "Field",
    skills: "Required skills",
    treatments: "Work treatments",
    keywords: "Other keywords"
  };

  const DURATION_OPTIONS = [
    "<1 month", "1 month", "2 months", "3 months",
    "4 months", "5 months", ">5 months"
  ];

  const emptyJobFilters = () => ({
    employer: [], position: [], location: [], arrangement: [],
    duration: [], field: [], skills: [], treatments: [], keywords: [],
    minPay: 0, maxPay: 300, rating: "", includeOpenField: false
  });

  let jobFilters = emptyJobFilters();
  let draftFilters = emptyJobFilters();
  let jobQuery = "";
  let jobMode = "search";
  let searchedJobs = false;

  function allJobs() {
    return db.posts.filter(post => post.type === "official" && post.live)
      .map(prepareJob);
  }

  function durationCategory(weeks) {
    const months = weeks / 4.345;
    if (months < 1) return "<1 month";
    if (months > 5.5) return ">5 months";
    return `${Math.max(1, Math.round(months))} month${Math.round(months) > 1 ? "s" : ""}`;
  }

  function jobValues(post, key) {
    const data = post.live, meta = post.jobMeta;
    const map = {
      employer: [data.company],
      position: [data.job],
      location: [data.location],
      arrangement: [meta.arrangement],
      duration: [durationCategory(data.duration)],
      field: meta.fields,
      skills: meta.skills,
      treatments: TREATMENTS.filter(t => meta.treatments[t] === "Yes"),
      keywords: meta.other
    };
    return map[key] || [];
  }

  function histogram(post, aspect) {
    const counts = [...post.jobMeta.histogram[aspect]];
    for (const review of post.reviews) {
      const value = review.ratings?.[aspect];
      if (Number.isInteger(value) && value >= 0 && value <= 5) counts[value]++;
    }
    return counts;
  }

  function average(post, aspect) {
    const counts = histogram(post, aspect);
    const total = counts.reduce((a, b) => a + b, 0);
    return total ? counts.reduce((sum, count, value) => sum + count * value, 0) / total : 0;
  }

  function overall(post) {
    return ASPECTS.reduce((sum, aspect) => sum + average(post, aspect), 0) / ASPECTS.length;
  }

  function matchesJob(post, applied = jobFilters) {
    const query = jobQuery.toLowerCase().trim();
    if (query && !`${post.live.company} ${post.live.job} ${post.live.body}`
      .toLowerCase().includes(query)) return false;

    for (const key of Object.keys(FILTER_NAMES)) {
      const values = applied[key] || [];
      if (!values.length) continue;
      const candidates = jobValues(post, key);
      if (key === "field" && applied.includeOpenField && !candidates.length) continue;

      if (!values.some(value => candidates.some(candidate =>
        candidate.toLowerCase().includes(value.toLowerCase())
      ))) return false;
    }

    if (post.jobMeta.payMax < Number(applied.minPay) ||
        post.jobMeta.payMin > Number(applied.maxPay)) return false;

    if (applied.rating !== "") {
      const [min, max] = applied.rating.split("-").map(Number);
      const rating = overall(post);
      if (rating < min || rating > max) return false;
    }
    return true;
  }

  function recommendedJob(post) {
    const user = me();
    const fields = post.jobMeta.fields;
    const schoolMatch = !fields.length ||
      fields.some(field => field.toLowerCase() === user.major.toLowerCase());
    const skillsMatch = post.jobMeta.skills.some(skill =>
      user.skills.some(value => value.toLowerCase() === skill.toLowerCase())
    );
    const interestMatch = user.interests.some(interest =>
      `${post.live.job} ${post.live.body}`.toLowerCase().includes(interest.toLowerCase())
    );
    return (schoolMatch || skillsMatch || interestMatch) &&
      (!user.location || post.live.location.toLowerCase().includes(user.location.toLowerCase()));
  }

  function jobRow(post) {
    const data = post.live, meta = post.jobMeta;
    const wished = (db.wishlists[currentUserId] || []).includes(post.id);
    const compared = (db.comparisons[currentUserId] || []).includes(post.id);

    return `<article class="ic-job-row" tabindex="0" role="link"
      aria-label="Open ${esc(data.job)} at ${esc(data.company)}"
      data-job="${esc(post.id)}">
      <div class="ic-job-line">${avatar(getUser(post.owner))}
        <strong>${esc(data.company)}</strong>
        ${post.closed ? '<span class="badge">Closed</span>' : ""}
      </div>
      <div class="ic-job-line">
        <h3>${esc(data.job)}</h3>
        <div class="ic-actions">
          ${xb(wished ? "♥" : "♡", "wishlist", post.id, "ic-heart",
            `aria-label="Wishlist internship" aria-pressed="${wished}"`)}
          ${xb(compared ? "✓ Comparison" : "+ Comparison", "compare-toggle", post.id)}
        </div>
      </div>
      <div class="ic-job-line">
        <span>${icon("pin")}${esc(data.location)}</span>
        <span>${icon("computer")}${esc(meta.arrangement)}</span>
        <span>${icon("calendar")}${data.duration} weeks</span>
      </div>
      <div class="ic-job-line">
        <span>$ ${meta.payMin}–${meta.payMax} ${esc(meta.payUnit)}</span>
        <span>${icon("clock")}${esc(data.deadline || "Deadline not specified")}</span>
      </div>
    </article>`;
  }

  function recommendationIntro() {
    const user = me();
    return `<h2>Recommended for you by our AI model</h2>
      <p class="muted">
        Based on your ${user.resumeDemo ? "sample uploaded résumé" : "editable demo profile"},
        we have recommended results based on your ${esc(user.degree.toLowerCase())}
        major “${esc(user.major || "not specified")}”
        (we have also included internships that do not require a specific academic background),
        skills ${esc(user.skills.join(", ") || "not specified")},
        your interests ${esc(user.interests.join(", ") || "not specified")},
        your perceived strengths ${esc(user.strengths.join(", ") || "not specified")},
        and your location “${esc(user.location || "not specified")}”.
        This is also available by selecting “Apply AI-recommended filters” in the
        “Filters” slide, and you can always manually edit the filters.
      </p>
      <p class="warning">
        Demonstration only: this version uses simple profile-matching rules,
        not an AI model. Strengths and résumé-derived values are sample data.
        AI-filter presets may narrow results further than the recommendation list.
      </p>`;
  }

  pages.internships = () => {
    const jobs = allJobs();
    const wishlist = db.wishlists[currentUserId] || [];
    const recommendations = jobs.filter(recommendedJob);
    const results = jobs.filter(post =>
      jobMode === "wishlisted" ? wishlist.includes(post.id) : matchesJob(post)
    );

    return `<div class="ic-sticky row between">
        <h1>Internship Information List</h1>
        ${xb("Comparisons", "navigate", "comparisons")}
      </div>
      <p class="muted">
        Please check our (possibly) most detailed and exhaustive information list
        of publicly available internships. There will always be at least one that suits you.
      </p>
      <p class="ic-subtle">All opportunities in this prototype are fictional sample listings.</p>
      <div class="feed-tabs">
        ${xb("Search", "job-mode", "search", "", `aria-pressed="${jobMode === "search"}"`)}
        ${xb("Wishlisted", "job-mode", "wishlisted", "", `aria-pressed="${jobMode === "wishlisted"}"`)}
      </div>

      ${jobMode === "search" ? `
        <form data-form="x-job-search">
          ${field("Search internships", "query", jobQuery, "text", false)}
          <div class="row"><button>Search</button>
            ${xb(`${icon("filter")} Filters`, "filters")}
          </div>
        </form>
        ${searchedJobs ? `
          <h2>Search results (${results.length})</h2>
          ${results.map(jobRow).join("") || '<p class="empty">No matches. Try removing filters.</p>'}
        ` : `
          <section class="ic-recommendation">
            ${recommendationIntro()}
            ${recommendations.map(jobRow).join("") ||
              '<p class="muted">No profile matches yet. Browse all opportunities below.</p>'}
          </section>
          <p class="ic-large-hint">Start browsing internships by applying filters!</p>
          ${xb("Explore filters", "filters", "", "wide")}
          <h2>All publicly listed sample opportunities</h2>
          ${jobs.map(jobRow).join("")}
        `}
      ` : `
        <h2>Your wishlist (${results.length})</h2>
        ${results.map(jobRow).join("") || '<p class="empty">Tap a heart to wishlist an internship.</p>'}
      `}`;
  };

  function filterSuggestions(key) {
    return [...new Set(allJobs().flatMap(post => jobValues(post, key)))].sort();
  }

  function filterTags(key) {
    return draftFilters[key].map((value, index) =>
      xb(`${esc(value)} ×`, "filter-remove", `${key}|${index}`, "ic-chip",
        `aria-label="Remove ${esc(value)}"`)
    ).join("");
  }

  function filterDialog() {
    showModal("Filters", `
      <form data-form="x-filters">
        <div class="ic-filter-header">
          <div class="row between">
            <h2>Filters</h2>${xb("×", "close-modal", "", "secondary", 'aria-label="Close filters"')}
          </div>
          <div class="row">
            ${xb("Apply AI-recommended filters", "filter-ai")}
            ${xb("Clear all", "filter-clear-all")}
          </div>
          <p class="ic-subtle">Demo presets—not actual AI predictions.</p>
        </div>

        ${Object.entries(FILTER_NAMES).map(([key, label]) => `
          <section class="ic-filter-group">
            <label for="filter-${key}">${label}</label>
            <div class="ic-filter-input">
              ${key === "duration"
                ? `<select id="filter-${key}">
                    ${DURATION_OPTIONS.map(value => `<option>${esc(value)}</option>`).join("")}
                  </select>`
                : `<input id="filter-${key}" list="suggest-${key}" maxlength="80"
                    placeholder="Add ${esc(label.toLowerCase())}">
                  <datalist id="suggest-${key}">
                    ${filterSuggestions(key).map(value => `<option value="${esc(value)}"></option>`).join("")}
                  </datalist>`}
              ${xb("+", "filter-add", key, "secondary", `aria-label="Add ${esc(label)} filter"`)}
              ${xb("Clear all", "filter-clear", key, "link-button small")}
            </div>
            <div id="tags-${key}" class="ic-filter-tags">${filterTags(key)}</div>
            ${key === "field" ? `
              <p class="muted" id="fieldFilterNote" ${draftFilters.field.length ? "" : "hidden"}>
                ${draftFilters.includeOpenField
                  ? "AI preset also includes internships with no specified academic background."
                  : "When applied, only internships with required academic backgrounds will be displayed"}
              </p>
            ` : ""}
            ${key === "treatments" ? `
              <p class="muted" id="treatmentsFilterNote" ${draftFilters.treatments.length ? "" : "hidden"}>
                Please note that only officially listed work treatments are accounted for
              </p>
            ` : ""}
          </section>
        `).join("")}

        <h3>Pay range · HKD/hour</h3>
        <p class="muted">All sample listings use the same hourly currency/unit.</p>
        <div class="ic-range">
          <label>Lower: <output id="minPayOutput">${draftFilters.minPay}</output>
            <input name="minPay" type="range" min="0" max="300" step="5" value="${draftFilters.minPay}">
          </label>
          <label>Upper: <output id="maxPayOutput">${draftFilters.maxPay}</output>
            <input name="maxPay" type="range" min="0" max="300" step="5" value="${draftFilters.maxPay}">
          </label>
        </div>
        ${selectField("Ratings", "rating", [
          ["", "Any rating"], ["0-1", "0–1 stars"], ["1-2", "1–2 stars"],
          ["2-3", "2–3 stars"], ["3-4", "3–4 stars"], ["4-5", "4–5 stars"]
        ], draftFilters.rating)}
        <p class="ic-subtle">
          Keywords are OR-matched within each category and AND-matched between categories.
          Duration is grouped using approximately 4.345 weeks per month.
        </p>
        <button class="wide">Apply filters & search</button>
      </form>
    `, "ic-filter-dialog");
  }

  pages.comparisons = () => {
    const ids = db.comparisons[currentUserId] || [];
    const jobs = allJobs().filter(post => ids.includes(post.id));
    const rows = [
      ["Employer", p => p.live.company],
      ["Position", p => p.live.job],
      ["Location", p => p.live.location],
      ["Work arrangement", p => p.jobMeta.arrangement],
      ["Duration", p => `${p.live.duration} weeks`],
      ["Pay", p => `${p.jobMeta.payMin}–${p.jobMeta.payMax} ${p.jobMeta.payUnit}`],
      ["Official pay wording", p => p.live.pay || "Not specified"],
      ["Due date", p => p.live.deadline || "Not specified"],
      ["Required fields", p => p.jobMeta.fields.join(", ") || "No specific academic background"],
      ["Skills", p => p.jobMeta.skills.join(", ")],
      ["Graduation years", p => p.jobMeta.graduation.join(", ")],
      ["Benefits", p => p.jobMeta.benefits.join(", ")],
      ...TREATMENTS.map(t => [t, p => p.jobMeta.treatments[t] || "Not specified"]),
      ["Overall rating", p => `${overall(p).toFixed(1)}/5`],
      ["Application status", p => p.closed ? "Closed" : "Open"]
    ];

    return `${heading("Comparisons")}
      ${jobs.length ? `<div class="ic-compare-scroll">
        <table class="ic-compare">
          <thead><tr><th scope="col">Aspect</th>
            ${jobs.map(post => `<th scope="col">
              ${xb("×", "compare-toggle", post.id, "secondary", 'aria-label="Remove comparison"')}
              <p>${esc(post.live.job)}</p>
            </th>`).join("")}
          </tr></thead>
          <tbody>${rows.map(([label, value]) => `
            <tr><th scope="row">${esc(label)}</th>
              ${jobs.map(post => `<td>${esc(value(post))}</td>`).join("")}
            </tr>
          `).join("")}</tbody>
        </table>
      </div>` : '<p class="empty">Add internships using “+ Comparison”.</p>'}`;
  };
  function treatmentResults(post) {
    return TREATMENTS.map(treatment => {
      let [yes, no] = post.jobMeta.votes[treatment];
      for (const review of post.reviews) {
        if (review.treatment?.[treatment] === "Yes") yes++;
        if (review.treatment?.[treatment] === "No") no++;
      }
      const total = yes + no;
      const percent = total ? yes / total * 100 : 0;

      return `<div class="card">
        <div class="row between">
          <strong>${esc(treatment)}</strong>
          <span class="small">${yes}/${no} (${total} people)</span>
        </div>
        <div class="row between small"><span>Yes</span><span>No</span></div>
        <div class="ic-vote" role="img"
          aria-label="${esc(treatment)}: ${yes} yes, ${no} no">
          <div class="ic-vote-yes" style="width:${percent}%"></div>
          <div class="ic-vote-no" style="width:${100 - percent}%"></div>
        </div>
      </div>`;
    }).join("");
  }

  function keywordSection(post) {
    return Object.entries({
      position: "Position", location: "Location", arrangement: "Work arrangement",
      duration: "Duration", field: "Field", skills: "Skills",
      treatments: "Work treatments", keywords: "Other keywords"
    }).map(([key, label]) => `
      <h3>${label}</h3>
      <div>${jobValues(post, key).map(value =>
        `<span class="ic-chip">${esc(value)}</span>`
      ).join("") || '<span class="muted">Not specified</span>'}</div>
    `).join("");
  }

  pages.internship = () => {
    const post = getPost(route.id);
    if (!post?.live || post.type !== "official") return missingPage();
    prepareJob(post);
    const data = post.live, meta = post.jobMeta;

    return `${heading(data.job)}
      <details class="ic-info-section" open>
        <summary>Official Information</summary>
        <section class="card">
          <div class="row">
            ${avatar(getUser(post.owner))}
            <div>
              <strong>${esc(data.job)}</strong><br>
              ${authorButton(post)}<br>
              <span class="muted">${icon("pin")}${esc(data.location)}</span>
            </div>
          </div>
          <p>${icon("computer")} ${esc(meta.arrangement)}</p>
          <p>${icon("calendar")} ${data.duration} weeks</p>
          <p>$ ${meta.payMin}–${meta.payMax} ${esc(meta.payUnit)}</p>
          <p class="muted">Official pay wording: ${esc(data.pay || "Not specified")}</p>
          <p>${icon("clock")} ${esc(data.deadline || "Deadline not specified")}</p>
          ${engagementJobButtons(post)}

          <h2>Internship requirements</h2>
          <p class="preserve">${esc(data.requirements || "See the employer’s requirements.")}</p>
          <ul>
            <li>Academic background: ${esc(meta.fields.join(", ") || "No specific academic background")}</li>
            <li>Required skills: ${esc(meta.skills.join(", ") || "Not specified")}</li>
            <li>Graduation years: ${esc(meta.graduation.join(", ") || "Not specified")}</li>
          </ul>
          <h2>Internship description</h2>
          <p class="preserve">${esc(data.body)}</p>
          <h2>Internship benefits</h2>
          <ul>${meta.benefits.map(value => `<li>${esc(value)}</li>`).join("")}</ul>
          <h2>Work treatments</h2>
          <dl class="meta">
            ${TREATMENTS.map(t => `<dt>${esc(t)}</dt><dd>${esc(meta.treatments[t] || "Not specified")}</dd>`).join("")}
          </dl>
          <h2>Keywords</h2>
          ${keywordSection(post)}
          <p class="ic-subtle">Structured fields are curated fictional sample metadata, not externally collected job data.</p>
        </section>
      </details>

      <details class="ic-info-section" open>
        <summary>Users’ Information</summary>
        <h2>Work Treatment</h2>
        ${treatmentResults(post)}
        <h2>Star Ratings</h2>
        <div class="stack">
          ${ASPECTS.map(aspect => xb(
            `★ ${average(post, aspect).toFixed(1)}/5.0 · ${esc(aspect)}`,
            "histogram", `${post.id}|${aspect}`, "secondary wide"
          )).join("")}
        </div>
        <p class="ic-subtle">
          Initial vote totals and rating distributions are fictional demonstration data.
          Your submitted review is added to those totals.
        </p>
        <h2>Comments</h2>
        ${provider() ? '<p class="muted">Participant accounts can submit verified internship reviews.</p>'
          : xb("Post my review", "review-start", post.id, "wide")}
        <p class="muted">
          Public school/major connections appear first.
          Within each group, likes, views and favorites determine the order.
        </p>
        ${threadMarkup(post.reviews, "review", post.id)}
        ${commentComposer("review", post.id)}
      </details>`;
  };

  function engagementJobButtons(post) {
    const wished = (db.wishlists[currentUserId] || []).includes(post.id);
    const compared = (db.comparisons[currentUserId] || []).includes(post.id);
    return `<div class="ic-actions">
      ${xb(wished ? "♥ Wishlisted" : "♡ Wishlist", "wishlist", post.id, "ic-heart",
        `aria-pressed="${wished}"`)}
      ${xb(compared ? "✓ Comparison" : "+ Comparison", "compare-toggle", post.id)}
      ${post.owner !== currentUserId ? button("Private inquiry", "post-message", post.id) : ""}
    </div>`;
  }

  const previousPostPage = pages.post;
  pages.post = () => getPost(route.id)?.type === "official"
    ? pages.internship() : previousPostPage();

  pages.review = () => {
    const post = getPost(route.id);
    if (!post?.live || provider()) return deniedPage();
    const proof = me().experiences.find(item => item.source === post.id && item.verified);
    if (!proof) return deniedPage();

    const previous = post.reviews.find(item => item.owner === currentUserId && item.ratings);
    return `${heading(previous ? "Edit my review" : "Post my review", `${post.live.company} · ${post.live.job}`)}
      <form data-form="x-review" data-dirty>
        <h2>Work Treatment</h2>
        ${TREATMENTS.map((treatment, index) => selectField(
          treatment, `t${index}`, ["Yes", "No"],
          previous?.treatment?.[treatment] || "Yes"
        )).join("")}
        <h2>Star Ratings</h2>
        ${ASPECTS.map((aspect, index) => selectField(
          aspect, `r${index}`,
          [0, 1, 2, 3, 4, 5].map(value => [value, `${value} / 5`]),
          previous?.ratings?.[aspect] ?? 4
        )).join("")}
        ${area("Comments (optional)", "text", previous?.text || "", false)}
        ${checkbox("Post anonymously", "anonymous", previous?.anonymous || false)}
        <p class="muted">One rating submission per account per internship; editing replaces your earlier ratings.</p>
        <button class="wide">${previous ? "Update review" : "Publish review"}</button>
      </form>`;
  };

  function showHistogram(reference) {
    const [id, aspect] = reference.split("|");
    const post = getPost(id);
    if (!post || !ASPECTS.includes(aspect)) return;
    const counts = histogram(post, aspect);
    const max = Math.max(1, ...counts);

    showModal(`${aspect} ratings`, `
      <p><strong>★ ${average(post, aspect).toFixed(1)}/5.0</strong></p>
      <div class="ic-histogram">
        ${[5, 4, 3, 2, 1, 0].map(value => `
          <div class="ic-histogram-row">
            <span>${value} ★</span>
            <div class="ic-histogram-track">
              <div class="ic-histogram-fill" style="width:${counts[value] / max * 100}%"></div>
            </div>
            <span>${counts[value]}</span>
          </div>
        `).join("")}
      </div>
      <p class="muted">Initial counts are for demonstration purposes only.</p>`);
  }
  function toggleAccountList(key, id) {
    db[key][currentUserId] ??= [];
    const values = db[key][currentUserId];
    db[key][currentUserId] = values.includes(id)
      ? values.filter(value => value !== id) : [...values, id];
    persist();
  }

  async function openForum(id) {
    if (!await mayLeave()) return;
    const post = getForum(id);
    if (!post) return;
    post.views++;
    // A reply view is counted when the discussion containing it is opened.
    post.replies.forEach(reply => reply.views++);
    persist();
    replyingTo = null;
    dirty = false;
    await go("forum-detail", { id });
  }

  async function openJob(id) {
    if (!await mayLeave()) return;
    const post = getPost(id);
    if (!post?.live) return;
    prepareJob(post);
    post.reviews.forEach(reply => reply.views++);
    persist();
    replyingTo = null;
    dirty = false;
    await go("internship", { id });
  }

  function targetReply(reference) {
    const result = findItem(reference);
    if (!result.item) return;
    replyingTo = reference;
    const label = $("commentLabel");
    if (!label) return;

    const textarea = label.querySelector("textarea");
    const first = label.firstChild;
    const title = `Reply to ${authorName(result.item)}’s comment`;
    if (first?.nodeType === Node.TEXT_NODE) first.textContent = title;
    else label.prepend(document.createTextNode(title));
    textarea.focus();
    textarea.scrollIntoView({ block: "nearest", behavior: "auto" });
  }

  document.addEventListener("click", async event => {
    const buttonElement = event.target.closest("button[data-action]");
    const action = buttonElement?.dataset.action;

    if (action === "reset") {
      // The original reset handler remains responsible for confirmation/reset.
      // migrate() restores the extension sample data on the next render.
      return;
    }

    if (!action?.startsWith("x-")) {
      if (event.target.closest("button, a, input, select, textarea, summary, label")) return;

      const reply = event.target.closest("[data-reply-ref]");
      if (reply) {
        event.preventDefault();
        event.stopImmediatePropagation();
        targetReply(reply.dataset.replyRef);
        return;
      }

      const row = event.target.closest("[data-job]");
      if (row) {
        event.preventDefault();
        event.stopImmediatePropagation();
        await openJob(row.dataset.job);
      }
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const name = action.slice(2);
    const id = buttonElement.dataset.id || "";

    if (name === "close-modal") return closeModal();
    if (name === "navigate") return go(id);
    if (name === "inbox") return go("inbox");
    if (name === "start-chat") return openChat(id);
    if (name === "job-open") return openJob(id);
    if (name === "forum-open") return openForum(id);
    if (name === "legacy-post") return go("post", { id });

    if (name === "scroll-section") {
      $(id)?.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (name === "tag") return go("hashtag", { tag: id });

    if (name === "forum-clear") {
      forumQuery = "";
      return render();
    }

    if (name === "forum-compose") {
      selectedTags = [];
      await go("forum-compose");
      updateTagSuggestions();
      return;
    }

    if (name === "tag-select") {
      selectedTags = selectedTags.includes(id)
        ? selectedTags.filter(tag => tag !== id)
        : [...selectedTags, id].slice(0, 10);
      dirty = true;
      updateTagSuggestions();
      return;
    }

    if (name === "like" || name === "favorite") {
      const { kind, item } = findItem(id);
      if (!item) return;

      if (name === "like") {
        item.likes ??= [];
        item.likes = item.likes.includes(currentUserId)
          ? item.likes.filter(value => value !== currentUserId)
          : [...item.likes, currentUserId];
      } else {
        const key = favoriteKey(kind, item.id);
        db.favorites[currentUserId] ??= [];
        db.favorites[currentUserId] = myFavorites().includes(key)
          ? myFavorites().filter(value => value !== key)
          : [...myFavorites(), key];
      }

      persist();
      redrawPreservingInputs();
      return;
    }

    if (name === "report") return reportDialog(id);
    if (name === "reply-to") return targetReply(id);

    if (name === "cancel-reply") {
      replyingTo = null;
      const label = $("commentLabel");
      if (label?.firstChild?.nodeType === Node.TEXT_NODE) {
        label.firstChild.textContent = "Leave a comment";
      }
      return;
    }

    if (name === "forum-resolve") {
      const post = getForum(id);
      if (!post || post.owner !== currentUserId) return;
      post.resolved = !post.resolved;
      persist();
      redrawPreservingInputs();
      return;
    }

    if (name === "profile-add") {
      return go("profile-item", { type: id });
    }

    if (name === "profile-item-edit") {
      const [type, index] = id.split("|");
      return go("profile-item", { type, index: Number(index) });
    }

    if (name === "profile-list-edit") {
      const values = me()[id] || [];
      if (!values.length) {
        return id === "experiences"
          ? go("internship-proof")
          : go("profile-item", { type: id });
      }

      showModal("Choose an item to edit", `
        <div class="stack">
          ${values.map((item, index) => xb(
            esc(id === "experiences" ? `${item.position} · ${item.employer}` : item),
            "choose-profile-item", `${id}|${index}`, "secondary wide"
          )).join("")}
        </div>`);
      return;
    }

    if (name === "choose-profile-item") {
      closeModal();
      const [type, index] = id.split("|");
      return go("profile-item", { type, index: Number(index) });
    }

    if (name === "proof-add") return go("internship-proof");

    if (name === "resume-yes" || name === "resume-no") {
      closeModal();
      return go(name === "resume-yes" ? "resume" : "profile", {}, true);
    }

    if (name === "wishlist") {
      toggleAccountList("wishlists", id);
      redrawPreservingInputs();
      return;
    }

    if (name === "compare-toggle") {
      toggleAccountList("comparisons", id);
      redrawPreservingInputs();
      return;
    }

    if (name === "job-mode") {
      jobMode = id;
      return render();
    }

    if (name === "filters") {
      draftFilters = clone(jobFilters);
      return filterDialog();
    }

    if (name === "filter-add") {
      const input = $(`filter-${id}`);
      const value = input.value.trim();
      if (value && !draftFilters[id].some(v => v.toLowerCase() === value.toLowerCase())) {
        draftFilters[id].push(value);
      }
      if (id === "field") draftFilters.includeOpenField = false;
      if (input.tagName === "INPUT") input.value = "";
      $(`tags-${id}`).innerHTML = filterTags(id);
      updateFilterNotes();
      return;
    }

    if (name === "filter-remove") {
      const [key, index] = id.split("|");
      draftFilters[key].splice(Number(index), 1);
      $(`tags-${key}`).innerHTML = filterTags(key);
      updateFilterNotes();
      return;
    }

    if (name === "filter-clear") {
      draftFilters[id] = [];
      $(`tags-${id}`).innerHTML = "";
      updateFilterNotes();
      return;
    }

    if (name === "filter-clear-all") {
      draftFilters = emptyJobFilters();
      return filterDialog();
    }

    if (name === "filter-ai") {
      draftFilters = emptyJobFilters();
      draftFilters.field = me().major ? [me().major] : [];
      draftFilters.skills = [...me().skills];
      draftFilters.location = me().location ? [me().location] : [];
      draftFilters.includeOpenField = true;
      return filterDialog();
    }

    if (name === "histogram") return showHistogram(id);

    if (name === "review-start") {
      if (provider()) return tell("Use a participant account to submit a verified review.");
      const experience = me().experiences.find(item =>
        item.source === id && item.verified
      );
      return experience
        ? go("review", { id })
        : go("internship-proof", { source: id, returnToReview: true });
    }
  }, true);

  function updateFilterNotes() {
    if ($("fieldFilterNote")) {
      $("fieldFilterNote").hidden = !draftFilters.field.length;
      $("fieldFilterNote").textContent = draftFilters.includeOpenField
        ? "AI preset also includes internships with no specified academic background."
        : "When applied, only internships with required academic backgrounds will be displayed";
    }
    if ($("treatmentsFilterNote")) {
      $("treatmentsFilterNote").hidden = !draftFilters.treatments.length;
    }
  }

  function updateTagSuggestions() {
    const form = document.querySelector('form[data-form="x-forum-compose"]');
    if (!form || !$("tagSuggestions")) return;
    const text = `${form.elements.title.value} ${form.elements.body.value}`;
    const suggestions = [...new Set([...suggestTags(text), ...selectedTags])];

    $("tagSuggestions").innerHTML = suggestions.map(tag => xb(
      `#${esc(tag)}`, "tag-select", tag, "ic-chip",
      `aria-pressed="${selectedTags.includes(tag)}"`
    )).join("");

    $("chosenTags").innerHTML = selectedTags.length
      ? `<p class="muted">Selected: ${selectedTags.map(tag => `#${esc(tag)}`).join(" ")}</p>`
      : "";
  }

  document.addEventListener("input", event => {
    const form = event.target.closest("form");
    if (form?.dataset.form === "x-forum-compose" &&
        ["title", "body"].includes(event.target.name)) updateTagSuggestions();

    if (event.target.name === "minPay" && form?.dataset.form === "x-filters") {
      draftFilters.minPay = Number(event.target.value);
      $("minPayOutput").textContent = event.target.value;
    }

    if (event.target.name === "maxPay" && form?.dataset.form === "x-filters") {
      draftFilters.maxPay = Number(event.target.value);
      $("maxPayOutput").textContent = event.target.value;
    }
  });

  document.addEventListener("change", async event => {
    const element = event.target;

    if (element.name === "anonymous" && element.checked) {
      const type = element.form?.dataset.form;
      if (["x-forum-compose", "x-comment", "x-review"].includes(type)) {
        const isPost = type === "x-forum-compose";
        tell(`Please remember to keep your ${isPost ? "posts" : "comments"} friendly and helpful in anonymous mode too! : )`);
      }
    }

    if (element.name === "rating" && element.form?.dataset.form === "x-filters") {
      draftFilters.rating = element.value;
    }

    if (element.id === "profilePhoto") {
      const file = element.files?.[0];
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024) {
        element.value = "";
        return tell("Choose a PNG, JPEG or WebP image smaller than 5 MB.");
      }

      const accountId = currentUserId;
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 160;
        const context = canvas.getContext("2d");
        const size = Math.min(image.width, image.height);
        context.drawImage(image,
          (image.width - size) / 2, (image.height - size) / 2, size, size,
          0, 0, 160, 160);
        const user = getUser(accountId);
        if (user) user.photo = canvas.toDataURL("image/jpeg", .8);
        URL.revokeObjectURL(url);
        persist();
        if (currentUserId === accountId && route.name === "edit-profile") {
          redrawPreservingInputs();
          tell("Profile picture saved locally.");
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        tell("That image could not be opened.");
      };

      image.src = url;
    }
  });

  document.addEventListener("keydown", event => {
    if (!["Enter", " "].includes(event.key) ||
        event.target.closest("button, input, textarea, select, a")) return;

    const reply = event.target.closest("[data-reply-ref]");
    const job = event.target.closest("[data-job]");
    if (!reply && !job) return;
    event.preventDefault();
    if (reply) targetReply(reply.dataset.replyRef);
    else openJob(job.dataset.job);
  });

  document.addEventListener("submit", async event => {
    const form = event.target;
    const type = form.dataset.form;
    if (!type?.startsWith("x-")) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const data = new FormData(form);
    const text = key => String(data.get(key) || "").trim();
    const checked = key => data.has(key);

    if (type === "x-forum-search") {
      forumQuery = text("query");
      return render();
    }

    if (type === "x-forum-compose") {
      if (!text("title") || !text("body")) return tell("Enter a subject and inquiry.");
      const post = {
        id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
        title: text("title"), body: text("body"),
        tags: [...new Set([...selectedTags, ...parseTags(text("tags"))])].slice(0, 10),
        likes: [], views: 0, resolved: false, replies: [], created: timestamp()
      };
      db.forums.unshift(post);
      persist();
      dirty = false;
      selectedTags = [];
      await go("forum-detail", { id: post.id }, true);
      tell("Forum discussion published.");
      return;
    }

    if (type === "x-comment") {
      if (!text("text")) return tell("Write a comment first.");
      const kind = form.dataset.kind;
      const parent = form.dataset.parent;
      const container = kind === "forum-reply" ? getForum(parent) : getPost(parent);
      if (!container) return;
      const items = kind === "forum-reply" ? container.replies : container.reviews;
      const selected = replyingTo ? findItem(replyingTo) : null;
      const validTarget = selected && selected.kind === kind &&
        selected.parent === parent && selected.item;

      const comment = {
        id: uid(), owner: currentUserId, anonymous: checked("anonymous"),
        text: text("text"), parent: validTarget ? selected.item.id : null,
        likes: [], views: 0, created: timestamp()
      };
      items.push(comment);

      const target = kind === "forum-reply"
        ? { name: "forum-detail", id: parent }
        : { name: "internship", id: parent };

      const recipients = new Set([container.owner]);
      if (validTarget) recipients.add(selected.item.owner);
      for (const owner of recipients) notify(owner, "A discussion received a new reply.", target);

      replyingTo = null;
      persist();
      dirty = false;
      render();
      tell("Comment posted.");
      return;
    }

    if (type === "x-report") {
      if (!text("reason") && !text("details")) {
        return tell("Select a reason or enter an explanation.");
      }
      const found = findItem(form.dataset.reference);
      if (!found.item) return tell("This content is no longer available.");

      db.reports.push({
        id: uid(), owner: currentUserId, reference: form.dataset.reference,
        reason: text("reason"), details: text("details"),
        status: "Demo review completed—no enforcement",
        created: timestamp()
      });

      selfNotice(
        "Report result — classroom simulation: your report was recorded and the sample review is complete. No real moderation or removal was performed.",
        { name: "updates" }
      );
      persist();
      closeModal();
      redrawPreservingInputs();
      tell("Report recorded. A simulated result is available in the envelope’s Notifications tab.");
      return;
    }

    if (type === "x-profile") {
      if (!text("firstName") || !text("org")) return tell("Enter your first name and school/company.");
      const user = me();

      Object.assign(user, {
        firstName: text("firstName"), lastName: text("lastName"),
        preferredName: text("preferredName"), headline: text("headline"),
        org: text("org"), major: text("major"), location: text("location"),
        bio: text("bio")
      });

      if (user.kind === "participant") {
        user.degree = text("degree");
        user.year = text("year");
        user.graduation = text("graduation");
      }

      user.name = fullName(user);
      persist();
      dirty = false;
      await go("profile", {}, true);
      tell("Profile updated. Institutional changes are editable only for this simulation.");
      return;
    }

    if (type === "x-profile-item") {
      const typeName = route.type;
      const values = me()[typeName];
      if (!Array.isArray(values)) return;

      if (typeName === "experiences") {
        const item = values[route.index];
        if (!item || !text("position") || !text("employer") || !text("time")) {
          return tell("Complete the internship details.");
        }
        Object.assign(item, {
          position: text("position"), employer: text("employer"),
          time: text("time"), description: text("description")
        });
      } else {
        if (!text("value")) return tell("Enter a value.");
        if (route.index === undefined) values.push(text("value"));
        else values[route.index] = text("value");
      }

      persist();
      dirty = false;
      await back();
      tell("Saved.");
      return;
    }

    if (type === "x-identity") {
      if (text("proof") !== "valid") {
        return tell("Sample verification failed. Select a valid sample document and try again.");
      }

      const user = me();
      user.verified = true;
      user.major ||= user.kind === "provider" ? "People & Talent" : "Business";
      user.location ||= "Hong Kong";
      user.degree ||= "Undergraduate";
      user.year ||= "3";
      user.graduation ||= "2027";

      selfNotice("Identity verification passed — sample result.", { name: "profile" });
      persist();
      dirty = false;
      await go("profile", {}, true);

      if (user.kind === "participant") {
        showModal("Would you like to upload your résumé?", `
          <p>Use a fictional sample file. Extraction is simulated.</p>
          <div class="row">
            ${xb("Yes", "resume-yes")}
            ${xb("Not now", "resume-no")}
          </div>`);
      }
      return;
    }

    if (type === "x-resume") {
      const file = form.elements.resume.files?.[0];
      if (!file || !/\.(pdf|docx)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
        return tell("Choose a .pdf or .docx file smaller than 10 MB.");
      }

      me().resumeDemo = true;
      me().skills = [...new Set([...me().skills, "Excel", "Communication"])];
      me().interests = [...new Set([...me().interests, "Product design", "Analytics"])];
      me().strengths = ["Communication", "Structured thinking", "Teamwork"];

      if (!me().experiences.some(item => item.resumeSample)) {
        me().experiences.push({
          id: uid(), source: "p-harbour", verified: false, resumeSample: true,
          position: "Product Design Intern",
          employer: "Harbour Studio",
          time: "Sample: June–July 2026",
          description: "Sample résumé extraction—not read from your file."
        });
      }

      selfNotice("Sample résumé data added. Verify internship experience in Edit profile.", { name: "edit-profile" });
      persist();
      dirty = false;
      await go("profile", {}, true);
      tell("Demo résumé data applied. Your file was not uploaded, stored or parsed.");
      return;
    }

    if (type === "x-internship-proof") {
      if (text("proof") !== "valid") {
        selfNotice("Internship proof was not verified — invalid sample document.", { name: "internship-proof" });
        persist();
        return tell("Verification failed. Select a valid sample document and retry.");
      }

      const post = getPost(text("source"));
      if (!post?.live || post.type !== "official") return;
      let experience = me().experiences.find(item => item.source === post.id);
      const values = {
        source: post.id, verified: true,
        position: post.live.job, employer: post.live.company,
        time: `Sample internship · ${post.live.duration} weeks`,
        description: "Sample generated description: contributed to team projects, received feedback and developed practical skills."
      };

      if (experience) Object.assign(experience, values);
      else me().experiences.push({ id: uid(), ...values });

      selfNotice(
        "Internship proof verified — sample result. Open the internship and select Post my review.",
        { name: "internship", id: post.id }
      );

      persist();
      dirty = false;
      await go("internship", { id: post.id }, true);
      tell("Sample proof verified and added to Me. You can now select Post my review.");
      return;
    }

    if (type === "x-job-search") {
      jobQuery = text("query");
      searchedJobs = true;
      return render();
    }

    if (type === "x-filters") {
      draftFilters.minPay = Number(text("minPay"));
      draftFilters.maxPay = Number(text("maxPay"));
      draftFilters.rating = text("rating");

      if (draftFilters.minPay > draftFilters.maxPay) {
        return tell("The lower pay value must not exceed the upper value.");
      }

      jobFilters = clone(draftFilters);
      searchedJobs = true;
      jobMode = "search";
      closeModal();
      render();
      return;
    }

    if (type === "x-review") {
      const post = getPost(route.id);
      const verified = me().experiences.some(item =>
        item.source === route.id && item.verified
      );
      if (!post || !verified || provider()) return tell("Verified participant experience is required.");

      const previous = post.reviews.find(item =>
        item.owner === currentUserId && item.ratings
      );

      const ratings = {};
      const treatment = {};
      ASPECTS.forEach((aspect, index) => ratings[aspect] = Number(text(`r${index}`)));
      TREATMENTS.forEach((label, index) => treatment[label] = text(`t${index}`));

      if (Object.values(ratings).some(value => !Number.isInteger(value) || value < 0 || value > 5)) {
        return tell("Each rating must be from 0 to 5.");
      }

      const values = {
        owner: currentUserId, anonymous: checked("anonymous"),
        text: text("text"), ratings, treatment
      };

      if (previous) Object.assign(previous, values);
      else post.reviews.push({
        id: uid(), ...values, parent: null, likes: [],
        views: 0, created: timestamp()
      });

      notify(post.owner, "Your internship received a verified demo review.",
        { name: "internship", id: post.id });

      persist();
      dirty = false;
      await go("internship", { id: post.id }, true);
      tell(previous ? "Review updated." : "Review published.");
      return;
    }
  }, true);

  migrate();
  persist();
  render();
}
