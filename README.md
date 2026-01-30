# Comparaison GitHub Actions vs GitLab CI

## 🌐 Projet : Site Web Statique avec CI/CD

Ce projet démontre la mise en place de pipelines CI/CD pour un site web statique simple (HTML/CSS/JavaScript) en utilisant **GitHub Actions** et **GitLab CI**.

> 📖 **[Voir PIPELINES.md](PIPELINES.md)** pour une explication détaillée étape par étape de chaque pipeline

---

## 🚀 Démarrage Rapide

### Tester localement

```bash
# Installer les dépendances
npm install

# Lancer les tests
npm test

# Builder le site
npm run build

# Servir le site localement
npx serve .
```

Ouvrir http://localhost:3000 dans votre navigateur.

---

## 📁 Structure du projet

```
.
├── index.html              # Page web principale
├── styles.css              # Styles CSS
├── script.js               # JavaScript interactif
├── test.js                 # Tests automatisés
├── build.js                # Script de build
├── package.json            # Configuration npm
├── .github/workflows/
│   └── main.yml           # Pipeline GitHub Actions
├── .gitlab-ci.yml         # Pipeline GitLab CI
├── README.md              # Ce fichier
└── PIPELINES.md           # Explication détaillée des pipelines
```

---

## 📊 Vue d'ensemble

| Critère | GitHub Actions | GitLab CI |
|---------|----------------|-----------|
| **Syntaxe** | `jobs` + `steps` | `stages` + `jobs` |
| **Visualisation** | Liste de jobs | Pipeline séquentiel visuel ⭐ |
| **Marketplace** | Énorme (20k+ actions) ⭐ | Limité |
| **Docker** | Nécessite configuration | Natif ⭐ |
| **Cache** | Via actions | Natif + intelligent ⭐ |
| **Artefacts** | Upload/Download manuel | Automatique entre jobs ⭐ |
| **Multi-OS** | Natif (Ubuntu/Windows/macOS) ⭐ | Nécessite runners custom |

---

## � Pipeline CI/CD

Les deux pipelines effectuent les mêmes étapes :

```
Quality → Test → Build → Deploy Staging → Deploy Production → Cleanup
```

### Étapes du pipeline :

1. **Quality** - Validation du code (linting)
2. **Test** - Tests automatisés (+ multi-OS pour GitHub)
3. **Build** - Construction du site → dossier `dist/`
4. **Deploy Staging** - Déploiement auto sur `develop`
5. **Deploy Production** - Déploiement manuel sur `main`
6. **Cleanup** - Nettoyage des ressources

> 📖 **[Voir PIPELINES.md](PIPELINES.md)** pour les détails de chaque étape

---

## 🎯 Forces de chaque plateforme

### GitHub Actions - Forces

#### 1. **Marketplace d'actions réutilisables** ⭐
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: actions/upload-artifact@v4
```
✅ **20 000+ actions** prêtes à l'emploi  
✅ Maintenance par la communauté  
✅ Gain de temps énorme (setup Node.js en 2 lignes)

#### 2. **Multi-OS natif** ⭐
```yaml
tests-multi-os:
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
```
✅ **Windows, Linux, macOS en parallèle**  
✅ Tests cross-platform automatiques  
✅ Aucune infrastructure supplémentaire nécessaire  
❌ GitLab : **Impossible sans runners custom self-hosted**

#### 3. **Triggers flexibles**
```yaml
on:
  push:
  pull_request:
  workflow_dispatch:  # Déclenchement manuel
  schedule:
    - cron: '0 2 * * 1'
```
✅ Syntaxe très claire  
✅ `workflow_dispatch` pour UI  
✅ Events multiples (issues, releases, etc.)

#### 4. **Intégrations GitHub** ⭐
```yaml
- uses: github/super-linter@v5   # Linting multi-langages
```
✅ Sécurité (Dependabot, CodeQL)  
✅ Écosystème GitHub complet  
✅ Déploiement GitHub Pages intégré

---

### GitLab CI - Forces

#### 1. **Pipeline visuel séquentiel**
```yaml
stages:
  - quality
  - test
  - build
  - deploy
```
✅ **Interface graphique** exceptionnelle  
✅ Visualisation du flow complet  
✅ Compréhension immédiate

#### 2. **Docker natif** ⭐
```yaml
linting:
  image: node:20-alpine  # N'importe quelle image Docker !
  
build:
  image: nginx:alpine    # Change d'image par job
```
✅ Changement d'image par job simple  
✅ Léger (Alpine) ou complet selon besoin  
❌ GitHub : Nécessite `container:` ou actions

#### 3. **Artefacts automatiques** ⭐
```yaml
build:
  artifacts:
    paths: [dist/]
    
deploy:
  script:
    - ls dist/  # Disponible automatiquement !
