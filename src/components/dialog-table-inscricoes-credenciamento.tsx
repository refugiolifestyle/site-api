"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";


import { Credenciamento, EventoType, InscritoType } from "@/types";
import { Check, Loader2, TicketCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import useSWR from "swr";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogTableCredenciamento({ inscrito, evento }: Props) {
    const { data, isLoading } = useSWR<{ credenciamento: Credenciamento }>(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/credenciamento`,
        () => fetch(`/api/eventos/${evento.id}/inscricoes/${inscrito.cpf.replaceAll(/[^\d]+/g, "")}/credenciamento`)
            .then(r => r.json()))

    return <Dialog>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                className="flex space-x-2">
                <TicketCheck className="size-4" />
                <span className="sr-only lg:not-sr-only">Ver credenciamento</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-[425px]">
            <DialogHeader className="text-left">
                <DialogTitle>Credenciamento</DialogTitle>
            </DialogHeader>
            {
                isLoading
                    ? <Loader2 className="size-4 animate-spin" />
                    : <div className="grid gap-3">
                        <dl className="grid gap-3">
                            <div className="flex items-center justify-between space-x-4">
                                <dt className="text-muted-foreground">Servo</dt>
                                <dd>{data?.credenciamento.servo}</dd>
                            </div>
                            <div className="flex items-center justify-between space-x-4">
                                <dt className="text-muted-foreground">Data</dt>
                                <dd>
                                    {
                                        new Date(data?.credenciamento.credenciadoEm as string)
                                            .toLocaleString("pt-BR", {
                                                dateStyle: "short",
                                                timeStyle: "short"
                                            })
                                    }
                                </dd>
                            </div>
                            <div className="flex items-start justify-between space-x-4">
                                <dt className="text-muted-foreground">Comprovante</dt>
                                <dd>
                                    <img src={data?.credenciamento.comprovante} />
                                </dd>
                            </div>
                        </dl>
                    </div>
            }
        </DialogContent>
    </Dialog>
}