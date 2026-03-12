// Importation de la bibliotheque PocketBase
import PocketBase from "pocketbase";

// Definition de l'URL de l'instance PocketBase
const POCKETBASE_URL = "https://lesrivesduterritoire.ayyobi.fr";

export const pb = new PocketBase(POCKETBASE_URL);

const COLLECTIONS = {
  artists: ["artistes", "artists"],
  scenes: ["scenes", "scene"],
  program: ["programation", "programmation"],
  partners: ["partenaires", "partners"],
  tarifs: ["tarifs", "tarif"],
  faq: ["faq", "faqs"],
  team: ["equipe", "team"],
};

const resolvedCollections = new Map();

function isNotFoundError(error) {
  return error?.status === 404;
}

function getCollectionCandidates(key) {
  return COLLECTIONS[key] || [key];
}

async function withCollection(key, handler) {
  const cached = resolvedCollections.get(key);
  const candidates = cached
    ? [cached, ...getCollectionCandidates(key).filter((name) => name !== cached)]
    : getCollectionCandidates(key);

  let lastNotFoundError = null;

  for (const collectionName of candidates) {
    try {
      const result = await handler(collectionName);
      resolvedCollections.set(key, collectionName);
      return result;
    } catch (error) {
      if (isNotFoundError(error)) {
        lastNotFoundError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastNotFoundError;
}

async function getFullListOrEmpty(key, options = {}) {
  try {
    return await withCollection(key, (collectionName) =>
      pb.collection(collectionName).getFullList(options),
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return [];
    }

    throw error;
  }
}

async function getOneOrNull(key, id) {
  try {
    return await withCollection(key, (collectionName) =>
      pb.collection(collectionName).getOne(id),
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

async function getFirstListItemOrNull(key, filter, options = {}) {
  try {
    return await withCollection(key, (collectionName) =>
      pb.collection(collectionName).getFirstListItem(filter, options),
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

async function createOrUpdateRecord(key, data, id = null) {
  return withCollection(key, async (collectionName) => {
    if (id) {
      return pb.collection(collectionName).update(id, data);
    }

    return pb.collection(collectionName).create(data);
  });
}

function normalizeSlug(value) {
  return value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

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

export function getFileUrl(record, field) {
  if (!record || !field || !record[field]) return null;

  try {
    return pb.getFileUrl(record, record[field]);
  } catch (error) {
    if (error?.message?.includes("Missing collection context")) {
      return null;
    }

    throw error;
  }
}

export function getGalleryUrls(record, field) {
  if (!record || !field || !record[field] || !Array.isArray(record[field])) {
    return [];
  }

  return record[field]
    .map((file) => getFileUrl({ ...record, [field]: file }, field))
    .filter(Boolean);
}

export async function getAllArtistsSortedByDate() {
  const records = await getFullListOrEmpty("program", {
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map(mapProgramItem);
}

export async function getAllScenesSortedByName() {
  return getScenes();
}

export async function getAllArtistsSortedByName() {
  return getArtists();
}

export async function getArtistById(id) {
  return getOneOrNull("artists", id);
}

export async function getArtistBySlug(slug) {
  const artists = await getArtists();
  return artists.find((artist) => normalizeSlug(artist.nom_artiste) === slug) || null;
}

export async function getSceneById(id) {
  return getOneOrNull("scenes", id);
}

export async function getSceneBySlug(slug) {
  const scenes = await getScenes();
  return scenes.find((scene) => normalizeSlug(scene.nom_scene) === slug) || null;
}

export async function getArtistsBySceneId(sceneId) {
  const records = await getFullListOrEmpty("program", {
    filter: `scene = "${sceneId}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });

  return records.map(mapProgramItem);
}

export async function getArtistsBySceneName(sceneName) {
  const scene = await getFirstListItemOrNull("scenes", `nom_scene = "${sceneName}"`);

  if (!scene) {
    return [];
  }

  return getArtistsBySceneId(scene.id);
}

export async function getProgramByArtistId(artistId) {
  return getFullListOrEmpty("program", {
    filter: `artiste = "${artistId}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

export async function getFullProgram() {
  return getFullListOrEmpty("program", {
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

export async function getProgramByDay(jour) {
  return getFullListOrEmpty("program", {
    filter: `jour_label = "${jour}"`,
    sort: "+date_representation",
    expand: "artiste,scene",
  });
}

export async function getPartners() {
  return getFullListOrEmpty("partners", {
    sort: "+ordre_affichage",
  });
}

export async function getTarifs() {
  return getFullListOrEmpty("tarifs", {
    sort: "+ordre_affichage",
  });
}

export async function getFaqs() {
  return getFullListOrEmpty("faq", {
    sort: "+ordre_affichage",
  });
}

export async function getArtists() {
  return getFullListOrEmpty("artists", {
    sort: "+nom_artiste",
  });
}

export async function getScenes() {
  return getFullListOrEmpty("scenes", {
    sort: "+nom_scene",
  });
}

export async function getTeam() {
  return getFullListOrEmpty("team", {
    sort: "+ordre_affichage",
  });
}

export async function getArtistsByGenre(genre) {
  return getFullListOrEmpty("artists", {
    filter: `genre_musical = "${genre}"`,
    sort: "+nom_artiste",
  });
}

export async function getGenres() {
  const artists = await getArtists();
  return [...new Set(artists.map((artist) => artist.genre_musical).filter(Boolean))];
}

export async function getDays() {
  const records = await getFullListOrEmpty("program", {
    sort: "+date_representation",
  });

  return [...new Set(records.map((item) => item.jour_label).filter(Boolean))];
}

export async function saveRecord(collectionName, data, id = null) {
  return createOrUpdateRecord(collectionName, data, id);
}
