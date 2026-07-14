// env.ts import edildiğinde zorunlu değişkenler eksikse process.exit(1) çağırır.
// Testlerde gerçek bir DB/OAuth gerekmediği için minimum geçerli env'i sağlıyoruz.
process.env.DATABASE_URL ??= 'mysql://test:test@localhost:3306/test_db';
process.env.PUBLIC_BASE_URL ??= 'http://localhost:5173';
process.env.ADMIN_GITHUB_USERNAME ??= 'testuser';
process.env.GITHUB_CLIENT_ID ??= 'test-client-id';
process.env.GITHUB_CLIENT_SECRET ??= 'test-client-secret';
process.env.GITHUB_REDIRECT_URL ??= 'http://localhost:3000/api/auth/github/callback';
process.env.NODE_ENV ??= 'test';
