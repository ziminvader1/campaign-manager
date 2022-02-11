import { ClientStorageObject } from "./client-storage-object";

export class ClientStorageService {
    private localStorageKey: string;
    private localStorageValue: ClientStorageObject;

    constructor(
        private ourWindow: Window,
        localStorageKey?: string
    ) {
        this.localStorageKey = localStorageKey || 'campaignManager';

        if (this.ourWindow.localStorage && this.ourWindow.localStorage.length > 0) {
            try {
                this.localStorageValue = JSON.parse(ourWindow.localStorage.getItem(this.localStorageKey));
            } catch { // ignore it
            }
        }

        if (!this.localStorageValue || typeof this.localStorageValue === 'string') {
            this.localStorageValue = new ClientStorageObject();
        }
    }

    public resetStorage() {
        this.localStorageValue = new ClientStorageObject();
        this.saveStorage();
    }

    private saveStorage(): void {
        try {
            this.ourWindow.localStorage.setItem(this.localStorageKey, JSON.stringify(this.localStorageValue))
        } catch (e) {
            throw Error('unable to save the session');
        }
    }

    public getLocalStorage(): string {
        return JSON.stringify(this.localStorageValue);
    }

    get abCampaigns() {
        return this.localStorageValue.abCampaigns;
    }
    set abCampaigns(campaigns: string) {
        this.localStorageValue.abCampaigns = campaigns;
        this.saveStorage();
    }
}