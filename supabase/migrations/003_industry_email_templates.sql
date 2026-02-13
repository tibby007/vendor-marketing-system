-- Industry-specific email templates for different equipment verticals
-- Each vertical has unique pain points that require tailored messaging

-- Commercial Trucks - Introduction
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Commercial Trucks - Introduction',
 'Help Your Truck Buyers Get on the Road Faster',
 'Hi {{contact_name}},

I came across {{company_name}} and saw you deal in {{equipment_type}} — a market where buyers often face sticker shock on new and used inventory.

I work with commercial truck dealers to offer their customers flexible financing options that get them behind the wheel faster. For many of your buyers, the difference between closing and walking is having a payment plan that works with their cash flow.

Here''s what I typically see with truck dealers I partner with:
- Buyers who couldn''t pay cash are now closing deals
- Average deal size goes up because customers finance upgrades they''d otherwise skip
- Your sales team spends less time chasing payment and more time selling

Would you have 10 minutes this week to chat about how this could work for {{company_name}}?

Best regards,
[Your Name]
[Your Company]
[Phone]',
 'intro', false, 'starter');

-- Commercial Trucks - Follow Up
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Commercial Trucks - Follow Up',
 'Quick Follow Up - Truck Financing for Your Customers',
 'Hi {{contact_name}},

I reached out recently about a financing partnership with {{company_name}}. I know truck dealers stay busy, so I wanted to keep this brief.

One thing I hear consistently from dealers: "My customers want the truck but can''t write a check for $80K." That''s exactly the problem I solve.

Same-day approvals, terms up to 72 months, and a process that doesn''t slow down your sales cycle.

Worth a 10-minute call?

Best,
[Your Name]',
 'follow_up', false, 'starter');

-- Specialty Trucks - Introduction
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Specialty Trucks - Introduction',
 'Financing Options for Your {{equipment_type}} Customers',
 'Hi {{contact_name}},

Specialty vehicles like {{equipment_type}} come with specialty price tags — and I know that can slow down your sales at {{company_name}}.

I partner with dealers in the specialty truck space to give their customers financing options that make sense for niche equipment. Whether it''s a concrete mixer, vacuum truck, or tow truck, the buyers need these vehicles to make money — and I help them get started without draining their reserves.

What sets my financing apart:
- We understand specialty equipment valuations (no generic underwriting)
- Fast approvals — most within 24 hours
- Flexible structures: lease, loan, or lease-to-own
- We work with startups and established operators alike

Can we connect for a quick call to discuss how this could help {{company_name}} close more deals?

Thanks,
[Your Name]
[Your Company]
[Phone]',
 'intro', false, 'starter');

-- Service Vehicles - Introduction
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Service Vehicles - Introduction',
 'Help Your Service Vehicle Buyers Grow Their Business',
 'Hi {{contact_name}},

I noticed {{company_name}} sells {{equipment_type}} — the kind of vehicles that small business owners depend on every single day to earn a living.

Here''s what I see with service vehicle buyers: a plumber or electrician needs a new van to take on more jobs, but tying up $40-60K in cash would gut their working capital. That''s where I come in.

I work with dealers like you to offer financing that makes it easy for your customers to say yes:
- Low monthly payments that fit a small business budget
- Quick approval process — no weeks of waiting
- Flexible terms from 24 to 72 months
- We finance new and used vehicles

Your customers get the vehicle they need to grow, and you close the sale. Win-win.

Do you have a few minutes to chat about setting this up for {{company_name}}?

Best regards,
[Your Name]
[Your Company]
[Phone]',
 'intro', false, 'starter');

-- Service Vehicles - Follow Up
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Service Vehicles - Follow Up',
 'Following Up - Service Vehicle Financing Partnership',
 'Hi {{contact_name}},

Just circling back on my note about financing for your service vehicle customers at {{company_name}}.

I recently helped a dealer close 3 sales in one week to HVAC contractors who couldn''t pay cash but were approved for monthly payments within hours.

If you have customers walking because they can''t write a big check, I can help fix that. Happy to walk you through how it works — takes about 10 minutes.

Best,
[Your Name]',
 'follow_up', false, 'starter');

