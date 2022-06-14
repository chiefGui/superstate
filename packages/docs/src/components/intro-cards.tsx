import React from 'react'

import styles from './intro-cards.module.css'

export function IntroCards() {
  return (
    <div className={styles.container}>
      <div
        className={styles.card}
        onClick={() =>
          (window.location.href = '/getting-started/installation')
        }>
        <div className={styles.intro}>
          <h4 className={styles.title}>Install</h4>
          <p className={styles.description}>
            It takes no more than 1 minute to get started with superstate.
          </p>
        </div>

        <p className={styles.cta}>Learn &rarr;</p>
      </div>

      <div
        className={styles.card}
        onClick={() => (window.location.href = '/getting-started/first-state')}>
        <div className={styles.intro}>
          <h4 className={styles.title}>Quick start</h4>
          <p className={styles.description}>
            Get your hands dirty and create your very first superstate.
          </p>
        </div>

        <p className={styles.cta}>Go &rarr;</p>
      </div>

      <div
        className={styles.card}
        onClick={() => (window.location.href = '/examples/todo')}>
        <div className={styles.intro}>
          <h4 className={styles.title}>Todo App</h4>
          <p className={styles.description}>
            See what a Todo App with superstate looks like. No more than 5
            minutes.
          </p>
        </div>

        <p className={styles.cta}>Learn &rarr;</p>
      </div>

      <div
        className={styles.card}
        onClick={() =>
          (window.location.href = '/api-reference/@superstate/core/superstate')
        }>
        <div className={styles.intro}>
          <h4 className={styles.title}>API Reference</h4>
          <p className={styles.description}>
            Explore all superstate has to offer in a comprehensive API
            reference.
          </p>
        </div>

        <p className={styles.cta}>See &rarr;</p>
      </div>
    </div>
  )
}
