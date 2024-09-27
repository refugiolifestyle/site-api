"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CelulaType, EventoType, InscritoType } from "@/types";
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, DollarSign, Loader2, Plus, Search, Trash, User, Users, X } from "lucide-react";
import { parseAsInteger, useQueryState } from 'nuqs';
import { toast } from "sonner";
import useSessionStorageState from 'use-session-storage-state';
import DialogTableCredenciamentoCamera from "./dialog-table-inscricoes-credenciamento-camera";
import useSWR from 'swr'
import DialogTableCredenciamento from "./dialog-table-inscricoes-credenciamento";
import { useRef } from "react";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    celulas: CelulaType[]
    evento: EventoType
}

const TableStatusPagamento = ({ inscrito, evento }: { inscrito: InscritoType, evento: EventoType }) => {
    if (!inscrito.pagamento) {
        return <Badge className="text-xs text-center" variant="outline">
            Cadastrado
        </Badge>
    }

    if (inscrito.credenciamento) {
        return <Badge className="text-xs text-center bg-blue-300" variant="outline">
            Credenciado{evento.kits && evento.kits?.includes(inscrito.cpf) ? " - 100 Primeiros" : ""}
        </Badge>
    }

    switch (inscrito.pagamento.status) {
        case 'paid':
        case 'CONCLUIDA': return <Badge onDoubleClick={async () => {
            await navigator.clipboard.writeText(inscrito.pagamento?.url!)
            toast.success("Copiado com sucesso")
        }} className="text-xs text-center text-white bg-green-700" variant="outline">
            Pago{evento.kits && evento.kits?.includes(inscrito.cpf) ? " - 100 Primeiros" : ""}
        </Badge>
        case 'unpaid':
        case 'canceled': return <Badge onDoubleClick={async () => {
            await navigator.clipboard.writeText(inscrito.pagamento?.url!)
            toast.success("Copiado com sucesso")
        }} className="text-xs text-center text-white bg-red-700" variant="outline">
            Não pago
        </Badge>
        default: return <Badge onDoubleClick={async () => {
            await navigator.clipboard.writeText(inscrito.pagamento?.url!)
            toast.success("Copiado com sucesso")
        }} className="text-xs text-center text-white bg-orange-500" variant="outline">
            Aguardando
        </Badge>
    }
}

const getStatusPagamento = (inscrito: InscritoType) => {
    if (!inscrito.pagamento) {
        return "Cadastrado"
    }

    if (inscrito.credenciamento) {
        return "Credenciado"
    }

    switch (inscrito.pagamento.status) {
        case 'paid':
        case 'CONCLUIDA': return "Pago"
        case 'unpaid':
        case 'canceled': return "Não pago"
        default: return "Aguardando"
    }
}

export default function CardTableCredenciamento({ celulas, evento }: Props) {
    const { data, isLoading, isValidating } = useSWR<{ inscricoes: InscritoType[] }>(`evento/${evento.id}/inscricoes`,
        () => fetch(`/api/eventos/${evento.id}/inscricoes`)
            .then(r => r.json()), {
        revalidateOnFocus: false
    })

    const [page, setPage] = useQueryState("fcp", parseAsInteger.withDefault(1))
    const [filterGlobal, setFilterGlobal] = useQueryState("fcf")
    const filterGlobalRef = useRef<HTMLInputElement>(null)

    const [servo, setServo, { removeItem: limparServo }] = useSessionStorageState<string>('servo-credenciamento')
    const adicionarServo = () => {
        let servoPrompt = prompt("Qual o seu nome")
        if (!servoPrompt) {
            return;
        }

        if (servoPrompt.length < 10) {
            alert("Seu nome precisa ter mais de 10 caracteres")
            return;
        }

        setServo(servoPrompt)
    }

    const onLimparFiltro = () => {
        setFilterGlobal(null)
        if (filterGlobalRef.current) {
            filterGlobalRef.current.value = ""
        }
    }

    const onFiltrar = () => {
        setFilterGlobal(filterGlobalRef.current?.value as string)
    }

    let inscricoesFiltradas = data?.inscricoes || []
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

    return <div className="grid gap-6">
        <Card>
            <CardHeader>
                <div className="flex flex-row items-center">
                    <div className="flex-1">
                        <CardTitle>Servo</CardTitle>
                        {
                            servo
                                ? <CardDescription>{servo}</CardDescription>
                                : <CardDescription>Aperte no botão ao lado para adicionar seu nome e então realizar os credenciamentos</CardDescription>
                        }
                    </div>
                    {
                        servo
                            ? <Button variant={"ghost"} size={"icon"} onClick={limparServo}>
                                <Trash className="size-4" />
                            </Button>
                            : <Button variant={"ghost"} size={"icon"} onClick={adicionarServo}>
                                <Plus className="size-4" />
                            </Button>
                    }
                </div>
            </CardHeader>
        </Card>
        {
            servo
            && <Card>
                <CardHeader>
                    <div className="flex flex-row items-center">
                        <div className="flex-1">
                            <CardTitle>Credenciamento</CardTitle>
                            <CardDescription>
                                {data?.inscricoes.filter(f => getStatusPagamento(f) === "Credenciado").length} de {data?.inscricoes.filter(f => ["Pago", "Credenciado"].includes(getStatusPagamento(f))).length} inscrições credenciadas
                            </CardDescription>
                        </div>
                        {
                            isValidating && !isLoading
                            && <Loader2 className="size-4 animate-spin" />
                        }
                    </div>
                </CardHeader>
                {
                    isLoading
                        ? <CardContent>
                            <Loader2 className="size-4 animate-spin" />
                        </CardContent>
                        : <>
                            <CardContent>
                                <div className="flex items-center mb-2 gap-2">
                                    <Input
                                        ref={filterGlobalRef}
                                        type="search"
                                        placeholder="Procurar por nome, célula, rede, cpf"
                                        className="w-full flex-1 rounded-lg bg-background"
                                    />
                                    {
                                        filterGlobal
                                        && <Button onClick={onLimparFiltro} variant={"outline"} size={"icon"}>
                                            <X className="size-4" />
                                        </Button>
                                    }
                                    <Button className="space-x-2" variant={"outline"} onClick={onFiltrar}>
                                        <Search className="size-4" />
                                        <span className="sr-only lg:not-sr-only">Pesquisar</span>
                                    </Button>
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
                                                        <TableStatusPagamento evento={evento} inscrito={inscrito} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {
                                                            inscrito.credenciamento
                                                                ? <DialogTableCredenciamento evento={evento} inscrito={inscrito} />
                                                                : getStatusPagamento(inscrito) === "Pago"
                                                                    ? <DialogTableCredenciamentoCamera evento={evento} inscrito={inscrito} servo={servo} />
                                                                    : null
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
                        </>
                }
            </Card>
        }
    </div>
}
