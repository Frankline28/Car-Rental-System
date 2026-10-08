export const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MPV', 'Luxury'];
export const TRANSMISSIONS = ['Manual', 'Automatic'];
export const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];

export const UNIT_ORDER = ['hour', 'day', 'week', 'month'];
export const UNIT_META = {
  hour: { label: 'Hourly', noun: 'hour', plural: 'hours', hours: 1 },
  day: { label: 'Daily', noun: 'day', plural: 'days', hours: 24 },
  week: { label: 'Weekly', noun: 'week', plural: 'weeks', hours: 168 },
  month: { label: 'Monthly', noun: 'month', plural: 'months', hours: 720 },
};

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit or Debit Card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'wallet', label: 'Digital Wallet', hint: 'Paytm, Amazon Pay, PhonePe, Mobikwik' },
  { id: 'cash', label: 'Offline Payment', hint: 'Pay at pickup counter (Cash / Card)' },
];
export const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'];
export const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'];

export const TYPE_COLORS = {
  Hatchback: '#C8553D',
  Sedan: '#2F6F8F',
  SUV: '#0B6B5F',
  MPV: '#6B5B95',
  Luxury: '#1E2227',
};
