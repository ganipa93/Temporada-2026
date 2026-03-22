import fs from 'fs';
import path from 'path';

function inject() {
    const filePath = 'src/lib/data/b-metro/teams.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const injectionMap = [
        { name: 'Máximo Blanco', goals: 4 },
        { name: 'Nazareno Diósquez', goals: 3 },
        { name: 'Tomás Ponzo', goals: 3 }
    ];

    injectionMap.forEach(ij => {
        const regex = new RegExp(`name: '${ij.name}',(\\s+)position: '(?:GK|DEF|MID|FWD)' as 'GK' \\| 'DEF' \\| 'MID' \\| 'FWD',(\\s+)age: \\d+(\\s+)goals: 0`, 'g');
        content = content.replace(regex, (match, s1, s2, s3) => {
            return match.replace('goals: 0', `goals: ${ij.goals}`);
        });
    });

    fs.writeFileSync(filePath, content);
}
inject();
