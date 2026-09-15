import React, { useEffect, useRef, useState } from 'react';
import { FINISHES } from '../lib/store.js';
import { lockScroll } from '../lib/motion.js';
import { Arrow, Check, Close } from './Icons.jsx';

const LINES = [
  ['POCKEY 01 · Scanner', '×1'],
  ['Woven carry sleeve', 'Included'],
  ['Shipping', 'Free · 2 days'],
];

export function BuyModal({ open, onClose, price, cents, finishId }) {
  const [state, setState] = useState('cart'); // cart | processing | done
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  const finish = FINISHES[finishId] || FINISHES.obsidian;

  useEffect(() => {
    if (!open) return;
    setState('cart');
    lockScroll(true);
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [open, onClose]);

  return (
    <div className={`modal${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Buy POCKEY" aria-hidden={!open}>
      <button type="button" className="modal__scrim" onClick={onClose} tabIndex={open ? 0 : -1} aria-label="Close" />
      <div className={`modal__card${state === 'done' ? ' is-done' : ''}`} ref={cardRef}>
        <button type="button" className="modal__close" onClick={onClose} ref={closeRef} tabIndex={open ? 0 : -1} aria-label="Close">
          <Close />
        </button>

        {state === 'cart' || state === 'processing' ? (
          <>
            <div className="modal__head">
              <span className="modal__thumb" style={{ '--sw': finish.swatch }} aria-hidden="true">
                <i />
                <b />
              </span>
              <div>
                <div className="modal__title">POCKEY 01</div>
                <div className="modal__sub">{finish.name}</div>
              </div>
            </div>

            <div className="modal__rows">
              {LINES.map(([k, v]) => (
                <div className="modal__row" key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
              <div className="modal__row">
                <span>Est. tax</span>
                <b>At checkout</b>
              </div>
            </div>

            <div className="modal__total">
              <span>Total</span>
              <b>
                {price}
                {cents}
              </b>
            </div>

            <button
              type="button"
              className={`btn btn--primary${state === 'processing' ? ' is-busy' : ''}`}
              disabled={state === 'processing'}
              onClick={() => {
                setState('processing');
                setTimeout(() => setState('done'), 1150);
              }}
            >
              <span>{state === 'processing' ? 'Securing order…' : `Complete purchase · ${price}${cents}`}</span>
              {state === 'processing' ? <i className="spinner" aria-hidden="true" /> : <Arrow />}
            </button>
            <p className="modal__foot">Demo checkout — no payment is taken.</p>
          </>
        ) : (
          <div className="modal__done">
            <span className="modal__check" aria-hidden="true">
              <Check />
            </span>
            <h4>Order confirmed</h4>
            <p>
              POCKEY 01 · {finish.name} — {price}
              {cents}
              <br />
              A confirmation would land in your inbox. It ships in 48 hours.
            </p>
            <button type="button" className="btn btn--ghost" onClick={onClose} style={{ marginTop: 22 }}>
              <span>Back to site</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyModal;
