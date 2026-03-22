async function debugTeam() {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/teams/17693');
    const data = await res.json();
    console.log(JSON.stringify(data.team, null, 2));
}
debugTeam();
