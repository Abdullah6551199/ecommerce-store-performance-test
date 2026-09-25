INSERT OR REPLACE INTO installed_apps (id, version, enabled, installed_at, updated_at, settings, permissions, installed_by) VALUES
('bundles', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{}', '[]', 'admin@apexstore.com'),
('coupons', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{}', '[]', 'admin@apexstore.com'),
('broadcast', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{}', '[]', 'admin@apexstore.com'),
('trust-badges', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{"showOnProductPage":true,"showOnCartPage":true,"showOnCheckoutPage":true,"showPaymentIcons":true,"badgeAlignment":"center","badgeSize":"md"}', '[]', 'admin@apexstore.com'),
('cookie-consent', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{"bannerTitle":"We value your privacy","bannerDescription":"We use cookies to enhance your browsing experience.","primaryColor":"#25D366","layout":"bottom-banner","requireExplicitConsent":true}', '[]', 'admin@apexstore.com'),
('digital-products', '1.0.0', 1, strftime('%s','now')*1000, strftime('%s','now')*1000, '{}', '[]', 'admin@apexstore.com');
