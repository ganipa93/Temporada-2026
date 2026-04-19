param (
    [string]$folder,
    [string]$argNum,
    [int]$matchesPerRound
)

$ErrorActionPreference = 'Stop'
Write-Host "Fetching real matches from ESPN for $folder (arg.$argNum)..."
$urls = @(
    "https://site.api.espn.com/apis/site/v2/sports/soccer/arg.$argNum/scoreboard?dates=20260101-20260630&limit=500",
    "https://site.api.espn.com/apis/site/v2/sports/soccer/arg.$argNum/scoreboard?dates=20260701-20261231&limit=500"
)

$allEvents = @()
foreach ($url in $urls) {
    try {
        $data = Invoke-RestMethod -Uri $url
        if ($data.events) {
            $allEvents += $data.events
        }
    } catch {
        Write-Error "Error fetching matches: $_"
    }
}

Write-Host "Fetched $($allEvents.Count) events."

$teamsFile = Get-Content -Raw -Path "$PWD\src\lib\data\$folder\teams.ts"
$slugMap = @{}

$regex = "id:\s*'([^']+)'(?:[^}]*?)logo:\s*'[^']+/(\d+)\.png'"
$matchInfo = [regex]::Matches($teamsFile, $regex)
foreach ($match in $matchInfo) {
    $slug = $match.Groups[1].Value
    $apiId = $match.Groups[2].Value
    $slugMap[$apiId] = $slug
}

if ($slugMap.Keys.Count -lt 10) {
    Write-Host "Fallback to apiId regex"
    $regexApiId = "id:\s*'([^']+)',\s*apiId:\s*(\d+)"
    $matchInfoApiId = [regex]::Matches($teamsFile, $regexApiId)
    foreach ($match in $matchInfoApiId) {
        $slug = $match.Groups[1].Value
        $apiId = $match.Groups[2].Value
        $slugMap[$apiId] = $slug
    }
}

Write-Host "Mapped $($slugMap.Keys.Count) teams from teams.ts."

# Sort chronologically
$allEvents = $allEvents | Sort-Object -Property date

$fixtures = @()
$validMatchCount = 0

foreach ($ev in $allEvents) {
    if ($null -eq $ev.competitions -or $ev.competitions.Count -eq 0) { continue }
    $comp = $ev.competitions[0]
    if (-not $comp) { continue }

    $homeComp = $null
    $awayComp = $null
    foreach ($c in $comp.competitors) {
        if ($c.homeAway -eq 'home') { $homeComp = $c }
        if ($c.homeAway -eq 'away') { $awayComp = $c }
    }

    if (-not $homeComp -or -not $awayComp) { continue }
    if (-not $homeComp.team -or -not $awayComp.team) { continue }
    if (-not $homeComp.team.id -or -not $awayComp.team.id) { continue }
    
    $homeApiId = $homeComp.team.id
    $awayApiId = $awayComp.team.id

    $homeSlug = $slugMap[[string]$homeApiId]
    $awaySlug = $slugMap[[string]$awayApiId]

    if ($homeSlug -and $awaySlug) {
        $homeScore = $null
        $awayScore = $null
        $isPlayed = $comp.status.type.completed

        if ($isPlayed) {
            if ($null -ne $homeComp.score) { $homeScore = [int]$homeComp.score } else { $homeScore = 0 }
            if ($null -ne $awayComp.score) { $awayScore = [int]$awayComp.score } else { $awayScore = 0 }
        }

        $validMatchCount++
        
        $assumedRound = [math]::Floor(($validMatchCount - 1) / $matchesPerRound) + 1

        $roundsPerTournament = if ($folder -eq 'primera') { 16 } else { ($matchesPerRound * 2) - 1 }
        $assignedTournament = 'apertura'
        $assignedRound = $assumedRound

        if ($assumedRound -gt $roundsPerTournament) {
            $assignedTournament = 'clausura'
            $assignedRound = $assumedRound - $roundsPerTournament
        }

        $fixtureObj = [ordered]@{
            id = $ev.id
            date = $ev.date
            status = if ($isPlayed) { 'FT' } else { 'NS' }
            round = $assignedRound
            tournament = $assignedTournament
            homeTeamId = $homeSlug
            awayTeamId = $awaySlug
            homeScore = $homeScore
            awayScore = $awayScore
            events = @()
            isPlayed = $isPlayed
        }
        $fixtures += $fixtureObj
    }
}

Write-Host "Generated $($fixtures.Count) clean matches."
$json = $fixtures | ConvertTo-Json -Depth 5 -Compress
$json = $fixtures | ConvertTo-Json -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("$PWD\src\lib\data\$folder\official_fixture.json", $json, $utf8NoBom)
Write-Host "Saved to $folder/official_fixture.json"
