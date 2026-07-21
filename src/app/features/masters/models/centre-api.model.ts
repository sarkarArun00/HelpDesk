export interface CentreApi {
    id: number;
    centreCode: string;
    centreName: string;
}

export interface GetCentresResponse {
    success: boolean;
    message: string;
    data: CentreApi[];
}