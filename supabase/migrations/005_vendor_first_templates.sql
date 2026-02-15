-- Migration 005: Vendor-first cadence templates (3 angles x 4 touches = 12)
-- Run in Supabase SQL Editor AFTER migration 004

-- Remove old default templates (industry templates from 003 stay)
DELETE FROM public.email_templates WHERE is_default = TRUE;

-- ============================================
-- ANGLE A: Close-Rate Lift (4 touches)
-- "Your buyers want your equipment. They just can't pay cash. We fix that."
-- ============================================

INSERT INTO public.email_templates
  (name, subject, body, category, angle, cadence_step, cadence_day, is_default, tier_required)
VALUES
(
  'Angle A - Day 1 Intro',
  'Quick question for {{company_name}}',
  'Hi {{contact_name}},

Your buyers want your {{equipment_type}}. They just can''t always pay cash. I fix that.

I work with dealers like {{company_name}} to get their customers approved fast — same-day decisions, flexible terms, no chasing banks.

How are you handling customers who want to buy but need financing?

Happy to pilot this on 2-3 deals so you can see how it works — zero risk on your end.

[Your Name]
[Your Company]
[Phone]',
  'cadence', 'A', 1, 1, TRUE, 'pro'
),
(
  'Angle A - Day 3 Follow-up',
  'Re: Quick question for {{company_name}}',
  'Hi {{contact_name}},

Circling back on my note — I''m curious:

What percentage of your walk-in buyers at {{company_name}} end up needing some kind of financing?

For most dealers I work with, it''s 40-60%. That''s a lot of potential revenue sitting on the table if the financing option isn''t dialed in.

Worth a 5-minute call to compare notes?

[Your Name]',
  'cadence', 'A', 2, 3, TRUE, 'pro'
),
(
  'Angle A - Day 7 Pilot Offer',
  'Pilot idea for {{company_name}}',
  'Hi {{contact_name}},

I know you''re busy running {{company_name}}, so I''ll keep this short.

Here''s what I''m proposing: send me your next 2-3 deals where the buyer needs financing. I''ll get them credit decisions within hours. If it works, we keep going. If not, no hard feelings.

Zero cost. Zero obligation. Just a test run.

What do you say?

[Your Name]',
  'cadence', 'A', 3, 7, TRUE, 'pro'
),
(
  'Angle A - Day 14 Breakup',
  'Closing the loop — {{company_name}}',
  'Hi {{contact_name}},

I''ve reached out a couple times about financing for your {{equipment_type}} customers at {{company_name}}. I know timing isn''t always right.

I''ll leave this here: if a deal ever stalls because your buyer needs a payment plan, I can usually get them approved the same day.

No follow-up from me unless you reach out. My door''s open.

[Your Name]
[Phone]',
  'cadence', 'A', 4, 14, TRUE, 'pro'
);

-- ============================================
-- ANGLE B: Speed/Friction (4 touches)
-- "We get your customers funded in hours, not weeks. No chasing banks."
-- ============================================

INSERT INTO public.email_templates
  (name, subject, body, category, angle, cadence_step, cadence_day, is_default, tier_required)
VALUES
(
  'Angle B - Day 1 Intro',
  'Faster financing for {{company_name}} customers',
  'Hi {{contact_name}},

I get your customers funded in hours, not weeks. No chasing banks. No paperwork nightmares.

I work with {{equipment_type}} dealers and the #1 complaint I hear is: "Financing takes too long and we lose the deal." I built my process to eliminate that.

How long does your average customer wait for a financing decision right now?

I''d love to pilot on 2-3 deals and show you the difference.

[Your Name]
[Your Company]
[Phone]',
  'cadence', 'B', 1, 1, TRUE, 'pro'
),
(
  'Angle B - Day 3 Follow-up',
  'Re: Faster financing for {{company_name}} customers',
  'Hi {{contact_name}},

Quick follow-up — have you ever had a buyer at {{company_name}} who was ready to sign but walked because the financing approval took too long?

I ask because most dealers I talk to say it happens at least once a month. That''s real money walking out the door.

My turnaround is same-day for most deals. Happy to prove it.

[Your Name]',
  'cadence', 'B', 2, 3, TRUE, 'pro'
),
(
  'Angle B - Day 7 Pilot Offer',
  'Let me prove it — {{company_name}}',
  'Hi {{contact_name}},

Here''s a no-risk way to test this out:

Next time a customer at {{company_name}} needs financing on a {{equipment_type}} deal, send them my way. I''ll get a credit decision back to you the same day.

If the speed doesn''t blow you away, we part ways. If it does, we set up an ongoing partnership.

One deal. That''s all I''m asking for.

[Your Name]',
  'cadence', 'B', 3, 7, TRUE, 'pro'
),
(
  'Angle B - Day 14 Breakup',
  'Last note — {{company_name}}',
  'Hi {{contact_name}},

I''ll keep this brief. I reached out about speeding up financing for your {{equipment_type}} customers at {{company_name}}.

If slow financing approvals are ever costing you deals, just reply to this email. I can usually turn things around same-day.

No more follow-ups from me. Best of luck.

[Your Name]
[Phone]',
  'cadence', 'B', 4, 14, TRUE, 'pro'
);

-- ============================================
-- ANGLE C: Stop Losing Deals (4 touches)
-- "How many deals walked last month because financing fell through?"
-- ============================================

INSERT INTO public.email_templates
  (name, subject, body, category, angle, cadence_step, cadence_day, is_default, tier_required)
VALUES
(
  'Angle C - Day 1 Intro',
  'Deals walking at {{company_name}}?',
  'Hi {{contact_name}},

How many deals walked last month at {{company_name}} because financing fell through?

For most {{equipment_type}} dealers, the answer is "more than I''d like." I help fix that by giving your customers a fast, reliable way to finance their purchase — so the deal closes instead of dying.

What does your current financing setup look like?

Happy to pilot on 2-3 deals to show you how it works.

[Your Name]
[Your Company]
[Phone]',
  'cadence', 'C', 1, 1, TRUE, 'pro'
),
(
  'Angle C - Day 3 Follow-up',
  'Re: Deals walking at {{company_name}}?',
  'Hi {{contact_name}},

One more thought on lost deals at {{company_name}} —

When a customer can''t get financed, do they usually come back later, or do they go to a competitor who has financing lined up?

In my experience, they go to the competitor. That''s the deal you never see again.

I can make sure that doesn''t happen. Worth a quick chat?

[Your Name]',
  'cadence', 'C', 2, 3, TRUE, 'pro'
),
(
  'Angle C - Day 7 Pilot Offer',
  'Save the next deal — {{company_name}}',
  'Hi {{contact_name}},

Here''s my ask: the next time a {{equipment_type}} deal at {{company_name}} is about to die because of financing, send it to me before you let it go.

I''ll get the buyer a decision fast. If I save the deal, we talk about doing this regularly. If I don''t, you''re no worse off.

One deal. That''s the pilot.

[Your Name]',
  'cadence', 'C', 3, 7, TRUE, 'pro'
),
(
  'Angle C - Day 14 Breakup',
  'My last note — {{company_name}}',
  'Hi {{contact_name}},

I''ve reached out a few times about helping {{company_name}} save deals that stall on financing. I respect your time, so this is my last message.

If you ever have a deal that''s about to walk because the buyer can''t get funded, keep my info handy. I can usually turn it around same-day.

Wishing you a great quarter.

[Your Name]
[Phone]',
  'cadence', 'C', 4, 14, TRUE, 'pro'
);
