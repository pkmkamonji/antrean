import { exit } from "process";
import readline from "readline";
import moment from "moment-timezone";
import { FETCH_BY_NOKA, FETCH_KEEP_ALIVE, FETCH_LIST_ANTREAN } from "./lib/endpoint/eclaim.js";
import LZString from "./lib/LZString.js";
import { witaDate } from "./lib/constants.js";
import { readFile, readFromJson, saveToJson } from "./lib/storage.js";
import { FETCH_NIK_SIAN, LOGIN as LoginSian } from "./lib/endpoint/sian.js";
import { getAntreanByNikAndDate, getConfigByGroupName, insertAntrean, insertConfig } from "./lib/database.js";

function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function getSumberAntrean(fromWs) {
    var nama;
    if (fromWs === 0)
        nama = 'Aplikasi';
    else if (fromWs === 1)
        nama = 'Bridging PCare';
    else if (fromWs === 2)
        nama = 'Mobile JKN';
    else if (fromWs === 3)
        nama = 'Web Antrean';
    else if (fromWs === 4)
        nama = 'Bridging Antrean';
    else if (fromWs === 5)
        nama = 'Mobile Antrean';
    else if (fromWs === 6)
        nama = 'Mobile Faskes';
    else if (fromWs === 7)
        nama = 'Bridging PCare';
    else if (fromWs === 8)
        nama = 'Bridging PCare';
    else
        nama = '-';
    return nama;
}

function getCookie() {
    const file = readFile("./storage/bpjs-cookie.json");

    const targetKeys = ["BIGipServerpool", "__RequestVerificationToken", "ASP.NET"];

    const filterCookie = file.cookies.filter(cookie =>
        targetKeys.some(key => cookie.name.includes(key))
    );

    return {
        userAgent: file.userAgent,
        cookie: filterCookie.map(c => `${c.name}=${c.value}`).join("; ").trim() + ";"
    };
}

const startTime = witaDate();

let extraCookieCheck = "";

const main = async () => {
    const config = getCookie();
    const SIAN_TOKEN = await getSianToken();

    // console.log("cookie check: ", extraCookieCheck + config.cookie);
    let keepAlive = await FETCH_KEEP_ALIVE({ Cookie: extraCookieCheck + config.cookie, "User-Agent": config.userAgent });
    let match = keepAlive.headers.get('set-cookie').match(/(f5avra[a-zA-Z0-9_]+=[^;]+)/);

    extraCookieCheck = match ? match[1] + "; " : extraCookieCheck;

    keepAlive = await keepAlive.json();

    if (keepAlive.metaData.code !== 401) {

        // get biasa dulu untuk dapat total record
        let antreanList = await FETCH_LIST_ANTREAN(1, witaDate().format('DD-MM-YYYY'), { Cookie: config.cookie, "User-Agent": config.userAgent });

        if (antreanList.metaData && antreanList.metaData.code === 401) {
            console.log(antreanList.metaData.message);
            console.info('Select dan Copy Perintah ini: pnpm run start');
            exit(0);
        }

        antreanList = JSON.parse(LZString.decompressFromEncodedURIComponent(antreanList));

        if (antreanList.metaData.code === 200) {
            antreanList = await FETCH_LIST_ANTREAN(
                antreanList.response.recordsTotal,
                witaDate().format('DD-MM-YYYY'),
                { Cookie: config.cookie, "User-Agent": config.userAgent }
            );
            antreanList = JSON.parse(LZString.decompressFromEncodedURIComponent(antreanList));

            let counter = 1;
            const antreanMJkn = antreanList.response.data.filter(antrean => antrean.fromWs === 2);

            for (const antrean of antreanMJkn) {
                console.log(`➡️ Data-${counter}`);
                counter++;

                // console.log("No. Kartu: ", antrean.peserta.noKartu);
                // console.log("Nama: ", antrean.peserta.nama);
                // console.log("Poli: ", antrean.poli.nmPoli);
                // console.log("Sumber: ", getSumberAntrean(antrean.fromWs));


                // get detail pasien by nomor kartu di BPJS
                let detailPeserta = await FETCH_BY_NOKA(antrean.peserta.noKartu, { Cookie: config.cookie, "User-Agent": config.userAgent });
                detailPeserta = JSON.parse(LZString.decompressFromEncodedURIComponent(detailPeserta));

                let isAntreanExists = await getAntreanByNikAndDate(detailPeserta.response.nik, witaDate().format('DD-MM-YYYY'));
                // console.log("getAtrean", isAntreanExists);

                if (!isAntreanExists) {
                    insertAntrean(detailPeserta.response.nik, witaDate().format('DD-MM-YYYY'), '4-001');
                    console.log("✅ Berhasil menambahkan antrean ", antrean.peserta.nama);
                } else {
                    console.log(`👌 Antrean ${antrean.peserta.nama} sudah terdaftar dengan antrean ${isAntreanExists.queue_number}`);
                }

                // const nikData = await FETCH_NIK_SIAN(detailPeserta.response.nik).then(res => res.json());
                // console.log(nikData);
            }

            console.log("✅ Semua fetch selesai (berurutan).");
        }


        console.log("Life: ", keepAlive.metaData.message, "\n");
        setTimeout(main, 35 * 1000);
    } else {
        console.log("Life: ", keepAlive.metaData.message);
        console.log("Lama Kerja: ", witaDate().diff(startTime), "\n\n");
        console.info('Select dan Copy Perintah ini: pnpm run start');
    }

}

async function getSianToken() {
    async function _selfGet() {
        console.log("====SIAN SECTIONI====");
        console.log("⭕ Get Token...");
        const sianLogin = await LoginSian().then(res => res.json());
        if (sianLogin.status) {
            insertConfig("sianToken", sianLogin.token);
            console.log("✅ Token Berhasil Disimpan");
        } else {
            console.log("❌ Gagal Mendapatkan Token" + sianLogin.message);
            exit(0);
        }

        return sianLogin.token;
    }

    let checkToken = await getConfigByGroupName("sianToken");
    let token;

    if (checkToken) {
        const tokenActiveTime = witaDate().diff(moment(checkToken.created_at, 'YYYY-MM-DD HH:mm:ss'), 'minutes');
        if (tokenActiveTime > 110) {
            token = await _selfGet();
        }
        token = checkToken.value;
    } else {
        token = await _selfGet();
    }

    return token;
}

main();