# Deployment Guide

## TypingPath Deployment Options

This guide covers various deployment strategies for TypingPath.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. **Connect your repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables:**
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Netlify

1. **Build Settings:**
   ```toml
   [build]
   command = "npm run build"
   publish = "dist"
   
   [build.environment]
   NODE_VERSION = "18"
   ```

2. **Deploy:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

### GitHub Pages

1. **Create deploy workflow:**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### Docker Commands

```bash
# Build image
docker build -t typingpath .

# Run container
docker run -p 8080:80 typingpath

# With environment variables
docker run -p 8080:80 -e VITE_GEMINI_API_KEY=your_key typingpath
```

## ☁️ Cloud Platform Deployment

### AWS S3 + CloudFront

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **CloudFront Configuration:**
   ```json
   {
     "DefaultRootObject": "index.html",
     "ErrorPages": [
       {
         "ErrorCode": 404,
         "ResponseCode": 200,
         "ResponsePagePath": "/index.html"
       }
     ]
   }
   ```

### Google Cloud Platform

```yaml
# app.yaml for App Engine
runtime: nodejs18

env_variables:
  VITE_GEMINI_API_KEY: "your_api_key_here"

handlers:
- url: /static
  static_dir: dist/static
  secure: always

- url: /.*
  static_files: dist/index.html
  upload: dist/index.html
  secure: always
```

### Azure Static Web Apps

```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional - Firebase (for cloud features)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_ANALYTICS_ENABLED=true

# Performance
VITE_ENABLE_PWA=true
VITE_CACHE_STRATEGY=stale-while-revalidate
```

### Build Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@google/generative-ai'],
          firebase: ['firebase/app', 'firebase/auth']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
```

## 📊 Performance Monitoring

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli@0.11.x
      - run: lhci autorun
```

### Web Vitals Monitoring

```typescript
// src/utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log('Web Vital:', metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🔒 Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://generativelanguage.googleapis.com;
               img-src 'self' data: https:;">
```

### Environment Security

```bash
# Never commit these files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use secure methods to inject environment variables
# - Vercel: Dashboard settings
# - Netlify: Build environment variables
# - Docker: Build args or runtime environment
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading:**
   ```bash
   # Check variable names start with VITE_
   # Verify .env file is in project root
   # Restart dev server after changes
   ```

3. **Large Bundle Size:**
   ```bash
   # Analyze bundle
   npm install -g webpack-bundle-analyzer
   npx vite-bundle-analyzer
   ```

4. **Routing Issues (404s):**
   - Configure server to serve `index.html` for all routes
   - Check nginx/apache configuration
   - Verify base URL in `vite.config.ts`

### Performance Issues

```bash
# Enable production profiling
npm run build -- --sourcemap

# Check bundle size
npm run preview
# Open browser dev tools > Network tab
```

## 📈 Scaling Considerations

### CDN Setup

- Use CDN for static assets
- Enable compression (gzip/brotli)
- Set appropriate cache headers
- Use HTTP/2

### Database (if adding backend)

```typescript
// Recommended stack for scaling
- Database: PostgreSQL with connection pooling
- API: Node.js with Express/Fastify
- Cache: Redis for session storage
- Queue: Bull/Agenda for background jobs
```

### Monitoring

```typescript
// Recommended monitoring tools
- Sentry for error tracking
- LogRocket for user session replay
- Datadog/New Relic for performance
- Uptime monitoring services
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] API keys secured and rotated
- [ ] HTTPS enabled
- [ ] Compression enabled
- [ ] Caching configured
- [ ] Error monitoring setup
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] Analytics tracking working
- [ ] SEO meta tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Favicon and app icons set
- [ ] PWA manifest configured
- [ ] Lighthouse score > 90
