import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'on-leave' | 'off-duty';
}

interface PharmacyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  license: string;
  operatingHours: string;
}

const PharmacyDetails = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const pharmacyInfo: PharmacyInfo = {
    name: "MediCare Pharmacy",
    address: "123 Healthcare Street, Medical District, Bulawayo",
    phone: "+263 78 426 2096",
    email: "lindelwesiphiwo@gmail.com",
    license: "PH123456",
    operatingHours: "Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 8:00 PM"
  };

  const staffMembers: StaffMember[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Pharmacist in Charge",
      email: "sarah.j@medicare-pharmacy.com",
      phone: "+1 (555) 123-4568",
      status: "active"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Senior Pharmacist",
      email: "michael.c@medicare-pharmacy.com",
      phone: "+1 (555) 123-4569",
      status: "active"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Pharmacy Technician",
      email: "emily.r@medicare-pharmacy.com",
      phone: "+1 (555) 123-4570",
      status: "on-leave"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Pharmacy Assistant",
      email: "david.k@medicare-pharmacy.com",
      phone: "+1 (555) 123-4571",
      status: "off-duty"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on-leave':
        return 'warning';
      case 'off-duty':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setOpenDialog(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Pharmacy Details
      </Typography>

      {/* Pharmacy Information */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" color="primary">
                {pharmacyInfo.name}
              </Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <LocationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Address" 
                  secondary={pharmacyInfo.address}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  secondaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PhoneIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Phone" 
                  secondary={pharmacyInfo.phone}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Email" 
                  secondary={pharmacyInfo.email}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  secondaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimeIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" color="primary">
                Additional Information
              </Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="License Number" 
                  secondary={pharmacyInfo.license}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TimeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Operating Hours" 
                  secondary={pharmacyInfo.operatingHours}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Staff Members */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant={isMobile ? "h6" : "h5"} color="primary">
          Staff Members
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStaff}
          color="primary"
        >
          Add Staff
        </Button>
      </Box>

      <Grid container spacing={2}>
        {staffMembers.map((staff) => (
          <Grid item xs={12} sm={6} md={4} key={staff.id}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: 'primary.main',
                      mr: 2
                    }}
                  >
                    {staff.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {staff.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {staff.role}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                        <EmailIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Email"
                      secondary={staff.email}
                      secondaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                        <PhoneIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Phone"
                      secondary={staff.phone}
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={staff.status.replace('-', ' ')} 
                    color={getStatusColor(staff.status) as any}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditStaff(staff)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              defaultValue={selectedStaff?.name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Role"
              defaultValue={selectedStaff?.role}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              defaultValue={selectedStaff?.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              defaultValue={selectedStaff?.phone}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            {selectedStaff ? 'Save Changes' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PharmacyDetails; 