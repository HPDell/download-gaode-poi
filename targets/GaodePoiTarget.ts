export interface GaodePoiTarget {
    city: string;
    types: TargetType[]
}

interface TargetType {
    name?: string;
    id?: string;
}