import { Box, Typography, Button } from '@mui/material';

type Props = {
  dashboardView: 'usuarios' | 'urls';
  setDashboardView: (v: 'usuarios' | 'urls') => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function DashboardView({
  dashboardView,
  setDashboardView,
  onLogout,
  children,
}: Props) {
  return (
    <Box mt={8}>
      <Box
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant='h4' align='center' gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant={dashboardView === 'usuarios' ? 'contained' : 'outlined'}
            onClick={() => setDashboardView('usuarios')}
          >
            Usuarios
          </Button>
          <Button
            variant={dashboardView === 'urls' ? 'contained' : 'outlined'}
            onClick={() => setDashboardView('urls')}
          >
            URLs cortas
          </Button>
          <Button
            variant='text'
            color='error'
            sx={{ ml: 'auto' }}
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
        {children}
      </Box>
    </Box>
  );
}
