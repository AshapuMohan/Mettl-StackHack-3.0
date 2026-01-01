import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId &&
        JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId &&
            JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId &&
          JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          item => !(item.productId === action.payload.productId &&
          JSON.stringify(item.variant) === JSON.stringify(action.payload.variant))
        )
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, variant = null) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url,
        quantity,
        variant,
        seller: product.seller
      }
    });
  };

  const updateQuantity = (productId, variant, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, variant, quantity }
    });
  };

  const removeFromCart = (productId, variant) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId, variant }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId, variant = null) => {
    return cart.items.some(
      item => item.productId === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};