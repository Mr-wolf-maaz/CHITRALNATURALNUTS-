-- Seed the Chitral Dry Fruits catalogue (runs only when the products table is empty).
INSERT INTO products (title, description, category, weight_options, original_price, sale_price, stock, image_url, is_featured)
SELECT *
FROM (
  VALUES
    (
      'Chitrali Walnuts in Shell (Akhrot)',
      'Hand-cracked mountain walnuts from century-old Chitrali orchards. Rich, buttery kernels with zero bitterness — perfect for winter snacking and desserts.',
      'Walnuts',
      ARRAY['250g','500g','1kg']::text[],
      1800, 1499, 40,
      '/images/products/walnuts.jpg', true
    ),
    (
      'Premium Walnut Kernels (Akhrot Giri)',
      'Light-halves grade walnut kernels, hand-shelled in Chitral. No broken bits, no shells — just clean, golden giri ready for baking and nutrition-packed snacking.',
      'Walnuts',
      ARRAY['250g','500g','1kg']::text[],
      3200, 2799, 25,
      '/images/products/walnut-kernels.jpg', false
    ),
    (
      'Sweet Chitrali Almonds (Badam)',
      'Sweet mamra-style almonds grown at high altitude. High oil content, intensely flavourful — the famous brain-food badam of the Hindu Kush.',
      'Almonds',
      ARRAY['250g','500g','1kg']::text[],
      2800, 2399, 30,
      '/images/products/almonds.jpg', true
    ),
    (
      'Chalghoza Pine Nuts (In Shell)',
      'Wild-harvested chalghoza from high Himalayan pine forests. Long, thin shells with pine-fresh kernels inside — Pakistan''s most prized mountain nut.',
      'Chalghoza',
      ARRAY['250g','500g','1kg']::text[],
      12000, 10499, 12,
      '/images/products/chalghoza.jpg', true
    ),
    (
      'Dried Apricots (Khumani)',
      'Sun-dried whole khumani from Chitral''s terraced orchards. Naturally sweet, soft and chewy with a deep amber glow — no sulphur, no sugar added.',
      'Dried Apricots',
      ARRAY['250g','500g','1kg']::text[],
      1600, 1349, 50,
      '/images/products/apricots.jpg', true
    ),
    (
      'White Mulberries (Shahtoot)',
      'Delicate white shahtoot dried on the branch. Honey-sweet, slightly crunchy, and packed with iron — crumble over yogurt or eat by the handful.',
      'White Mulberries',
      ARRAY['250g','500g','1kg']::text[],
      1900, 1599, 35,
      '/images/products/mulberries.jpg', false
    ),
    (
      'Dried Figs (Anjeer)',
      'Plump golden anjeer, gently sun-dried to lock in honeyed sweetness. Soft centres full of tiny seeds — superb with warm milk or cheese boards.',
      'Dried Figs',
      ARRAY['250g','500g','1kg']::text[],
      2600, 2249, 4,
      '/images/products/figs.jpg', false
    ),
    (
      'Chitral Royal Gift Box (1.5 kg)',
      'Our signature hamper: walnuts, almonds, chalghoza, khumani, shahtoot and anjeer in six curated compartments. The perfect winter gift, boxed and ribboned by hand.',
      'Dried Fruits',
      ARRAY['1kg']::text[],
      4500, 3899, 8,
      '/images/products/gift-box.jpg', true
    )
) AS seed(title, description, category, weight_options, original_price, sale_price, stock, image_url, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM products);
