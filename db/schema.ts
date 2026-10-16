// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const reports=sqliteTable('reports',{
 id:text('id').primaryKey(), shop:text('shop').notNull(), device:text('device').notNull(), crowd:integer('crowd').notNull(), wait:integer('wait'), people:integer('people'), service:text('service').notNull(), created:integer('created').notNull(), slot:integer('slot').notNull()
},t=>[index('shop_time').on(t.shop,t.created),uniqueIndex('device_shop_slot').on(t.device,t.shop,t.slot)]);
export const suggestions=sqliteTable('suggestions',{
 id:text('id').primaryKey(),name:text('name').notNull(),area:text('area').notNull(),details:text('details').notNull(),lat:text('lat').notNull(),lng:text('lng').notNull(),device:text('device').notNull(),created:integer('created').notNull(),slot:integer('slot').notNull()
},t=>[uniqueIndex('device_suggestion_slot').on(t.device,t.slot)]);
