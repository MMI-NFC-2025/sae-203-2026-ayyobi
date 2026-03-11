import PocketBase from 'pocketbase';
import { slugify } from './utils.mjs';

const baseUrl = import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(baseUrl);

function getFileUrl(collectionName, record, fieldName) {
  if (!record || !record[fieldName]) return 'https://placehold.co/800x600?text=Festival';
  return `${pb.baseUrl}/api/files/${collectionName}/${record.id}/${record[fieldName]}`;
}

function getFilesUrl(collectionName, record, fieldName) {
  if (!record || !Array.isArray(record[fieldName])) return [];
  return record[fieldName].map(
    (file) => `${pb.baseUrl}/api/files/${collectionName}/${record.id}/${file}`
  );
}

function normalizeArtiste(record) {
  return {
    id: record.id,
    nom: record.nom_artiste,
    genre: record.genre_musical,
    genreSlug: slugify(record.genre_musical),
    jour: record.jour_label || '',
    jourSlug: slugify(record.jour_label || ''),
    description: record.description,
    photo: getFileUrl('artistes', record, 'photo_principale'),
    galerie: getFilesUrl('artistes', record, 'galerie_photos'),
  };
}

function normalizeScene(record) {
  return {
    id: record.id,
    nom: record.nom_scene,
    description: record.description_scene,
    localisation: record.localisation,
    capacite: record.capacite,
    photo: getFileUrl('scenes', record, 'photo_scene'),
  };
}

function normalizeFaq(record) {
  return {
    id: record.id,
    question: record.question,
    reponse: record.reponse,
    ordre: record.ordre_affichage,
  };
}

function normalizeProgrammation(record) {
  const artiste = record.expand?.artiste ? normalizeArtiste(record.expand.artiste) : null;
  const scene = record.expand?.scene ? normalizeScene(record.expand.scene) : null;

  return {
    id: record.id,
    artiste,
    scene,
    date: record.date_representation,
    heureDebut: record.heure_debut || '',
    jourLabel: record.jour_label || '',
    jourSlug: slugify(record.jour_label || ''),
    ordre: record.ordre_passage,
  };
}

export async function getArtistes() {
  const records = await pb.collection('artistes').getFullList({ sort: 'nom_artiste' });
  return records.map(normalizeArtiste);
}

export async function getArtiste(id) {
  const record = await pb.collection('artistes').getOne(id);
  return normalizeArtiste(record);
}

export async function getScenes() {
  const records = await pb.collection('scenes').getFullList({ sort: 'nom_scene' });
  return records.map(normalizeScene);
}

export async function getScene(id) {
  const record = await pb.collection('scenes').getOne(id);
  return normalizeScene(record);
}

export async function getProgrammation() {
  const records = await pb.collection('programmation').getFullList({
    expand: 'artiste,scene',
    sort: 'date_representation',
  });
  return records.map(normalizeProgrammation);
}

export async function getProgrammationParArtiste(artisteId) {
  const records = await pb.collection('programmation').getFullList({
    filter: `artiste="${artisteId}"`,
    expand: 'artiste,scene',
    sort: 'date_representation',
  });
  return records.map(normalizeProgrammation);
}

export async function getProgrammationParScene(sceneId) {
  const records = await pb.collection('programmation').getFullList({
    filter: `scene="${sceneId}"`,
    expand: 'artiste,scene',
    sort: 'date_representation',
  });
  return records.map(normalizeProgrammation);
}

export async function getFaq() {
  const records = await pb.collection('faq').getFullList({ sort: 'ordre_affichage' });
  return records.map(normalizeFaq);
}

export async function getTarifs() {
  return await pb.collection('tarifs').getFullList({ sort: 'ordre_affichage' });
}

export async function getPartenaires() {
  return await pb.collection('partenaires').getFullList({ sort: 'ordre_affichage' });
}
