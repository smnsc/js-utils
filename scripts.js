
/**
 * Fills a given HTML Select element and provides various options. The disabled state of the dropdown is cleared.
 * The data is retrieved using jQuery's getJSON method.
 * @@data {Object} Expects an object containing the following:
 *      id                  - Dropdown ID, without "#"
 *      url                 - JSON URL
 *      parameters          - (optional) An object to pass with the JSON
 *      textAttr            - (optional) The text attribute to use for the dropdown options. Default is "Text"
 *      valueAttr           - (optional) The value attribute to use for the dropdown options. Default is "Value"
 *      selectVal           - (optional) The value to pre-select. Reads from dropdown "data-value" HTML attr by default
 *      firstItemText       - (optional) The first item text, e.g. "Select..."
 *      loadingItemsText    - (optional) What to show when loading, e.g. "Loading..."
 *      emptyText           - (optional) What to show when there are no items, e.g. "No items."
 *      disableOnEmpty      - (optional) Whether or not to disable the dropdown if it is empty.
 *      errorText           - (optional) What to show when an error occurs, e.g. "Couldn't load items.". Default is "Error".
 *      onLoadFn            - (optional) Function to call after successful load. Specify string "onChangeFn" to use the same as onChangeFn
 *      onChangeFn          - (optional) Function to call on change of the dropdown. Specify string "onLoadFn" to use the same as onLoadFn
 *      refreshButtonId     - (optional) ID of any refresh button to auto-wire it.
 */
function fillDropdown(data) {
    var ddl = $('#' + data.id);
    data.disableOnEmpty = data.disableOnEmpty == undefined ? true : data.disableOnEmpty;
    // text to show when loading items (if parameter is supplied)

    function load() {
        if (data.loadingItemsText) {
            resetDropdownTo(data.id, data.loadingItemsText, true);
        }

        $.getJSON(data.url, data.parameters,
            function (result) {
                ddl.empty().prop("title", data.firstItemText || "");
                if (result.length === 0) {
                    // text to show when there are no results (if text is supplied)
                    if (data.emptyText) {
                        resetDropdownTo(data.id, data.emptyText, data.disableOnEmpty);
                    }

                    if (data.disableOnEmpty) {
                        ddl.addClass("disabled").prop("disabled", true);
                    }
                } else {
                    if (data.firstItemText) {
                        $(document.createElement('option'))
                            .prop('value', "")
                            .prop('disabled', 'disabled')
                            .prop('selected', 'selected')
                            .text(data.firstItemText)
                            .appendTo(ddl);
                    }
                    ddl.removeClass("disabled").prop("disabled", "");
                    // fill in the dropdown...
                    $(result).each(function () {
                        var opt = $(document.createElement('option'))
                            .attr('value', data.valueAttr ? this[data.valueAttr] : this.Value)
                            .text(data.textAttr ? this[data.textAttr] : this.Text)
                            .appendTo(ddl);

                        if ((data.selectVal || ddl.data("value")) == this.Value) {
                            opt.attr("selected", "selected");
                            ddl.trigger("change");
                        }
                    });
                }

                // calls the on-load function (if supplied as a parameter)
                if (data.onLoadFn) {
                    if (data.onLoadFn === "onChangeFn" && typeof data.onChangeFn === "function") {
                        data.onLoadFn = data.onChangeFn;
                    }

                    data.onLoadFn();
                }
            }).fail(function () {
                // in the event of a failure, set the error text (default is "Error")
                resetDropdownTo(data.id, data.errorText || "Error", data.disableOnEmpty);
                // the title is set (on mouse hover)
                ddl.prop("title", data.errorText);
            });

        // calls the on-change function (if supplied as a parameter)
        if (data.onChangeFn) {
            if (data.onChangeFn === "onLoadFn" && typeof data.onLoadFn === "function") {
                data.onChangeFn = data.onLoadFn;
            }

            ddl.unbind("change").on('change', function (e) {
                data.onChangeFn(e);
            });
        }
    }

    if (data.refreshButtonId) {
        $("#" + data.refreshButtonId).click(function () {
            load();
        });
    }

    load();
}

