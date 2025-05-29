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
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalPharmacy as PharmacyIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { usePatients } from '../context/PatientContext';
import { Patient } from '../types';

const Patients: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient, syncPatients } = usePatients();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: '',
    contact: '',
    address: ''
  });

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      setNewPatient(patient);
      } else {
      setSelectedPatient(null);
      setNewPatient({
        name: '',
        age: 0,
        gender: '',
        contact: '',
        address: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
    setNewPatient({
      name: '',
      age: 0,
      gender: '',
      contact: '',
      address: ''
    });
  };

  const handleSubmit = () => {
    if (selectedPatient) {
      updatePatient(selectedPatient.id, newPatient as Patient);
      } else {
      addPatient(newPatient as Patient);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      deletePatient(id);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
                Patients
      </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={syncPatients}
            sx={{ mr: 2 }}
          >
            Sync
          </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
                >
                  Add Patient
                </Button>
              </Box>
            </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.address}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                      onClick={() => handleOpenDialog(patient)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                      onClick={() => handleDelete(patient.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            />
            <TextField
              label="Age"
              type="number"
              fullWidth
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) })}
            />
            <TextField
              label="Gender"
              fullWidth
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
            />
            <TextField
              label="Contact"
              fullWidth
              value={newPatient.contact}
              onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              value={newPatient.address}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPatient ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients; 