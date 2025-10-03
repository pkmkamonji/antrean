import moment from "moment-timezone";

export const HEADERS = {
    "Pragma": "no-cache",
    'Sec-Ch-Ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Set-Fetch-Site': 'same-origin',
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
    // "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    'X-Requested-With': 'XMLHttpRequest',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    Accept: '*/*'
}

export const witaDate = () => {
    return moment().tz('Asia/Makassar');
}

export const getAge = (date) => {
    return witaDate().diff(moment(date, 'DD-MM-YYYY'), 'years');
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}