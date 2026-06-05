# 1. Utiliser une image officielle de Python légère et stable
FROM python:3.11-slim

# 2. Définir le dossier de travail par défaut à l'intérieur du conteneur
WORKDIR /app

# 3. Copier d'abord le fichier des dépendances
COPY requirements.txt .

# 4. Installer les packages listés sans garder de fichiers temporaires (gain de place)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Astuce : Laisser le conteneur ouvert en tâche de fond pour écouter nos commandes
CMD ["tail", "-f", "/dev/null"]