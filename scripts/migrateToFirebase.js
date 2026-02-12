import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Load environment variables FIRST
dotenv.config({ path: '.env.local' });

// 2. Dynamic import of config to ensure env vars are present
const { db, app } = await import('../src/firebaseConfig.js');

// Node.js specific imports for reading the JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '../public/data/songs.json');

async function migrate() {
    console.log('Starting migration...');
    const options = app.options;

    // Mask API Key in logs
    const safeOptions = { ...options, apiKey: options.apiKey ? '***' : 'MISSING' };
    console.log('Firebase Config via App:', JSON.stringify(safeOptions, null, 2));

    if (options.projectId) {
        console.log(`ProjectId Length: ${options.projectId.length}`);
    } else {
        console.error('ERROR: ProjectId is missing from config!');
        process.exit(1);
    }

    try {
        // 1. Read existing JSON
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`songs.json not found at ${jsonPath}`);
        }
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(rawData);
        const songs = data.songs;

        console.log(`Found ${songs.length} songs in JSON.`);

        // 2. Clear existing Firestore data
        const songsCollection = collection(db, 'songs');

        console.log('Testing Firestore connection by reading collection...');
        const snapshot = await getDocs(songsCollection);

        if (!snapshot.empty) {
            console.log(`Deleting ${snapshot.size} existing documents from Firestore...`);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log('Cleared existing collection.');
        } else {
            console.log('Collection is empty or created new.');
        }

        // 3. Upload songs
        console.log('Uploading songs...');
        let count = 0;
        for (const song of songs) {
            const { id, ...songData } = song;

            await addDoc(songsCollection, {
                ...songData,
                legacyId: id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            process.stdout.write('.');
            count++;
        }

        console.log(`\nSUCCESS: Migrated ${count} songs to Firestore.`);
        process.exit(0);

    } catch (e) {
        console.error('\nMigration failed:', e);
        if (e.code) console.error('Error Code:', e.code);
        process.exit(1);
    }
}

migrate();
