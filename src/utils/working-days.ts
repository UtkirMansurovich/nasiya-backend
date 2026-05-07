// Boshlanish sanasiga qarab ishchi kunlarini hisoblash
// Dushanba (1) - ishlamaydi
export const calculateWorkingDays = (
  startDate: Date,
  durationDays: number,
): number => {
  let workingDays = 0;
  const current = new Date(startDate);

  for (let i = 0; i < durationDays; i++) {
    // 1 = Dushanba
    if (current.getDay() !== 1) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

// Jami qarzni hisoblash
export const calculateTotalDebt = (
  costPrice: number,
  markupPercent: number,
): number => {
  return costPrice * (1 + markupPercent / 100);
};

// Kunlik to'lovni hisoblash
export const calculateDailyPayment = (
  totalDebt: number,
  workingDays: number,
): number => {
  if (workingDays === 0) return 0;
  return Math.ceil(totalDebt / workingDays);
};
