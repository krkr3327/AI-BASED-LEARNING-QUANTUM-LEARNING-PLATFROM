"""
Unified Quantum Learning Platform Launcher
Runs Backend (FastAPI :8000) & Frontend (Vite :5173) simultaneously and automatically opens your browser.

Usage:
    python run.py
"""

import os
import sys
import subprocess
import time
import webbrowser
import signal
import urllib.request

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
PHP_BACKEND_DIR = os.path.join(ROOT_DIR, "php_backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

processes = []

def find_php_executable():
    """Find PHP executable in PATH or standard Windows installation locations."""
    # 1. Check standard PATH
    try:
        res = subprocess.run(["where.exe", "php"] if sys.platform == "win32" else ["which", "php"],
                             capture_output=True, text=True)
        if res.returncode == 0:
            lines = [l.strip() for l in res.stdout.strip().split("\n") if l.strip()]
            if lines and os.path.exists(lines[0]):
                return lines[0]
    except Exception:
        pass

    # 2. Check common Windows paths
    if sys.platform == "win32":
        candidates = [
            r"C:\xampp\php\php.exe",
            r"C:\php\php.exe",
            r"C:\Program Files\PHP\php.exe",
            r"C:\tools\php\php.exe",
            r"C:\laragon\bin\php\php-8.2\php.exe",
            r"C:\laragon\bin\php\php-8.1\php.exe",
            r"C:\laragon\bin\php\php-8.0\php.exe"
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
    return None

def cleanup(signum=None, frame=None):
    print("\n[Shutting down Quantum Platform services...]")
    for p in processes:
        try:
            if sys.platform == "win32":
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                p.terminate()
        except Exception:
            pass
    print("[Shutdown complete]")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
if hasattr(signal, 'SIGTERM'):
    signal.signal(signal.SIGTERM, cleanup)

def wait_for_service(url, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status in (200, 404):
                    return True
        except Exception:
            time.sleep(0.3)
    return False

def main():
    print("=" * 70)
    print("      >> QUANTUM ALGORITHM & SIMULATOR LEARNING PLATFORM <<")
    print("=" * 70)
    print(f"[*] Root Directory: {ROOT_DIR}")

    # 1. Start PHP Backend if PHP is installed
    php_exe = find_php_executable()
    php_active = False
    if php_exe:
        print(f"[*] Found PHP at: {php_exe}")
        print("[*] Starting PHP Backend on http://localhost:8080 ...")
        php_cmd = [php_exe, "-S", "localhost:8080", "-t", PHP_BACKEND_DIR]
        php_proc = subprocess.Popen(
            php_cmd,
            cwd=PHP_BACKEND_DIR,
            shell=(sys.platform == "win32")
        )
        processes.append(php_proc)
        if wait_for_service("http://localhost:8080/api/health", timeout=5):
            print("[+] PHP Backend initialized successfully on port 8080!")
            php_active = True
        else:
            print("[*] PHP Backend process started on port 8080.")
            php_active = True
    else:
        print("[!] PHP executable was not found in PATH or standard folders.")
        print("[i] To enable the PHP backend: install PHP / XAMPP or run 'php -S localhost:8080 -t php_backend'")

    # 2. Start Python FastAPI Backend
    print("[*] Starting FastAPI Simulation Backend on http://localhost:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        shell=(sys.platform == "win32")
    )
    processes.append(backend_proc)

    # Health check wait for Python backend
    if wait_for_service("http://127.0.0.1:8000/api/health", timeout=10):
        print("[+] FastAPI Simulation Backend initialized successfully!")

    # 3. Start Frontend
    print("[*] Starting Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=(sys.platform == "win32")
    )
    processes.append(frontend_proc)

    time.sleep(1.5)
    app_url = "http://localhost:5173"
    print(f"\n[+] All services active!")
    print(f"[+] Platform Frontend : {app_url}")
    if php_active:
        print(f"[+] PHP Backend (DB)  : http://localhost:8080")
        print(f"[+] SQLite Database   : {os.path.join(PHP_BACKEND_DIR, 'data', 'database.sqlite')}")
    print(f"[+] FastAPI Backend   : http://localhost:8000")
    print(f"[+] API Docs          : http://localhost:8000/docs")
    print(f"[*] Launching browser at {app_url}...\n")
    print("-" * 70)
    print("Press CTRL + C at any time in this terminal to stop both servers.")
    print("-" * 70)

    try:
        webbrowser.open(app_url)
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            for p in processes:
                if p.poll() is not None:
                    print(f"\n[!] A service terminated with code {p.returncode}")
                    cleanup()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
