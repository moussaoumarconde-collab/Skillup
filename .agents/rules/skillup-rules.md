---
trigger: always_on
---

# SKILLUP — RÈGLES PERMANENTES DU PROJET

## 1. RÈGLE ABSOLUE : VALIDATION AVANT ACTION

L'utilisateur est l'autorité finale sur SkillUp.

Tu peux analyser, réfléchir, détecter des problèmes et proposer des améliorations.

Tu ne dois JAMAIS, sans validation explicite :
- créer un fichier ;
- modifier un fichier ;
- supprimer ou déplacer un fichier ;
- modifier le code ;
- créer une fonctionnalité ;
- supprimer une fonctionnalité ;
- modifier le design ;
- modifier la base de données ;
- modifier Supabase ;
- installer ou supprimer une dépendance ;
- modifier une configuration ;
- modifier une API ;
- déployer l'application.

PROCÉDURE OBLIGATOIRE :

ANALYSER → PROPOSER → ATTENDRE LA VALIDATION → EXÉCUTER → VÉRIFIER → RAPPORTER

Une validation concerne uniquement les changements proposés. Ne profite jamais d'une validation pour effectuer d'autres changements.

En cas de doute : ARRÊTE-TOI ET DEMANDE.

---

## 2. IDENTITÉ DE SKILLUP

SkillUp est une plateforme mobile-first de formations en ligne.

Objectif :
Permettre aux utilisateurs de découvrir, télécharger, suivre des formations, faire des quiz, suivre leurs performances et obtenir des certificats.

Les formateurs peuvent créer, publier et suivre les performances de leurs formations.

Principes :
- SIMPLE
- CLAIR
- RAPIDE
- MOBILE-FIRST
- PROFESSIONNEL

La V1 doit rester volontairement simple.

Ne jamais ajouter une fonctionnalité uniquement parce qu'elle semble intéressante.

---

## 3. NAVIGATION PRINCIPALE

La barre inférieure contient EXACTEMENT 4 éléments :

1. Accueil
2. Formations
3. Mes leçons
4. Quiz

Le Profil est accessible en haut à droite.

Ne jamais ajouter le Profil dans la barre inférieure sans validation explicite.

---

## 4. ACCUEIL

L'accueil doit permettre de découvrir rapidement les formations.

Structure générale :

- En-tête avec accès au Profil
- Section « En vedette »
- Sections de formations
- Bouton « Explorer »
- Performances

Les formations peuvent être présentées dans des carrousels horizontaux.

Sections possibles :
- En vedette
- Les plus likées
- Les plus téléchargées

Les données affichées doivent provenir de données réelles lorsque le système est connecté à la base de données.

---

## 5. CARROUSEL « EN VEDETTE »

La formation centrale doit être :
- rectangulaire ;
- clairement visible ;
- plus importante que les autres.

La formation précédente et la suivante doivent :
- être partiellement visibles ;
- être légèrement moins visibles ;
- rester suffisamment visibles pour montrer qu'il existe d'autres formations.

Les cartes de formation ne doivent pas devenir carrées lorsque le design demandé est rectangulaire.

---

## 6. BOUTON EXPLORER

Le bouton « Explorer » doit être placé entre les sections de formations et les performances.

Action :

Explorer → page Formations

---

## 7. PAGE FORMATIONS

La page Formations est le catalogue général.

Elle contient :
- une barre de recherche en haut ;
- une liste de formations ;
- les informations essentielles ;
- un bouton de téléchargement.

Les formations sont affichées sous forme de rectangles.

Lorsqu'un utilisateur arrive directement sur cette page, les formations peuvent être présentées dans un catalogue général.

Ne pas ajouter inutilement d'autres contenus ou boutons dans les cartes.

---

## 8. STATUT DES FORMATIONS

Chaque formation doit clairement indiquer son statut.

Formation gratuite :
- afficher « GRATUITE »
- bouton « Télécharger »

Formation payante :
- afficher « PAYANTE »
- afficher le prix si nécessaire
- bouton « Télécharger »

Une formation payante ne doit être téléchargeable que si l'utilisateur possède les droits nécessaires.

---

## 9. PAGE D'UNE FORMATION

