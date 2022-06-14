import { Layout } from '../../features/layout'

export function Motivation() {
  return (
    <div id='#motivation'>
      <Layout className='flex flex-col gap-10'>
        <h2>Motivation</h2>

        <p>
          I've always felt there was a gap in state management libraries.
          Sometimes they were too overkill; sometimes they were too simplistic.
          Sometimes they required too much effort to achieve something simple,
          sometimes we couldn't achieve something at all.
        </p>

        <p>
          <strong>superstate</strong> however aims to be simple if you don't
          need much, but flexible enough to grow with your needs&mdash;and even
          so, it was designed to be as simple and elegant as possible that
          beginners would enjoy and veterans wouldn't feel weird about it.
        </p>

        <p>
          I'd say give it a go. It's very likely that you'll enjoy the
          experience.
        </p>
      </Layout>
    </div>
  )
}
