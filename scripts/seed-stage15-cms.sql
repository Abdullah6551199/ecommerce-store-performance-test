-- Seed Default Pages into D1 pages table
INSERT OR IGNORE INTO pages (
  id, tenant_id, slug, title, content, seo_title, seo_description, og_image, show_in_footer, is_published, is_default, sort_order, created_at, updated_at
) VALUES 
(
  'page-about',
  'default',
  'about',
  'About Us',
  '<h1>About ApexStore</h1>
<p>Welcome to <strong>ApexStore</strong>! We are dedicated to delivering cutting-edge, high-performance athletic apparel, competition footwear, and sports gear engineered for peak human performance.</p>
<h2>Our Mission</h2>
<p>To empower athletes, runners, and fitness enthusiasts worldwide by uniting advanced technical fabrics with minimalist ergonomic design.</p>
<h2>Why Choose Us</h2>
<ul>
  <li><strong>Engineered for Durability:</strong> Tested relentlessly in high-intensity training environments.</li>
  <li><strong>Fast & Reliable Shipping:</strong> Rapid dispatch with real-time end-to-end order tracking.</li>
  <li><strong>Athlete-First Support:</strong> Dedicated specialists ready to assist with sizing, technical queries, and performance recommendations.</li>
  <li><strong>Safe & Secure Checkout:</strong> Encrypted transactions and flexible checkout options including Cash on Delivery (COD).</li>
</ul>',
  'About Us | ApexStore Performance Gear',
  'Discover the engineering mission and craftsmanship behind ApexStore high-performance athletic apparel and footwear.',
  NULL,
  1,
  1,
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'page-privacy',
  'default',
  'privacy-policy',
  'Privacy Policy',
  '<h1>Privacy Policy</h1>
<p><em>Last updated: September 2026</em></p>
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly when creating an account, making a purchase, subscribing to marketing releases, or communicating with customer service. This includes your name, email address, phone number, shipping address, and payment preferences.</p>
<h2>2. How We Use Your Information</h2>
<p>Your data is utilized exclusively to process orders, facilitate swift delivery, improve storefront performance, ensure transaction security, and communicate pertinent order milestones.</p>
<h2>3. Cookies & Local Edge Storage</h2>
<p>We use essential cookies and edge session tokens to sustain your active shopping cart, remember wishlist choices, and preserve appearance preferences (light/dark mode).</p>
<h2>4. Third-Party Services</h2>
<p>We do not sell or monetize personal customer records. Trusted infrastructure partners (Cloudflare Edge and payment processors) adhere to strict data security standards.</p>
<h2>5. Your Rights</h2>
<p>You have the full right to access, inspect, rectify, or request deletion of your personal data at any time by contacting support@apexstore.com.</p>',
  'Privacy Policy | ApexStore',
  'Learn how ApexStore safeguards your personal information, cookies, and order data with industry-leading privacy protocols.',
  NULL,
  1,
  1,
  1,
  2,
  datetime('now'),
  datetime('now')
),
(
  'page-terms',
  'default',
  'terms',
  'Terms & Conditions',
  '<h1>Terms & Conditions</h1>
<p><em>Last updated: September 2026</em></p>
<h2>1. Agreement to Terms</h2>
<p>By browsing, accessing, or placing an order on ApexStore, you acknowledge that you have read and agreed to be legally bound by these terms and conditions.</p>
<h2>2. Product Orders & Pricing</h2>
<p>All items displayed on our store are subject to warehouse availability. In the rare event an item is out of stock after order submission, customer service will notify you immediately with option for immediate refund or exchange.</p>
<h2>3. Payment & Cash on Delivery (COD)</h2>
<p>We provide multiple payment alternatives including verified Cash on Delivery. When opting for COD, please ensure accurate phone and address verification to facilitate seamless courier delivery.</p>
<h2>4. Intellectual Property</h2>
<p>All brand marks, technical drawings, imagery, and text assets are proprietary to ApexStore and protected under intellectual property regulations.</p>',
  'Terms & Conditions | ApexStore',
  'Review the terms and conditions governing purchases, payments, and website usage at ApexStore.',
  NULL,
  1,
  1,
  1,
  3,
  datetime('now'),
  datetime('now')
),
(
  'page-returns',
  'default',
  'returns',
  'Returns & Exchanges Policy',
  '<h1>Returns & Exchanges Policy</h1>
<h2>Hassle-Free 30-Day Window</h2>
<p>We stand behind the quality of our performance gear. If you are not 100% satisfied with your purchase, you may initiate a return or exchange within <strong>30 days</strong> of confirmed delivery.</p>
<h2>Eligibility Criteria</h2>
<ul>
  <li>Items must be unworn, unwashed, and in original packaging with all attached technical tags.</li>
  <li>Footwear must include the original intact manufacturer shoe box.</li>
  <li>Proof of purchase or Order ID is required.</li>
</ul>
<h2>How to Start a Return</h2>
<ol>
  <li>Navigate to our Contact page or email support@apexstore.com with your Order ID.</li>
  <li>Our team will generate a prepaid return shipping slip.</li>
  <li>Pack the items securely and hand them over to the designated carrier.</li>
  <li>Refunds are processed within 3–5 business days following return inspection.</li>
</ol>',
  'Returns & Exchanges | ApexStore',
  'Information on ApexStore 30-day hassle-free return and exchange policy for footwear and technical gear.',
  NULL,
  1,
  1,
  1,
  4,
  datetime('now'),
  datetime('now')
),
(
  'page-shipping',
  'default',
  'shipping',
  'Shipping Information',
  '<h1>Shipping & Delivery Information</h1>
<h2>Shipping Options & Speeds</h2>
<ul>
  <li><strong>Standard Ground Shipping (3–5 Business Days):</strong> Flat rate $5.00 — <strong>FREE on orders over $100</strong>.</li>
  <li><strong>Express Priority Air (1–2 Business Days):</strong> $15.00 flat rate for expedited delivery.</li>
  <li><strong>International Expedited (7–14 Business Days):</strong> Real-time calculated rate based on destination country and customs jurisdiction.</li>
</ul>
<h2>Order Processing Timeline</h2>
<p>Orders submitted before 2:00 PM EST on business days are processed and handed to our logistics partners on the same day. Tracking numbers are transmitted instantly upon dispatch.</p>
<h2>Damaged or Delayed Deliveries</h2>
<p>If your package arrives compromised or delayed, contact our customer desk within 48 hours for immediate dispatch of a replacement order.</p>',
  'Shipping & Delivery Information | ApexStore',
  'Comprehensive shipping speeds, costs, tracking procedures, and delivery timeframes at ApexStore.',
  NULL,
  1,
  1,
  1,
  5,
  datetime('now'),
  datetime('now')
),
(
  'page-contact',
  'default',
  'contact',
  'Contact Us',
  '<h1>Contact ApexStore</h1>
<p>Whether you need sizing advice, technical gear recommendations, order assistance, or wholesale inquiries, our team is standing by to help you succeed.</p>',
  'Contact Us | ApexStore Support',
  'Reach out to ApexStore support team for inquiries regarding products, orders, returns, and athlete partnerships.',
  NULL,
  1,
  1,
  1,
  6,
  datetime('now'),
  datetime('now')
);

