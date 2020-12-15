/*
*************
*           * 
*   COLR    *
*           *
*************

Simple Code colorizer. 
Beta version.
*/

/* Themes are applied from top to bottom, they are not stackable.
So the order is important. */

const themes = [
    {
        regexp: /\/\/.+/,
        action: function (e) {
            return `<span class = "colr-ol-comment">${e}</span>`;
        },
    },
    {
        regexp: /\/\*.+\n?\*\//,
        action: function (e) {
            return `<span class = "colr-ml-comment">${e}</span>`;
        },
    },
    {
        regexp: /</,
        action: function (e) {
            return `<span class = "colr-html-arrow">&lt;</span>`;
        },
    },
    {
        regexp: />/,
        action: function (e) {
            return `<span class = "colr-html-arrow">&gt;</span>`;
        },
    },
    {
        regexp: /\b[+-]?(\.\d+|\d+\.|\d+|\d+\.?\d+|\d*\.?\d*[Ee][+-]?\d*)\b/,
        action: function (e) {
            return `<span class = "colr-number">${e}</span>`;
        },
    },
    {
        regexp: /\bawait\b|\bbreak\b|\bcase\b|\bcatch\b|\bclass\b|\bconst\b|\bcontinue\b|\bdebugger\b|\bdefault\b|\bdelete\b|\bdo\b|\belse\b|\benum\b|\bexport\b|\bextends\b|\bfalse\b|\bfinally\b|\bfor\b|\bfunction\b|\bif\b|\bimplements\b|\bimport\b|\bin\b|\binstanceof\b|\binterface\b|\blet\b|\bnew\b|\bnull\b|\bpackage\b|\bprivate\b|\bprotected\b|\bpublic\b|\breturn\b|\bsuper\b|\bswitch\b|\bstatic\b|\bthis\b|\bthrow\b|\btry\b|\bTrue\b|\btypeof\b|\bvar\b|\bvoid\b|\bwhile\b|\bwith\b|\byield\b/,
        action: function (e) {
            return `<span class = "colr-kw">${e}</span>`;
        },
    },
    {
        regexp: /".+"/,
        action: function (e) {
            return `<span class = "colr-string">${e}</span>`;
        },
    },
    {
        regexp: /[a-z,A-Z,1-9,_]+\s*?\([a-z,A-Z,1-9,\,\s]*\)/,
        action: function (e) {
            return `<span class = "colr-function">${e}</span>`;
        },
    },
];


let target = $("#colorize");
let content = target.html();

/* ********************* FUNCTIONS ******************** */

// defines intervall of content to scan
function setInterval(cursor) {
    // sorts array of exclusion indexes
    excludes.sort((a,b) => (a-b))
    let start = cursor;
    let end = content.length
    if(excludes.length) {
        // defines START
        while (excludes.includes(start)) {
            start++
        };
        // defines END
        end = start;
        if(end > Math.max.apply(null,excludes)) {
            end = content.length
        } else {
            let i = 0
            while(end > excludes[i]) {
                i++
            }
            end = excludes[i] - 1;
        }
    }
    return {start: start, end: end};
}

// scan content part for regexp
function checkRegexp(cursor, regexp) {
    // Calls interval
    let interval = setInterval(cursor);
    let start = interval.start;
    let end = interval.end;
    // avoid substring bug when start = end
    if(start === end) {
        end++
    }
    // defines content part
    let contentToCheck = content.substring(start, end);
    // checks regexp match
    let match = contentToCheck.match(regexp)
    let absoluteEnd = end
    if(match) {
        // pushes indexes to exclude array
        let absoluteStart = start + match.index;
        absoluteEnd = start + match.index + match[0].length
        for (i = absoluteStart; i < absoluteEnd; i++) {
            excludes.push(i)
        }
        // pushes match to regexpMatches
        regexpMatches.push({content: match[0], index: absoluteStart, end: absoluteStart + match[0].length, regexp: regexp});
    } 
    // checks if end of content is reached
    if(absoluteEnd < content.length) {
        checkRegexp(absoluteEnd, regexp)
    }
}

// Applies style to content
const addSpan = function(e) {
    themes.forEach((theme) => {
        if (e.regexp === theme.regexp) {
            e.content = theme.action(e.content)
        }
    })
    return e;
}

// Sorts index
function sort(array){
    let changed;
    do{
        changed = false;
        for(let i=0; i < array.length-1; i++) {
            if(array[i].index > array[i+1].index) {
                let tmp = array[i];
                array[i] = array[i+1];
                array[i+1] = tmp;
                changed = true;
            }
        }
    } while(changed);
    return array;
}

// inititiates
let excludes = []
let match = []
let regexpMatches = []
let finalArray = []

/* ********************* PROCESS ******************** */

// Checks content for match in each theme
themes.forEach((theme) => {
    checkRegexp(0,theme.regexp)
})

// sorts the matches array by start index
sort(regexpMatches)
console.log(regexpMatches)

// inserts spans
styledMatches = regexpMatches.map(addSpan);

// Pushes non styled content back to its right place
styledMatches.forEach((element, index) => {
    finalArray.push(element.content);
    if (index < styledMatches.length - 1) {
        if (styledMatches[index].end !== styledMatches[index + 1 ].index) {
            finalArray.push(
                content.substring(styledMatches[index].end, styledMatches[index + 1].index)
            )
        }
    } else {
        if (styledMatches[index].end !== content.length) {
            finalArray.push(
                content.substring(styledMatches[index].end, content.length)
            )
        }
    }
})

// Converts array to string
styledContent = finalArray.join('')

// injects string in content
target.html(styledContent)