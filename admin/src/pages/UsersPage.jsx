import { useState } from 'react';
import {
  Alert, Box, Chip, CircularProgress, IconButton, Paper, Snackbar, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useFetch } from '../api/useFetch.js';
import { api } from '../api/client.js';

const ROLE_COLOR = {
  super_admin: 'primary',
  family_admin: 'secondary',
  member: 'default',
};

export default function UsersPage() {
  const { data, error, loading, reload } = useFetch('/admin/users');
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function toggleStatus(user) {
    setBusyId(user.id);
    const action = user.status === 'suspended' ? 'reinstate' : 'suspend';
    try {
      await api(`/admin/users/${user.id}/${action}`, { method: 'POST' });
      setToast({ severity: 'success', message: `User ${action}d` });
      await reload();
    } catch (err) {
      setToast({ severity: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        User Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.display_name || '—'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.role.replace('_', ' ')}
                    color={ROLE_COLOR[u.role] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.status}
                    color={u.status === 'active' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title={u.status === 'suspended' ? 'Reinstate' : 'Suspend'}>
                    <span>
                      <IconButton
                        color={u.status === 'suspended' ? 'success' : 'error'}
                        disabled={busyId === u.id || u.role === 'super_admin'}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === 'suspended' ? <CheckCircleIcon /> : <BlockIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
