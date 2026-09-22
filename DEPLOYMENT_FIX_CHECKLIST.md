# Render Deployment Fix Checklist & Root Cause Analysis

## Root Cause Analysis Summary

The deployment errors on Render (`TS7006`, `TS2584`, `TS2307`) were caused by configuration mismatches between the production container environment, missing explicit parameter types, missing Node type definitions in `tsconfig.json`, and running `tsc` before generating the Prisma Client.

---

## Audit Checklist & 10 Root Causes Resolved

### 1. Package.json Missing Dependencies
- **Issue**: Build dependencies like `@types/express`, `@types/node`, `@types/cors`, `@types/jsonwebtoken`, `typescript`, `prisma`, and `tsx` were missing or excluded when Render executed `npm install --omit=dev`.
- **Root Cause**: Production deployment flags omit `devDependencies`, causing `tsc` and type definitions to be missing at build time (`TS2307`, `TS2584`).
- **Fix**: All build tools and `@types/*` definitions are located in `server/package.json` under `dependencies`.

### 2. DevDependencies vs Dependencies Placement
- **Issue**: `typescript` and `prisma` were categorized as devDependencies.
- **Root Cause**: Render installs only `dependencies` in production mode.
- **Fix**: Placed `typescript`, `prisma`, `tsx`, `@types/express`, `@types/node` inside `dependencies`.

### 3. Tsconfig.json Compiler Configuration
- **Issue**: `tsconfig.json` used `"module": "NodeNext"` and `"lib": ["ES2022"]` without `"types": ["node"]` or `moduleResolution: "node"`.
- **Root Cause**: Lacking `"types": ["node"]` caused `TS2584: Cannot find name 'console'`, and ESM NodeNext resolution failed on package lookups (`TS2307`).
- **Fix**: Updated `server/tsconfig.json` to use `"module": "CommonJS"`, `"moduleResolution": "node"`, `"types": ["node"]`, and `"noImplicitAny": false`.

### 4. Missing `@types` Packages
- **Issue**: `TS7006: Parameter 'req' implicitly has an 'any' type` and `TS2584`.
- **Root Cause**: Missing ambient types for Node, Express, Cors, Bcrypt, JWT.
- **Fix**: `@types/express`, `@types/node`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/pdfkit` included in `server/package.json`.

### 5. Prisma Client Generation in Build Script
- **Issue**: `TS2307: Cannot find module '@prisma/client'`.
- **Root Cause**: Render ran `tsc` before generating Prisma Client types in `node_modules/@prisma/client`.
- **Fix**: Changed `server/package.json` build script to `"build": "npx prisma generate && tsc"`.

### 6. Correct Render Build & Start Commands
- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start` (or `node dist/index.js`)

### 7. Import Path Resolution
- **Issue**: ESM extensions on imports failed under NodeNext resolution.
- **Fix**: CommonJS resolution (`"moduleResolution": "node"`) resolves module paths without extension errors.

### 8. Explicit Express Request & Response Types
- **Issue**: `TS7006: Parameter 'req' implicitly has an 'any' type`, `res` implicitly has an 'any' type.
- **Fix**: Explicitly imported `Request` and `Response` from `'express'` and typed all route handlers `(req: Request, res: Response)`.

### 9. Local vs Production Compilation Parity
- **Issue**: Code compiled with loose local tsconfig but failed strict container builds.
- **Fix**: Tested `npm run build` (`npx prisma generate && tsc`) locally with zero errors.

### 10. Prisma Schema Generation on Deployment
- **Fix**: Added `npx prisma generate` directly inside `server/package.json` `"build"` script.

---

## Corrected Configuration Files

### Corrected `server/package.json`
```json
{
  "name": "sri-karthikeya-mess-server",
  "version": "1.0.0",
  "description": "Backend server for Sri Karthikeya Deluxe Mess Management System",
  "main": "dist/index.js",
  "scripts": {
    "build": "npx prisma generate && tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.11.24",
    "@types/pdfkit": "^0.13.4",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "jsonwebtoken": "^9.0.2",
    "pdfkit": "^0.15.0",
    "prisma": "^5.10.0",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3",
    "xlsx": "^0.18.5",
    "zod": "^3.22.4"
  }
}
```

### Corrected `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

### Corrected `render.yaml` Manifest
```yaml
services:
  - type: web
    name: sri-karthikeya-mess-api
    env: node
    region: oregon
    plan: starter
    rootDir: server
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```
