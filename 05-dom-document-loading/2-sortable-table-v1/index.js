export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.subElements.header = this.element.querySelector('[data-element="header"]');
    this.subElements.body = this.element.querySelector('[data-element="body"]');
  }

  sort(fieldValue = 'title', orderValue = 'asc') {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[orderValue];
    const header = this.headerConfig.find(header => header.id === fieldValue);

    for (const node of this.subElements.header.children) {
      if (node.getAttribute('data-id') === fieldValue) {
        node.setAttribute('data-order', orderValue);
      } else {
        node.removeAttribute("data-order");
      }
    }

    this.subElements.body.innerHTML = this.getBody(
      [...this.data].sort((a, b) =>
        direction * this.compare(a[fieldValue], b[fieldValue], header.sortType)
      )
    );
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
            ${this.getBody(this.data)}
          </div>
        </div>
      </div>`;
  }

  get header() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig?.map(this.getHeaderElement).join('')}
      </div>`;
  }

  getHeaderElement({
    id = '',
    title = '',
    sortable = false,
  } = {}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
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
      ${this.headerConfig.map(
      item => item.template
        ? item.template(element[item.id])
        : `<div class="sortable-table__cell">${element[item.id]}</div>`
    ).join('')}
    </a>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
