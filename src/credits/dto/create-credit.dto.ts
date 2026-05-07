export class CreateCreditDto {
  customerId!: number;
  partnerId?: number;
  product_name!: string;
  cost_price!: number;
  markup_percent!: number;
  duration_days!: number;
  start_date!: string;
  notes?: string;
}
