import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Image: string; // Path to the PNG image
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Articles',
    Image: require('@site/static/img/article.png').default,
    description: (
      <>
        Plongez dans nos récits DevOps, découvrez des solutions techniques pratiques, et explorez nos architectures avec du code source. Une ressource incontournable pour les passionnés d'ingénierie cloud.
      </>
    ),
  },
  {
    title: 'Infrastructure et Architecture',
    Image: require('@site/static/img/settings.png').default,
    description: (
      <>
        Nous essayons de populer chaque article présent sur le site avec un ou plusieurs schémas d'architecture et d'infrastructure afin de donner une vue d'ensemble au problème rencontré.
      </>
    ),
  },
  {
    title: 'Culture DevOps',
    Image: require('@site/static/img/devops.png').default,
    description: (
      <>
        Au travers de ce site, nous souhaitons partager la culture DevOps grâce à plusieurs aspects. Commençant par de l'Infrastructure as Code jusqu'à une pipeline de CI/CD, nous souhaitons mettre en avant les avantages et la force de cette culture.
      </>
    ),
  },
];

function Feature({title, Image, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Image} alt={title} className={styles.featureSvg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
