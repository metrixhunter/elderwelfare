// banks/[bankId]/staticParams.js
export function generateStaticParams() {
  return ['sbi', 'hdfc', 'icici', 'axis'].map(bankId => ({ bankId }));
}


  