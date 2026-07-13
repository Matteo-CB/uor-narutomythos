<?php
/*
 * Traitement du formulaire d'inscription a la newsletter Naruto Mythos.
 * Cours UOR, exercice 5.1.
 * Matteo Chante-Biyikli, ID 82507085, L1 IED Paris 8.
 *
 * Cote serveur : AlwaysData, Apache + PHP 8.x, base MySQL 8.x.
 * Le mot de passe MySQL est lu depuis un fichier PHP place HORS du
 * dossier www (dans ~/config/db.php), pour qu'il ne soit jamais
 * accessible par HTTP et qu'il ne se retrouve jamais dans le depot Git.
 *
 * Le script :
 *   1. Verifie la methode HTTP et la presence des champs requis.
 *   2. Valide chaque champ (format email, valeurs autorisees).
 *   3. Insere la nouvelle inscription dans la table inscriptions via PDO en
 *      requete preparee, ce qui evite les injections SQL.
 *   4. Renvoie une page HTML de confirmation ou un message d'erreur clair.
 */

declare(strict_types=1);

// Configuration de la base, chargee depuis un fichier hors www.
// Sur AlwaysData : /home/matteocb-uor/config/db.php (hors du DocumentRoot www).
// En local pour developpement : placer config/db.php un cran au-dessus
// du dossier site/.
$configFile = __DIR__ . '/../../config/db.php';
if (!is_readable($configFile)) {
    http_response_code(500);
    exit('Configuration absente, contacter l\'administrateur du site.');
}
$config = require $configFile;

// Valeurs autorisees pour les champs a choix limite
$setsAutorises    = ['KS', 'SS', 'AK', 'aucun'];
$niveauxAutorises = ['debutant', 'intermediaire', 'competitif'];

// Etat de la reponse
$erreurs = [];
$succes  = false;
$donnees = [];

// Etape 1 : on n'accepte que le POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $erreurs[] = "Cette page ne s'accede qu'en POST depuis le formulaire.";
} else {

    // Etape 2 : recuperation et nettoyage de base
    $pseudo  = trim($_POST['pseudo']  ?? '');
    $email   = trim($_POST['email']   ?? '');
    $setPref = trim($_POST['set_pref'] ?? '');
    $niveau  = trim($_POST['niveau']  ?? '');
    $message = trim($_POST['message'] ?? '');

    // Etape 3 : validation
    if (mb_strlen($pseudo) < 3 || mb_strlen($pseudo) > 40) {
        $erreurs[] = "Le pseudo doit faire entre 3 et 40 caracteres.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs[] = "L'adresse email ne semble pas valide.";
    }
    if (mb_strlen($email) > 120) {
        $erreurs[] = "L'adresse email est trop longue (max 120 caracteres).";
    }
    if (!in_array($setPref, $setsAutorises, true)) {
        $erreurs[] = "Le set choisi n'est pas valide.";
    }
    if (!in_array($niveau, $niveauxAutorises, true)) {
        $erreurs[] = "Le niveau choisi n'est pas valide.";
    }
    if (mb_strlen($message) > 600) {
        $erreurs[] = "Le message libre depasse 600 caracteres.";
    }

    // Etape 4 : insertion en base si aucune erreur
    if (count($erreurs) === 0) {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                $config['host'],
                $config['dbname'],
                $config['charset'] ?? 'utf8mb4'
            );
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, $config['user'], $config['password'], $options);

            $sql = "INSERT INTO inscriptions (pseudo, email, set_pref, niveau, message, cree_le)
                    VALUES (:pseudo, :email, :set_pref, :niveau, :message, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':pseudo'   => $pseudo,
                ':email'    => $email,
                ':set_pref' => $setPref,
                ':niveau'   => $niveau,
                ':message'  => $message,
            ]);

            $succes  = true;
            $donnees = [
                'pseudo'   => $pseudo,
                'email'    => $email,
                'set_pref' => $setPref,
                'niveau'   => $niveau,
                'message'  => $message,
            ];
        } catch (PDOException $e) {
            // Erreur 23000 = doublon sur cle unique (email deja inscrit)
            if ($e->getCode() === '23000') {
                $erreurs[] = "Cette adresse email est deja inscrite a la newsletter.";
            } else {
                $erreurs[] = "Erreur a l'enregistrement, reessaie plus tard.";
                error_log('Inscription newsletter, erreur PDO : ' . $e->getMessage());
            }
        }
    }
}

