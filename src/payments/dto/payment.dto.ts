export class CreatePaymentDto {
  creditId!: number;
  amount!: number;
  method?: 'cash' | 'card' | 'transfer';
  notes?: string;
  payment_date?: string;
}

export class ImportPaymentDto {
  customer_phone!: string;
  product_name!: string;
  method?: 'cash' | 'card' | 'transfer';
  notes?: string;
  [date: string]: string | number | undefined;
}
