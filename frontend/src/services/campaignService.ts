import apiClient from './apiClient';

export type CampaignStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE';

export type Platform =
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'LINKEDIN'
  | 'X'
  | 'OTHER';

export type ContentType =
  | 'REEL'
  | 'POST'
  | 'STORY'
  | 'SHORT'
  | 'VIDEO'
  | 'OTHER';

export interface Campaign {
  id: number;
  brandName: string;
  campaignName: string;
  platform: Platform;
  customPlatform?: string | null;
  contentType: ContentType;
  customContentType?: string | null;
  deadline: string;
  amount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  paymentStatus: PaymentStatus;
  paymentDueDate?: string | null;
  paymentReceivedDate?: string | null;
  campaignStatus: CampaignStatus;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Campaign[];
}

export interface CreateCampaignData {
  brandName: string;
  campaignName: string;
  platform: string;
  contentType: string;
  deadline: string;
  amount: number;
  priority?: string;
  paymentStatus?: string;
  campaignStatus?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

export type UpdateCampaignData = Partial<CreateCampaignData>;

const campaignService = {
  list: (): Promise<CampaignListResponse> => {
    return apiClient.get<CampaignListResponse>('/api/campaigns');
  },

  get: (id: number): Promise<Campaign> => {
    return apiClient.get<Campaign>(`/api/campaigns/${id}`);
  },

  create: (data: CreateCampaignData): Promise<Campaign> => {
    return apiClient.post<Campaign>('/api/campaigns', data);
  },

  update: (id: number, data: UpdateCampaignData): Promise<Campaign> => {
    return apiClient.put<Campaign>(`/api/campaigns/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/campaigns/${id}`);
  },
};

export default campaignService;