import {EventEmitter} from "events";
import dotenv from 'dotenv';

dotenv.config({ path: './etc/.env' });

const emitter = new EventEmitter();

const hiHandler = (name = "Onym") => {
    console.log(`Hi, ${name}!`);
}

const byeHandler = (name = "Onym") => {
    console.log(`Bye, ${name}!`);
}

emitter.on("greeting", hiHandler);
emitter.on("greeting", byeHandler);

emitter.emit("greeting", "Srago");

emitter.off("greeting", byeHandler);

emitter.emit("greeting", "Srago");

emitter.emit("greeting", process.env.NAME);
