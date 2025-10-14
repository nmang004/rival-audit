# Sales-SEO Audit & Analysis Tool

AI-powered website audit and analysis tool built with Next.js 14, Anthropic Claude Sonnet 4.5, and modern web technologies.

## 🎯 Project Status

### ✅ Phase 1 Complete: Foundation & Core Infrastructure
- Next.js 14 with App Router, TypeScript, Tailwind CSS
- Prisma ORM with complete database schema
- Clerk authentication with user sync webhooks
- shadcn/ui component library
- Claude Sonnet 4.5 vision API integration
- Puppeteer web scraping with axe-core accessibility testing
- Complete audit workflow engine
- API routes for audit CRUD operations

### 🚧 In Progress: UI Development
- Dashboard page with audit creation form
- Audit detail view
- Status management

### 📋 Next Phase: Advanced Features
- SEMRush integration
- Email/Slack notifications
- Report generation
- Production deployment

## 🚀 Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment variables in \`.env.local\`

3. Set up database:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

## 📚 Documentation

See the Development Checklist and SRS document for complete requirements and implementation details.

## 🏗️ Architecture

- **Frontend**: Next.js 14 App Router, React, shadcn/ui
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL
- **AI**: Claude Sonnet 4.5
- **Auth**: Clerk
- **Testing**: Puppeteer, axe-core
