"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";


import { EventoType, InscritoType } from "@/types";
import { SearchCheck, TicketCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
    outside?: boolean
}

export default function DialogTableCredenciamento({ inscrito, outside }: Props) {
    return <Dialog>
        <DialogTrigger asChild>
            {
                outside
                    ? <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                        Credenciamento
                    </DropdownMenuItem>
                    : <Button
                        variant="outline"
                        className="flex space-x-2">
                        <SearchCheck className="size-4" />
                        <span className="sr-only lg:not-sr-only">Visualizar</span>
                    </Button>
            }
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
                </dl>
            </div>
        </DialogContent>
    </Dialog>
}