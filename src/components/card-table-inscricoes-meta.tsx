"use client"

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
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { CelulaType, EventoType, InscritoType } from "@/types"
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Loader2, Search, Tag, User, Users } from "lucide-react"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "./ui/badge"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  celulas: CelulaType[]
  evento: EventoType
  inscricoes: InscritoType[]
}

type CelulaControle = {
  rede: string,
  celula: string,
  lider?: string,
  inscricoes: number
}

function getMetaStatus(evento: EventoType, celulaControle: CelulaControle) {
  if (celulaControle.celula == "Convidado") {
    return ""
  }

  if (celulaControle.inscricoes < 10) {
    return "Não chegou na Meta"
  } else {
    const celulaId = celulaControle.celula.replaceAll(/[^\d]+/g, '')
    return evento.metaBatida?.hasOwnProperty(celulaId)
      ? "Meta confirmada"
      : "Chegou na meta"
  }
}

function MetaStatus({ evento, celulaControle }: { evento: EventoType, celulaControle: CelulaControle }) {
  if (celulaControle.inscricoes < 10) {
    return <Badge className="text-xs text-center" variant="destructive">
      Não chegou na Meta
    </Badge>
  } else {
    const celulaId = celulaControle.celula.replaceAll(/[^\d]+/g, '')
    return evento.metaBatida?.hasOwnProperty(celulaId)
      ? <Badge className="text-xs text-center text-white bg-green-700" variant="outline">
        Meta confirmada
      </Badge>
      : <Badge className="text-xs text-center" variant="outline">
        Chegou na Meta
      </Badge>
  }
}

const handleOnFilterClick = (setFn: any, value: string) => {
  setFn((old: string[] | null) => {
    if (!old) {
      old = []
    }

    let nOld = old.includes(value) ? old.filter(o => o != value) : old.concat([value])
    return nOld.length == 0 ? null : nOld
  })
}

