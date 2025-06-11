import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const schema = yup.object({
  token: yup.string().required('El token es obligatorio'),
  password: yup
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .required('La contraseña es obligatoria'),
});
type ResetForm = yup.InferType<typeof schema>;

export default function ResetPasswordView() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: ResetForm) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/api/reset-password', data);
      setSuccess(
        'Contraseña actualizada correctamente. Redirigiendo al login...'
      );
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={8} display='flex' justifyContent='center'>
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant='h5' gutterBottom>
          Cambiar contraseña
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label='Token'
            fullWidth
            margin='normal'
            {...register('token')}
            error={!!errors.token}
            helperText={errors.token?.message}
            required
          />
          <TextField
            label='Nueva contraseña'
            type='password'
            fullWidth
            margin='normal'
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            required
          />
          <Button
            type='submit'
            variant='contained'
            fullWidth
            disabled={loading}
          >
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        </form>
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
