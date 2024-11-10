"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSWRConfig } from 'swr'

import useSWRMutation from 'swr/mutation'

import { Credenciamento, EventoType, InscritoType, Pagamento } from "@/types";
import { Loader2, Ticket, TicketCheck, TicketPlus, Tickets } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { withMask } from 'use-mask-input';

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogTablePagamentoCamera({ evento, inscrito }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [valor, setValor] = useState('')
    const fileInput = useRef<HTMLInputElement>(null)

    const { trigger, isMutating, error } = useSWRMutation(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/pagamento/presencial`,
        (url, { arg }: { arg: { foto?: string, valor: string } }) => fetch(url, { method: "POST", body: JSON.stringify(arg), signal: AbortSignal.timeout(60000) }).then(r => r.json()))

    const salvar = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) {
            return false
        }

        let fotoReader = new FileReader()
        fotoReader.onloadend = async () => {
            await enviarDados(fotoReader.result as string)
        }

        let foto = e.target.files.item(0)
        fotoReader.readAsDataURL(foto!)
    }

    const enviarDados = async (foto?: string) => {
        try {
            await trigger({
                foto, valor
            })

            if (error) {
                throw error
            }

            setDialogOpen(false)
            alert("Pagamento realizado com sucesso")
        } catch (e: any) {
            if (e.name === "TimeoutError") {
                alert("Houve uma grande demora, tente novamente")
            } else {
                alert("Falha ao pagar a inscrição do inscrito")
            }

            console.error(e)
        }
    }

    return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                Pag. presencial
            </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="w-full max-w-[425px]">
            <DialogHeader className="text-left">
                <DialogTitle>Pagamento presencial</DialogTitle>
                <DialogDescription>Siga os passos abaixo para concluir o pagamento</DialogDescription>
            </DialogHeader>
            <div className="px-4">
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={salvar} />
                <ul className="list-decimal font-extralight text-justify">
                    <li>Realize o pagamento.</li>
                    <li>Adicione o valor</li>
                    <li>Tire uma foto do comprovante, se possível.</li>
                    <li>Tudo certo.</li>
                </ul>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="valor">Valor</Label>
                <Input id="valor" type="number" onChange={e => setValor(e.target.value)} value={valor} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"ghost"}>Cancelar</Button>
                </DialogClose>
                <Button
                    variant={"outline"}
                    disabled={isMutating || !valor}
                    onClick={() => fileInput.current?.click()}>
                    Tirar foto e finalizar
                </Button><Button
                    variant={"outline"}
                    disabled={isMutating || !valor}
                    className="bg-green-700 text-white"
                    onClick={async () => await enviarDados()}>
                    Finalizar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}