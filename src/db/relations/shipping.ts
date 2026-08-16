import { relations } from "drizzle-orm";
import { shippingProviders, shipments, shipmentTrackings, orders } from "../schema";

export const shippingProvidersRelations = relations(shippingProviders, ({ many }) => ({
  shipments: many(shipments),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  order: one(orders, { fields: [shipments.orderId], references: [orders.id] }),
  shippingProvider: one(shippingProviders, { fields: [shipments.shippingProviderId], references: [shippingProviders.id] }),
  trackings: many(shipmentTrackings),
}));

export const shipmentTrackingsRelations = relations(shipmentTrackings, ({ one }) => ({
  shipment: one(shipments, { fields: [shipmentTrackings.shipmentId], references: [shipments.id] }),
}));
