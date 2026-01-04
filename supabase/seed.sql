-- ============================================================================
-- PORTABLE - Seed Data for Local Development
-- ============================================================================
-- This file creates comprehensive test data for local development.
-- Run with: supabase db reset
-- ============================================================================

-- ============================================================================
-- TEST USER SETUP
-- ============================================================================

-- Create a test user in auth.users (only works in local development)
-- Email: test@portable.dev | Password: password123
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test@portable.dev',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test User"}',
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- The profile will be created automatically via the trigger
-- Set a known API key for testing
UPDATE profiles 
SET api_key = 'test-api-key-12345' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- TOPICS (Tags)
-- ============================================================================

INSERT INTO topics (id, user_id, name, slug) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Technology', 'technology'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Design', 'design'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Programming', 'programming'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'AI & Machine Learning', 'ai-machine-learning'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Startups', 'startups'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Productivity', 'productivity'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Science', 'science'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Music', 'music'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Photography', 'photography'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Cooking', 'cooking')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ITEMS - Articles (Various time periods and sections)
-- ============================================================================

-- Today's articles
INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  author, publish_date, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'https://www.paulgraham.com/superlinear.html',
  'Superlinear Returns',
  'One of the most important things I didn''t understand about the world when I was a child is the degree to which the returns for performance are superlinear.',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
  'article',
  true, true, false,
  '# Superlinear Returns

One of the most important things I didn''t understand about the world when I was a child is the degree to which the returns for performance are superlinear.

Teachers and coaches implicitly told us the returns were linear. "You get out," I heard a thousand times, "what you put in." They meant well, but this is rarely true. If your product is only half as good as your competitor''s, you don''t get half as many customers. You get no customers, and you go out of business.

It''s obviously true that the returns for performance are superlinear in business. Some think this is a flaw of capitalism, and that if we changed the rules it would stop being true. But superlinear returns for performance are a feature of the world, not an artifact of rules we''ve invented.',
  1250,
  6,
  'Paul Graham',
  '2023-10-15T00:00:00Z',
  'Paul Graham explores how returns in life are superlinear rather than linear. Success compounds in ways that teachers never explained, and understanding this principle is crucial for career and business decisions.',
  'longform-essay',
  'completed',
  now() - interval '2 hours'
),
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'https://nextjs.org/blog/next-15',
  'Next.js 15',
  'Next.js 15 is officially stable and ready for production with React 19 support, Turbopack Dev, and new caching defaults.',
  'https://assets.vercel.com/image/upload/v1729607938/nextjs/og-next-15.png',
  'article',
  true, false, false,
  '# Next.js 15

Next.js 15 is officially stable and ready for production. This release builds on the updates from both RC1 and RC2.

## What''s New

- **@next/codemod CLI**: Easily upgrade your Next.js and React versions
- **Async Request APIs**: Moving towards a simpler rendering and caching model
- **Caching Semantics**: fetch requests are no longer cached by default
- **React 19 Support**: Full support for React 19, React Compiler (Experimental), and hydration error improvements
- **Turbopack Dev**: Performance and stability improvements, now stable for development
- **Static Indicator**: New visual indicator shows static routes during development
- **unstable_after API**: Execute code after a response finishes streaming',
  890,
  4,
  'Vercel Team',
  '2024-10-21T00:00:00Z',
  'Next.js 15 brings async request APIs, updated caching semantics, React 19 support, and stable Turbopack for development. A significant release for modern web development.',
  'product-announcement',
  'completed',
  now() - interval '4 hours'
);

-- Yesterday's articles
INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  author, publish_date, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'https://stripe.com/blog/api-versioning',
  'APIs as infrastructure: future-proofing Stripe with versioning',
  'How Stripe maintains API compatibility while continuously improving their platform.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  'article',
  false, false, false,
  '# APIs as infrastructure: future-proofing Stripe with versioning

