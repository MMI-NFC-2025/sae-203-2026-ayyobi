import {
  getAllArtistsSortedByDate,
  getScenes,
  getArtists,
  getArtistById,
  getSceneById,
  getArtistsBySceneId,
  getProgramByDay,
  getGenres,
  getDays,
} from "./backend.mjs";

async function test() {
  console.log("=== Artistes tries par date ===");
  console.log(await getAllArtistsSortedByDate());

  console.log("=== Scenes triees par nom ===");
  console.log(await getScenes());

  console.log("=== Artistes tries par nom ===");
  console.log(await getArtists());

  // Remplace par de vrais ids de ta base
  const artistId = "xum7ottta0n7x7n";
  const sceneId = "dtppacxhw0c034h";
  const jour = "Vendredi";

  console.log("=== Artiste par id ===");
  console.log(await getArtistById(artistId));

  console.log("=== Scene par id ===");
  console.log(await getSceneById(sceneId));

  console.log("=== Programmation par scene id ===");
  console.log(await getArtistsBySceneId(sceneId));

  console.log("=== Programmation par jour ===");
  console.log(await getProgramByDay(jour));

  console.log("=== Genres disponibles ===");
  console.log(await getGenres());

  console.log("=== Jours disponibles ===");
  console.log(await getDays());
}

test();
