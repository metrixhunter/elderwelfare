'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { HeaderFooterWrapper } from '../layout';
export default function CreditPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/health-wellness.jpg') center/cover no-repeat, linear-gradient(to bottom, #e0f7fa 70%, #00695c 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>🩺 Health & Wellness</Typography>
            <Typography paragraph>
              <b>What is Health & Wellness?</b> Health & wellness focuses on maintaining physical, mental, and emotional well-being for elders. It includes regular check-ups, exercise, nutrition, and activities that promote happiness and reduce stress.
            </Typography>
            <Typography><b>How We Support Wellness:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Regular health screenings and check-ups" /></ListItem>
              <ListItem><ListItemText primary="Exercise and mobility programs" /></ListItem>
              <ListItem><ListItemText primary="Mental health support and counseling" /></ListItem>
              <ListItem><ListItemText primary="Wellness workshops and activities" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                The wellness center organizes weekly yoga sessions and health talks for elders, helping them stay active and informed.
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
              background: "url('/images/health-wellness.jpg') center/cover no-repeat, linear-gradient(to bottom, #e0f7fa 70%, #00695c 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}