import {
  Box,
  Typography,
  Button,
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
import { useSnackbar } from 'notistack';
import { useLoader } from '../contexts/LoaderContext';
import axios from 'axios';

export default function UsersView({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchUsers = async () => {
      showLoader();
      try {
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err: any) {
        enqueueSnackbar(err.response?.data?.error || err.message, {
          variant: 'error',
        });
      } finally {
        hideLoader();
      }
    };
    fetchUsers();
  }, [token, refresh]);

  const handleUserCreated = () => {
    setRefresh((r) => r + 1);
    setOpenModal(false);
    setEditUser(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    showLoader();
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefresh((r) => r + 1);
      enqueueSnackbar('Usuario eliminado correctamente', {
        variant: 'success',
      });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.error || err.message, {
        variant: 'error',
      });
    } finally {
      hideLoader();
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSizeOptions={[5]}
          loading={false}
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
