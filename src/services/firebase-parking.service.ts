import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ParkingSlot, ParkVehicleRequest, ParkingAllocationResult } from '@/types/parking.types';

/**
 * Firebase-powered Service Layer for Parking Lot Business Logic
 * All data is persisted in Firestore for real-time synchronization
 */
export class FirebaseParkingService {
  private collectionName = 'parkingSlots';

  /**
   * Add a new parking slot to Firestore
   * Maximum 40 slots allowed (auto-initialized on startup)
   */
  async addSlot(isCovered: boolean, isEVCharging: boolean): Promise<ParkingSlot> {
    try {
      // Get current slots
      const slots = await this.getAllSlots();
      
      // Check if we've reached the maximum limit of 40 slots
      if (slots.length >= 40) {
        throw new Error('Maximum parking lot capacity (40 slots) reached');
      }
      
      // Get next slot number
      const nextSlotNumber = slots.length > 0 
        ? Math.max(...slots.map(s => s.slotNo)) + 1 
        : 1;

      // Calculate distance from entry (10 meters per slot number for simulation)
      const distanceFromEntry = nextSlotNumber * 10;

      const newSlot = {
        slotNo: nextSlotNumber,
        isCovered,
        isEVCharging,
        isOccupied: false,
        distanceFromEntry,
        vehicleNumber: null,
        occupiedAt: null,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.collectionName), newSlot);

      return {
        slotNo: nextSlotNumber,
        isCovered,
        isEVCharging,
        isOccupied: false,
        distanceFromEntry,
        vehicleNumber: null,
        occupiedAt: null,
      };
    } catch (error) {
      console.error('Error adding slot:', error);
      throw new Error('Failed to add parking slot');
    }
  }

  /**
   * Get all parking slots from Firestore
   */
  async getAllSlots(): Promise<ParkingSlot[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('slotNo', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          slotNo: data.slotNo as number,
          isCovered: data.isCovered as boolean,
          isEVCharging: data.isEVCharging as boolean,
          isOccupied: data.isOccupied as boolean,
          distanceFromEntry: data.distanceFromEntry as number | undefined,
          vehicleNumber: data.vehicleNumber as string | null | undefined,
          occupiedAt: data.occupiedAt ? data.occupiedAt.toDate().toISOString() : null,
        } as ParkingSlot & { id: string };
      });
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  }

  /**
   * Park a vehicle - Allocates the nearest available matching slot
   * Algorithm: Find the lowest distanceFromEntry that matches requirements
   */
  async parkVehicle(request: ParkVehicleRequest): Promise<ParkingAllocationResult> {
    try {
      const slots = await this.getAllSlots();

      // Find available slots that match requirements
      const matchingSlot = slots
        .filter(slot => {
          // Slot must not be occupied
          if (slot.isOccupied) return false;
          
          // If needs EV, slot must have EV charging
          if (request.needsEV && !slot.isEVCharging) return false;
          
          // If needs cover, slot must be covered
          if (request.needsCover && !slot.isCovered) return false;
          
          return true;
        })
        .sort((a, b) => {
          // Sort by distance from entry (nearest first)
          const distA = a.distanceFromEntry ?? a.slotNo * 10;
          const distB = b.distanceFromEntry ?? b.slotNo * 10;
          return distA - distB;
        })[0]; // Get nearest slot

      if (!matchingSlot) {
        return {
          success: false,
          message: 'No slot available',
        };
      }

      // Update slot as occupied in Firestore
      const slotWithId = matchingSlot as ParkingSlot & { id: string };
      const slotDoc = doc(db, this.collectionName, slotWithId.id);
      await updateDoc(slotDoc, {
        isOccupied: true,
        vehicleNumber: request.vehicleNumber,
        occupiedAt: Timestamp.now(),
      });

      return {
        success: true,
        slotNo: matchingSlot.slotNo,
        message: `Vehicle ${request.vehicleNumber} parked successfully in slot ${matchingSlot.slotNo}`,
      };
    } catch (error) {
      console.error('Error parking vehicle:', error);
      throw new Error('Failed to park vehicle');
    }
  }

  /**
   * Park a vehicle in a specific slot (for click-to-book)
   */
  async parkVehicleInSlot(slotNo: number, vehicleNumber: string): Promise<ParkingAllocationResult> {
    try {
      const slots = await this.getAllSlots();
      const slot = slots.find(s => s.slotNo === slotNo) as (ParkingSlot & { id: string }) | undefined;

      if (!slot) {
        return {
          success: false,
          message: `Slot ${slotNo} does not exist`,
        };
      }

      if (slot.isOccupied) {
        return {
          success: false,
          message: `Slot ${slotNo} is already occupied`,
        };
      }

      // Update slot as occupied
      const slotDoc = doc(db, this.collectionName, slot.id);
      await updateDoc(slotDoc, {
        isOccupied: true,
        vehicleNumber: vehicleNumber,
        occupiedAt: Timestamp.now(),
      });

      return {
        success: true,
        slotNo: slot.slotNo,
        message: `Vehicle ${vehicleNumber} parked in slot ${slotNo}`,
      };
    } catch (error) {
      console.error('Error parking vehicle in slot:', error);
      throw new Error('Failed to park vehicle');
    }
  }

  /**
   * Remove vehicle from a slot (free the slot)
   */
  async removeVehicle(slotNo: number): Promise<{ success: boolean; message: string }> {
    try {
      const slots = await this.getAllSlots();
      const slot = slots.find(s => s.slotNo === slotNo) as (ParkingSlot & { id: string }) | undefined;

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

      // Ensure slot has an ID from Firestore
      if (!slot.id) {
        throw new Error('Slot ID not found in database');
      }

      // Update slot as available in Firestore
      const slotDoc = doc(db, this.collectionName, slot.id);
      await updateDoc(slotDoc, {
        isOccupied: false,
        vehicleNumber: null,
        occupiedAt: null,
      });

      return {
        success: true,
        message: `Vehicle removed from slot ${slotNo}`,
      };
    } catch (error) {
      console.error('Error removing vehicle:', error);
      throw new Error('Failed to remove vehicle');
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const slots = await this.getAllSlots();
      const total = slots.length;
      const occupied = slots.filter(s => s.isOccupied).length;
      const available = total - occupied;
      const evSlots = slots.filter(s => s.isEVCharging).length;
      const coveredSlots = slots.filter(s => s.isCovered).length;

      return {
        total,
        occupied,
        available,
        evSlots,
        coveredSlots,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        total: 0,
        occupied: 0,
        available: 0,
        evSlots: 0,
        coveredSlots: 0,
        occupancyRate: 0,
      };
    }
  }
}

// Singleton instance for the application
export const firebaseParkingService = new FirebaseParkingService();
