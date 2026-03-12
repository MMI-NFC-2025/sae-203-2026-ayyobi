import PocketBase from "pocketbase";

const pb = new PocketBase("https://lesrivesduterritoire.ayyobi.fr");

const COLLECTIONS = {
  artists: ["artistes", "artists"],
  scenes: ["scenes", "scene"],
  program: ["programation", "programmation"],
  partners: ["partenaires", "partners"],
  tarifs: ["tarifs", "tarif"],
  faq: ["faq", "faqs"],
  team: ["equipe", "team"],
};

function isNotFound(error) {
  return error?.status === 404;
}

function getCollectionNames(key) {
  return COLLECTIONS[key] || [key];
}

async function tryCollections(key, callback) {
  let lastNotFound = null;

  for (const name of getCollectionNames(key)) {
    try {
      return await callback(name);
    } catch (error) {
      if (isNotFound(error)) {
        lastNotFound = error;
        continue;
      }

      throw error;
    }
  }

  if (lastNotFound) {
    throw lastNotFound;
  }

  return null;
}

async function getFullListOrEmpty(key, options = {}) {
  try {
    return await tryCollections(key, (name) =>
      pb.collection(name).getFullList(options),
    );
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

async function getOneOrNull(key, id) {
  try {
    return await tryCollections(key, (name) =>
      pb.collection(name).getOne(id),
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function getFirstListItemOrNull(key, filter, options = {}) {
  try {
    return await tryCollections(key, (name) =>
      pb.collection(name).getFirstListItem(filter, options),
    );
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function createOrUpdateRecord(key, data, id = null) {
  return tryCollections(key, (name) => {
    if (id) {
      return pb.collection(name).update(id, data);
    }

    return pb.collection(name).create(data);
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
