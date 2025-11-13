import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  People,
  Inventory,
  CheckCircle,
  Schedule,
  LocalShipping,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import reportService from '../services/reportService';
import { formatCurrency, formatNumber, getRelativeTime } from '../utils/helpers';
import { ORDER_STATUS } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: {},
    recentOrders: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const metricsResponse = await reportService.getDashboardMetrics();

      setDashboardData({
        metrics: metricsResponse,
        recentOrders: orders.slice(0, 5),
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Cargando dashboard..." />;
  }

  const MetricCard = ({ title, value, icon, color = 'primary', format = 'number' }) => (
    <Card className="metric-card">
      <CardContent className="metric-card-content">
        <div className="metric-icon-wrapper">
          <div className="metric-icon">
            {icon}
          </div>
        </div>
        <Typography variant="h4" component="div" className="metric-value">
          {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
        </Typography>
        <Typography variant="body2" className="metric-label">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <Typography variant="h4" className="dashboard-title">
            Bienvenido, {user?.name}
          </Typography>
          
          <Typography variant="body1" className="dashboard-subtitle">
            Resumen de tu negocio
          </Typography>
        </div>

        {/* Métricas principales */}
        <Grid container spacing={3} className="metrics-grid">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Ventas del Mes"
              value={dashboardData.metrics.monthlySales || 0}
              icon={<TrendingUp />}
              color="success"
              format="currency"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Pedidos Pendientes"
              value={dashboardData.metrics.pendingOrders || 0}
              icon={<ShoppingCart />}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Clientes Activos"
              value={dashboardData.metrics.activeCustomers || 0}
              icon={<People />}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Productos en Stock"
              value={dashboardData.metrics.productsInStock || 0}
              icon={<Inventory />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Pedidos recientes */}
        <Grid container spacing={3} className="content-grid">
          <Grid size={{ xs: 12 }}>
            <Card className="content-card">
              <div className="content-card-header">
                <Typography variant="h6" className="content-card-title">
                  Pedidos Recientes
                </Typography>
                <Button size="small" href="/orders" className="nav-button">
                  Ver todos
                </Button>
              </div>
              <div className="content-card-body">
                {dashboardData.recentOrders.length > 0 ? (
                  <List className="dashboard-list">
                    {dashboardData.recentOrders.map((order) => (
                      <ListItem key={order.id} className="dashboard-list-item">
                        <ListItemIcon className="list-item-icon">
                          {order.estado === ORDER_STATUS.ENTREGADO ? (
                            <CheckCircle color="success" />
                          ) : order.estado === ORDER_STATUS.EN_PROCESO ? (
                            <LocalShipping color="info" />
                          ) : (
                            <Schedule color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className="list-item-primary">
                              Pedido #{order.id}
                            </Typography>
                          }
                          secondary={
                            <Typography className="list-item-secondary">
                              Cliente: {order.clienteNombre || order.cliente?.nombre || 'Sin cliente'} • {getRelativeTime(order.fechaPedido)}
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body1" fontWeight="600" color="primary.main">
                            {formatCurrency(order.total)}
                          </Typography>
                          <StatusChip status={order.estado} type="order" className="status-chip" />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="empty-state">
                    <Schedule className="empty-state-icon" />
                    <Typography variant="body2" className="empty-state-text">
                      No hay pedidos recientes
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;
