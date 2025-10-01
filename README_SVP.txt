CAS 1 :
Documentation de Bootstrap :
https://getbootstrap.com/docs/5.3/getting-started/introduction/
Section principales en nnvce qui nous concerne : Forms et Components

=======================================================================================================================================
CAS 2 :
Pour démarrer le serveur tapez dans la console de VSC :
...>npm run start 

Regardez le fichier package.json, la propriété scripts": {
    "start": "node serveur.js"
  } ce'est le code de "start" qui sera exécuté.

=======================================================================================================================================
CAS 3 : 
Pour utiliser les icônes de Bootstrap dans vote page faites :
    <i class="bi bi-nom-de-icone"></i> 
    Trouvez le nomn de l'icône voulue dans le site de Bootstrap :
    https://icons.getbootstrap.com/
    Cliquez sur l'icône voulu et une page apparait avec les infos de cet icône
    Icon font
    Using the web font? Copy, paste, and go.
    <i class="bi bi-1-circle"></i>  copiez ce code ou cliquez sur l'icône à droite pour copier.
    
=======================================================================================================================================
CAS 4 : 
Les scripts dans le <head> avec l’attribut defer est une bonne pratique moderne.

a. Pourquoi c’est OK ?

defer indique au navigateur de télécharger le script pendant le parsing du HTML, mais de ne l’exécuter qu’après 
que le DOM est entièrement construit.

Ça évite le blocage du rendu (contrairement à un <script> classique dans le <head>).

Résultat = équivalent fonctionnel à mettre les <script> en bas de <body>.

Petits points à vérifier

b. Ordre d’exécution respecté :

Les scripts avec defer s’exécutent dans l’ordre où ils apparaissent dans le HTML.

Donc l'ordre doit être logique : d’abord les dépendances (bootstrap.bundle.min.js), puis tes scripts (global.js, requetes_epices.js).

Dans notre exemple, le bon ordre serait :

<script src="utilitaires/bootstrap/bootstrap.bundle.min.js" defer></script>
<script src="js/global.js" defer></script>
<script type="module" src="requetes/requetes_epices.js" defer></script>


c. Type="module" + defer :

Un <script type="module"> est déjà déféré par défaut, même sans defer.

Donc notre requetes_epices.js il fonctionne sans probéme.

Ajouter defer ne gêne pas, mais ce n’est pas nécessaire.

d. Compatibilité :

Tous les navigateurs modernes gèrent defer.


