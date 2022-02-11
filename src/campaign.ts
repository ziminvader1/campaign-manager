import { CampaignPath, CampaignPathInternal } from "./types";

export class Campaign {
    public constructor(
        id: string,
        description: string,
        paths: CampaignPath[]
    ) {
        this.id = id;
        this.description = description;
        this.updatePaths(paths);
    }

    public id: string;
    public description: string;
    public pathsDictionary: {
        [key: string]: CampaignPathInternal;
    }
    private frequencySum: number;
    private defaultPathId?: string;

    private updatePaths(paths: CampaignPathInternal[]): void {
        this.frequencySum = 0;
        this.pathsDictionary = {};
        this.defaultPathId = null;
        if (!paths) {
            return;
        }
        paths.forEach((path: CampaignPathInternal) => {
            this.frequencySum += path.frequency;
            path.threshold = this.frequencySum;
            this.pathsDictionary[path.pathId] = path;
            if (!this.defaultPathId) {
                this.defaultPathId = path.pathId;
            }
        });
    }

    public pickCampaignPath(): string {
        const selection = Math.floor(Math.random() * this.frequencySum);
        const pathIds = Object.keys(this.pathsDictionary);
        let i: number;
        for(i = 0; i < pathIds.length; i++) {
            let pathId = pathIds[i] as string;
            if (this.pathsDictionary[pathId] &&
            this.pathsDictionary[pathId].frequency !== 0 &&
            selection < this.pathsDictionary[pathId].threshold) {
                return pathId;
            }
        }
        return this.defaultPathId;
    }
}