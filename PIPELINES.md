# 📋 Explication des Pipelines CI/CD

Ce document explique en détail ce que font les pipelines GitHub Actions et GitLab CI, étape par étape, avec leurs différences.

---

## 🔄 Vue d'ensemble du workflow

Les deux pipelines suivent le même processus en 6 étapes :

```
Quality → Test → Build → Deploy Staging → Deploy Production → Cleanup
```

---

## 📝 Étape par Étape

### ÉTAPE 1 : Quality (Contrôle Qualité)

#### 🎯 Objectif
Vérifier la qualité du code avant de continuer le pipeline.

#### GitHub Actions
```yaml
linting:
  name: Code Quality Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm install
    - run: npm run test
```

**Fonctionnement :**
- Utilise un runner Ubuntu
- Checkout du code via action du marketplace
- Setup Node.js via action officielle
- Installation des dépendances npm
- Exécution des tests de qualité

#### GitLab CI
```yaml
linting:
  stage: quality
  image: node:20-alpine
  <<: *node_template
  script:
    - npm test
```

**Fonctionnement :**
- Utilise une image Docker Alpine (plus légère)
- Réutilise le template avec anchor YAML
- Installation automatique via before_script
- Exécution des tests

#### ⚖️ Différences
| Aspect | GitHub Actions | GitLab CI |
|--------|----------------|-----------|
| **Setup** | Actions du marketplace | Image Docker native |
| **Runner** | VM Ubuntu | Container Alpine |
| **Réutilisation** | Pas de template | YAML anchors (&) |

---

### ÉTAPE 2 : Tests

#### 🎯 Objectif
Tester le site web sur différentes plateformes.

#### GitHub Actions - Test Principal
```yaml
tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm install
    - run: npm test
```

#### GitHub Actions - Tests Multi-OS 🌟
```yaml
tests-multi-os:
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
```

**FORCE UNIQUE** : GitHub Actions peut tester sur **3 systèmes d'exploitation différents** en parallèle !
- ✅ Ubuntu (Linux)
- ✅ Windows
- ✅ macOS

**GitLab CI ne peut pas faire ça** sans installer des runners custom pour chaque OS.

#### GitLab CI - Tests
```yaml
tests:
  stage: test
  <<: *node_template
  artifacts:
    when: always
    reports:
      junit: test-results.xml
  retry:
    max: 2
```

**Fonctionnement :**
- Tests exécutés dans un container
- Génération de rapports JUnit automatique
- Retry automatique en cas d'échec

#### ⚖️ Différences
| Aspect | GitHub Actions | GitLab CI |
|--------|----------------|-----------|
| **Multi-OS** | ✅ Natif (Linux/Windows/macOS) | ❌ Nécessite runners custom |
| **Retry** | Via actions tierces | ✅ Natif avec `retry:` |
| **Rapports** | Via upload | ✅ Intégré avec `reports:` |

---

### ÉTAPE 3 : Build

#### 🎯 Objectif
Construire le site web et créer les artefacts pour le déploiement.

#### GitHub Actions
```yaml
build:
  needs: [linting, tests, tests-multi-os]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm install
    - run: npm run build
    - uses: actions/upload-artifact@v4
      with:
        name: website-build
        path: dist/
```

**Fonctionnement :**
1. Attend que linting + tests soient terminés (`needs`)
2. Build du site web → crée le dossier `dist/`
3. **Upload manuel** de l'artefact avec action

#### GitLab CI
```yaml
build_website:
  stage: build
  needs:
    - job: linting
    - job: tests
  script:
    - npm run build
  artifacts:
    paths: [dist/]
```

**Fonctionnement :**
1. Attend linting + tests (`needs` = parallélisation)
2. Build du site web → crée `dist/`
3. **Artefacts automatiques** - pas besoin d'action !

#### ⚖️ Différences
| Aspect | GitHub Actions | GitLab CI |
|--------|----------------|-----------|
| **Upload artefact** | ❌ Manuel (`upload-artifact`) | ✅ Automatique |
| **Syntaxe** | 5 lignes pour upload | 2 lignes |
| **Dependencies** | `needs: [job1, job2]` | `needs: - job: job1` |

**AVANTAGE GITLAB** : Les artefacts sont **automatiquement transmis** au stage suivant, pas besoin de download !

---

### ÉTAPE 4A : Deploy Staging

#### 🎯 Objectif
Déployer automatiquement sur l'environnement de staging quand on pousse sur la branche `develop`.

#### GitHub Actions
```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  environment:
    name: staging
    url: https://staging.mon-app.com
  steps:
    - uses: actions/download-artifact@v4  # ⚠️ Download obligatoire
      with:
        name: website-build
    - run: echo "Deploying..."
```

**Fonctionnement :**
1. Condition : uniquement branche develop
2. Environnement staging (visible dans GitHub UI)
3. **Download manuel** de l'artefact
4. Déploiement simulé

#### GitLab CI
```yaml
deploy_staging:
  stage: deploy-staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
      when: always
  environment:
    name: staging
    on_stop: stop_staging  # 🌟 Nettoyage auto
  script:
    - ls dist/  # ✅ Artefacts déjà disponibles !
```

**Fonctionnement :**
1. Rules plus lisibles que `if:`
2. Environnement avec bouton de stop
3. **Pas besoin de download** - artefacts automatiques !
4. Déploiement simulé

