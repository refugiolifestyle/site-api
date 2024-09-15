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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CelulaType, EventoType, InscritoType, Pagamento } from "@/types"
import { TabsContent } from "@radix-ui/react-tabs"
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, File, ListFilter, MoreVertical, PlusCircle, Search, User, Users } from "lucide-react"
import { ReactElement, ReactNode, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { cn } from "@/lib/utils"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  celulas: CelulaType[]
  evento: EventoType
  inscricoes: InscritoType[]
}

const TableStatusPagamento = ({ inscrito }: { inscrito: InscritoType }) => {
  if (!inscrito.pagamento) {
    return <Badge className="text-xs" variant="outline">
      Cadastrado
    </Badge>
  }

  switch (inscrito.pagamento.status) {
    case 'paid':
    case 'CONCLUIDA': return <Badge className="text-xs text-white bg-green-700" variant="outline">
      Pago
    </Badge>
    case 'unpaid':
    case 'canceled': return <Badge className="text-xs text-white bg-red-700" variant="outline">
      Não pago
    </Badge>
    default: return <Badge className="text-xs text-white bg-orange-500" variant="outline">
      Aguardando pagamento
    </Badge>
  }
}

const getStatusPagamento = (inscrito: InscritoType) => {
  if (!inscrito.pagamento) {
    return "Cadastrado"
  }

  switch (inscrito.pagamento.status) {
    case 'paid':
    case 'CONCLUIDA': return "Pago"
    case 'unpaid':
    case 'canceled': return "Não pago"
    default: return "Aguardando pagamento"
  }
}

export default function CardTableInscricoes({ celulas, evento, inscricoes }: Props) {
  const [page, setPage] = useState<number>(1)
  const [filterGlobal, setFilterGlobal] = useState("")
  const [rede, setRede] = useState("Todos")
  const [redeOpen, setRedeOpen] = useState(false)
  const [celula, setCelula] = useState("Todos")
  const [celulaOpen, setCelulaOpen] = useState(false)

  let inscricoesFiltradas = inscricoes
  inscricoesFiltradas = inscricoesFiltradas.filter(f => rede == "Todos" ? true : f.rede?.toLowerCase() == rede.toLowerCase())
  inscricoesFiltradas = inscricoesFiltradas.filter(f => celula == "Todos" ? true : f.celula?.toLowerCase() == celula.toLowerCase())
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
      .some(v => v?.toLowerCase().startsWith(filterGlobal.toLowerCase()))
  })

  const sorter = new Intl.Collator('pt-BR', { usage: "sort", numeric: true })
  inscricoesFiltradas.sort((a, b) => sorter.compare(`${a.rede}-${a.celula}-${getStatusPagamento(a)}-${a.nome}`, `${b.rede}-${b.celula}-${getStatusPagamento(b)}-${b.nome}`))

  let pagesLength = inscricoesFiltradas.length ? Math.ceil(inscricoesFiltradas.length / 10) : 0

  let redes = celulas.map(c => `Rede ${c.rede}`)
    .filter((v, i, a) => a.lastIndexOf(v) === i)
    .sort((a, b) => new Intl.Collator("pt-BR", { numeric: true }).compare(a, b))

  return <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Inscrições</CardTitle>
        <CardDescription>
          800 inscrições finalizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2 gap-2">
          <div className="relative flex-1">
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
                className="h-7 gap-1 text-sm"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">{
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
                    <CommandItem onSelect={() => setRede("Todos")}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          rede === "Todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas as Redes
                    </CommandItem>
                    {
                      redes.map(r => <CommandItem key={r} onSelect={() => setRede(r)}>
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
                className="h-7 gap-1 text-sm"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">{
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
                    <CommandItem onSelect={() => setCelula("Todos")}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          celula === "Todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas as células
                    </CommandItem>
                    <CommandItem onSelect={() => setCelula("")}>
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
                      ).map(s => <CommandItem key={`Rede ${s.celula}`} onSelect={() => setCelula(s.celula)}>
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">
                Rede
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                Célula
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">
                CPF
              </TableHead>
              <TableHead className="hidden md:table-cell">
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
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {inscrito.cpf.replace(/\d{3}(\d{3})(\d{2})\d{3}/, '***.$1.$2*-**')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <TableStatusPagamento inscrito={inscrito} />
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
              <Button onClick={() => setPage(page == 1 ? 1 : page - 1)} size="icon" variant="outline" className="size-8">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Anterior</span>
              </Button>
            </PaginationItem>
            <div className="text-sm text-muted-foreground mx-2">
              Página {page} de {pagesLength}
            </div>
            <PaginationItem>
              <Button onClick={() => setPage(page + 1 > pagesLength ? pagesLength : page + 1)} size="icon" variant="outline" className="size-8">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Próximo</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  </div>
}