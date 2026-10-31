@use '@/styles/mixins' as m;

.form {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.8125rem;
  margin-top: 0.8125rem;
}

.pair {
  display: grid;
  gap: 0.8125rem 1rem;

  @include m.up('md') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.consents {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label {
    color: var(--sh-color-muted);
    font-size: var(--sh-font-size-xs);

    // Links read as part of the sentence, as in the design.
    a {
      color: inherit;
      text-decoration: underline;
    }

    a:hover {
      color: var(--sh-color-ink);
    }
  }
}

.consent {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.error {
  margin: 0;
  color: var(--sh-color-danger);
  font-size: var(--sh-font-size-xs);
}

.submit {
  align-self: flex-start;
}
