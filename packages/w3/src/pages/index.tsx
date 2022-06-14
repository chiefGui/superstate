import Div100vh from 'react-div-100vh'
import { NextSeo } from 'next-seo'
import { scroller } from 'react-scroll'

import { superstate } from '@superstate/core'
import { useSuperState } from '@superstate/react'

import { Button } from '../features/button'
import { Feature } from '../features/feature'
import { IRiddle } from '../features/riddle'
import { Layout } from '../features/layout'
import { Motivation } from '../docs/motivation'
import { QuickStart } from '../docs/quick-start'

const riddle: IRiddle = {
  title:
    "I am a mother's child and a father's child but nobody's son. What am I?",

  options: [
    { title: 'A grandson' },
    { title: 'A daughter', correct: true },
    { title: 'A father' },
    { title: 'An uncle' },
  ],
}

const answer = superstate<number | undefined>(undefined)

export default function HomePage() {
  useSuperState(answer)

  function handleOptionSelect(index: number) {
    answer.set(index)
  }

  return (
    <div>
      <Div100vh className='flex flex-col gap-40 py-20'>
        <NextSeo title='superstate' />

        <Layout className='flex flex-col gap-20'>
          <section className='w-3/4'>
            <h1 className='text-4xl font-extrabold xl:text-7xl 2xl:text-8xl'>
              State management for your Browser apps.
            </h1>
          </section>

          <section className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
            <Button
              onClick={() =>
                scroller.scrollTo('#quick-start', {
                  duration: 200,
                  delay: 0,
                  smooth: 'easeInOutQuart',
                  offset: -50,
                })
              }>
              Quick start
            </Button>
            <Button>Examples</Button>

            <Button>Documentation</Button>
          </section>

          <section className='flex-1'>
            <div className='grid flex-1 grid-cols-1 gap-20 md:grid-cols-2 lg:grid-cols-3'>
              <Feature title='Simple and elegant' icon='fa-star'>
                A comprehensive API, friendly to beginners and charming to
                veterans designed with ergonomics and developer experience in
                mind.
              </Feature>

              <Feature title='Built-in Drafts' icon='fa-copy'>
                Because of drafts, the UX of your app will shine brighter:
                empower users with confirmations before they actually publish
                their changes&mdash;with no additional effort.
              </Feature>

              <Feature title='Communicative' icon='fa-satellite-dish'>
                superstate broadcasts any changes you make to your state,
                allowing you to reliably react to them and make your UI dance.
                That in a very performant, non-invasive way.
              </Feature>

              <Feature title='Universal' icon='fa-globe'>
                superstate works in pure JavaScript apps, in Node apps and in
                React apps. Or in all of them at the same time, out of the
                box&mdash;SSR included.
              </Feature>

              <Feature title='Extensible' icon='fa-puzzle'>
                Are your needs are growing? It's fine&mdash;superstate grows
                with them. Easily attach new mechanics to your states, to relief
                the pain of repeating code.
              </Feature>

              <Feature title='Reliable' icon='fa-compass'>
                superstate is entirely written in TypeScript and very well
                documented and tested. Enjoy the joy of autocomplete and inline,
                descriptive functions.
              </Feature>
            </div>
          </section>
        </Layout>

        <div>
          <QuickStart />
        </div>

        <div>
          <Motivation />
        </div>
      </Div100vh>
    </div>
  )
}
