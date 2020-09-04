// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, cache, entry, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject.parcelRequire === 'function' &&
    globalObject.parcelRequire;
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  globalObject.parcelRequire = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"a09e5b28e4e9917c9b185eae1ae76c95":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrialForm = exports.TrialValidation = exports.DefaultTrial = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _formik = require("formik");

var _core = require("@material-ui/core");

var _validator = require("./validator");

var _validatedTextField = require("./validated-text-field");

var _condition = require("./condition");

require("./style.sass");

var _sumBy = _interopRequireDefault(require("lodash/sumBy"));

var _jsxFileName = "D:\\Synced\\Other\\balanced-randomizer\\components\\src\\trial-form.tsx";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Array.prototype.sumBy = function (by) {
  return (0, _sumBy.default)(this, by);
};

const samplingTypes = ["balanced", "random"];
const DefaultFormProps = {
  target: "/",
  method: "POST"
};
const DefaultTrial = {
  label: "",
  sampling: "random",
  conditions: [{
    label: "Condition A",
    key: "default-A",
    target: "",
    weight: 0.5,
    locked: false
  }, {
    label: "Condition B",
    key: "default-B",
    target: "",
    weight: 0.5,
    locked: false
  }]
};
exports.DefaultTrial = DefaultTrial;
const TrialValidation = {};
exports.TrialValidation = TrialValidation;

class TrialForm extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "componentDidMount", () => {
      // try get parent with #trial-form tag
      const parent = this.ref.current?.closest("#trial-form");
      const {
        trialJson,
        ...form
      } = parent?.dataset;
      const trial = trialJson ? JSON.parse(trialJson) : undefined;
      const edit = !!trial;
      console.log({
        trial,
        form,
        edit
      });
      this.setState({
        form: form ?? DefaultFormProps,
        trial: trial ?? DefaultTrial,
        edit
      });
    });

    _defineProperty(this, "onAddCondition", (trial, setValues) => {
      const movable = trial.conditions.filter(c => !c.locked);
      const movableWeight = movable.sumBy(c => c.weight);
      const weight = movableWeight / (movable.length + 1);
      const condition = {
        label: "",
        key: `new-${TrialForm.conditionKey++}`,
        target: "",
        weight,
        locked: false
      };
      TrialForm.updateConditionWeights(-weight, trial.conditions);
      trial.conditions.push(condition);
      setValues(trial);
    });

    this.state = {
      form: DefaultFormProps,
      trial: DefaultTrial,
      edit: false
    };
    this.ref = /*#__PURE__*/_react.default.createRef();
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_formik.Formik // todo: check if componentDidMount allows us to change
    // initial values, or if that is too late
    , {
      initialValues: this.state.trial,
      onSubmit: console.log,
      validationSchema: _validator.TrialValidator,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 174,
        columnNumber: 13
      }
    }, ({
      values,
      setValues
    }) => {
      return /*#__PURE__*/_react.default.createElement("form", _extends({
        ref: this.ref
      }, this.state.form, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 183,
          columnNumber: 25
        }
      }), /*#__PURE__*/_react.default.createElement(_validatedTextField.ValidatedInput, {
        Child: _core.TextField,
        variant: "outlined",
        name: "label",
        label: "Label",
        fullWidth: true,
        margin: "dense",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 184,
          columnNumber: 29
        }
      }), /*#__PURE__*/_react.default.createElement(_validatedTextField.ValidatedInput, {
        Child: _core.TextField,
        name: "sampling",
        variant: "outlined",
        select: true,
        fullWidth: true,
        margin: "dense",
        label: "Sampling",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 192,
          columnNumber: 29
        }
      }, samplingTypes.map(type => /*#__PURE__*/_react.default.createElement(_core.MenuItem, {
        key: type,
        value: type,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 202,
          columnNumber: 37
        }
      }, type))), values.conditions.map((condition, index) => {
        return /*#__PURE__*/_react.default.createElement(_condition.Condition // todo; give conditions a key again
        , {
          key: condition.key,
          index: index,
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 209,
            columnNumber: 37
          }
        });
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "button-bar",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 216,
          columnNumber: 29
        }
      }, /*#__PURE__*/_react.default.createElement(_core.Button, {
        onClick: () => this.onAddCondition(values, setValues),
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 217,
          columnNumber: 33
        }
      }, /*#__PURE__*/_react.default.createElement(_core.Icon, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 222,
          columnNumber: 37
        }
      }, "add"), "add condition"), /*#__PURE__*/_react.default.createElement(_core.Button, {
        variant: "contained",
        type: "submit",
        color: "primary",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 225,
          columnNumber: 33
        }
      }, this.state.edit ? "Update" : "Create")));
    });
  }

}

