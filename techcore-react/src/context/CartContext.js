import { createContext } from 'react';

/** Value is provided by provider/CartProvider.jsx. Consume it with the matching hook in hooks/. */
export const CartContext = createContext(null);
