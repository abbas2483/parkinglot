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
 * 🎯 Firebase-Powered Parking Service
 * 
 * Think of this as the brain of our parking system! This service talks to Firebase
 * (Google's cloud database) to save and retrieve parking data. Everything you do -
 * booking a spot, leaving a spot, checking availability - goes through here.
 * 
 * Why Firebase? Because it's like having a super-reliable assistant who never forgets,
 * works 24/7, and keeps everything in sync across all devices in real-time! 
 */
export class FirebaseParkingService {
  private collectionName = 'parkingSlots';

  /**
   * 📝 Add a New Parking Slot
   * 
   * Creates a brand new parking spot in our system. We limit it to 40 slots max
   * (like a real parking lot!). Each slot gets a number, distance from entrance,
   * and whatever special features you want (covered, EV charging, or just regular).
   * 
   * @param isCovered - Does this spot have a roof? (protects from rain/sun)
   * @param isEVCharging - Can electric cars charge here?
   * @returns The newly created parking slot with all its details
   */
  async addSlot(isCovered: boolean, isEVCharging: boolean): Promise<ParkingSlot> {
    try {
      // First, let's see how many spots we already have
      const slots = await this.getAllSlots();
      
      // Safety check: Can't have more than 40 spots (our parking lot is only so big!)
      if (slots.length >= 40) {
        throw new Error('Maximum parking lot capacity (40 slots) reached');
      }
      
      // Figure out what number this new slot should be (1, 2, 3... up to 40)
      const nextSlotNumber = slots.length > 0 
        ? Math.max(...slots.map(s => s.slotNo)) + 1 
        : 1;

      // Calculate how far this spot is from the entrance
      // We're simulating 10 meters between each slot number
      // So slot 1 = 10m, slot 2 = 20m, etc. (closer slots have lower numbers!)
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
   * 🚗 Park a Vehicle - The Smart Way!
   * 
   * This is where the magic happens! You tell us what you need (EV charging? Covered spot?)
   * and we find you the NEAREST available slot that matches. No more driving around!
   * 
   * How we do it:
   * 1. Look at all empty (available) spots
   * 2. Filter out spots that don't have what you need
   * 3. Sort by distance from entrance (closer = better!)
   * 4. Pick the first one - that's your spot!
   * 5. Mark it as occupied with your vehicle number
   * 
   * @param request - What you need (EV? Covered? Your vehicle number)
   * @returns Success message with your slot number, or error if no match found
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
