import re

filename = 'src/features/cra/steps/physical/ScreenAssetRegister.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Sector Select
text = re.sub(
    r'<select([^>]+value=\{config\.sectorId\}[^>]+)>\s*\{sectorOptions\.map',
    r'<select\g<1>>\n                              <option value="">Select Sector</option>\n                              {sectorOptions.map',
    text
)

# Fix Subsector Select
text = re.sub(
    r'<select([^>]+value=\{config\.subsector\}[^>]+)>\s*\{subsectorOptions\.map',
    r'<select\g<1>>\n                              <option value="">Select Subsector</option>\n                              {subsectorOptions.map',
    text
)

# Fix Exchange Rate
rate_map = '''const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1550, // Approximate rate
  GHS: 14.5,
  KES: 132,
  ZAR: 18.8,
  GBP: 0.78,
  EUR: 0.92,
};
const CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"];'''

text = re.sub(
    r'const CURRENCIES = \["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"\];',
    rate_map,
    text
)

text = re.sub(
    r'usdRate: newCurrency === "USD" \? 1 : 1600,',
    r'usdRate: EXCHANGE_RATES[newCurrency] || 1550,',
    text
)

# Fix Preview Table Background
text = re.sub(
    r'<div className="border border-\[#E5E5E5\]\s*dark:border-white/\[0\.07\] overflow-hidden">',
    r'<div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/[0.07] overflow-hidden">',
    text
)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(text)
