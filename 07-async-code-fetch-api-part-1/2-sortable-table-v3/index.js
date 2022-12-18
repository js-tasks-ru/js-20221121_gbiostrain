import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  headersConfig;
  isSortLocally;
  #sortId;
  #sortOrder;
  #url;
  #currentPage = 1;
  #itemsPerPage = 30;
  #isLoading = false;

  constructor(headersConfig, {
    url,
    isSortLocally = false,
    sorted = {
      id: 'title',
      order: 'asc',
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.#url = new URL(url, BACKEND_URL);
    this.sortId = sorted.id;
    this.sortOrder = sorted.order;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  get sortId() {
    return this.#sortId;
  }

  set sortId(id) {
    if (!this.headersConfig.some((item) => item.id === id)) {
      throw new TypeError(`Unknown header id: ${id}`);
    }
    this.#sortId = id;
  }

  get sortOrder() {
    return this.#sortOrder;
  }

  set sortOrder(order) {
    if (!['asc', 'desc'].includes(order)) {
      throw new TypeError(`Unknown sort order: ${order}`);
    }

    this.#sortOrder = order;
  }

  get isLoading() {
    return this.#isLoading;
  }

  set isLoading(value) {
    this.#isLoading = value;

    this.subElements.loading.style.display = this.#isLoading ? 'block' : 'none';
  }

  async render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);

    if (this.isSortLocally) {
      this.sortOnClient(this.sortId, this.sortOrder);
    } else {
      await this.sortOnServer(this.sortId, this.sortOrder);
      window.addEventListener('scroll', this.onScroll);
    }
  }

  getSubElements() {
    return [...this.element.querySelectorAll('[data-element]')]
      .reduce((subElemenst, element) => {
        subElemenst[element.dataset.element] = element;
        return subElemenst;
      }, {});
  }

  onHeaderClick = (event) => {
    const header = event.target.closest('[data-sortable="true"]');
    if (!header) return;

    const { id, order } = header.dataset;
    this.sortId = id;
    this.sortOrder = this.reverseOrder(order);
    this[this.isSortLocally ? 'sortOnClient' : 'sortOnServer'](this.sortId, this.sortOrder);

    for (const node of this.subElements.header.children) {
      if (node.getAttribute('data-id') === this.sortId) {
        node.setAttribute('data-order', this.sortOrder);
      } else {
        node.removeAttribute("data-order");
      }
    }
  }

  onScroll = () => {
    if (!this.isLoading
      && window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      this.nextPage();
    }
  }

  reverseOrder(order) {
    if (order === 'desc') {
      return 'asc';
    }

    return 'desc';
  }

  sortOnClient(id, order) {
    this.sortId = id;
    this.sortOrder = order;

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[this.sortOrder];

    const header = this.headersConfig.find(header => header.id === this.sortId);
    this.data.sort((a, b) =>
      direction * this.compare(a[this.sortId], b[this.sortId], header.sortType)
    );

    this.updateBody();
  }

  compare(a, b, sortType) {
    if (sortType === 'string') {
      return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
    }

    if (sortType === 'number') {
      return a - b;
    }
  }

  async sortOnServer(id, order) {
    this.#currentPage = 1;
    this.sortId = id;
    this.sortOrder = order;
    this.isLoading = true;
    this.data = [];
    this.updateBody();

    this.#url.searchParams.set('_sort', id);
    this.#url.searchParams.set('_order', order);
    this.#url.searchParams.set('_start', 0);
    this.#url.searchParams.set('_end', this.#itemsPerPage);

    this.data = await this.loadData();
    this.updateBody();

    this.isLoading = false;
  }

  async nextPage() {
    this.isLoading = true;
    this.#url.searchParams.set('_start', this.#currentPage * this.#itemsPerPage);
    this.#currentPage += 1;
    this.#url.searchParams.set('_end', this.#currentPage * this.#itemsPerPage);

    const data = await this.loadData();
    this.data.push(...data);
    this.subElements.body.insertAdjacentHTML('beforeend', this.getBody(data));
    this.isLoading = false;
  }

  async loadData() {
    try {
      const data = await fetchJson(this.#url);
      return data;
    } catch (error) {
      throw new Error(`Load data error: ${error}`);
    }
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.header}
          <div data-element="body" class="sortable-table__body">
            ${this.getBody()}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
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

  updateBody() {
    this.subElements.body.innerHTML = this.getBody();
    this.subElements.emptyPlaceholder.style.display = this.data.length ? 'none' : 'block';
  }

  getBody(data = this.data) {
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
    if (!this.isSortLocally) {
      window.removeEventListener('scroll', this.onScroll);
    }
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
