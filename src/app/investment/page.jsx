'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { HeaderFooterWrapper } from '../layout';
export default function InvestmentPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/resources.jpg') center/cover no-repeat, linear-gradient(to bottom, #e3f2fd 70%, #1976d2 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>📚 Resources</Typography>
            <Typography paragraph>
              <b>What Resources are Available?</b> Find guides, articles, helplines, and tools to support elders and caregivers. Stay informed and empowered in all aspects of elder welfare.
            </Typography>
            <Typography><b>Resource Highlights:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Guides for health, legal, and financial topics" /></ListItem>
              <ListItem><ListItemText primary="Helplines and emergency contacts" /></ListItem>
              <ListItem><ListItemText primary="Caregiver tips and best practices" /></ListItem>
              <ListItem><ListItemText primary="Latest news and articles for elders" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                Our resource library includes step-by-step guides for healthcare planning and links to trusted helplines for elder support.
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
              background: "url('/images/resources.jpg') center/cover no-repeat, linear-gradient(to bottom, #e3f2fd 70%, #1976d2 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}