import { useRouter } from 'next/router';
export default {
  project: {
    link: 'https://github.com/tomaisthorpe/tedengine',
  },
  logo: <strong>TED</strong>,
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – TED Engine',
      };
    }
  },
};
