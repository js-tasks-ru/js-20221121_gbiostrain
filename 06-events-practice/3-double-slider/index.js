export default class DoubleSlider {
  min;
  max;
  #from;
  #to;
  #elements = {};

  constructor({
    min = 0,
    max = 100,
    formatValue = value => value,
    selected = {}
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatter = formatValue;
    this.render();
    this.from = selected.from ?? this.min;
    this.to = selected.to ?? this.max;
  }

  get from() {
    return this.#from;
  }

  set from(value) {
    this.#from = value;

    if (value < this.min) {
      this.#from = this.min;
    }

    if (value > this.#to) {
      this.#from = this.#to;
    }

    const offset = 100 * (this.#from - this.min) / (this.max - this.min);
    this.#elements.from.innerHTML = this.formatter(this.#from);
    this.#elements.fromThumb.style.left = `${offset}%`;
    this.#elements.progress.style.left = `${offset}%`;
  }

  get to() {
    return this.#to;
  }

  set to(value) {
    this.#to = value;

    if (value < this.#from) {
      this.#to = this.#from;
    }

    if (value > this.max) {
      this.#to = this.max;
    }

    const offset = 100 * (this.#to - this.min) / (this.max - this.min);
    this.#elements.to.innerHTML = this.formatter(this.#to);
    this.#elements.toThumb.style.left = `${offset}%`;
    this.#elements.progress.style.right = `${100 - offset}%`;
  }

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    document.body.append(this.element);
    this.#elements = this.getSubElements();

    this.#elements.fromThumb.addEventListener('pointerdown', this.onPointnerDown);
    this.#elements.toThumb.addEventListener('pointerdown', this.onPointnerDown);
  }

  getSubElements() {
    return [...this.element.querySelectorAll('[data-element]')]
      .reduce((elements, element) => {
        elements[element.dataset.element] = element;
        return elements;
      }, {});
  }

  onPointnerDown = (event) => {
    event.preventDefault();
    this.currentThumb = event.target;
    this.element.classList.add("range-slider_dragging");

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  }

  onPointerMove = (event) => {
    event.preventDefault();
    const { left, width } = this.#elements.slider.getBoundingClientRect();
    const current = this.min + (this.max - this.min) * (event.clientX - left) / width;

    if (this.currentThumb === this.#elements.fromThumb) {
      this.from = Math.floor(current);
    }

    if (this.currentThumb === this.#elements.toThumb) {
      this.to = Math.floor(current);
    }
  }

  onPointerUp = (event) => {
    event.preventDefault();
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: {
        from: this.from,
        to: this.to,
      },
      bubbles: true,
    }));
  }

  get template() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatter(this.#from)}</span>
        <div data-element="slider" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="fromThumb" class="range-slider__thumb-left"></span>
          <span data-element="toThumb" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatter(this.#to)}</span>
      </div>`;
  }

  remove() {
    this.#elements.fromThumb.removeEventListener('pointerdown', this.onPointnerDown);
    this.#elements.toThumb.removeEventListener('pointerdown', this.onPointnerDown);
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
