import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { 
  People as PeopleIcon,
  LocalPharmacy as PharmacyIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { usePatients } from '../context/PatientContext';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrderContext';
import { Patient, Order } from '../types';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { patients } = usePatients();
  const { inventory } = useInventory();
  const { orders } = useOrders();

  const totalPatients = patients.length;
  const totalInventory = inventory.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.light
    },
    {
      title: 'Total Inventory',
      value: totalInventory,
      icon: <PharmacyIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.light
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <CartIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      color: theme.palette.success.light
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <MoneyIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      color: theme.palette.info.light
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: stat.color,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {stat.icon}
              <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No recent activity to display.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
