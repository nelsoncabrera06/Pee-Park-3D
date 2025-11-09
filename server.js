#!/usr/bin/env node
// Servidor HTTP simple para el juego Pee Park 3D
// Para correr: node server.js
// Luego abrir: http://localhost:8000

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

// Tipos MIME para diferentes archivos
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.gltf': 'model/gltf+json',
    '.glb': 'model/gltf-binary',
    '.bin': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);

    // Ruta del archivo solicitado
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Extensión del archivo
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Leer y servir el archivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🐕 Servidor Node.js iniciado`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📁 Carpeta: ${__dirname}`);
    console.log('='.repeat(50));
    console.log('Presiona Ctrl+C para detener el servidor\n');

    // Intentar abrir el navegador automáticamente
    const open = require('child_process').exec;
    open(`open http://localhost:${PORT}`);
});

// Manejo de cierre gracioso
process.on('SIGINT', () => {
    console.log('\n\n👋 Servidor detenido. ¡Hasta luego!');
    process.exit(0);
});
