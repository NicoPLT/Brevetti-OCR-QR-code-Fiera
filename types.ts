
export interface ProductRow {
  name: string;
  clienteBS: 'SI' | 'NO' | null;
  competitor: string;
}

export interface ReportData {
  products: ProductRow[];
  sources: string[];
  actionsFiera: string[];
  actionsFuture: string[];
}

export interface Fiera {
  id: string;
  name: string;
  timestamp: number;
}

// Dati grezzi estratti dall'OCR (senza ID e Timestamp)
export interface ScannedCardData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  ruolo: string;
  azienda: string;
  sito_web: string;
  indirizzo: string;
  note: string;
  report?: ReportData;
  fieraId?: string; // ID della fiera di appartenenza
}

// Dati completi salvati nel sistema
export interface BusinessCardData extends ScannedCardData {
  id: string;
  timestamp: number;
}

export interface ExtractionResult {
  data?: ScannedCardData;
  error?: string;
}
