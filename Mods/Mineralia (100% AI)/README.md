# Mineralia

Mod NeoForge pour Minecraft **1.21.1**. Il ajoute quatre minerais générés dans l’Overworld : étain, argent, rubis et saphir. Chaque minerai possède une variante en pierre et en deepslate, ses propres textures pixel art, ses modèles, ses traductions FR/EN et ses tables de butin. Les minerais respectent les niveaux de pioche et Silk Touch/Fortune.

L’étain et l’argent donnent du minerai brut à fondre en lingots. Les lingots et minerais bruts ont des blocs de stockage compressibles. Rubis et saphir sont directement récupérés depuis leurs minerais.

## Construire

- Java 21 (JDK) est requis.
- Importer ce dossier comme projet Gradle dans IntelliJ IDEA ou Eclipse, ou utiliser Gradle 8.8+.
- Lancer `gradle build` ; le mod compilé sera créé dans `build/libs/`.
- Pour le développement, les tâches `runClient` et `runServer` sont fournies par ModDevGradle.

NeoForge ciblé : `21.1.172` (Minecraft `1.21.1`). Les quatre minerais sont ajoutés aux biomes de l’Overworld via des biome modifiers et des features de génération configurées en JSON.

Les PNG 16×16 sont reproductibles avec `node tools/generate_assets.mjs`.

## Présentation

Ouvrir `site/index.html` dans un navigateur pour afficher la page de présentation du mod. Les aperçus utilisent les textures fournies avec le projet.