-- Seed Default FAQs into D1 faqs table
INSERT OR IGNORE INTO faqs (
  id, tenant_id, question, answer, category, sort_order, is_active, created_at, updated_at
) VALUES
(
  'faq-1',
  'default',
  'What is your standard delivery timeframe?',
  'Orders are packed and dispatched within 24 to 48 business hours. Domestic standard ground shipping takes 3–5 business days, while express air priority delivery typically takes 1–2 business days.',
  'Shipping',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-2',
  'default',
  'How do I track my active order?',
  'As soon as your shipment departs our fulfillment warehouse, you will receive an automatic email containing your carrier tracking link. You can also contact support with your Order ID for real-time status updates.',
  'Orders',
  2,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-3',
  'default',
  'What is your return policy?',
  'We offer an unconditional 30-day return window on all unworn gear in original condition with tags attached. Please visit our Returns page for step-by-step return label generation.',
  'Returns',
  3,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-4',
  'default',
  'Do you ship internationally?',
  'Yes! We deliver to over 60 countries worldwide. International shipping transit times range from 7 to 14 business days, and duties/taxes are calculated dynamically at checkout.',
  'Shipping',
  4,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-5',
  'default',
  'Can I cancel or modify an order after placing it?',
  'If your order has not yet been processed by our logistics facility, we can update the shipping address or cancel the order. Please reach out to us immediately via the Contact page.',
  'Orders',
  5,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-6',
  'default',
  'How do promotional discount codes work?',
  'Simply enter your coupon code in the discount field during checkout. The applicable savings percentage or fixed deduction will immediately calculate into your cart subtotal.',
  'Payment',
  6,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-7',
  'default',
  'Are your athletic apparel fabrics sustainably sourced?',
  'Yes! More than 70% of our active apparel lines incorporate recycled polymer fibers and OEKO-TEX certified non-toxic dye formulations, ensuring both top-tier durability and environmental responsibility.',
  'Products',
  7,
  1,
  datetime('now'),
  datetime('now')
),
(
  'faq-8',
  'default',
  'What payment methods do you accept?',
  'We support verified Cash on Delivery (COD) as well as major credit/debit cards (Visa, Mastercard, American Express) through our secure edge-encrypted checkout.',
  'Payment',
  8,
  1,
  datetime('now'),
  datetime('now')
);
