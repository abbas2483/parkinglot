// Core parking slot types
export interface ParkingSlot {
  slotNo: number;
  isCovered: boolean;
  isEVCharging: boolean;
  isOccupied: boolean;
  distanceFromEntry?: number; // Distance in meters for nearest-slot allocation
  vehicleNumber?: string | null; // Vehicle registration number
  occupiedAt?: string | null; // ISO timestamp when vehicle was parked
}

export interface ParkVehicleRequest {
  needsEV: boolean;
  needsCover: boolean;
  vehicleNumber: string; // Vehicle registration number
}

export interface ParkingAllocationResult {
  success: boolean;
  slotNo?: number;
  message: string;
}

export interface AddSlotRequest {
  isCovered: boolean;
  isEVCharging: boolean;
}
