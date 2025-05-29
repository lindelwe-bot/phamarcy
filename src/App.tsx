import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Theme,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Switch
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalPharmacy as PharmacyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { InventoryProvider } from './context/InventoryContext';
import { OrderProvider } from './context/OrderContext';
import { PatientProvider } from './context/PatientContext';

// Import components
import Dashboard from './components/Dashboard';
import Pharmacy from './components/Pharmacy';
import Patients from './components/Patients';
import Inventory from './components/Inventory';
import Prescriptions from './components/Prescriptions';
import Settings from './components/Settings';
import PharmacyDetails from './components/PharmacyDetails';
import Orders from './components/Orders';

const drawerWidth = 280;

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode, toggleTheme } = useThemeContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'Pharmacy', icon: <PharmacyIcon />, page: 'pharmacy' },
    { text: 'Pharmacy Details', icon: <BusinessIcon />, page: 'pharmacy-details' },
    { text: 'Patients', icon: <PeopleIcon />, page: 'patients' },
    { text: 'Orders', icon: <ReceiptIcon />, page: 'orders' },
    { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory' },
    { text: 'Prescriptions', icon: <ReceiptIcon />, page: 'prescriptions' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'pharmacy-details':
        return <PharmacyDetails />;
      case 'patients':
        return <Patients />;
      case 'orders':
        return <Orders />;
      case 'inventory':
        return <Inventory />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: 'primary.main'
          }}
        >
          <PharmacyIcon />
        </Avatar>
        <Typography variant="h6" noWrap component="div" color="primary">
          MediCare
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              setCurrentPage(item.page);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={currentPage === item.page}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 'medium',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: currentPage === item.page ? 'primary.main' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: currentPage === item.page ? 'medium' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.default'
      }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © 2024 MediCare Pharmacy
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 1,
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="primary" sx={{ flexGrow: 1 }}>
            Pharmacy Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightModeIcon sx={{ color: isDarkMode ? 'text.disabled' : 'warning.main' }} />
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              color="default"
            />
            <DarkModeIcon sx={{ color: isDarkMode ? 'primary.main' : 'text.disabled' }} />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
      <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        sx={{
          '& .MuiDrawer-paper': {
              boxSizing: 'border-box', 
            width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper'
            },
          }}
              >
          {drawer}
        </Drawer>
        </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 2, sm: 0 },
          backgroundColor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {renderPage()}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <OrderProvider>
          <PatientProvider>
            <AppContent />
          </PatientProvider>
        </OrderProvider>
      </InventoryProvider>
    </ThemeProvider>
  );
}

export default App;
