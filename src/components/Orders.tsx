import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalPharmacy as PharmacyIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { useOrders } from '../context/OrderContext';
import { usePatients } from '../context/PatientContext';
import { useInventory } from '../context/InventoryContext';
import { Order, Patient, InventoryItem } from '../types';

const Orders: React.FC = () => {
  const { orders, addOrder, updateOrder, deleteOrder, syncOrders } = useOrders();
  const { inventory } = useInventory();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    patientId: '',
    items: [],
    status: 'pending',
    totalAmount: 0,
    paymentStatus: 'pending'
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (order?: Order) => {
    if (order) {
      setSelectedOrder(order);
      setNewOrder(order);
    } else {
      setSelectedOrder(null);
      setNewOrder({
        patientId: '',
        items: [],
        status: 'pending',
        totalAmount: 0,
        paymentStatus: 'pending'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setNewOrder({
      patientId: '',
      items: [],
      status: 'pending',
      totalAmount: 0,
      paymentStatus: 'pending'
    });
  };

  const handleSaveOrder = () => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, newOrder as Order);
    } else {
      addOrder(newOrder as Order);
    }
    handleCloseDialog();
  };

  const handleStatusChange = (event: SelectChangeEvent<Order['status']>) => {
    setNewOrder({ ...newOrder, status: event.target.value as Order['status'] });
  };

  const handlePaymentStatusChange = (event: SelectChangeEvent<Order['paymentStatus']>) => {
    setNewOrder({ ...newOrder, paymentStatus: event.target.value as Order['paymentStatus'] });
  };

  const filteredOrders = orders.filter(order => 
    order.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Orders
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={syncOrders}
            sx={{ mr: 1 }}
          >
            Sync
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Order
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ p: 2 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.patientId}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{order.paymentStatus}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(order)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? 'Edit Order' : 'New Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Patient</InputLabel>
              <Select
                value={newOrder.patientId}
                onChange={(e) => setNewOrder({ ...newOrder, patientId: e.target.value })}
                label="Patient"
              >
                {inventory.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select<Order['status']>
                value={newOrder.status || 'pending'}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Status</InputLabel>
              <Select<Order['paymentStatus']>
                value={newOrder.paymentStatus || 'pending'}
                onChange={handlePaymentStatusChange}
                label="Payment Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Total Amount"
              type="number"
              value={newOrder.totalAmount}
              onChange={(e) => setNewOrder({ ...newOrder, totalAmount: parseFloat(e.target.value) })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveOrder} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 