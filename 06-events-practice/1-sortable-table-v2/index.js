export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: 'title',
      order: 'asc',
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.isSortLocally = true;
    this.sortId = sorted.id;
    this.sortOrder = sorted.order;

    this.render();
  }

  get sortId() {
    return this._sortId;
  }

  set sortId(id) {
    if (!this.headersConfig.some((item) => item.id === id)) {
      throw new TypeError(`Unknown header id: ${id}`);
    }
    this._sortId = id;
  }

  get sortOrder() {
    return this._sortOrder;
  }

  set sortOrder(order) {
    if (!['asc', 'desc'].includes(order)) {
      throw new TypeError(`Unknown sort order: ${order}`);
    }

    this._sortOrder = order;
  }

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  getSubElements() {
    return Array.from(this.element.querySelectorAll('[data-element]'))
      .reduce((subElemenst, element) => {
        subElemenst[element.dataset.element] = element;
        return subElemenst;
      }, {});
  }

  onHeaderClick = (event) => {
    const header = event.target.closest('[data-sortable="true"]');
    if (!header) return;

    const { id, order } = header.dataset;

    this.sort(id, this.reverseOrder(order));
  }

  reverseOrder(order) {
    if (order === 'desc') {
      return 'asc';
    }

    return 'desc';
  }

  sort(id = 'title', order = 'asc') {
    this.sortId = id;
    this.sortOrder = order;

    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  get sortedData() {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[this.sortOrder];
    const header = this.headersConfig.find(header => header.id === this.sortId);

    return [...this.data].sort((a, b) =>
      direction * this.compare(a[this.sortId], b[this.sortId], header.sortType)
    )
  }

  sortOnServer() {
    return;
  }

  sortOnClient() {
    for (const node of this.subElements.header.children) {
      if (node.getAttribute('data-id') === this.sortId) {
        node.setAttribute('data-order', this.sortOrder);
      } else {
        node.removeAttribute("data-order");
      }
    }

    this.subElements.body.innerHTML = this.getBody(this.sortedData);
  }

  compare(a, b, sortType) {
    if (sortType === 'string') {
      return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
    }

    if (sortType === 'number') {
      return a - b;
    }
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.header}
          <div data-element="body" class="sortable-table__body">
            ${this.getBody(this.sortedData)}
          </div>
        </div>
      </div>`;
  }

  get header() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig?.map((item) => this.getHeaderElement(item)).join('')}
      </div>`;
  }

  getHeaderElement({
    id = '',
    title = '',
    sortable = false,
  } = {}) {
    return `
      <div
        class="sortable-table__cell"
        data-id="${id}"
        data-sortable="${sortable}"
        data-order="${this.sortId === id ? this.sortOrder : ''}"
      >
        <span>${title}</span>
        ${sortable
        ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>'
        : ''}
      </div>`;
  }

  getBody(data) {
    return data?.map(item => this.getBodyElement(item)).join('');
  }

  getBodyElement({
    id = 0,
    ...element
  } = {}) {
    return `
    <a href="/products/${id}" class="sortable-table__row">
      ${this.headersConfig.map(
      item => item.template
        ? item.template(element[item.id])
        : `<div class="sortable-table__cell">${element[item.id]}</div>`
    ).join('')}
    </a>`;
  }

  remove() {
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
