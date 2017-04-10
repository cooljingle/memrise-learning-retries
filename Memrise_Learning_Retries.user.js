// ==UserScript==
// @name           Memrise Learning Retries
// @namespace      https://github.com/cooljingle
// @description    Keep incorrectly answered words part of the planting session
// @match          https://www.memrise.com/course/*/garden/learn*
// @version        0.0.1
// @updateURL      https://github.com/cooljingle/memrise-learning-retries/raw/master/Memrise_Learning_Retries.user.js
// @downloadURL    https://github.com/cooljingle/memrise-learning-retries/raw/master/Memrise_Learning_Retries.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var b = MEMRISE.garden.boxes;
    b.load = (function() {
        var cached_function = b.load;
        return function() {
            if(MEMRISE.garden.session.slug === "learn") {
                var currentBox, boxesList;
                var setBoxes = function() {
                    b._list = boxesList; //overwrite new box arrangement
                    b._list.splice(b.num + 1, 0, currentBox); //add retest
                    b.add_next({ template: "copytyping", thing_id: currentBox.thing_id, column_a: currentBox.column_a, column_b: currentBox.column_b, wrote: b.current().given_answer }); //add word reminder
                };
                b.activate_box = (function() {
                    var cached_function = b.activate_box;
                    return function() {
                        currentBox = this.current();
                        var result = cached_function.apply(this, arguments);
                        boxesList = this._list.slice();
                        return result;
                    };
                }());

                _(MEMRISE.garden).on("wrong", setBoxes);
                _(MEMRISE.garden).on("nearly", setBoxes);
            }

            return cached_function.apply(this, arguments);
        };
    }());
});
