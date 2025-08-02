export interface PurchaseLogByEntityDto {
  id: number;
  created_at: string; // se recomienda string en ISO para el frontend
  content: string;
  name: string; // nombre de la compra
}
