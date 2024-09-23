"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { CelulaType, EventoType, InscritoType } from "@/types"
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, DollarSign, Loader2, MoreVertical, Search, User, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useForm, SubmitHandler } from "react-hook-form"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  celulas: CelulaType[]
  evento: EventoType
  inscricoes: InscritoType[]
}

type CelulaControle = { rede: string, celula: string, lider?: string, inscricoes: number }

export default function CardTableInscricoesMeta({ celulas, evento, inscricoes }: Props) {
  const [page, setPage] = useState<number>(1)
  const [filterGlobal, setFilterGlobal] = useState("")
  const [rede, setRede] = useState("Todos")
  const [redeOpen, setRedeOpen] = useState(false)
  const [celula, setCelula] = useState("Todos")
  const [celulaOpen, setCelulaOpen] = useState(false)

  let inscricoesControle: Record<string, CelulaControle> = {}
  inscricoes.forEach(i => {
    if (!inscricoesControle[i.celula || "Convidado"]) {
      let celula = celulas.find(c => c.celula == i.celula)

      inscricoesControle[i.celula || "Convidado"] = {
        rede: i.rede || "",
        celula: i.celula || "Convidado",
        inscricoes: 0,
        lider: celula?.lider
      }
    }

    inscricoesControle[i.celula || "Convidado"].inscricoes += 1
  })

  let celulasFiltradas: CelulaControle[] = Object.values(inscricoesControle)
  celulasFiltradas = celulasFiltradas.filter(f => rede == "Todos" ? true : f.rede?.toLowerCase() == rede.toLowerCase())
  celulasFiltradas = celulasFiltradas.filter(f => celula == "Todos" ? true : f.celula?.toLowerCase() == celula.toLowerCase())
  celulasFiltradas = celulasFiltradas.filter(f => {
    if (!filterGlobal) {
      return true
    }

    return [
      f.rede,
      f.celula?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.inscricoes
    ]
      .some(v => String(v!).toLowerCase().startsWith(filterGlobal.toLowerCase()))
  })

  const sorter = new Intl.Collator('pt-BR', { usage: "sort", numeric: true })
  celulasFiltradas.sort((a, b) => sorter.compare(`${b.inscricoes}-${b.rede}-${b.celula}`, `${a.inscricoes}-${a.rede}-${a.celula}`))

  let pagesLength = celulasFiltradas.length ? Math.ceil(celulasFiltradas.length / 10) : 0

  let redes = celulas.map(c => `Rede ${c.rede}`)
    .filter((v, i, a) => a.lastIndexOf(v) === i)
    .sort((a, b) => new Intl.Collator("pt-BR", { numeric: true }).compare(a, b))

  return <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Meta</CardTitle>
        <CardDescription>
          {
            celulasFiltradas.filter(f => f.inscricoes >= evento.meta!).length
          } inscrições que bateram a meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end mb-2 gap-2">
          <div className="relative flex-1 grow-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Procurar por..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              onChange={e => setFilterGlobal(e.target.value)}
            />
          </div>
          <Popover open={redeOpen} onOpenChange={setRedeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-sm"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="sr-only xl:not-sr-only">{
                  rede == "Todos"
                    ? "Todas as redes"
                    : rede
                }</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Pesquisar..." />
                <CommandList>
                  <CommandEmpty>Nenhuma rede encontrada.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem className="cursor-pointer" onSelect={() => {
                      setRede("Todos")
                      setPage(1)
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          rede === "Todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas as Redes
                    </CommandItem>
                    {
                      redes.map(r => <CommandItem className="cursor-pointer" key={r} onSelect={() => {
                        setRede(r)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            rede === r ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {r}
                      </CommandItem>)
                    }
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={celulaOpen} onOpenChange={setCelulaOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-sm"
              >
                <User className="h-3.5 w-3.5" />
                <span className="sr-only xl:not-sr-only">{
                  celula == "Todos"
                    ? "Todas as celulas"
                    : celula == ""
                      ? "Convidado"
                      : celula
                }</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Pesquisar..." />
                <CommandList>
                  <CommandEmpty>Nenhuma celula encontrada.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem className="cursor-pointer" onSelect={() => {
                      setCelula("Todos")
                      setPage(1)
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          celula === "Todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas as células
                    </CommandItem>
                    <CommandItem className="cursor-pointer" onSelect={() => {
                      setCelula("")
                      setPage(1)
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          celula === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Convidado
                    </CommandItem>
                    {
                      (
                        rede == "Todos"
                          ? celulas
                          : celulas.filter(f => `Rede ${f.rede}` === rede)
                      ).map(s => <CommandItem className="cursor-pointer" key={`Rede ${s.celula}`} onSelect={() => {
                        setCelula(s.celula)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            celula === s.celula ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {s.celula}
                      </CommandItem>)
                    }
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-sm"
              onClick={async () => {
                let inscricoesText = celulasFiltradas
                  .map(v => ([v.rede, v.celula, v.lider, v.inscricoes].join('\t')))
                await navigator.clipboard.writeText([
                  "Rede\tCélula\tLíder\tTotal de Inscrições",
                  ...inscricoesText
                ].join('\n'))
                toast.success("Copiado com sucesso")
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only xl:not-sr-only">Copiar dados</span>
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">
                Rede
              </TableHead>
              <TableHead>Célula</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Total de Inscrições</TableHead>
              <TableHead>Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              celulasFiltradas
                .slice((page - 1) * 10, page * 10 > celulasFiltradas.length ? celulasFiltradas.length : page * 10)
                .map((celulaFiltrada, i) => <TableRow key={celulaFiltrada.celula} className={i % 2 == 0 ? "bg-accent" : "null"}>
                  <TableCell className="hidden md:table-cell">
                    {celulaFiltrada.rede || '-'}
                  </TableCell>
                  <TableCell>
                    {celulaFiltrada.celula || 'Convidado'}
                  </TableCell>
                  <TableCell>
                    {celulaFiltrada.lider || '-'}
                  </TableCell>
                  <TableCell>
                    {celulaFiltrada.inscricoes}
                  </TableCell>
                  <TableCell>
                    <ConfirmaBateuMeta evento={evento} celula={celulaFiltrada} />
                  </TableCell>
                </TableRow>)
            }
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando de <span className="font-medium">{((page - 1) * 10) + 1}</span>{' '}
          até{' '}
          <span className="font-medium">{page * 10 > celulasFiltradas.length ? celulasFiltradas.length : page * 10}</span>{' '}
          de{' '}
          <span className="font-medium">{celulasFiltradas.length}</span> linhas
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button onClick={() => setPage(1)} size="icon" variant="outline" className="size-8">
                <ChevronsLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Primeiro</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button onClick={() => setPage(page == 1 ? 1 : page - 1)} size="icon" variant="outline" className="size-8">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Anterior</span>
              </Button>
            </PaginationItem>
            <div className="text-sm text-muted-foreground mx-2 sr-only lg:not-sr-only">
              Página {page} de {pagesLength}
            </div>
            <PaginationItem>
              <Button onClick={() => setPage(page + 1 > pagesLength ? pagesLength : page + 1)} size="icon" variant="outline" className="size-8">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Próximo</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button onClick={() => setPage(pagesLength)} size="icon" variant="outline" className="size-8">
                <ChevronsRight className="h-3.5 w-3.5" />
                <span className="sr-only">Último</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  </div>
}

const ConfirmaBateuMeta = ({ celula, evento }: { celula: CelulaControle, evento: EventoType }) => {
  const CONFIRMACAO_NEGADA_ERRO = "Confirmação negada"
  
  const form = useForm()
  const celulaId = celula.celula.replaceAll(/[^\d]+/g, '')

  const onSubmit: SubmitHandler<any> = async () => {
    try {
      let confirmar = confirm("Deseja confirmar realmente?")
      if (!confirmar) {
        throw CONFIRMACAO_NEGADA_ERRO;
      }

      let response = await fetch(`/api/eventos/${evento.id}/metaBatida/${celulaId}`, { method: "PATCH" })
      if (!response.ok) {
        throw "Falha ao confirmar a meta"
      }
    } catch (error) {
      if (error != CONFIRMACAO_NEGADA_ERRO) {
        alert(error)
      }

      throw error;
    }
  }

  return celula.inscricoes >= evento.meta!
    ? form.formState.isSubmitSuccessful
      || evento.metaBatida?.hasOwnProperty(celulaId)
      ? 'Confirmada'
      : <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="outline"
          className="space-x-2">
          {
            form.formState.isSubmitting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Check className="h-4 w-4" />
          }
          <span className="sr-only lg:not-sr-only">Confirmar meta</span>
        </Button>
      </form>
    : null
}