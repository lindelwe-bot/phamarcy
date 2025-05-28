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
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  CloudDone as CloudDoneIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { dataService, Patient } from '../services/db';
import AddPatient from './AddPatient';

const Patients = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    loadPatients();
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSnackbar({
          open: true,
          message: 'Back online. Syncing data...',
          severity: 'success'
        });
        loadPatients();
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

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getAllPatients();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error loading patients',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setOpenDialog(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenEditDialog(true);
  };

  const handleDeletePatient = async (id: number) => {
    try {
      await dataService.deletePatient(id);
      await loadPatients();
      setSnackbar({
        open: true,
        message: 'Patient deleted successfully',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting patient',
        severity: 'error'
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPatient(null);
  };

  const handleSavePatient = async () => {
    try {
      if (!selectedPatient) {
        throw new Error('No patient selected');
      }

      if (selectedPatient.id) {
        await dataService.updatePatient(selectedPatient.id, selectedPatient);
        setSnackbar({
          open: true,
          message: 'Patient updated successfully',
          severity: 'success'
        });
      } else {
        await dataService.addPatient(selectedPatient as Omit<Patient, 'id'>);
        setSnackbar({
          open: true,
          message: 'Patient added successfully',
          severity: 'success'
        });
      }
      await loadPatients();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error saving patient:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error saving patient',
        severity: 'error'
      });
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      if (query.trim()) {
        const results = await dataService.searchPatients(query);
        if (!Array.isArray(results)) {
          throw new Error('Invalid search results format');
        }
        setPatients(results || []);
      } else {
        await loadPatients();
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setError('Failed to search patients. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error searching patients',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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

  const filteredPatients = patients.filter(patient => {
    if (!patient || !patient.name) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.phone || '').includes(searchQuery) ||
      (patient.email?.toLowerCase() || '').includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPatientStatus = (status?: string) => {
    if (!status) return 'unknown';
    return status.toLowerCase() === 'active' ? 'active' : 'inactive';
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return 'Not specified';
    return method.replace('_', ' ');
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadPatients}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant={isMobile ? "h5" : "h4"} color="primary">
                Patients
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
                  onClick={() => setOpenAddDialog(true)}
                  
                  color="primary"
                >
                  Add Patient
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search patients by name, phone, or email"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch(searchQuery)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleSearch(searchQuery)}
              >
                Search
      </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredPatients.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  No patients found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchQuery ? 'Try a different search term' : 'Click "Add Patient" to add one'}
                </Typography>
              </Box>
            ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Medical Info</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="action" fontSize="small" />
                            <Box>
                              <Typography variant="body1">{patient.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                DOB: {formatDate(patient.dateOfBirth)}
                              </Typography>
                            </Box>
                            <Tooltip title={patient.syncStatus || 'Not synced'}>
                              {getSyncStatusIcon(patient.syncStatus)}
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">{patient.phone}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="body2">{patient.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {patient.address?.street}, {patient.address?.city}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MedicalIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {patient.medicalHistory ? 'Has medical history' : 'No medical history'}
                              </Typography>
                            </Box>
                            {patient.allergies?.length > 0 && (
                              <Typography variant="caption" color="error">
                                Allergies: {patient.allergies.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(patient.paymentMethod)}
                            color={patient.paymentMethod === 'medical_aid' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                  <TableCell>
                          <Chip
                            label={getPatientStatus(patient.status)}
                            color={patient.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditPatient(patient)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setOpenDeleteDialog(true);
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
        </Grid>
      </Grid>

      {/* Add Patient Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <AddPatient />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (selectedPatient?.id) {
                handleDeletePatient(selectedPatient.id);
              }
            }} 
            color="error"
          >
            Delete
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Patients; 