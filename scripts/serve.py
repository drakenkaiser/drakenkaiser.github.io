#!/usr/bin/env python3
"""Local preview server that disables caching, so edited files (portrait,
data.js, styles) always show up on plain reload. Production caching is
handled by GitHub Pages and the ?v= cache-buster in app.js."""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
print(f"Serving on http://localhost:{port} (caching disabled)")
HTTPServer(("", port), NoCacheHandler).serve_forever()