Stripe handles billions of API calls, and breaking changes would disrupt millions of businesses. Here''s how we approach API versioning to maintain stability while continuously evolving.

## The Challenge

When you''re building an API that powers critical business operations, you can''t just push breaking changes. Yet you also can''t freeze development forever.

## Our Approach

We use explicit API versioning with a date-based scheme. Each API version is immutable—once released, it never changes. New features and fixes go into new versions.',
  2100,
  10,
  'Brandur Leach',
  '2017-08-15T00:00:00Z',
  'Stripe explains their approach to API versioning, balancing the need for stability with continuous improvement. A must-read for anyone building APIs at scale.',
  'technical-article',
  'completed',
  now() - interval '1 day'
),
(
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'https://www.paulgraham.com/hwh.html',
  'How to Work Hard',
  'It might not seem there''s much to learn about how to work hard. Anyone who''s been to school knows what it entails.',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'article',
  true, false, false,
  '# How to Work Hard

It might not seem there''s much to learn about how to work hard. Anyone who''s been to school knows what it entails, even if they chose not to do it. There are three components: quantity, quality, and direction.

Some people work longer hours than others. Some work on more mentally demanding problems. And some direct their work towards more important goals.

You won''t get very far if you only work on one of these dimensions. The most impressive people work on all three.',
  1800,
  9,
  'Paul Graham',
  '2021-06-01T00:00:00Z',
  'Paul Graham breaks down hard work into three components: quantity, quality, and direction. To achieve great things, you need all three working together.',
  'longform-essay',
  'completed',
  now() - interval '1 day 3 hours'
);

-- Last week's articles
INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  author, publish_date, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'https://danluu.com/sounds-easy/',
  'Normalization of deviance',
  'How the gradual acceptance of small deviations from proper practice can lead to catastrophic failures.',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
  'article',
  false, false, false,
  '# Normalization of deviance

In 1996, Diane Vaughan published a book analyzing the Challenger shuttle disaster. She coined the phrase "normalization of deviance" to describe a cultural phenomenon where the gradual acceptance of risk leads to catastrophe.

## How It Works

People become accustomed to small violations. Each violation that doesn''t result in disaster reinforces the belief that the risk isn''t real. Over time, what was once unacceptable becomes routine.

## In Software

I''ve seen this pattern repeatedly in tech companies. Tests start failing occasionally. Monitoring alerts fire and get ignored. Technical debt accumulates. Each step seems small, but the cumulative effect can be devastating.',
  3200,
  16,
  'Dan Luu',
  '2019-04-15T00:00:00Z',
  'Dan Luu explores how gradual acceptance of small deviations from proper practice can lead to catastrophic failures, with examples from the Challenger disaster and software engineering.',
  'technical-article',
  'completed',
  now() - interval '5 days'
),
(
  '20000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html',
  'The AI Revolution: The Road to Superintelligence',
  'An exploration of artificial intelligence and where it might be taking us.',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
  'article',
  true, false, false,
  '# The AI Revolution: The Road to Superintelligence

We are on the edge of change comparable to the rise of human life on Earth. — Vernor Vinge

What does it mean for the future to be near? And just how soon is it coming?

## The Far Future Is Coming Faster Than You Think

Imagine taking a time machine back to 1750 and grabbing someone from that era. You bring them to 2015 and show them cars, planes, phones, the internet. They would die of shock—the future would be too overwhelming to process.',
  1650,
  8,
  'Tim Urban',
  '2015-01-22T00:00:00Z',
  'Tim Urban of Wait But Why explores the path from narrow AI to artificial general intelligence to superintelligence, and what it might mean for humanity.',
  'science-article',
  'completed',
  now() - interval '6 days'
);

-- Last month's articles (some archived)
INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  author, publish_date, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'https://basecamp.com/shapeup',
  'Shape Up: Stop Running in Circles',
  'A new approach to product development from Basecamp.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  'article',
  true, false, false,
  '# Shape Up

