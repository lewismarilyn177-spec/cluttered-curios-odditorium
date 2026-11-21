import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

/**
 * Collects game/ and screenshots/ assets from the script directory
 * into the output directory.
 */
function collectEntryFiles(outputDir: string, scriptDir: string): { gameCount: number; shotCount: number } {
  const gameSrc = join(scriptDir, 'game');
  const shotsSrc = join(scriptDir, 'screenshots');
  const gameDst = join(outputDir, 'game');
  const shotsDst = join(outputDir, 'screenshots');

  let gameCount = 0;
  let shotCount = 0;

  if (existsSync(gameSrc)) {
    cpSync(gameSrc, gameDst, { recursive: true });
    gameCount = readdirSync(gameDst, { recursive: true }).filter(f => !f.endsWith('/')).length;
  }
  if (existsSync(shotsSrc)) {
    cpSync(shotsSrc, shotsDst, { recursive: true });
    shotCount = readdirSync(shotsDst).length;
  }

  return { gameCount, shotCount };
}

/**
 * Validates screenshots and builds the dossier via buildDossier,
 * writing dossier.json to the output dir.
 * Cluttered Curios: Night at the Odditorium — a spot-the-difference game
 * set in a lamp-lit museum of odd curios.
 */
function sealDossier(outputDir: string, shotCount: number): void {
  const shotsDir = join(outputDir, 'screenshots');
  if (!existsSync(shotsDir)) {
    throw new Error('screenshots directory missing in output');
  }
  if (shotCount < 3 || shotCount > 4) {
    throw new Error(`screenshots count ${shotCount} out of range [3, 4]`);
  }

  const dossierBytes = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, dossierBytes);
}

/**
 * Entry point: prepares output, collects assets, seals the dossier.
 */
async function main(): Promise<void> {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const { gameCount, shotCount } = collectEntryFiles(outputDir, scriptDir);
  sealDossier(outputDir, shotCount);

  console.log(`entry sealed: ${gameCount} game files, ${shotCount} screenshots`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});