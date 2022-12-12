class Tooltip {
  static #instance;
  #element;

  constructor() {
    if (!Tooltip.#instance) {
      Tooltip.#instance = this;
    }

    return Tooltip.#instance;
  }

  initialize() {
    document.addEventListener("pointerover", this.onPointerOver);
  }

  get element() {
    if (!this.#element) {
      this.#element = document.createElement('div');
      this.#element.className = 'tooltip';
    }

    return this.#element;
  }

  render(text = '') {
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  onPointerOver = (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (!target) return;

    this.render(target.dataset.tooltip);

    target.addEventListener("pointerout", this.onPointerOut, { once: true });
    document.addEventListener("pointermove", this.onPointerMove);
  }

  onPointerMove = (event) => {
    this.element.style.top = `${event.pageY + 5}px`;
    this.element.style.left = `${event.pageX + 5}px`;
  }

  onPointerOut = () => {
    this.remove();
  }

  remove() {
    document.removeEventListener("pointermove", this.onPointerMove);
    this.#element.remove();
  }

  destroy() {
    document.removeEventListener("pointerover", this.onPointerOver);
    this.remove();
  }
}

export default Tooltip;
