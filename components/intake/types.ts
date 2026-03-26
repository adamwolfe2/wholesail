export type Step1Data = {
  companyName: string;
  shortName: string;
  website: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  role: string;
  revenue: string;
  targetDomain: string;
  goLiveTimeline: string;
};

export type Step2Data = {
  industry: string;
  productCategories: string;
  skuCount: string;
  coldChain: string;
  currentOrdering: string[];
  activeClients: string;
  avgOrderValue: string;
  paymentTerms: string[];
  deliveryCoverage: string;
  minimumOrderValue: string;
};

export type Step3Data = {
  features: string[];
  primaryColor: string;
  hasBrandGuidelines: string;
  additionalNotes: string;
  logoUrl: string;
  brandSecondaryColor: string;
  inspirationUrls: string[];
};
