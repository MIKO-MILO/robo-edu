/**
 * Barrel exports — components/admin/complaints
 *
 * Import komponen dari sini:
 *   import { ComplaintTable, ComplaintFilters } from "@/components/admin/complaints";
 */

// Types
export type {
  AdminComplaintRow,
  AdminComplaintDetail,
  AdminComplaintAttachment,
  ComplaintStats,
} from "./complaint-list-types";
export { COMPLAINT_STATUS_TABS } from "./complaint-list-types";

// Mock data helpers (hapus saat backend siap)
export {
  MOCK_ADMIN_COMPLAINTS,
  getMockComplaintDetail,
  getComplaintStats,
} from "./mock-data";

// Atoms / Molecules
export { ComplaintStatsGrid } from "./complaint-stats";
export type { ComplaintStatsGridProps } from "./complaint-stats";

export { ComplaintFilters } from "./complaint-filters";
export type { ComplaintFiltersProps } from "./complaint-filters";

export { ComplaintDetailHeader } from "./complaint-detail-header";
export type { ComplaintDetailHeaderProps } from "./complaint-detail-header";

export { ComplaintOrderInfoCard } from "./complaint-order-info-card";
export type { ComplaintOrderInfoCardProps } from "./complaint-order-info-card";

export { ComplaintCustomerCard } from "./complaint-customer-card";
export type { ComplaintCustomerCardProps } from "./complaint-customer-card";

export { ComplaintDescriptionCard } from "./complaint-description-card";
export type { ComplaintDescriptionCardProps } from "./complaint-description-card";

// Organisms
export { ComplaintTable } from "./complaint-table";
export type { ComplaintTableProps } from "./complaint-table";

export { ComplaintAttachmentGallery, deriveMediaType } from "./complaint-attachment-gallery";
export type { ComplaintAttachmentGalleryProps } from "./complaint-attachment-gallery";

export { ComplaintActionPanel } from "./complaint-action-panel";
export type { ComplaintActionPanelProps } from "./complaint-action-panel";
