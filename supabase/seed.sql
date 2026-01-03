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
  'https://vercel.com/blog/introducing-next-js-15',
  'Introducing Next.js 15',
  'Next.js 15 is officially stable and ready for production. This release builds on the updates from both RC1 and RC2.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  'article',
  true, false, false,
  '# Introducing Next.js 15

Next.js 15 is officially stable and ready for production. This release builds on the updates from both RC1 and RC2.

## What''s New

- **Async Request APIs**: Moving towards a simpler model for rendering
- **Caching Semantics**: fetch requests are no longer cached by default
- **React 19 Support**: Full support for React 19 and the React Compiler
- **Turbopack**: Now stable for development',
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
  'https://stripe.com/blog/engineering-fallacies',
  'Common Engineering Fallacies',
  'Lessons learned from building payments infrastructure at scale.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  'article',
  false, false, false,
  '# Common Engineering Fallacies

Building payments infrastructure has taught us many lessons about what works and what doesn''t at scale.

## The Fallacy of Perfect Information

Engineers often assume they have complete knowledge of the system. In reality, distributed systems are full of surprises.

## The Fallacy of Infinite Resources

Just because cloud services offer "unlimited" scaling doesn''t mean your architecture will handle it gracefully.',
  2100,
  10,
  'Stripe Engineering',
  '2024-09-15T00:00:00Z',
  'Stripe shares hard-won lessons from building payments infrastructure at scale, covering common fallacies engineers make about distributed systems and resource management.',
  'technical-article',
  'completed',
  now() - interval '1 day'
),
(
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'https://www.newyorker.com/culture/the-weekend-essay/the-art-of-getting-lost',
  'The Art of Getting Lost',
  'In praise of wandering without a destination.',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'article',
  true, false, false,
  '# The Art of Getting Lost

There is something deeply human about wanting to know where we are going. GPS has eliminated the possibility of getting lost, but has it also eliminated something essential?

When we wander without a destination, we open ourselves to serendipity. The best discoveries often come when we''re not looking for anything in particular.',
  1800,
  9,
  'Rebecca Solnit',
  '2024-08-22T00:00:00Z',
  'A meditation on the value of wandering without purpose in an age of GPS and constant navigation. Getting lost can lead to unexpected discoveries and deeper human experiences.',
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
  'https://danluu.com/simple-hierarchical/',
  'Simple Hierarchical Data Structures',
  'Why simple solutions often beat complex ones in practice.',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
  'article',
  false, false, false,
  '# Simple Hierarchical Data Structures

In my experience, simple data structures almost always beat complex ones. The performance gains from complex structures rarely outweigh the cost of additional bugs and maintenance burden.

## The B-tree Trap

Many engineers reach for B-trees when a simple sorted array would suffice. The constant factors matter more than asymptotic complexity for small datasets.',
  3200,
  16,
  'Dan Luu',
  '2024-07-10T00:00:00Z',
  'Dan Luu argues that simple data structures usually outperform complex ones in practice, as the overhead of complex implementations often exceeds their theoretical benefits.',
  'technical-article',
  'completed',
  now() - interval '5 days'
),
(
  '20000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'https://arstechnica.com/science/2024/10/how-the-brain-creates-memories/',
  'How the Brain Creates Memories',
  'New research reveals the molecular mechanisms behind long-term memory formation.',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
  'article',
  true, false, false,
  '# How the Brain Creates Memories

Scientists have long known that memories are stored in the connections between neurons, but the precise mechanisms have remained elusive.

New research using advanced imaging techniques has revealed that memory formation involves a cascade of molecular events that permanently alter synaptic connections.',
  1650,
  8,
  'John Timmer',
  '2024-10-01T00:00:00Z',
  'New neuroscience research reveals the molecular mechanisms behind long-term memory formation, showing how synaptic connections are permanently altered during learning.',
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
  'https://www.wired.com/story/the-metaverse-is-dead/',
  'The Metaverse Is Dead. Long Live Spatial Computing',
  'How the industry pivoted from virtual worlds to mixed reality.',
  'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800',
  'article',
  false, false, true,
  '# The Metaverse Is Dead. Long Live Spatial Computing

The metaverse hype has faded, replaced by a more practical vision: spatial computing. Instead of virtual worlds, the future might be about enhancing the real world with digital layers.',
  1100,
  5,
  'Lauren Goode',
  '2024-06-15T00:00:00Z',
  'The metaverse hype has given way to spatial computing, a more practical approach that enhances reality with digital layers rather than replacing it entirely.',
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
  'https://www.youtube.com/watch?v=kYfNvmF0Bqw',
  'The Art of Code - Dylan Beattie',
  'A talk about the joy and creativity in programming, featuring musical code and esoteric languages.',
  'https://img.youtube.com/vi/kYfNvmF0Bqw/maxresdefault.jpg',
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
  'https://www.youtube.com/watch?v=8pTEmbeENF4',
  'The Wet Codebase - Dan Abramov',
  'Beyond DRY: When duplication is actually the right choice.',
  'https://img.youtube.com/vi/8pTEmbeENF4/maxresdefault.jpg',
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
  'https://vimeo.com/97419176',
  'Inventing on Principle - Bret Victor',
  'A legendary talk on creative tools and immediate feedback.',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800',
  'video',
  true, true, false,
  '{"duration": "3240", "channel": "Bret Victor", "platform": "vimeo"}',
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
-- ITEMS - Threads (Twitter/X threads, Reddit discussions)
-- ============================================================================

INSERT INTO items (
  id, user_id, url, title, description, image_url, type,
  is_kept, is_favorite, is_archived, content, word_count, reading_time,
  ai_summary, ai_content_type, processing_status, created_at
) VALUES
(
  '20000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'https://twitter.com/naval/status/1002103360646823936',
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
  'https://www.reddit.com/r/programming/comments/abc123/i_spent_6_months_building_a_side_project',
  'I spent 6 months building a side project - lessons learned',
  'A developer shares their journey building and launching a product.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'thread',
  true, false, false,
  'After 6 months of building my side project in the evenings, here''s what I learned:

1. Start with distribution, not the product
2. Talk to users before writing code
3. Simple > Perfect
4. Ship weekly to maintain momentum',
  1200,
  6,
  'A developer reflects on building a side project over 6 months, emphasizing the importance of distribution, user feedback, and shipping frequently.',
  'reddit-discussion',
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
  'https://unsplash.com/photos/5E5N49RWtbA',
  'Minimal Workspace Setup',
  'A clean, minimal desk setup with natural light.',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
  'image',
  true, false, false,
  '{"photographer": "Unsplash", "dimensions": "4000x2667"}',
  'A minimalist workspace featuring natural wood, plants, and plenty of natural light. Perfect inspiration for home office design.',
  'photography',
  'completed',
  now() - interval '12 hours'
),
(
  '20000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  'https://dribbble.com/shots/12345678-Mobile-App-Design',
  'Mobile App Design - Finance Dashboard',
  'Beautiful mobile app design for a finance tracking app.',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  'image',
  true, false, false,
  '{"designer": "Dribbble User", "dimensions": "1600x1200"}',
  'A sleek finance dashboard design featuring dark mode, gradient accents, and clear data visualization for mobile devices.',
  'design-inspiration',
  'completed',
  now() - interval '5 days'
),
(
  '20000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000001',
  'https://www.artstation.com/artwork/nature-landscape',
  'Digital Art - Mountain Sunrise',
  'Stunning digital painting of a mountain landscape at sunrise.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'image',
  false, false, false,
  '{"artist": "ArtStation Artist", "medium": "digital"}',
  'A breathtaking digital painting depicting mountain peaks at sunrise, with dramatic lighting and atmospheric depth.',
  'digital-art',
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
  'https://www.theatlantic.com/technology/archive/2024/ai-future/',
  'The Future of AI is Here',
  'An in-depth look at where artificial intelligence is heading.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'article',
  true, false, false,
  'pending',
  now() - interval '30 minutes'
),
(
  '20000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000001',
  'https://www.youtube.com/watch?v=processing123',
  'Tech Conference Keynote 2024',
  'Latest announcements from the annual tech conference.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
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
