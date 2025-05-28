import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const Pharmacy = () => {
  // Sample data - in a real app, this would come from an API
  const prescriptions = [
    { id: 1, patient: 'John Doe', medication: 'Amoxicillin', status: 'Pending', date: '2024-03-20' },
    { id: 2, patient: 'Jane Smith', medication: 'Lisinopril', status: 'Filled', date: '2024-03-19' },
    { id: 3, patient: 'Bob Johnson', medication: 'Metformin', status: 'Pending', date: '2024-03-20' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pharmacy Management
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.id}</TableCell>
                  <TableCell>{prescription.patient}</TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.status}</TableCell>
                  <TableCell>{prescription.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Pharmacy; 