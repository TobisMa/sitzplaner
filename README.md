# Sitzplaner
## Features
- Hinzufügen von Schülern (siehe links)
- Auswählen von Tischen (klicken). Tische werden blau markiert
- Ziehen von Schülern auf Tische
- Tische verschieben (ggf. Schülerplätze tauschen)
- Auswählen von Voreinstellungen an Tischanordnungen (Reihen, U-Form, Gruppentische, oder ein leeres Feld)
- Exportieren eines Projektes
- Importieren eines exportierten Projektes
- Import verschiedener Formate erlaubt
- Dateien drag and drop
- Druckansicht

## Run in docker
1. Download the source using `git clone` or github's ZIP-folder
2. Go into the source folder (extract ZIP-folder first)
3. Build the docker image: `docker build -t sitzplaner:v1 .` (the dot at the end is important)
4. Run the docker image: `docker run --name sitzplaner -d -p 8000:80 sitzplaner:v1`
5. Go into the browser onto `127.0.0.1:8000` and use it.