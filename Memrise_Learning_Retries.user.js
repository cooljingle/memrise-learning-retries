// ==UserScript==
// @name           Memrise Learning Retries
// @namespace      https://github.com/cooljingle
// @description    Keep incorrectly answered words part of the learning session
// @match          https://www.memrise.com/course/*/garden/learn*
// @version        0.0.6
// @updateURL      https://github.com/cooljingle/memrise-learning-retries/raw/master/Memrise_Learning_Retries.user.js
// @downloadURL    https://github.com/cooljingle/memrise-learning-retries/raw/master/Memrise_Learning_Retries.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var g = MEMRISE.garden,
        b = g.boxes;
    b.load = (function() {
        var cached_function = b.load;
        return function() {
            if(MEMRISE.garden.session.slug === "learn") {
                var currentBox, boxesList;
                var s = g.session;
                var setBoxes = function() {
                    b._list = boxesList; //overwrite new box arrangement
                    var wrongBox = b.current();
                    if(currentBox.learn_session_level){
                        var numPlacesAhead = Math.min(
                            3, //hard cap
                            Math.max(1, wrongBox.thinguser && wrongBox.thinguser.total_streak), //streak based cap
                            _.findIndex(b._list, function(box, i){ return (i > b.num && box.learnable_id === wrongBox.learnable_id && box.learn_session_level) || i === b._list.length; }) - b.num //next reoccurence cap
                        );
                        b._list.splice(Math.min(b.num + 1 + numPlacesAhead, b._list.length - 1), 0, currentBox); //add retest
                        b.reorder_future_to_avoid_repeats((x, y) => b.same_thinguser(x, y) && b.same_thinguser(currentBox, x));
                    }
                    b.add_next({ template: wrongBox.template, learnable_id: currentBox.learnable_id, isFakeInsert: true }); //add extra fake word test
                    s.addPresentationOnMistake(wrongBox); //add word reminder
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

                g.register = (function() {
                    var cached_function = g.register;
                    return function() {
                        if(arguments[1] === 1 && arguments[0].box_dict.isFakeInsert) //don't register fake inserts
                            return;
                        else
                            return cached_function.apply(this, arguments);
                    };
                }());

                s.onWrong = s.onNearly = setBoxes;
            }

            return cached_function.apply(this, arguments);
        };
    }());
});
