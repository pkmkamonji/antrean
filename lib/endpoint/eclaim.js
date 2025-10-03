import { HEADERS, witaDate } from "../constants.js";
import { URLSearchParams } from "url"

export const HOST = "https://pcarejkn.bpjs-kesehatan.go.id";
export const Referer = "https://pcarejkn.bpjs-kesehatan.go.id/eclaim/EntriDaftarDokkel";

export const KEEP_ALIVE = "https://pcarejkn.bpjs-kesehatan.go.id/eclaim/keepAlive/check";


export const FETCH_LIST_ANTREAN = async (limit, registerDate, additionalHeaders = {}) => {

    return await fetch(`${HOST}/eclaim/EntriDaftarDokkel/getPendaftarByPpkTgl`, {
        method: "POST",
        headers: { ...HEADERS, ...{ Referer, 'Content-Type': 'application/x-www-form-urlencoded' }, ...additionalHeaders },
        body: new URLSearchParams({
            draw: '1',
            start: 0,
            length: limit,
            tgldaftar: registerDate,
            refAsalKunjungan: '0,1',
            kdppk: '03190005'
        })
    }).then(res => res.json());
}

export const FETCH_KEEP_ALIVE = async (additionalHeaders = {}) => {
    console.log("🔁 Checking Lifetime...");
    return await fetch(KEEP_ALIVE, {
        method: "GET",
        headers: { ...HEADERS, ...additionalHeaders }
    });
}

export const FETCH_BY_NOKA = async (noka, additionalHeaders = {}) => {
    // console.log("🔍 Fetching Data by No. Kartu...");
    return await fetch(`${HOST}/eclaim/EntriDaftarDokkel/getPeserta?noka=${noka}&tglPel=${witaDate().format('DD-MM-YYYY')}`, {
        method: "GET",
        headers: { ...HEADERS, ...{ Referer }, ...additionalHeaders },
    }).then(res => res.json());
}
