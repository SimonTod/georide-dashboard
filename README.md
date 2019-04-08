# Dashboard GeoRide

Une interface qui permet de verrouiller et déverrouiller un tracker, de voir les trajets et autres infos dispo depuis l'API https://api.georide.fr.
Nécessite l'installation de NodeJS (version > 6)

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
