import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Fetching B Nacional assist leaders from ESPN...');
    const API_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/statistics?season=2026';

    let data;
    try {
        const res = await fetch(API_URL);
        data = await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return;
    }

    const goalAssistsCategory = data.stats?.find(s => s.name === 'assistsLeaders');
    if (!goalAssistsCategory || !goalAssistsCategory.leaders) {
        console.log('No assist data found.');
        return;
    }

    const assistMap = {}; // athleteId -> assists
    for (const ath of goalAssistsCategory.leaders) {
        if (ath.athlete && ath.value !== undefined) {
            assistMap[ath.athlete.id] = ath.value;
        }
    }

    console.log(`Found ${Object.keys(assistMap).length} players with assists.`);

    // Read and parse teams.ts. We will use Regex to replace "assists: 0" or existing assists based on ID.
    const teamsPath = path.resolve(process.cwd(), 'src/lib/data/nacional-b/teams.ts');
    let teamsContent = fs.readFileSync(teamsPath, 'utf-8');

    // We can iterate over the lines and carefully update
    // But since the athletes have explicit blocks:
    // id: 'XXX'
    // name: '...'
    // position: '...'
    // age: ...
    // goals: ...
    // assists: 0,
    
    // We can regex replace the whole block by finding the id: 'id'
    
    for (const [athleteId, assists] of Object.entries(assistMap)) {
        const regex = new RegExp(`(id:\\s*'${athleteId}',[^]+?goals:\\s*\\d+,\\s*)assists:\\s*\\d+`, 'g');
        teamsContent = teamsContent.replace(regex, `$1assists: ${assists}`);
    }

    fs.writeFileSync(teamsPath, teamsContent);
    console.log('Injected assists into teams.ts');
}

main();
