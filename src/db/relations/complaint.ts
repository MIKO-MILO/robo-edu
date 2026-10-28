import { relations } from "drizzle-orm";
import { complaints, complaintAttachments, orderItems, users } from "../schema";

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  orderItem: one(orderItems, { fields: [complaints.orderItemId], references: [orderItems.id] }),
  user: one(users, { fields: [complaints.userId], references: [users.id] }),
  attachments: many(complaintAttachments),
}));

export const complaintAttachmentsRelations = relations(complaintAttachments, ({ one }) => ({
  complaint: one(complaints, { fields: [complaintAttachments.complaintId], references: [complaints.id] }),
}));
