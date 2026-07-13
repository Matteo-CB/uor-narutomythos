/* Mini-chatbot Naruto Mythos */
/* Cours UOR, exercice 7.2     */
/* JavaScript pur, sans framework, sans service tiers. */
/* Le chatbot fonctionne avec un petit catalogue de questions/reponses */
/* et un appariement par mots-cles. Si rien ne matche, il propose les   */
/* questions disponibles plutot que d'inventer une reponse fausse.       */

(function () {
  'use strict';

  // Catalogue principal : chaque entree a un identifiant, des mots-cles qui
  // declenchent la reponse, et la reponse en HTML (sans script). On reste
  // sur 8 questions principales pour rester dans le perimetre du cours.
  var catalogue = [
    {
      id: 'jouer',
      motsCles: ['joue', 'jouer', 'regle', 'regles', 'comment', 'mecanique'],
      reponse:
        '<p>Le but du jeu est d\'envoyer tes ninjas en mission pour marquer plus de points que ton adversaire en 4 manches.</p>' +
        '<p>Chaque manche tu joues des personnages face cachee ou face visible sur des cartes mission, puis on compare les puissances totales. Le plus fort sur une mission marque ses points.</p>' +
        '<p>Le plus simple pour decouvrir : tutoriel integre du simulateur, ou la fiche regle sur le site de Cicaboom.</p>'
    },
    {
      id: 'joueurs',
      motsCles: ['joueurs', 'simulateur', 'combien', 'monde', 'inscrits', 'communaute'],
      reponse:
        '<p>Le simulateur a passe la barre des 4000 joueurs inscrits. Il y a en permanence des parties en cours, surtout en fin d\'apres-midi heure francaise et le week-end.</p>' +
        '<p>Beaucoup de joueurs s\'en servent aussi pour s\'entrainer avant les tournois physiques organises en boutique.</p>'
    },
    {
      id: 'sets',
      motsCles: ['set', 'sets', 'extensions', 'ks', 'ss', 'akatsuki', 'konoha', 'shinobi', 'sortie'],
      reponse:
        '<p>Il y a un seul set officiellement sorti pour le moment, <strong>Konoha Shido</strong> (KS), 130 cartes.</p>' +
        '<p>Deux autres sont annonces : <strong>Shinobi Shiren</strong> (SS) et <strong>Akatsuki</strong> (AK). Sur le simulateur ils apparaissent deja en "coming soon" mais aucune carte n\'est encore jouable.</p>'
    },
    {
      id: 'forte',
      motsCles: ['forte', 'fort', 'meilleure', 'puissante', 'op', 'meta', 'carte'],
      reponse:
        '<p>Aucune carte n\'est intrinsequement la plus forte du jeu, tout depend du deck et de la situation.</p>' +
        '<p>Mais si on doit citer une carte impressionnante : la <strong>Sasuke Uchiha 136 Marque Maudite du Ciel</strong>, secrete, puissance 8 pour 7 de chakra, avec un effet de defaite qui change vraiment l\'equilibre des manches.</p>' +
        '<p>Les Mythos et la Legendaire restent les rarites les plus convoitees pour la collection plus que pour la puissance pure.</p>'
    },
    {
      id: 'elo',
      motsCles: ['elo', 'classement', 'rank', 'ranked', 'ladder', 'leaderboard'],
      reponse:
        '<p>Le simulateur utilise un systeme ELO classique inspire des echecs. K=32, gain minimum +10 par victoire et perte maximale -32.</p>' +
        '<p>Il y a aussi un bonus de performance sur les victoires nettes (gros ecart de score, board adverse vide) plafonne a +15.</p>' +
        '<p>Le leaderboard est public et l\'historique des matchs est conserve pendant 14 jours sur la fiche de chaque joueur.</p>'
    },
    {
      id: 'acheter',
      motsCles: ['acheter', 'achete', 'achat', 'boutique', 'cartes', 'physique', 'shop', 'prix'],
      reponse:
        '<p>Les boosters de Naruto Mythos sont vendus dans les boutiques de jeux de cartes en France et chez la plupart des revendeurs en ligne specialises.</p>' +
        '<p>Personnellement, j\'achete dans une boutique a Avignon, mais Cicaboom liste les revendeurs officiels sur leur site.</p>' +
        '<p>Si tu joues uniquement sur le simulateur, tu n\'as besoin de rien acheter, toutes les cartes du set KS sont jouables gratuitement.</p>'
    },
    {
      id: 'editeur',
      motsCles: ['editeur', 'cicaboom', 'editrice', 'edite', 'qui', 'societe', 'studio'],
      reponse:
        '<p>Naruto Mythos TCG est edite par <strong>Cicaboom</strong>, un editeur italien.</p>' +
        '<p>Ils gerent egalement la communication, l\'organisation des tournois officiels et la distribution des produits derives.</p>' +
        '<p>Cicaboom a reconnu le travail de mon simulateur et m\'a envoye des cartes du set en remerciement, ce qui est plutot cool venant d\'un editeur officiel.</p>'
    },
    {
      id: 'tournois',
      motsCles: ['tournoi', 'tournois', 'tourney', 'competition', 'topdeck', 'event'],
      reponse:
        '<p>Il y a deux types de tournois :</p>' +
        '<ul>' +
        '<li>Les tournois en ligne organises directement sur le simulateur (Swiss et elimination simple).</li>' +
        '<li>Les tournois physiques officiels organises par Cicaboom et les boutiques partenaires.</li>' +
        '</ul>' +
        '<p>Le simulateur integre une vue qui agrege les resultats des tournois physiques depuis TopDeck.gg, avec les decks gagnants visibles.</p>'
    }
  ];

  // Reponse par defaut quand rien ne matche
  var reponseInconnu =
    '<p>Je ne suis pas sur de comprendre. Voici les sujets que je connais :</p>' +
    '<ul>' +
    '<li>Les regles du jeu</li>' +
    '<li>Le nombre de joueurs du simulateur</li>' +
    '<li>Les sets de cartes disponibles</li>' +
    '<li>Les cartes les plus puissantes</li>' +
    '<li>Le systeme de classement ELO</li>' +
    '<li>Comment acheter les cartes en physique</li>' +
    '<li>L\'editeur du jeu</li>' +
    '<li>Les tournois en ligne et physiques</li>' +
    '</ul>' +
    '<p>Reformule en utilisant un de ces themes.</p>';

  // Selecteurs DOM
  var chatFil = document.getElementById('chat-fil');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
  var suggestions = document.getElementById('chat-suggestions');

  // Normalisation d'un texte pour la comparaison de mots-cles
  function normalise(texte) {
    return texte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Trouve la meilleure entree du catalogue pour une question donnee
  function chercherReponse(question) {
    var q = normalise(question);
    var motsQuestion = q.split(' ').filter(function (m) { return m.length > 1; });

    var meilleur = null;
    var meilleurScore = 0;

    catalogue.forEach(function (entree) {
      var score = 0;
      entree.motsCles.forEach(function (mc) {
        if (motsQuestion.indexOf(normalise(mc)) !== -1) {
          score += 1;
        }
      });
      if (score > meilleurScore) {
        meilleurScore = score;
        meilleur = entree;
      }
    });

    if (meilleur === null || meilleurScore === 0) {
      return null;
    }
    return meilleur.reponse;
  }

  // Ajoute une bulle utilisateur dans le fil de chat
  function ajouterBulleUser(texte) {
    var bulle = document.createElement('div');
    bulle.className = 'bulle bulle-user';
    var p = document.createElement('p');
    p.textContent = texte;
    bulle.appendChild(p);
    chatFil.appendChild(bulle);
    chatFil.scrollTop = chatFil.scrollHeight;
  }

  // Ajoute une bulle du bot avec contenu HTML
  function ajouterBulleBot(html) {
    var bulle = document.createElement('div');
    bulle.className = 'bulle bulle-bot';
    bulle.innerHTML = html;
    chatFil.appendChild(bulle);
    chatFil.scrollTop = chatFil.scrollHeight;
  }

  // Affiche l'indicateur "en train d'ecrire" puis remplace par la vraie reponse
  function reponseAvecDelai(html) {
    var typing = document.createElement('div');
    typing.className = 'bulle bulle-bot bulle-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatFil.appendChild(typing);
    chatFil.scrollTop = chatFil.scrollHeight;

    window.setTimeout(function () {
      typing.remove();
      ajouterBulleBot(html);
    }, 700);
  }

  // Traite l'envoi d'un message utilisateur
  function envoyerMessage(texte) {
    var t = texte.trim();
    if (t === '') return;

    ajouterBulleUser(t);
    chatInput.value = '';

    var reponse = chercherReponse(t);
    reponseAvecDelai(reponse !== null ? reponse : reponseInconnu);
  }

  // Branche le formulaire principal
  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    envoyerMessage(chatInput.value);
  });

  // Branche les chips de suggestion
  suggestions.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var q = chip.getAttribute('data-question') || chip.textContent;
      envoyerMessage(q);
    });
  });

  console.log('Mini-chatbot Naruto Mythos pret. ' + catalogue.length + ' sujets disponibles.');
})();