/**
 * Empties a dropdown, adds custom text, removes the title (hover-text), and optionally disables it.
 */
function resetDropdownTo(dropdownId, text, disable) {
    var ddl = $('#' + dropdownId).empty();
    if (disable) {
        ddl.addClass("disabled").prop("disabled", "disabled");
    }
    ddl.prop("title", '');
    $(document.createElement('option'))
        .prop('value', '')
        .prop('disabled', 'disabled')
        .prop('text', text)
        .appendTo(ddl);

}

/**
 * Fills a given element and provides various options. The disabled state of the dropdown is cleared.
 * The data is retrieved using jQuery's getJSON method.
 * @@data {Object} Expects an object containing the following:
 *      id                  - div container ID, without "#"
 *      name                - name of the radio button group
 *      url                 - JSON URL
 *      selectVal           - (optional) the value to pre-select. this triggers a change event. Reads from "data-value" by default
 *      parameters          - (optional) an object to pass with the JSON
 *      type                - (optional) The type of radio buttons e.g. "inline". Default = no type
 *      emptyText           - (optional) What to show when there are no items, e.g. "No items."
 *      errorText           - (optional) What to show when an error occurs, e.g. "Couldn't load items.". Default is "Error".
 *      onLoadFn            - (optional) Function to call after successful load. Specify string "onChangeFn" to use the same as onChangeFn
 *      onChangeFn          - (optional) Function to call on change of the radio button. Specify string "onLoadFn" to use the same as onLoadFn
 */
function fillRadioButtonGroup(data) {
    var container = $("#" + data.id);
    data.type = data.type || "normal";
    $.getJSON(data.url, data.parameters,
        function (result) {
            if (result.length === 0) {
                // text to show when there are no results (if text is supplied)
                container.append(data.emptyText || "");
            } else {
                // fill in the radio button group...
                var classText = "";
                if (data.type == "inline") {
                    classText = "radio-inline";
                }

                var selected = "";

                $(result).each(function () {
                    var radioContainer;
                    if (data.type == "normal") {
                        radioContainer = $("<div class='radio'></div>").appendTo(container);
                    } else if (data.type == "inline") {
                        radioContainer = container;
                    }
                    var label = $(document.createElement("label"))
                        .addClass(classText)
                        .text(this.Text)
                        .appendTo(radioContainer);

                    var radio = $("<input>").prop("type", "radio").prop("name", data.name).prop("value", this.Value);
                    label.prepend(radio);

                    // if an on-change function is supplied
                    if (data.onChangeFn) {
                        // check if "onchange" = "onload"
                        if (data.onChangeFn === "onLoadFn" && typeof data.onLoadFn === "function") {
                            data.onChangeFn = data.onLoadFn;
                        }

                        // bind on-change event
                        radio.unbind("change").on('change', function (e) {
                            data.onChangeFn(e);
                        });
                    }
                    // if select-value is available in container, or is supplied, then pre-select value, and trigger change event
                    if ((container.data("value") || data.selectVal) == this.Value) {
                        radio.prop("checked", true).trigger("change");
                    }
                });
            }

            // calls the on-load function (if supplied as a parameter)
            if (data.onLoadFn) {
                if (data.onLoadFn === "onChangeFn" && typeof data.onChangeFn === "function") {
                    data.onLoadFn = data.onChangeFn;
                }

                data.onLoadFn();
            }
        }).fail(function () {
            // the title is set (on mouse hover)
            container.prop("title", data.errorText);
        });
}

/**
 * Fills a given HTML Table element and provides various options. The table is cleared.
 * The data is retrieved using jQuery's getJSON method.
 * @@data {Object} Expects an object containing the following:
 *      id                  - table ID, without "#"
 *      url                 - JSON URL
 *      parameters          - (optional) an object to pass with the JSON
 *      columns             - an array of objects containing the following properties:
 *          > "name"        -   actual column name
 *          > "displayName" -   display name
 *      deleteColumn        - "on"
 */
