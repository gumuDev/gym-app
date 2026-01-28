#!/bin/bash

echo "🔧 Arreglando dependencias del frontend..."

# 1. Limpiar cache de npm
echo "📦 Limpiando cache de npm..."
rm -rf node_modules
rm -f package-lock.json

# 2. Limpiar cache de Vite
echo "🗑️  Limpiando cache de Vite..."
rm -rf node_modules/.vite
rm -rf dist

# 3. Reinstalar dependencias
echo "⬇️  Instalando dependencias compatibles..."
npm install

# 4. Verificar instalación
echo "✅ Verificando instalación..."
npm list react react-dom react-router-dom @refinedev/core @refinedev/react-router-v6

echo ""
echo "✨ ¡Listo! Ahora ejecuta: npm run dev"
