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
import { useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";
import { useMediaQuery } from 'usehooks-ts';
import { Button } from "./ui/button";

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
    evento: EventoType
    inscrito: InscritoType
}

export default function DialogTableCredenciamentoCamera({ evento, inscrito }: Props) {
    const camera = useRef<CameraType>(null)
    const mobileScreen = useMediaQuery('(min-width: 600px)');

    const [foto, setFoto] = useState("")

    const salvar = () => {

    }

    const recredenciar = () => {
        setFoto("")
    }

    const credenciar = () => {
        let foto = camera.current?.takePhoto("base64url")
        console.log(foto)
        setFoto(foto as string)
    }

    return <Dialog>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                className="flex space-x-2"
                onClick={credenciar}>
                <TicketCheck className="size-4" />
                <span className="sr-only lg:not-sr-only">Fazer credenciamento</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Credênciamento</DialogTitle>
                <DialogDescription>Coloque a pulseira no braço do inscrito e tire uma foto da pessoa com a pulseira a vista para comprovar o credênciamento</DialogDescription>
            </DialogHeader>
            <div className="w-20 h-32">
                {
                    foto
                        ? <img src={foto} />
                        : <input type="file" accept="image/*" capture="environment" />
                }
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"ghost"}>Cancelar</Button>
                </DialogClose>
                {
                    foto
                        ? <>
                            <Button variant={"outline"} onClick={recredenciar}>Tirar novamente</Button>
                            <Button variant={"default"} className="bg-green-600" onClick={salvar}>Salvar credênciamento</Button>
                        </>
                        : <Button variant={"outline"} className="bg-green-700 text-white" onClick={credenciar}>Tirar foto</Button>
                }
            </DialogFooter>
        </DialogContent>
    </Dialog>
}