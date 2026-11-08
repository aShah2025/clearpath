// Placeholder config so modules that validate env can load. Tests never reach
// Supabase or Anthropic: the Claude client is always a fake.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.ANTHROPIC_API_KEY ??= "test-key";

// Database tests run only against TEST_DATABASE_URL, never DATABASE_URL, so a
// test run can't touch a real database by accident.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else {
  process.env.DATABASE_URL = "postgresql://unused:unused@localhost:1/unused";
}
