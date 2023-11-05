import { v4 } from 'uuid';
export class SocketHandler {
  #websocket;
  #addToast;
  #wsUrl;
  #setSocketConnected = () => {};
  #isConnected = false;
  callbacks = {};
  get socket() {
    return this.#websocket;
  }

  set isConnected(val) {
    this.#setSocketConnected(val);
    this.#isConnected = val;
  }

  get isConnected() {
    return this.#isConnected;
  }

  connect() {
    this.#websocket = new WebSocket(`${this.#wsUrl}`);
    this.connected = new Promise((res, rej) => {
      this.#websocket.onopen = () => {
        this.#addToast(`Successfully Connected to ${this.#wsUrl}`, {
          appearance: 'info',
        });
        res();
        this.isConnected = true;
      };
      this.#websocket.onerror = rej;
      setTimeout(rej, 2000);
    });
      
    this.#websocket.onclose = () => {
      this.#addToast(`Disconnected from ${this.#wsUrl}`, {
        appearance: 'warning',
      });
      this.isConnected = false;

      console.log('Disconnected'); // eslint-disable-line
    };
  
    this.#websocket.onmessage = ({ data }) => {
      try {
        const deserialized = JSON.parse(data);
        if (typeof this.callbacks[deserialized.Type] === 'function') {
          this.callbacks[deserialized.Type](deserialized.Payload);
        } else {
          console.warn('No hookup', data);
        }
      } catch (e) { 
        console.warn('Error receiving ws message', e, data);
      }
      
    };
  }
  close() {
    this.#websocket.close();
  }
  constructor(url, addToast, setSocketConnected) {
    this.#addToast = addToast;
    this.#wsUrl = `${url}/maps`;
    this.#setSocketConnected = setSocketConnected;
  }
  on(message, callback) {
    this.callbacks[message] = callback;
  }
  once(message, callback) {
    this.callbacks[message] = async (...args) => {
      await callback(...args);
      delete this.callbacks[message];
    };
  }
  emit(message, payload, callback) {
    let callbackId;
    if (typeof callback === 'function') {
      const id = v4();
      this.once(id, callback);
      callbackId = id;
    }
    this.#websocket.send(JSON.stringify({ type: message, payload, callbackId }));
  }
}
  