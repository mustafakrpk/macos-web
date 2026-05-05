import { sql } from 'drizzle-orm';
import {
	boolean,
	datetime,
	int,
	json,
	mysqlTable,
	text,
	varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int('id').primaryKey().autoincrement(),
	github_id: varchar('github_id', { length: 64 }).notNull().unique(),
	username: varchar('username', { length: 64 }).notNull(),
	avatar_url: text('avatar_url'),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = mysqlTable('sessions', {
	id: varchar('id', { length: 128 }).primaryKey(),
	user_id: int('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires_at: datetime('expires_at').notNull(),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const about = mysqlTable('about', {
	id: int('id').primaryKey(),
	full_name: varchar('full_name', { length: 128 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	intro_md: text('intro_md').notNull(),
	avatar_url: varchar('avatar_url', { length: 512 }),
	email: varchar('email', { length: 255 }),
	github_url: varchar('github_url', { length: 512 }),
	linkedin_url: varchar('linkedin_url', { length: 512 }),
	location: varchar('location', { length: 128 }),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const projects = mysqlTable('projects', {
	id: int('id').primaryKey().autoincrement(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description').notNull(),
	stack: json('stack').$type<string[]>().notNull(),
	github_url: varchar('github_url', { length: 512 }),
	live_url: varchar('live_url', { length: 512 }),
	image_url: varchar('image_url', { length: 512 }),
	gradient: varchar('gradient', { length: 255 }).notNull(),
	emoji: varchar('emoji', { length: 8 }).notNull(),
	display_order: int('display_order').notNull().default(0),
	is_published: boolean('is_published').notNull().default(true),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const experiences = mysqlTable('experiences', {
	id: int('id').primaryKey().autoincrement(),
	title: varchar('title', { length: 255 }).notNull(),
	company: varchar('company', { length: 255 }).notNull(),
	period_start: varchar('period_start', { length: 32 }).notNull(),
	period_end: varchar('period_end', { length: 32 }),
	description: text('description'),
	display_order: int('display_order').notNull().default(0),
});

export const education = mysqlTable('education', {
	id: int('id').primaryKey().autoincrement(),
	degree: varchar('degree', { length: 255 }).notNull(),
	school: varchar('school', { length: 255 }).notNull(),
	period_start: varchar('period_start', { length: 32 }).notNull(),
	period_end: varchar('period_end', { length: 32 }),
	display_order: int('display_order').notNull().default(0),
});

export const skill_categories = mysqlTable('skill_categories', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 64 }).notNull(),
	items: json('items').$type<string[]>().notNull(),
	display_order: int('display_order').notNull().default(0),
});

export const languages = mysqlTable('languages', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 64 }).notNull(),
	level: varchar('level', { length: 64 }).notNull(),
	display_order: int('display_order').notNull().default(0),
});

export const cv_meta = mysqlTable('cv_meta', {
	id: int('id').primaryKey(),
	pdf_url: varchar('pdf_url', { length: 512 }),
});

export const contact_messages = mysqlTable('contact_messages', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	message: text('message').notNull(),
	is_read: boolean('is_read').notNull().default(false),
	ip: varchar('ip', { length: 64 }),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const uploads = mysqlTable('uploads', {
	id: int('id').primaryKey().autoincrement(),
	filename: varchar('filename', { length: 255 }).notNull(),
	path: varchar('path', { length: 512 }).notNull(),
	mimetype: varchar('mimetype', { length: 128 }).notNull(),
	size_bytes: int('size_bytes').notNull(),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type About = typeof about.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type Education = typeof education.$inferSelect;
export type SkillCategory = typeof skill_categories.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type ContactMessage = typeof contact_messages.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
