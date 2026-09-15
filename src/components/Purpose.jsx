import React, { useRef } from 'react';
import { useCardGlow } from '../hooks.js';
import { Pocket, Press, Smart } from './Icons.jsx';

const CARDS = [
  {
    key: 'easy',
    title: 'Easy to use',
    text: 'One button. Point it at anything, press once — it is captured, straightened and filed. No app to learn, no pairing ritual.',
    chips: ['1 button', 'Works offline'],
    Icon: Press,
  },
  {
    key: 'smart',
    title: 'Smart & practical',
    text: 'It finds the edges, flattens the page, reads the text and sends it to the place you will actually look for it.',
    chips: ['Auto-crop', '300 dpi'],
    Icon: Smart,
  },
  {
    key: 'everyday',
    title: 'Designed for everyday use',
    text: '11 mm thin and 84 g light, in a ceramic-and-titanium shell that lives with keys, coins and everything else in a pocket.',
    chips: ['84 g', 'IP54'],
    Icon: Pocket,
  },
];

function Card({ card, index }) {
  const { title, text, chips, Icon } = card;
  const ref = useRef(null);
  useCardGlow(ref);

  return (
    <article className="card" ref={ref} data-reveal="up" data-delay={(index * 0.09).toFixed(2)}>
      <span className="card__index">{String(index + 1).padStart(2, '0')} / 03</span>

      <div className="icon3d" aria-hidden="true">
        <div className="icon3d__stack">
          <span className="icon3d__plate icon3d__plate--shadow" />
          <span className="icon3d__plate" />
          <span className="icon3d__plate icon3d__plate--mid" />
          <span className="icon3d__plate icon3d__plate--top">
            <Icon />
          </span>
        </div>
      </div>

      <h3 className="h3 card__title">{title}</h3>
      <p className="card__text">{text}</p>

      <div className="card__spec">
        {chips.map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </div>
    </article>
  );
}

export function Purpose() {
  return (
    <section className="section purpose" id="product">
      <div className="rule" aria-hidden="true" />
      <div className="shell">
        <div className="purpose__head">
          <div className="section__head">
            <span className="eyebrow">What it is for</span>
            <h2 className="h2" data-reveal-lines>
              <span className="line-mask">
                <span>WHAT IS POCKEY</span>
              </span>
              <span className="line-mask">
                <span className="grad-text">FOR?</span>
              </span>
            </h2>
          </div>
          <p className="purpose__note" data-reveal="up" data-delay="0.1">
            A scanner that fits in a pocket. Paper, screens, receipts, whiteboards, small objects — POCKEY turns them
            into clean, searchable files in about two seconds.
          </p>
        </div>

        <div className="cards">
          {CARDS.map((c, i) => (
            <Card key={c.key} card={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Purpose;
