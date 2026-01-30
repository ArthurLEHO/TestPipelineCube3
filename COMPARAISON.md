# Comparaison GitHub Actions vs GitLab CI

## 📊 Vue d'ensemble

| Critère | GitHub Actions | GitLab CI |
|---------|----------------|-----------|
| **Syntaxe** | `jobs` + `steps` | `stages` + `jobs` |
| **Visualisation** | Liste de jobs | Pipeline séquentiel visuel ⭐ |
| **Marketplace** | Énorme (20k+ actions) ⭐ | Limité |
| **Docker** | Nécessite configuration | Natif ⭐ |
| **Cache** | Via actions | Natif + intelligent ⭐ |
| **Artefacts** | Upload/Download manuel | Automatique entre jobs ⭐ |

---

## 🎯 Forces de chaque plateforme

### GitHub Actions - Forces

#### 1. **Marketplace d'actions réutilisables**
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-python@v5
- uses: codecov/codecov-action@v4
```
✅ **20 000+ actions** prêtes à l'emploi  
✅ Maintenance par la communauté  
✅ Gain de temps énorme

#### 2. **Multi-OS natif**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
```
✅ Windows, Linux, macOS  
✅ Tests cross-platform faciles  
❌ GitLab : Nécessite des runners spécifiques

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

#### 4. **Intégrations GitHub**
```yaml
- uses: github/codeql-action@v2  # Sécurité
- uses: github/super-linter@v5   # Linting
```
✅ Sécurité (Dependabot, CodeQL)  
✅ Écosystème GitHub complet

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

#### 2. **Docker natif**
```yaml
job:
  image: python:3.10-alpine  # N'importe quelle image !
  services:
    - postgres:14
    - redis:alpine
```
✅ Changement d'image par job  
✅ Services très simples  
❌ GitHub : Nécessite `container:` ou actions

#### 3. **Artefacts automatiques**
```yaml
build:
  artifacts:
    paths: [dist/]
    
deploy:
  script:
    - cat dist/app.bin  # Disponible automatiquement !
```
✅ Pas besoin d'upload/download  
✅ Transmission entre stages native  
❌ GitHub : `upload-artifact` + `download-artifact`

#### 4. **Cache intelligent**
```yaml
cache:
  key:
    files: [requirements.txt]  # Change si requirements change
  paths: [.pip-cache/]
```
✅ Cache basé sur fichiers  
✅ Gestion automatique  
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

### GitLab CI - Limites

| Problème | Impact |
|----------|--------|
| **Pas de marketplace** | Réinventer la roue |
| **Mono-OS** | Besoin de runners custom pour Windows/macOS |
| **Moins d'intégrations** | Écosystème plus petit |
| **Self-hosted lourd** | GitLab complet nécessite ressources |

---

## 🔄 Équivalences

| GitLab CI | GitHub Actions |
|-----------|----------------|
| `image: python:3.10` | `runs-on: ubuntu-latest` + `uses: actions/setup-python@v5` |
| `only: [main]` | `if: github.ref == 'refs/heads/main'` |
| `artifacts:` | `uses: actions/upload-artifact@v4` |
| `services:` | `services:` (identique) |
| `needs:` | `needs:` (identique) |
| `when: manual` | `environment:` avec protection |
| `rules:` | `if:` (moins puissant) |
| `cache:` | `actions/cache@v3` |

---

## 🏆 Verdict

### Choisir **GitHub Actions** si :
- ✅ Vous êtes déjà sur GitHub
- ✅ Vous avez besoin de **multi-OS** (Windows, macOS)
- ✅ Vous voulez utiliser des **actions du marketplace**
- ✅ Vous avez des projets open-source (gratuit illimité)

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
