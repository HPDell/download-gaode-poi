export interface DownloadGaodeTarget {
    city: string;
    types: TargetType[]
}

interface TargetType {
    name?: string;
    id?: string;
}