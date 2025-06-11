import {
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import CreateUserView from './CreateUserView';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

export default function UsersView({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const handleUserCreated = () => {
    setRefresh((r) => r + 1);
    setOpenModal(false);
    setEditUser(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo eliminar el usuario');
      setRefresh((r) => r + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Rol', width: 120 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      renderCell: (params) => (
        <>
          <IconButton
            color='primary'
            onClick={() => {
              setEditUser(params.row);
              setOpenModal(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <Button
            color='error'
            size='small'
            onClick={() => handleDelete(params.row.id)}
          >
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => {
            setEditUser(null);
            setOpenModal(true);
          }}
        >
          Crear usuario
        </Button>
      </Box>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Usuarios registrados
      </Typography>
      {error && <Alert severity='error'>{error}</Alert>}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSizeOptions={[5]}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </div>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          {editUser ? 'Editar usuario' : 'Crear usuario'}
        </DialogTitle>
        <DialogContent>
          <CreateUserView
            token={token}
            onUserCreated={handleUserCreated}
            userToEdit={editUser}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
