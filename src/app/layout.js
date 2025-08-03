'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Popover,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './globals.css';

const exploreOptions = [
  { label: "Care Services", href: "/budgeting" },
  { label: "Health & Wellness", href: "/credit" },
  { label: "Community Support", href: "/saving" },
  { label: "Legal & Financial Help", href: "/safety" },
  { label: "Resources", href: "/investment" },
];

const getInvolvedOptions = [
  { label: "Volunteer", href: "/signup" },
  { label: "Donate", href: "/donate" },
  { label: "Share Your Story", href: "/stories" },
];

const footerLinks = [
  {
    title: "Explore",
    links: exploreOptions
  },
  {
    title: "Get Involved",
    links: getInvolvedOptions
  },
  {
    title: "About",
    links: [
      { label: "Our Mission", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];

const mainHeaderPages = ['/', '/budgeting', '/credit', '/saving', '/safety', '/investment'];
const showFooterPages = mainHeaderPages;

export function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();
  const showHeader = mainHeaderPages.includes(pathname);
  const showFooter = showFooterPages.includes(pathname);

  const [exploreAnchor, setExploreAnchor] = useState(null);
  const [involvedAnchor, setInvolvedAnchor] = useState(null);

  return (
    <>
      {showHeader && (
        <Box
          component="header"
          sx={{
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, md: 2 },
            bgcolor: "#ffffff",
            boxShadow: '0 2px 8px 0 #0001',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}
        >
          <Typography variant="h6" sx={{
            color: "#2E7D32",
            fontWeight: 700,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            mb: { xs: 1, sm: 0 }
          }}>
            <span role="img" aria-label="care" style={{ marginRight: 6 }}>🤝</span>
            ElderWelfare
          </Typography>

          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: 1
          }}>
            <Button endIcon={<ExpandMoreIcon />} onClick={e => setExploreAnchor(e.currentTarget)} sx={{ textTransform: "none", fontWeight: 600 }}>
              Explore
            </Button>
            <Popover open={Boolean(exploreAnchor)} anchorEl={exploreAnchor} onClose={() => setExploreAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
              <Box sx={{ p: 1 }}>
                {exploreOptions.map(opt =>
                  <Button key={opt.label} href={opt.href} component={Link} fullWidth sx={{ justifyContent: "flex-start", fontWeight: 500 }} onClick={() => setExploreAnchor(null)}>
                    {opt.label}
                  </Button>
                )}
              </Box>
            </Popover>

            <Button endIcon={<ExpandMoreIcon />} onClick={e => setInvolvedAnchor(e.currentTarget)} sx={{ textTransform: "none", fontWeight: 600 }}>
              Get Involved
            </Button>
            <Popover open={Boolean(involvedAnchor)} anchorEl={involvedAnchor} onClose={() => setInvolvedAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
              <Box sx={{ p: 1 }}>
                {getInvolvedOptions.map(opt =>
                  <Button key={opt.label} href={opt.href} component={Link} fullWidth sx={{ justifyContent: "flex-start", fontWeight: 500 }} onClick={() => setInvolvedAnchor(null)}>
                    {opt.label}
                  </Button>
                )}
              </Box>
            </Popover>

            <Button href="/about" sx={{ textTransform: "none", fontWeight: 600 }}>About</Button>
            <Button href="/contact" sx={{ textTransform: "none", fontWeight: 600 }}>Contact</Button>
            {pathname === '/' && (
              <>
                <Button variant="text" href="/login" sx={{ fontWeight: 500 }}>LOGIN</Button>
                <Button variant="contained" color="secondary" href="/signup" sx={{ fontWeight: 600 }}>SIGNUP</Button>
              </>
            )}
          </Box>
        </Box>
      )}
      {children}
      {showFooter && <FooterElderWelfare />}
    </>
  );
}

export default function Layout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#f7fafc", margin: 0 }}>
        <main style={{ minHeight: "70vh" }}>
          {pathname === '/' ? <MainPageContent /> : <HeaderFooterWrapper>{children}</HeaderFooterWrapper>}
        </main>
      </body>
    </html>
  );
}
function MainPageContent() {
  return (
    <HeaderFooterWrapper>
      <Box sx={{ position: "relative", minHeight: "70vh", px: { xs: 2, md: 8 }, pt: 6, pb: 8 }}>
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 4, md: 8 },
          background: "linear-gradient(to bottom, #e8f5e9, #c8e6c9)",
          borderRadius: 3,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 }
        }}>
          <Box sx={{ maxWidth: { xs: '100%', md: 480 }, color: "#2E7D32" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Welcome to ElderWelfare
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Caring for elders. Building dignity, community, and support—for today and tomorrow.
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
              <Typography paragraph>
                <b>ElderWelfare</b> is your platform for elder care and mutual support. By caring for elders now, you help build a community where everyone is supported—now and in the future.
              </Typography>
              <Typography paragraph><b>What We Offer:</b></Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0 }}>
                <li>Care services: health, home, wellness, and companionship</li>
                <li>Legal and financial help for elders</li>
                <li>Community and volunteer support</li>
                <li>Resource library for guides and assistance</li>
                <li>Share your story—be part of our caring community!</li>
              </Box>
              <Typography paragraph sx={{ mt: 2 }}>
                <b>Get started by exploring our services, joining our volunteer program, or accessing resources—from the header buttons above.</b>
              </Typography>
            </Paper>
          </Box>
          <Box sx={{
            flex: 1,
            maxWidth: { xs: '100%', md: 600 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <Box
              component="img"
              src="/images/elder-hero.png"
              alt="Elder care community"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0 6px 36px rgba(0,0,0,0.12)',
                objectFit: 'cover',
                maxHeight: 400,
              }}
            />
          </Box>
        </Box>
      </Box>
    </HeaderFooterWrapper>
  );
}


function FooterElderWelfare() {
  return (
    <Box sx={{
      bgcolor: "#f1f1f1",
      borderTop: "1px solid #ccc",
      mt: 6,
      py: 4
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {footerLinks.map((section, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {section.title}
              </Typography>
              <List dense disablePadding>
                {section.links.map(link => (
                  <ListItem key={link.label} disableGutters sx={{ py: 0.5 }}>
                    <Link href={link.href} passHref legacyBehavior>
                      <ListItemText primary={link.label} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} />
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} ElderWelfare. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
