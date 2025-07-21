'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { HeaderFooterWrapper } from '../layout';
export default function SavingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/community-support.jpg') center/cover no-repeat, linear-gradient(to bottom, #fffde7 70%, #fbc02d 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>🏘️ Community Support</Typography>
            <Typography paragraph>
              <b>What is Community Support?</b> Community support connects elders with local groups, volunteers, and programs that provide companionship, help, and opportunities for engagement.
            </Typography>
            <Typography><b>Highlights:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Volunteer assistance for daily needs" /></ListItem>
              <ListItem><ListItemText primary="Community events and gatherings" /></ListItem>
              <ListItem><ListItemText primary="Social visits and check-ins" /></ListItem>
              <ListItem><ListItemText primary="Peer support and friendship circles" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                Local volunteers organize monthly tea parties for elders to socialize, share experiences, and build friendships.
              </Typography>
            </Paper>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <Box sx={{
            width: 0, height: 0,
            background: "",
            borderRadius: 24,
            boxShadow: '0 6px 36px #0002',
            position: "relative",
            overflow: "hidden"
          }}>
            <Box sx={{
              position: "absolute",
              left: 0, bottom: 0, width: "100%", height: "60%",
              background: "url('/images/community-support.jpg') center/cover no-repeat, linear-gradient(to bottom, #fffde7 70%, #fbc02d 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}