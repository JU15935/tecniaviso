# TecniAviso

**Gestión de reparaciones con notificación automática por WhatsApp**

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Edge Functions)
- Stripe (pagos)
- PWA (instalable en Android, iOS, Windows y Mac)
- GitHub Actions + Vercel (deploy automático)

---

## 🚀 Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:8080

---

## 📦 Deploy automático (una sola vez)

### 1. Sube el código a GitHub

```bash
git init
git add .
git commit -m "TecniAviso - versión inicial"
git remote add origin https://github.com/TU_USUARIO/tecniaviso.git
git push -u origin main
```

### 2. Configura Vercel desde la terminal

```bash
bash setup-deploy.sh
```

Este script instala Vercel CLI, te autentica y te da los IDs que necesitas.

### 3. Agrega los Secrets en GitHub

Ve a: **GitHub → tu repo → Settings → Secrets and variables → Actions**

| Secret | Dónde encontrarlo |
|--------|-------------------|
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create |
| `VERCEL_ORG_ID` | Lo imprime el setup-deploy.sh |
| `VERCEL_PROJECT_ID` | Lo imprime el setup-deploy.sh |
| `VITE_SUPABASE_URL` | Tu archivo .env |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Tu archivo .env |
| `VITE_SUPABASE_PROJECT_ID` | Tu archivo .env |

### 4. ¡Listo! Deploy automático

Cada vez que hagas:
```bash
git add .
git commit -m "descripción del cambio"
git push
```

GitHub Actions construye y despliega automáticamente en Vercel. ✅

---

## 📲 Instalar como app

| Plataforma | Cómo |
|---|---|
| Android | Chrome → menú → "Instalar app" |
| Windows/Mac | Chrome/Edge → ícono instalar en barra |
| iPhone/iPad | Safari → Compartir → "Agregar al inicio" |

---

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```
