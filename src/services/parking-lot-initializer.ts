import { firebaseParkingService } from './firebase-parking.service';

/**
 * Initialize parking lot with 40 pre-configured slots
 * Distribution:
 * - 10 EV charging slots
 * - 10 Covered slots
 * - 20 Regular slots
 */
export async function initializeParkingLot() {
  try {
    const existingSlots = await firebaseParkingService.getAllSlots();
    
    // Only initialize if no slots exist
    if (existingSlots.length > 0) {
      console.log('Parking lot already initialized with', existingSlots.length, 'slots');
      return { success: true, message: 'Already initialized', count: existingSlots.length };
    }

    console.log('Initializing 40 parking slots...');

    // Create 40 slots with specific distribution
    const slotsToCreate = [];

    for (let i = 1; i <= 40; i++) {
      let isCovered = false;
      let isEVCharging = false;

      // First 10 slots: EV Charging (slots 1-10)
      if (i <= 10) {
        isEVCharging = true;
      }
      // Next 10 slots: Covered (slots 11-20)
      else if (i <= 20) {
        isCovered = true;
      }
      // Remaining 20 slots: Regular (slots 21-40)

      slotsToCreate.push({
        isCovered,
        isEVCharging,
      });
    }

    // Add all slots to Firestore
    for (const slot of slotsToCreate) {
      await firebaseParkingService.addSlot(slot.isCovered, slot.isEVCharging);
    }

    console.log('✅ Successfully initialized 40 parking slots');
    return { 
      success: true, 
      message: '40 parking slots created (10 EV, 10 Covered, 20 Regular)',
      count: 40 
    };

  } catch (error) {
    console.error('Error initializing parking lot:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to initialize',
      count: 0 
    };
  }
}

/**
 * Reset parking lot (clear all slots)
 * Use with caution - this will delete all data
 */
export async function resetParkingLot() {
  console.warn('Reset functionality requires Firestore delete permissions');
  return { success: false, message: 'Manual reset required via Firebase Console' };
}
