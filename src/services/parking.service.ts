import { ParkingSlot, ParkVehicleRequest, ParkingAllocationResult } from '@/types/parking.types';

/**
 * Service Layer for Parking Lot Business Logic
 * Follows layered architecture pattern from nodejs-backend-patterns skill
 */
export class ParkingService {
  private slots: ParkingSlot[] = [];
  private nextSlotNumber = 1;

  /**
   * Add a new parking slot
   */
  addSlot(isCovered: boolean, isEVCharging: boolean): ParkingSlot {
    const newSlot: ParkingSlot = {
      slotNo: this.nextSlotNumber++,
      isCovered,
      isEVCharging,
      isOccupied: false,
    };
    
    this.slots.push(newSlot);
    return newSlot;
  }

  /**
   * Get all parking slots
   */
  getAllSlots(): ParkingSlot[] {
    return [...this.slots];
  }

  /**
   * Park a vehicle - Allocates the nearest available matching slot
   * Algorithm: Find the lowest slot number that matches requirements
   */
  parkVehicle(request: ParkVehicleRequest): ParkingAllocationResult {
    // Find available slots that match requirements
    const matchingSlot = this.slots
      .filter(slot => {
        // Slot must not be occupied
        if (slot.isOccupied) return false;
        
        // If needs EV, slot must have EV charging
        if (request.needsEV && !slot.isEVCharging) return false;
        
        // If needs cover, slot must be covered
        if (request.needsCover && !slot.isCovered) return false;
        
        return true;
      })
      .sort((a, b) => a.slotNo - b.slotNo)[0]; // Get nearest (lowest slot number)

    if (!matchingSlot) {
      return {
        success: false,
        message: 'No slot available',
      };
    }

    // Occupy the slot
    matchingSlot.isOccupied = true;

    return {
      success: true,
      slotNo: matchingSlot.slotNo,
      message: `Vehicle parked successfully in slot ${matchingSlot.slotNo}`,
    };
  }

  /**
   * Remove vehicle from a slot (free the slot)
   */
  removeVehicle(slotNo: number): { success: boolean; message: string } {
    const slot = this.slots.find(s => s.slotNo === slotNo);

    if (!slot) {
      return {
        success: false,
        message: `Slot ${slotNo} does not exist`,
      };
    }

    if (!slot.isOccupied) {
      return {
        success: false,
        message: `Slot ${slotNo} is already empty`,
      };
    }

    slot.isOccupied = false;

    return {
      success: true,
      message: `Vehicle removed from slot ${slotNo}`,
    };
  }

  /**
   * Get slot by number
   */
  getSlot(slotNo: number): ParkingSlot | undefined {
    return this.slots.find(s => s.slotNo === slotNo);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.slots.length;
    const occupied = this.slots.filter(s => s.isOccupied).length;
    const available = total - occupied;
    const evSlots = this.slots.filter(s => s.isEVCharging).length;
    const coveredSlots = this.slots.filter(s => s.isCovered).length;

    return {
      total,
      occupied,
      available,
      evSlots,
      coveredSlots,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }

  /**
   * Clear all slots (for testing/reset)
   */
  clearAllSlots(): void {
    this.slots = [];
    this.nextSlotNumber = 1;
  }
}

// Singleton instance for the application
export const parkingService = new ParkingService();
