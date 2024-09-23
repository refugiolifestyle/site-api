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

import { EventoType, InscritoType } from "@/types";
import { TicketCheck } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";
import { Button } from "./ui/button";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogTableCredenciamentoCamera({ evento, inscrito }: Props) {
    const camera = useRef<CameraType>(null)
    const fileInput = useRef<HTMLInputElement>(null)

    const salvar = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) {
            return false
        }

        let fotoReader = new FileReader()
        fotoReader.onloadend = () => {
            console.log(fotoReader.result as string)
        }

        let foto = e.target.files.item(0)
        fotoReader.readAsDataURL(foto!)
    }

    return <Dialog>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                className="flex space-x-2">
                <TicketCheck className="size-4" />
                <span className="sr-only lg:not-sr-only">Fazer credenciamento</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Credênciamento</DialogTitle>
                <DialogDescription>Siga os passos abaixo para concluir o credênciamento</DialogDescription>
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
                <Button variant={"outline"} className="bg-green-700 text-white" onClick={() => fileInput.current?.click()}>Tirar foto e finalizar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}