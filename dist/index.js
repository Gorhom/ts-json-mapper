System.register("types", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("constants", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Constants;
    return {
        setters: [],
        execute: function () {
            Constants = /** @class */ (function () {
                /**
                 * Class containing constants
                 */
                function Constants() {
                }
                /**
                 * Name of the field that will be injected to object prototype
                 * and contain list of correspondences required for mapping (meta-data)
                 * @type {string}
                 */
                Constants.CORRESPONDENCES_META_KEY = '__correspondences';
                return Constants;
            }());
            exports_2("Constants", Constants);
        }
    };
});
System.register("helpers", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Helpers;
    return {
        setters: [],
        execute: function () {
            Helpers = /** @class */ (function () {
                /**
                 * Class containing helper functions
                 */
                function Helpers() {
                }
                /**
                 * Check if passed value is an array
                 * @param value
                 * @returns {boolean}
                 */
                Helpers.isArray = function (value) {
                    return Array.isArray(value);
                };
                /**
                 * Check if passed value is an object
                 * @param value
                 * @returns {boolean}
                 */
                Helpers.isObject = function (value) {
                    return typeof value === 'function'
                        || typeof value === 'object' && !!value;
                };
                /**
                 * Check if passed value is a date
                 * @param value
                 * @returns {boolean}
                 */
                Helpers.isDate = function (value) {
                    return Object.prototype.toString.call(value) === '[object Date]';
                };
                /**
                 * Check if passed value is a date string (based on ISO 8601)
                 * @param {string} value
                 * @returns {boolean}
                 */
                Helpers.isDateString = function (value) {
                    return Helpers.DATE_STRING_REGEXP.test(value);
                };
                /**
                 * Regular expression used to check the string is a correct date string according to ISO 8601.
                 * Taken from https://stackoverflow.com/a/3143231/6794376
                 * We know, that using libraries like moment would be more reliable approach
                 * (for example, moment(value, moment.ISO_8601, true).isValid()).
                 * The reason we use regexp is to keep this package lightweight and free of dependencies.
                 * If your server doesn't send you things like 14th month, this check is enough
                 * @type {RegExp}
                 */
                Helpers.DATE_STRING_REGEXP = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
                return Helpers;
            }());
            exports_3("Helpers", Helpers);
        }
    };
});
System.register("model-property", ["constants", "helpers"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    /**
     * Decorator for model properties.
     * Should decorate properties in classes extended from 'BaseModel'.
     * Adds meta-field to object's prototype. That meta-field will contain
     * list of objects describing correspondences between fields in JSON and TS model.
     * 'BaseModel' constructor will use those correspondences for mapping
     * @param {string} jsonField - name of the field in JSON, that should be mapped to decorated property
     * @param type - class of decorated property (in case it belongs to composite type)
     * @returns {Function}
     */
    function ModelProperty(jsonField, type) {
        return function (target, propertyKey, index) {
            // getting name of meta-field
            var key = constants_1.Constants.CORRESPONDENCES_META_KEY;
            // forming the object that describes correspondence
            // between JSON and TS model fields
            var newCorrespondence = {
                modelField: propertyKey, jsonField: jsonField, type: type
            };
            // forming array of correspondences
            helpers_1.Helpers.isArray(target[key])
                ? target[key].push(newCorrespondence)
                : target[key] = [newCorrespondence];
        };
    }
    exports_4("ModelProperty", ModelProperty);
    var constants_1, helpers_1;
    return {
        setters: [
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (helpers_1_1) {
                helpers_1 = helpers_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("base-model", ["constants", "helpers"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var constants_2, helpers_2, BaseModel;
    return {
        setters: [
            function (constants_2_1) {
                constants_2 = constants_2_1;
            },
            function (helpers_2_1) {
                helpers_2 = helpers_2_1;
            }
        ],
        execute: function () {
            /**
             * Base model class.
             * Constructor of this takes in JSON object and maps its fields to inner properties.
             * Depending on options described with 'ModelProperty' decorator, those fields
             * may be renamed or cast to specified types during this process
             */
            BaseModel = /** @class */ (function () {
                /**
                 * Base model constructor. Performs mapping
                 * @param options
                 */
                function BaseModel(options) {
                    // correspondences are written to prototype under certain key by @ModelProperty decorators
                    var correspondences = this['__proto__'][constants_2.Constants.CORRESPONDENCES_META_KEY];
                    // actual mapping: deserialize JSON values, mapping them to model properties,
                    // relying on described correspondences
                    for (var _i = 0, correspondences_1 = correspondences; _i < correspondences_1.length; _i++) {
                        var correspondence = correspondences_1[_i];
                        // if 'jsonField' was not specified, property name stays the same
                        var dataField = correspondence.jsonField || correspondence.modelField;
                        this[correspondence.modelField] = this.deserializeValue(options[dataField], correspondence.type);
                    }
                }
                /**
                 * Deserialize value depending on its type
                 * @param value - value to deserialize
                 * @param targetClass - class to cast value to (if needed)
                 * @returns
                 */
                BaseModel.prototype.deserializeValue = function (value, targetClass) {
                    var _this = this;
                    // if value is an array, deserialize each of its items
                    if (helpers_2.Helpers.isArray(value)) {
                        return value.map(function (item) { return _this.deserializeValue(item, targetClass); });
                    }
                    // if value is JS object, pass it to constructor of corresponding class
                    if (helpers_2.Helpers.isObject(value)) {
                        var object = Object.create(targetClass.prototype);
                        object.constructor.call(object, value);
                        return object;
                    }
                    // if value is a correct date string, cast it to Date
                    if (helpers_2.Helpers.isDateString(value)) {
                        return new Date(value);
                    }
                    // primitives do not require processing
                    return value;
                };
                /**
                 * Serialize value depending on its type
                 * @param value - value to serialize
                 * @returns
                 */
                BaseModel.prototype.serializeValue = function (value) {
                    var _this = this;
                    // if value is an array, serialize each of its items
                    if (helpers_2.Helpers.isArray(value)) {
                        return value.map(function (item) { return _this.serializeValue(item); });
                    }
                    // if value is a date, convert it to ISO string
                    if (helpers_2.Helpers.isDate(value)) {
                        return value.toISOString();
                    }
                    // if value is an object, we call 'toJSON' method of it,
                    // suggesting that object was also extended from 'BaseModel'
                    if (!!value && helpers_2.Helpers.isObject(value)) {
                        return value.toJSON();
                    }
                    // primitives do not require processing
                    return value;
                };
                /**
                 * Map properties to initial state (back to JSON)
                 * @returns
                 */
                BaseModel.prototype.toJSON = function () {
                    // retrieving the same correspondences that were used for initial mapping
                    var correspondences = this['__proto__'][constants_2.Constants.CORRESPONDENCES_META_KEY];
                    var result = {};
                    // serializing TS model properties to their initial state
                    for (var _i = 0, correspondences_2 = correspondences; _i < correspondences_2.length; _i++) {
                        var correspondence = correspondences_2[_i];
                        var dataField = correspondence.jsonField || correspondence.modelField;
                        var serialized = this.serializeValue(this[correspondence.modelField]);
                        // result only contains defined fields
                        if (serialized !== undefined) {
                            result[dataField] = serialized;
                        }
                    }
                    return result;
                };
                return BaseModel;
            }());
            exports_5("BaseModel", BaseModel);
        }
    };
});
System.register("index", ["model-property", "base-model"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_6(exports);
    }
    return {
        setters: [
            function (model_property_1_1) {
                exportStar_1(model_property_1_1);
            },
            function (base_model_1_1) {
                exportStar_1(base_model_1_1);
            }
        ],
        execute: function () {
        }
    };
});
