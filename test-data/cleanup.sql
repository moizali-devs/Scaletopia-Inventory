-- Scaletopia visual test cleanup
-- Run in the Supabase SQL editor after you're done testing.
-- This removes every record created or updated during the visual import test.
-- Safe to run multiple times (idempotent).

-- Remove test companies (identified by their unique test domains)
DELETE FROM companies
WHERE domain IN (
  'stellar-glow-test.com',
  'apex-apparel-test.com',
  'breezy-home-test.com',
  'velocity-nutrition-test.com',
  'luna-pet-test.com',
  'craft-cork-test.com',
  'summit-outdoor-test.com',
  'radiant-kids-test.com',
  'nova-tech-test.com',
  'harbor-coffee-test.com',
  'bloom-wellness-test.com'
);

-- Remove the import_history rows for these test runs
-- (matches on the __test__ tag you entered during import)
DELETE FROM import_history
WHERE tags @> ARRAY['__test__'];
