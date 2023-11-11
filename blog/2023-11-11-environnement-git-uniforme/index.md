---
slug: environnement-git-uniforme
title: Mettre en place un environnement Git uniforme pour vos équipes
authors: [kevin]
tags: [git, cicd, makefile, uniform]
toc_min_heading_level: 2
toc_max_heading_level: 5
---

## Introduction

Dans notre vie professionnelle quotidienne, il est fréquent de devoir s'adapter aux environnements de nos clients, il est possible de rencontrer plusieurs contraintes techniques, que ça soit la technologie utilisée, le système d'exploitation, la connectivité..
Mais il est également possible de rencontrer d'autre type de contrainte, tel que le formattage du code qui est livré, la compliance en terme de sécurité, le linting.. Tous ces éléments sont à prendre en compte dès le début d'un projet afin d'optimiser la livraison en amont.

<!--truncate-->

Basée sur une expérience récente, je trouve qu'il est important de vous partager mon expérience, ainsi qu'une solution possible pour vous éviter les mêmes problèmes.


## Identifier les besoins

La première étape de cet article est d'identifier avec vous pourquoi avez-vous besoin de continuer à lire cet article. Si l'introduction en vous a pas convaincu, laissez-moi tenter à nouveau avec des exemples plus techniques.

### La lisibilité

Avouez-le, on s'est tous déjà retrouvé devant un morceau de code illisible, où notre seule pensée était de retrouver l'auteur pour qu'il nous explique la bouse qu'il a produite. Une fois retrouvée, la célèbre phrase "oui mais sur mon éditeur de texte, ça rend bien !".

![Facepalm](./img/facepalm.gif)

