import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  Autocomplete,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LocalPharmacy as PharmacyIcon,
  Person as PersonIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  CloudDone as CloudDoneIcon,
  Error as ErrorIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { dataService, Patient, Order, OrderItem } from '../services/db';

const Orders: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({
    patientId: 0,
    patientName: '',
    items: [],
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadPatients();
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSnackbar({
          open: true,
          message: 'Back online. Syncing data...',
          severity: 'success'
        });
        loadOrders(); // Reload orders when back online
      } else {
        setSnackbar({
          open: true,
          message: 'You are offline. Changes will be synced when you are back online.',
          severity: 'warning'
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await dataService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setSnackbar({
        open: true,
        message: 'Error loading orders',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await dataService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setFormData({
      patientId: 0,
      patientName: '',
      items: [],
      totalAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      ...order,
      items: [...order.items],
    });
    setDialogOpen(true);
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await dataService.deleteOrder(id);
      setOrders(orders.filter(order => order.id !== id));
      setSnackbar({
        open: true,
        message: 'Order deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting order',
        severity: 'error'
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleSaveOrder = async () => {
    try {
      if (selectedOrder?.id) {
        await dataService.updateOrder(selectedOrder.id, formData);
        setOrders(orders.map(order => 
          order.id === selectedOrder.id ? { ...order, ...formData } : order
        ));
        setSnackbar({
          open: true,
          message: 'Order updated successfully',
          severity: 'success'
        });
      } else {
        const newOrderId = await dataService.addOrder(formData as Omit<Order, 'id'>);
        const newOrder = { ...formData, id: newOrderId } as Order;
        setOrders([...orders, newOrder]);
        setSnackbar({
          open: true,
          message: 'Order added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving order:', error);
      setSnackbar({
        open: true,
        message: 'Error saving order',
        severity: 'error'
      });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await dataService.searchOrders(query);
        setOrders(results);
      } catch (error) {
        console.error('Error searching orders:', error);
      }
    } else {
      loadOrders();
    }
  };

  const getSyncStatusIcon = (status?: 'synced' | 'pending' | 'error') => {
    if (!isOnline) return <CloudOffIcon color="action" fontSize="small" />;
    switch (status) {
      case 'synced':
        return <CloudDoneIcon color="success" fontSize="small" />;
      case 'pending':
        return <CloudSyncIcon color="warning" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <CloudOffIcon color="action" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} color="primary">
          Orders
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!isOnline && (
            <Chip
              icon={<CloudOffIcon />}
              label="Offline Mode"
              color="warning"
              variant="outlined"
            />
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddOrder}
            color="primary"
          >
            New Order
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Try a different search term' : 'Click "New Order" to create one'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CartIcon color="action" fontSize="small" />
                        #{order.id}
                        <Tooltip title={order.syncStatus || 'Not synced'}>
                          {getSyncStatusIcon(order.syncStatus)}
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" fontSize="small" />
                        {order.patientName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {order.items.map((item, index) => (
                        <Box key={item.id} sx={{ mb: index < order.items.length - 1 ? 1 : 0 }}>
                          <Typography variant="body2">
                            {item.medication} x {item.quantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.dosage}
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell>
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          label={order.paymentMethod.replace('_', ' ')}
                          color={order.paymentMethod === 'medical_aid' ? 'primary' : 'default'}
                          size="small"
                        />
                        <Chip
                          label={order.paymentStatus}
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">
                          Ordered: {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>
                        {order.deliveryDate && (
                          <Typography variant="caption" color="text.secondary">
                            Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditOrder(order)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (typeof order.id === 'number') {
                            handleDeleteOrder(order.id);
                          }
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? 'Edit Order' : 'Add New Order'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Patient Name"
                fullWidth
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientName: e.target.value,
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    paymentMethod: e.target.value as Order['paymentMethod'],
                  }))}
                >
                  <MenuItem value="medical_aid">Medical Aid</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {formData.items?.map((item, index) => (
                <Grid container spacing={2} key={item.id} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Medication"
                      fullWidth
                      value={item.medication}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index] = { ...item, medication: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index] = { ...item, quantity: parseInt(e.target.value) };
                        setFormData(prev => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Price"
                      type="number"
                      fullWidth
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index] = { ...item, price: parseFloat(e.target.value) };
                        setFormData(prev => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Dosage"
                      fullWidth
                      value={item.dosage}
                      onChange={(e) => {
                        const newItems = [...(formData.items || [])];
                        newItems[index] = { ...item, dosage: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        const newItems = formData.items?.filter((_, i) => i !== index);
                        setFormData(prev => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  const newItem: OrderItem = {
                    id: Date.now().toString(),
                    medication: '',
                    quantity: 1,
                    price: 0,
                    dosage: '',
                    instructions: '',
                  };
                  setFormData(prev => ({
                    ...prev,
                    items: [...(prev.items || []), newItem],
                  }));
                }}
              >
                Add Item
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={formData.orderStatus}
                  label="Order Status"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    orderStatus: e.target.value as Order['orderStatus'],
                  }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Payment Status"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    paymentStatus: e.target.value as Order['paymentStatus'],
                  }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Order Date"
                type="date"
                fullWidth
                value={formData.orderDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  orderDate: e.target.value,
                }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Delivery Date"
                type="date"
                fullWidth
                value={formData.deliveryDate || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  deliveryDate: e.target.value,
                }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  notes: e.target.value,
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveOrder} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders; 