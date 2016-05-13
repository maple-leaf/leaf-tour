## A web tour implemented with angular directive

### screenshot
![alt screenshot](https://raw.githubusercontent.com/maple-leaf/leaf-tour/master/screenshot.jpg)

### example:

    <div leaf-tour leaf-tour-current="1" leaf-tour-btn-next='{"class": "ui-btn ui-btn-primary", "text": "下一步"}' leaf-tour-btn-done='{"class": "ui-btn ui-btn-primary", "text": "完成"}' class="tour-guide" ng-if="editor.firstVisit">
        <div leaf-tour-step="1" leaf-tour-element=".component-poster" leaf-tour-step-before="editor.tourBefore.first" class="step1">
            <div class="step-title">step1/3</div>
            <div class="step-desc">
                some description
            </div>
        </div>
        <div leaf-tour-step="2" leaf-tour-element="poster-editor" class="step2">
            <div class="step-title">step2/3</div>
            <div class="step-desc">
                some description
            </div>
        </div>
        <div leaf-tour-step="3" leaf-tour-element=".type-two-row" class="step3">
            <div class="step-title">step3/3</div>
            <div class="step-desc">
                some description
            </div>
        </div>
    </div>

### attribute:
- leaf-tour: root container of the web tour
    - leaf-tour-current: spcify which step is the first step, which is one value of `leaf-tour-step` it owns. [required]
    - leaf-tour-btn-next: a json has two attribute: `class` and `text`. [optional]
    - leaf-tour-btn-prev: a json has two attribute: `class` and `text`. [optional]
    - leaf-tour-btn-done: a json has two attribute: `class` and `text`. [optional]
- leaf-tour-step: each step of web tour, should be assign a value, can be any character
    - leaf-tour-element: which element will be hightlight, which value is a valid selector. [required]
    - leaf-tour-step-before: a function return a resolved promise will be called before this step being showed. [optional]
