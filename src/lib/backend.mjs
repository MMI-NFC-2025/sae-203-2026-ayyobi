import { pb } from "./pocketbase.js";

function mapProgramItem(item) {
  return {
    programmationId: item.id,
    date_representation: item.date_representation,
    jour_label: item.jour_label,
    ordre_passage: item.ordre_passage,
    artiste: item.expand?.artiste || null,
    scene: item.expand?.scene || null,
  };
}

/**
 * Genere l'URL d'un fichier PocketBase
 */
export function getFileUrl(record, field) {
  if (!record || !field || !record[field]) return null;
  return pb.files.getURL(record, record[field]);
}

/**
 * Genere toutes les URLs d'un champ file multiple
 */
export function getGalleryUrls(record, field) {
  if (!record || !field || !record[field] || !Array.isArray(record[field])) {
    return [];
  }

  return record[field].map((file) => pb.files.getURL(record, file));
}

/**
 * Retourne la liste de tous les artistes tries par date de representation
 */
export async function getAllArtistsSortedByDate() {
  const records = await pb.collection("programation").getFullList({
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map(mapProgramItem);
}

/**
 * Retourne la liste de toutes les scenes triees par nom
 */
export async function getAllScenesSortedByName() {
  return await getScenes();
}

/**
 * Retourne la liste de tous les artistes tries par ordre alphabetique
 */
export async function getAllArtistsSortedByName() {
  return await getArtists();
}

/**
 * Retourne les infos d'un artiste par son id
 */
export async function getArtistById(id) {
  return await pb.collection("artistes").getOne(id);
}

/**
 * Retourne les infos d'une scene par son id
 */
export async function getSceneById(id) {
  return await pb.collection("scenes").getOne(id);
}

/**
 * Retourne les infos d'une scene a partir de son slug
 */
export async function getSceneBySlug(slug) {
  const scenes = await getScenes();
  return scenes.find((scene) => {
    return (
      scene.nom_scene
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") === slug
    );
  }) || null;
}

/**
 * Retourne tous les artistes se produisant sur une scene donnee par son id, tries par date
 */
export async function getArtistsBySceneId(sceneId) {
  const records = await pb.collection("programation").getFullList({
    filter: `scene = "${sceneId}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map(mapProgramItem);
}

/**
 * Retourne tous les artistes se produisant sur une scene donnee par son nom, tries par date
 */
export async function getArtistsBySceneName(sceneName) {
  const scene = await pb.collection("scenes").getFirstListItem(
    `nom_scene = "${sceneName}"`,
  );

  return await getArtistsBySceneId(scene.id);
}

/**
 * Retourne toutes les programmations d'un artiste par son id
 */
export async function getProgramByArtistId(artistId) {
  return await pb.collection("programation").getFullList({
    filter: `artiste = "${artistId}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

/**
 * Programme complet trie par date
 */
export async function getFullProgram() {
  return await pb.collection("programation").getFullList({
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

/**
 * Programmation filtree par jour
 */
export async function getProgramByDay(jour) {
  return await pb.collection("programation").getFullList({
    filter: `jour_label = "${jour}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

/**
 * Liste des partenaires
 */
export async function getPartners() {
  return await pb.collection("partenaires").getFullList({
    sort: "+ordre_affichage",
  });
}

/**
 * Liste des tarifs
 */
export async function getTarifs() {
  return await pb.collection("tarifs").getFullList({
    sort: "+ordre_affichage",
  });
}

/**
 * Liste des questions FAQ
 */
export async function getFaqs() {
  return await pb.collection("faq").getFullList({
    sort: "+ordre_affichage",
  });
}

/**
 * Liste des artistes
 */
export async function getArtists() {
  return await pb.collection("artistes").getFullList({
    sort: "+nom_artiste",
  });
}

/**
 * Liste des scenes
 */
export async function getScenes() {
  return await pb.collection("scenes").getFullList({
    sort: "+nom_scene",
  });
}

/**
 * Liste de l'equipe
 */
export async function getTeam() {
  return await pb.collection("equipe").getFullList({
    sort: "+ordre_affichage",
  });
}

/**
 * Artistes filtres par genre musical
 */
export async function getArtistsByGenre(genre) {
  return await pb.collection("artistes").getFullList({
    filter: `genre_musical = "${genre}"`,
    sort: "+nom_artiste",
  });
}

/**
 * Liste des genres uniques
 */
export async function getGenres() {
  const artists = await getArtists();
  return [...new Set(artists.map((artist) => artist.genre_musical).filter(Boolean))];
}

/**
 * Liste des jours uniques depuis la programmation
 */
export async function getDays() {
  const records = await pb.collection("programation").getFullList({
    sort: "+date_representation",
  });

  return [...new Set(records.map((item) => item.jour_label).filter(Boolean))];
}

/**
 * Permet d'ajouter ou modifier les informations d'un artiste ou d'une scene
 */
export async function saveRecord(collectionName, data, id = null) {
  if (id) {
    return await pb.collection(collectionName).update(id, data);
  }

  return await pb.collection(collectionName).create(data);
}
