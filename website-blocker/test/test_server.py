from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl
import os

class TestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Page - {self.headers.get('Host', 'unknown')}</title>
        </head>
        <body>
            <h1>Test Page for {self.headers.get('Host', 'unknown')}</h1>
            <p>This page should be blocked if the extension is working correctly.</p>
            <script>
                console.log('Page loaded:', window.location.href);
            </script>
        </body>
        </html>
        '''
        
        self.wfile.write(html.encode())

def run(port=8000):
    server = HTTPServer(('localhost', port), TestHandler)
    print(f'Starting test server on port {port}...')
    server.serve_forever()

if __name__ == '__main__':
    run()
