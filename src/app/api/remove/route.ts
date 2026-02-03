import { NextRequest, NextResponse } from 'next/server';
import { firebaseParkingService } from '@/services/firebase-parking.service';

/**
 * POST /api/remove - Remove vehicle from a slot using Firebase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotNo } = body;

    // Validation
    if (typeof slotNo !== 'number' || slotNo <= 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input: slotNo must be a positive number',
        },
        { status: 400 }
      );
    }

    const result = await firebaseParkingService.removeVehicle(slotNo);

    return NextResponse.json({
      status: result.success ? 'success' : 'error',
      message: result.message,
    }, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to remove vehicle',
      },
      { status: 500 }
    );
  }
}
