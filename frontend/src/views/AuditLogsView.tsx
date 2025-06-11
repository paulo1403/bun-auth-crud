import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useLoader } from '../contexts/LoaderContext';
import axios from 'axios';

export default function AuditLogsView({
  token,
  isAdmin,
}: {
  token: string;
  isAdmin: boolean;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [user, setUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchLogs = async () => {
      showLoader();
      try {
        const res = await axios.get('/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data.logs);
        setTotal(res.data.total);
      } catch (err: any) {
        enqueueSnackbar(err.response?.data?.error || err.message, {
          variant: 'error',
        });
      } finally {
        hideLoader();
      }
    };
    if (isAdmin) fetchLogs();
  }, [token, isAdmin]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'timestamp',
      headerName: 'Fecha/Hora',
      width: 180,
      valueGetter: (params: any) => new Date(params.value).toLocaleString(),
    },
    { field: 'user', headerName: 'Usuario', width: 220 },
    { field: 'action', headerName: 'Acción', width: 140 },
    { field: 'ip', headerName: 'IP', width: 120 },
    {
      field: 'details',
      headerName: 'Detalles',
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ whiteSpace: 'pre-wrap' }}>{params.value}</span>
      ),
    },
  ];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  };

  if (!isAdmin) {
    return (
      <Box mt={4}>
        <Typography color='error'>
          Acceso denegado: solo administradores pueden ver los logs de
          auditoría.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Logs de auditoría
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label='Buscar'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size='small'
          />
          <TextField
            label='Usuario'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            size='small'
          />
          <TextField
            label='Acción'
            value={action}
            onChange={(e) => setAction(e.target.value)}
            size='small'
          />
          <TextField
            label='Desde'
            type='date'
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='Hasta'
            type='date'
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Paper>
      <div style={{ height: 450, width: '100%' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          pageSizeOptions={[10, 20, 50]}
          pagination
          paginationMode='server'
          rowCount={total}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          disableRowSelectionOnClick
          getRowId={(row: any) => row.id}
        />
      </div>
    </Box>
  );
}
