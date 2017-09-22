// ==UserScript==
// @name           Memrise Learning Retries
// @namespace      https://github.com/cooljingle
// @description    Keep incorrectly answered words part of the learning session
// @match          https://www.memrise.com/course/*/garden/learn*
// @version        0.0.8
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
                            Math.max(1, _.findIndex(b._list, function(box, i){ return (i > b.num && box.learnable_id === wrongBox.learnable_id && box.learn_session_level) || i === b._list.length; }) - b.num) //next reoccurence cap
                        );
                        b._list.splice(Math.min(b.num + 1 + numPlacesAhead, b._list.length - 1), 0, currentBox); //add retest
                    }
                    s.addBoxesAfterMistake(wrongBox); //add word reminder
                    avoidRepeats();
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

                s.onWrong = s.onNearly = setBoxes;
            }

            return cached_function.apply(this, arguments);
        };
    }());

    function avoidRepeats() {
        var shouldSwap;
        for(let i = 1; i < b._list.length - 1; i++) {
            var x = b._list[i-1],
                y = b._list[i],
                z = b._list[i+1],
                yzSwap = x.learnable_id === y.learnable_id &&
                y.learnable_id !== z.learnable_id &&
                !_.some(["presentation", "copytyping"], t => t === y.template);
            if(yzSwap)
                [b._list[i], b._list[i+1]] = [b._list[i+1], b._list[i]];
        }
    }
});
