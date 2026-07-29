export interface RecordCount {
    totalRecords: number;
    activeRecords: number;
    inactiveRecords: number;
}

export interface ConfigurationCountData {
    centreCount: RecordCount;
    ticketCategoryCount: RecordCount;
    employeeCount: RecordCount
}

export interface ConfigurationCountResponse {
    success: boolean;
    message: string;
    data: ConfigurationCountData;
}