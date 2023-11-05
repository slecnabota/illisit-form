import IllisitLib from "illisit/Lib";
import merge from "lodash/merge";
import get from "lodash/get";
import IMask from "imask";
import { ref, computed, provide, inject, onMounted } from "vue";
import * as validations from "./validations";
import store from "./store";

export default class IllisitForm extends IllisitLib {
  constructor(config) {
    super();
    this.config = config;
  }
  formName = "";
  rules = {};
  masks = {};
  toUse = "hello2";
  generateRandomId() {
    return Math.random().toString(36).substring(2, 15);
  }
  init(values) {
    // store
    this.formName = this.generateRandomId();
    store.commit("setValues", { formName: this.formName, values });
  }
  setRules(rules) {
    this.rules = { ...rules };
  }
  getStore() {
    // store
    return store.state;
  }
  get(name) {
    // store
    const formValues = this.getStore().formValues[this.formName];
    if (name === null) {
      return formValues;
    } else {
      return formValues[name];
    }
  }
  set(name, value) {
    // store
    this.getStore().formValues[this.formName][name] = value;
  }
  setMasks(masks) {
    this.masks = { ...masks };
  }

  getMask(name) {
    return this.masks[name] || null;
  }
  applyMask(name, value) {
    const mask = this.getMask(name);
    if (mask) {
      const maskInstance = IMask.createMask({ mask });
      const resolvedValue = maskInstance.resolve(value);
      if (typeof resolvedValue === "string") {
        return resolvedValue;
      } else {
        console.error(`Mask resolution for '${name}' did not return a string.`);
        return "";
      }
    }
    return value;
  }
  input(name) {
    return this.config.input(name, this);
  }
  validate() {
    let result = true;
    // store
    this.getStore().formErrors[this.formName] = {};
    // store
    const formValues = this.getStore().formValues[this.formName];
    for (const name in formValues) {
      const rules = this.rules[name];
      if (rules && rules.length) {
        for (const rule of rules) {
          const ruleSplit = rule.split(":");
          const ruleName = ruleSplit[0];
          const ruleParam = ruleSplit[1];
          const validation = this.config.validations[ruleName];
          if (validation) {
            if (!validation(formValues, name, ruleParam)) {
              result = false;
              // store
              if (!this.getStore().formErrors[this.formName][name]) {
                this.getStore().formErrors[this.formName][name] = [];
              }
              const message = this.config.messages[ruleName] || "Error";
              // store
              this.getStore().formErrors[this.formName][name].push(message);
            }
          } else {
            console.error(`Validation with name '${ruleName}' was not found`);
          }
        }
      }
      let resultMask = true;
      if (this.masks[name]) {
        if (
          !validations.maskFilled(
            this.applyMask(name, this.get(name)),
            name,
            this.getMask(name)
          )
        ) {
          resultMask = false;
          // store
          if (!this.getStore().formErrors[this.formName][name]) {
            this.getStore().formErrors[this.formName][name] = [];
          }
          const message = this.config.messages.mask || "Error";
          this.getStore().formErrors[this.formName][name].push(message);
        }
      }
    }
    return result;
  }
}


