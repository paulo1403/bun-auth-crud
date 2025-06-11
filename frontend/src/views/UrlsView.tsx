import { useMemo, useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useLoader } from '../contexts/LoaderContext';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const urlSchema = yup.object({
  originalUrl: yup
    .string()
    .url('Ingresa una URL válida, por ejemplo: https://ejemplo.com')
    .required('La URL es obligatoria')
    .test(
      'is-http-or-https',
      'La URL debe comenzar con http:// o https://',
      (value) =>
        !!value && (value.startsWith('http://') || value.startsWith('https://'))
    ),
});
type UrlForm = yup.InferType<typeof urlSchema>;

type Props = { token: string };

export default function UrlsView({ token }: Props) {
  const [urls, setUrls] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 350);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UrlForm>({ resolver: yupResolver(urlSchema) });
  const { enqueueSnackbar } = useSnackbar();
  const { showLoader, hideLoader } = useLoader();

  const fetchUrls = async (page = 1, pageSize = 5, searchValue = '') => {
    showLoader();
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: searchValue,
      });
      const res = await fetch(
        `http://localhost:3000/urls?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener URLs');
      setUrls(data.urls);
      setTotal(data.total);
      setPage(page);
      setPageSize(pageSize);
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchUrls(page, pageSize, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const onSubmit = async (data: UrlForm) => {
    showLoader();
    try {
      const res = await fetch('http://localhost:3000/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'No se pudo acortar la URL');
      reset();
      await fetchUrls(page, pageSize, debouncedSearch);
      enqueueSnackbar('URL acortada correctamente', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar URL?')) return;
    showLoader();
    try {
      const res = await fetch(`http://localhost:3000/urls/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo eliminar la URL');
      setUrls((prev) => prev.filter((url) => url.id !== id));
      enqueueSnackbar('URL eliminada correctamente', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  const filteredUrls = useMemo(() => {
    if (!debouncedSearch) return urls;
    return urls.filter(
      (url) =>
        url.originalUrl.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [urls, debouncedSearch]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'originalUrl', headerName: 'URL original', flex: 1 },
    {
      field: 'shortCode',
      headerName: 'URL corta',
      width: 180,
      renderCell: (params: any) => (
        <a href={`/${params.value}`} target='_blank' rel='noopener noreferrer'>
          {window.location.origin}/{params.value}
        </a>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Creada',
      width: 180,
      valueGetter: (params: any) => {
        const value = params;
        if (!value) return '';
        const date = new Date(value);
        return isNaN(date.getTime()) ? '' : date.toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params: any) => (
        <Button
          color='error'
          size='small'
          onClick={() => handleDelete(params.row.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Acortar nueva URL
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label='URL a acortar'
          fullWidth
          margin='normal'
          {...register('originalUrl')}
          error={!!errors.originalUrl}
          helperText={
            errors.originalUrl?.message || 'Ejemplo: https://midominio.com'
          }
          required
        />
        <Button type='submit' variant='contained'>
          Acortar
        </Button>
      </form>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label='Buscar URL o código'
          variant='outlined'
          size='small'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <Box mt={4}>
        <Typography variant='h6' gutterBottom>
          Tus URLs acortadas
        </Typography>
        <div style={{ height: 350, width: '100%' }}>
          <DataGrid
            rows={urls}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
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
    </Box>
  );
}
