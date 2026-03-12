import {
  getAllArtistsSortedByDate,
  getAllScenesSortedByName,
  getAllArtistsSortedByName,
  getArtistById,
  getSceneById,
  getArtistsBySceneId,
  getArtistsBySceneName,
} from "./backend.mjs";

async function test() {
  const artistsByDate = await getAllArtistsSortedByDate();
  const scenesByName = await getAllScenesSortedByName();
  const artistsByName = await getAllArtistsSortedByName();

  console.log("=== Artistes tries par date ===");
  console.log(artistsByDate);

  console.log("=== Scenes triees par nom ===");
  console.log(scenesByName);

  console.log("=== Artistes tries par nom ===");
  console.log(artistsByName);

  const firstArtist = artistsByName[0];
  const firstScene = scenesByName[0];

  if (!firstArtist || !firstScene) {
    console.log("Base incomplete pour tester les fonctions de detail.");
    return;
  }

  const artistId = firstArtist.id;
  const sceneId = firstScene.id;
  const sceneName = firstScene.nom_scene;

  console.log("=== Artiste par id ===");
  console.log(await getArtistById(artistId));

  console.log("=== Scene par id ===");
  console.log(await getSceneById(sceneId));

  console.log("=== Artistes par scene id ===");
  console.log(await getArtistsBySceneId(sceneId));

  console.log("=== Artistes par scene nom ===");
  console.log(await getArtistsBySceneName(sceneName));
}

test();
