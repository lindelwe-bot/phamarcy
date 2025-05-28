import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
// ... existing code ... 