import { client } from './client';

export interface AnalyticsData {
  views: Array<{ date: string; count: number }>;
  total: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  /** Traffic sources over the last 30 days (direct / qr / nfc / domain). */
  sources: Array<{ source: string; label: string; count: number }>;
  qrScans: { last30: number; total: number };
  clicks: {
    last30: number;
    total: number;
    items: Array<{ type: string; label: string; target: string; count: number }>;
  };
}

export const analyticsApi = {
  getViews: (cardId?: string) =>
    client.get<{ success: boolean; data: AnalyticsData }>('/analytics/views', {
      params: { cardId },
    }),
};
