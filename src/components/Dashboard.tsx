import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Container, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { dataService } from '../services/db';
import { Patient, Order } from '../services/db';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingPrescriptions: 0,
    lowStockItems: 0,
    todaySales: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [patients, orders] = await Promise.all([
        dataService.getAllPatients(),
        dataService.getAllOrders()
      ]);

      // Calculate today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Filter today's orders
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= today && orderDate < tomorrow;
      });

      // Calculate total sales for today
      const todaySales = todayOrders.reduce((total, order) => total + order.totalAmount, 0);

      // Count pending prescriptions
      const pendingPrescriptions = orders.filter(order => 
        order.orderStatus === 'pending' || order.orderStatus === 'processing'
      ).length;

      setStats({
        totalPatients: patients.length,
        pendingPrescriptions,
        lowStockItems: 0, // This will be implemented when inventory is added
        todaySales
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography 
              component="h2" 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="primary" 
              gutterBottom
            >
              Total Patients
            </Typography>
            <Typography 
              component="p" 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              {stats.totalPatients}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography 
              component="h2" 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="primary" 
              gutterBottom
            >
              Pending Prescriptions
            </Typography>
            <Typography 
              component="p" 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              {stats.pendingPrescriptions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography 
              component="h2" 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="primary" 
              gutterBottom
            >
              Low Stock Items
            </Typography>
            <Typography 
              component="p" 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              {stats.lowStockItems}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography 
              component="h2" 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="primary" 
              gutterBottom
            >
              Today's Sales
            </Typography>
            <Typography 
              component="p" 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              {formatCurrency(stats.todaySales)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 