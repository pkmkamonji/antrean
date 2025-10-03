export const HOST = "https://api.medikaconnect.com";
export const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
    "Authorization": "Basic c2lwZGlua2VzcGFsdTpDZUhjNUU4UXV2NmhOMUhy",
}



export const FETCH_NIK_SIAN = async (nik) => {
    console.log("🔍 Fetching Data by NIK from SIAN...");
    return await fetch(`${HOST}/v1/cek-nik`, {
        method: "POST",
        headers: {
            ...HEADERS,
            "Referer": "https://sian.medikaconnect.site",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ nik: nik })
    });
}