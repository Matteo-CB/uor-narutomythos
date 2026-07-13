/* Filtre interactif de cartes Naruto Mythos */
/* Cours UOR, exercice 6.1 (JavaScript + DOM) */
/* Manipulation du DOM en JS pur, sans bibliotheque externe */

(function () {
  'use strict';

  // Etat des filtres courants
  var etat = {
    rarete: 'toutes',
    groupe: 'tous',
    powerMin: 0
  };

  // Selecteurs principaux du DOM, recuperes une fois pour eviter de relire la page
  var cartes = document.querySelectorAll('.carte');
  var compteur = document.getElementById('compteur-cartes');
  var aucunResultat = document.getElementById('aucun-resultat');
  var slider = document.getElementById('slider-power');
  var sliderValeur = document.getElementById('slider-valeur');
  var btnReinit = document.getElementById('reinit');
  var grille = document.getElementById('grille-cartes');

  // Total de cartes pour le compteur d'origine
  var total = cartes.length;

  // Filtre une carte selon l'etat courant
  function carteCorrespond(carte) {
    var r = carte.getAttribute('data-rarete');
    var g = carte.getAttribute('data-groupe');
    var p = parseInt(carte.getAttribute('data-power'), 10);

    if (etat.rarete !== 'toutes' && r !== etat.rarete) return false;
    if (etat.groupe !== 'tous' && g !== etat.groupe) return false;
    if (p < etat.powerMin) return false;
    return true;
  }

  // Applique le filtre a la grille et met a jour le compteur
  function appliquerFiltres() {
    var visibles = 0;
    cartes.forEach(function (carte) {
      if (carteCorrespond(carte)) {
        carte.classList.remove('est-masquee');
        visibles += 1;
      } else {
        carte.classList.add('est-masquee');
      }
    });

    compteur.textContent = visibles;
    aucunResultat.hidden = visibles !== 0;
    grille.style.display = visibles === 0 ? 'none' : 'grid';
  }

  // Active le bon bouton dans un groupe et applique la valeur a l'etat
  function gererClicBouton(event) {
    var btn = event.currentTarget;
    var filtre = btn.getAttribute('data-filtre');
    var valeur = btn.getAttribute('data-valeur');

    if (!filtre || !valeur) return;

    // On enleve la classe actif sur les autres boutons du meme groupe
    var groupe = btn.parentElement;
    var freres = groupe.querySelectorAll('.filtre-btn');
    freres.forEach(function (f) { f.classList.remove('actif'); });
    btn.classList.add('actif');

    etat[filtre] = valeur;
    appliquerFiltres();
  }

  // Branche tous les boutons de filtres
  var boutons = document.querySelectorAll('.filtre-boutons .filtre-btn');
  boutons.forEach(function (btn) {
    btn.addEventListener('click', gererClicBouton);
  });

  // Branche le slider de puissance minimale
  if (slider) {
    slider.addEventListener('input', function (event) {
      var v = parseInt(event.target.value, 10);
      etat.powerMin = v;
      sliderValeur.textContent = v;
      appliquerFiltres();
    });
  }

  // Reinitialisation depuis le message "aucun resultat"
  if (btnReinit) {
    btnReinit.addEventListener('click', function () {
      etat.rarete = 'toutes';
      etat.groupe = 'tous';
      etat.powerMin = 0;
      slider.value = 0;
      sliderValeur.textContent = 0;

      // On remet les boutons par defaut comme actifs
      document.querySelectorAll('#filtres-rarete .filtre-btn').forEach(function (f) {
        f.classList.toggle('actif', f.getAttribute('data-valeur') === 'toutes');
      });
      document.querySelectorAll('#filtres-groupe .filtre-btn').forEach(function (f) {
        f.classList.toggle('actif', f.getAttribute('data-valeur') === 'tous');
      });

      appliquerFiltres();
    });
  }

  // Petit effet : un clic sur une carte la fait pulser. Pas d'effet metier,
  // juste pour montrer la manipulation directe d'un element DOM via classList.
  cartes.forEach(function (carte) {
    carte.addEventListener('click', function () {
      carte.classList.add('est-cliquee');
      window.setTimeout(function () {
        carte.classList.remove('est-cliquee');
      }, 380);
    });
  });

  // Au chargement, on initialise le compteur correctement
  compteur.textContent = total;

  // Petit log pour la console, utile au prof si il regarde
  console.log('Galerie de cartes Naruto Mythos chargee. ' + total + ' cartes au depart.');
})();
