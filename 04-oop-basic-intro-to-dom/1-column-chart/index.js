export default class ColumnChart {
  chartHeight = 50;

  #params = {};
  element = null;
  dataNode = null;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = (value) => value,
  } = {}) {
    this.#params = {
      data,
      label,
      value,
      link,
      formatHeading,
    };

    this.render();
  };

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
            ${this.columns}
          </div>
        </div>
      </div>`;
  }

  get header() {
    return `
      <div data-element="header" class="column-chart__header">
        ${this.#params.formatHeading(this.#params.value)}
      </div>`;
  }

  get title() {
    return `
      <div class="column-chart__title">
        Total ${this.#params.label}
        <a class="column-chart__link" href="${this.#params.link}">View all</a>
      </div>`;
  }

  get columns() {
    const maxValue = Math.max(...this.#params.data);
    const scale = this.chartHeight / maxValue;
    return this.#params.data.map(item =>
      `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`
    ).join('');
  }

  get isDataEmpty() {
    return !this.#params.data.length;
  }

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.dataNode = this.element.querySelector('[data-element="body"]');
    this.toggleEmptyState();
  }

  update(data = []) {
    this.#params.data = data;
    this.dataNode.innerHTML = this.columns;
    this.toggleEmptyState();
  }

  toggleEmptyState() {
    this.element.classList[this.isDataEmpty ? 'add' : 'remove']('column-chart_loading');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