Shape Up is a product development methodology that emphasizes fixed time, variable scope. Instead of estimating how long things take, you decide how much time something is worth.

## Shaping vs Building

Before any work begins, senior people "shape" the work—defining the boundaries, risks, and rabbit holes to avoid.',
  4500,
  22,
  'Ryan Singer',
  '2019-06-01T00:00:00Z',
  'Shape Up introduces a product development methodology that emphasizes fixed time with variable scope, where work is "shaped" before implementation to define clear boundaries.',
  'methodology-guide',
  'completed',
  now() - interval '25 days'
),
(
  '20000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/',
  'Things You Should Never Do, Part I',
  'Netscape 6.0 is finally going into its first public beta. There never was a version 5.0. The last major release was version 4.0 in 1997.',
  'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800',
  'article',
  false, false, true,
  '# Things You Should Never Do, Part I

Netscape 6.0 is finally going into its first public beta. There never was a version 5.0. The last major release, version 4.0, was released almost three years ago.

They decided to rewrite the code from scratch. This is the single worst strategic mistake that any software company can make.

## The Old Mantra Build One to Throw Away Is Wrong

Programmers always want to throw away old code and start over. The reason is that they think the old code is a mess. They''re probably wrong.',
  1100,
  5,
  'Joel Spolsky',
  '2000-04-06T00:00:00Z',
  'Joel Spolsky argues that rewriting software from scratch is almost always a strategic mistake, using Netscape''s browser rewrite as a cautionary tale.',
  'tech-analysis',
  'completed',
  now() - interval '30 days'
);

-- ============================================================================
-- ITEMS - Videos
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, metadata, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=6avJHaC3C2U',
  'The Art of Code - Dylan Beattie',
  'A talk about the joy and creativity in programming, featuring musical code and esoteric languages.',
  'https://img.youtube.com/vi/6avJHaC3C2U/maxresdefault.jpg',
  'video',
  true, false, false,
  '{"duration": "3632", "channel": "NDC Conferences", "platform": "youtube"}',
  'Dylan Beattie explores the artistic side of programming through musical code, esoteric languages, and creative coding experiments. A celebration of programming as art.',
  'conference-talk',
  'completed',
  now() - interval '3 hours'
),
(
  '20000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=mVVNJKv9esE',
  'The Wet Codebase - Dan Abramov',
  'Beyond DRY: When duplication is actually the right choice.',
  'https://img.youtube.com/vi/mVVNJKv9esE/maxresdefault.jpg',
  'video',
  true, false, false,
  '{"duration": "1893", "channel": "Deconstruct", "platform": "youtube"}',
  'Dan Abramov challenges the DRY principle, arguing that sometimes code duplication is preferable to premature abstraction. A nuanced take on software architecture.',
  'conference-talk',
  'completed',
  now() - interval '2 days'
),
(
  '20000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=PUv66718DII',
  'Inventing on Principle - Bret Victor',
  'A legendary talk on creative tools and immediate feedback.',
  'https://img.youtube.com/vi/PUv66718DII/maxresdefault.jpg',
  'video',
  true, true, false,
  '{"duration": "3240", "channel": "CUSEC", "platform": "youtube"}',
  'Bret Victor demonstrates revolutionary ideas about creative tools, showing how immediate feedback and direct manipulation can transform how we create software and art.',
  'conference-talk',
  'completed',
  now() - interval '10 days'
),
(
  '20000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Never Gonna Give You Up - Rick Astley',
  'The classic 80s hit that became an internet phenomenon.',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'video',
  false, false, false,
  '{"duration": "213", "channel": "Rick Astley", "platform": "youtube"}',
  'Rick Astley''s iconic 1987 hit that became the foundation of the Rickroll phenomenon. A cultural artifact of internet history.',
  'music-video',
  'completed',
  now() - interval '15 days'
);

