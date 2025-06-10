import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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
      let res, result;
      if (userToEdit) {
        res = await fetch(`http://localhost:3000/users/${userToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            role: data.role,
            password: data.password,
          }),
        });
        result = await res.json();
        if (!res.ok)
          throw new Error(result.error || 'No se pudo editar el usuario');
        setSuccess('Usuario editado correctamente');
      } else {
        res = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        result = await res.json();
        if (!res.ok)
          throw new Error(result.error || 'No se pudo crear el usuario');
        setSuccess('Usuario creado correctamente');
        reset();
      }
      onUserCreated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} display='flex' justifyContent='center'>
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant='h6' gutterBottom>
          Crear nuevo usuario
        </Typography>
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
          <TextField
            label='Rol'
            select
            fullWidth
            margin='normal'
            {...register('role')}
            error={!!errors.role}
            helperText={errors.role?.message}
            required
          >
            <MenuItem value='user'>Usuario</MenuItem>
            <MenuItem value='admin'>Administrador</MenuItem>
          </TextField>
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
