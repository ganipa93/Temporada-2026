async function debug() {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/arg.3/scoreboard?dates=20260215&limit=1');
    const data = await res.json();
    console.log(JSON.stringify(data.events[0], (key, value) => {
        if (key === 'athletesInvolved') return value;
        if (key === 'details') return value;
        if (key === 'competitions') return value;
        return value;
    }, 2));
}
debug();
