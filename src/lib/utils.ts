import { InscritoType } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPagamentoInscrito(inscrito: InscritoType) {
  if (!inscrito.pagamentos) {
    return null
  }
    
  return Object.values(inscrito.pagamentos)
    .sort((a, b) => Date.parse(a.criadoEm!) - Date.parse(b.criadoEm!))
    .pop()
}