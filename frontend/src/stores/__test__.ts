// Simple verification file to test store imports
// This file can be deleted after verification

import { useStaffStore } from './staffStore';
import { usePOSStore } from './posStore';

// Test that stores can be imported and accessed
export const verifyStores = () => {
  console.log('✅ Stores imported successfully');

  // Test staffStore
  const staffState = useStaffStore.getState();
  console.log('✅ Staff Store - Tables count:', staffState.tables.length);
  console.log('✅ Staff Store - Orders count:', staffState.orders.length);
  console.log('✅ Staff Store - Popular dishes count:', staffState.popularDishes.length);

  // Test posStore
  const posState = usePOSStore.getState();
  console.log('✅ POS Store - Menu categories count:', posState.menus.length);
  console.log('✅ POS Store - Cart items:', posState.cart.length);

  return true;
};
