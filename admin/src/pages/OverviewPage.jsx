import {
  Alert, Box, Card, CardContent, CircularProgress, Grid, Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BlockIcon from '@mui/icons-material/Block';
import GroupsIcon from '@mui/icons-material/Groups';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShareIcon from '@mui/icons-material/Share';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useFetch } from '../api/useFetch.js';

function StatCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              bgcolor: color,
              color: '#fff',
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { data, error, loading } = useFetch('/admin/stats');

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const s = data.stats;
  const cards = [
    { icon: <PeopleIcon />, label: 'Total Users', value: s.totalUsers },
    { icon: <BlockIcon />, label: 'Suspended', value: s.suspendedUsers, color: 'error.main' },
    { icon: <GroupsIcon />, label: 'Families', value: s.totalFamilies },
    { icon: <VpnKeyIcon />, label: 'Vault Items', value: s.totalItems },
    { icon: <ShareIcon />, label: 'Shares', value: s.totalShares, color: 'secondary.main' },
    { icon: <PendingActionsIcon />, label: 'Pending Requests', value: s.pendingRequests, color: 'warning.main' },
    { icon: <TimelineIcon />, label: 'Activity (24h)', value: s.activityLast24h, color: 'secondary.main' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Overview
      </Typography>
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
