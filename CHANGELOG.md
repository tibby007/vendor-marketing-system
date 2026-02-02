# Changelog

## [0.1.0] - 2026-02-02

### Added

#### Core Platform
- Next.js 14 App Router with TypeScript
- Tailwind CSS with shadcn/ui components
- Supabase authentication (login, signup, password reset)
- Row Level Security policies for data protection
- Admin client for bypassing RLS in server components

#### Dashboard
- Welcome dashboard with stats (leads, conversions, follow-ups, search quota)
- Quick action cards for AI Finder and My Leads
- Subscription upgrade banner for free users

#### AI Lead Finder
- Search by state and equipment type
- Mock vendor data generation
- Blurred contact info (phone, email, website) for free tier users
- "Upgrade" badges with lock icons on blurred fields
- Add to Leads functionality for paid users
- Direct email action for paid users

#### My Leads
- Full CRUD operations (create, read, update, delete)
- Lead status workflow (new → contacted → follow-up → converted)
- Lead table with sorting and filtering
- Add Lead dialog with form validation
- Edit Lead dialog
- Email action with template modal

#### Email Templates
- Template library page with category tabs
- EmailModal component with template selector
- Merge field replacement: `{{company_name}}`, `{{contact_name}}`, `{{equipment_type}}`
- Editable subject and body fields
- Opens native email client with mailto: link

#### Admin Dashboard
- Protected admin routes (requires `is_admin = true`)
- Platform overview with MRR, user counts, subscription breakdown
- Recent signups list
- User management table with lead counts and subscription info
- Admin link in sidebar (red, with Shield icon)

#### Landing Page
- Hero section with CTAs
- Features grid (6 features with icons)
- How it works (3-step process)
- Pricing section (Starter $29, Pro $69, Enterprise custom)
- CTA section and footer

#### Subscription Tiers
- Free: 3 searches/month, 10 leads
- Starter: 10 searches/month, 50 leads ($29/mo)
- Pro: Unlimited searches and leads ($69/mo)
- Enterprise: Custom pricing

### Database Schema
- `profiles` - User profiles with subscription info
- `leads` - Vendor lead tracking
- `search_history` - AI search records
- `email_templates` - Outreach templates
- `platform_stats` - Admin analytics

### Deployment
- Deployed to Vercel
- Supabase backend configured
- Environment variables set up

---

## Upcoming

### Stripe Integration
- Checkout sessions for subscription purchases
- Webhook handling for subscription events
- Customer portal for subscription management
- Billing page integration
