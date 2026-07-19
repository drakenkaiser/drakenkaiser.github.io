/* Renders window.RESUME_DATA (generated weekly from the resume PDF) into #app. */
(function () {
  const d = window.RESUME_DATA;
  const app = document.getElementById("app");
  if (!d || !app) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const initials = d.name.split(" ").map((w) => w[0]).slice(0, 3).join("");
  const tagline = d.tagline
    .split("|")
    .map((t) => esc(t.trim()))
    .join('<span class="sep">|</span>');

  /* hand-inked section illustrations: light watercolor blob + ink strokes */
  const ICONS = {
    skills: `<svg viewBox="0 0 48 48">
      <path class="wash" d="M7 25c-2-8 4-16 14-18 10-2 20 3 21 11 1 9-7 16-16 17-9 1-17-3-19-10Z"/>
      <path class="wash-b" d="M13 31c-3-5 0-12 7-14 8-2 15 1 16 7 1 6-4 11-11 12-6 1-10-1-12-5Z"/>
      <path class="stroke" d="M9.5 13.5c7-1.5 22-1.5 29.5.5 1 6.5.5 14-.5 20-8 1.5-21 1.5-28.5 0-1.5-6.5-1.5-14-.5-20.5Z"/>
      <path class="stroke" d="M9 19.5c9-1 21-1 30.5 0"/>
      <path class="stroke" d="M14.5 24.5l5 3.5-5 3.5M23.5 31.5h7"/>
    </svg>`,
    experience: `<svg viewBox="0 0 48 48">
      <path class="wash" d="M8 24c-2-9 5-16 15-17 10-1 18 4 19 12 1 9-6 15-15 16-9 1-17-3-19-11Z"/>
      <path class="wash-b" d="M15 30c-2-5 1-11 8-12 7-1 13 2 13 8 0 5-5 9-11 9-5 0-8-2-10-5Z"/>
      <path class="stroke" d="M11.5 12.5c1-2.5 6-4 12.5-4s11.5 1.5 12.5 4c-1 2.5-6 4-12.5 4s-11.5-1.5-12.5-4Z"/>
      <path class="stroke" d="M11.5 12.5c-.5 7-.5 15.5 0 22.5 1 2.5 6 4 12.5 4s11.5-1.5 12.5-4c.5-7 .5-15.5 0-22.5"/>
      <path class="stroke" d="M11.5 20c2 2.3 6.5 3.7 12.5 3.7S34.5 22.3 36.5 20M11.5 27.5c2 2.3 6.5 3.7 12.5 3.7s10.5-1.4 12.5-3.7"/>
    </svg>`,
    projects: `<svg viewBox="0 0 48 48">
      <path class="wash" d="M9 23c-1-9 6-16 15-16s16 6 15 15c-1 8-7 14-15 14S10 31 9 23Z"/>
      <path class="wash-b" d="M15 22c0-6 4-10 9-10s10 4 9 10c0 5-4 8-9 8s-9-3-9-8Z"/>
      <path class="stroke" d="M17.5 28c-2.7-2.3-4.5-5.7-4-9.5.7-4.8 5-8.3 10.5-8s10 4.3 10 9c0 3.8-2 6.7-4.5 9-1 1-1.5 2.3-1.5 3.7h-9c0-1.4-.5-2.8-1.5-4.2Z"/>
      <path class="stroke" d="M19.5 35.5h9M21 38.5h6"/>
      <path class="stroke" d="M24 3.5v3M11 7.5l2 2M37 7.5l-2 2M6.5 18.5h3M38.5 18.5h3"/>
    </svg>`,
    education: `<svg viewBox="0 0 48 48">
      <path class="wash" d="M8 25c-2-8 5-15 15-16 10-1 18 4 19 12 1 8-6 14-15 15-9 1-17-3-19-11Z"/>
      <path class="wash-b" d="M14 28c-1-5 3-9 9-10 7-1 12 2 12 7 0 5-5 8-11 8-5 0-9-2-10-5Z"/>
      <path class="stroke" d="M24 10.5l18.5 7.5L24 25.5 5.5 18 24 10.5Z"/>
      <path class="stroke" d="M14.5 21.5v8.5c0 2.2 4.3 4.5 9.5 4.5s9.5-2.3 9.5-4.5v-8.5"/>
      <path class="stroke" d="M42.5 18.5v9"/>
      <circle class="stroke" cx="42.5" cy="30" r="1.6"/>
    </svg>`,
    awards: `<svg viewBox="0 0 48 48">
      <path class="wash" d="M9 21c-1-8 6-14 15-14s16 5 15 13c-1 8-7 13-15 13S10 29 9 21Z"/>
      <path class="wash-b" d="M16 19c0-5 3.5-8 8-8s8.5 3 8 8c0 4-3.5 7-8 7s-8-3-8-7Z"/>
      <circle class="stroke" cx="24" cy="19" r="9.5"/>
      <path class="stroke" d="M24 13.5l1.7 3.4 3.8.6-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8-2.7-2.7 3.8-.6 1.7-3.4Z"/>
      <path class="stroke" d="M19 27.5L15 39l5.5-2.6 2.7 4.6 2.6-8M29 27.5L33 39l-5.4-2.6"/>
    </svg>`,
  };

  const section = (id, kicker, title, body) => `
    <section id="${id}">
      <h2 class="section-title">
        <span class="ill" aria-hidden="true">${ICONS[id] || ""}</span>
        <span><span class="kicker">${kicker}</span> ${title}</span>
      </h2>
      ${body}
    </section>`;

  const skillsHtml = d.skills
    .map(
      (g) => `
      <div class="skill-row">
        <span class="skill-cat">${esc(g.category)}</span>
        <span class="skill-tags">${g.items.map((i) => `<span class="tag">${esc(i)}</span>`).join("")}</span>
      </div>`
    )
    .join("");

  const expHtml = d.experience
    .map(
      (co) => `
      <div class="company">
        <div class="company-header">
          <h3 class="company-name">${esc(co.company)}</h3>
          <span class="company-loc">${esc(co.location)}</span>
        </div>
        <div class="timeline">
          ${co.roles
            .map(
              (r) => `
            <div class="role">
              <div class="role-head">
                <span class="role-title">${esc(r.title)}</span>
                <span class="role-period">${esc(r.period)}</span>
              </div>
              <ul>${r.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </div>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

  const projectsHtml = `
    <div class="cards">
      ${d.projects
        .map((p) => `<div class="card"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div>`)
        .join("")}
    </div>`;

  const eduHtml = d.education
    .map(
      (e) => `
      <div class="edu-item">
        <div class="edu-inst">${esc(e.institution)}</div>
        <div class="edu-degree">${esc(e.degree)}</div>
        <div class="edu-detail">${esc(e.detail)}</div>
      </div>`
    )
    .join("");

  const certsHtml = `<ul class="plain-list">${d.certifications
    .map((c) => `<li>${esc(c)}</li>`)
    .join("")}</ul>`;

  const awardsHtml = d.awards
    .map(
      (a) => `
      <div class="award">
        <div class="award-title">${esc(a.title)}</div>
        <p>${esc(a.description)}</p>
      </div>`
    )
    .join("");

  app.innerHTML = `
    <div class="hero">
      <div class="portrait-wrap">
        <img class="portrait" src="assets/portrait.png?v=${esc(d.updated)}" alt="Portrait of ${esc(d.name)}"
             onerror="this.outerHTML='<div class=&quot;portrait-fallback&quot;>${initials}</div>'">
      </div>
      <div class="hero-text">
        <h1>${esc(d.name)}</h1>
        <p class="tagline">${tagline}</p>
        <p class="summary">${esc(d.summary)}</p>
        <div class="hero-links">
          <a class="btn btn-primary" href="mailto:${esc(d.contact.email)}">Email me</a>
          <a class="btn" href="${esc(d.contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn" href="assets/resume.pdf" target="_blank" rel="noopener">Resume ↓</a>
        </div>
      </div>
    </div>
    ${section("skills", "01", "Technical Skills", `<div class="skills-grid">${skillsHtml}</div>`)}
    ${section("experience", "02", "Experience", expHtml)}
    ${section("projects", "03", "Projects", projectsHtml)}
    ${section("education", "04", "Education & Certifications", `
      <div class="two-col">
        <div>${eduHtml}</div>
        <div>${certsHtml}</div>
      </div>`)}
    ${section("awards", "05", "Awards & Recognition", awardsHtml)}
  `;

  document.getElementById("footer-note").textContent =
    `© ${new Date().getFullYear()} ${d.name} · auto-synced from resume on ${d.updated}`;
})();
