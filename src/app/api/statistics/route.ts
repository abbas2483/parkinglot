import { NextResponse } from 'next/server';
import { firebaseParkingService } from '@/services/firebase-parking.service';

/**
 * GET /api/statistics - Get parking lot statistics from Firebase
 */
export async function GET() {
  try {
    const stats = await firebaseParkingService.getStatistics();
    return NextResponse.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
