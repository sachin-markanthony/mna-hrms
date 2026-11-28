export type AssetType = 'LAPTOP' | 'MOUSE' | 'KEYBOARD' | 'SIM_CARD' | 'OTHER';

export type AssetStatus = 'ASSIGNED' | 'RETURNED' | 'DAMAGED' | 'LOST';

export interface AssetAssignment {
  id: string;
  assetTag: string;
  assetType: AssetType;
  reportDate: string;
  userId?: string | null;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  contactNumber: string;
  laptopBrand: string;
  model: string;
  serialNumber: string;
  chargerReceived: boolean;
  mouseReceived: boolean;
  keyboardReceived: boolean;
  simCardReceived: boolean;
  simCardNumber?: string | null;
  collectedAt: string;
  employeeSignature?: string | null;
  employeeSignedDate?: string | null;
  authorizedRepresentative?: string | null;
  authorizedSignedDate?: string | null;
  status: AssetStatus;
  returnedAt?: string | null;
  returnNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetPayload {
  assetType?: AssetType;
  reportDate: string;
  userId?: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  contactNumber: string;
  laptopBrand: string;
  model: string;
  serialNumber: string;
  chargerReceived: boolean;
  mouseReceived: boolean;
  keyboardReceived: boolean;
  simCardReceived: boolean;
  simCardNumber?: string | null;
  collectedAt: string;
  employeeSignature?: string;
  employeeSignedDate?: string;
  authorizedRepresentative?: string;
  authorizedSignedDate?: string;
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {
  status?: AssetStatus;
  returnedAt?: string;
  returnNotes?: string;
}
