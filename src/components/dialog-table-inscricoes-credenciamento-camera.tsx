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

import { Credenciamento, EventoType, InscritoType } from "@/types";
import { Loader2, TicketCheck, TicketPlus } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "./ui/button";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType,
    servo: string
}

export default function DialogTableCredenciamentoCamera({ evento, inscrito, servo }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)

    const { mutate } = useSWRConfig()
    const { trigger, isMutating, error } = useSWRMutation(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/credenciamento`,
        (url, { arg }: { arg: Partial<Credenciamento>}) => fetch(url, { method: "PATCH", body: JSON.stringify(arg), signal: AbortSignal.timeout(60000) }).then(r => r.json()))

    const salvar = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) {
            return false
        }

        let fotoReader = new FileReader()
        fotoReader.onloadend = async () => {
            try {
                await trigger({
                    comprovante: fotoReader.result as string,
                    servo
                })

                if (error) {
                    throw error
                }

                setDialogOpen(false)
                mutate(`evento/${evento.id}/inscricoes`)
                alert("Credenciamento realizado com sucesso")
            } catch (e: any) {
                if (e.name === "TimeoutError") {
                    alert("Houve uma grande demora, tente novamente")
                } else {
                    alert("Falha ao credenciar o inscrito")
                }

                console.error(e)
            }
        }

        let foto = e.target.files.item(0)
        fotoReader.readAsDataURL(foto!)
    }

    return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                className="flex space-x-2">
                <TicketPlus className="size-4" />
                <span className="sr-only lg:not-sr-only">Fazer credenciamento</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-[425px]">
            <DialogHeader className="text-left">
                <DialogTitle>Credenciamento</DialogTitle>
                <DialogDescription>Siga os passos abaixo para concluir o credenciamento</DialogDescription>
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
                    <li>Coloque a pulseira no braço do inscrito.</li>
                    <li>Tire uma foto da pessoa com a pulseira a vista.</li>
                    <li>Verifique se a foto ficou boa, caso não, tire novamente.</li>
                    <li>Tudo certo.</li>
                </ul>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"ghost"}>Cancelar</Button>
                </DialogClose>
                <Button
                    variant={"outline"}
                    disabled={isMutating}
                    className="bg-green-700 text-white"
                    onClick={() => fileInput.current?.click()}>
                    {
                        isMutating
                        && <Loader2 className="size-4 mr-2 animate-spin" />
                    }
                    Tirar foto e finalizar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}