Lorsqu'une formation est sélectionnée :

La formation sélectionnée apparaît en premier et reste clairement séparée des autres.

Structure :

FORMATION SÉLECTIONNÉE
↓
AUTRES FORMATIONS

Les autres formations apparaissent en dessous et non sur les côtés.

---

## 10. MES LEÇONS

La page « Mes leçons » concerne uniquement l'apprentissage de l'utilisateur.

Elle peut afficher :
- leçons en cours ;
- dernière leçon ;
- progression ;
- leçons terminées ;
- formations terminées.

L'utilisateur doit pouvoir reprendre facilement son apprentissage.

Parcours :

Formation → Leçon → Quiz → Résultat → Certificat

La progression doit être sauvegardée.

---

## 11. QUIZ

Les quiz sont liés aux formations.

Les exercices sont créés par le formateur de la formation.

V1 :
- choix multiple ;
- vrai/faux.

Le formateur peut définir :
- questions ;
- réponses ;
- bonne réponse ;
- ordre des questions.

Après le quiz, afficher :
- score ;
- progression ;
- résultat.

---

## 12. CLASSEMENTS ET PERFORMANCES

Les élèves peuvent consulter leurs performances et les comparer aux autres apprenants.

Exemples :
- progression ;
- score moyen ;
- formations terminées ;
- quiz réussis ;
- position relative.

Les formateurs peuvent consulter :
- nombre d'apprenants ;
- vues ;
- likes ;
- téléchargements ;
- note moyenne ;
- taux de complétion ;
- évolution de leurs résultats.

Les classements doivent utiliser de vraies données.

Ne jamais inventer de statistiques en production.

---

## 13. PROFIL

Le Profil est accessible en haut à droite.

Il peut contenir :
- nom ;
- photo ;
- statistiques ;
- formations terminées ;
- certificats ;
- performances ;
- abonnement.

Le Profil doit également proposer un accès à la création de formation pour les utilisateurs autorisés.

---

## 14. CRÉATION D'UNE FORMATION

Le parcours doit rester simple :

Informations → Contenu → Exercices → Aperçu → Publication

Informations :
- titre ;
- image ;
- description ;
- catégorie ;
- niveau ;
- durée ;
- gratuit/payant ;
- prix si payant.

Contenu :
- modules ;
- leçons ;
- vidéos ;
- textes ;
- images.

Exercices :
- questions ;
- réponses ;
- bonne réponse.

Avant publication, le formateur doit pouvoir vérifier sa formation.

---

## 15. DESIGN

Le design de SkillUp doit toujours être :

- clair ;
- sobre ;
- moderne ;
- professionnel ;
- mobile-first.

Utiliser maximum 3 couleurs principales.

Utiliser peu de texte.

Privilégier :
- titres courts ;
- boutons simples ;
- informations essentielles.

RÈGLE IMPORTANTE :

LES FORMATIONS SONT TOUJOURS RECTANGULAIRES.

Ne pas modifier automatiquement les couleurs, formes, tailles, espacements ou dispositions.

Toute amélioration visuelle doit d'abord être proposée.

---

## 16. COHÉRENCE VISUELLE

Toutes les nouvelles pages et fonctionnalités doivent respecter le design existant de SkillUp.

Conserver autant que possible :
- mêmes couleurs ;
- mêmes typographies ;
- mêmes boutons ;
- mêmes cartes ;
- mêmes espacements ;
- mêmes règles de navigation.

Une nouvelle fonctionnalité ne doit pas donner l'impression d'appartenir à une autre application.

---

## 17. BASE DE DONNÉES

Supabase est la base principale.

Les principales données concernent :
- utilisateurs ;
- rôles ;
- formations ;
- catégories ;
- modules ;
- leçons ;
- quiz ;
- questions ;
- réponses ;
- progression ;
- likes ;
- téléchargements ;
- vues ;
- certificats ;
- abonnements ;
- paiements ;
- statistiques.

Toute modification importante de la base doit être proposée avant exécution.

---

## 18. RÔLES

Élève :
- consulter ;
- télécharger selon ses droits ;
- apprendre ;
- faire les quiz ;
- voir ses performances ;
- obtenir ses certificats.

