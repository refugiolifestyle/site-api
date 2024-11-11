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
import { useSWRConfig } from 'swr';

import useSWRMutation from 'swr/mutation';

import { Credenciamento, EventoType, InscritoType } from "@/types";
import { Loader2, TicketPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType,
    servo: string
}

export default function DialogTableCredenciamentoCamera({ evento, inscrito, servo }: Props) {
    const { mutate } = useSWRConfig()
    const { trigger, isMutating, error } = useSWRMutation(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/credenciamento`,
        (url, { arg }: { arg: Partial<Credenciamento> }) => fetch(url, { method: "PATCH", body: JSON.stringify(arg), signal: AbortSignal.timeout(60000) }).then(r => r.json()))

    const salvar = async () => {
        let confirmacao = confirm("Deseja realizar o credenciamento?")
        if (confirmacao) {
            try {
                await trigger({
                    servo
                })

                if (error) {
                    throw error
                }

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
    }

    return <Button
        onClick={salvar}
        variant="outline"
        className="flex space-x-2">
        {
            isMutating
                ? <Loader2 className="size-4 animate-spin" />
                : <TicketPlus className="size-4" />
        }
        <span className="sr-only lg:not-sr-only">Credenciar</span>
    </Button>
}