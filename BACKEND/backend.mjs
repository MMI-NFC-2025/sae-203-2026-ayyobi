import { pb } from "./pocketbase.js";

/**
 * Génère l'URL d'un fichier PocketBase
 */
export function getFileUrl(record, field) {
  if (!record || !field || !record[field]) return null;
  return pb.files.getURL(record, record[field]);
}

/**
 * Génère toutes les URLs d'un champ file multiple
 */
export function getGalleryUrls(record, field) {
  if (!record || !field || !record[field] || !Array.isArray(record[field])) {
    return [];
  }

  return record[field].map((file) => pb.files.getURL(record, file));
}

/**
 * 1. Retourne la liste de tous les artistes triés par date de représentation
 */
export async function getAllArtistsSortedByDate() {
  const records = await pb.collection("programation").getFullList({
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map((item) => ({
    programmationId: item.id,
    date_representation: item.date_representation,
    jour_label: item.jour_label,
    ordre_passage: item.ordre_passage,
    artiste: item.expand?.artiste || null,
    scene: item.expand?.scene || null,
  }));
}

/**
 * 2. Retourne la liste de toutes les scènes triées par nom
 */
export async function getAllScenesSortedByName() {
  return await pb.collection("scenes").getFullList({
    sort: "+nom_scene",
  });
}

/**
 * 3. Retourne la liste de tous les artistes triés par ordre alphabétique
 */
export async function getAllArtistsSortedByName() {
  return await pb.collection("artistes").getFullList({
    sort: "+nom_artiste",
  });
}

/**
 * 4. Retourne les infos d'un artiste par son id
 */
export async function getArtistById(id) {
  return await pb.collection("artistes").getOne(id);
}

/**
 * 5. Retourne les infos d'une scène par son id
 */
export async function getSceneById(id) {
  return await pb.collection("scenes").getOne(id);
}

/**
 * 6. Retourne tous les artistes d'une scène donnée par son id, triés par date
 */
export async function getArtistsBySceneId(sceneId) {
  const records = await pb.collection("programation").getFullList({
    filter: `scene = "${sceneId}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map((item) => ({
    programmationId: item.id,
    date_representation: item.date_representation,
    jour_label: item.jour_label,
    ordre_passage: item.ordre_passage,
    artiste: item.expand?.artiste || null,
    scene: item.expand?.scene || null,
  }));
}

/**
 * 7. Retourne tous les artistes d'une scène donnée par son nom, triés par date
 */
export async function getArtistsBySceneName(sceneName) {
  const scenes = await pb.collection("scenes").getFullList({
    filter: `nom_scene = "${sceneName}"`,
  });

  if (!scenes.length) return [];

  return await getArtistsBySceneId(scenes[0].id);
}

/**
 * Programme complet trié par date
 */
export async function getFullProgram() {
  return await pb.collection("programation").getFullList({
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

/**
 * Programme filtré par jour
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
    sort: "-ordre_affichage",
  });
}

/**
 * Liste des tarifs
 */
export async function getTarifs() {
  return await pb.collection("tarifs").getFullList({
    sort: "-ordre_affichage",
  });
}

/**
 * Liste des questions FAQ
 */
export async function getFaqs() {
  return await pb.collection("faq").getFullList({
    sort: "-ordre_affichage",
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
 * Liste des scènes
 */
export async function getScenes() {
  return await pb.collection("scenes").getFullList({
    sort: "+nom_scene",
  });
}

/**
 * Équipe
 */
export async function getTeam() {
  try {
    return await pb.collection("equipe").getFullList({
      sort: "ordre_affichage",
    });
  } catch (error) {
    return [];
  }
}


/**
 * Ajouter ou modifier un artiste ou une scène
 */
export async function saveRecord(collectionName, data, id = null) {
  if (id) {
    return await pb.collection(collectionName).update(id, data);
  }

  return await pb.collection(collectionName).create(data);
}
