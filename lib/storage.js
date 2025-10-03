import fs from "fs";

export const saveToJson = (data, filename) => {
    fs.writeFileSync(`storage/${filename}`, JSON.stringify(data, null, 2));
}

export const readFromJson = (filename) => {
    if (fs.existsSync(`storage/${filename}`)) {
        return JSON.parse(fs.readFileSync(`storage/${filename}`));
    } else {
        return null;
    }
}

export const readFile = (filepath) => {
    if (fs.existsSync(`${filepath}`)) {
        return JSON.parse(fs.readFileSync(`${filepath}`));
    } else {
        return null;
    }
}