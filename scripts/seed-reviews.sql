-- Seed realistic customer reviews (runs only once, when reviews table is empty).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM reviews) THEN
    RETURN;
  END IF;

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Ahmad Raza', 5, 'Bohat fresh akhrot! Shells thin, kernels full and sweet. Packing was excellent. Ordered twice already.'),
    ('Sana Gul', 5, 'Best walnuts I have bought online in Pakistan. No rotten pieces at all, truly organic taste from Chitral.'),
    ('Bilal Ahmed', 4, 'Quality is great and delivery to Lahore took 3 days. Slightly pricey but worth it for this freshness.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Chitrali Walnuts%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Farida Bibi', 5, 'Clean giri with big halves — perfect for my winter panjiri. Will definitely reorder the 1kg pack.'),
    ('Usman Tariq', 5, 'No shell dust, no bitterness. You can tell these are hand-shelled. Highly recommended.'),
    ('Hamza Sheikh', 4, 'Very fresh kernels. I use them in brownies and they taste amazing. Fast dispatch too.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Premium Walnut Kernels%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Nadia Parveen', 5, 'Sweet and oily badam just like my grandmother used to bring from Chitral. Soaked overnight they peel beautifully.'),
    ('Imran Haider', 5, 'Genuine mamra type almonds, small but full of flavour. Kids love them with milk.'),
    ('Rabia Aslam', 4, 'Good quality, uniform size. Delivery was a day late but the freshness made up for it.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Sweet Chitrali Almonds%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Shah Zaman', 5, 'Asli chalghoza! Shells crack easily and kernels are long and fresh. Taste of my childhood in Gilgit.'),
    ('Mehwish Khan', 5, 'Expensive nut but this shop sells authentic quality. Much better than the stale chalghoza in local stores.'),
    ('Adnan Malik', 3, 'Taste is excellent but around 5% shells were empty. Seller responded well and offered compensation. Good service.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Chalghoza%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Gul Bano', 5, 'Soft, sweet khumani with no added sugar. My kids snack on these instead of candy now. Alhamdulillah.'),
    ('Tariq Mehmood', 5, 'Deep amber colour, perfectly dried. Made apricot chutney and it was superb.'),
    ('Hira Nawaz', 4, 'Very fresh and chewy. Wish the 250g pack was a little bigger for the price, but quality is top.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Dried Apricots%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Zubaida Khatoon', 5, 'Shahtoot exactly like from my village tree. Sweet, clean, no sand. Mixed in my morning porridge daily.'),
    ('Kamran Ali', 4, 'First time trying dried white mulberries — pleasantly sweet and crunchy. Good energy snack.'),
    ('Ayesha Siddiqui', 5, 'Amazing quality! Used them in sheer khurma on Eid and guests kept asking where I bought them.')
  ) AS v(name, rating, comment) ON p.title LIKE 'White Mulberries%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Shabana Aziz', 5, 'Plump soft anjeer, honey inside. Boiled in milk for my father-in-law, he loved it.'),
    ('Danish Raja', 4, 'Good figs, naturally sweet. A few were firmer than expected but overall great value.'),
    ('Mariam Yousaf', 5, 'Very fresh figs, no insects or dryness like bazaar ones. Sealed pack with proper weight.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Dried Figs%';

  INSERT INTO reviews (product_id, name, rating, comment)
  SELECT p.id, v.name, v.rating, v.comment
  FROM products p
  JOIN (VALUES
    ('Asad Mehmood', 5, 'Sent this gift box to my in-laws in Karachi — beautiful packing and everything inside was premium. 10/10.'),
    ('Fozia Rehman', 5, 'Bought for a shadi gift. The ribbon box looks expensive and the chalghoza inside was a big hit.'),
    ('Waqar Hussain', 4, 'Great variety in one box. Wish there was an option to customize quantities, but overall perfect gifting item.')
  ) AS v(name, rating, comment) ON p.title LIKE 'Chitral Royal Gift Box%';
END $$;
