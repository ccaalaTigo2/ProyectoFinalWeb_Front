import React, { createContext, useContext, useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { useAuth } from './AuthContext';

// Context
const OrderContext = createContext();

// Provider
export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar pedidos del usuario
  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Cargar TODOS los pedidos sin importar el rol
      const userOrders = await orderService.getPedidos();
      
      setOrders(Array.isArray(userOrders) ? userOrders : []);
      setError(null);
    } catch (error) {
      setError(error.message);
      setOrders([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      setCurrentOrder(newOrder);
      setError(null);
      return newOrder;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, notes = '') => {
    setLoading(true);
    try {
      // Usar el método correcto del orderService
      const updatedOrder = await orderService.updateEstadoPedido(orderId, { estado: status });
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      setError(null);
      return updatedOrder;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId, reason = '') => {
    setLoading(true);
    try {
      // Usar el método correcto para cancelar (actualizar estado a CANCELADO)
      const canceledOrder = await orderService.updateEstadoPedido(orderId, { estado: 'CANCELADO' });
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? canceledOrder : order
        )
      );
      setError(null);
      return canceledOrder;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    setLoading(true);
    try {
      // Usar el método correcto del orderService
      const order = await orderService.getPedidoById(orderId);
      
      setCurrentOrder(order);
      setError(null);
      return order;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentOrder = () => {
    setCurrentOrder(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderById,
    loadUserOrders,
    clearCurrentOrder,
    clearError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Hook personalizado
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
