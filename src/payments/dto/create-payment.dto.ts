export class CreatePaymentDto {
  creditId!: number;
  amount!: number;
  method?: 'cash' | 'card' | 'transfer';
  notes?: string;
}
