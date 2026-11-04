/* =========================================================
   Trace & Think — Front-end prototype logic
   ---------------------------------------------------------
   1. Sample data (themes, sources, evidence, connections)
   2. State + persistence (localStorage)
   3. Helpers
   4. Router & shell (sidebar, topbar)
   5. Page renderers
   6. Event handling
   All "AI" output is mocked. No backend is used.
   ========================================================= */
(() => {
  'use strict';

  const STORAGE_KEY = 'traceThink.state';
  const STATE_VERSION = 3;
  const HOUR = 36e5;
  const DAY = 24 * HOUR;
  const DEMO_PROJECT = 'p1';

  /* ------------------------------------------------------
     1. SAMPLE DATA  (all sources are fictional examples)
     ------------------------------------------------------ */
  const THEMES = {
    usage: {
      id: 'usage', name: 'Usage Intensity', color: '#5260c8',
      description: 'How much — and how — adolescents use social media: total screen time, heavy-use thresholds and passive versus active engagement.'
    },
    comparison: {
      id: 'comparison', name: 'Social Comparison', color: '#a86a32',
      description: 'Upward comparison with peers and influencers on image-based platforms, and its relationship with self-esteem and body image.'
    },
    sleep: {
      id: 'sleep', name: 'Sleep Disruption', color: '#357d97',
      description: 'Night-time phone use, shortened or poorer-quality sleep, and sleep as a pathway between social media and low mood.'
    },
    support: {
      id: 'support', name: 'Connection & Support', color: '#3d8a66',
      description: 'Positive effects: peer support, reduced isolation and feeling connected — especially for young people with limited offline support.'
    }
  };

  const DEMO_SOURCES = [
    { id: 's1', file: 'Hartley_Chen_2022_Screen_Time_Wellbeing.pdf', title: 'Screen Time and Adolescent Wellbeing: A Three-Wave Cohort Study', short: 'Hartley & Chen, 2022', pages: 24, size: '2.4 MB' },
    { id: 's2', file: 'Okafor_2021_Social_Comparison_Online.pdf', title: 'Upward Social Comparison on Image-Based Platforms', short: 'Okafor et al., 2021', pages: 18, size: '1.1 MB' },
    { id: 's3', file: 'Lindqvist_2023_Night_Use_Sleep_Mood.pdf', title: 'Night-time Smartphone Use, Sleep Quality and Mood in Teenagers', short: 'Lindqvist et al., 2023', pages: 31, size: '3.0 MB' },
    { id: 's4', file: 'Ramos_Patel_2020_Online_Peer_Support.pdf', title: 'Online Peer Support Among Rural and LGBTQ+ Youth', short: 'Ramos & Patel, 2020', pages: 22, size: '1.6 MB' },
    { id: 's5', file: 'Youth_Digital_Habits_Survey_2023.pdf', title: 'National Youth Digital Habits Survey 2023 — Technical Report', short: 'Youth Research Council, 2023', pages: 56, size: '5.8 MB' }
  ];

  const EVIDENCE = [
    {
      id: 'e1', projectId: DEMO_PROJECT, sourceId: 's1', page: 9, themes: ['usage'],
      title: 'Total screen time has a very small link to wellbeing',
      extracted: 'Across roughly 11,000 adolescents, total daily screen time was negatively associated with wellbeing, but the effect was tiny — it explained less than 1% of the differences between participants.',
      excerpt: 'The association between total daily screen time and self-reported wellbeing was negative but small (β = −0.04), accounting for less than 1% of the variance observed across the 11,284 participants.'
    },
    {
      id: 'e2', projectId: DEMO_PROJECT, sourceId: 's5', page: 23, themes: ['usage'],
      title: 'Heavy use (5+ hours a day) linked to depressive symptoms',
      extracted: 'Teenagers reporting five or more hours of social media a day were about twice as likely to report elevated depressive symptoms as light users. This is a cross-sectional association, so it does not show cause.',
      excerpt: 'Respondents reporting five or more hours of daily social media use showed a 2.1-fold higher likelihood of elevated depressive symptoms compared with those reporting under one hour (adjusted OR = 2.1, 95% CI 1.7–2.6).'
    },
    {
      id: 'e3', projectId: DEMO_PROJECT, sourceId: 's1', page: 14, themes: ['usage', 'comparison'],
      title: 'Passive scrolling predicts mood decline more than active use',
      extracted: 'The type of use mattered more than the amount: passive browsing of feeds predicted lower mood a year later, while active messaging with close friends did not.',
      excerpt: 'Passive consumption of feed content predicted declines in positive affect at the 12-month follow-up (b = −0.11, p = .003), whereas active, directed communication with close friends showed no significant association.'
    },
    {
      id: 'e4', projectId: DEMO_PROJECT, sourceId: 's2', page: 7, themes: ['comparison'],
      title: 'Upward comparison explains the link to lower self-esteem',
      extracted: 'Comparing oneself to people who seem better-off (upward comparison) accounted for the relationship between time on image-based platforms and lower self-esteem.',
      excerpt: 'Upward social comparison fully mediated the relationship between time spent on image-based platforms and state self-esteem (indirect effect = −0.18, 95% CI [−0.26, −0.10]).'
    },
    {
      id: 'e5', projectId: DEMO_PROJECT, sourceId: 's2', page: 11, themes: ['comparison'],
      title: 'Appearance comparison effects are stronger for girls',
      extracted: 'The negative effect of appearance-focused comparison on body image was roughly twice as strong for girls as for boys, suggesting gender shapes who is most affected.',
      excerpt: 'The moderating effect of gender was significant: the association between appearance-based comparison and body dissatisfaction was approximately twice as large among female participants (β = −0.31) as among male participants (β = −0.14).'
    },
    {
      id: 'e6', projectId: DEMO_PROJECT, sourceId: 's3', page: 5, themes: ['sleep'],
      title: 'Phone use after lights-out shortens sleep',
      extracted: 'Teenagers who used their phones after going to bed on most nights slept about 40 minutes less on school nights and reported worse sleep quality.',
      excerpt: 'Participants who used a smartphone after lights-out on four or more nights per week slept on average 41 minutes less on school nights and reported significantly poorer subjective sleep quality.'
    },
    {
      id: 'e7', projectId: DEMO_PROJECT, sourceId: 's3', page: 19, themes: ['sleep'],
      title: 'Sleep quality is a key pathway to low mood',
      extracted: 'Poor sleep explained around 40% of the link between night-time phone use and low mood, suggesting that protecting sleep could reduce much of the harm.',
      excerpt: 'Sleep quality mediated approximately 40% of the total association between night-time smartphone use and depressed mood, indicating that disrupted sleep is a substantial, though partial, pathway.'
    },
    {
      id: 'e8', projectId: DEMO_PROJECT, sourceId: 's4', page: 8, themes: ['support'],
      title: 'Online communities support marginalised youth',
      extracted: 'For LGBTQ+ adolescents, online peer communities were a major source of emotional support, especially where offline acceptance was limited.',
      excerpt: 'Seventy-two percent of LGBTQ+ participants identified online communities as their primary source of emotional support, citing acceptance that was frequently unavailable in their offline environments.'
    },
    {
      id: 'e9', projectId: DEMO_PROJECT, sourceId: 's4', page: 15, themes: ['support'],
      title: 'Social media reduces isolation for rural teens',
      extracted: 'Rural adolescents who used social media to keep in touch with friends reported lower loneliness than those who rarely did.',
      excerpt: 'Among rural respondents, frequent use of social platforms to maintain friendships was associated with significantly lower loneliness scores (d = 0.38) relative to infrequent users.'
    },
    {
      id: 'e10', projectId: DEMO_PROJECT, sourceId: 's5', page: 31, themes: ['support'],
      title: 'Most teens say social media helps them feel connected',
      extracted: 'About two-thirds of surveyed teens said social media helps them feel more connected to friends — a perceived benefit that sits alongside reported harms.',
      excerpt: '68% of respondents agreed that social media helps them feel more connected to what is going on in their friends’ lives, while 23% reported feeling overwhelmed by drama on these platforms.'
    },
    {
      id: 'e11', projectId: DEMO_PROJECT, sourceId: 's1', page: 17, themes: ['usage'],
      title: 'No lasting effect once earlier wellbeing is controlled',
      extracted: 'When the researchers accounted for how teenagers were feeling at the start, social media time no longer predicted later wellbeing — challenging simple "more use causes harm" claims.',
      excerpt: 'After adjusting for baseline wellbeing, social media use at Wave 1 did not significantly predict wellbeing at Wave 3 (β = −0.02, p = .41), suggesting that cross-sectional associations may partly reflect reverse causation.'
    }
  ];

  /* Relationships between evidence (simulated AI analysis) */
  const CONNECTIONS = [
    { a: 'e1', b: 'e11', type: 'similar', note: 'Both find that the overall amount of use has little direct effect on wellbeing.' },
    { a: 'e2', b: 'e11', type: 'contradicts', note: 'Survey data links heavy use to depression, but longitudinal data shows no lasting effect once baseline wellbeing is controlled.' },
    { a: 'e1', b: 'e2', type: 'different', note: 'Heavy users show far stronger associations than the average-use effect — this may indicate a threshold rather than a linear effect.' },
    { a: 'e3', b: 'e4', type: 'similar', note: 'Both point to how platforms are used: passive viewing creates more opportunities for upward comparison.' },
    { a: 'e4', b: 'e5', type: 'different', note: 'The comparison effect is not uniform — it is substantially stronger for girls than for boys.' },
    { a: 'e6', b: 'e7', type: 'similar', note: 'Same study: night-time use disrupts sleep, which in turn explains part of the effect on mood.' },
    { a: 'e8', b: 'e9', type: 'similar', note: 'Both show social media reducing isolation for groups with limited offline support.' },
    { a: 'e2', b: 'e10', type: 'different', note: 'The same survey reports both perceived connection benefits and an association with depressive symptoms.' },
    { a: 'e4', b: 'e9', type: 'different', note: 'Contact with friends reduces loneliness, while exposure to idealised peers lowers self-esteem — the same platforms may help or harm depending on use.' },
    { a: 'e7', b: 'e11', type: 'contradicts', note: 'Sleep mediation implies a real harm pathway, while the cohort data finds no lasting effect of overall use. Timing of use (night) may matter more than amount.' }
  ];

  /* Fixed positions for the Insight Map, in a 1000 × 660 coordinate space */
  const MAP_LAYOUT = {
    't:usage': [300, 220], 't:comparison': [700, 220], 't:sleep': [300, 470], 't:support': [700, 470],
    'e:e1': [100, 80], 'e:e11': [300, 80], 'e:e3': [500, 80], 'e:e4': [700, 80],
    'e:e2': [100, 280], 'e:e5': [900, 220],
    'e:e6': [100, 470], 'e:e8': [900, 470],
    'e:e7': [300, 600], 'e:e10': [500, 600], 'e:e9': [700, 600]
  };

  const CONN_LABELS = {
    similar: { label: 'Similarity', icon: 'equal' },
    different: { label: 'Difference', icon: 'git-compare' },
    contradicts: { label: 'Contradiction', icon: 'zap' }
  };

  const SECTION_TYPES = {
    supporting: 'Supporting argument',
    counter: 'Counterargument',
    rebuttal: 'Rebuttal'
  };

  /* Simulated AI answers for the question box */
  const MOCK_ANSWERS = [
    {
      match: /sleep|night|bed|tired|late/i,
      text: 'Night-time phone use appears to affect mood mainly <em>indirectly</em>. Teenagers who used their phones after lights-out slept around 40 minutes less on school nights {e6}, and sleep quality accounted for roughly 40% of the link between night-time use and low mood {e7}. However, a cohort study found no lasting effect of overall use once earlier wellbeing was controlled {e11}, which suggests <strong>when</strong> teens use social media may matter more than how much.',
      evidence: ['e6', 'e7', 'e11']
    },
    {
      match: /compar|instagram|image|appearance|body|girl|gender|self-esteem|esteem/i,
      text: 'Your sources suggest that upward social comparison is a central mechanism. Comparison with seemingly better-off peers fully explained the link between image-based platform use and lower self-esteem {e4}. This effect was about twice as strong for girls {e5}, and it is more likely during passive scrolling than during active messaging {e3}.',
      evidence: ['e4', 'e5', 'e3']
    },
    {
      match: /support|connect|benefit|positive|lonel|isolat|communit|help|lgbt|rural/i,
      text: 'Several sources describe genuine benefits. LGBTQ+ adolescents frequently named online communities as their main source of emotional support {e8}, rural teens who kept in touch online reported lower loneliness {e9}, and about two-thirds of surveyed teens said social media helps them feel connected {e10}. These findings are a useful counterweight to harm-focused studies.',
      evidence: ['e8', 'e9', 'e10']
    },
    {
      match: /time|hour|how much|amount|heavy|screen|depress|harm|mental health|wellbeing|well-being/i,
      text: 'The evidence on <em>amount</em> of use is mixed. Across a large cohort, total screen time explained less than 1% of variation in wellbeing {e1}, and the effect disappeared once baseline wellbeing was controlled {e11}. In contrast, a national survey found that teens using social media for 5+ hours a day were about twice as likely to report depressive symptoms {e2}. One way to reconcile these: harms may concentrate among very heavy users, or reflect reverse causation.',
      evidence: ['e1', 'e11', 'e2']
    }
  ];

  const SUGGESTED_QUESTIONS = [
    'How does night-time phone use affect mood?',
    'Is social comparison a key mechanism?',
    'Does social media have any benefits?',
    'Does more screen time cause harm?'
  ];

  /* ------------------------------------------------------
     2. STATE + PERSISTENCE
     ------------------------------------------------------ */
  function seedState() {
    const now = Date.now();
    const mk = (files) => files.map((f, i) => ({ id: 'x' + i + Math.random().toString(36).slice(2, 6), file: f, title: fileToTitle(f), short: '', pages: null, size: '' }));
    return {
      version: STATE_VERSION,
      user: { name: 'Alex Nguyen', university: 'Northbridge University', citation: 'APA 7', showAiLabels: true, compactCards: false },
      currentProjectId: DEMO_PROJECT,
      projects: [
        {
          id: DEMO_PROJECT, title: 'Social Media Use and Adolescent Mental Health', course: 'PSYC 3020',
          question: 'How does social media use affect the mental health of adolescents aged 13–18?',
          description: 'Literature review for Research Methods. Focus on mechanisms (sleep, social comparison) rather than screen time alone.',
          sources: DEMO_SOURCES.map(s => ({ ...s })), updated: now - 2 * HOUR, created: now - 18 * DAY, due: '2026-11-27'
        },
        {
          id: 'p2', title: 'Urban Green Space and Heat Resilience', course: 'GEOG 2140',
          question: 'To what extent do urban parks and tree canopy reduce heat exposure in dense neighbourhoods?',
          description: 'Comparing cooling effects of parks, street trees and green roofs for a policy brief.',
          sources: mk(['Kumar_2021_Urban_Canopy_Cooling.pdf', 'Morrison_2019_Park_Cool_Islands.pdf', 'City_Heat_Vulnerability_Index_2024.pdf', 'Tanaka_2022_Green_Roofs_Review.pdf', 'Silva_2020_Heat_and_Health_Equity.pdf', 'Moreau_2023_Street_Tree_Microclimate.pdf']),
          sampleEvidence: 18, updated: now - 2 * DAY, created: now - 30 * DAY
        },
        {
          id: 'p3', title: 'Generative AI Tutors in First-Year Writing', course: 'EDUC 1500',
          question: 'Do AI writing assistants improve the quality of first-year students’ argumentative essays?',
          description: 'Mixed-methods proposal examining feedback quality, student reliance and academic integrity.',
          sources: mk(['Brennan_2024_AI_Feedback_Writing.pdf', 'Osei_2023_Student_Reliance_LLMs.pdf', 'Faculty_Survey_AI_Use_2024.pdf', 'Li_Moreno_2024_Revision_Behaviour.pdf', 'Integrity_Policy_Review_2023.pdf']),
          sampleEvidence: 9, updated: now - 6 * DAY, created: now - 21 * DAY
        },
        {
          id: 'p4', title: 'Plant-Based Diets and Athletic Recovery', course: 'NUTR 2200',
          question: 'Can plant-based diets support muscle recovery in endurance athletes as effectively as omnivorous diets?',
          description: 'Short evidence review for a sports nutrition seminar.',
          sources: mk(['Ferreira_2022_Plant_Protein_Recovery.pdf', 'Novak_2021_Endurance_Diet_RCT.pdf', 'Sports_Nutrition_Position_Stand_2023.pdf']),
          sampleEvidence: 4, updated: now - 19 * DAY, created: now - 40 * DAY
        }
      ],
      saved: { [DEMO_PROJECT]: ['e1', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11'] },
      outlines: {
        [DEMO_PROJECT]: {
          thesis: 'While heavy, passive social media use is associated with poorer adolescent mental health, the overall effect is modest and operates largely through sleep disruption and social comparison rather than screen time itself.',
          args: [
            { id: 'a1', type: 'supporting', claim: 'Overall screen time has only a small direct association with wellbeing', explanation: 'Large cohort data shows the amount of use explains very little variance, and the effect fades once baseline wellbeing is controlled.', evidence: ['e1', 'e11'] },
            { id: 'a2', type: 'supporting', claim: 'Passive use and upward comparison drive negative outcomes', explanation: 'How teens use platforms matters: passive scrolling invites comparison, which explains lower self-esteem — particularly for girls.', evidence: ['e3', 'e4', 'e5'] },
            { id: 'a3', type: 'supporting', claim: 'Night-time use harms mood indirectly through poorer sleep', explanation: 'Phone use after lights-out shortens sleep, and sleep quality accounts for a large share of the link with low mood.', evidence: ['e6', 'e7'] },
            { id: 'a4', type: 'counter', claim: 'Social media can also protect wellbeing by providing connection', explanation: 'For marginalised and rural youth, online communities reduce isolation and offer support that may be unavailable offline.', evidence: ['e8', 'e9', 'e10'] }
          ]
        }
      },
      activity: [
        { icon: 'list-tree', text: 'Added counterargument "Social media can also protect wellbeing…"', projectId: DEMO_PROJECT, time: now - 2 * HOUR },
        { icon: 'bookmark-plus', text: 'Saved evidence "Sleep quality is a key pathway to low mood"', projectId: DEMO_PROJECT, time: now - 5 * HOUR },
        { icon: 'message-square', text: 'Asked "How does night-time phone use affect mood?"', projectId: DEMO_PROJECT, time: now - 6 * HOUR },
        { icon: 'file-up', text: 'Uploaded Youth_Digital_Habits_Survey_2023.pdf', projectId: DEMO_PROJECT, time: now - 1 * DAY },
        { icon: 'file-up', text: 'Uploaded 2 sources to Urban Green Space and Heat Resilience', projectId: 'p2', time: now - 2 * DAY },
        { icon: 'folder-plus', text: 'Created project "Generative AI Tutors in First-Year Writing"', projectId: 'p3', time: now - 21 * DAY }
      ]
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === STATE_VERSION) return parsed;
      }
    } catch (err) { /* storage unavailable — fall back to seed */ }
    return seedState();
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
  }

  let state = loadState();

  /* Transient UI state (not persisted) */
  const ui = {
    lib: { query: '', theme: 'all', source: 'all', tab: 'all' },
    answer: null,          // { question, text, evidence[] }
    asking: false,
    mapSelected: null,     // 't:usage' | 'e:e3'
    mapFilters: { theme: true, similar: true, different: true, contradicts: true },
    editingThesis: false,
    editingArg: null,
    newArgId: null,
    projectSearch: '',
    pendingFiles: []
  };

  /* ------------------------------------------------------
     3. HELPERS
     ------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };

  function fileToTitle(name) {
    return name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function formatSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  function relTime(ts) {
    const diff = Date.now() - ts;
    const min = Math.round(diff / 6e4);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    const d = Math.round(h / 24);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d} days ago`;
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function highlight(text, query) {
    const safe = esc(text);
    if (!query) return safe;
    const terms = query.trim().split(/\s+/).filter(t => t.length > 1).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!terms.length) return safe;
    return safe.replace(new RegExp(`(${terms.map(esc).join('|')})`, 'gi'), '<mark>$1</mark>');
  }

  const currentProject = () => state.projects.find(p => p.id === state.currentProjectId) || state.projects[0];
  const projectEvidence = (pid = currentProject().id) => EVIDENCE.filter(e => e.projectId === pid);
  const hasRealEvidence = (pid) => EVIDENCE.some(e => e.projectId === pid);
  const savedList = (pid = currentProject().id) => (state.saved[pid] ||= []);
  const isSaved = (id) => savedList().includes(id);
  const evidenceById = (id) => EVIDENCE.find(e => e.id === id);
  const sourceOf = (ev) => {
    const p = state.projects.find(x => x.id === ev.projectId);
    return (p && p.sources.find(s => s.id === ev.sourceId)) || DEMO_SOURCES.find(s => s.id === ev.sourceId);
  };
  const evidenceCountFor = (p) => hasRealEvidence(p.id) ? savedList(p.id).length : (p.sampleEvidence || 0) + savedList(p.id).length;
  const outlineFor = (pid = currentProject().id) => {
    if (!state.outlines[pid]) {
      const p = state.projects.find(x => x.id === pid);
      state.outlines[pid] = { thesis: '', args: [], _question: p ? p.question : '' };
    }
    return state.outlines[pid];
  };

  function touchProject(pid = currentProject().id) {
    const p = state.projects.find(x => x.id === pid);
    if (p) p.updated = Date.now();
  }
  function logActivity(icon, text, pid = currentProject().id) {
    state.activity.unshift({ icon, text, projectId: pid, time: Date.now() });
    state.activity = state.activity.slice(0, 25);
  }
  function commit() { persist(); updateShell(); }

  function toast(message, { icon = 'check', type = '' } = {}) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i data-lucide="${icon}"></i><span>${esc(message)}</span>`;
    $('#toasts').appendChild(el);
    icons();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, 2800);
  }

  /* ------------------------------------------------------
     4. ROUTER & SHELL
     ------------------------------------------------------ */
  const PAGES = ['dashboard', 'projects', 'evidence', 'map', 'builder', 'settings'];
  const RENDERERS = {
    dashboard: renderDashboard,
    projects: renderProjects,
    evidence: renderEvidence,
    map: renderMap,
    builder: renderBuilder,
    settings: renderSettings
  };

  const currentPage = () => {
    const h = location.hash.replace('#', '');
    return PAGES.includes(h) ? h : 'dashboard';
  };

  function navigate(page) {
    if (location.hash === '#' + page) renderPage();
    else location.hash = page;
  }

  function renderPage({ keepScroll = false } = {}) {
    const page = currentPage();
    $$('.page').forEach(s => s.classList.toggle('active', s.id === 'page-' + page));
    $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    RENDERERS[page]();
    updateShell();
    icons();
    closeSidebar();
    if (!keepScroll) window.scrollTo({ top: 0 });
  }

  /* Re-render the current page without jumping to the top */
  const refresh = () => renderPage({ keepScroll: true });

  function updateShell() {
    const p = currentProject();
    // Project switcher
    const sel = $('#projectSelect');
    sel.innerHTML = state.projects.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(x.title)}</option>`).join('');
    // Saved count badge
    const n = savedList().length;
    $('#navSavedCount').textContent = n ? n : '';
    // Profile
    const initials = state.user.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    $('#avatar').textContent = initials || 'U';
    $('#profileName').textContent = state.user.name;
    $('#profileUni').textContent = state.user.university;
    // Sidebar project progress
    const prog = projectProgress(p);
    $('#sidebarProject').innerHTML = `
      <div class="side-project">
        <small>Active project</small>
        <strong>${esc(p.title)}</strong>
        <div class="progress"><span style="width:${prog.pct}%"></span></div>
        <div class="progress-label"><span>${prog.done} of 4 stages</span><span>${prog.pct}%</span></div>
      </div>`;
  }

  function projectProgress(p) {
    const outline = state.outlines[p.id];
    const stages = [
      p.sources.length > 0,
      evidenceCountFor(p) > 0,
      hasRealEvidence(p.id),
      !!(outline && outline.args.length)
    ];
    const done = stages.filter(Boolean).length;
    return { stages, done, pct: Math.round(done / 4 * 100) };
  }

  function openSidebar() { $('.app').classList.add('nav-open'); }
  function closeSidebar() { $('.app').classList.remove('nav-open'); }

  /* ------------------------------------------------------
     5. PAGE RENDERERS
     ------------------------------------------------------ */

  /* ---------- Shared: project card ---------- */
  function projectCard(p, { deletable = false } = {}) {
    const isCurrent = p.id === state.currentProjectId;
    return `
      <article class="project-card ${isCurrent ? 'current' : ''}" data-action="open-project" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${esc(p.title)}">
        <div class="pc-top">
          ${p.course ? `<span class="course-tag">${esc(p.course)}</span>` : '<span></span>'}
          ${deletable && state.projects.length > 1 ? `<button class="icon-btn sm danger pc-delete" data-action="delete-project" data-id="${p.id}" aria-label="Delete project"><i data-lucide="trash-2"></i></button>` : ''}
        </div>
        <h3>${esc(p.title)}</h3>
        <p class="pc-q">${esc(p.question || p.description || 'No research question yet.')}</p>
        <div class="pc-meta">
          <span><i data-lucide="file-text"></i>${p.sources.length} source${p.sources.length === 1 ? '' : 's'}</span>
          <span><i data-lucide="bookmark"></i>${evidenceCountFor(p)} evidence cards</span>
        </div>
        <div class="pc-foot">
          <span>Edited ${relTime(p.updated)}</span>
          ${isCurrent ? '<span class="active-badge">Active</span>' : ''}
        </div>
      </article>`;
  }

  /* ---------- Shared: evidence card ---------- */
  function evidenceCard(ev, { query = '' } = {}) {
    const saved = isSaved(ev.id);
    const src = sourceOf(ev);
    const showAi = state.user.showAiLabels;
    const tags = ev.themes.map(t => `<span class="tag"><span class="dot" style="--c:${THEMES[t].color}"></span>${THEMES[t].name}</span>`).join('');
    return `
      <article class="evidence-card ${saved ? 'is-saved' : ''}" id="card-${ev.id}">
        <header class="ev-head">
          <div>
            <div class="ev-tags">${tags}${saved ? '<span class="saved-badge"><i data-lucide="bookmark-check"></i>Saved</span>' : ''}</div>
            <h3>${highlight(ev.title, query)}</h3>
          </div>
          ${saved
            ? `<button class="btn btn-sm btn-danger" data-action="toggle-save" data-id="${ev.id}"><i data-lucide="bookmark-minus"></i>Remove</button>`
            : `<button class="btn btn-sm btn-outline" data-action="toggle-save" data-id="${ev.id}"><i data-lucide="bookmark-plus"></i>Save Evidence</button>`}
        </header>
        <div class="ev-ai">
          ${showAi ? '<span class="label-ai"><i data-lucide="sparkles"></i>AI explanation</span>' : ''}
          <p>${highlight(ev.extracted, query)}</p>
        </div>
        <blockquote class="ev-excerpt">
          <span class="label-src"><i data-lucide="quote"></i>Original excerpt</span>
          <p>“${highlight(ev.excerpt, query)}”</p>
        </blockquote>
        <footer class="ev-foot">
          <span class="ev-src" title="${esc(src.title)}"><i data-lucide="file-text"></i><span>${esc(src.file)}</span></span>
          <span class="page-pill">p. ${ev.page}</span>
          ${src.short ? `<span class="ev-cite">(${esc(src.short)})</span>` : ''}
          <button class="link-btn" data-action="view-in-map" data-id="${ev.id}"><i data-lucide="waypoints"></i>View in map</button>
        </footer>
      </article>`;
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const p = currentProject();
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = state.user.name.split(' ')[0];
    const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const totals = {
      projects: state.projects.length,
      sources: state.projects.reduce((n, x) => n + x.sources.length, 0),
      evidence: state.projects.reduce((n, x) => n + evidenceCountFor(x), 0),
      sections: Object.values(state.outlines).reduce((n, o) => n + o.args.length, 0)
    };
    const recent = [...state.projects].sort((a, b) => b.updated - a.updated).slice(0, 3);
    const prog = projectProgress(p);
    const outline = state.outlines[p.id];
    const steps = [
      { n: 1, title: 'Upload sources', meta: `${p.sources.length} PDF${p.sources.length === 1 ? '' : 's'} added`, page: 'evidence', done: prog.stages[0] },
      { n: 2, title: 'Extract evidence', meta: `${evidenceCountFor(p)} cards saved`, page: 'evidence', done: prog.stages[1] },
      { n: 3, title: 'Explore connections', meta: hasRealEvidence(p.id) ? `${Object.keys(THEMES).length} themes · ${CONNECTIONS.length} links` : 'Awaiting evidence', page: 'map', done: prog.stages[2] },
      { n: 4, title: 'Build argument', meta: outline && outline.args.length ? `${outline.args.length} sections drafted` : 'Not started', page: 'builder', done: prog.stages[3] }
    ];

    $('#page-dashboard').innerHTML = `
      <div class="welcome">
        <div>
          <p class="eyebrow">${dateStr}</p>
          <h1>${greet}, ${esc(firstName)}</h1>
          <p class="sub">Research with clarity. Think with evidence. Pick up where you left off or start a new line of inquiry.</p>
        </div>
        <button class="btn btn-primary btn-lg" data-action="open-new-project"><i data-lucide="plus"></i>Create New Project</button>
      </div>

      <div class="stats-row">
        ${stat('folder-open', totals.projects, 'Research projects')}
        ${stat('file-text', totals.sources, 'Source documents')}
        ${stat('bookmark', totals.evidence, 'Evidence cards')}
        ${stat('list-tree', totals.sections, 'Argument sections')}
      </div>

      <div class="dash-grid">
        <div class="dash-col">
          <section class="panel workflow">
            <div class="workflow-head">
              <div>
                <p class="eyebrow">Continue your research</p>
                <h2>${esc(p.title)}</h2>
                <p>${esc(p.question || 'Add a research question to focus your project.')}</p>
              </div>
              <span class="count-pill">${prog.pct}% complete</span>
            </div>
            <div class="steps">
              ${steps.map(s => `
                <button class="step" data-action="go" data-page="${s.page}">
                  <span class="step-num">Step ${s.n}${s.done ? '<span class="done"><i data-lucide="circle-check"></i></span>' : ''}</span>
                  <strong>${s.title}</strong>
                  <span class="meta">${s.meta}</span>
                </button>`).join('')}
            </div>
          </section>

          <section>
            <div class="section-head">
              <h2>Recent projects</h2>
              <a href="#projects" class="link-btn">View all <i data-lucide="arrow-right"></i></a>
            </div>
            <div class="project-grid">${recent.map(x => projectCard(x)).join('')}</div>
          </section>
        </div>

        <aside class="panel">
          <div class="panel-head"><h2>Recent activity</h2></div>
          <div class="panel-body">
            <ul class="activity-list">
              ${state.activity.slice(0, 7).map(a => {
                const proj = state.projects.find(x => x.id === a.projectId);
                return `<li>
                  <span class="act-icon"><i data-lucide="${a.icon}"></i></span>
                  <div class="act-text">${esc(a.text)}<small>${proj ? esc(proj.title) + ' · ' : ''}${relTime(a.time)}</small></div>
                </li>`;
              }).join('') || '<li class="act-text">No activity yet.</li>'}
            </ul>
          </div>
        </aside>
      </div>`;
  }

  function stat(icon, value, label) {
    return `<div class="stat"><span class="stat-icon"><i data-lucide="${icon}"></i></span><div><strong>${value}</strong><span>${label}</span></div></div>`;
  }

  /* ---------- My Projects ---------- */
  function renderProjects() {
    const q = ui.projectSearch.toLowerCase();
    $('#page-projects').innerHTML = `
      <div class="page-header">
        <div>
          <h1>My Projects</h1>
          <p>Each project keeps its own sources, evidence, insight map and argument outline.</p>
        </div>
        <div class="actions"><button class="btn btn-primary" data-action="open-new-project"><i data-lucide="plus"></i>New project</button></div>
      </div>
      <div class="toolbar">
        <label class="search-input"><i data-lucide="search"></i><input id="projectSearch" type="search" placeholder="Search projects…" value="${esc(ui.projectSearch)}" /></label>
      </div>
      <div class="project-grid" id="projectGrid"></div>`;
    renderProjectGrid(q);
  }

  function renderProjectGrid(q = ui.projectSearch.toLowerCase()) {
    const list = [...state.projects]
      .sort((a, b) => b.updated - a.updated)
      .filter(p => !q || [p.title, p.question, p.course, p.description].join(' ').toLowerCase().includes(q));
    $('#projectGrid').innerHTML = list.map(p => projectCard(p, { deletable: true })).join('') +
      (q ? '' : `<button class="new-card" data-action="open-new-project"><span class="empty-icon"><i data-lucide="plus"></i></span>Create a new project</button>`) +
      (!list.length && q ? `<div class="empty" style="grid-column:1/-1"><h3>No projects match “${esc(q)}”</h3><p>Try a different keyword.</p></div>` : '');
    icons();
  }

  /* ---------- Evidence Library ---------- */
  function renderEvidence() {
    const p = currentProject();
    const evidence = projectEvidence();
    const counts = {};
    evidence.forEach(e => { counts[e.sourceId] = (counts[e.sourceId] || 0) + 1; });

    const sourceItems = p.sources.map(s => `
      <button class="source-item ${ui.lib.source === s.id ? 'active' : ''}" data-action="filter-source" data-id="${s.id}" title="${esc(s.file)}">
        <span class="file-icon">PDF</span>
        <span class="source-text">
          <strong>${esc(s.title)}</strong>
          <small>${esc(s.short || s.file)}${s.pages ? ` · ${s.pages} pp` : ''}${s.size ? ` · ${s.size}` : ''}</small>
        </span>
        <span class="count-pill">${counts[s.id] || 0}</span>
      </button>`).join('');

    $('#page-evidence').innerHTML = `
      <div class="page-header">
        <div>
          <h1>Evidence Library</h1>
          <p>Ask questions across your sources and keep the evidence that matters. Every card links back to its source document and page.</p>
        </div>
        <div class="actions"><button class="btn btn-outline" data-action="upload-source"><i data-lucide="file-up"></i>Add PDF</button></div>
      </div>

      ${!hasRealEvidence(p.id) ? `<div class="notice"><i data-lucide="info"></i><span>Evidence extraction is simulated in this prototype. Sources for <strong>${esc(p.title)}</strong> are listed, but full sample evidence is only available in the demo project. <button class="link-btn" data-action="open-project" data-id="${DEMO_PROJECT}">Open demo project</button></span></div>` : ''}

      <div class="library-grid">
        <aside class="panel sources-panel">
          <div class="panel-head"><h3>Source documents</h3><span class="count-pill">${p.sources.length}</span></div>
          <div class="source-list">
            <button class="source-item ${ui.lib.source === 'all' ? 'active' : ''}" data-action="filter-source" data-id="all">
              <span class="file-icon all"><i data-lucide="layers"></i></span>
              <span class="source-text"><strong>All sources</strong><small>Search across every document</small></span>
              <span class="count-pill">${evidence.length}</span>
            </button>
            ${sourceItems}
          </div>
          <div class="upload-row"><button class="upload-btn" data-action="upload-source"><i data-lucide="upload"></i>Upload PDF sources</button></div>
        </aside>

        <div class="library-main">
          <section class="panel ask-card">
            <div class="ask-title"><i data-lucide="sparkles"></i><h2>Ask your sources</h2></div>
            <p class="sub">Answers are generated only from your uploaded documents and always cite the original excerpts.</p>
            <form class="ask-form" id="askForm">
              <textarea id="askInput" rows="1" placeholder="e.g. How does night-time phone use affect mood?" aria-label="Research question"></textarea>
              <button class="btn btn-primary" type="submit" ${ui.asking ? 'disabled' : ''}><i data-lucide="arrow-up"></i>Ask</button>
            </form>
            <div class="suggestions">
              <span>Try:</span>
              ${SUGGESTED_QUESTIONS.map(q => `<button class="chip" data-action="ask-suggestion" data-q="${esc(q)}">${esc(q)}</button>`).join('')}
            </div>
          </section>

          <div id="answerArea"></div>

          <section class="lib-toolbar">
            <div class="lib-toolbar-row">
              <div class="tabs" role="tablist">
                <button class="tab ${ui.lib.tab === 'all' ? 'active' : ''}" data-action="set-tab" data-tab="all">All evidence <span class="count-pill" id="countAll">${evidence.length}</span></button>
                <button class="tab ${ui.lib.tab === 'saved' ? 'active' : ''}" data-action="set-tab" data-tab="saved">Saved <span class="count-pill" id="countSaved">${savedList().length}</span></button>
              </div>
              <label class="search-input"><i data-lucide="search"></i><input id="libSearch" type="search" placeholder="Search evidence, excerpts, sources…" value="${esc(ui.lib.query)}" /></label>
            </div>
            <div class="lib-toolbar-row">
              <button class="chip ${ui.lib.theme === 'all' ? 'active' : ''}" data-action="set-theme" data-theme="all">All themes</button>
              ${Object.values(THEMES).map(t => `<button class="chip ${ui.lib.theme === t.id ? 'active' : ''}" data-action="set-theme" data-theme="${t.id}"><span class="dot" style="--c:${t.color}"></span>${t.name}</button>`).join('')}
            </div>
          </section>

          <div>
            <p class="result-meta" id="resultMeta"></p>
            <div class="evidence-list" id="evidenceList" style="margin-top:10px"></div>
          </div>
        </div>
      </div>`;

    renderAnswer();
    renderEvidenceList();
  }

  function filteredEvidence() {
    const q = ui.lib.query.trim().toLowerCase();
    return projectEvidence().filter(e => {
      if (ui.lib.tab === 'saved' && !isSaved(e.id)) return false;
      if (ui.lib.theme !== 'all' && !e.themes.includes(ui.lib.theme)) return false;
      if (ui.lib.source !== 'all' && e.sourceId !== ui.lib.source) return false;
      if (q) {
        const src = sourceOf(e);
        const hay = [e.title, e.extracted, e.excerpt, src.file, src.title, src.short, e.themes.map(t => THEMES[t].name).join(' ')].join(' ').toLowerCase();
        return q.split(/\s+/).every(term => hay.includes(term));
      }
      return true;
    });
  }

  function renderEvidenceList() {
    const list = filteredEvidence();
    const container = $('#evidenceList');
    if (!container) return;
    const p = currentProject();
    const activeFilters = [];
    if (ui.lib.source !== 'all') { const s = p.sources.find(x => x.id === ui.lib.source); if (s) activeFilters.push(s.short || s.title); }
    if (ui.lib.theme !== 'all') activeFilters.push(THEMES[ui.lib.theme].name);
    if (ui.lib.query) activeFilters.push(`“${ui.lib.query}”`);

    $('#resultMeta').innerHTML = `Showing ${list.length} evidence card${list.length === 1 ? '' : 's'}${activeFilters.length ? ' · ' + esc(activeFilters.join(' · ')) + ` · <button class="link-btn" data-action="clear-filters">Clear filters</button>` : ''}`;

    if (!list.length) {
      const savedEmpty = ui.lib.tab === 'saved' && !savedList().length;
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon"><i data-lucide="${savedEmpty ? 'bookmark' : 'search-x'}"></i></div>
          <h3>${!hasRealEvidence(p.id) ? 'No evidence extracted yet' : savedEmpty ? 'No saved evidence yet' : 'No matching evidence'}</h3>
          <p>${!hasRealEvidence(p.id)
            ? 'In the full product, evidence would be extracted from your PDFs automatically. Try the demo project to explore the workflow.'
            : savedEmpty ? 'Save evidence cards from your search results or AI answers to build your library.' : 'Try another keyword, or clear the theme and source filters.'}</p>
          ${hasRealEvidence(p.id) ? '<button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button>' : `<button class="btn btn-soft btn-sm" data-action="open-project" data-id="${DEMO_PROJECT}">Open demo project</button>`}
        </div>`;
    } else {
      container.innerHTML = list.map(e => evidenceCard(e, { query: ui.lib.query })).join('');
    }
    const cs = $('#countSaved'); if (cs) cs.textContent = savedList().length;
    icons();
  }

  function renderAnswer() {
    const area = $('#answerArea');
    if (!area) return;
    if (ui.asking) {
      area.innerHTML = `<div class="panel thinking"><span class="bars"><span></span><span></span><span></span></span>Reading ${currentProject().sources.length} sources and tracing relevant passages…</div>`;
      return;
    }
    if (!ui.answer) { area.innerHTML = ''; return; }
    const a = ui.answer;
    let n = 0;
    const map = {};
    const body = a.text.replace(/\{(e\d+)\}/g, (_, id) => {
      if (!map[id]) map[id] = ++n;
      return `<sup><a data-action="jump-card" data-id="${id}" title="Jump to evidence">${map[id]}</a></sup>`;
    });
    area.innerHTML = `
      <section class="panel answer-card">
        <div class="answer-head">
          <span class="label-ai"><i data-lucide="sparkles"></i>AI-generated synthesis · simulated</span>
          <button class="icon-btn sm" data-action="clear-answer" aria-label="Dismiss answer"><i data-lucide="x"></i></button>
        </div>
        <div class="answer-q"><i data-lucide="message-square"></i>${esc(a.question)}</div>
        <div class="answer-body">${body}</div>
        <p class="answer-disclaimer"><i data-lucide="shield-check"></i>Generated from your sources — always verify against the original excerpts below.</p>
        ${a.evidence.length ? `
          <div class="answer-refs">
            <h4>Supporting evidence (${a.evidence.length})</h4>
            <div class="evidence-list">${a.evidence.map(id => evidenceCard(evidenceById(id))).join('')}</div>
          </div>` : ''}
      </section>`;
    icons();
  }

  function askQuestion(question) {
    question = question.trim();
    if (!question || ui.asking) return;
    ui.asking = true;
    ui.answer = null;
    renderAnswer();
    const btn = $('#askForm button'); if (btn) btn.disabled = true;

    setTimeout(() => {
      ui.asking = false;
      ui.answer = buildAnswer(question);
      logActivity('message-square', `Asked "${question.length > 60 ? question.slice(0, 57) + '…' : question}"`);
      touchProject();
      commit();
      renderAnswer();
      const b = $('#askForm button'); if (b) b.disabled = false;
      $('#answerArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 900);
  }

  function buildAnswer(question) {
    const p = currentProject();
    if (!hasRealEvidence(p.id)) {
      return { question, text: `I couldn't find extracted evidence for <strong>${esc(p.title)}</strong> yet. In this prototype, AI answers are demonstrated with the sample project "Social Media Use and Adolescent Mental Health".`, evidence: [] };
    }
    const hit = MOCK_ANSWERS.find(m => m.match.test(question));
    if (hit) return { question, text: hit.text, evidence: hit.evidence };

    // Fallback: keyword scoring across evidence
    const terms = question.toLowerCase().split(/\W+/).filter(t => t.length > 3);
    const scored = projectEvidence().map(e => {
      const hay = (e.title + ' ' + e.extracted + ' ' + e.excerpt).toLowerCase();
      return { e, score: terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    if (!scored.length) {
      return { question, text: 'I couldn’t find passages in your sources that clearly address this question. Try rephrasing it, or ask about a specific mechanism such as sleep, social comparison or online support.', evidence: [] };
    }
    const refs = scored.map(x => `{${x.e.id}}`).join(' ');
    return {
      question,
      text: `Your sources contain ${scored.length} passage${scored.length > 1 ? 's' : ''} related to this question ${refs}. The most relevant findings are listed below — review each original excerpt to judge how directly it answers your question before using it in your argument.`,
      evidence: scored.map(x => x.e.id)
    };
  }

  function toggleSave(id) {
    const list = savedList();
    const ev = evidenceById(id);
    const i = list.indexOf(id);
    if (i >= 0) {
      list.splice(i, 1);
      toast('Evidence removed from your library', { icon: 'bookmark-minus' });
      logActivity('bookmark-minus', `Removed evidence "${ev.title}"`);
    } else {
      list.push(id);
      toast('Evidence saved to your library', { icon: 'bookmark-check' });
      logActivity('bookmark-plus', `Saved evidence "${ev.title}"`);
    }
    touchProject();
    commit();
  }

  /* ---------- Insight Map ---------- */
  function mapEdges() {
    const edges = [];
    projectEvidence().forEach(e => e.themes.forEach(t => edges.push({ from: 't:' + t, to: 'e:' + e.id, type: 'theme' })));
    CONNECTIONS.forEach(c => edges.push({ from: 'e:' + c.a, to: 'e:' + c.b, type: c.type, note: c.note }));
    return edges;
  }

  function renderMap() {
    const p = currentProject();
    if (!hasRealEvidence(p.id)) {
      $('#page-map').innerHTML = `
        <div class="page-header"><div><h1>Insight Map</h1><p>Explore how findings across your sources relate to each other.</p></div></div>
        <div class="empty">
          <div class="empty-icon"><i data-lucide="waypoints"></i></div>
          <h3>Your map will appear once evidence is extracted</h3>
          <p>Themes and connections are generated from evidence cards. Open the demo project to explore a populated Insight Map.</p>
          <button class="btn btn-primary btn-sm" data-action="open-project" data-id="${DEMO_PROJECT}" data-goto="map">Open demo project</button>
        </div>`;
      return;
    }

    const f = ui.mapFilters;
    $('#page-map').innerHTML = `
      <div class="page-header">
        <div>
          <h1>Insight Map</h1>
          <p>See how findings cluster into themes and where sources agree, differ or contradict. Select any node to inspect it.</p>
        </div>
        <div class="actions"><button class="btn btn-outline btn-sm" data-action="clear-selection"><i data-lucide="maximize"></i>Reset view</button></div>
      </div>
      <div class="map-layout">
        <section class="panel map-wrap">
          <div class="map-toolbar">
            <div class="legend" aria-label="Connection types — toggle to show or hide">
              ${legendItem('theme', 'Belongs to theme', f.theme)}
              ${legendItem('similar', 'Similarity', f.similar)}
              ${legendItem('different', 'Difference', f.different)}
              ${legendItem('contradicts', 'Contradiction', f.contradicts)}
            </div>
            <span class="result-meta">${Object.keys(THEMES).length} themes · ${projectEvidence().length} evidence</span>
          </div>
          <div class="map-scroll">
            <div class="map-canvas" id="mapCanvas"></div>
          </div>
        </section>
        <aside class="panel map-detail" id="mapDetail"></aside>
      </div>`;
    drawMap();
  }

  function legendItem(type, label, checked) {
    return `<label class="legend-item"><input type="checkbox" data-conn-filter="${type}" ${checked ? 'checked' : ''}/><span class="legend-line ${type}"></span>${label}</label>`;
  }

  function drawMap() {
    const canvas = $('#mapCanvas');
    if (!canvas) return;
    const sel = ui.mapSelected;
    const edges = mapEdges().filter(e => ui.mapFilters[e.type]);

    // Related nodes/edges for highlighting
    const related = new Set();
    const relatedEdges = new Set();
    if (sel) {
      related.add(sel);
      edges.forEach((e, i) => {
        if (e.from === sel || e.to === sel) { related.add(e.from); related.add(e.to); relatedEdges.add(i); }
      });
    }

    const pos = (key) => MAP_LAYOUT[key] || [500, 330];
    const lines = edges.map((e, i) => {
      const [x1, y1] = pos(e.from); const [x2, y2] = pos(e.to);
      return `<line class="conn ${e.type} ${relatedEdges.has(i) ? 'related' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><title>${e.note ? esc(e.note) : ''}</title></line>`;
    }).join('');

    const nodeStyle = (key, color) => { const [x, y] = pos(key); return `left:${x / 10}%;top:${(y / 660) * 100}%;--c:${color}`; };

    const themeNodes = Object.values(THEMES).map(t => {
      const key = 't:' + t.id;
      const n = projectEvidence().filter(e => e.themes.includes(t.id)).length;
      return `<button class="map-node theme-node ${sel === key ? 'selected' : ''} ${related.has(key) ? 'related' : ''}" style="${nodeStyle(key, t.color)}" data-action="select-node" data-id="${key}">
        <span class="dot"></span>${t.name}<span class="n">${n}</span></button>`;
    }).join('');

    const evNodes = projectEvidence().map(e => {
      const key = 'e:' + e.id;
      const src = sourceOf(e);
      return `<button class="map-node ev-node ${sel === key ? 'selected' : ''} ${related.has(key) ? 'related' : ''}" style="${nodeStyle(key, THEMES[e.themes[0]].color)}" data-action="select-node" data-id="${key}" title="${esc(e.title)}">
        <span class="ev-node-src">${esc(src.short)} · p.${e.page}</span>
        <span class="ev-node-title">${esc(e.title)}</span></button>`;
    }).join('');

    canvas.classList.toggle('has-selection', !!sel);
    canvas.innerHTML = `<svg class="map-lines" viewBox="0 0 1000 660" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${themeNodes}${evNodes}`;
    renderMapDetail();
    icons();
  }

  function renderMapDetail() {
    const panel = $('#mapDetail');
    if (!panel) return;
    const sel = ui.mapSelected;
    const counts = { similar: 0, different: 0, contradicts: 0 };
    CONNECTIONS.forEach(c => counts[c.type]++);

    if (!sel) {
      panel.innerHTML = `
        <div class="panel-head"><h3>Map overview</h3></div>
        <div class="map-hint"><i data-lucide="mouse-pointer-click"></i><span>Click a <strong>theme</strong> to see its evidence, or an <strong>evidence card</strong> to see how it connects to other findings.</span></div>
        <div class="detail-section">
          <h4>At a glance</h4>
          <div class="overview-stats">
            <div><strong>${Object.keys(THEMES).length}</strong><span>Themes</span></div>
            <div><strong>${projectEvidence().length}</strong><span>Evidence nodes</span></div>
            <div><strong>${counts.similar}</strong><span>Similarities</span></div>
            <div><strong style="color:var(--red)">${counts.contradicts}</strong><span>Contradictions</span></div>
          </div>
        </div>
        <div class="detail-section">
          <h4>Tensions worth discussing</h4>
          <ul class="detail-list">
            ${CONNECTIONS.filter(c => c.type === 'contradicts').map(c => `
              <li><button class="detail-link" data-action="select-node" data-id="e:${c.a}">
                <span class="conn-badge contradicts"><i data-lucide="zap"></i>Contradiction</span>
                <strong>${esc(evidenceById(c.a).title)} ↔ ${esc(evidenceById(c.b).title)}</strong>
                <small>${esc(c.note)}</small>
              </button></li>`).join('')}
          </ul>
        </div>`;
      icons();
      return;
    }

    const [kind, id] = sel.split(':');
    if (kind === 't') {
      const t = THEMES[id];
      const evs = projectEvidence().filter(e => e.themes.includes(id));
      const internal = CONNECTIONS.filter(c => evs.some(e => e.id === c.a) || evs.some(e => e.id === c.b));
      panel.innerHTML = `
        <div class="panel-head">
          <span class="detail-kind"><span class="dot" style="--c:${t.color}"></span>Theme</span>
          <button class="icon-btn sm" data-action="clear-selection" aria-label="Close details"><i data-lucide="x"></i></button>
        </div>
        <div class="detail-section">
          <h3 class="detail-title">${t.name}</h3>
          <p class="detail-desc">${t.description}</p>
        </div>
        <div class="detail-section">
          <h4>Evidence in this theme (${evs.length})</h4>
          <ul class="detail-list">
            ${evs.map(e => `<li><button class="detail-link" data-action="select-node" data-id="e:${e.id}">
              <strong>${esc(e.title)}</strong><small>${esc(sourceOf(e).short)} · p. ${e.page}</small></button></li>`).join('')}
          </ul>
        </div>
        <div class="detail-section">
          <h4>Connections involving this theme</h4>
          <p class="detail-desc">${internal.length} link${internal.length === 1 ? '' : 's'}: ${['similar', 'different', 'contradicts'].map(tp => `${internal.filter(c => c.type === tp).length} ${CONN_LABELS[tp].label.toLowerCase()}`).join(', ')}.</p>
          <div style="margin-top:12px"><button class="btn btn-soft btn-sm" data-action="library-theme" data-theme="${id}"><i data-lucide="library"></i>Open in Evidence Library</button></div>
        </div>`;
    } else {
      const e = evidenceById(id);
      const src = sourceOf(e);
      const conns = CONNECTIONS.filter(c => c.a === id || c.b === id);
      const saved = isSaved(id);
      panel.innerHTML = `
        <div class="panel-head">
          <span class="detail-kind"><span class="dot" style="--c:${THEMES[e.themes[0]].color}"></span>Evidence</span>
          <button class="icon-btn sm" data-action="clear-selection" aria-label="Close details"><i data-lucide="x"></i></button>
        </div>
        <div class="detail-section">
          <div class="ev-tags">${e.themes.map(t => `<button class="tag" data-action="select-node" data-id="t:${t}" style="border:0"><span class="dot" style="--c:${THEMES[t].color}"></span>${THEMES[t].name}</button>`).join('')}</div>
          <h3 class="detail-title">${esc(e.title)}</h3>
          <div class="ev-ai" style="margin-bottom:12px"><span class="label-ai"><i data-lucide="sparkles"></i>AI explanation</span><p>${esc(e.extracted)}</p></div>
          <blockquote class="ev-excerpt"><span class="label-src"><i data-lucide="quote"></i>Original excerpt</span><p>“${esc(e.excerpt)}”</p></blockquote>
          <div class="ev-foot" style="margin-top:12px">
            <span class="ev-src"><i data-lucide="file-text"></i><span>${esc(src.file)}</span></span><span class="page-pill">p. ${e.page}</span>
          </div>
          <div style="margin-top:12px">
            <button class="btn btn-sm ${saved ? 'btn-danger' : 'btn-outline'}" data-action="toggle-save" data-id="${id}">
              <i data-lucide="${saved ? 'bookmark-minus' : 'bookmark-plus'}"></i>${saved ? 'Remove from library' : 'Save Evidence'}</button>
          </div>
        </div>
        <div class="detail-section">
          <h4>Connections (${conns.length})</h4>
          ${conns.length ? `<ul class="detail-list">${conns.map(c => {
            const other = evidenceById(c.a === id ? c.b : c.a);
            return `<li><button class="detail-link" data-action="select-node" data-id="e:${other.id}">
              <span class="conn-badge ${c.type}"><i data-lucide="${CONN_LABELS[c.type].icon}"></i>${CONN_LABELS[c.type].label}</span>
              <strong>${esc(other.title)}</strong>
              <small>${esc(c.note)}</small></button></li>`;
          }).join('')}</ul>` : '<p class="detail-desc">No direct connections with other evidence yet.</p>'}
        </div>`;
    }
    icons();
  }

  /* ---------- Argument Builder ---------- */
  function renderBuilder() {
    const p = currentProject();
    const o = outlineFor(p.id);
    const saved = savedList().map(evidenceById).filter(Boolean);
    const usage = {};
    o.args.forEach(a => a.evidence.forEach(id => { usage[id] = (usage[id] || 0) + 1; }));

    const unsupported = o.args.filter(a => !a.evidence.length && a.claim);
    const hasCounter = o.args.some(a => a.type === 'counter');
    const checks = [
      { ok: !!o.thesis, text: o.thesis ? 'Central argument defined' : 'Write a central argument' },
      { ok: o.args.length >= 2, text: `${o.args.length} argument section${o.args.length === 1 ? '' : 's'}` },
      { ok: !unsupported.length, text: unsupported.length ? `${unsupported.length} section${unsupported.length > 1 ? 's' : ''} without evidence` : 'Every section has evidence' },
      { ok: hasCounter, text: hasCounter ? 'Counterargument addressed' : 'Consider adding a counterargument' }
    ];

    $('#page-builder').innerHTML = `
      <div class="page-header">
        <div>
          <h1>Argument Builder</h1>
          <p>Shape your evidence into an academic outline. Drag sections to reorder, and drag saved evidence onto any section to link it.</p>
        </div>
        <div class="actions">
          <button class="btn btn-outline" data-action="export-outline"><i data-lucide="copy"></i>Copy outline</button>
          <button class="btn btn-primary" data-action="add-arg"><i data-lucide="plus"></i>Add section</button>
        </div>
      </div>

      <div class="builder-layout">
        <div class="outline">
          ${thesisCard(o)}
          <div class="arg-list" id="argList">
            ${o.args.map((a, i) => ui.editingArg === a.id ? argForm(a, i) : argCard(a, i, o.args.length)).join('')}
          </div>
          ${!o.args.length ? `<div class="empty"><div class="empty-icon"><i data-lucide="list-tree"></i></div><h3>No sections yet</h3><p>Add supporting arguments, counterarguments and rebuttals, then link evidence to each one.</p></div>` : ''}
          <button class="add-section" data-action="add-arg"><i data-lucide="plus"></i>Add argument section</button>
        </div>

        <aside class="panel tray">
          <div class="panel-head"><h3>Saved evidence</h3><span class="count-pill">${saved.length}</span></div>
          <div class="outline-check">
            <strong>Outline check</strong>
            <ul>${checks.map(c => `<li class="${c.ok ? 'ok' : 'warn'}"><i data-lucide="${c.ok ? 'circle-check' : 'circle-alert'}"></i><span>${c.text}</span></li>`).join('')}</ul>
          </div>
          <div class="tray-list">
            ${saved.length ? saved.map(e => `
              <div class="tray-item" draggable="true" data-drag-evidence="${e.id}" title="Drag onto a section to link">
                <i data-lucide="grip-vertical"></i>
                <div><strong>${esc(e.title)}</strong><small>${esc(sourceOf(e).short || sourceOf(e).file)} · p. ${e.page}${usage[e.id] ? `<span class="used-pill">Used ${usage[e.id]}×</span>` : ''}</small></div>
              </div>`).join('')
              : `<div class="empty" style="padding:24px 16px"><p style="margin-bottom:10px">Save evidence in the library to link it here.</p><button class="btn btn-soft btn-sm" data-action="go" data-page="evidence">Go to Evidence Library</button></div>`}
          </div>
        </aside>
      </div>`;

    if (ui.editingArg) {
      const input = $(`#argForm-${ui.editingArg} input[name="claim"]`);
      if (input) input.focus();
    }
  }

  function thesisCard(o) {
    const p = currentProject();
    if (ui.editingThesis) {
      return `
        <form class="thesis-card" id="thesisForm">
          <div class="thesis-top"><span class="thesis-label"><i data-lucide="target"></i>Central argument / thesis</span></div>
          <div class="field"><textarea name="thesis" rows="3" class="input" placeholder="State the main claim your research will defend…">${esc(o.thesis)}</textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-action="cancel-thesis">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="check"></i>Save thesis</button>
          </div>
        </form>`;
    }
    return `
      <section class="thesis-card">
        <div class="thesis-top">
          <span class="thesis-label"><i data-lucide="target"></i>Central argument / thesis</span>
          <button class="btn btn-ghost btn-sm" data-action="edit-thesis"><i data-lucide="pencil"></i>Edit</button>
        </div>
        <p class="thesis-text ${o.thesis ? '' : 'placeholder'}">${o.thesis ? esc(o.thesis) : `Click edit to write your thesis. Research question: “${esc(p.question || 'not set')}”`}</p>
      </section>`;
  }

  function argCard(a, i, total) {
    const saved = savedList();
    const linkable = saved.filter(id => !a.evidence.includes(id)).map(evidenceById).filter(Boolean);
    return `
      <article class="arg-card" data-id="${a.id}">
        <div class="arg-handle" title="Drag to reorder" aria-hidden="true"><i data-lucide="grip-vertical"></i></div>
        <div class="arg-body">
          <div class="arg-top">
            <span class="arg-num">Section ${i + 1}</span>
            <span class="arg-type ${a.type}">${SECTION_TYPES[a.type]}</span>
            <div class="arg-actions">
              <button class="icon-btn sm" data-action="move-arg" data-id="${a.id}" data-dir="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}><i data-lucide="arrow-up"></i></button>
              <button class="icon-btn sm" data-action="move-arg" data-id="${a.id}" data-dir="1" aria-label="Move down" ${i === total - 1 ? 'disabled' : ''}><i data-lucide="arrow-down"></i></button>
              <button class="icon-btn sm" data-action="edit-arg" data-id="${a.id}" aria-label="Edit section"><i data-lucide="pencil"></i></button>
              <button class="icon-btn sm danger" data-action="delete-arg" data-id="${a.id}" aria-label="Delete section"><i data-lucide="trash-2"></i></button>
            </div>
          </div>
          <h3 class="arg-claim">${esc(a.claim)}</h3>
          ${a.explanation ? `<p class="arg-expl">${esc(a.explanation)}</p>` : ''}
          <div class="arg-evidence">
            <div class="arg-evidence-label"><i data-lucide="link-2"></i>Linked evidence (${a.evidence.length})</div>
            <div class="ev-links">
              ${a.evidence.length ? a.evidence.map(id => {
                const e = evidenceById(id); if (!e) return '';
                return `<div class="ev-link">
                  <span class="dot" style="--c:${THEMES[e.themes[0]].color}"></span>
                  <div class="ev-link-text"><strong>${esc(e.title)}</strong><small>${esc(sourceOf(e).short)} · p. ${e.page}${isSaved(id) ? '' : ' · no longer in saved library'}</small></div>
                  <button class="icon-btn sm" data-action="unlink-evidence" data-arg="${a.id}" data-id="${id}" aria-label="Unlink evidence"><i data-lucide="x"></i></button>
                </div>`;
              }).join('') : '<div class="ev-link-warn"><i data-lucide="circle-alert"></i>No evidence linked yet — claims need support.</div>'}
            </div>
            <div class="link-row">
              ${linkable.length ? `<select class="select" data-link-select="${a.id}" aria-label="Link saved evidence">
                <option value="">+ Link saved evidence…</option>
                ${linkable.map(e => `<option value="${e.id}">${esc(e.title)}</option>`).join('')}
              </select>` : ''}
              <span class="drop-hint">or drag evidence from the panel</span>
            </div>
          </div>
        </div>
      </article>`;
  }

  function argForm(a, i) {
    return `
      <form class="arg-card arg-form" id="argForm-${a.id}" data-id="${a.id}">
        <div class="arg-handle" aria-hidden="true"><i data-lucide="pencil"></i></div>
        <div class="arg-body">
          <div class="arg-top"><span class="arg-num">Section ${i + 1} · Editing</span></div>
          <div class="field-row">
            <div class="field">
              <label>Section type</label>
              <select name="type">${Object.entries(SECTION_TYPES).map(([k, v]) => `<option value="${k}" ${a.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
            </div>
            <div></div>
          </div>
          <div class="field"><label>Claim <span class="req">*</span></label><input name="claim" value="${esc(a.claim)}" placeholder="State the point this section argues" required /></div>
          <div class="field"><label>Reasoning</label><textarea name="explanation" rows="3" placeholder="Explain how the evidence supports this claim">${esc(a.explanation)}</textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-action="cancel-arg" data-id="${a.id}">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="check"></i>Save section</button>
          </div>
        </div>
      </form>`;
  }

  function linkEvidence(argId, evId) {
    const o = outlineFor();
    const a = o.args.find(x => x.id === argId);
    if (!a || !evId) return;
    if (a.evidence.includes(evId)) { toast('That evidence is already linked to this section', { icon: 'info', type: 'warn' }); return; }
    a.evidence.push(evId);
    touchProject();
    logActivity('link-2', `Linked "${evidenceById(evId).title}" to "${a.claim}"`);
    commit();
    refresh();
    toast('Evidence linked to section', { icon: 'link-2' });
  }

  function exportOutline() {
    const p = currentProject();
    const o = outlineFor();
    let txt = `${p.title}\nResearch question: ${p.question || '—'}\n\nTHESIS\n${o.thesis || '—'}\n`;
    o.args.forEach((a, i) => {
      txt += `\n${i + 1}. [${SECTION_TYPES[a.type]}] ${a.claim}\n`;
      if (a.explanation) txt += `   ${a.explanation}\n`;
      a.evidence.forEach(id => { const e = evidenceById(id); if (e) txt += `   - ${e.title} (${sourceOf(e).short}, p. ${e.page})\n`; });
    });
    const done = () => toast('Outline copied to clipboard', { icon: 'clipboard-check' });
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
    } else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed', { icon: 'x', type: 'warn' }); }
    ta.remove();
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    const u = state.user;
    $('#page-settings').innerHTML = `
      <div class="page-header"><div><h1>Settings</h1><p>Manage your profile and workspace preferences.</p></div></div>
      <div class="settings-grid">
        <form class="panel" id="settingsForm">
          <div class="panel-head"><h2>Profile</h2></div>
          <div class="panel-body">
            <div class="field"><label for="setName">Full name</label><input id="setName" name="name" value="${esc(u.name)}" required /></div>
            <div class="field"><label for="setUni">University</label><input id="setUni" name="university" value="${esc(u.university)}" /></div>
            <div class="field"><label for="setCite">Preferred citation style</label>
              <select id="setCite" name="citation">${['APA 7', 'MLA 9', 'Chicago (author-date)', 'Harvard'].map(c => `<option ${u.citation === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
            </div>
            <div class="toggle-row">
              <div><strong>Label AI-generated content</strong><small>Show an “AI explanation” label on every generated summary.</small></div>
              <label class="switch"><input type="checkbox" name="showAiLabels" ${u.showAiLabels ? 'checked' : ''}/><span></span></label>
            </div>
            <div class="form-actions" style="margin-top:12px"><button class="btn btn-primary" type="submit"><i data-lucide="check"></i>Save changes</button></div>
          </div>
        </form>

        <div style="display:flex;flex-direction:column;gap:20px">
          <section class="panel">
            <div class="panel-head"><h2>Prototype data</h2></div>
            <div class="panel-body about">
              <p>Your projects, saved evidence and outlines are stored in this browser’s local storage. Resetting restores the original sample workspace.</p>
              <div style="margin-top:14px"><button class="btn btn-danger" data-action="reset-demo"><i data-lucide="rotate-ccw"></i>Reset demo data</button></div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>About Trace &amp; Think</h2></div>
            <div class="panel-body about">
              <p><strong>Research with clarity. Think with evidence.</strong></p>
              <p>This is a front-end prototype. AI answers, evidence extraction and connections are simulated with mock data, and uploaded PDFs are not parsed or sent anywhere.</p>
              <p>All sample sources, authors and statistics are fictional and for demonstration only.</p>
            </div>
          </section>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------
     MODAL: Create project
     ------------------------------------------------------ */
  function openModal() {
    ui.pendingFiles = [];
    const form = $('#projectForm');
    form.reset();
    $('#pfTitleError').hidden = true;
    form.querySelector('.field').classList.remove('invalid');
    renderPendingFiles();
    $('#projectModal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#pfTitle').focus(), 30);
  }
  function closeModal() {
    $('#projectModal').hidden = true;
    document.body.style.overflow = '';
  }
  function addPendingFiles(fileList) {
    const files = [...fileList];
    const pdfs = files.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (pdfs.length < files.length) toast(`${files.length - pdfs.length} file(s) skipped — only PDFs are supported`, { icon: 'triangle-alert', type: 'warn' });
    pdfs.forEach(f => {
      if (!ui.pendingFiles.some(x => x.name === f.name && x.size === f.size)) ui.pendingFiles.push({ name: f.name, size: f.size });
    });
    renderPendingFiles();
  }
  function renderPendingFiles() {
    $('#projectFileList').innerHTML = ui.pendingFiles.map((f, i) => `
      <li><i data-lucide="file-text"></i><span title="${esc(f.name)}">${esc(f.name)}</span><small>${formatSize(f.size)}</small>
      <button type="button" class="icon-btn sm" data-action="remove-file" data-index="${i}" aria-label="Remove ${esc(f.name)}"><i data-lucide="x"></i></button></li>`).join('');
    icons();
  }
  function createProject(form) {
    const data = Object.fromEntries(new FormData(form));
    const title = (data.title || '').trim();
    if (!title) {
      $('#pfTitleError').hidden = false;
      $('#pfTitle').closest('.field').classList.add('invalid');
      $('#pfTitle').focus();
      return;
    }
    const now = Date.now();
    const project = {
      id: uid('p'), title, course: (data.course || '').trim(),
      question: (data.question || '').trim(), description: (data.description || '').trim(), due: data.due || '',
      sources: ui.pendingFiles.map(f => ({ id: uid('s'), file: f.name, title: fileToTitle(f.name), short: '', pages: null, size: formatSize(f.size) })),
      sampleEvidence: 0, updated: now, created: now
    };
    state.projects.unshift(project);
    state.currentProjectId = project.id;
    state.saved[project.id] = [];
    state.outlines[project.id] = { thesis: '', args: [] };
    logActivity('folder-plus', `Created project "${title}"${project.sources.length ? ` with ${project.sources.length} source${project.sources.length > 1 ? 's' : ''}` : ''}`, project.id);
    resetLibraryFilters();
    commit();
    closeModal();
    toast(`Project “${title}” created`, { icon: 'folder-check' });
    navigate('dashboard');
  }

  function addSourcesToCurrent(fileList) {
    const p = currentProject();
    const files = [...fileList];
    const pdfs = files.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (pdfs.length < files.length) toast(`${files.length - pdfs.length} file(s) skipped — only PDFs are supported`, { icon: 'triangle-alert', type: 'warn' });
    if (!pdfs.length) return;
    pdfs.forEach(f => p.sources.push({ id: uid('s'), file: f.name, title: fileToTitle(f.name), short: '', pages: null, size: formatSize(f.size) }));
    logActivity('file-up', pdfs.length === 1 ? `Uploaded ${pdfs[0].name}` : `Uploaded ${pdfs.length} sources`);
    touchProject();
    commit();
    refresh();
    toast(`${pdfs.length} PDF${pdfs.length > 1 ? 's' : ''} added to ${p.title}`, { icon: 'file-check' });
  }

  function resetLibraryFilters() {
    ui.lib = { query: '', theme: 'all', source: 'all', tab: 'all' };
    ui.answer = null;
    ui.mapSelected = null;
    ui.editingArg = null;
    ui.editingThesis = false;
  }

  function switchProject(id) {
    if (!state.projects.some(p => p.id === id)) return;
    state.currentProjectId = id;
    resetLibraryFilters();
    commit();
  }

  /* ------------------------------------------------------
     6. EVENT HANDLING
     ------------------------------------------------------ */
  const actions = {
    'open-new-project': () => openModal(),
    'close-modal': () => closeModal(),
    'toggle-sidebar': () => $('.app').classList.contains('nav-open') ? closeSidebar() : openSidebar(),
    'close-sidebar': () => closeSidebar(),
    'go': (el) => navigate(el.dataset.page),
    'notifications': () => toast('You’re all caught up — no new notifications', { icon: 'bell' }),

    'open-project': (el, ev) => {
      if (ev.target.closest('[data-action="delete-project"]')) return;
      switchProject(el.dataset.id);
      navigate(el.dataset.goto || 'evidence');
    },
    'delete-project': (el, ev) => {
      ev.stopPropagation();
      const p = state.projects.find(x => x.id === el.dataset.id);
      if (!p || !confirm(`Delete “${p.title}”? This removes its sources, saved evidence and outline from this browser.`)) return;
      state.projects = state.projects.filter(x => x.id !== p.id);
      delete state.saved[p.id]; delete state.outlines[p.id];
      if (state.currentProjectId === p.id) { state.currentProjectId = state.projects[0].id; resetLibraryFilters(); }
      commit(); refresh();
      toast('Project deleted', { icon: 'trash-2' });
    },

    // Evidence library
    'toggle-save': (el) => {
      toggleSave(el.dataset.id);
      if (currentPage() === 'evidence') { renderEvidenceList(); renderAnswer(); }
      else if (currentPage() === 'map') renderMapDetail();
    },
    'filter-source': (el) => { ui.lib.source = el.dataset.id; refresh(); },
    'set-tab': (el) => { ui.lib.tab = el.dataset.tab; $$('.tab').forEach(t => t.classList.toggle('active', t === el)); renderEvidenceList(); },
    'set-theme': (el) => { ui.lib.theme = el.dataset.theme; $$('[data-action="set-theme"]').forEach(c => c.classList.toggle('active', c === el)); renderEvidenceList(); },
    'clear-filters': () => { ui.lib = { ...ui.lib, query: '', theme: 'all', source: 'all' }; $('#globalSearch').value = ''; refresh(); },
    'ask-suggestion': (el) => { $('#askInput').value = el.dataset.q; askQuestion(el.dataset.q); },
    'clear-answer': () => { ui.answer = null; renderAnswer(); },
    'jump-card': (el) => {
      const card = $('#answerArea #card-' + el.dataset.id) || $('#card-' + el.dataset.id);
      if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.animate([{ boxShadow: '0 0 0 4px rgba(82,96,200,.35)' }, { boxShadow: '0 0 0 0 rgba(82,96,200,0)' }], { duration: 1200 }); }
    },
    'upload-source': () => $('#sourceUpload').click(),
    'remove-file': (el) => { ui.pendingFiles.splice(+el.dataset.index, 1); renderPendingFiles(); },
    'view-in-map': (el) => { ui.mapSelected = 'e:' + el.dataset.id; navigate('map'); },

    // Insight map
    'select-node': (el) => {
      ui.mapSelected = ui.mapSelected === el.dataset.id && el.classList.contains('map-node') ? null : el.dataset.id;
      drawMap();
    },
    'clear-selection': () => { ui.mapSelected = null; drawMap(); },
    'library-theme': (el) => { ui.lib = { query: '', theme: el.dataset.theme, source: 'all', tab: 'all' }; navigate('evidence'); },

    // Argument builder
    'edit-thesis': () => { ui.editingThesis = true; refresh(); const t = $('#thesisForm textarea'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } },
    'cancel-thesis': () => { ui.editingThesis = false; refresh(); },
    'add-arg': () => {
      const o = outlineFor();
      if (ui.newArgId) return;
      const a = { id: uid('a'), type: 'supporting', claim: '', explanation: '', evidence: [] };
      o.args.push(a);
      ui.editingArg = a.id; ui.newArgId = a.id;
      refresh();
      const form = $('#argForm-' + a.id); if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    'edit-arg': (el) => { cancelNewArg(); ui.editingArg = el.dataset.id; refresh(); },
    'cancel-arg': () => { cancelNewArg(); ui.editingArg = null; refresh(); },
    'delete-arg': (el) => {
      const o = outlineFor();
      const a = o.args.find(x => x.id === el.dataset.id);
      if (!a || !confirm(`Delete the section “${a.claim || 'Untitled'}”?`)) return;
      o.args = o.args.filter(x => x.id !== a.id);
      touchProject(); logActivity('trash-2', `Deleted section "${a.claim}"`); commit(); refresh();
      toast('Section deleted', { icon: 'trash-2' });
    },
    'move-arg': (el) => {
      const o = outlineFor();
      const i = o.args.findIndex(x => x.id === el.dataset.id);
      const j = i + Number(el.dataset.dir);
      if (i < 0 || j < 0 || j >= o.args.length) return;
      [o.args[i], o.args[j]] = [o.args[j], o.args[i]];
      touchProject(); commit(); refresh();
    },
    'unlink-evidence': (el) => {
      const a = outlineFor().args.find(x => x.id === el.dataset.arg);
      if (!a) return;
      a.evidence = a.evidence.filter(id => id !== el.dataset.id);
      touchProject(); commit(); refresh();
    },
    'export-outline': () => exportOutline(),

    // Settings
    'reset-demo': () => {
      if (!confirm('Reset all projects, saved evidence and outlines to the original sample data?')) return;
      state = seedState(); resetLibraryFilters(); persist();
      toast('Demo data restored', { icon: 'rotate-ccw' });
      navigate('dashboard');
    }
  };

  function cancelNewArg() {
    if (!ui.newArgId) return;
    const o = outlineFor();
    o.args = o.args.filter(a => a.id !== ui.newArgId);
    ui.newArgId = null;
  }

  // Click delegation
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) {
      if (el.tagName === 'A' && el.getAttribute('href') === null) ev.preventDefault();
      fn(el, ev);
    }
  });

  // Keyboard activation for card-like role="button" elements
  document.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.project-card[role="button"]')) {
      ev.preventDefault(); ev.target.click();
    }
    if (ev.key === 'Escape') {
      if (!$('#projectModal').hidden) closeModal();
      else if (ui.mapSelected && currentPage() === 'map') { ui.mapSelected = null; drawMap(); }
      closeSidebar();
    }
    if (ev.key === '/' && !ev.target.matches('input, textarea, select, [contenteditable]')) {
      ev.preventDefault(); $('#globalSearch').focus();
    }
    if (ev.key === 'Enter' && !ev.shiftKey && ev.target.id === 'askInput') {
      ev.preventDefault(); askQuestion(ev.target.value);
    }
  });

  // Inputs
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.id === 'libSearch') { ui.lib.query = t.value; renderEvidenceList(); }
    if (t.id === 'projectSearch') { ui.projectSearch = t.value; renderProjectGrid(); }
    if (t.id === 'askInput') { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }
    if (t.id === 'pfTitle' && t.value.trim()) { $('#pfTitleError').hidden = true; t.closest('.field').classList.remove('invalid'); }
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id === 'projectSelect') { switchProject(t.value); refresh(); toast(`Switched to ${currentProject().title}`, { icon: 'folder-open' }); }
    if (t.id === 'projectFiles') { addPendingFiles(t.files); t.value = ''; }
    if (t.id === 'sourceUpload') { addSourcesToCurrent(t.files); t.value = ''; }
    if (t.dataset.connFilter) { ui.mapFilters[t.dataset.connFilter] = t.checked; drawMap(); }
    if (t.dataset.linkSelect && t.value) linkEvidence(t.dataset.linkSelect, t.value);
  });

  // Forms
  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    ev.preventDefault();
    if (f.id === 'projectForm') createProject(f);
    if (f.id === 'askForm') askQuestion($('#askInput').value);
    if (f.id === 'globalSearchForm') {
      ui.lib = { query: $('#globalSearch').value.trim(), theme: 'all', source: 'all', tab: 'all' };
      navigate('evidence');
    }
    if (f.id === 'thesisForm') {
      outlineFor().thesis = f.thesis.value.trim();
      ui.editingThesis = false;
      touchProject(); logActivity('target', 'Updated central argument'); commit(); refresh();
      toast('Thesis saved');
    }
    if (f.id && f.id.startsWith('argForm-')) {
      const a = outlineFor().args.find(x => x.id === f.dataset.id);
      const claim = f.claim.value.trim();
      if (!a) return;
      if (!claim) { f.claim.focus(); f.claim.closest('.field').classList.add('invalid'); return; }
      const isNew = ui.newArgId === a.id;
      a.claim = claim; a.explanation = f.explanation.value.trim(); a.type = f.type.value;
      ui.editingArg = null; ui.newArgId = null;
      touchProject(); logActivity('list-tree', `${isNew ? 'Added' : 'Edited'} section "${claim}"`); commit(); refresh();
      toast(isNew ? 'Section added' : 'Section updated');
    }
    if (f.id === 'settingsForm') {
      const d = new FormData(f);
      state.user.name = (d.get('name') || '').trim() || 'Student';
      state.user.university = (d.get('university') || '').trim();
      state.user.citation = d.get('citation');
      state.user.showAiLabels = !!d.get('showAiLabels');
      commit();
      toast('Settings saved');
    }
  });

  /* Modal dropzone drag & drop */
  const dz = $('#dropzone');
  ['dragenter', 'dragover'].forEach(t => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) addPendingFiles(e.dataTransfer.files); });
  $('#projectModal').addEventListener('mousedown', (e) => { if (e.target.id === 'projectModal') closeModal(); });

  /* ---------- Argument Builder drag & drop ----------
     - Drag a section by its handle to reorder.
     - Drag a saved evidence item from the tray onto a section to link it. */
  let drag = null;

  document.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.arg-handle');
    const card = handle && handle.closest('.arg-card:not(.arg-form)');
    if (card) card.setAttribute('draggable', 'true');
  });
  document.addEventListener('mouseup', () => {
    if (!drag) $$('.arg-card[draggable]').forEach(c => c.removeAttribute('draggable'));
  });

  document.addEventListener('dragstart', (e) => {
    const trayItem = e.target.closest && e.target.closest('[data-drag-evidence]');
    const card = e.target.closest && e.target.closest('.arg-card[draggable="true"]');
    if (trayItem) {
      drag = { kind: 'evidence', id: trayItem.dataset.dragEvidence };
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', drag.id);
      trayItem.classList.add('dragging');
    } else if (card) {
      drag = { kind: 'arg', id: card.dataset.id };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', drag.id);
      requestAnimationFrame(() => card.classList.add('dragging'));
    }
  });

  document.addEventListener('dragover', (e) => {
    if (!drag) return;
    if (drag.kind === 'evidence') {
      const card = e.target.closest('.arg-card:not(.arg-form)');
      $$('.arg-card.drop-target').forEach(c => { if (c !== card) c.classList.remove('drop-target'); });
      if (card) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; card.classList.add('drop-target'); }
    } else if (drag.kind === 'arg') {
      const list = $('#argList');
      if (!list || !list.contains(e.target) && e.target !== list) return;
      e.preventDefault();
      const dragging = $('.arg-card.dragging');
      if (!dragging) return;
      const after = $$('.arg-card:not(.dragging)', list).find(c => {
        const box = c.getBoundingClientRect();
        return e.clientY < box.top + box.height / 2;
      });
      if (after) list.insertBefore(dragging, after); else list.appendChild(dragging);
    }
  });

  document.addEventListener('drop', (e) => {
    if (!drag) return;
    if (drag.kind === 'evidence') {
      const card = e.target.closest('.arg-card:not(.arg-form)');
      if (card) { e.preventDefault(); linkEvidence(card.dataset.id, drag.id); }
    } else e.preventDefault();
  });

  document.addEventListener('dragend', () => {
    if (!drag) return;
    if (drag.kind === 'arg') {
      const order = $$('#argList .arg-card').map(c => c.dataset.id);
      const o = outlineFor();
      const before = o.args.map(a => a.id).join();
      o.args.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      if (before !== o.args.map(a => a.id).join()) { touchProject(); commit(); toast('Sections reordered', { icon: 'list-tree' }); }
    }
    drag = null;
    $$('.dragging, .drop-target').forEach(el => el.classList.remove('dragging', 'drop-target'));
    if (currentPage() === 'builder') refresh();
  });

  /* ---------- Boot ---------- */
  window.addEventListener('hashchange', () => renderPage());
  renderPage();
})();
