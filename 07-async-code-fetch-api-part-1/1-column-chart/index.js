import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;

  #params = {};
  #data = [];
  #url;
  element = null;
  subElements = {};

  constructor({
    url,
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = (value) => value,
  } = {}) {
    this.#url = new URL(url, BACKEND_URL);
    this.#params = {
      label,
      link,
      formatHeading,
    };

    this.render();
    this.update(range.from, range.to);
  };

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.subElements = this.getSubElements();
    this.toggleEmptyState();
  }

  getSubElements() {
    return [...this.element.querySelectorAll('[data-element]')]
      .reduce((elements, element) => {
        elements[element.dataset.element] = element;
        return elements;
      }, {});
  }

  async update(from, to) {
    this.#url.searchParams.set('from', from);
    this.#url.searchParams.set('to', to);

    const data = await fetchJson(this.#url);
    this.updateData(Object.values(data));

    return data;
  }

  updateData(data = []) {
    this.#data = data;
    this.subElements.header.innerHTML = this.header;
    this.subElements.body.innerHTML = this.body;
    this.toggleEmptyState();
  }

  get value() {
    return this.#data.reduce((value, item) => value + item, 0);
  }

  get isDataEmpty() {
    return !this.#data.length;
  }

  toggleEmptyState() {
    this.element.classList[this.isDataEmpty ? 'add' : 'remove']('column-chart_loading');
  }

  get template() {
    return `
      <div
        class="column-chart column-chart_loading"
        style="--chart-height: ${this.chartHeight}"
      >
        ${this.title}
        <div class="column-chart__container">
          ${this.header}
          <div data-element="body" class="column-chart__chart">
            ${this.body}
          </div>
        </div>
      </div>`;
  }

  get header() {
    return `
      <div data-element="header" class="column-chart__header">
        ${this.#params.formatHeading(this.value)}
      </div>`;
  }

  get title() {
    return `
      <div class="column-chart__title">
        Total ${this.#params.label}
        <a class="column-chart__link" href="${this.#params.link}">View all</a>
      </div>`;
  }

  get body() {
    const maxValue = Math.max(...this.#data);
    const scale = this.chartHeight / maxValue;
    return this.#data.map(item =>
      `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`
    ).join('');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