exports.TrialForm = TrialForm;

_defineProperty(TrialForm, "conditionKey", 1);

_defineProperty(TrialForm, "onRemoveCondition", (index, trial, setValues) => {});

_defineProperty(TrialForm, "onConditionWeightChanged", (weight, trial, setValues, ignore) => {
  const conditions = trial.conditions.filter((_, i) => i !== ignore);
  TrialForm.updateConditionWeights(weight, conditions); // we've been editing the _original_ condition objects (value types)
  // is that wise? -- apparently it's fine?

  setValues(trial);
});

_defineProperty(TrialForm, "updateConditionWeights", (weight, conditions) => {
  const movableConditions = conditions.filter(c => !c.locked);
  const movableCount = movableConditions.length;
  const movableWeight = (0, _sumBy.default)(movableConditions, c => c.weight); // adding, spread over conditions evenly

  if (weight > 0) {
    const moving = weight / movableCount;
    movableConditions.forEach(c => c.weight += moving);
  } // removing, take away proportionally


  if (weight < 0) {
    // take from movable first
    let moving = Math.min(movableWeight, weight) / movableWeight;
    movableConditions.forEach(c => c.weight += c.weight * moving); // take from immovable to cover the remainder

    if (weight > movableWeight) {
      const immovableConditions = conditions.filter(c => c.locked);
      const immovableWeight = (0, _sumBy.default)(immovableConditions, c => c.weight);
      moving = (weight - movableWeight) / immovableWeight;
      immovableConditions.forEach(c => c.weight += c.weight * moving);
    }
  }
});

const trialForm = /*#__PURE__*/_react.default.createElement(TrialForm, {
  __self: void 0,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 241,
    columnNumber: 19
  }
});

_reactDom.default.render(trialForm, document.getElementById("trial-form"));
},{"./validator":"539f644536af8dba35bb9257b3c2685c","./validated-text-field":"83cbb13c2c3d13db9e456ff568bb3cf4","./condition":"287e9ae7ec5803a1440017e488ff8eb1","./style.sass":"33dfc7b75258bd80ad958101ad97b425"}],"539f644536af8dba35bb9257b3c2685c":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrialValidator = exports.ConditionValidator = exports.WeightValidator = exports.SamplingTypeValidator = exports.URLValidator = exports.LabelValidator = void 0;

var _yup = require("yup");

const LabelValidator = (0, _yup.string)().label("Label").ensure().required();
exports.LabelValidator = LabelValidator;
const URLValidator = (0, _yup.string)().label("Target").ensure().required().url();
exports.URLValidator = URLValidator;
const SamplingTypeValidator = (0, _yup.string)().label("Sampling type").ensure().required().matches(/(random|balanced)/);
exports.SamplingTypeValidator = SamplingTypeValidator;
const WeightValidator = (0, _yup.number)().label("Weight").defined().moreThan(0).lessThan(1);
exports.WeightValidator = WeightValidator;
const ConditionValidator = (0, _yup.object)({
  label: LabelValidator,
  target: URLValidator,
  weight: WeightValidator
}).defined();
exports.ConditionValidator = ConditionValidator;
const TrialValidator = (0, _yup.object)({
  label: LabelValidator,
  sampling: SamplingTypeValidator,
  conditions: (0, _yup.array)(ConditionValidator).defined().min(2)
}).defined();
exports.TrialValidator = TrialValidator;
},{}],"83cbb13c2c3d13db9e456ff568bb3cf4":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidatedInput = void 0;

