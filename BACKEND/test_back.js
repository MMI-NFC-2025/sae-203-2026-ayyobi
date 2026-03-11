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
  console.log("=== Artistes triés par date ===");
  console.log(await getAllArtistsSortedByDate());

  console.log("=== Scènes triées par nom ===");
  console.log(await getAllScenesSortedByName());

  console.log("=== Artistes triés par nom ===");
  console.log(await getAllArtistsSortedByName());

  // Remplace par de vrais ids de ta base
  const artistId = "xum7ottta0n7x7n";
  const sceneId = "dtppacxhw0c034h";

  console.log("=== Artiste par id ===");
  console.log(await getArtistById(artistId));

  console.log("=== Scène par id ===");
  console.log(await getSceneById(sceneId));

  console.log("=== Artistes par scène id ===");
  console.log(await getArtistsBySceneId(sceneId));

  console.log("=== Artistes par scène nom ===");
  console.log(await getArtistsBySceneName("Scène Électronique"));
}

test();