-- ============================================================================
-- ITEMS - Products
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, metadata, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'https://www.apple.com/macbook-pro/',
  'MacBook Pro with M4',
  'The most powerful MacBook Pro ever, now with M4 chips.',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  'product',
  true, false, false,
  '{"price": 1999, "currency": "USD", "brand": "Apple"}',
  'Apple''s latest MacBook Pro features the M4 chip family, offering unprecedented performance for professional workloads including AI/ML tasks and video editing.',
  'product-page',
  'completed',
  now() - interval '1 day'
),
(
  '20000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'https://www.raycast.com/',
  'Raycast - Your shortcut to everything',
  'A blazingly fast, totally extendable launcher for macOS.',
  'https://images.unsplash.com/photo-1548611635-b6e7827d2f75?w=800',
  'product',
  true, false, false,
  '{"price": 0, "currency": "USD", "brand": "Raycast"}',
  'Raycast is a productivity app that replaces Spotlight with a more powerful, extensible launcher. Features include clipboard history, snippets, and custom extensions.',
  'product-page',
  'completed',
  now() - interval '4 days'
),
(
  '20000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000001',
  'https://www.keychron.com/products/keychron-q1',
  'Keychron Q1 Mechanical Keyboard',
  'Premium gasket-mounted mechanical keyboard with hot-swappable switches.',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  'product',
  true, false, false,
  '{"price": 179, "currency": "USD", "brand": "Keychron"}',
  'The Keychron Q1 is a premium mechanical keyboard with gasket mount design, QMK/VIA support, and hot-swappable switches. A favorite among keyboard enthusiasts.',
  'product-page',
  'completed',
  now() - interval '8 days'
);

-- ============================================================================
-- ITEMS - Threads (Twitter/X threads, Hacker News discussions)
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'https://x.com/naval/status/1002103360646823936',
  'Naval Ravikant: How to Get Rich Without Getting Lucky',
  'A legendary thread on wealth creation and leverage.',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  'thread',
  true, true, false,
  '1/ Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.

2/ You''re not going to get rich renting out your time. You must own equity - a piece of a business - to gain your financial freedom.

3/ You will get rich by giving society what it wants but does not yet know how to get. At scale.',
  2400,
  12,
  'Naval Ravikant shares principles for building wealth through equity ownership, specific knowledge, and leverage. A timeless thread on financial independence.',
  'twitter-thread',
  'completed',
  now() - interval '3 days'
),
(
  '20000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000001',
  'https://news.ycombinator.com/item?id=35154527',
  'Ask HN: What are some things you''ve mass-adopted from HN?',
  'Hacker News community shares tools and practices they adopted from the community.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'thread',
  true, false, false,
  'Top answers from the community:

- Using a password manager (1Password, Bitwarden)
- Switching to mechanical keyboards
- Learning Vim keybindings
- Reading Paul Graham essays
- Using SQLite for more things
- Terminal multiplexers like tmux',
  1200,
  6,
  'Hacker News users share the tools, practices, and technologies they''ve adopted from the community, from password managers to mechanical keyboards.',
  'hn-discussion',
  'completed',
  now() - interval '7 days'
);

