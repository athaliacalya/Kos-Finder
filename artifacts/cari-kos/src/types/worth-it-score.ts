export interface FactorDetail {
  score: number
  weight: number
  label: string
  explanation: string
}

export type FactorKey = "harga" | "fasilitas" | "lokasi" | "keamanan" | "rating"

export interface WorthItScoreData {
  total: number
  grade: string
  factors: Record<FactorKey, FactorDetail>
  cityContext: {
    campusName: string
    peerCount: number
    avgHarga: number
  }
}
