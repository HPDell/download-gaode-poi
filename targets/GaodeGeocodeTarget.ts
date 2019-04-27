export interface GaodeGeocodeTarget {
    addresses: GeocodeAddress[];
    fieldAddress: string;
    fieldOid: string;
}

export interface GeocodeAddress {
    id: string;
    address: string;
    city?: string;
}