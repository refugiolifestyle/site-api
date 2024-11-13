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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, getPagamentoInscrito } from "@/lib/utils"
import { CelulaType, EventoType, InscritoType } from "@/types"
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, DollarSign, MoreVertical, Search, Tag, User, Users } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { toast } from "sonner"
import DialogTablePagamentoCamera from "./dialog-table-inscricoes-pagamento-camera"
import DialogTableCredenciamento from "./dialog-table-inscricoes-credenciamento"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  celulas: CelulaType[]
  evento: EventoType
  inscricoes: InscritoType[]
}

const onBadgeDoubleClick = async (inscrito: InscritoType) => {
  let pagamento = getPagamentoInscrito(inscrito)
  if (pagamento?.tipo != "money") {
    await navigator.clipboard.writeText(pagamento?.url!)
    toast.success("Copiado com sucesso")
  }
}

const TableStatusPagamento = ({ inscrito, evento }: { inscrito: InscritoType, evento: EventoType }) => {
  if (inscrito.credenciamento) {
    return <Badge className="text-xs text-center bg-blue-300" variant="outline">
      Credenciado
    </Badge>
  }

  if (!inscrito.pagamentos) {
    return <Badge className="text-xs text-center" variant="outline">
      Cadastrado
    </Badge>
  }

  let pagamento = getPagamentoInscrito(inscrito)
  if (["paid", "CONCLUIDA"].includes(pagamento?.status!)) {
    return <Badge onDoubleClick={() => onBadgeDoubleClick(inscrito)} className="text-xs text-center text-white bg-green-700" variant="outline">
      Pago
    </Badge>
  }

  if (["ATIVA", "link"].includes(pagamento?.status!)) {
    return <Badge onDoubleClick={() => onBadgeDoubleClick(inscrito)} className="text-xs text-center text-white bg-orange-500" variant="outline">
      Aguardando
    </Badge>
  }

  return <Badge onDoubleClick={() => onBadgeDoubleClick(inscrito)} className="text-xs text-center text-white bg-red-700" variant="outline">
    Não pago
  </Badge>
}

const getStatusPagamento = (inscrito: InscritoType) => {
  if (inscrito.credenciamento) {
    return "Credenciado"
  }

  if (!inscrito.pagamentos) {
    return "Cadastrado"
  }

  let pagamento = getPagamentoInscrito(inscrito)
  if (["paid", "CONCLUIDA"].includes(pagamento?.status!)) {
    return "Pago"
  }

  if (["ATIVA", "link"].includes(pagamento?.status!)) {
    return "Aguardando"
  }

  return "Não pago"
}

const getTipoPagamento = (inscrito: InscritoType) => {
  let tipoPagamento = getPagamentoInscrito(inscrito)?.tipo;

  return !tipoPagamento
    ? '-'
    : tipoPagamento === "credit_card"
      ? "Cartão de crédito"
      : tipoPagamento === "pix"
        ? "Pix"
        : tipoPagamento === "money"
          ? "Dinheiro"
          : "Presencial"
}

