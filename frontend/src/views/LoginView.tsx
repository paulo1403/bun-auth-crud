import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useLoader } from '../contexts/LoaderContext';

type Props = {
  loading: boolean;
  error: string;
  onLogin: (data: LoginForm) => void;
};

const schema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .required('La contraseña es obligatoria'),
});
export type LoginForm = yup.InferType<typeof schema>;

export default function LoginView({ loading, error, onLogin }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    showLoader();
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al iniciar sesión');
      enqueueSnackbar('¡Bienvenido!', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  const handleForgotPassword = async (email: string) => {
    showLoader();
    try {
      const res = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || 'No se pudo enviar el correo');
      enqueueSnackbar('Correo de recuperación enviado', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  return (
    <Container maxWidth='sm'>
      <Box mt={8}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4' align='center' gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleSubmit(onLogin)}>
            <TextField
              label='Email'
              type='email'
              fullWidth
              margin='normal'
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />
            <TextField
              label='Password'
              type='password'
              fullWidth
              margin='normal'
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              required
            />
            {error && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Button
            variant='text'
            color='secondary'
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/forgot-password')}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
