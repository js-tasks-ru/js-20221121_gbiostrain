export default class NotificationMessage {
  static #currentElement = null;
  static #timer = null;

  constructor(description, {
    duration = 2000,
    type = 'success',
  } = {}) {
    this.description = description;
    this.duration = duration;
    this.type = type;

    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
  };

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.description}
          </div>
        </div>
      </div>`;
  }

  show(parent = document.body) {
    if (NotificationMessage.#currentElement) {
      this.remove();
    }

    NotificationMessage.#currentElement = this.element;
    parent.append(NotificationMessage.#currentElement);

    this.element.addEventListener('animationend', () => this.remove(), { once: true });
    NotificationMessage.#timer = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    if (NotificationMessage.#currentElement) {
      NotificationMessage.#currentElement.remove();
    }
    this.element.remove();
    clearTimeout(NotificationMessage.#timer);
  }

  destroy() {
    this.remove();
  }
}
