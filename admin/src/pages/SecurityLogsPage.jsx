import {
  Alert, Box, Chip, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useFetch } from '../api/useFetch.js';

const ACTION_COLOR = {
  login: 'primary',
  credential_access: 'warning',
  download: 'secondary',
  upload: 'success',
  permission_change: 'info',
  document_view: 'default',
};

export default function SecurityLogsPage() {
  const { data, error, loading } = useFetch('/admin/activity');

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const logs = data.activity;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Security Logs
      </Typography>

      {logs.length === 0 ? (
        <Alert severity="info">No activity recorded yet.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {log.user_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={log.action.replace('_', ' ')}
                      color={ACTION_COLOR[log.action] || 'default'}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {log.target_id ? log.target_id.slice(0, 8) : '—'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {Object.keys(log.metadata || {}).length
                      ? JSON.stringify(log.metadata)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
