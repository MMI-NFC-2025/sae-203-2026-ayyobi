import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// fonction pour construire l'url d'une image à partir de son nom de fichier
export function getFileUrl(collection, id, file) {
  if (!file) return "https://placehold.co/600x400"
  return `http://127.0.0.1:8090/api/files/${collection}/${id}/${file}`
}

// fonctions pour récupérer les données depuis PocketBase
export async function getArtistes() {
  return await pb.collection('artistes').getFullList({
    sort: 'nom_artiste'
  })
}

// fonction pour récupérer un artiste par son id
export async function getArtisteById(id) {
  return await pb.collection('artistes').getOne(id)
}

// fonction pour récupérer les scènes
export async function getScenes() {
  return await pb.collection('scenes').getFullList({
    sort: 'nom_scene'
  })
}

// fonction pour récupérer une scène par son id
export async function getSceneById(id) {
  return await pb.collection('scenes').getOne(id)
}


// fonction pour récupérer la programmation complète, avec les artistes et les scènes associés
export async function getProgrammation() {
  return await pb.collection('programmation').getFullList({
    expand: 'artiste,scene',
    sort: 'date_representation'
  })
}

// fonction pour récupérer la programmation d'une scène, avec les artistes associés
export async function getArtistesBySceneId(sceneId) {
  return await pb.collection('programmation').getFullList({
    expand: 'artiste,scene',
    filter: `scene="${sceneId}"`,
    sort: 'date_representation'
  })
}

// fonction pour récupérer la programmation d'un artiste, avec les scènes associées
export async function getFaq() {
  return await pb.collection('faq').getFullList({
    sort: 'ordre_affichage'
  })
}

// fonction pour récupérer la programmation d'un artiste, avec les scènes associées
export async function getTarifs() {
  return await pb.collection('tarifs').getFullList({
    sort: 'ordre_affichage'
  })
}

// fonction pour récupérer la programmation d'un artiste, avec les scènes associées
export async function getPartenaires() {
  return await pb.collection('partenaires').getFullList({
    sort: 'ordre_affichage'
  })
}


// fonction pour récupérer la programmation d'un artiste, avec les scènes associées
export async function getProgrammationByArtiste(id) {
  return await pb.collection('programmation').getFullList({
    expand: 'scene',
    filter: `artiste="${id}"`,
    sort: 'date_representation'
  })
}