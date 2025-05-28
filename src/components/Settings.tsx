import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Switch, Divider, useTheme, useMediaQuery } from '@mui/material';

interface Setting {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [settings, setSettings] = useState<Setting[]>([
    { id: 1, name: 'Email Notifications', description: 'Receive email notifications for low stock alerts', enabled: true },
    { id: 2, name: 'Auto Reorder', description: 'Automatically reorder items when stock is low', enabled: false },
    { id: 3, name: 'Prescription Alerts', description: 'Get alerts for pending prescriptions', enabled: true },
    { id: 4, name: 'Patient Records', description: 'Enable patient record management', enabled: true },
  ]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pharmacySettings', JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (settingId: number) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom
        sx={{ px: { xs: 1, sm: 0 } }}
      >
        System Settings
      </Typography>
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <List>
          {settings.map((setting, index) => (
            <React.Fragment key={setting.id}>
              <ListItem
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: { xs: 2, sm: 1 }
                }}
              >
                <ListItemText
                  primary={setting.name}
                  secondary={setting.description}
                  sx={{
                    mb: { xs: 1, sm: 0 }
                  }}
                />
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 0, sm: 16 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' }
                  }}
                >
                  <Switch
                    edge="end"
                    checked={setting.enabled}
                    onChange={() => handleToggle(setting.id)}
                    inputProps={{
                      'aria-labelledby': `switch-list-label-${setting.id}`,
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {index < settings.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default Settings; 