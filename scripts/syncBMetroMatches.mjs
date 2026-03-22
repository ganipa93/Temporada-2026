import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Fetching real B Metropolitana matches from ESPN...');
    
    // We fetch in two halves to bypass the 500 limit
    const urls = [
        'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/scoreboard?dates=20260101-20260630&limit=500',
        'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/scoreboard?dates=20260701-20261231&limit=500'
    ];

    let allEvents = [];
    for (const url of urls) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.events) {
                allEvents = [...allEvents, ...data.events];
            }
        } catch (e) {
            console.error('Error fetching matches:', e);
        }
    }



    console.log(`Fetched ${allEvents.length} events.`);

    // Read the teams to map apiId to slug
    const teamsFile = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/data/b-metro/teams.ts'), 'utf-8');
    const slugMap = {}; // apiId -> slug
    
    // We can extract slugs and apiIds using regex
    const regex = /id:\s*'([^']+)',\s*apiId:\s*(\d+)/g;
    let match;
    while ((match = regex.exec(teamsFile)) !== null) {
        slugMap[match[2]] = match[1];
    }

    // Sort chronologically
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Map to fixture
    const fixtures = [];
    let validMatchCount = 0;

    for (const ev of allEvents) {
        const comp = ev.competitions[0];
        if (!comp) continue;

        const homeComp = comp.competitors.find(c => c.homeAway === 'home');
        const awayComp = comp.competitors.find(c => c.homeAway === 'away');

        const homeApiId = homeComp?.team?.id;
        const awayApiId = awayComp?.team?.id;

        const homeSlug = slugMap[homeApiId];
        const awaySlug = slugMap[awayApiId];

        // Only include if both teams are known (some matches might be cup matches or have newly promoted teams not in our list yet)
        if (homeSlug && awaySlug) {
            let homeScore = null;
            let awayScore = null;
            const isPlayed = comp.status.type.completed;

            if (isPlayed) {
                homeScore = parseInt(homeComp.score, 10) || 0;
                awayScore = parseInt(awayComp.score, 10) || 0;
            }

            validMatchCount++;
            
            // Assign rounds assuming ~11 matches per round chronologically
            const assumedRound = Math.floor((validMatchCount - 1) / 11) + 1;

            fixtures.push({
                id: ev.id,
                date: ev.date,
                status: isPlayed ? 'FT' : 'NS',
                round: assumedRound,
                tournament: 'apertura',
                homeTeamId: homeSlug,
                awayTeamId: awaySlug,
                homeScore: homeScore,
                awayScore: awayScore,
                events: [],
                isPlayed: isPlayed
            });
        }
    }

    console.log(`Generated ${fixtures.length} clean matches.`);

    fs.writeFileSync(path.resolve(process.cwd(), 'src/lib/data/b-metro/official_fixture.json'), JSON.stringify(fixtures, null, 2));
    console.log('Saved to b-metro/official_fixture.json');
}

main();
