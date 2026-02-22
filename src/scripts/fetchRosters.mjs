import fs from 'fs';
import path from 'path';
import https from 'https';

const ROSTERS_DIR = 'rosters';
if (!fs.existsSync(ROSTERS_DIR)) fs.mkdirSync(ROSTERS_DIR);

const teams = {
    "boca": 5, "central-cba": 11989, "defensa": 8950, "riestra": 17702, "estudiantes": 8,
    "gimnasia-m": 11972, "independiente": 11, "instituto": 2975, "lanus": 12, "newells": 14,
    "platense": 7764, "san-lorenzo": 18, "talleres": 19, "union": 20, "velez": 21,
    "aldosivi": 9739, "argentinos": 3, "atletico": 9785, "banfield": 235, "barracas": 10060,
    "belgrano": 4, "estudiantes-rc": 19685, "gimnasia-lp": 9, "huracan": 10,
    "ind-rivadavia": 9744, "racing": 15, "river": 16, "rosario": 17, "sarmiento": 10158, "tigre": 7767
};

async function fetchRoster(id, espnId) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/teams/${espnId}?enable=roster`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    fs.writeFileSync(path.join(ROSTERS_DIR, `${id}.json`), data);
                    console.log(`Successfully fetched ${id}`);
                    resolve();
                } else {
                    console.error(`Failed to fetch ${id}: ${res.statusCode}`);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.error(`Error fetching ${id}: ${err.message}`);
            resolve();
        });
    });
}

async function main() {
    for (const [id, espnId] of Object.entries(teams)) {
        await fetchRoster(id, espnId);
        await new Promise(r => setTimeout(r, 100));
    }
}

main();
