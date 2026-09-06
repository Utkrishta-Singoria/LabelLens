import { pgTable, text, serial, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('consumer'),
  governmentId: text('government_id'),
  department: text('department'),
  passwordHash: text('password_hash'),
  scannedHistoryTable: text('scanned_history_table'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inspections = pgTable('inspections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name'),
  userRole: text('user_role'),
  governmentId: text('government_id'),
  productName: text('product_name').notNull(),
  category: text('category').notNull(),
  complianceScore: integer('compliance_score').notNull().default(0),
  complianceStatus: text('compliance_status').notNull().default('NON_COMPLIANT'),
  enforcementAction: text('enforcement_action').notNull().default('NOTICE_ISSUED'),
  inspectorRemarks: text('inspector_remarks'),
  timestamp: text('timestamp'),
  imageUrls: text('image_urls'),
  extractedData: text('extracted_data'),
  violations: text('violations'),
  barcodeNumber: text('barcode_number'),
  isEdited: boolean('is_edited').default(false),
  lastEditedAt: text('last_edited_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  inspections: many(inspections),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  user: one(users, {
    fields: [inspections.userId],
    references: [users.uid],
  }),
}));
