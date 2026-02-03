import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format slot number with leading zeros
 */
export function formatSlotNumber(slotNo: number): string {
  return `#${slotNo.toString().padStart(2, '0')}`;
}

/**
 * Get color based on occupancy status
 */
export function getStatusColor(isOccupied: boolean): {
  bg: string;
  border: string;
  text: string;
} {
  return isOccupied
    ? { bg: 'bg-red-600/20', border: 'border-red-500/50', text: 'text-red-400' }
    : { bg: 'bg-green-600/20', border: 'border-green-500/50', text: 'text-green-400' };
}
