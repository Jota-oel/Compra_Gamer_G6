import { useContext } from 'react';
import { CartContext } from '../context/CartContext.js';

export function useCart() {
  const value = useContext(CartContext);
  if (value === null) throw new Error('useCart must be used inside <CartProvider> (see provider/AppProviders.jsx)');
  return value;
}
