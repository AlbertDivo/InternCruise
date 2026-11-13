"use strict";

{
  /* This file extends the previous InternCruise app.js.
     All credentials, documents, AI results and moderation are simulations. */

  const ICONS = {
    ship: `<path d="M9.5 5V2.5h5V5M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M2.5 12 12 9l9.5 3c-1.2 4.7-3.8 7-6.7 6.5L12 18l-2.8.5C6.3 19 3.7 16.7 2.5 12ZM12 9v9M1.5 21c2-1.5 3-1.5 5 0s3 1.5 5 0 3-1.5 5 0 3 1.5 5 0"/><path d="M9 7.5h.5m5 0h.5" stroke-width="1.8"/>`,
    heart: `<path d="M20 4c-3-2-6 0-8 2-2-2-5-4-8-2-5 4 0 10 8 16 8-6 13-12 8-16Z"/>`,
    eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>`,
    bookmark: `<path d="M6 3h12v19l-6-4-6 4V3Z"/>`,
    like: `<path d="M8 10 12 3c2 0 3 2 2 5h5c2 0 2 2 1 4l-2 7H8V10ZM3 10h5v10H3Z"/>`,
    chat: `<path d="M21 11c0 5-4 8-9 8H8l-5 3 1-6a8 8 0 0 1-2-5c0-5 4-8 10-8s9 3 9 8Z"/>`,
    building: `<path d="M3 21h18M5 21V6l7-3 7 3v15M9 8h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M11 21v-3h2v3"/>`,
    compare: `<path d="M12 3v18M6 21h12M3 7h18M6 7l-4 7h8L6 7Zm12 0-4 7h8l-4-7Z"/>`,
    search: `<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>`,
    me: `<circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="9" r="3"/>
      <path d="M5.5 19c.8-5 12.2-5 13 0"/>`,
    mail: `<rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="m3 6 9 7 9-7"/>`,
    posts: `<rect x="3" y="3" width="12" height="18" rx="2"/>
      <path d="M6 7h5M6 11h3M6 15h2"/>
      <path d="M12 17c-.3-4.7 2.2-10.8 6.8-12.4
        1.4-.5 2.3.3 2.1 1.7-.5 4.8-4 9.2-8.9 10.7Z"/>
      <path d="M11 20c1.2-4.1 3.7-8.1 6.9-11.4"/>`,
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

    addPostSamples();

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

  function addPostSamples() {
    if (db.postsDemoSamples) return;
    const examples = [
      ["design-research", "u-sharer", "p-harbour", "Interviewing users taught me more than polishing screens", "My first week at Harbour Studio was all about UX research. I learned to ask open questions, take useful notes and turn interviews into a clear design decision.", 12, 5, 86],
      ["design-portfolio", "u-sharer", "p-harbour", "Three things I added to my design portfolio", "A problem statement, an early prototype and one decision I changed after feedback. At Harbour Studio, explaining my thinking mattered more than making every slide look perfect.", 22, 9, 143],
      ["design-feedback", "u-maya", "p-harbour", "How I asked for feedback without feeling awkward", "I started bringing two specific questions to each mentor meeting. During my product design internship at Harbour Studio, that made feedback much easier to act on.", 7, 3, 41],
      ["data-sql", "u-ryan", "p-orbit", "My first SQL task was not what I expected", "At Orbit Analytics I spent more time checking missing values than building dashboards. SQL joins and a simple Excel checklist helped me catch mistakes before presenting results.", 31, 12, 219],
      ["data-teamwork", "u-maya", "p-orbit", "A business student can contribute to a data team", "I translated a business question into a dashboard brief at Orbit Analytics. Clear communication and Excel were useful even before I became confident with SQL.", 16, 8, 104],
      ["data-anonymous", "u-ryan", "p-orbit", "What I wish I had asked about overtime", "Before accepting a data internship, ask how deadlines are set and who you can speak to when tasks pile up. My experience at Orbit Analytics taught me to ask early rather than assume.", 45, 17, 308, true],
      ["marketing-campaign", "u-maya", "sample-marketing", "From lecture theories to my first marketing campaign", "At Harbour Studio I helped plan a social media campaign, write a content calendar and compare results in Excel. My biggest lesson was to test one message at a time.", 19, 11, 128],
      ["marketing-anonymous", "u-sharer", "sample-marketing", "A small team meant I had to learn fast", "My marketing internship at Harbour Studio involved writing copy, presenting ideas and asking for help. The first presentation was scary, but weekly feedback made a real difference.", 9, 4, 65, true],
      ["software-testing", "u-ryan", "sample-software", "The bug that taught me to write a test first", "During my software internship at Orbit Analytics, I reproduced a broken search filter before changing the code. A tiny test saved us from breaking the same feature twice.", 28, 14, 186],
      ["operations-excel", "u-maya", "sample-operations", "One spreadsheet saved our team hours each week", "In operations at Harbour Studio, I organised incoming requests in Excel and documented the handover. A clear process was more useful than a complicated tool.", 11, 6, 72]
    ];
    const listings = [
      ["sample-marketing", "u-provider", "Harbour Studio", "Marketing Intern", 8, "Build your first campaign with our team", "Plan social media content, research audiences and report campaign results. A mentor will help you develop your ideas and presentation skills.", "Communication, writing and basic Excel skills.", "Hybrid", 65, ["Business", "Marketing"], ["Communication", "Excel"]],
      ["sample-software", "u-orbit", "Orbit Analytics", "Software Engineering Intern", 12, "Help build tools that make data useful", "Work on search interfaces, fix small bugs and write tests with our engineering team. Bring curiosity and a small programming project.", "Basic JavaScript or Python and an interest in testing.", "Hybrid", 95, ["Computer Science"], ["JavaScript", "Python"]],
      ["sample-operations", "u-provider", "Harbour Studio", "Operations Intern", 4, "Make everyday teamwork run more smoothly", "Organise project information, improve handover checklists and support scheduling. This short internship is ideal for someone who enjoys clear communication.", "Organisation, communication and spreadsheet skills.", "Offline", 60, ["Business"], ["Excel", "Communication"]],
      ["sample-finance", "u-orbit", "Orbit Analytics", "Finance Intern", 10, "Explore the numbers behind a growing business", "Support budget tracking, prepare simple reports and help the finance team understand monthly costs. Learn how a business turns records into decisions.", "Basic accounting knowledge and confidence with Excel.", "Remote", 80, ["Business", "Accounting"], ["Excel", "Accounting"]]
    ];
    listings.forEach(([id, owner, company, job, duration, title, body, requirements, arrangement, pay, fields, skills], index) => {
      if (getPost(id)) return;
      db.posts.push({
        id, owner, type: "official", anonymous: false,
        live: { company, job, duration, title, body, requirements,
          location: "Hong Kong", pay: `HK$${pay}/hour · Sample figure`, deadline: "" },
        draft: null, review: "live", access: "none", reason: "", closed: false,
        likes: [], sampleLikes: 6 + index * 4, sampleFavorites: 2 + index,
        views: 40 + index * 23, questions: [],
        created: new Date(Date.UTC(2026, 10, 11 - index, 8)).toISOString()
      });
      const post = prepareJob(getPost(id));
      Object.assign(post.jobMeta, { arrangement, payMin: pay, payMax: pay, fields, skills });
    });
    examples.forEach(([key, owner, source, title, body, likes, saves, views, anonymous = false], index) => {
      const id = `sample-post-${key}`;
      if (getPost(id)) return;
      const listing = getPost(source).live;
      const user = getUser(owner);
      db.posts.push({
        id, owner, source, type: "experience", anonymous, certificate: true,
        live: { title, body, company: listing.company, job: listing.job,
          duration: listing.duration, school: user.org, major: user.major },
        likes: [], sampleLikes: likes, sampleFavorites: saves, views, questions: [],
        created: new Date(Date.UTC(2026, 10, 12 - index, 7)).toISOString()
      });
    });
    db.postsDemoSamples = true;
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
  const myFavorites = () => [...new Set([...(db.saved?.[currentUserId] || []).map(id => favoriteKey("post", id)), ...(db.favorites[currentUserId] || [])])];
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

  function currentNavigationTab() {
    const isAuthorProfile = page => page.name === "profile" &&
      page.actor && page.actor !== currentUserId;
    // Author profiles belong to the section they were opened from, not Me.
    const page = isAuthorProfile(route)
      ? [...navigation].reverse().find(entry => !isAuthorProfile(entry)) || { name: "posts" }
      : route;
    return page.name.startsWith("forum") || page.name === "hashtag"
      ? "forum"
      : ["internships", "comparisons", "internship", "review", "internship-proof"].includes(page.name)
        ? "internships"
        : ["posts", "create", "experience", "post"].includes(page.name)
          ? "posts"
          : ["profile", "edit-profile", "favorites", "profile-item", "resume", "career-profile", "full-profile", "workspace", "listing"].includes(page.name)
            ? "profile" : "home";
  }

  const originalRender = render;

  render = function () {
    migrate();
    originalRender();
    $("screen").dataset.page = route.name;
    document.querySelector(".phone").dataset.page = route.name;

    const tab = currentNavigationTab();

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
    syncRewardAd();
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

  function positionPhoneFilters() {
    const phoneScoped = modal.classList.contains("ic-filter-dialog") ||
      modal.classList.contains("ic-phone-overlay");

    if (!modal.open || !phoneScoped) return;

    const phone = document.querySelector(".phone");
    if (!phone) return;

    const bounds = phone.getBoundingClientRect();

    modal.style.left = `${bounds.left + phone.clientLeft}px`;
    modal.style.top = `${bounds.top + phone.clientTop}px`;
    modal.style.width = `${phone.clientWidth}px`;
    modal.style.height = `${phone.clientHeight}px`;
  }

  const filterResize = new ResizeObserver(positionPhoneFilters);
  modal.addEventListener("close", () => {
    filterResize.disconnect();
    window.removeEventListener("scroll", positionPhoneFilters, true);
    window.removeEventListener("resize", positionPhoneFilters);
    modal.removeAttribute("style");
  });

  function showModal(title, content, className = "") {
    // Remove positioning left over from a previous phone-scoped dialog.
    filterResize.disconnect();
    window.removeEventListener("scroll", positionPhoneFilters, true);
    window.removeEventListener("resize", positionPhoneFilters);
    modal.removeAttribute("style");

    modal.className = className;
    modal.setAttribute("aria-label", title);

    const isFilter = className === "ic-filter-dialog";
    const isPhoneOverlay = className === "ic-phone-overlay";
    const wrapperClass = isFilter
      ? "ic-filter-panel"
      : isPhoneOverlay ? "ic-phone-modal-card" : "stack";

    modal.innerHTML = `<div class="${wrapperClass}">
      ${isFilter ? "" : `
        <div class="row between ic-modal-heading">
          <h2>${esc(title)}</h2>
          ${xb(
            "×",
            "close-modal",
            "",
            "secondary",
            'aria-label="Close dialog"'
          )}
        </div>
      `}
      ${content}
    </div>`;

    if (!modal.open) modal.showModal();

    if (isFilter || isPhoneOverlay) {
      positionPhoneFilters();
      filterResize.observe(document.querySelector(".phone"));
      window.addEventListener("scroll", positionPhoneFilters, true);
      window.addEventListener("resize", positionPhoneFilters);
    }
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  const journeyArt = `<svg viewBox="0 0 400 275" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#e8f8ef" d="M-20 70C55 35 91 67 151 48s94-2 125-24 78-15 145 2v226c-70 36-113-5-181 6S89 293-20 243Z"/>
        <path fill="#d4f1e2" d="M-6 99 39 83l19 17 30-10 14 17-5 20-28 5-12 27-37 2-28-23Zm120-38 30-4 7 13-11 19-23-7Zm182-29 34 2 12 16-9 14-32-9-12-13Zm51 55 59-2 14 40-23 11-20-17-27-4ZM254 205l23 3 6 13-22 7-17-9Z"/>
        <path d="M78 218c56 9 92-13 100-57 9-48 53-47 76-77" stroke="#0b6b58" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 6"/>
        <g stroke="#09846a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
          <path d="m30 217 17 16h37l19-26-73 10Z" fill="#fbfffc"/><path d="m47 214 5-14 28-5 10 14M59 199v-8h14v6M30 239q12-6 24 0t24 0 24 0"/>
          <path d="M168 145c0-13-20-13-20 0 0 8 10 16 10 16s10-8 10-16Z" fill="#fcfffd"/><circle cx="158" cy="144" r="3" fill="#09846a"/>
          <path d="M264 77c0-13-20-13-20 0 0 8 10 16 10 16s10-8 10-16Z" fill="#fcfffd"/><circle cx="254" cy="76" r="3" fill="#09846a"/>
          <path d="M300 78V49l15-11 15 11v29m-38 0h47m-34-1V62h8v15m7-26h3m-18 1h3m7-14V23l18 4-5 7-13-3"/>
        </g>
        <ellipse cx="69" cy="245" rx="47" ry="6" fill="#b6e5ce" opacity=".55"/>
      </svg>`;

  pages.welcome = () => `
    <div class="welcome-map" aria-hidden="true">
      ${journeyArt}
    </div>
    <div class="welcome-copy"><h1>Know where<br>you’re headed.</h1>
      <p>Discover internships. Learn from<br>people who’ve been there.</p></div>
    <div class="welcome-actions">${button("Get started →", "account", "", "wide")}
      ${button("Log in", "login", "", "secondary wide")}</div>
    <p class="welcome-footnote">Classroom demo · Fictional data</p>`;

  function messagingTrialBalance() {
    return Math.max(0, Number(db.messagingTrials?.[currentUserId]) || 0);
  }

  function homeExplorePosts() {
    const posts = [
      {
        category: "Internship advice",
        title: "A small checklist for your first day",
        body: "Sample advice: prepare a short introduction, write down a few questions and think about what you would like to learn."
      },
      {
        category: "App using guide",
        title: "Plan your next step with InternCruise",
        body: "Example walkthrough: explore internships, save interesting roles to your wishlist and try comparing two opportunities."
      },
      {
        category: "Industry trends",
        title: "Imagining tomorrow’s internship skills",
        body: "Fictional trend story: our imaginary workplaces are exploring new ways to combine communication, creative thinking and digital tools."
      }
    ];

    return `<section class="ic-home-explore" aria-labelledby="homeExploreTitle">
      <h2 id="homeExploreTitle">What’s for you to explore?</h2>
  
      <p class="ic-explore-disclaimer">
        Nothing in these sample official posts is factually credible.
        All content is solely for demonstration purposes.
      </p>

      ${posts.map(post => `
        <article class="card ic-editorial-post">
          <div class="ic-editorial-author">
            ${icon("ship")}
            <strong>InternCruise</strong>
            <span class="badge">Official · Demo</span>
          </div>
          <p class="ic-editorial-category">${esc(post.category)}</p>
          <h3>${esc(post.title)}</h3>
          <p>${esc(post.body)}</p>
        </article>
      `).join("")}
    </section>`;
  }

  pages.home = () => `${heading("Your next starting point", "", false)}
    <p>Explore opportunities, learn from other students and build your next step.</p>
  
    <div class="home-journey" aria-hidden="true">${journeyArt}</div>
  
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
    </section>
  
    <section class="card ic-reward-section">
      <h2>Advertisements for rewards</h2>
      <p>Watch advertisements here to earn access to our VIP functions.</p>
  
      ${xb("Watch ads", "watch-ad", "", "wide")}
  
      ${messagingTrialBalance() ? `
        <p class="muted">
          ${messagingTrialBalance()} free private messaging
          ${messagingTrialBalance() === 1 ? "trial" : "trials"} available.
        </p>
        ${xb("Use a messaging trial", "navigate", "trial-people", "link-button")}
      ` : ""}
  
      <p class="ic-subtle">Demo rewards only · No real advertisements or purchases.</p>
    </section>
  
    ${homeExplorePosts()}`;

  // Preserve the previous feed, but move it to Posts.
  let postsMode = "recommended";
  let postsQuery = "";

  function postsForFeed() {
    const query = postsQuery.toLowerCase();
    const posts = db.posts.filter(post => post.live && post.type === filters.type &&
      [post.live.title, post.live.body, post.live.company, post.live.job, authorName(post)]
        .some(value => String(value || "").toLowerCase().includes(query)));
    if (postsMode === "all") {
      return posts.sort((a, b) => String(b.created).localeCompare(String(a.created)));
    }
    return rank(posts, "post").sort((a, b) =>
      Number(relatedPerson(b.owner, b.anonymous)) - Number(relatedPerson(a.owner, a.anonymous)));
  }

  function socialPostCard(post) {
    const data = post.live;
    const user = post.anonymous ? null : getUser(post.owner);
    const connected = relatedPerson(post.owner, post.anonymous);
    const reference = `post||${post.id}`;
    return `<article class="card ic-social-post">
      <header class="ic-social-author">
        ${avatar(user)}
        <div>${authorButton(post)}
          <p class="muted">${esc(post.anonymous ? "Anonymous community member" : user?.kind === "provider" ? user.org : `${user?.org || "Community"} · ${user?.major || user?.identity || "Member"}`)}</p>
          <p class="muted">${esc(dateLabel(post.created))} · ${post.type === "official" ? "Official post" : "Experience share"}</p>
        </div>
      </header>
      ${postsMode === "recommended" && connected
        ? '<p class="ic-social-connection">Alumni / major connection</p>' : ""}
      <h2>${esc(data.title)}</h2>
      <p class="preserve ic-social-body">${esc(data.body)}</p>
      <p class="ic-social-context">${icon("building")}${esc(data.company)} · ${esc(data.job)}${data.duration ? ` · ${esc(data.duration)} weeks` : ""}</p>
      ${post.closed ? '<p class="badge">Applications closed</p>' : ""}
      ${engagementActions(post, "post")}
    </article>`;
  }

  pages.posts = () => {
    const posts = postsForFeed();
    return `<div class="row between ic-social-heading"><h1>Posts</h1>
        ${button("＋ Post", "create")}</div>
      <nav class="ic-post-categories" aria-label="Post category">
        ${xb("Experience Share", "posts-category", "experience", "secondary",
          `aria-pressed="${filters.type === "experience"}"`)}
        ${xb("Official Posts", "posts-category", "official", "secondary",
          `aria-pressed="${filters.type === "official"}"`)}
      </nav>
      <nav class="ic-post-order" aria-label="${filters.type === "experience" ? "Experience Share" : "Official Posts"} options">
        ${xb("Recommended for you", "posts-mode", "recommended", "secondary",
          `aria-pressed="${postsMode === "recommended"}"`)}
        ${xb("All posts", "posts-mode", "all", "secondary",
          `aria-pressed="${postsMode === "all"}"`)}
      </nav>
      <form data-form="x-posts-search" class="ic-social-search" role="search">
        ${field("Search posts", "query", postsQuery, "search", false,
          'placeholder="Search stories, companies, roles or authors"')}
        <div class="row"><button>Search</button>${xb("Clear", "posts-clear")}</div>
      </form>
      <p class="muted feed-explainer">${postsMode === "recommended"
        ? "Your connections first, then likes, saves & views."
        : "Latest posts first."}</p>
      <p class="muted feed-demo-note">Fictional demo posts · Sample interaction counts</p>
      <p class="muted" role="status">${posts.length} ${posts.length === 1 ? "post" : "posts"}</p>
      <div class="ic-social-feed">${posts.map(socialPostCard).join("") ||
        '<p class="empty">No posts found. Try another search or category.</p>'}</div>`;
  };

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
    const reference = `${kind}|${parent}|${item.id}`;
    const liked = item.likes?.includes(currentUserId) || false;
    const favorited = isFavorite(kind, item.id);

    let replies = 0;
    let replyAction = "reply-to";
    let replyTarget = reference;
    let replyLabel = "Replies";

    if (kind === "post") {
      replies = (item.questions || []).reduce(
        (total, question) => total + 1 + (question.replies || []).length,
        0
      );
      replyAction = "post-open";
      replyTarget = item.id;
      replyLabel = "Comments";
    } else if (kind === "forum") {
      replies = (item.replies || []).length;
      replyAction = "forum-open";
      replyTarget = item.id;
    } else {
      const items = kind === "forum-reply"
        ? getForum(parent)?.replies || []
        : getPost(parent)?.reviews || [];

      replies = items.filter(reply => reply.parent === item.id).length;
    }

    const stat = (image, count) =>
      `${icon(image)}<span>${esc(count)}</span>`;

    return `<div class="ic-actions ic-engagement" aria-label="Content interactions">
      ${xb(
        stat("heart", likesOf(item)),
        "like",
        reference,
        "secondary ic-engagement-stat ic-like",
        `aria-label="${liked ? "Unlike" : "Like"} · ${likesOf(item)} likes"
         aria-pressed="${liked}" title="Likes"`
      )}

      ${xb(
        stat("star", favoriteCount(kind, item)),
        "favorite",
        reference,
        "secondary ic-engagement-stat ic-favorite",
        `aria-label="${favorited ? "Remove favorite" : "Favorite"} · ${favoriteCount(kind, item)} favorites"
         aria-pressed="${favorited}" title="Favorites"`
      )}

      ${xb(
        stat("chat", replies),
        replyAction,
        replyTarget,
        "secondary ic-engagement-stat",
        `aria-label="${replyLabel}: ${replies}" title="${replyLabel}"`
      )}

      <span class="ic-engagement-stat ic-view-count"
        aria-label="${esc(item.views || 0)} views" title="Views">
        ${stat("eye", item.views || 0)}
      </span>

      ${xb(
        `${icon("warning")}<span>Report</span>`,
        "report",
        reference,
        "link-button ic-report",
        'aria-label="Report this content"'
      )}
    </div>`;
  }

  function expandedForumCard(post) {
    return `<article class="card">
      <h2>${helpfulMark(post)}${esc(post.title)}</h2>
      <p class="preserve">${esc(post.body.slice(0, 180))}${post.body.length > 180 ? "…" : ""}</p>
      ${statusMarkup(post.resolved)}
      <p class="muted">${esc(authorName(post))}</p>
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
    if (kind === "post") item = getPost(id);
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
    const posts = db.posts.filter(post => post.live && isFavorite("post", post.id));
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
      <h2>Posts (${posts.length})</h2>
      ${posts.map(socialPostCard).join("") || '<p class="muted">No saved posts yet. Save a post from Posts to find it here.</p>'}
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
          Classroom simulation: reports stay in this browser.
          No real moderation team receives them.
        </p>

        <p class="warning" data-report-error role="alert" hidden></p>

        <button class="wide">Submit report</button>
      </form>
    `, "ic-phone-overlay");
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

  const meViews = {};
  const meCategories = {
    published: ["posts", "forum"], comments: ["posts", "forum", "internships"],
    saved: ["posts", "forum", "internships"], liked: ["posts", "forum", "internships"]
  };

  function meView() {
    return meViews[currentUserId] ??= { tab: "published", categories: {}, scroll: {} };
  }

  function profileEntries() {
    const entries = [];
    const add = (item, kind, category, title, page, source, comment = false) => {
      entries.push({ item, kind, category, title, page, source, comment,
        key: `${kind}|${source}|${item.id}` });
    };
    for (const post of db.posts.filter(post => post.live)) {
      add(post, "post", "posts", post.live.title, "post", post.id);
      for (const question of post.questions || []) {
        add(question, "question", "posts", post.live.title, "post", post.id, true);
        for (const reply of question.replies || []) {
          add(reply, "question-reply", "posts", post.live.title, "post", post.id, true);
        }
      }
      for (const review of post.reviews || []) {
        add(review, "review", "internships", post.live.job, "internship", post.id, true);
      }
    }
    for (const forum of db.forums) {
      add(forum, "forum", "forum", forum.title, "forum-detail", forum.id);
      for (const reply of forum.replies || []) {
        add(reply, "forum-reply", "forum", forum.title, "forum-detail", forum.id, true);
      }
    }
    return entries;
  }

  function meEntries(tab, category) {
    return profileEntries().filter(entry => {
      if (entry.category !== category) return false;
      if (tab === "published") return !entry.comment && entry.item.owner === currentUserId;
      if (tab === "comments") return entry.comment && entry.item.owner === currentUserId;
      if (tab === "saved") return isFavorite(entry.kind, entry.item.id);
      return entry.item.likes?.includes(currentUserId);
    }).sort((a, b) => tab === "saved"
      ? myFavorites().indexOf(favoriteKey(b.kind, b.item.id)) - myFavorites().indexOf(favoriteKey(a.kind, a.item.id))
      : String((tab === "liked" ? b.item.likedAt?.[currentUserId] : null) || b.item.created || "")
        .localeCompare(String((tab === "liked" ? a.item.likedAt?.[currentUserId] : null) || a.item.created || "")));
  }

  function meEntryCard(entry, tab) {
    const { item, kind, key, title, comment } = entry;
    const text = comment ? item.text || "Ratings-only review" : item.live?.body || item.body;
    const ownAnonymous = item.owner === currentUserId && item.anonymous;
    return `<article class="card me-entry">
      <div class="row between"><small class="muted">${comment ? "Comment on" : kind === "forum" ? "Discussion" : "Post"}</small>
        ${ownAnonymous ? '<span class="badge">Posted anonymously</span>' : ""}</div>
      <h3>${esc(title)}</h3>
      <p class="preserve">${esc(text || "")}</p>
      <small class="muted">${esc(dateLabel(item.created))}</small>
      <div class="row me-entry-actions">
        ${xb(comment ? "View comment →" : "Open →", "me-open", key, "link-button")}
        ${tab === "saved" ? xb("Unsave", "favorite", key, "link-button") : ""}
        ${tab === "liked" ? xb("Unlike", "like", key, "link-button") : ""}
      </div>
    </article>`;
  }

  function renderStudentMe(user) {
    const view = meView();
    const category = view.categories[view.tab] || "posts";
    const entries = meEntries(view.tab, category);
    const all = profileEntries();
    const owned = all.filter(entry => entry.item.owner === currentUserId);
    const likes = owned.reduce((sum, entry) => sum + likesOf(entry.item), 0);
    const wished = allJobs().filter(post => (db.wishlists[currentUserId] || []).includes(post.id)).reverse();
    const savedCount = all.filter(entry => isFavorite(entry.kind, entry.item.id)).length + wished.length;
    const browse = category === "forum" ? "forum" : category === "internships" ? "internships" : "posts";
    return `<section class="me-overview">
      <div class="row between"><span class="eyebrow">My profile</span>
        <details class="me-settings"><summary aria-label="Account settings">${icon("me")} Settings</summary>
          <div>${button("Log out", "logout", "", "secondary wide")}</div>
        </details></div>
      <div class="profile-top">${avatar(user)}<div><h1>${esc(fullName(user))}</h1>
        <span class="badge">${esc(user.identity)} · Demo verified</span></div></div>
      <p class="me-school">${esc(user.org)} · ${esc(user.major || "Major not added")}</p>
      <p class="muted">${icon("pin")}${esc(user.location || "Location not added")}</p>
      <p class="me-bio">${esc(user.headline || user.bio || "Add a short introduction to your profile.")}</p>
      <div class="me-skills">${(user.skills || []).slice(0, 3).map(skill => `<span>${esc(skill)}</span>`).join("")}</div>
      <div class="me-stats"><div><strong>${owned.filter(entry => !entry.comment).length}</strong><span>Published</span></div>
        <div><strong>${likes}</strong><span>Likes received</span></div><div><strong>${savedCount}</strong><span>Saved items</span></div></div>
      ${button("Edit profile", "edit-profile", "", "secondary wide")}
    </section>
    <section class="card me-career-links" aria-label="Career and profile information">
      ${xb(`<span><strong>My résumé</strong><small>${user.resumeDemo ? "Sample résumé added · Update" : "Not added · Add a sample résumé"}</small></span><b>›</b>`, "navigate", "resume", "me-career-link")}
      ${xb(`<span><strong>Career profile</strong><small>${(user.experiences || []).length} ${(user.experiences || []).length === 1 ? "experience" : "experiences"} · Skills & interests</small></span><b>›</b>`, "navigate", "career-profile", "me-career-link")}
      ${xb('<span><strong>View full profile</strong><small>Education, graduation & about</small></span><b>›</b>', "navigate", "full-profile", "me-career-link")}
    </section>
    <section class="me-content">
      <div class="me-tabs-sticky">
        <nav class="me-tabs" aria-label="My content">
          ${[["published", "Published"], ["comments", "Comments"], ["saved", "Saved"], ["liked", "Liked"]].map(([key, label]) =>
            xb(label, "me-tab", key, "", `aria-pressed="${view.tab === key}" aria-controls="meContent"`)).join("")}
        </nav>
        <nav class="me-subtabs" aria-label="Content type">
          ${meCategories[view.tab].map(key => xb(key === "posts" ? "Posts" : key === "forum" ? "Forum" : "Internships",
            "me-category", key, "secondary", `aria-pressed="${category === key}" aria-controls="meContent"`)).join("")}
        </nav>
      </div>
      <div id="meContent" aria-label="${esc(view.tab)} ${esc(category)}">
        ${view.tab === "saved" && category === "internships" ? `<h2 class="me-section-label">Wishlisted internships (${wished.length})</h2>
          ${wished.map(jobRow).join("")}${entries.length ? '<h2 class="me-section-label">Saved internship comments</h2>' : ""}` : ""}
        ${entries.map(entry => meEntryCard(entry, view.tab)).join("")}
        ${!entries.length && !(view.tab === "saved" && category === "internships" && wished.length)
          ? `<div class="me-empty"><p>No ${view.tab === "published" ? "published content" : view.tab === "comments" ? "comments" : view.tab === "saved" ? "saved items" : "liked content"} here yet.</p>
            ${xb(`Explore ${category === "posts" ? "posts" : category === "forum" ? "Forum" : "internships"}`, "navigate", browse, "secondary")}</div>` : ""}
      </div>
    </section>`;
  }

  pages["career-profile"] = () => provider() ? missingPage() : `${heading("Career profile", "Your experience, skills and interests.")}
    <section class="card">${profileListSection(me(), "experiences", true)}</section>
    <section class="card">${profileListSection(me(), "skills", true)}${profileListSection(me(), "interests", true)}</section>`;

  pages["full-profile"] = () => provider() ? missingPage() : `${heading("Full profile")}
    <section class="card"><div class="profile-top">${avatar(me())}<h1>${esc(fullName(me()))}</h1></div>
      <dl class="meta"><dt>School</dt><dd>${esc(me().org)}</dd><dt>Major</dt><dd>${esc(me().major || "Not added")}</dd>
        <dt>Study</dt><dd>${esc(me().degree)} · Year ${esc(me().year)}</dd><dt>Graduation</dt><dd>${esc(me().graduation || "Not added")}</dd>
        <dt>Location</dt><dd>${esc(me().location || "Not added")}</dd></dl>
      <h2>About</h2><p class="preserve">${esc(me().bio || "No bio yet.")}</p>
      ${button("Edit profile", "edit-profile", "", "wide")}</section>`;

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

    if (user.kind === "provider" && !anonymous) {
      const listings = db.posts.filter(post => post.type === "official" && post.owner === user.id);
      const published = listings.filter(post => post.live);
      const inquiries = own ? db.chats.filter(chat =>
        chat.context.startsWith("listing:") &&
        chat.participants.some(person => actorOwner(person) === user.id)) : [];
      return `${own ? "" : button("← Back", "back", "", "link-button")}
        <section class="card company-overview">
          <div class="profile-top">${avatar(user)}<div>
            <h1>${esc(user.org)}</h1><span class="badge">Company employee · Demo verified</span>
          </div></div>
          <p><strong>${esc(user.headline || "")}</strong></p>
          <h2>About the company</h2>
          <p class="preserve">${esc(user.bio || "No company introduction yet.")}</p>
          <h2 class="sr-only">Company contact</h2>
          <div class="company-contact">
            <div>${icon("me")}<span><strong>${esc(fullName(user))}</strong><small>${esc(user.major || "Contact person")}</small></span></div>
            <div>${icon("pin")}<span>${esc(user.location || "Not added")}</span></div>
          </div>
          ${own ? button("Edit company profile", "edit-profile", "", "wide")
            : button("Message company", "message-actor", person, "wide")}
        </section>
        ${own ? `<section class="card stack company-management">
          <h2>Internship management</h2>
          <div class="company-stat-grid">
            <div><strong>${published.filter(post => !post.closed).length}</strong>Open</div>
            <div><strong>${published.filter(post => post.closed).length}</strong>Closed</div>
            <div><strong>${listings.filter(post => post.review === "pending").length}</strong>Pending</div>
          </div>
          ${button("Manage listings →", "workspace", "", "wide")}
        </section>
        <div class="company-links">${xb(`${icon("chat")} Messages & inquiries <span>›</span>`, "navigate", "inbox", "secondary wide")}
          ${xb("Favorites", "navigate", "favorites", "secondary wide")}
          ${button("Log out", "logout", "", "secondary wide")}</div>
        <details class="card company-inquiries">
          <summary>Internship inquiries (${inquiries.length})</summary>
          ${inquiries.map(chatRow).join("") || '<p class="muted">No internship inquiries yet. Questions sent from a listing will appear here.</p>'}
        </details>` : ""}
        <h2>Published internships (${published.length})</h2>
        <div class="company-listings">${published.map(post => xb(
          `<strong>${esc(post.live.job)}</strong><span>${esc(post.live.location)} · ${post.live.duration} weeks</span><b>${post.closed ? "Closed" : "Published"}</b>`,
          "job-open", post.id, "company-listing"
        )).join("") || '<p class="muted">No published internships yet.</p>'}</div>`;
    }

    if (own && user.kind === "participant") return renderStudentMe(user);

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
    return `${heading(user.kind === "provider" ? "Edit company profile" : "Edit profile")}
      <div class="ic-avatar-wrap">${avatar(user)}<span class="ic-pen">${icon("pen")}</span></div>
      <label>Change profile picture
        <input id="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp">
      </label>
      <p class="muted">Stored only in this browser. Choose a non-sensitive sample image.</p>
      <form data-form="x-profile" data-dirty>
        ${field(user.kind === "provider" ? "Contact first name" : "First Name", "firstName", user.firstName)}
        ${field(user.kind === "provider" ? "Contact last name" : "Last Name", "lastName", user.lastName, "text", false)}
        ${field("Additional/Preferred Name", "preferredName", user.preferredName, "text", false)}
        ${field("Headline", "headline", user.headline, "text", false)}
        ${field(user.kind === "provider" ? "Verified company" : "School", "org", user.org, "text", true,
          user.kind === "provider" ? "readonly" : "")}
        ${user.kind === "provider" ? '<p class="muted">Company name is linked to your verified identity and listings. Changing it requires re-verification; this demo keeps it fixed.</p>' : ""}
        ${field(user.kind === "provider" ? "Department" : "Major", "major", user.major, "text", false)}
        ${user.kind === "participant" ? `
          ${selectField("Undergraduate / Postgraduate", "degree", ["Undergraduate", "Postgraduate"], user.degree)}
          ${field("Current year", "year", user.year, "number", true, 'min="1" max="10"')}
          ${field("Year of Graduation", "graduation", user.graduation, "number", false, 'min="1950" max="2100"')}
        ` : ""}
        ${field("Location", "location", user.location, "text", false)}
        ${area(user.kind === "provider" ? "About the company" : "About", "bio", user.bio, false, 1200)}
        <button class="wide">Save profile</button>
      </form>
      ${user.kind === "participant" ? `<p class="muted">Save the fields above before opening a separate list editor.</p>
      ${profileListSection(user, "skills", true)}
      ${profileListSection(user, "interests", true)}
      ${profileListSection(user, "experiences", true)}` : ""}`;
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
      aria-label="Open ${esc(data.job)} at ${esc(data.company)}" data-job="${esc(post.id)}">
      <div class="ic-job-title"><h3>${esc(data.job)}</h3>
        ${xb(icon("heart"), "wishlist", post.id, "ic-heart", `aria-label="Wishlist internship" aria-pressed="${wished}"`)}</div>
      <p class="ic-job-company">${esc(data.company)} ${post.closed ? '<span class="badge">Closed</span>' : ""}</p>
      <div class="ic-job-tags">
        <span>${icon("pin")}${esc(data.location)}</span><span>${icon("computer")}${esc(meta.arrangement)}</span>
        <span>${icon("calendar")}${data.duration} weeks</span><span>${icon("clock")}HK$${meta.payMin}–${meta.payMax}/hr</span>
      </div>
      ${data.deadline ? `<p class="muted">Apply by ${esc(data.deadline)}</p>` : ""}
      <div class="ic-job-compare">${xb(`${icon("compare")} ${compared ? "Added to comparison" : "Compare"}`, "compare-toggle", post.id)}</div>
    </article>`;
  }

  function recommendationIntro() {
    const user = me();
    return `<h2>Recommended for you</h2>
      <p class="muted">Internships that may match your interests.</p>
      <details class="recommendation-details"><summary>Why these internships?</summary>
        <p>Based on ${esc(user.major || "your major")}, ${esc(user.skills.join(", ") || "your skills")} and ${esc(user.location || "your location")}.</p>
        <p>Demo: profile-based rules, not an AI model. You can edit these criteria in Filters.</p>
      </details>`;
  }

  pages.internships = () => {
    const jobs = allJobs();
    const wishlist = db.wishlists[currentUserId] || [];
    const recommendations = jobs.filter(recommendedJob);
    const results = jobs.filter(post =>
      jobMode === "wishlisted" ? wishlist.includes(post.id) : matchesJob(post)
    );

    return `<div class="ic-sticky row between">
        <h1>Find your next internship</h1>
        ${xb("Comparisons", "navigate", "comparisons")}
      </div>
      <p class="ic-subtle internship-demo-note">Explore opportunities. All listings are fictional demos.</p>
      <div class="feed-tabs">
        ${xb("Search", "job-mode", "search", "", `aria-pressed="${jobMode === "search"}"`)}
        ${xb("Wishlisted", "job-mode", "wishlisted", "", `aria-pressed="${jobMode === "wishlisted"}"`)}
      </div>

      ${jobMode === "search" ? `
        <form data-form="x-job-search">
          ${field("Search internships", "query", jobQuery, "text", false, 'placeholder="Search roles, companies or keywords"')}
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
          <p class="ic-large-hint">Looking for something specific?</p>
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

  let comparisonBase = "";
  let comparisonPeer = "";

  function comparisonSelection() {
    const ids = db.comparisons[currentUserId] || [];
    const jobs = allJobs().filter(post => ids.includes(post.id));
    const base = jobs.find(post => post.id === comparisonBase) || jobs[0];
    const others = jobs.filter(post => post !== base);
    const peer = others.find(post => post.id === comparisonPeer) || others[0];
    comparisonBase = base?.id || "";
    comparisonPeer = peer?.id || "";
    return { jobs, base, others, peer };
  }

  function refreshComparison() {
    const screen = $("screen");
    const scroll = screen.scrollTop;
    const focused = document.activeElement?.name;
    render();
    screen.scrollTop = scroll;
    if (["comparison-base", "comparison-peer"].includes(focused)) {
      screen.querySelector(`[name="${focused}"]`)?.focus({ preventScroll: true });
    }
  }

  function stepComparison(direction) {
    const { others, peer } = comparisonSelection();
    if (others.length < 2) return;
    comparisonPeer = others[(others.indexOf(peer) + direction + others.length) % others.length].id;
    refreshComparison();
  }

  pages.comparisons = () => {
    const { jobs, base, others, peer } = comparisonSelection();
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
    const choice = (post, options, isBase) => `<div class="comparison-choice ${isBase ? "comparison-base" : ""}">
      <label>${isBase ? "Baseline" : "Compare with"}
        <select name="comparison-${isBase ? "base" : "peer"}" aria-label="${isBase ? "Baseline internship" : "Comparison internship"}">
          ${options.map(p => `<option value="${esc(p.id)}" ${p.id === post.id ? "selected" : ""}>${esc(p.live.job)} · ${esc(p.live.company)}</option>`).join("")}
        </select>
      </label>
      <h2>${esc(post.live.job)}</h2>
      <p>${esc(post.live.company)}</p>
      <div class="comparison-choice-actions">
        ${xb("View role", "job-open", post.id, "link-button")}
        ${xb("×", "compare-toggle", post.id, "secondary", `aria-label="Remove ${esc(post.live.job)} at ${esc(post.live.company)} from comparisons"`)}
      </div>
    </div>`;

    return `${heading("Comparisons")}
      <div class="comparison-intro"><p>${jobs.length} selected · Compare two at a time</p>
        ${xb("Add roles", "navigate", "internships", "link-button")}</div>
      ${jobs.length ? `<section class="comparison-board" aria-label="Internship comparison">
        <div class="comparison-sticky">
          <div class="comparison-choices">
            ${choice(base, jobs, true)}
            ${peer ? choice(peer, others, false) : `<div class="comparison-choice comparison-placeholder"><p>Add another role to compare.</p>${xb("Browse roles", "navigate", "internships", "secondary")}</div>`}
          </div>
          ${others.length > 1 ? `<div class="comparison-switcher">
            ${xb("←", "comparison-step", "-1", "secondary", 'aria-label="Previous comparison internship"')}
            <span role="status" aria-live="polite">${others.indexOf(peer) + 1} of ${others.length} · Swipe to switch</span>
            ${xb("→", "comparison-step", "1", "secondary", 'aria-label="Next comparison internship"')}
          </div>` : ""}
        </div>
        <div class="comparison-details">${rows.map(([label, value]) => `<section class="comparison-aspect">
          <h2>${esc(label)}</h2>
          <div class="comparison-values">
            <p aria-label="${esc(base.live.job)} · ${esc(label)}">${esc(value(base) || "Not specified")}</p>
            <p ${peer ? `aria-label="${esc(peer.live.job)} · ${esc(label)}"` : ""}>${peer ? esc(value(peer) || "Not specified") : "—"}</p>
          </div>
        </section>`).join("")}</div>
      </section>` : '<p class="empty">Add internships using “Compare” to start your comparison.</p>'}`;
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
  let rewardAdSession = null;
  let rewardAdTimer = null;
  let stopRewardAdPreview = null;
  let trialChatBusy = false;
  
  pages["reward-ad"] = () => {
    const session = rewardAdSession;
  
    if (!session || session.owner !== currentUserId) {
      return `${heading("Advertisement")}
        <p>Start an advertisement from Home to earn a demo reward.</p>
        ${xb("Back to Home", "navigate", "home", "wide")}`;
    }
  
    return `<section class="ic-reward-ad" aria-label="Reward advertisement">
      <div class="ic-ad-media" aria-hidden="true">
        <canvas id="rewardAdCanvas" width="720" height="1100"></canvas>
        <video id="rewardAdVideo" muted autoplay playsinline hidden></video>
      </div>
  
      <div class="ic-ad-top">
        <span class="ic-ad-badge">Advertisement · Fictional demo</span>
        ${xb("×", "ad-exit", "", "ic-ad-close", 'aria-label="Leave advertisement"')}
      </div>
  
      <div class="ic-ad-copy">
        <span class="ic-ad-brand">${icon("ship")} InternCruise</span>
        <h1>Your next<br>journey starts here.</h1>
        <p>Explore. Learn. Set sail.</p>
      </div>
  
      <div class="ic-ad-bottom">
        <p id="rewardAdStatus" role="status" aria-live="polite">
          Watch for 30 seconds to earn your reward.
        </p>
  
        <progress id="rewardAdProgress" max="30" value="0"
          aria-label="Advertisement watch time"></progress>
  
        ${xb("Skip", "ad-skip", "", "wide", 'id="rewardAdSkip"')}
  
        <p class="ic-ad-disclaimer">
          skip is only for ease of demonstration; actual ads will be 30 seconds
        </p>
  
        <p class="ic-ad-demo-note">
          Browser-generated demo video · No real advertiser
        </p>
      </div>
    </section>`;
  };
  
  // Generate an animated scene and stream it into a video element.
  // Browsers without canvas video-stream support display the animated canvas.
  function startRewardAdPreview() {
    const canvas = $("rewardAdCanvas");
    const video = $("rewardAdVideo");
    if (!canvas || !video) return () => {};
  
    const context = canvas.getContext("2d");
    if (!context) return () => {};
  
    let stopped = false;
    let frame = 0;
    let stream = null;
    const start = performance.now();
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    function draw(now) {
      if (stopped) return;
  
      const time = reducedMotion ? 0 : (now - start) / 1000;
      const width = canvas.width;
      const height = canvas.height;
  
      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#e6f7ee");
      sky.addColorStop(0.58, "#cbe9dc");
      sky.addColorStop(1, "#68ab96");
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);
  
      // Sun.
      context.fillStyle = "#fff1c0";
      context.beginPath();
      context.arc(555, 340, 65, 0, Math.PI * 2);
      context.fill();
  
      // Layered water.
      for (let layer = 0; layer < 4; layer++) {
        const level = 670 + layer * 70;
        context.beginPath();
        context.moveTo(0, height);
  
        for (let x = 0; x <= width; x += 8) {
          const y = level + Math.sin(x / 80 + time + layer) * 13;
          context.lineTo(x, y);
        }
  
        context.lineTo(width, height);
        context.closePath();
        context.fillStyle = ["#a9dac8", "#8bcab5", "#6cb49e", "#509883"][layer];
        context.fill();
      }
  
      // Softly cruising ship.
      context.save();
      context.translate(
        360 + Math.sin(time / 3) * 35,
        660 + Math.sin(time * 1.4) * 6
      );
      context.rotate(Math.sin(time) * 0.015);
      context.lineJoin = "round";
      context.lineCap = "round";
      context.lineWidth = 7;
      context.strokeStyle = "#086b58";
      context.fillStyle = "#fcfffa";
  
      context.beginPath();
      context.moveTo(-170, 0);
      context.lineTo(180, 0);
      context.quadraticCurveTo(140, 83, 98, 83);
      context.lineTo(-106, 83);
      context.quadraticCurveTo(-145, 75, -170, 0);
      context.closePath();
      context.fill();
      context.stroke();
  
      context.fillRect(-110, -62, 218, 62);
      context.strokeRect(-110, -62, 218, 62);
      context.fillRect(-55, -112, 106, 50);
      context.strokeRect(-55, -112, 106, 50);
  
      context.fillStyle = "#b5dfce";
      for (let x = -75; x <= 75; x += 50) {
        context.beginPath();
        context.arc(x, -30, 9, 0, Math.PI * 2);
        context.fill();
      }
  
      context.restore();
  
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    }
  
    draw(performance.now());
  
    try {
      if (typeof canvas.captureStream === "function") {
        stream = canvas.captureStream(reducedMotion ? 1 : 24);
        video.srcObject = stream;
  
        video.play().then(() => {
          if (!stopped) video.hidden = false;
        }).catch(() => {
          // The animated canvas remains visible if playback is unavailable.
        });
      }
    } catch {
      // Canvas fallback remains available.
    }
  
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      video.pause();
      video.srcObject = null;
      video.hidden = true;
      stream?.getTracks().forEach(track => track.stop());
    };
  }
  
  function updateRewardAdStatus() {
    const session = rewardAdSession;
    if (!session) return;
  
    const remaining = Math.max(0, Math.ceil((30000 - session.elapsed) / 1000));
    const progress = $("rewardAdProgress");
    const status = $("rewardAdStatus");
    const skip = $("rewardAdSkip");
  
    if (progress) progress.value = session.elapsed / 1000;
  
    const message = session.awarded
      ? "Reward earned. You can return to Home."
      : `${remaining} seconds remaining`;
  
    if (status && status.textContent !== message) status.textContent = message;
  
    if (skip) {
      skip.disabled = session.awarded;
      skip.textContent = session.awarded ? "Reward earned ✓" : "Skip";
    }
  }
  
  function finishRewardAd() {
    const session = rewardAdSession;
  
    if (
      route.name !== "reward-ad" ||
      !session ||
      session.owner !== currentUserId ||
      session.awarded
    ) return;
  
    // Set this before saving/showing the dialog to prevent duplicate rewards.
    session.awarded = true;
    session.elapsed = 30000;
  
    clearInterval(rewardAdTimer);
    rewardAdTimer = null;
    stopRewardAdPreview?.();
    stopRewardAdPreview = null;
  
    db.messagingTrials ??= {};
    db.messagingTrials[currentUserId] = messagingTrialBalance() + 3;
  
    selfNotice(
      "Congratulations! You earned 3 free private messaging trials. Use it anytime.",
      { name: "trial-people" }
    );
  
    persist();
    updateRewardAdStatus();
  
    showModal("Reward earned", `
      <div class="ic-reward-success">${icon("ship")}</div>
  
      <p class="ic-reward-message">
        Congratulations! You earned 3 free private messaging trials. Use it anytime.
      </p>
  
      <p class="muted">
        Available balance: ${messagingTrialBalance()} trials.
        Demo rewards are saved in this browser.
      </p>
  
      <div class="stack">
        ${xb("Use a messaging trial", "ad-use-trial", "", "wide")}
        ${xb("Back to Home", "ad-exit", "", "secondary wide")}
      </div>
    `, "ic-phone-overlay");
  }
  
  function syncRewardAd() {
    clearInterval(rewardAdTimer);
    rewardAdTimer = null;
  
    stopRewardAdPreview?.();
    stopRewardAdPreview = null;
  
    if (
      route.name !== "reward-ad" ||
      rewardAdSession?.owner !== currentUserId
    ) {
      rewardAdSession = null;
      return;
    }
  
    const session = rewardAdSession;
    updateRewardAdStatus();
    stopRewardAdPreview = startRewardAdPreview();
  
    if (session.awarded) {
      stopRewardAdPreview?.();
      stopRewardAdPreview = null;
      return;
    }
  
    session.lastTick = performance.now();
  
    rewardAdTimer = setInterval(() => {
      const now = performance.now();
      const elapsed = now - session.lastTick;
      session.lastTick = now;
  
      if (document.hidden || route.name !== "reward-ad") return;
  
      session.elapsed = Math.min(30000, session.elapsed + elapsed);
      updateRewardAdStatus();
  
      if (session.elapsed >= 30000) finishRewardAd();
    }, 200);
  }
  
  // Do not count time spent in a hidden browser tab.
  document.addEventListener("visibilitychange", () => {
    if (rewardAdSession) rewardAdSession.lastTick = performance.now();
  });
  
  pages["trial-people"] = () => `${heading("Use a messaging trial")}
    <p class="muted">
      ${messagingTrialBalance()} free trials available.
      One trial opens one new direct demo conversation.
      Existing conversations do not consume a trial.
    </p>
  
    ${messagingTrialBalance() ? `
      ${db.users.filter(user =>
        user.verified && user.id !== currentUserId
      ).map(user => `
        <article class="card">
          <div class="row">
            ${avatar(user)}
            <div class="grow">
              <strong>${esc(actorName(user.id))}</strong>
              <p class="muted">${esc(user.org)}</p>
            </div>
          </div>
          ${xb("Start chat with a trial", "trial-chat", user.id)}
        </article>
      `).join("")}
    ` : `
      <p class="empty">Watch a demo advertisement to earn more trials.</p>
      ${xb("Back to Home", "navigate", "home", "wide")}
    `}`;
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
    const action = ({ "save-post": "x-favorite", "like-post": "x-like", "like-forum": "x-like" })[buttonElement?.dataset.action]
      || buttonElement?.dataset.action;

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
    const id = buttonElement.dataset.action === "like-forum"
      ? `forum||${buttonElement.dataset.id}` : buttonElement.dataset.id || "";

    if (name === "me-tab" || name === "me-category") {
      const view = meView();
      const category = view.categories[view.tab] || "posts";
      const screen = $("screen");
      const scroll = screen.scrollTop;
      const sectionTop = scroll + screen.querySelector(".me-content").getBoundingClientRect().top - screen.getBoundingClientRect().top;
      view.scroll[`${view.tab}|${category}`] = scroll;
      if (name === "me-tab" && meCategories[id]) view.tab = id;
      if (name === "me-category" && meCategories[view.tab].includes(id)) view.categories[view.tab] = id;
      render();
      $("screen").scrollTop = view.scroll[`${view.tab}|${view.categories[view.tab] || "posts"}`] ?? Math.max(0, Math.min(scroll, sectionTop));
      document.querySelector(`[data-action="x-${name}"][data-id="${esc(id)}"]`)?.focus({ preventScroll: true });
      return;
    }

    if (name === "me-open") {
      const entry = profileEntries().find(entry => entry.key === id);
      if (!entry) return;
      await go(entry.page, { id: entry.source });
      if (entry.comment && entry.item.text) {
        const text = [...$("screen").querySelectorAll(".preserve")].find(el => el.textContent.trim() === entry.item.text.trim());
        if (text) {
          text.classList.add("me-comment-focus");
          text.scrollIntoView({ block: "center", behavior: "auto" });
        }
      }
      return;
    }

    if (name === "posts-mode") {
      postsMode = id;
      return render();
    }
    if (name === "posts-category") {
      filters.type = id;
      postsMode = "recommended";
      return render();
    }
    if (name === "posts-clear") {
      postsQuery = "";
      return render();
    }
    if (name === "post-open") {
      const post = getPost(id);
      if (!post?.live) return;
      post.views = (post.views || 0) + 1;
      persist();
      return go("post", { id });
    }
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
      const { kind, item } = findItem(id.includes("|") ? id : `post||${id}`);
      if (!item) return;

      if (name === "like") {
        item.likes ??= [];
        item.likes = item.likes.includes(currentUserId)
          ? item.likes.filter(value => value !== currentUserId)
          : [...item.likes, currentUserId];
        item.likedAt ??= {};
        if (item.likes.includes(currentUserId)) item.likedAt[currentUserId] = timestamp();
        else delete item.likedAt[currentUserId];
      } else {
        const key = favoriteKey(kind, item.id);
        db.favorites[currentUserId] ??= [];
        db.favorites[currentUserId] = myFavorites().includes(key)
          ? myFavorites().filter(value => value !== key)
          : [...myFavorites(), key];
        if (kind === "post") {
          db.saved[currentUserId] = db.favorites[currentUserId]
            .filter(key => key.startsWith("post:")).map(key => key.slice(5));
        }
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

    if (name === "comparison-step") return stepComparison(Number(id));

    if (name === "compare-toggle") {
      toggleAccountList("comparisons", id);
      if (route.name === "comparisons") return refreshComparison();
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
      jobFilters = clone(draftFilters);
      searchedJobs = true;
      jobMode = "search";
      closeModal();
      render();
      tell("Profile-based filters applied. Open Filters to adjust them.");
      return;
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

  let comparisonTouch = null;
  document.addEventListener("touchstart", event => {
    comparisonTouch = event.touches.length === 1 &&
      event.target.closest(".comparison-board") &&
      !event.target.closest("button, select, a")
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  document.addEventListener("touchend", event => {
    if (!comparisonTouch) return;
    const start = comparisonTouch;
    comparisonTouch = null;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (route.name === "comparisons" && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      stepComparison(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
  document.addEventListener("touchcancel", () => { comparisonTouch = null; }, { passive: true });

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

    if (element.name === "comparison-base" || element.name === "comparison-peer") {
      if (element.name === "comparison-base") comparisonBase = element.value;
      else comparisonPeer = element.value;
      return refreshComparison();
    }

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

    if (type === "x-posts-search") {
      postsQuery = text("query");
      return render();
    }

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
        const error = form.querySelector("[data-report-error]");
        error.textContent = "Select a reason or enter an explanation.";
      error.hidden = false;
      return;
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
        org: user.kind === "provider" ? user.org : text("org"), major: text("major"), location: text("location"),
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
      tell(user.kind === "provider" ? "Company profile updated. Verified company name is unchanged." : "Profile updated. Institutional changes are editable only for this simulation.");
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
