/* Holocard interactif, adapte de mon simulateur Naruto Mythos */
/* Cours UOR, chapitre 6 (DOM) et chapitre 3 (CSS)             */
/*                                                              */
/* Principe : sur les cartes marquees .est-holo, on suit la     */
/* position du pointeur et on met a jour des variables CSS      */
/* (--card-mx, --card-my, --card-posx, --card-posy, --card-o,   */
/*  --card-rx, --card-ry, --card-hyp). Le CSS les utilise pour  */
/* faire bouger les couches de gradient et incliner la carte.   */

(function () {
  'use strict';

  // Selecteur de toutes les cartes holographiques (galerie + carte de l'accueil)
  var cartesHolo = document.querySelectorAll('.carte.est-holo, .carte-mv-wrap');

  // Amplitude max de rotation 3D, en degres
  var rotMax = 14;

  // Met a jour les variables CSS d'une carte selon la position du pointeur
  function appliquerEffet(carte, event) {
    var rect = carte.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Pourcentages dans la carte (0 a 100)
    var px = Math.max(0, Math.min(100, (x / rect.width) * 100));
    var py = Math.max(0, Math.min(100, (y / rect.height) * 100));

    // Distance au centre (hypothenuse normalisee, 0 a 1)
    var dx = px - 50;
    var dy = py - 50;
    var hyp = Math.sqrt(dx * dx + dy * dy) / Math.sqrt(50 * 50 + 50 * 50);

    // Rotation 3D : la carte penche vers le pointeur
    var ry = (px - 50) / 50 * rotMax;
    var rx = -(py - 50) / 50 * rotMax;

    carte.style.setProperty('--card-mx',   px + '%');
    carte.style.setProperty('--card-my',   py + '%');
    carte.style.setProperty('--card-posx', px + '%');
    carte.style.setProperty('--card-posy', py + '%');
    carte.style.setProperty('--card-o',    '1');
    carte.style.setProperty('--card-rx',   rx.toFixed(2) + 'deg');
    carte.style.setProperty('--card-ry',   ry.toFixed(2) + 'deg');
    carte.style.setProperty('--card-hyp',  hyp.toFixed(3));
  }

  // Remet la carte a plat quand le pointeur sort
  function reinitialiser(carte) {
    carte.style.setProperty('--card-mx',   '50%');
    carte.style.setProperty('--card-my',   '50%');
    carte.style.setProperty('--card-posx', '50%');
    carte.style.setProperty('--card-posy', '50%');
    carte.style.setProperty('--card-o',    '0');
    carte.style.setProperty('--card-rx',   '0deg');
    carte.style.setProperty('--card-ry',   '0deg');
    carte.style.setProperty('--card-hyp',  '0');
  }

  // Pour chaque carte holo, on attache les listeners pointer
  cartesHolo.forEach(function (carte) {

    carte.addEventListener('pointerenter', function () {
      carte.classList.add('est-survolee');
    });

    carte.addEventListener('pointermove', function (event) {
      // requestAnimationFrame pour rester fluide meme sur des cartes lourdes
      window.requestAnimationFrame(function () {
        appliquerEffet(carte, event);
      });
    });

    carte.addEventListener('pointerleave', function () {
      carte.classList.remove('est-survolee');
      reinitialiser(carte);
    });

    // Sur mobile, on peut aussi declencher via touch en simulant un mouvement
    carte.addEventListener('touchmove', function (event) {
      var t = event.touches[0];
      if (!t) return;
      window.requestAnimationFrame(function () {
        appliquerEffet(carte, t);
      });
    }, { passive: true });

    carte.addEventListener('touchend', function () {
      reinitialiser(carte);
    });
  });

  console.log('Holocards initialises : ' + carte