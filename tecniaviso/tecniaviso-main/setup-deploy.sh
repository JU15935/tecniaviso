#!/bin/bash
# TecniAviso - Setup automático de deploy con Vercel CLI
# Ejecutar una sola vez: bash setup-deploy.sh

set -e

echo ""
echo "🚀 TecniAviso - Setup de Deploy Automático"
echo "==========================================="
echo ""

# 1. Install Vercel CLI globally
echo "📦 Instalando Vercel CLI..."
npm install -g vercel
echo "✓ Vercel CLI instalado"
echo ""

# 2. Login to Vercel
echo "🔑 Iniciando sesión en Vercel..."
echo "   Se abrirá el navegador para autenticarte."
vercel login
echo ""

# 3. Link project to Vercel (creates .vercel/project.json)
echo "🔗 Vinculando proyecto con Vercel..."
vercel link --yes
echo ""

# 4. Get the IDs needed for GitHub Actions
echo "📋 Obteniendo credenciales para GitHub Actions..."
echo ""
VERCEL_ORG_ID=$(cat .vercel/project.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(JSON.parse(d).orgId)")
VERCEL_PROJECT_ID=$(cat .vercel/project.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(JSON.parse(d).projectId)")

echo "================================================"
echo "✅ COPIA ESTOS VALORES EN GITHUB SECRETS:"
echo "================================================"
echo ""
echo "VERCEL_ORG_ID     = $VERCEL_ORG_ID"
echo "VERCEL_PROJECT_ID = $VERCEL_PROJECT_ID"
echo ""
echo "VERCEL_TOKEN      = (genera uno en https://vercel.com/account/tokens)"
echo ""
echo "================================================"
echo "También necesitas estos secrets de Supabase"
echo "(los encuentras en tu archivo .env):"
echo ""
echo "VITE_SUPABASE_URL"
echo "VITE_SUPABASE_PUBLISHABLE_KEY"
echo "VITE_SUPABASE_PROJECT_ID"
echo "================================================"
echo ""
echo "📌 Dónde agregarlos:"
echo "   GitHub → tu repo → Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "✅ Setup completado. Cuando hagas 'git push origin main' se desplegará automáticamente."
