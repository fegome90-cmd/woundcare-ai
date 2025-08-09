from http.server import HTTPServer, SimpleHTTPRequestHandler
from functools import partial
import os
import socket

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Basic CORS + caching disabled for dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        # Ensure correct MIME for JS (helps some browsers with modules)
        if self.path.endswith(".js"):
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
        super().end_headers()

    def do_OPTIONS(self):
        # Handle CORS preflight for /api/*
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        # Simple stub endpoint for demo: accept /api/submit
        if self.path == "/api/submit":
            length = int(self.headers.get('Content-Length', '0') or 0)
            _ = self.rfile.read(length) if length > 0 else b''
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(b'{"status":"ok","message":"Saved (demo)"}')
        else:
            self.send_error(404, "Not Found")

def find_free_port(start=9000, span=100):
    for port in range(start, start + span):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("", port))
                return port
            except OSError:
                continue
    return start

def main():
    # Serve the public directory as web root
    repo_root = os.path.dirname(__file__)
    web_root = os.path.join(repo_root, "public")
    if not os.path.isdir(web_root):
        raise SystemExit(f"Web root not found: {web_root}")

    # Use a stable/dev-friendly port if available, otherwise pick the next
    port = int(os.environ.get("PORT", find_free_port(9000)))

    # Handler serving from public/ (Python 3.7+ supports 'directory' param)
    Handler = partial(CORSRequestHandler, directory=web_root)
    httpd = HTTPServer(("", port), Handler)
    print(f"Serving public at http://localhost:{port}")
    print(f"Web root: {web_root}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down server...")
    finally:
        httpd.server_close()

if __name__ == "__main__":
    main()
