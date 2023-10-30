import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/content/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/ui/Title'
import { Event } from 'lib/types'
import { PageTemplate, pageTemplate } from 'lib/pageTemplate'

type ThemeComponentProps = {
  theme: Theme,
  material: Material
  events: Event[],
  pageInfo?: PageTemplate,
}

const ThemeComponent: NextPage<ThemeComponentProps> = ({ theme, material, events, pageInfo }) => {
  return (
    <Layout material={material} theme={theme} pageInfo={pageInfo}>
      <Title text={theme.name} />
      <NavDiagram material={material} theme={theme} />
      <Content markdown={theme.markdown} theme={theme} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial();
  return {
    paths: material.themes.map((t) => ({ params: { themeId: `${t.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
  const events = await prisma.event.findMany({
    where: { hidden: false },
  }).catch((e) => {
    return []
  });
  let material = await getMaterial();
  const themeId= context?.params?.themeId;
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true };
  }
  const theme = material.themes.find(t => t.id === themeId);
  if (!theme) {
    return { notFound: true };
  }

  remove_markdown(material, theme)

  return { 
    props: makeSerializable({ material, theme, events, pageInfo }),
  }
}

export default ThemeComponent
