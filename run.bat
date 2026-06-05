@echo off
echo Starting local web server for your portfolio...
echo Access the site at: http://localhost:8001
echo Press Ctrl+C in this terminal window to stop the server.
python -m http.server 8001
pause
