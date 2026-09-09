/**
 * midtrans.d.ts
 * Type declarations for the Midtrans Snap.js browser SDK.
 * Loaded via <Script src="...snap.js" data-client-key="..."> in app/layout.tsx.
 */

interface SnapCallbacks {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

interface SnapResult {
  order_id: string;
  payment_type?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  gross_amount?: string;
  [key: string]: unknown;
}

interface Snap {
  pay: (snapToken: string, callbacks?: SnapCallbacks) => void;
  hide: () => void;
}

interface Window {
  snap?: Snap;
}
