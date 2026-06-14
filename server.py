import os
import time
import json
import glob
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
LOGS_DIR = os.path.join(os.getcwd(), 'logs')

if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def cleanup_old_logs():
    """Delete log files older than 3 days (259200 seconds)."""
    now = time.time()
    three_days_ago = now - (3 * 24 * 60 * 60)
    log_files = glob.glob(os.path.join(LOGS_DIR, '*.log'))
    for file_path in log_files:
        try:
            file_time = os.path.getmtime(file_path)
            if file_time < three_days_ago:
                os.remove(file_path)
                print(f"[Cleanup] Removed old log file: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"[Cleanup] Error removing {file_path}: {e}")

class GameRequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                session_id = data.get('sessionId', 'default')
                logs = data.get('logs', [])
                state = data.get('state', {})
                
                # Sanitize filename
                safe_session_id = "".join([c for c in session_id if c.isalpha() or c.isdigit() or c in ('-', '_')]).rstrip()
                log_filename = f"session_{safe_session_id}.log"
                log_path = os.path.join(LOGS_DIR, log_filename)
                
                with open(log_path, 'w', encoding='utf-8') as f:
                    f.write(f"=== GAME LOG SESSION: {session_id} ===\n")
                    f.write(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    f.write("--- ADVENTURE LOGS ---\n")
                    for log in logs:
                        f.write(f"{log}\n")
                    f.write("\n--- LAST GAME STATE ---\n")
                    f.write(json.dumps(state, indent=2))
                    f.write("\n")
                
                # Perform cleanup of old logs
                cleanup_old_logs()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"success"}')
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(f'{{"error":"{str(e)}"}}'.encode('utf-8'))
                return
        
        self.send_error(404, "File not found")

if __name__ == '__main__':
    # Initial cleanup on startup
    cleanup_old_logs()
    HTTPServer.allow_reuse_address = True
    server = HTTPServer(('0.0.0.0', PORT), GameRequestHandler)
    print(f"Server running at http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()
