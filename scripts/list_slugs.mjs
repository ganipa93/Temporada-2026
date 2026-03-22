async function listSlugs() {
    const API_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/teams?limit=100';
    const res = await fetch(API_URL);
    const data = await res.json();
    const rawTeams = data.sports[0].leagues[0].teams.map(t => t.team);
    rawTeams.forEach(t => console.log(`${t.slug} -> ${t.displayName}`));
}
listSlugs();