function fillTable(data) {
    var tbl = $("#" + data.id);
    $.getJSON(data.url, data.parameters,
                function (result) {
                    tbl.empty();
                    var thead = $("<thead></thead>");
                    tbl.append(thead);
                    var headerRow = $("<tr></tr>");
                    tbl.append(headerRow);

                    for (col in data.columns) {
                        headerRow.append("<th>" + data.columns[col]["displayName"] + "</th>");
                    }

                    for (record in result) {
                        var row = $("<tr></tr>");
                        tbl.append(row);
                        for (col in data.columns) {
                            row.append("<td>" + result[record][data.columns[col]["name"]] + "</td>");

                            if (data.deleteColumn == "on") {
                                var deleteBtn = $("<button class='btn btn-xs btn-danger'><i class='fa fa-trash'></i> Delete</button>");
                                deleteBtn.click(function () {

                                });
                                row.append("<td><button class='btn btn-default'></button></td>");
                            }
                        }
                    }
                });
}

/**
 * Hides all elements with class containing ".prefix-", and shows classes that are ".prefix-value".
 * For example, "DataType" and "3" will hide elements with class "DataType-1", "DataType-2", "DataType-4", etc, and will only show "DataType-3"
 * @@prefix {String} class prefix, e.g. "DataTypeId" (do not include dash)
 * @@value {String} the value which to show, e.g. "true" or "3"
 * @@noAnimations {boolean} set to True to remove animations.
 */
function showHideOnClassPrefixValue(prefix, value, noAnimations) {
    var speed = 200;
    var delay = 300;
    if (noAnimations) {
        speed = 0;
        delay = 0;
    }
    $("*[class*='" + prefix + "-']").not("." + prefix + "-" + value).hide(speed);
    setTimeout(function () { $("." + prefix + "-" + value).show(speed); }, delay)
}

/**
 * Usage: getParameterByName("errorText"), etc...
 * From: http://stackoverflow.com/a/5158301/216104
 * @@ name  - Parameter name.
 */
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * Initializes bootstrap tooltips. Intended to be called on page load,
 * but should also be called if content is loaded asynchronously.
 */
function initializeBootstrapTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function buildToastrMessageQueryString(type, message, title) {
    return $.param({ toastrType: type, toastrMessage: message, toastrTitle: title });
}

function parseAndLoadToastrFromQueryString() {
    if (getParameterByName("toastrType")) {
        toastr[getParameterByName("toastrType")](getParameterByName("toastrMessage"), getParameterByName("toastrTitle"));

        if (window.history.pushState) {
            // cleans up the URL, removing any toastr parameters.
            var newurl = window.location.toString()
                                                .replace(/toastr[\w]+=([^&]+)/g, "") // replace any parameter starting with "toastr"
	                                            .replace(/[\&]+/g, "&") // converts any number of &'s into one &
	                                            .replace(/\b\?/, "/?") // if the query string doesn't begin with a /, then add it.
                                                .replace(/\/\?\&/, "/?") // converts /?& to /?
	                                            .replace(/\/\?$/g, "/") // if string ends with it, converts /? to /
	                                            .replace(/\&$/, "") // if string ends with &, remove it

            window.history.pushState({ path: newurl }, '', newurl);
        }
    }
}

function randomNegativeNumber() {
    var min = -1;
    var max = -2147483648;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isValidEmail(email) {
    var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

/**
 * Generates a GUID
 */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

/**
 * Returns a string of text with an ellipsis at the end if its width (in pixels) exceeds the width specified.
 * You can also supply an optional font size (default is 15px).
 */
function fitTextToWidth(text, widthLimit, fontSize) {
    var result;

    fontSize = parseInt(fontSize || "15").toString() + "px";
    var dummyElement = $("<div>").css({
        position: "absolute",
        visibility: "hidden",
        height: "auto",
        width: "auto",
        whiteSpace: "nowrap"
    }).text(text).appendTo("body");

    var width = parseInt(dummyElement.outerWidth());
    while (width >= widthLimit) {
        dummyElement.text(dummyElement.text().slice(0, -4) + "...");
        width = parseInt(dummyElement.outerWidth());
    }
    result = dummyElement.text();
    dummyElement.remove();

    return result;
}
