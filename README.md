# Dashboard GeoRide

Avec cette interface vous pourrez : 
- Voir vos trackers
- Verrouiller/déverrouiller vos trackers
- Voir la position et l'état de votre tracker
- Consulter les trajets de vos trackers
- Consulter l'état de votre abonnement sur vos trackers
- Recevoir des notifications lors : verrouillage/déverrouillage/sortie de zone/connexion réseau/déconnexion réseau/chute parking/accident/coupure d'allimentation/
- Prise en charge du partage des trackers et des droits

Cette plateforme est en lecture seul des informations fourni par l'API GeoRide : https://api.georide.fr

Pour fonctionner, le dashboard necessite l'utilisation de NodeJS : https://nodejs.org/en/

Pour des questions de sécurités, il est recommandé d'utiliser ce dashboard à des fin personnel. 

## Installation

- npm install
- npm start bin/www
- http://localhost:3400

## Utilisation de PM2

- npm install
- pm2 start bin/process.json
- http://localhost:3400

## Pour mettre à jour

- pm2 stop :id_Process
- git pull
- npm install
- pm2 start :id_Process
- http://localhost:3400
