async function testFallback() {
    const ids = ['17693', '2635', '10161', '10147'];
    for (const id of ids) {
        console.log(`Checking ID ${id}...`);
        for (const league of ['arg.3', 'arg.2', 'arg.1']) {
            try {
                const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${id}/roster`);
                const data = await res.json();
                if (data.athletes && data.athletes.length > 0) {
                    console.log(`  Found ${data.athletes.length} players in ${league}`);
                    break;
                }
            } catch (e) {}
        }
    }
}
testFallback();
