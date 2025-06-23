export default function P() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://beltegoed.nl/bol-com-cadeaukaart',
      permanent: false,
    },
  };
}
