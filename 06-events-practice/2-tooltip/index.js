class Tooltip {
  static #instance;
  #element;
  #offsetX = 5;
  #offsetY = 5;

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
    this.element.style.top = `${event.pageY + this.#offsetX}px`;
    this.element.style.left = `${event.pageX + this.#offsetY}px`;
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
