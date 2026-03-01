const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const figlet = require('figlet');

const DIST = path.join(__dirname, 'dist');
const POSTS_DIR = path.join(__dirname, 'posts');
const CONTENT_DIR = path.join(__dirname, 'content');
const PAGES_DIR = path.join(__dirname, 'pages');
const POSTS_PER_PAGE = 10;
const HOME_POST_COUNT = 3;

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

const STYLE = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/comic-mono@0.0.1/index.css" />
        <style>
            *,
            *::before,
            *::after {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            :root {
                font-family: "Comic Mono", "Courier New", monospace;
                font-size: 16px;
                line-height: 1.5;
            }

            ::selection {
                background: #e0e0e0;
                color: #0a0a0a;
            }

            body {
                background: #0a0a0a;
                color: #e0e0e0;
                min-height: 100vh;
                padding: 0 3ch;
            }

            a {
                color: inherit;
                text-decoration: none;
                position: relative;
            }

            a::after {
                content: " (" attr(href) ")";
                position: absolute;
                white-space: nowrap;
                color: #e0e0e0;
                background: #1a1a1a;
                pointer-events: none;
                z-index: 1000;
                max-width: 0;
                overflow: hidden;
            }

            a:hover::after {
                animation: typewriter 2s steps(120) forwards;
            }

            @keyframes typewriter {
                to {
                    max-width: 120ch;
                }
            }

            .page {
                max-width: 72ch;
                margin: 0 auto;
            }

            /* ---- SITE NAME ANIMATION ---- */
            .name-anim {
                position: relative;
                display: inline-block;
            }

            .name-base span {
                animation: base-char 30s linear infinite;
                animation-delay: calc(var(--d) * 0.4s);
            }

            .name-red {
                position: absolute;
                top: 0;
                right: 0;
                white-space: nowrap;
            }

            .rl {
                color: #ef4444;
                background: #0a0a0a;
                opacity: 0;
            }

            .rl-g1 { animation: rl-g1-opacity 30s linear infinite,
                                rl-g1-case 30s step-end infinite; }
            .rl-r  { animation: rl-r  30s linear infinite; }
            .rl-g2 { animation: rl-g2 30s linear infinite; }
            .rl-t  { animation: rl-t  30s linear infinite; }
            .rl-a  { animation: rl-a  30s linear infinite; }

            .sp {
                display: inline-block;
                overflow: hidden;
            }

            .sp1 { width: 2ch; animation: sp1 30s step-end infinite; }
            .sp2 { width: 2ch; animation: sp2 30s step-end infinite; }
            .sp3 { width: 1ch; animation: sp3 30s step-end infinite; }

            .name-xyz span {
                color: #ef4444;
                opacity: 0;
                animation: xyz-char 30s linear infinite;
                animation-delay: calc(var(--d) * 0.4s);
            }

            @keyframes base-char {
                0%, 10%   { color: #e0e0e0; }
                15%, 68%  { color: #333; }
                73%, 100% { color: #e0e0e0; }
            }

            @keyframes rl-g1-opacity {
                0%, 10%   { opacity: 0; }
                15%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            @keyframes rl-g1-case {
                0%   { text-transform: uppercase; }
                10%  { text-transform: lowercase; }
                73%  { text-transform: uppercase; }
            }

            @keyframes rl-r {
                0%, 14%   { opacity: 0; }
                19%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            @keyframes rl-g2 {
                0%, 15%   { opacity: 0; }
                20%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            @keyframes rl-t {
                0%, 19%   { opacity: 0; }
                24%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            @keyframes rl-a {
                0%, 22%   { opacity: 0; }
                27%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            @keyframes sp1 {
                0%, 37%   { width: 2ch; }
                41%       { width: 1ch; }
                45%, 68%  { width: 0; }
                73%, 100% { width: 2ch; }
            }

            @keyframes sp2 {
                0%, 45%   { width: 2ch; }
                49%       { width: 1ch; }
                53%, 68%  { width: 0; }
                73%, 100% { width: 2ch; }
            }

            @keyframes sp3 {
                0%, 53%   { width: 1ch; }
                57%, 68%  { width: 0; }
                73%, 100% { width: 1ch; }
            }

            @keyframes xyz-char {
                0%, 10%   { opacity: 0; }
                15%       { opacity: 1; }
                68%       { opacity: 1; }
                73%, 100% { opacity: 0; }
            }

            /* ---- DIVIDERS ---- */
            .divider {
                border: none;
                border-top: 2px dashed #e0e0e0;
                margin: 0;
            }

            /* ---- HEADER ---- */
            header {
                padding: 1lh 0;
            }

            .site-name {
                margin-bottom: 1lh;
            }

            /* ---- HERO ---- */
            .hero {
                padding: 2lh 0;
            }

            .hero-welcome {
                margin-bottom: 1lh;
            }

            /* ---- POSTS ---- */
            .posts {
                padding: 2lh 0;
            }

            .posts-heading {
                margin-bottom: 1lh;
            }

            .post {
                border: 2px dashed #e0e0e0;
                padding: 1lh 2ch;
                margin-bottom: 1lh;
            }

            .post:last-child {
                margin-bottom: 0;
            }

            /* ---- POST CONTENT ---- */
            .post-content h2 {
                margin-bottom: 1lh;
            }

            .post-content h3 {
                margin-top: 1lh;
                margin-bottom: 1lh;
            }

            .post-content p {
                margin-bottom: 1lh;
            }

            .post-content ul, .post-content ol {
                margin-bottom: 1lh;
                padding-left: 4ch;
            }

            .post-title {
                margin-bottom: 1lh;
                display: flex;
                flex-wrap: wrap;
                gap: 0 2ch;
            }

            .post-title-word {
                border: none;
                padding: 0;
                margin: 0;
                line-height: 1.2;
                display: inline-block;
                color: #e0e0e0;
            }

            .post-content pre:not(.post-title-word) {
                border: 2px dashed #e0e0e0;
                padding: 1lh 2ch;
                margin-bottom: 1lh;
                overflow-x: auto;
            }

            .post-content code {
                background: #1a1a1a;
            }

            .post-content pre code {
                background: none;
            }

            .post-content img {
                max-width: 100%;
                margin-bottom: 1lh;
            }

            .post-content a {
                text-decoration: underline;
                text-decoration-style: dashed;
            }

            /* ---- PAGE CONTENT ---- */
            .page-content {
                padding: 2lh 0;
            }

            .page-content h2 {
                margin-bottom: 1lh;
            }

            .page-content p {
                margin-bottom: 1lh;
            }

            .page-content ul, .page-content ol {
                margin-bottom: 1lh;
                padding-left: 4ch;
            }

            .page-content a {
                text-decoration: underline;
                text-decoration-style: dashed;
            }

            /* ---- PAGINATION ---- */
            .pagination {
                margin-top: 2lh;
            }

            /* ---- COLORS ---- */
            .c-red { color: #ef4444; }
            .c-yellow { color: #facc15; }
            .c-dim { color: #666; }

            /* ---- FOOTER ---- */
            footer {
                padding: 1lh 0;
            }

            /* ---- RESPONSIVE ---- */
            @media (max-width: 480px) {
                :root {
                    font-size: 14px;
                }
                body {
                    padding: 0 2ch;
                }
            }
        </style>`;

const HEADER = `
            <header>
                <div class="site-name">Daniel <span class="name-anim"><span class="name-base"><span style="--d:0">G</span><span style="--d:1">h</span><span style="--d:2">e</span><span style="--d:3">r</span><span style="--d:4">g</span><span style="--d:5">h</span><span style="--d:6">e</span><span style="--d:7">t</span><span style="--d:8">t</span><span style="--d:9">a</span></span><span class="name-red"><span class="rl rl-g1">g</span><span class="sp sp1"></span><span class="rl rl-r">r</span><span class="rl rl-g2">g</span><span class="sp sp2"></span><span class="rl rl-t">t</span><span class="sp sp3"></span><span class="rl rl-a">a</span></span></span><span class="name-xyz"><span style="--d:10">.</span><span style="--d:11">x</span><span style="--d:12">y</span><span style="--d:13">z</span></span></div>
                <div class="nav-links">
                    <a href="/blogg/" class="c-yellow">[blogg]</a>
                    <a href="/kontakt/" class="c-yellow">[kontakt]</a>
                    <span>|</span>
                    <a href="https://github.com/dgherghetta">[github]</a>
                    <a href="https://linkedin.com/in/danielgherghetta">[linkedin]</a>
                </div>
            </header>`;

const FOOTER = `
            <footer>
                <span>&copy; 2026 daniel </span><span class="c-red">grgta</span><span>.xyz</span>
                <span style="float: right">~~~ tack för besöket ~~~</span>
            </footer>`;

function layout(title, bodyHTML) {
    return `<!doctype html>
<html lang="sv">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} — grgta.xyz</title>
${STYLE}
    </head>
    <body>
        <div class="page">
${HEADER}

            <hr class="divider" />

${bodyHTML}

            <hr class="divider" />

${FOOTER}
        </div>
    </body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function cleanDist() {
    if (fs.existsSync(DIST)) {
        fs.rmSync(DIST, { recursive: true });
    }
    ensureDir(DIST);
}

function readPosts() {
    const dirs = fs.readdirSync(POSTS_DIR).filter(d =>
        fs.statSync(path.join(POSTS_DIR, d)).isDirectory()
    );

    const posts = [];
    for (const dir of dirs) {
        const mdPath = path.join(POSTS_DIR, dir, 'index.md');
        if (!fs.existsSync(mdPath)) continue;

        const raw = fs.readFileSync(mdPath, 'utf-8');
        const { data, content } = matter(raw);
        const html = marked(content);

        posts.push({
            title: data.title,
            date: new Date(data.date),
            slug: data.slug,
            excerpt: data.excerpt || '',
            html,
            sourceDir: path.join(POSTS_DIR, dir),
        });
    }

    // Sort descending by date
    posts.sort((a, b) => b.date - a.date);
    return posts;
}

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function figletTitle(text) {
    const words = text.split(/\s+/);
    const spans = words.map(word => {
        const art = figlet.textSync(word, { font: 'Calvin S' });
        return `<pre class="post-title-word">${art}</pre>`;
    });
    return `<div class="post-title">${spans.join('\n')}</div>`;
}

function stripFirstHeading(html) {
    return html.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/, '');
}

function generatePostPages(posts) {
    for (const post of posts) {
        const outDir = path.join(DIST, 'blogg', post.slug);
        ensureDir(outDir);

        const body = `
            <article class="post-content" style="padding: 2lh 0;">
                ${figletTitle(post.title)}
                <div class="c-dim" style="margin-bottom: 1lh;">${formatDate(post.date)}</div>
${stripFirstHeading(post.html)}
            </article>`;

        fs.writeFileSync(
            path.join(outDir, 'index.html'),
            layout(post.title, body)
        );

        // Copy non-md assets from source dir
        const files = fs.readdirSync(post.sourceDir);
        for (const file of files) {
            if (file.endsWith('.md')) continue;
            fs.copyFileSync(
                path.join(post.sourceDir, file),
                path.join(outDir, file)
            );
        }
    }
}

function generateBlogListing(posts) {
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

    for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * POSTS_PER_PAGE;
        const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

        let postsHTML = '';
        for (const post of pagePosts) {
            postsHTML += `
                <article class="post">
                    <a href="/blogg/${post.slug}/">[* ${post.title}]</a>
                    <span> -- ${formatDate(post.date)}</span>
                    <div>${post.excerpt}</div>
                </article>\n`;
        }

        // Pagination
        let paginationHTML = '';
        if (totalPages > 1) {
            const links = [];
            if (page > 1) {
                const prevURL = page === 2 ? '/blogg/' : `/blogg/sida/${page - 1}/`;
                links.push(`<a href="${prevURL}">[&lt;-- föregående]</a>`);
            }
            links.push(`<span>sida ${page} av ${totalPages}</span>`);
            if (page < totalPages) {
                links.push(`<a href="/blogg/sida/${page + 1}/">[nästa --&gt;]</a>`);
            }
            paginationHTML = `
                <div class="pagination">
                    ${links.join(' ')}
                </div>`;
        }

        const body = `
            <section class="posts">
                <div class="posts-heading">
                    <span>&gt;&gt;&gt;</span>
                    <span>alla inlägg</span>
                </div>
${postsHTML}
${paginationHTML}
            </section>`;

        let outDir;
        if (page === 1) {
            outDir = path.join(DIST, 'blogg');
        } else {
            outDir = path.join(DIST, 'blogg', 'sida', String(page));
        }
        ensureDir(outDir);
        fs.writeFileSync(path.join(outDir, 'index.html'), layout('Blogg', body));
    }
}

function generateHomePage(posts) {
    // Read intro
    const introPath = path.join(CONTENT_DIR, 'intro.md');
    const introHTML = fs.existsSync(introPath)
        ? marked(fs.readFileSync(introPath, 'utf-8'))
        : '';

    const latestPosts = posts.slice(0, HOME_POST_COUNT);
    let postsHTML = '';
    for (const post of latestPosts) {
        postsHTML += `
                <article class="post">
                    <a href="/blogg/${post.slug}/">[* ${post.title}]</a>
                    <span> -- ${formatDate(post.date)}</span>
                    <div>${post.excerpt}</div>
                </article>\n`;
    }

    const body = `
            <section class="hero">
                <div class="hero-welcome">
                    <span>Wälkommen</span> till Daniels
                    personliga hemsida<span class="c-red">! :D</span>
                </div>
                <div class="hero-links">
                    <span>&gt;</span> kolla
                    <a href="/blogg/" class="c-yellow">[min blogg]</a> eller
                    <a href="https://github.com/dgherghetta">[min github]</a>
                    eller
                    <a href="https://kart.grgta.xyz">[spela kart racern]</a>
                </div>
            </section>

            <hr class="divider" />

            <section class="posts">
                <div class="posts-heading">
                    <span>&gt;&gt;&gt;</span>
                    <span>senaste inlägg</span>
                </div>
${postsHTML}
                <div class="posts-more c-dim">
                    <a href="/blogg/">[alla inlägg --&gt;]</a>
                </div>
            </section>`;

    fs.writeFileSync(path.join(DIST, 'index.html'), layout('daniel gherghetta.xyz', body));
}

function generateStaticPages() {
    if (!fs.existsSync(PAGES_DIR)) return;

    const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
        const slug = path.basename(file, '.md');
        const raw = fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8');
        const html = marked(raw);

        const body = `
            <section class="page-content">
${html}
            </section>`;

        const outDir = path.join(DIST, slug);
        ensureDir(outDir);
        fs.writeFileSync(path.join(outDir, 'index.html'), layout(slug, body));
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Building site...');

cleanDist();

const posts = readPosts();
console.log(`Found ${posts.length} posts`);

generatePostPages(posts);
console.log('Generated post pages');

generateBlogListing(posts);
console.log('Generated blog listing');

generateHomePage(posts);
console.log('Generated home page');

generateStaticPages();
console.log('Generated static pages');

console.log(`Done! Output in ${DIST}`);