-- ============================================================================
-- ITEMS - Images (Photography, Art, Screenshots)
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, metadata, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000001',
  'https://unsplash.com/photos/XMFZqrGyV-Q',
  'Minimal Workspace Setup',
  'A clean, minimal desk setup with natural light by Jeff Sheldon.',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  'image',
  true, false, false,
  '{"photographer": "Jeff Sheldon", "dimensions": "5472x3648"}',
  'A minimalist workspace featuring a MacBook, clean desk, and natural light. Perfect inspiration for a focused home office design.',
  'photography',
  'completed',
  now() - interval '12 hours'
),
(
  '20000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  'https://layers.to/layers/clsxd8s0d0001l80fzkfzjv5m',
  'Layers Design System Components',
  'A curated collection of design system components and patterns.',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  'image',
  true, false, false,
  '{"source": "Layers.to", "type": "design-system"}',
  'A comprehensive collection of design system components including buttons, forms, cards, and navigation patterns for modern web applications.',
  'design-inspiration',
  'completed',
  now() - interval '5 days'
),
(
  '20000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000001',
  'https://unsplash.com/photos/Oalh2MojUuk',
  'Mountain Landscape at Sunrise',
  'Stunning photograph of mountain peaks bathed in golden sunrise light.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'image',
  false, false, false,
  '{"photographer": "Samuel Ferrara", "location": "Switzerland"}',
  'A breathtaking photograph of Swiss Alps at sunrise, with dramatic lighting casting golden hues across snow-capped peaks.',
  'photography',
  'completed',
  now() - interval '20 days'
);

-- ============================================================================
-- ITEMS - Websites (Landing pages, Tools, Resources)
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000001',
  'https://linear.app/',
  'Linear - The issue tracking tool you''ll enjoy using',
  'A modern project management tool built for software teams.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'website',
  true, false, false,
  'Linear is a streamlined project management tool designed specifically for software teams. Known for its speed, keyboard shortcuts, and beautiful design.',
  'saas-landing-page',
  'completed',
  now() - interval '2 days'
),
(
  '20000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000001',
  'https://excalidraw.com/',
  'Excalidraw - Virtual whiteboard for sketching',
  'A free, open-source whiteboard tool for hand-drawn style diagrams.',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
  'website',
  true, false, false,
  'Excalidraw is a free, open-source virtual whiteboard that creates hand-drawn style diagrams. Perfect for wireframes, architecture diagrams, and brainstorming.',
  'web-tool',
  'completed',
  now() - interval '4 days'
),
(
  '20000000-0000-0000-0000-000000000052',
  '00000000-0000-0000-0000-000000000001',
  'https://www.joshwcomeau.com/',
  'Josh W Comeau - Making learning fun',
  'Personal site with interactive tutorials on CSS, React, and web development.',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
  'website',
  true, false, false,
  'Josh W Comeau''s personal site features interactive tutorials and blog posts about CSS, React, and web development. Known for its playful, educational approach.',
  'personal-blog',
  'completed',
  now() - interval '9 days'
),
(
  '20000000-0000-0000-0000-000000000053',
  '00000000-0000-0000-0000-000000000001',
  'https://www.refactoringui.com/',
  'Refactoring UI - Learn design for developers',
  'A book and resources for developers who want to improve their design skills.',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
  'website',
  false, false, true,
  'Refactoring UI offers practical design tips and a comprehensive book for developers. Created by the makers of Tailwind CSS.',
  'resource-page',
  'completed',
  now() - interval '45 days'
);

-- ============================================================================
-- ITEMS - Pending Processing (for testing loading states)
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000060',
  '00000000-0000-0000-0000-000000000001',
  'https://www.anthropic.com/research/building-effective-agents',
  'Building effective agents',
  'An exploration of successful patterns for building effective AI agents.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'article',
  true, false, false,
  'pending',
  now() - interval '30 minutes'
),
(
  '20000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=zjkBMFhNj_g',
  'WWDC 2024 Keynote — June 10 | Apple',
  'Apple''s Worldwide Developers Conference 2024 keynote presentation.',
  'https://img.youtube.com/vi/zjkBMFhNj_g/maxresdefault.jpg',
  'video',
  false, false, false,
  'completed', -- Videos don't need content extraction
  now() - interval '15 minutes'
);

-- ============================================================================
-- ITEM-TOPICS ASSOCIATIONS
-- ============================================================================

