const fs = require("fs");
const http = require("http");
const path = require("path");

const MarkdownIt = require("markdown-it");
const chokidar = require("chokidar");

const PORT = Number(process.env.PREVIEW_PORT || 3000);
const README_PATH = path.join(__dirname, "..", "README.md");
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

function renderPage() {
  const source = fs.readFileSync(README_PATH, "utf8");
  const body = md.render(source);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>README Preview</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        line-height: 1.6;
      }
      body {
        margin: 0;
        background: #0d1117;
        color: #c9d1d9;
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 24px 64px;
      }
      .banner {
        margin-bottom: 24px;
        padding: 12px 16px;
        border: 1px solid #30363d;
        border-radius: 8px;
        background: #161b22;
        color: #8b949e;
        font-size: 14px;
      }
      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3 {
        border-bottom: 1px solid #21262d;
        padding-bottom: 0.3em;
      }
      .markdown-body a {
        color: #58a6ff;
      }
      .markdown-body code {
        background: #161b22;
        padding: 0.2em 0.4em;
        border-radius: 6px;
      }
      .markdown-body pre {
        background: #161b22;
        padding: 16px;
        border-radius: 8px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="banner">Live preview of <code>README.md</code>. Edits reload automatically.</div>
      <article class="markdown-body">${body}</article>
    </main>
    <script>
      const source = new EventSource("/events");
      source.onmessage = () => location.reload();
    </script>
  </body>
</html>`;
}

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("data: connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage());
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

function broadcastReload() {
  for (const client of clients) {
    client.write("data: reload\n\n");
  }
}

chokidar.watch(README_PATH, { ignoreInitial: true }).on("all", broadcastReload);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`README preview available at http://localhost:${PORT}`);
});
