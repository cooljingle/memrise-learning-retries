// ==UserScript==
// @name           Memrise Learning Retries
// @namespace      https://github.com/cooljingle
// @description    Keep incorrectly answered words part of the learning session
// @match          https://www.memrise.com/course/*/garden/learn*
// @version        0.0.4
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
                    var wrongBox = b.current();
                    if(currentBox.learn_session_level){
                        var numPlacesAhead = Math.min(3, Math.max(1, wrongBox.thinguser &&  wrongBox.thinguser.total_streak));
                        b._list.splice(Math.min(b.num + 1 + numPlacesAhead, b._list.length - 1), 0, currentBox); //add retest
                        b.reorder_future_to_avoid_repeats((x, y) => b.same_thinguser(x, y) && b.same_thinguser(currentBox, x));
                        MEMRISE.garden.boxes._list.sort(function(a, b){
                            return (a.thing_id === b.thing_id && a.learn_session_level && b.learn_session_level && a.learn_session_level > b.learn_session_level) ? 1: 0;
                        });
                    }
                    b.add_next({ template: wrongBox.template, thing_id: currentBox.thing_id, column_a: currentBox.column_a, column_b: currentBox.column_b, updates_scheduling: false, isFakeInsert: true }); //add word test
                    b.add_next({ template: "copytyping", thing_id: currentBox.thing_id, column_a: currentBox.column_a, column_b: currentBox.column_b, wrote: wrongBox.given_answer }); //add word reminder
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

                MEMRISE.garden.session.onWrong = MEMRISE.garden.session.onNearly = setBoxes;
            }

            return cached_function.apply(this, arguments);
        };
    }());
});