Formateur :
- créer ses formations ;
- modifier ses formations ;
- créer ses exercices ;
- publier ;
- consulter ses performances.

Administrateur :
- gérer la plateforme selon les permissions prévues.

Un utilisateur ne doit jamais pouvoir s'attribuer lui-même un rôle privilégié.

---

## 19. SÉCURITÉ

Un utilisateur ne doit jamais pouvoir :
- modifier les données d'un autre utilisateur ;
- modifier ses propres statistiques ;
- se donner Premium ;
- modifier un paiement ;
- fabriquer un certificat ;
- accéder aux données privées d'un autre utilisateur.

Respecter les règles de sécurité et d'accès de Supabase.

---

## 20. PAIEMENTS

FedaPay peut être utilisé pour les paiements.

Flux :

Utilisateur → Paiement → Vérification → Confirmation → Accès

Ne jamais donner automatiquement un accès payant uniquement parce qu'une page de succès apparaît.

La confirmation du paiement doit être vérifiée correctement.

---

## 21. CERTIFICATS

Les certificats doivent être générés uniquement à partir de données réelles.

Ils doivent contenir au minimum :
- nom ;
- formation ;
- date ;
- identifiant unique.

Ils doivent pouvoir être vérifiés.

---

## 22. INTERDICTION D'INVENTER DES FONCTIONNALITÉS

Ne jamais ajouter automatiquement :
- chat ;
- réseau social ;
- amis ;
- IA ;
- notifications complexes ;
- gamification avancée ;
- fonctionnalités B2B ;
- fonctionnalités hors V1.

Si une idée semble utile :

PROPOSE-LA.

Ne l'implémente jamais automatiquement.

---

## 23. INTERDICTION D'ÉLARGIR UNE DEMANDE

Si l'utilisateur demande :

« Modifie la page d'accueil »

Tu modifies uniquement ce qui concerne la demande validée.

Ne profite jamais de l'occasion pour :
- refactoriser le projet ;
- nettoyer d'autres fichiers ;
- modifier d'autres pages ;
- changer le design général ;
- améliorer d'autres fonctionnalités.

Toute modification supplémentaire nécessite une nouvelle proposition et une nouvelle validation.

---

## 24. EN CAS DE PROBLÈME

Si tu détectes un problème :

1. explique le problème ;
2. explique la cause probable ;
3. propose une correction ;
4. indique les fichiers concernés ;
5. attends la validation.

Ne corrige pas automatiquement un problème découvert en dehors du périmètre validé.

---

## 25. AVANT CHAQUE INTERVENTION

Toujours vérifier :

1. Quelle est la demande exacte ?
2. Quelles règles SkillUp sont concernées ?
3. Quels fichiers sont concernés ?
4. Quel sera l'impact ?
5. La modification a-t-elle été explicitement validée ?

Si la réponse à la dernière question est NON :

NE RIEN MODIFIER.

---

## 26. FORMAT DE PROPOSITION

Avant toute modification non déjà autorisée, utiliser :

### ANALYSE
Ce que j'ai compris :
...

### PROPOSITION
Je propose de :
1. ...
2. ...
3. ...

### FICHIERS CONCERNÉS
- ...
- ...

### IMPACT
...

### VALIDATION
Attendre la validation explicite de l'utilisateur.

---

## 27. APRÈS VALIDATION

Exécuter uniquement ce qui a été validé.

Puis vérifier le résultat.

Rapporter :

- Modifié :
- Créé :
- Supprimé :
- Testé :
- Résultat :

---

# RÈGLE FINALE

NE JAMAIS DÉCIDER À LA PLACE DE L'UTILISATEUR.

NE JAMAIS MODIFIER SANS VALIDATION.

NE JAMAIS INVENTER DE FONCTIONNALITÉS.

NE JAMAIS ÉLARGIR UNE DEMANDE.

NE JAMAIS DÉTRUIRE OU REMPLACER QUELQUE CHOSE SANS AUTORISATION.

TOUJOURS :

ANALYSER → PROPOSER → ATTENDRE → EXÉCUTER → VÉRIFIER → RAPPORTER

SkillUp doit rester SIMPLE, CLAIR, SOBRE, MOBILE-FIRST et COHÉRENT.