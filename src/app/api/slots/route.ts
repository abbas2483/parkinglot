import { NextRequest, NextResponse } from 'next/server';
import { firebaseParkingService } from '@/services/firebase-parking.service';

/**
 * GET /api/slots - Get all parking slots from Firebase
 */
export async function GET() {
  try {
    const slots = await firebaseParkingService.getAllSlots();
    return NextResponse.json({
      status: 'success',
      data: slots,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch slots',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/slots - Add a new parking slot to Firebase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isCovered, isEVCharging } = body;

    // Validation
    if (typeof isCovered !== 'boolean' || typeof isEVCharging !== 'boolean') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input: isCovered and isEVCharging must be boolean',
        },
        { status: 400 }
      );
    }

    const newSlot = await firebaseParkingService.addSlot(isCovered, isEVCharging);

    return NextResponse.json(
      {
        status: 'success',
        message: 'Parking slot added successfully',
        data: newSlot,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to add slot',
      },
      { status: 500 }
    );
  }
}
