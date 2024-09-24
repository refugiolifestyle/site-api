"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";


import { EventoType, InscritoType } from "@/types";
import { TicketCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogTableCredenciamento({ inscrito, evento }: Props) {
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
            <div className="grid gap-3">
                <dl className="grid gap-3">
                    <div className="flex items-center justify-between space-x-4">
                        <dt className="text-muted-foreground">Servo</dt>
                        <dd>{inscrito.credenciamento?.servo}</dd>
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <dt className="text-muted-foreground">Data</dt>
                        <dd>
                            {
                                new Date(inscrito.credenciamento?.credenciadoEm as string)
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
                            <img src={inscrito.credenciamento?.comprovante!} alt={"Comprovante de pagamento"} />
                        </dd>
                    </div>
                </dl>
            </div>
        </DialogContent>
    </Dialog>
}