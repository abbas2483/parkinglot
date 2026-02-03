import { NextRequest, NextResponse } from 'next/server';
import { firebaseParkingService } from '@/services/firebase-parking.service';

/**
 * POST /api/park - Park a vehicle using Firebase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { needsEV, needsCover, vehicleNumber, slotNo } = body;

    // Validation
    if (!vehicleNumber || typeof vehicleNumber !== 'string' || !vehicleNumber.trim()) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input: vehicleNumber is required',
        },
        { status: 400 }
      );
    }

    // If specific slot requested (click-to-book)
    if (slotNo && typeof slotNo === 'number') {
      const result = await firebaseParkingService.parkVehicleInSlot(slotNo, vehicleNumber.trim());
      return NextResponse.json({
        status: result.success ? 'success' : 'error',
        message: result.message,
        data: result.success ? { slotNo: result.slotNo } : null,
      }, { status: result.success ? 200 : 404 });
    }

    // Otherwise, auto-allocate based on requirements
    if (typeof needsEV !== 'boolean' || typeof needsCover !== 'boolean') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input: needsEV and needsCover must be boolean',
        },
        { status: 400 }
      );
    }

    const result = await firebaseParkingService.parkVehicle({ 
      needsEV, 
      needsCover, 
      vehicleNumber: vehicleNumber.trim() 
    });

    return NextResponse.json({
      status: result.success ? 'success' : 'error',
      message: result.message,
      data: result.success ? { slotNo: result.slotNo } : null,
    }, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to park vehicle',
      },
      { status: 500 }
    );
  }
}
