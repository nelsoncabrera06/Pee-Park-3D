#!/usr/bin/env python3
# para correr el servidor local
# python3 server.py

# ❌ Error: El puerto 8000 ya está en uso.
# Para matar el proceso que usa el puerto 8000 en macOS/Linux:
# lsof -ti:8000 | xargs kill -9

"""
Servidor HTTP simple para el juego Pee Park 3D
Ejecutar: python3 server.py
Luego abrir: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers CORS para evitar problemas
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    Handler = MyHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 50)
        print(f"🐕 Servidor iniciado en puerto {PORT}")
        print(f"🌐 Abre tu navegador en: http://localhost:{PORT}")
        print(f"📁 Sirviendo archivos desde: {Path.cwd()}")
        print("=" * 50)
        print("Presiona Ctrl+C para detener el servidor")
        print()

        # Intentar abrir el navegador automáticamente
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("✅ Navegador abierto automáticamente")
        except:
            print("⚠️  Por favor abre manualmente: http://localhost:{PORT}")

        print()
        httpd.serve_forever()

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido. ¡Hasta luego!")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n❌ Error: El puerto {PORT} ya está en uso.")
            print(f"   Prueba con otro puerto o cierra el proceso que lo está usando.")
        else:
            print(f"\n❌ Error: {e}")
