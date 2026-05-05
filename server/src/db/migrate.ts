import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import { env } from '../lib/env.js';

// Veritabanı adını URL'den ayır, yoksa otomatik oluştur
const url = new URL(env.DATABASE_URL);
const db_name = url.pathname.replace(/^\//, '');

if (!db_name) {
	throw new Error('DATABASE_URL içinde veritabanı adı yok.');
}

// 1) DB belirtmeden bağlan, IF NOT EXISTS ile oluştur
const admin_url = new URL(env.DATABASE_URL);
admin_url.pathname = '';
const admin_conn = await mysql.createConnection(admin_url.toString());
console.log(`→ Ensuring database "${db_name}" exists...`);
await admin_conn.query(
	`CREATE DATABASE IF NOT EXISTS \`${db_name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
);
await admin_conn.end();
console.log('✓ Database ready.');

// 2) Şimdi normal migration
const connection = await mysql.createConnection(env.DATABASE_URL);
const db = drizzle(connection);

console.log('→ Applying migrations...');
await migrate(db, { migrationsFolder: './src/db/migrations' });
console.log('✓ Migrations applied.');

await connection.end();
