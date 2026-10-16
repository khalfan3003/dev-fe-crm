export interface Organization {
  id?: number;
  name: string;
  registrationNumber?: string;
}

export interface BackendStatus {
  connected: boolean;
  message: string;
  checkedAt?: Date;
  latencyMs?: number;
}
