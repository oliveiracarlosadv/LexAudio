import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Transcript } from '../types';

/** Histórico 100% local (IndexedDB). O áudio original nunca é armazenado. */
interface LexDB extends DBSchema {
  transcripts: { key: string; value: Transcript; indexes: { byDate: number } };
}

let db: Promise<IDBPDatabase<LexDB>> | null = null;
const getDb = () =>
  (db ??= openDB<LexDB>('lex-audio', 1, {
    upgrade(d) {
      const store = d.createObjectStore('transcripts', { keyPath: 'id' });
      store.createIndex('byDate', 'createdAt');
    },
  }));

export async function saveTranscript(t: Transcript) {
  await (await getDb()).put('transcripts', t);
}

export async function listTranscripts(): Promise<Transcript[]> {
  const all = await (await getDb()).getAllFromIndex('transcripts', 'byDate');
  return all.reverse();
}

export async function deleteTranscript(id: string) {
  await (await getDb()).delete('transcripts', id);
}

export async function clearHistory() {
  await (await getDb()).clear('transcripts');
}
