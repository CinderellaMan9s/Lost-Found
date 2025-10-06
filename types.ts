
export enum ItemReportType {
  LOST = 'Lost',
  FOUND = 'Found',
}

export enum AppView {
  FORM = 'form',
  MATCHING = 'matching',
  HISTORY = 'history',
}

export interface ItemFeatures {
  itemName: string;
  primaryColor: string;
  category: string;
  brand: string;
  distinguishingFeatures: string[];
}

export interface Item {
  id: string;
  reportType: ItemReportType;
  description: string;
  location: string;
  imageBase64: string;
  imageMimeType: string;
  features: ItemFeatures;
  timestamp: number;
}

export interface Match extends Item {
  matchScore: number;
  reasoning: string;
}
