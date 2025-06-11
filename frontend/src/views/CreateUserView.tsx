import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';

const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .required('La contraseña es obligatoria'),
  role: yup
    .string()
    .oneOf(['admin', 'user'], 'Rol inválido')
    .required('El rol es obligatorio'),
});
type CreateUserForm = yup.InferType<typeof schema>;

type Props = { token: string; onUserCreated?: () => void; userToEdit?: any };

export default function CreateUserView({
  token,
  onUserCreated,
  userToEdit,
}: Props) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateUserForm>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (userToEdit) {
      setValue('name', userToEdit.name);
      setValue('email', userToEdit.email);
      setValue('role', userToEdit.role);
      setValue('password', '');
    } else {
      reset();
    }
  }, [userToEdit, setValue, reset]);

  const onSubmit = async (data: CreateUserForm) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (userToEdit) {
        await axios.put(`/api/users/${userToEdit.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Usuario editado correctamente');
      } else {
        await axios.post('/api/users', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Usuario creado correctamente');
        reset();
      }
      onUserCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} display='flex' justifyContent='center'>
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label='Nombre'
            fullWidth
            margin='normal'
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            required
          />
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
            label='Contraseña'
            type='password'
            fullWidth
            margin='normal'
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            required
          />
          <FormControl fullWidth margin='normal' error={!!errors.role}>
            <InputLabel id='role-select-label'>Rol</InputLabel>
            <Controller
              name='role'
              control={control}
              render={({ field }) => (
                <Select
                  labelId='role-select-label'
                  id='role-select'
                  label='Rol'
                  {...field}
                  value={field.value || ''}
                >
                  <MenuItem value=''>Selecciona un rol</MenuItem>
                  <MenuItem value='user'>Usuario</MenuItem>
                  <MenuItem value='admin'>Administrador</MenuItem>
                </Select>
              )}
            />
            {errors.role && (
              <Typography color='error' variant='caption'>
                {errors.role.message}
              </Typography>
            )}
          </FormControl>
          <Button
            type='submit'
            variant='contained'
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Creando...' : 'Crear usuario'}
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