```
✅ Pas besoin d'upload/download  
✅ Transmission entre stages native  
✅ Simple et intuitif  
❌ GitHub : `upload-artifact` + `download-artifact` manuels
 ⭐
```yaml
cache:
  key:
    files: [package-lock.json]  # Change si package-lock change
  paths: [node_modules/]
```
✅ Cache basé sur fichiers  
✅ Gestion automatique  
✅ Plus rapide que GitHub  
❌ GitHub : Nécessite `actions/cache` avec clés manuelles
✅ Plus rapide que GitHub

#### 5. **Rules avancées**
```yaml
deploy:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
    - if: $CI_MERGE_REQUEST_ID
      when: never
```
✅ Logique conditionnelle puissante  
✅ Plus lisible que `if:` GitHub  
✅ `when: manual` natif

#### 6. **Environnements protégés**
```yaml
deploy:
  environment:
    name: production
    on_stop: cleanup_prod  # Nettoyage auto
```
✅ Interface de gestion des envs  
✅ Protection native  
✅ Historique des déploiements

#### 7. **YAML Anchors (DRY)**
```yaml
.template: &common
  before_script:
    - pip install -r requirements.txt

job1:
  <<: *common  # Réutilisation facile
```
✅ Évite la répétition  
✅ YAML natif  
❌ GitHub : Nécessite composite actions

---

## ⚠️ Limites de chaque plateforme

### GitHub Actions - Limites

| Problème | Impact |
|----------|--------|
| **Pas de Docker natif** | Besoin d'actions ou `container:` |
| **Artefacts verbeux** | Upload/Download manuels |
| **Syntaxe `if:`** | `github.ref == 'refs/heads/main'` peu lisible |
| **Pas de stages** | Difficulté à visualiser le flow |
| **Cache complexe** | `actions/cache` + clés manuelles |
| **Services limités à Linux** | Redis, PostgreSQL uniquement sur ubuntu-latest |

### GitLab CI - Limites

| P⚡ Déclenchement des Pipelines

### GitHub Actions
```bash
# Push sur main → déploiement production
git push origin main

# Push sur develop → déploiement staging
git push origin develop

# Ou déclenchement manuel via l'UI GitHub
```

### GitLab CI
```bash
# Push sur main → attente déploiement manuel production
git push origin main

# Push sur develop → déploiement automatique staging
git push origin develop
```

---

## 🔄 Équivalences Syntaxiquact |
|----------|--------|
| **Pas de marketplace** | Réinventer la roue |
| **Mono-OS** | Besoin de runners custom pour Windows/macOS |
| **Moins d'intégrations** | Écosystème plus petit |
| **Self-hosted lourd** | GitLab complet nécessite ressources |

---

## 🔄 Équivalences

| GitLab CI | GitHub Actions |
|---------node:20-alpine` | `runs-on: ubuntu-latest` + `uses: actions/setup-node@v4` |
| `only: [main]` | `if: github.ref == 'refs/heads/main'` |
| `artifacts:` | `uses: actions/upload-artifact@v4` |
| `services:` | `services:` (identique, mais limité à Linux) |
| `needs:` | `needs:` (identique) |
| `when: manual` | `environment:` avec protection |
| `rules:` | `if:` (moins puissant) |
| `cache:` | `actions/cache@v3` |

---

## 🧪 Tester localement

```bash
# Ouvrir le site web
npx serve .

# Lancer les tests
npm test

# Builder le site
npm run build
```t) |
| `cache:` | `actions/cache@v3` |

---

## 🏆 Verdict

### Choisir **GitHub Actions** si :
- ✅ Vous êtes déjà sur GitHub
- ✅ **Vous avez besoin de multi-OS** (Windows, macOS) ⭐ KILLER FEATURE
- ✅ Vous voulez utiliser des **actions du marketplace** (20k+ actions)
- ✅ Vous avez des projets open-source (gratuit illimité)
- ✅ Vous voulez un écosystème riche d'intégrations

### Choisir **GitLab CI** si :
- ✅ Vous voulez une **interface visuelle** exceptionnelle
- ✅ Vous utilisez beaucoup **Docker**
- ✅ Vous voulez des **artefacts automatiques**
- ✅ Vous hébergez votre propre GitLab (self-hosted)
- ✅ Vous préférez une syntaxe plus **claire et lisible**

---

## 📈 Exemple concret : Différence de syntaxe

### Déploiement conditionnel

**GitLab CI** (clair) :
```yaml
deploy:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
```

**GitHub Actions** (verbeux) :
```yaml
deploy:
  if: github.ref == 'refs/heads/main'
  environment: production  # Protection manuelle via UI
```

---

## 🎓 Conclusion

Les deux outils sont **excellents** mais avec des philosophies différentes :

- **GitHub Actions** = Écosystème riche, marketplace, multi-OS
- **GitLab CI** = Simplicité, Docker natif, interface visuelle

Le meilleur choix dépend de votre contexte technique et organisationnel.
