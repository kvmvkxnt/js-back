const findElement = (selector, node = document) => node.querySelector(selector);
const findElements = (selector, node = document) => node.querySelectorAll(selector);