#### ⚖️ Différences
| Aspect | GitHub Actions | GitLab CI |
|--------|----------------|-----------|
| **Condition** | `if: github.ref == '...'` | `rules: - if: $CI_...` |
| **Artefacts** | ❌ Download obligatoire | ✅ Déjà disponibles |
| **Nettoyage** | Pas natif | ✅ `on_stop: stop_staging` |
| **Lisibilité** | Syntaxe verbeuse | Plus claire |

**AVANTAGE GITLAB** : Le job `stop_staging` permet d'arrêter l'environnement manuellement !

---

### ÉTAPE 4B : Deploy Production

#### 🎯 Objectif
Déployer manuellement sur la production après validation.

#### GitHub Actions
```yaml
deploy-production:
  if: github.ref == 'refs/heads/main'
  environment:
    name: production
  timeout-minutes: 10
  steps:
    - uses: actions/download-artifact@v4
    - run: echo "Deploying to prod..."
```

**Fonctionnement :**
1. Condition : branche main uniquement
2. Environnement production (peut être protégé dans Settings)
3. Timeout de 10 minutes
4. Download + déploiement

**Pour rendre manuel** : Il faut configurer une "protection" dans Settings > Environments > production

#### GitLab CI
```yaml
deploy_production:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual  # 🌟 Déploiement manuel natif !
  environment:
    name: production
  timeout: 10 minutes
  script:
    - ls dist/  # Artefacts auto
```

**Fonctionnement :**
1. Condition : branche main
2. **`when: manual`** = bouton dans l'UI GitLab
3. Artefacts déjà disponibles
4. Timeout natif

#### ⚖️ Différences
| Aspect | GitHub Actions | GitLab CI |
|--------|----------------|-----------|
| **Déploiement manuel** | Via protection d'environnement | ✅ `when: manual` natif |
| **Configuration** | Dans Settings GitHub | Dans le YAML |
| **Artefacts** | Download manuel | Automatiques |
| **Simplicité** | 2 étapes (config + code) | 1 étape (code) |

**AVANTAGE GITLAB** : Le `when: manual` est **natif et simple** - pas besoin de configuration externe !

---

### ÉTAPE 5 : Cleanup

#### 🎯 Objectif
Nettoyer les ressources temporaires, qu'il y ait eu succès ou échec.

#### GitHub Actions
```yaml
cleanup:
  needs: [deploy-staging, deploy-production]
  if: always()  # S'exécute toujours
  steps:
    - run: echo "Cleaning up..."
```

**Fonctionnement :**
- `if: always()` = exécution même si échecs
- Dépend des deux déploiements
- Nettoyage simple

#### GitLab CI
```yaml
cleanup:
  stage: cleanup
  rules:
    - when: always
  script:
    - echo "Cleaning up..."
```

**Fonctionnement :**
- `when: always` = exécution toujours
- Dernier stage du pipeline
- Nettoyage simple

#### ⚖️ Différences
Quasi identiques ! Les deux utilisent le même concept.

---

## 🎯 Résumé des Différences Majeures

### 🏆 Forces de GitHub Actions

1. **Multi-OS natif** ⭐⭐⭐
   - Tests sur Windows, macOS, Linux sans configuration
   - Impossible nativement avec GitLab

2. **Marketplace d'actions**
   - 20 000+ actions prêtes à l'emploi
   - `actions/checkout`, `actions/setup-node`, etc.

3. **Écosystème GitHub**
   - Intégration parfaite avec GitHub
   - Dependabot, CodeQL, etc.

### 🏆 Forces de GitLab CI

1. **Artefacts automatiques** ⭐⭐⭐
   - Pas besoin d'upload/download
   - Transmission transparente entre stages

2. **Docker natif** ⭐⭐⭐
   - Change d'image par job facilement
   - Containers légers (Alpine)

3. **Syntaxe plus claire**
   - `when: manual` vs protection d'environnement
   - `rules:` vs `if:`
   - YAML anchors pour réutilisation

4. **Interface visuelle** ⭐⭐⭐
   - Pipeline séquentiel très clair
   - Meilleure UX pour suivre l'exécution

5. **Features natives**
   - Retry automatique
   - Rapports de tests intégrés
   - Cache intelligent basé sur fichiers

---

## 📊 Tableau Comparatif Final

| Feature | GitHub Actions | GitLab CI | Gagnant |
|---------|----------------|-----------|---------|
| Multi-OS | ✅ Natif | ❌ Nécessite setup | 🥇 GitHub |
| Artefacts | Upload/Download | Automatique | 🥇 GitLab |
| Docker | Via actions | Natif | 🥇 GitLab |
| Marketplace | 20k+ actions | Limité | 🥇 GitHub |
| Déploiement manuel | Via Settings | `when: manual` | 🥇 GitLab |
| Interface | Liste jobs | Pipeline visuel | 🥇 GitLab |
| Syntaxe | Verbeuse | Concise | 🥇 GitLab |
| Cache | actions/cache | Natif intelligent | 🥇 GitLab |
| Retry | Via actions | Natif | 🥇 GitLab |

---

## 🎓 Conclusion

Les deux outils sont excellents mais répondent à des besoins différents :

### Choisir GitHub Actions si :
- Vous avez besoin de **tester sur plusieurs OS** (Windows, macOS)
- Vous voulez profiter du **marketplace**
- Vous êtes déjà dans l'écosystème GitHub

### Choisir GitLab CI si :
- Vous voulez une **simplicité de configuration**
- Vous utilisez beaucoup **Docker**
- Vous préférez une **interface visuelle claire**
- Vous voulez des **artefacts automatiques**

Pour ce projet de site web statique, **les deux fonctionnent parfaitement** et démontrent leurs forces respectives !
