import fs from 'fs';
import path from 'path';

function normalizeString(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function main() {
    console.log('Fetching player stats from free ESPN API (Goals & Assists only)...');
    
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/statistics';
    let data;
    try {
        const response = await fetch(url);
        data = await response.json();
    } catch (err) {
        console.error('Failed to fetch from ESPN API:', err);
        return;
    }

    if (!data || !data.stats) {
        console.error('Invalid data format from ESPN API.');
        return;
    }

    const goalsCategory = data.stats.find(s => s.name === 'goalsLeaders');
    const assistsCategory = data.stats.find(s => s.name === 'assistsLeaders');

    const statsMap = {}; // name -> { goals, assists }

    // Helper to merge into statsMap
    const mergeStat = (athlete, key, value) => {
        const name = normalizeString(athlete.displayName);
        const lastName = athlete.lastName ? normalizeString(athlete.lastName) : '';
        if (!statsMap[name]) {
            statsMap[name] = { 
                name: athlete.displayName, 
                normName: name,
                lastName: lastName,
                goals: 0, 
                assists: 0 
            };
        }
        statsMap[name][key] = Math.max(statsMap[name][key], value);
    };

    if (goalsCategory && goalsCategory.leaders) {
        for (const leader of goalsCategory.leaders) {
            mergeStat(leader.athlete, 'goals', leader.value);
        }
    }

    if (assistsCategory && assistsCategory.leaders) {
        for (const leader of assistsCategory.leaders) {
            mergeStat(leader.athlete, 'assists', leader.value);
        }
    }

    if (Object.keys(statsMap).length === 0) {
        console.log('No goal/assist leaders found.');
        return;
    }

    // Read the teams.ts file
    const teamsPath = path.resolve(process.cwd(), 'src/lib/data/teams.ts');
    if (!fs.existsSync(teamsPath)) {
        console.error(`File not found: ${teamsPath}`);
        return;
    }

    let teamsContent = fs.readFileSync(teamsPath, 'utf8');
    const lines = teamsContent.split('\n');
    let updatedCount = 0;

    const modifiedLines = lines.map(line => {
        const playerMatch = line.match(/{.*?name:\s*'([^']+)'/);
        if (playerMatch) {
            const playerName = playerMatch[1];
            const normPlayerName = normalizeString(playerName);
            
            // Strategy to find best match in our API stats
            let bestMatch = null;
            let bestNameKey = null;

            for (const [key, apiP] of Object.entries(statsMap)) {
                // If the full normalized name matches exactly
                if (normPlayerName === apiP.normName || apiP.normName.includes(normPlayerName) || normPlayerName.includes(apiP.normName)) {
                    bestMatch = apiP;
                    bestNameKey = key;
                    break;
                }
                
                // If ESPN format "Gabriel Ávalos" matches "G. Avalos" using last names
                const apiNameParts = apiP.normName.split(' ');
                const localNameParts = normPlayerName.split(' ');
                
                // Find if the main surname matches
                const localSurname = localNameParts[localNameParts.length - 1];
                const apiSurname = apiNameParts[apiNameParts.length - 1];
                
                if (localSurname.length > 2 && apiSurname.length > 2 && (localSurname === apiSurname || localSurname.includes(apiSurname))) {
                    // Check if first letters match (G. Avalos <=> Gabriel Avalos)
                    const localInitial = localNameParts[0][0];
                    const apiInitial = apiNameParts[0][0];
                    if (localInitial === apiInitial) {
                        bestMatch = apiP;
                        bestNameKey = key;
                        break;
                    }
                }
            }

            if (bestMatch) {
                // We have API stats for this player, update the line
                let newLine = line;
                
                const replaceField = (str, field, value) => {
                    const regex = new RegExp(`(${field}:\\s*)\\d+`);
                    if (regex.test(str)) {
                        return str.replace(regex, `$1${value}`);
                    }
                    return str;
                };

                // Remove yellowCards and redCards replacement since the user requested to eliminate them
                newLine = replaceField(newLine, 'goals', bestMatch.goals);
                newLine = replaceField(newLine, 'assists', bestMatch.assists);
                
                if (newLine !== line) {
                    updatedCount++;
                }

                delete statsMap[bestNameKey];
                return newLine;
            }
        }
        return line;
    });

    fs.writeFileSync(teamsPath, modifiedLines.join('\n'));
    console.log(`Successfully parsed and updated ${updatedCount} players in teams.ts!`);
    console.log('Any unmatched players in API data:', Object.keys(statsMap));
}

main();
