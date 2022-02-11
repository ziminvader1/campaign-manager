import { ClientStorageService } from "./client-storage.service";
import { UserCampaignPathDictionary, CampaignDictionary, CampaignManagerConfig } from "./types";

export class CampaignManager {
    private userCampaigns: UserCampaignPathDictionary = {};
    private campaignDictionary: CampaignDictionary;
    private storage: ClientStorageService;
    private overrideCampaignUrlParam: string;

    constructor(
        private config: CampaignManagerConfig,
        private ourWindow: Window = undefined,
        private ourConsole: Console = undefined
    ) {
        if (!this.ourWindow) {
            this.ourWindow = window;
        }
        if (!this.ourConsole) {
            this.ourConsole = console;
        }
        this.validateConfig(config);

        this.storage = new ClientStorageService(this.ourWindow, config.localStorageVariable);
        this.overrideCampaignUrlParam = config.overrideCampaignUrlParam;

        this.campaignDictionary = {};
        this.config.campaigns
            .forEach(c => {
                this.campaignDictionary[c.id] = c;
            });

        const campaignDictionaryFromStorage = this.campaignStringToDictionary(this.storage.abCampaigns);
        this.addUserToCampaignPaths(campaignDictionaryFromStorage);

        this.assignFromUrlIfPresent();
    }

    public getOrSetPathId(campaignId: string, pathId?: string): string {
        this.assignPathIfNotSet(campaignId, pathId);
        return this.userCampaigns[campaignId] as string;
    }

    public getPathId(campaignId: string): string {
        return this.userCampaigns[campaignId];
    }

    public setPathId(campaignId: string, pathId: string): void {
        this.addUserToCampaignPaths({[campaignId]: pathId});
    }

    public getCampaignPathsAsString(): string {
        return Object.keys(this.userCampaigns)
            .map(k => `${k}:${this.userCampaigns[k]}`)
            .join(',');
    }

    private validateConfig(config: CampaignManagerConfig): void {
        if (!config.campaigns) {
            throw Error('Campaigns must be specified');
        }

        if (!config.localStorageVariable) {
            throw Error('Local storage variable must be specified');
        }

        if (!config.overrideCampaignUrlParam) {
            throw Error('Override campaign URL param must be specified');
        }
    }

    private assignPathIfNotSet(campaignId: string, pathId?: string): string {
        if (campaignId in this.userCampaigns) {
            return this.userCampaigns[campaignId];
        }

        if (!(campaignId in this.campaignDictionary)) {
            if (!pathId) {
                console.warn(`No pathId was provided for current campaignId ${campaignId}`);
            }
            this.setPathId(campaignId, pathId);
            return null;
        }

        if (!pathId) {
            pathId = this.campaignDictionary[campaignId].pickCampaignPath();
        }
        this.userCampaigns[campaignId] = pathId;
        const newUserCampaignPath: UserCampaignPathDictionary = {};
        this.addUserToCampaignPaths(newUserCampaignPath);
        return pathId;
    }

    private setCampaignPathsFromString(pathsString: string): void {
        let campaignDictionary = this.campaignStringToDictionary(pathsString);
        this.addUserToCampaignPaths(campaignDictionary);
    }

    private addUserToCampaignPaths(userCampaignPaths: UserCampaignPathDictionary): void {
        if (!userCampaignPaths) {
            return;
        }

        this.userCampaigns = {...this.userCampaigns, ...userCampaignPaths};
        this.storage.abCampaigns = this.getCampaignPathsAsString();
    }

    private campaignStringToDictionary(campaignString: string): UserCampaignPathDictionary {
        if (!campaignString) {
            return null;
        }

        return campaignString.split(',')
            .reduce((campaigns, segment) => {
                const [key, path] = segment.split(':');

                if (key) {
                    campaigns[key] = path;
                }

                return campaigns
            }, {} as UserCampaignPathDictionary);
    }

    private assignFromUrlIfPresent(): void {
        if (!this.ourWindow.location.search) {
            return;
        }

        const results = new RegExp('[\?$]' + this.overrideCampaignUrlParam + '=([^&#]*)').exec(this.ourWindow.location.search);
        if (results === null) {
            return;
        }

        const campaigns = decodeURI(results[1]);
        if (!campaigns) {
            return;
        }

        this.setCampaignPathsFromString(campaigns);
    }
}