-- Municipal & Emergency - Introduction
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Municipal & Emergency - Introduction',
 'Equipment Financing for Municipal and Emergency Vehicle Buyers',
 'Hi {{contact_name}},

I see that {{company_name}} deals in {{equipment_type}} — equipment that cities, counties, and fire departments depend on to keep communities safe.

Municipal buyers face a unique challenge: they need the equipment now, but budget cycles, capital approval processes, and tight tax revenues can delay purchases for months or even years.

I specialize in financing structures built for government and municipal buyers:
- Municipal lease-purchase agreements that fit budget cycles
- Tax-exempt financing options where applicable
- Flexible payment schedules aligned with fiscal years
- We work with cities, counties, fire districts, and EMS agencies of all sizes

If you have municipal customers stuck in budget limbo, I can help get the deal done.

Would you be open to a brief conversation about how this could benefit your government customers?

Best regards,
[Your Name]
[Your Company]
[Phone]',
 'intro', false, 'starter');

-- Municipal & Emergency - Follow Up
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Municipal & Emergency - Follow Up',
 'Quick Follow Up - Municipal Equipment Financing',
 'Hi {{contact_name}},

I wanted to follow up on my message about financing for your municipal and emergency vehicle customers.

I know government sales can be a long game — budget approvals, committee votes, and procurement rules. But I''ve helped dealers close deals with fire departments and city agencies by offering lease-purchase structures that work within their annual budgets.

If you have a deal that''s stalled because of budget, I may be able to help unstick it. Happy to take a look.

Best,
[Your Name]',
 'follow_up', false, 'starter');

-- Agricultural Equipment - Introduction
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Agricultural - Introduction',
 'Financing Solutions for Your Agricultural Equipment Buyers',
 'Hi {{contact_name}},

I noticed {{company_name}} serves the agricultural market with {{equipment_type}} — equipment that farmers and ranchers can''t run their operations without.

The challenge in ag is clear: your customers need equipment year-round, but their income is seasonal. A rancher can''t write a $120K check in March when their revenue comes in October.

I work with agricultural equipment dealers to offer financing that''s built for how farms actually operate:
- Seasonal payment structures (pay more after harvest, less during planting)
- Skip-payment options during off-season months
- Terms that match the useful life of the equipment
- We work with operations of all sizes, from family farms to commercial ag

Can we set up a quick call to discuss how this could help your customers at {{company_name}}?

Thanks,
[Your Name]
[Your Company]
[Phone]',
 'intro', false, 'starter');

-- Agricultural - Follow Up
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Agricultural - Follow Up',
 'Following Up - Ag Equipment Financing',
 'Hi {{contact_name}},

Circling back on my earlier note about financing for your ag customers at {{company_name}}.

One thing that resonates with dealers I work with: seasonal payment plans. Your customers pay when they earn — heavier payments after harvest, lighter payments during planting season. It makes a huge difference for cash-flow-sensitive operations.

Would love to show you how it works. Free to chat for 10 minutes this week?

Best,
[Your Name]',
 'follow_up', false, 'starter');

-- Fleet Financing Partnership Proposal
INSERT INTO public.email_templates (name, subject, body, category, is_default, tier_required) VALUES
('Fleet Financing Partnership',
 'Fleet Financing Program for {{company_name}} Customers',
 'Hi {{contact_name}},

I work with equipment and vehicle dealers who sell to fleet operators — companies buying multiple units of {{equipment_type}} at a time.

Fleet buyers are some of the biggest deals you''ll close, but they''re also the most financing-sensitive. A company buying 5-10 trucks needs a lender who understands fleet economics: utilization rates, replacement cycles, and the revenue each vehicle generates.

Here''s what I bring to the table for fleet deals:
- Volume pricing on financing rates
- Master lease agreements for repeat buyers
- Flexible structures: lease, TRAC lease, or conventional loan
- Fast credit decisions — even for large fleet orders
- Step-up payments for growing fleets

I''d love to become your go-to financing partner for fleet deals. Can we set up a call to discuss?

Best regards,
[Your Name]
[Your Company]
[Phone]',
 'partnership', false, 'starter');
