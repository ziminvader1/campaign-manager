import { Campaign } from "./campaign";

export interface CampaignManagerConfig {
    campaigns: Campaign[];
    localStorageVariable?: string;
    overrideCampaignUrlParam: string
}

export interface CampaignDictionary {
    [key: string]: Campaign;
}

export class CampaignPath {
    constructor(public pathId: string, public description: string, public frequency: number) {}
}

export class CampaignPathInternal extends CampaignPath {
    public threshold?: number
}

export interface UserCampaignPathDictionary {
    [key: string]: string;
}