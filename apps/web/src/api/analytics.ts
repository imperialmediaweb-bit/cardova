import { client } from './client';

export interface AnalyticsData {
  views: Array<{ date: string; count: number }>;
  total: number;
  topReferrers: Array<{ referrer: string; count: number }>;
}

export const analyticsApi = {
  getViews: (cardId?: string) =>
    client.get<{ success: boolean; data: AnalyticsData }>('/analytics/views', {
      params: { cardId },
    }),
};