// Fonction d'echappement HTML pour eviter le XSS dans la page de confirmation
function echappe(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// Libelle lisible pour les valeurs codees
function libelleSet(string $code): string {
    return match($code) {
        'KS'    => 'Konoha Shido',
        'SS'    => 'Shinobi Shiren',
        'AK'    => 'Akatsuki',
        'aucun' => 'Pas encore de preference',
        default => $code,
    };
}

function libelleNiveau(string $code): string {
    return match($code) {
        'debutant'      => 'Debutant',
        'intermediaire' => 'Intermediaire',
        'competitif'    => 'Competitif',
        default         => $code,
    };
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Confirmation d'inscription | Naruto Mythos Game</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="../css/style.css">
<link rel="stylesheet" href="../css/formulaire.css">
<link rel="stylesheet" href="../css/responsive.css">
</head>
<body>

<nav class="menu-principal" aria-label="Navigation principale">
<div class="menu-inner">
<a href="../index.html" class="menu-logo"><span class="marque">Matteo<span class="logo-dot">.</span></span><span class="marque-sub">L1 IED</span></a>
<ul class="menu-links">
<li><a href="../index.html">Accueil</a></li>
<li><a href="../pages/cartes.html">Cartes</a></li>
<li><a href="../pages/formulaire.html" class="actif">Newsletter</a></li>
<li><a href="../pages/chatbot.html">Chatbot</a></li>
<li><a href="../pages/sources.html">Sources</a></li>
</ul>
</div>
</nav>

<header class="hero hero-page">
<div class="hero-inner">
<p class="hero-petite">Reponse du serveur</p>
<h1><?= $succes ? 'Bienvenue !' : 'Une erreur s\'est produite' ?></h1>
</div>
</header>

<main class="contenu">
<section class="bloc">
<div class="bloc-inner">

<?php if ($succes): ?>

<div class="confirmation">
<p class="succes">Inscription enregistree</p>
<p>Salut <strong><?= echappe($donnees['pseudo']) ?></strong>, ton inscription a la newsletter Naruto Mythos a bien ete prise en compte. Voici le recap de tes infos :</p>

<table>
<tr><th>Pseudo</th><td><?= echappe($donnees['pseudo']) ?></td></tr>
<tr><th>Email</th><td><?= echappe($donnees['email']) ?></td></tr>
<tr><th>Set prefere</th><td><?= echappe(libelleSet($donnees['set_pref'])) ?></td></tr>
<tr><th>Niveau</th><td><?= echappe(libelleNiveau($donnees['niveau'])) ?></td></tr>
<tr><th>Message</th><td><?= $donnees['message'] === '' ? '<em>aucun</em>' : nl2br(echappe($donnees['message'])) ?></td></tr>
</table>

<p>Tu recevras les prochaines annonces de tournois et les sorties des sets <em>Shinobi Shiren</em> et <em>Akatsuki</em> directement par mail.</p>
<p><a href="../index.html">Retourner a l'accueil</a></p>
</div>

<?php else: ?>

<div class="confirmation">
<p class="succes">Probleme lors de l'inscription</p>
<ul class="erreurs">
<?php foreach ($erreurs as $err): ?>
<li><?= echappe($err) ?></li>
<?php endforeach; ?>
</ul>
<p><a href="../pages/formulaire.html">Retour au formulaire</a></p>
</div>

<?php endif; ?>

</div>
</section>
</main>

<footer class="pied">
<div class="pied-inner">
<p class="pied-signature">Matteo Chanté-Biyikli, 2026</p>
</div>
</footer>

</body>
</html>
