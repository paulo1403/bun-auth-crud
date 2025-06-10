import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{
    resetToken: string;
    expires: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={8} display='flex' justifyContent='center'>
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant='h5' gutterBottom>
          Recuperar contraseña
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin='normal'
            required
          />
          <Button
            type='submit'
            variant='contained'
            fullWidth
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Solicitar token'}
          </Button>
        </form>
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {result && (
          <Alert severity='success' sx={{ mt: 2 }}>
            Token generado: <b>{result.resetToken}</b>
            <br />
            Expira: {new Date(result.expires).toLocaleString()}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