```css
html {
            box-sizing: border-box;
font-size: 16px    ;
}

*,     *:before,     *:after {
      box-sizing:       inherit ;
      }

        .banana > span:after {
        content: attr(data-points) "pts"     ;
        font-size:    0.875rem;
    position:    absolute;
        top: 50%    ;
  left:     -40%;
        background-color:     var(--white-50)    ;
        padding:    2px 10px;
      color: rgba(1,    1,   1, 1);
        border-radius:     4px;
            }
```
(Cet example provient du lien suivant: https://gist.github.com/hellobrian/d17b5de37feda2b6afc954a74c7d7f1e)

### La compliance

Vous travaillez pour un client qui possède la réputation d'être très restrictif en terme de sécurité, mais vous décidez de ne pas y croire. Dans sa pipeline de CI/CD vous remarquez un bloc nommé "SonarQube" mais vous décidez de l'ignorer. Vous apercevez un autre élément nommé "Checkov" mais encore une fois, vous vous dites que c'est pas mon problème et que ce bloc ne doit servir à rien. C'est ici que vous vous trompez.

Ces deux outils permettent chacun d'analyser le code que vous produisez et de proposer des recommandations (pour checkov), des métriques tel que le coverage unitaire de votre code, les variables non utilisés ou encore des importations inutiles (pour SonarCube).

Vous commencez à construire votre POC (proof of concept) sur votre environnement personnalisé, quotidiennement vous montrez vos progrès au client, ils sont heureux et souhaitent alors pouvoir commencer à utiliser votre travail. Vous apprenez alors qu'il est obligatoire de passer par leur pipeline de CI/CD pour déployer l'application, vous vous dites que c'est pas grave et que ça ne va rien changer, puis vous vous prenez un stop par Checkov qui souligne une cinquantaine de problèmes.

```bash
$ checkov -d .

   ___| |__   ___  ___| | _______   __
  / __| '_ \ / _ \/ __| |/ / _ \ \ / /
 | (__| | | |  __/ (__|   < (_) \ V /
  \___|_| |_|\___|\___|_|\_\___/ \_/

By Prisma Cloud | version: 3.0.32

terraform scan results:

Passed checks: 115, Failed checks: 41, Skipped checks: 30
```

Croyez-moi, ces 41 erreurs ici vont se multiplier par 1.5 voir 2, et vous allez vous arracher les cheveux à tout corriger.

### Le linting

Le linting, c'est quoi ce truc? C'est un processus d'analyse de code source afin d'améliorer la future maintenance d'un programme. Prenons un exemple de code Terraform

```terraform
resource "aws_instance" "example" {
  ami           = "${var.ami}"
  instance_type = "c6a.17xlarge"
  subnet_id     = var.subnet_id
}
```

Que soulignerait un outil de linting dans ce morceau de code? 

1. `ami = "${var.ami}"`
2. `instance_type = "c6a.17xlarge"`

Notre premier point souligné est l'utilisation dépréciée à une variable. Il faudrait utiliser `ami = var.ami` à la place.
Dans notre second point, l'instance_type n'existe pas, et ceci va causer un problème lors du `terraform plan/apply`.

## Git, une solution

> Git ? C'est pas un outil de versionning ? Pourquoi tu me mets ça ici?
>
> — Une lectrice, Alice

Je suis d'accord, Git est un outil permettant de versionner son code source, mais pas que! Git offre également une fonctionnalité très interessante, les <b>Git Hook</b>.

### Git Hook? quésako?

Les hook Git, aussi appelé "Crochet, Hameçon" offrent la possibilité d'exécuter un programme, un script avant une action git. Un exemple serait de formatter le code source avant de faire un commit.

### Les différents hook possible

| Nom du hook | Évènement Git | Description                                                                                                                                                                               | Cas d'utilisation                                                                                                                                                |
|-------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| pre-commit  | git commit    | Ce hook est appelé une fois la commande git commit entrée. Si le script appelé retourne un code autre que 0, le commit sera abandonné et non pris en compte.                              | Lancement d'un outil d'analyse de code (ex: checkov), de linting ou de formattage. Si l'analyse n'est pas conforme, alors on retourne 1 et le commit sera annulé |
| commit-msg  | git commit    | Ce hook est appelé une fois la commande git commit entrée. Il permet de valider ou non la conformité du message de votre commit. Un retour différent de 0 abandonnera le commit en cours. | Vérification du message de commit, si le commit ne convient pas à laconvention de nommage "Conventional Commits", alors on retourne 1 et le commit sera annulé   |
| post-commit | git commit    | Ce hook est appelé une fois le commit terminé, majoritairement utilisé pour des systèmes de notifications.                                                                                | Lancement des tests sur votre projet.                                                                                                                   |

Ci-dessus un tableau contenant quelques hook disponible pour un `git commit`.
Lorsque vous initialisez un nouveau repository git, à l'intérieur du dossier `.git/hooks` vous trouverez une liste d'exemple de hook.

### Création d'un hook de formattage

Nous allons maintenant passer à la pratique, et créer un simple hook qui va vérifier que notre code est formatté. Soit le dossier suivant:

```
.
└── example-project/
    ├── .terraform
    ├── .git/
    │   └── hooks/
    │       └── pre-commit
    ├── main.tf
    └── provider.tf
```

Possèdant le fichier `main.tf` ayant comme contenu:
```terraform
resource "aws_instance" "example" {
  ami = "ami-123456789"
  instance_type = "t2.micro"
  subnet_id = "subnet-1234567"
}
```

Nous souhaitons créer un hook afin de garantir la conformité du formattage de notre code avec la norme Terraform.

Le script `pre-commit` contiendra alors:
```bash
#!/bin/bash
return_code=$(terraform fmt -recursive -check)
exit $return_code
```

Il ne vous reste plus qu'à faire un git commit afin de tester votre hook! Libre à vous de le modifier, d'ajouter des messages d'informations. La seule limite des hooks, c'est votre imagination.


## Mise en place d'une solution uniforme pour votre équipe

Il est maintenant légitime de se poser la question suivante:

> Les hooks, ça m'a l'air bien cool et pratique, mais comment est-ce que je peux mettre ça en place pour mon équipe?
>
> — Un lecteur, Bob

Ce à quoi j'ai envie de répondre, c'est une très bonne question. Les hooks sont locaux et présent dans le dossier `.git`, ils ne sont alors pas partagé sur votre repository distant (GitHub, GitLab, BitBucket, ...) donc comment faire en sorte que ces hooks soit mis en place et adopté pour toute l'équipe?

Une idée serait de créer à l'intérieur de votre repository un dossier `hooks` à la racine, contenant vos différents hooks.

### Via une documentation

La solution la plus simple, et bien c'est la documentation. Chaque repository devrait disposer d'un fichier `README.md` contenant la description du projet, pourquoi il existe et doit contenir des indications, que ça soit de technologie à utiliser, des commandes à utiliser pour déployer, construire ou tester l'application.

Une section "conformitée" peut être créée, indiquant aux utilisateurs de copier le contenu du dossier `/hooks` à l'intérieur de leur dossier `.git/hooks`.

### Via l'utilisation d'un Makefile

Pour les utilisateurs de Makefile — oui, cette technologie n'est pas réservée aux développeurs système 😉 — l'ajout d'une commande make setup peut permettre d'automatiser la mise en place des hooks pour chaque membre.
La commande `make setup` peut contenir:

1. Le téléchargement et l'installation des différentes technologies requise pour le projet
2. La configuration d'un éditeur de texte
3. L'installation des hooks sur le repository local de l'utilisateur.

Exemple d'une commande `make setup`
```bash
setup:
  apt install code git # téléchargement et installation de vscode, git
  cp hooks/* .git/hooks # copie des hooks en local
``` 

## Le mot de la fin

C'est tout pour cet article, je vous remercie si vous êtes arrivés jusqu'ici et j'espère que cet article vous aura servi. N'hésitez pas à me faire vos retours via Linkedin, vos retours me permettrons de m'améliorer, et ça fait toujours plaisir d'obtenir des feedbacks, autant négatif que positif 😀

À bientôt pour un prochain article!