export default function CardTableInscricoesMeta({ celulas, evento, inscricoes }: Props) {
  const [page, setPage] = useQueryState("fmp", parseAsInteger.withDefault(1))
  const [filterGlobal, setFilterGlobal] = useQueryState("fmf")
  const [rede, setRede] = useQueryState("fmr", parseAsArrayOf(parseAsString))
  const [celula, setCelula] = useQueryState("fmc", parseAsArrayOf(parseAsString))
  const [situacao, setSituacao] = useQueryState("fms", parseAsArrayOf(parseAsString))

  let inscricoesControle: Record<string, CelulaControle> = {}
  celulas.forEach(c => {
    inscricoesControle[c.celula] = {
      rede: c.rede || "",
      celula: c.celula,
      inscricoes: 0,
      lider: c.lider
    }
  })

  inscricoesControle["Convidado"] = {
    rede: "",
    celula: "Convidado",
    inscricoes: 0
  }

  inscricoes.forEach(i => {
    inscricoesControle[i.celula || "Convidado"].inscricoes += 1
  })

  let celulasFiltradas: CelulaControle[] = Object.values(inscricoesControle)
  celulasFiltradas = celulasFiltradas.filter(f => !rede?.length ? true : rede?.includes(f.rede!))
  celulasFiltradas = celulasFiltradas.filter(f => !celula?.length ? true : celula?.includes("Convidado") ? !f.celula : celula?.includes(f.celula!))
  celulasFiltradas = celulasFiltradas.filter(f => !situacao?.length ? true : situacao?.includes(getMetaStatus(evento, f)))
  celulasFiltradas = celulasFiltradas.filter(f => {
    if (!filterGlobal) {
      return true
    }

    let filterByQuantity = /(<|>|>=|<=|=)\s?(\d+)/g.exec(filterGlobal)
    let filterByArray = [
      f.rede,
      f.celula?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.lider?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      getMetaStatus(evento, f).toLowerCase(),
      f.inscricoes
    ]
      .some(v => String(v!).toLowerCase().includes(filterGlobal.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()))

    return filterByArray
      || (
        !filterByQuantity
          ? true
          : filterByQuantity[1] == ">" ? f.inscricoes > parseInt(filterByQuantity[2])
            : filterByQuantity[1] == "<" ? f.inscricoes < parseInt(filterByQuantity[2])
              : filterByQuantity[1] == "<=" ? f.inscricoes <= parseInt(filterByQuantity[2])
                : filterByQuantity[1] == ">=" ? f.inscricoes >= parseInt(filterByQuantity[2])
                  : f.inscricoes == parseInt(filterByQuantity[2])
      )
  })

  const sorter = new Intl.Collator('pt-BR', { usage: "sort", numeric: true })
  celulasFiltradas.sort((a, b) => sorter.compare(`${b.inscricoes}-${b.rede}-${b.celula}`, `${a.inscricoes}-${a.rede}-${a.celula}`))

  let pagesLength = celulasFiltradas.length ? Math.ceil(celulasFiltradas.length / 10) : 0

  let redes = celulas.map(c => c.rede)
    .filter((v, i, a) => a.lastIndexOf(v) === i)
    .sort((a, b) => new Intl.Collator("pt-BR", { numeric: true }).compare(a, b))

  return <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Metas por célula</CardTitle>
        <CardDescription>
          {
            Object.values(inscricoesControle).filter(f => f.inscricoes >= evento.meta! && getMetaStatus(evento, f) === "Meta confirmada").length
          } confirmadas de {
            Object.values(inscricoesControle).filter(f => f.inscricoes >= evento.meta!).length
          } que chegaram na meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row mb-2 gap-2">
          <div className="relative flex-1 grow-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Procurar por..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={filterGlobal || ""}
              onChange={e => {
                setFilterGlobal(e.target.value || null)
                setPage(1)
              }}
            />
          </div>
          <div className="flex mb-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !rede?.length
                      ? "Todas as redes"
                      : rede.join(', ')
                  }</span>
                  {rede?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma rede encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setRede(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !rede?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as Redes
                      </CommandItem>
                      {
                        redes.map(r => <CommandItem className="cursor-pointer" key={r} onSelect={() => {
                          handleOnFilterClick(setRede, r)
                          setPage(1)
                        }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              rede?.includes(r) ? "opacity-100" : "opacity-0"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !celula?.length
                      ? "Todas as celulas"
                      : celula.join(', ')
                  }</span>
                  {celula?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma celula encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setCelula(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !celula?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as células
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setCelula, "Convidado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            celula?.includes("Convidado") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Convidado
                      </CommandItem>
                      {
                        (
                          !rede
                            ? celulas
                            : celulas.filter(f => rede?.includes(`Rede ${f.rede}`))
                        ).map(s => <CommandItem className="cursor-pointer" key={`Rede ${s.celula}`} onSelect={() => {
                          handleOnFilterClick(setCelula, s.celula)
                          setPage(1)
                        }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              celula?.includes(s.celula) ? "opacity-100" : "opacity-0"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span className="hidden xl:block w-full max-w-[150px] truncate">{
                    !situacao?.length
                      ? "Todas as situações"
                      : situacao.join(', ')
                  }</span>
                  {situacao?.length && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !situacao?.length ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as situações
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Meta confirmada")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Meta confirmada") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Meta confirmada
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Chegou na meta")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Chegou na meta") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Chegou na meta
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        handleOnFilterClick(setSituacao, "Não chegou na Meta")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao?.includes("Não chegou na Meta") ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Não chegou na Meta
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="gap-1 text-sm"
              onClick={async () => {
                let inscricoesText = celulasFiltradas
                  .map(v => ([v.rede, v.celula, v.lider, v.inscricoes].join('\t')))
                await navigator.clipboard.writeText([
                  "Rede\tCélula\tLider\tInscrições",
                  ...inscricoesText
                ].join('\n'))
                toast.success("Copiado com sucesso")
              }}
            >
              <Copy className="h-3.5 w-3.5" />
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
              <TableHead className="hidden md:table-cell">
                Líder
              </TableHead>
              <TableHead>Total de Inscrições</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead></TableHead>
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
                    <div className="text-sm text-muted-foreground md:hidden lg:hidden xl:hidden">
                      {celulaFiltrada.lider}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {celulaFiltrada.lider || '-'}
                  </TableCell>
                  <TableCell>
                    {celulaFiltrada.inscricoes}
                  </TableCell>
                  <TableCell>
                    {
                      celulaFiltrada.celula != 'Convidado'
                      && <MetaStatus evento={evento} celulaControle={celulaFiltrada} />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      celulaFiltrada.celula != 'Convidado'
                      && <ConfirmaBateuMeta evento={evento} celula={celulaFiltrada} />
                    }
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
  </div >
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
      ? null
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