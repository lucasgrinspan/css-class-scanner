/**
 * A small utility class that creates a store and lets you subscribe to data changes
 * to the store. This lets me remove "storage" from the extension permissions. This
 * probably wasn't necessary but it was fun
 */
export default class Store {
  internalStore;
  subscribers = {};

  constructor(data) {
    this.internalStore = data || {};
  }

  set(key, value, options = {}) {
    const callbacks = this.subscribers[key];
    const oldValue = this.internalStore[key];

    if (value === oldValue) {
      // no change
      return;
    }

    this.internalStore[key] = value;

    callbacks?.forEach((callback) => {
      callback(value, oldValue);
    });

    if (options.broadcast) {
      console.log("store: broadcasting new data:", key);
      // send a message containing the data
      chrome.runtime.sendMessage({
        updatedKey: key,
        [key]: value,
      });
    }
  }

  get(key) {
    return this.internalStore[key];
  }

  subscribe(key, callback) {
    const currentSubscribers = this.subscribers[key];
    let newSubscribers;

    if (currentSubscribers) {
      newSubscribers = [...currentSubscribers, callback];
    } else {
      newSubscribers = [callback];
    }

    this.subscribers[key] = newSubscribers;
  }
}
