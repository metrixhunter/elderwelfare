import { Card as MUICard, CardContent as MUICardContent } from '@mui/material';

export function Card({ children, style, elevation = 2, backgroundColor = "#fff" }) {
  return (
    <MUICard style={{ ...style, backgroundColor }} elevation={elevation}>
      <MUICardContent>{children}</MUICardContent>
    </MUICard>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