export default function CardTableInscricoes({ celulas, evento, inscricoes }: Props) {
  const [page, setPage] = useQueryState("fip", parseAsInteger.withDefault(1))
  const [filterGlobal, setFilterGlobal] = useQueryState("fif")
  const [rede, setRede] = useQueryState("fir")
  const [celula, setCelula] = useQueryState("fic")
  const [situacao, setSituacao] = useQueryState("fis")
  const [tipoPagamento, setTipoPagamento] = useQueryState("fit")

  let inscricoesFiltradas = inscricoes
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !rede ? true : f.rede?.toLowerCase() == rede?.toLowerCase())
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !celula ? true : celula == "Convidado" ? !f.celula : f.celula?.toLowerCase() == celula?.toLowerCase())
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !situacao ? true : getStatusPagamento(f).toLowerCase() == situacao?.toLowerCase())
  inscricoesFiltradas = inscricoesFiltradas.filter(f => !tipoPagamento ? true : getPagamentoInscrito(f)?.tipo?.toLowerCase() == tipoPagamento?.toLowerCase())
  inscricoesFiltradas = inscricoesFiltradas.filter(f => {
    if (!filterGlobal) {
      return true
    }

    return [
      f.rede,
      f.celula?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.nome?.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
      f.cpf,
      new Date(f.pagamento?.pagoEm!).toLocaleString('pt-BR'),
      getStatusPagamento(f)
    ]
      .some(v => v?.toLowerCase().includes(filterGlobal.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()))
  })

  const sorter = new Intl.Collator('pt-BR', { usage: "sort", numeric: true })
  inscricoesFiltradas.sort((a, b) => sorter.compare(`${a.rede}-${a.celula}-${getStatusPagamento(a)}-${a.nome}`, `${b.rede}-${b.celula}-${getStatusPagamento(b)}-${b.nome}`))

  let pagesLength = inscricoesFiltradas.length ? Math.ceil(inscricoesFiltradas.length / 10) : 0

  let redes = celulas.map(c => c.rede)
    .filter((v, i, a) => a.lastIndexOf(v) === i)
    .sort((a, b) => new Intl.Collator("pt-BR", { numeric: true }).compare(a, b))

  return <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Inscrições</CardTitle>
        <CardDescription>
          {
            inscricoesFiltradas.filter(f => ["Pago", "Credenciado"].includes(getStatusPagamento(f))).length
          } inscrições finalizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row mb-2 gap-2">
          <div className="relative flex-1 grow-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Procurar por..."
              className="w-full rounded-lg bg-background pl-8"
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
                  <span className="sr-only xl:not-sr-only">{
                    !rede
                      ? "Todas as redes"
                      : rede
                  }</span>
                  {rede && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
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
                            !rede ? "opacity-100" : "opacity-0"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="sr-only xl:not-sr-only">{
                    !celula
                      ? "Todas as celulas"
                      : celula
                  }</span>
                  {celula && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
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
                            !celula ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as células
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setCelula("Convidado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            celula === "Convidado" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Convidado
                      </CommandItem>
                      {
                        (
                          !rede
                            ? celulas
                            : celulas.filter(f => f.rede === rede)
                        ).map(s => <CommandItem className="cursor-pointer" key={s.celula} onSelect={() => {
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 text-sm relative"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span className="sr-only xl:not-sr-only">{
                    !situacao
                      ? "Todas as situações"
                      : situacao
                  }</span>
                  {situacao && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
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
                            !situacao ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as situações
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao("Credenciado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao === "Credenciado" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Credenciado
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao("Pago")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao === "Pago" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Pago
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao("Não pago")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao === "Não pago" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Não pago
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao("Aguardando")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao === "Aguardando" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Aguardando pagamento
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setSituacao("Cadastrado")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            situacao === "Cadastrado" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Cadastrado
                      </CommandItem>
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
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="sr-only xl:not-sr-only">{
                    !tipoPagamento
                      ? "Todos os pagamentos"
                      : tipoPagamento === "credit_card"
                        ? "Cartão de crédito"
                        : tipoPagamento === "pix"
                          ? "Pix"
                          : tipoPagamento === "money"
                            ? "Dinheiro"
                            : "Presencial"
                  }</span>
                  {tipoPagamento && <span className="absolute bg-red-500 rounded-full size-[8px] top-[10px] right-[10px] md:hidden" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento(null)
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !tipoPagamento ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todos os pagamentos
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento("credit_card")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento === "credit_card" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Cartão de crédito
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento("pix")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento === "pix" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Pix
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento("money")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento === "money" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Dinheiro
                      </CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => {
                        setTipoPagamento("presencial")
                        setPage(1)
                      }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tipoPagamento === "presencial" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Presencial
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
                let inscricoesText = inscricoesFiltradas
                  .map(v => ([v.rede, v.celula, v.nome, getTipoPagamento(v), getStatusPagamento(v)].join('\t')))
                await navigator.clipboard.writeText([
                  "Rede\tCélula\tNome\tPagamento\tSituação",
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
              <TableHead className="hidden md:table-cell">
                Célula
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">
                CPF
              </TableHead>
              <TableHead>
                Pagamento
              </TableHead>
              <TableHead>
                Situação
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              inscricoesFiltradas
                .slice((page - 1) * 10, page * 10 > inscricoesFiltradas.length ? inscricoesFiltradas.length : page * 10)
                .map((inscrito, i) => <TableRow key={inscrito.cpf} className={i % 2 == 0 ? "bg-accent" : "null"}>
                  <TableCell className="hidden md:table-cell">
                    {inscrito.rede || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {inscrito.celula || 'Convidado'}
                  </TableCell>
                  <TableCell>
                    {inscrito.nome}
                    <div className="text-sm text-muted-foreground md:hidden lg:hidden xl:hidden">
                      {inscrito.celula || 'Convidado'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" onDoubleClick={async () => {
                    await navigator.clipboard.writeText(inscrito.cpf)
                    toast.success("Copiado com sucesso")
                  }}>
                    {inscrito.cpf.replace(/\d{3}(\d{3})(\d{2})\d{3}/, '***.$1.$2*-**')}
                  </TableCell>
                  <TableCell>
                    {
                      getTipoPagamento(inscrito)
                    }
                  </TableCell>
                  <TableCell>
                    <TableStatusPagamento evento={evento} inscrito={inscrito} />
                  </TableCell>
                  <TableCell className="text-right flex space-x-2">

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {
                          !["CONCLUIDA", "paid"].includes(getPagamentoInscrito(inscrito)?.status!)
                          && <DialogTablePagamentoCamera evento={evento} inscrito={inscrito} />
                        }
                        {
                          inscrito.credenciamento
                          && <DialogTableCredenciamento evento={evento} inscrito={inscrito} outside />
                        }
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `tel:+55${inscrito.telefone}`}>
                          Ligar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `https://wa.me/55${inscrito.telefone}`}>
                          Mandar mensagem
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `mailto:${inscrito.email}`}>
                          Enviar email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          <span className="font-medium">{page * 10 > inscricoesFiltradas.length ? inscricoesFiltradas.length : page * 10}</span>{' '}
          de{' '}
          <span className="font-medium">{inscricoesFiltradas.length}</span> linhas
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