INSERT INTO item_topics (item_id, topic_id) VALUES
  -- Superlinear Returns - Startups, Productivity
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006'),
  
  -- Next.js 15 - Technology, Programming
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  
  -- Stripe Engineering - Technology, Programming
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
  
  -- Brain article - Science
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000007'),
  
  -- Shape Up - Productivity, Startups
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005'),
  
  -- Art of Code video - Programming
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000008'),
  
  -- Dan Abramov video - Programming
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003'),
  
  -- Bret Victor video - Technology, Design
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002'),
  
  -- Rick Astley - Music
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000008'),
  
  -- MacBook Pro - Technology
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001'),
  
  -- Raycast - Technology, Productivity
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000006'),
  
  -- Keychron - Technology
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000001'),
  
  -- Naval thread - Startups
  ('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000005'),
  
  -- Side project thread - Programming, Startups
  ('20000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000005'),
  
  -- Workspace photo - Design, Photography
  ('20000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000009'),
  
  -- Mobile app design - Design
  ('20000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000002'),
  
  -- Linear - Technology, Productivity
  ('20000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000006'),
  
  -- Excalidraw - Design, Technology
  ('20000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000001'),
  
  -- Josh Comeau - Programming, Design
  ('20000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000002'),
  
  -- Refactoring UI - Design
  ('20000000-0000-0000-0000-000000000053', '10000000-0000-0000-0000-000000000002'),
  
  -- AI Future article - AI, Technology
  ('20000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PROJECTS (Collections)
-- ============================================================================

INSERT INTO projects (id, user_id, name, description, created_at) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Learning Resources',
  'Technical articles and tutorials for skill development',
  now() - interval '20 days'
),
(
  '30000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Design Inspiration',
  'UI/UX designs and visual references',
  now() - interval '15 days'
),
(
  '30000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Wish List',
  'Products I want to buy',
  now() - interval '10 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PROJECT-ITEMS ASSOCIATIONS
-- ============================================================================

INSERT INTO project_items (project_id, item_id) VALUES
  -- Learning Resources
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'), -- Superlinear
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'), -- Stripe
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005'), -- Dan Luu
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007'), -- Shape Up
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011'), -- Dan Abramov
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000052'), -- Josh Comeau
  
  -- Design Inspiration
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000040'), -- Workspace
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000041'), -- Mobile design
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000050'), -- Linear
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000053'), -- Refactoring UI
  
  -- Wish List
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000020'), -- MacBook
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000022') -- Keychron
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SET TRIAGE TIMESTAMPS
-- ============================================================================
-- Set kept_at for items in Library (is_kept = true)
-- Use created_at as the kept_at to preserve relative ordering
UPDATE items 
SET kept_at = created_at 
WHERE is_kept = true AND kept_at IS NULL;

-- Set archived_at for archived items
-- Use updated_at as archived_at since that's when they were last modified
UPDATE items 
SET archived_at = COALESCE(updated_at, created_at)
WHERE is_archived = true AND archived_at IS NULL;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- Test User: test@portable.dev / password123
-- 
-- Items by Type:
--   - Articles: 8 (various topics, reading times)
--   - Videos: 4 (YouTube, Vimeo)
--   - Products: 3 (tech products)
--   - Threads: 2 (Twitter, Reddit)
--   - Images: 3 (photography, design)
--   - Websites: 4 (tools, resources)
-- 
-- Items by Bucket:
--   - Inbox (is_kept=false, is_archived=false): ~8 items
--   - Library (is_kept=true, is_archived=false): ~14 items
--   - Archive (is_archived=true): 2 items
--   - Favorites (is_favorite=true): 3 items
-- 
-- Items by Time Period:
--   - Today: 3 items
--   - Yesterday: 2 items
--   - This Week: 8 items
--   - This Month: 6 items
--   - Older: 3 items
-- 
-- Processing States:
--   - Completed: 20 items
--   - Pending: 1 item
--   - Processing: 1 item
-- 
-- Topics: 10 (Technology, Design, Programming, AI, etc.)
-- Projects: 3 (Learning Resources, Design Inspiration, Wish List)
-- 
-- ============================================================================