var _react = _interopRequireDefault(require("react"));

var _formik = require("formik");

var _jsxFileName = "D:\\Synced\\Other\\balanced-randomizer\\components\\src\\validated-text-field.tsx";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ValidatedInput extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "render", () => {
      return /*#__PURE__*/_react.default.createElement(_formik.Field, {
        name: this.props.name,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 12,
          columnNumber: 13
        }
      }, ({
        field,
        meta
      }) => {
        const showError = meta.touched && !!meta.error;
        const {
          Child,
          ...props
        } = this.props;
        return /*#__PURE__*/_react.default.createElement(Child, _extends({}, props, field, {
          error: showError,
          helperText: showError ? meta.error : null,
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 23,
            columnNumber: 25
          }
        }));
      });
    });
  }

}

exports.ValidatedInput = ValidatedInput;
},{}],"287e9ae7ec5803a1440017e488ff8eb1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Condition = void 0;

var _react = _interopRequireDefault(require("react"));

var _trialForm = require("./trial-form");

var _core = require("@material-ui/core");

var _validatedTextField = require("./validated-text-field");

var _formik = require("formik");

var _jsxFileName = "D:\\Synced\\Other\\balanced-randomizer\\components\\src\\condition.tsx";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Condition extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "render", () => {
      const {
        index
      } = this.props;
      return /*#__PURE__*/_react.default.createElement(_core.Paper, {
        className: "condition",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 15,
          columnNumber: 13
        }
      }, /*#__PURE__*/_react.default.createElement(_validatedTextField.ValidatedInput, {
        Child: _core.TextField,
        variant: "outlined",
        name: `conditions[${index}].label`,
        label: "Label",
        fullWidth: true,
        margin: "dense",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 16,
          columnNumber: 17
        }
      }), /*#__PURE__*/_react.default.createElement(_validatedTextField.ValidatedInput, {
        Child: _core.TextField,
        variant: "outlined",
        name: `conditions[${index}].target`,
        label: "Target",
        fullWidth: true,
        margin: "dense",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 24,
          columnNumber: 17
        }
      }), /*#__PURE__*/_react.default.createElement(_formik.Field, {
        name: `conditions[${index}].weight`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 32,
          columnNumber: 17
        }
      }, ({
        field,
        meta,
        form
      }) => {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_core.Slider, {
          name: field.name,
          value: field.value,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (_, value) => {
            _trialForm.TrialForm.onConditionWeightChanged(field.value - value, form.values, form.setValues, index);

            form.setFieldValue(field.name, value);
            form.setFieldTouched(field.name);
          },
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 44,
            columnNumber: 33
          }
        }), !!meta.error && meta.touched && /*#__PURE__*/_react.default.createElement(_core.FormHelperText, {
          error: true,
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 62,
            columnNumber: 37
          }
        }, meta.error));
      }), /*#__PURE__*/_react.default.createElement(_formik.Field, {
        name: `conditions[${index}].locked`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 70,
          columnNumber: 17
        }
      }, ({
        field
      }) => {
        console.log({
          field
        });
      }));
    });
  }

}

exports.Condition = Condition;
},{"./validated-text-field":"83cbb13c2c3d13db9e456ff568bb3cf4","./trial-form":"a09e5b28e4e9917c9b185eae1ae76c95"}],"33dfc7b75258bd80ad958101ad97b425":[function() {},{}]},{},["a09e5b28e4e9917c9b185eae1ae76c95"], null)

