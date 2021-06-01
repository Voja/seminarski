import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Prijava } from "../entity/Prijava";
import { Profesor } from "../entity/Profesor";
import { Student } from "../entity/Student";
import * as path from 'path';
import * as fs from 'fs';


export async function vratiSvePrijave(req: Request, res: Response) {
    const user = (req.session as any).user;
    let prijave = [];
    if (user instanceof Student)
        prijave = await getRepository(Prijava).find({
            where: {
                student: {
                    id: user.id
                }
            }
        })
    else {
        prijave = await getRepository(Prijava).find();
    }

    res.json(prijave);
}

export async function kreirajPrijavu(req: Request, res: Response) {
    const data = req.body;
    if (!data) {
        res.sendStatus(400);
        return;
    }
    console.log('kreirajnje');
    console.log(data);
    const insertResult = await getRepository(Prijava).insert({
        brojPoena: data.brojPoena,
        file: data.file,
        nazivTeme: data.nazivTeme,
        seminarski: {
            id: data.seminarski
        },
        mentor: {
            id: data.mentor
        },
        status: 'kreirana',
        student: {
            id: (req.session as any).user.id
        }
    });
    res.sendStatus(200);
}
export async function izmeniPrijavu(req: Request, res: Response) {
    const staraPrijava = (req as any).prijava as Prijava;
    const data = req.body as Partial<Prijava>;
    const updateResult = await getRepository(Prijava).update({
        student: {
            id: staraPrijava.student.id,
        },
        seminarski: {
            id: staraPrijava.seminarski.id,

        }
    }, {
        nazivTeme: data.nazivTeme,
        file: data.file
    });
    res.sendStatus(204);
}
export async function obrisiPrijavu(req: Request, res: Response) {
    const staraPrijava = (req as any).prijava as Prijava;
    await getRepository(Prijava).delete({
        student: {
            id: staraPrijava.student.id,
        },
        seminarski: {
            id: staraPrijava.seminarski.id,

        }
    })
    res.sendStatus(204);
}
export async function oceniPrijavu(req: Request, res: Response) {
    const staraPrijava = (req as any).prijava as Prijava;
    const user = (req.session as any).user;
    if (!(user instanceof Profesor)) {
        res.sendStatus(403);
        return;
    }
    await getRepository(Prijava).update(
        {
            student: {
                id: staraPrijava.student.id,
            },
            seminarski: {
                id: staraPrijava.seminarski.id,

            }
        }, {
        brojPoena: req.body.brojPoena,
        status: 'ocenjena'
    })
    res.sendStatus(204);
}

export async function nadjiPrijavu(req: Request, res: Response, next?: any) {
    const student = parseInt(req.params.student);
    if (isNaN(student)) {
        res.sendStatus(400);
        return;
    }
    const seminarski = parseInt(req.params.seminarski);
    if (isNaN(seminarski)) {
        res.sendStatus(400);
        return;
    }

    const prijava = await getRepository(Prijava).findOne({
        where: {
            student: {
                id: student,
            },
            seminarski: {
                id: seminarski,

            }
        }
    })
    if (!prijava) {
        res.sendStatus(404);
        return;
    }
    if (prijava.status === 'ocenjena') {
        res.sendStatus(403);
        return;
    }
    (req as any).prijava = prijava;
    next();
}
export async function handleUpload(request: Request, res: Response, next?: any) {
    const tempPath = request.file.path;
    const targetPath = path.resolve('file/' + request.file.originalname);
    const data = request.body;
    data.file = request.file.originalname;
    fs.rename(tempPath, targetPath, err => {

    })
    next();
}