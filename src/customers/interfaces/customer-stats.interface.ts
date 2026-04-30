export interface CustomerStats {
  jami_qarz: number;
  ustama_foiz: number;
  jami_qarz_va_foyda: number;
  foyda: number;
  tolangan: number;
  qolgan_qarz: number;
  oxirgi_sana: Date | null;
  status: string;
}

export interface CustomerWithStats {
  stats: CustomerStats;
}
