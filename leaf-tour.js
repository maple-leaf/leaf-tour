/*
 * leaf-tour.js
 * Copyright (C) 2016 fengye <fengye@fengyedeMacBook-Air.local>
 *
 * Distributed under terms of the MIT license.
 */
(function(window, angular){
    'use strict';

    (function() {
        // https://gist.github.com/hsablonniere/2581101

        if (!Element.prototype.scrollIntoViewIfNeeded) {
            Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
                centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

                var parent = this.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
                parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
                overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
                overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
                overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
                overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
                alignWithTop = overTop && !overBottom;

                if ((overTop || overBottom) && centerIfNeeded) {
                    parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
                }

                if ((overLeft || overRight) && centerIfNeeded) {
                    parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
                }

                if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
                    this.scrollIntoView(alignWithTop);
                }
            };
        }
    })();

    angular.module('leafui.tour', [])
    .directive('leafTour', function($compile) {
        return {
            controller: function() {
                var ctrl = this;
                ctrl.prevStep = function() {
                    if (ctrl.currentStepIndex > 0) {
                        ctrl.currentStepIndex--;
                    }
                };
                ctrl.nextStep = function() {
                    if (ctrl.currentStepIndex < ctrl.steps.length - 1) {
                        ctrl.currentStepIndex++;
                    }
                }
                ctrl.done = function() {
                    ctrl.leafTour.remove();
                }
            },
            controllerAs: 'leafTourCtrl',
            link: function(scope, ele, attrs) {
                var leafTourCtrl = scope.leafTourCtrl;

                leafTourCtrl.steps = [];
                angular.forEach(ele.children(), function(child) {
                    leafTourCtrl.steps.push(child.getAttribute('leaf-tour-step'));
                });
                if (attrs.leafTourCurrent) {
                    var currentStep = leafTourCtrl.steps.indexOf(attrs.leafTourCurrent);
                    if (currentStep === -1) {
                        throw("'leaf-tour-current' attribute must has a value corresponding to one of 'leaf-tour-step'");
                    } else {
                        leafTourCtrl.currentStepIndex = currentStep;
                    }
                }

                var maskHtml = [
                    '<div class="leaf-tour-mask-wrapper">',
                    '<div class="leaf-tour-mask leaf-tour-mask-top"></div>',
                    '<div class="leaf-tour-mask leaf-tour-mask-right"></div>',
                    '<div class="leaf-tour-mask leaf-tour-mask-bottom"></div>',
                    '<div class="leaf-tour-mask leaf-tour-mask-left"></div>',
                    '<div class="leaf-tour-mask leaf-tour-mask-target"></div>',
                    '</div>'
                ].join('');
                leafTourCtrl.mask = angular.element(maskHtml)
                leafTourCtrl.maskTop = leafTourCtrl.mask[0].querySelector('.leaf-tour-mask-top');
                leafTourCtrl.maskRight =  leafTourCtrl.mask[0].querySelector('.leaf-tour-mask-right');
                leafTourCtrl.maskBottom = leafTourCtrl.mask[0].querySelector('.leaf-tour-mask-bottom');
                leafTourCtrl.maskLeft = leafTourCtrl.mask[0].querySelector('.leaf-tour-mask-left');
                leafTourCtrl.maskTarget = leafTourCtrl.mask[0].querySelector('.leaf-tour-mask-target');
                ele.append(leafTourCtrl.mask);

                var btnConfig = {};
                if (attrs.leafTourBtnPrev && attrs.leafTourBtnPrev !== "") {
                    btnConfig.prev = JSON.parse(attrs.leafTourBtnPrev);
                }
                if (attrs.leafTourBtnNext && attrs.leafTourBtnNext !== "") {
                    btnConfig.next = JSON.parse(attrs.leafTourBtnNext);
                }
                if (attrs.leafTourBtnDone && attrs.leafTourBtnDone !== "") {
                    btnConfig.done = JSON.parse(attrs.leafTourBtnDone);
                }
                var tourNavigatorHtml = [
                    '<div class="leaf-tour-nav">',
                    '<div class="',
                    btnConfig.prev ? btnConfig.prev.class + " leaf-tour-nav-prev" : "leaf-tour-nav-prev",
                    '" ng-click="leafTourCtrl.prevStep()" ng-show="leafTourCtrl.currentStepIndex!==0">',
                    btnConfig.prev ? btnConfig.prev.text : "previous",
                    '</div>',
                    '<div class="',
                    btnConfig.next ? btnConfig.next.class + " leaf-tour-nav-next" : "leaf-tour-nav-next",
                    '" ng-click="leafTourCtrl.nextStep()" ng-show="leafTourCtrl.currentStepIndex!==leafTourCtrl.steps.length-1">',
                    btnConfig.next ? btnConfig.next.text : "next",
                    '</div>',
                    '<div class="',
                    btnConfig.done ? btnConfig.done.class + " leaf-tour-nav-done" : "leaf-tour-nav-done",
                    '" ng-click="leafTourCtrl.done()" ng-show="leafTourCtrl.currentStepIndex===leafTourCtrl.steps.length-1">',
                    btnConfig.done ? btnConfig.done.text : "next",
                    '</div>',
                    '</div>'
                ].join('');
                var tourNavigator = angular.element(tourNavigatorHtml);
                ele.append($compile(tourNavigator)(scope));

                ele.addClass('leaf-tour');
                leafTourCtrl.leafTour = ele;

                scope.$watch('leafTourCtrl.currentStepIndex', function(val) {
                    scope.$broadcast('leafTourStepChanged', val);
                });
            }
        };
    })
    .directive('leafTourStep', function($document, $timeout, $parse) {
        return {
            controller: function() {
                var ctrl = this;
            },
            controllerAs: 'leafTourStepCtrl',
            require: '^leafTour',
            link: function(scope, ele, attrs, leafTourCtrl) {
                if (attrs.leafTourStep === "") {
                    throw("'leaf-tour-step' must has a value to specify which step it belongs to");
                }
                if (!attrs.leafTourElement || attrs.leafTourElement === "") {
                    throw("'leaf-tour-step' must has a 'leaf-tour-element' attribute which value is the target element's css selector");
                }

                if (attrs.leafTourStepBefore && attrs.leafTourStepBefore !== "") {
                    // 使用 scope : { leafTourStepBefore: '@'} 来获取会导致所有的`leaf-tour-step`的`scope`都有对应的属性，无论是否声明了leafTourStepBefore, 有可能是angular的scope继承bug, 因此使用`$parse`来处理
                    var leafTourStepBeforeFn = $parse(attrs.leafTourStepBefore)(scope);
                    if (!angular.isFunction(leafTourStepBeforeFn)) {
                        throw("'leaf-tour-step-before' should be a function");
                    }
                }


                var document = $document[0];
                ele.addClass('leaf-tour-step-inner');

                function renderCurrentStep(currentStep) {
                    $timeout(function() {
                        var selectors = attrs.leafTourElement.split('|');
                        var target;
                        selectors.forEach(function(selector) {
                            if (!target) {
                                target = document.querySelector(selector);
                            }
                        });
                        if (!target) {
                            throw("can't find target element: " + selectors.join(' or '));
                        }
                        target.scrollIntoViewIfNeeded();

                        setTimeout(function() {
                            var targetRect = target.getBoundingClientRect();
                            var leafTourClass = leafTourCtrl.leafTour.attr('class');
                            var leafTourWidth = leafTourCtrl.leafTour[0].clientWidth;
                            leafTourCtrl.leafTour.attr('class', leafTourClass.replace(/leaf-tour-step-[^\s]*/, ""));
                            leafTourCtrl.leafTour.addClass('leaf-tour-step-' + leafTourCtrl.steps[currentStep]);
                            if (targetRect.right + leafTourWidth < window.innerWidth) {
                                leafTourCtrl.leafTour.css('left', targetRect.right + 'px');
                                leafTourCtrl.leafTour.removeClass('leaf-tour-position-left');
                            } else {
                                leafTourCtrl.leafTour.css('left', (targetRect.left - leafTourWidth) + 'px');
                                leafTourCtrl.leafTour.addClass('leaf-tour-position-left');
                            }
                            leafTourCtrl.leafTour.css('top', targetRect.top + 'px');

                            leafTourCtrl.maskTop.style.height = targetRect.top + 'px';
                            leafTourCtrl.maskRight.style.left = targetRect.right + 'px';
                            leafTourCtrl.maskRight.style.top = targetRect.top + 'px';
                            leafTourCtrl.maskRight.style.height = targetRect.height + 'px';
                            leafTourCtrl.maskRight.style.bottom = targetRect.bottom + 'px';
                            leafTourCtrl.maskBottom.style.top = targetRect.bottom + 'px';
                            leafTourCtrl.maskLeft.style.width = targetRect.left + 'px';
                            leafTourCtrl.maskLeft.style.height = targetRect.height + 'px';
                            leafTourCtrl.maskLeft.style.top = targetRect.top + 'px';
                            leafTourCtrl.maskTarget.style.width = targetRect.width + 'px';
                            leafTourCtrl.maskTarget.style.height = targetRect.height + 'px';
                            leafTourCtrl.maskTarget.style.top = targetRect.top + 'px';
                            leafTourCtrl.maskTarget.style.left = targetRect.left + 'px';
                        });
                    });
                }
                scope.$on('leafTourStepChanged', function(e, currentStep) {
                    if (leafTourCtrl.steps[currentStep] === attrs.leafTourStep) {
                        ele.removeClass('ng-hide');
                        if (angular.isFunction(leafTourStepBeforeFn)) {
                            leafTourStepBeforeFn().then(function() {
                                renderCurrentStep(currentStep);
                            });
                        } else {
                            renderCurrentStep(currentStep);
                        }
                    } else {
                        ele.addClass('ng-hide');
                    }
                });
            }
        };
    });

})(window, angular);
